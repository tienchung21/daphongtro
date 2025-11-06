/**
 * @fileoverview Socket.IO Chat Event Handlers
 * @module chatHandlers
 */

const ChatModel = require('../models/ChatModel');
const NhatKyService = require('../services/NhatKyHeThongService');

// Rate limiting: Map để lưu số lượng tin nhắn của mỗi user
const userMessageCount = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 phút
const MAX_MESSAGES_PER_MINUTE = 10;

/**
 * Reset message count sau mỗi phút
 */
setInterval(() => {
  userMessageCount.clear();
}, RATE_LIMIT_WINDOW);

/**
 * Kiểm tra rate limit
 */
function checkRateLimit(userId) {
  const count = userMessageCount.get(userId) || 0;
  if (count >= MAX_MESSAGES_PER_MINUTE) {
    return false;
  }
  userMessageCount.set(userId, count + 1);
  return true;
}

/**
 * XSS Sanitization helper
 */
function sanitizeMessage(content) {
  try {
    const DOMPurify = require('isomorphic-dompurify');
    return DOMPurify.sanitize(content.trim());
  } catch (error) {
    // Fallback: basic sanitization if DOMPurify not available
    return content.trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

/**
 * Setup Chat Socket Handlers
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Server} io - Socket.IO server instance
 */
function setupChatHandlers(socket, io) {
  const userId = socket.user.NguoiDungID;

  console.log(`[Socket.IO] User ${userId} connected (socket ID: ${socket.id})`);

  /**
   * JOIN_CONVERSATION: Tham gia vào một cuộc hội thoại
   */
  socket.on('join_conversation', async ({ cuocHoiThoaiID }) => {
    try {
      // Kiểm tra quyền truy cập
      const hasAccess = await ChatModel.kiemTraQuyenTruyCap(cuocHoiThoaiID, userId);
      
      if (!hasAccess) {
        return socket.emit('error', {
          event: 'join_conversation',
          message: 'Bạn không có quyền truy cập cuộc hội thoại này'
        });
      }

      // Join socket room
      socket.join(`conversation_${cuocHoiThoaiID}`);
      
      console.log(`[Socket.IO] User ${userId} joined conversation ${cuocHoiThoaiID}`);
      
      socket.emit('joined_conversation', { cuocHoiThoaiID });

      // Thông báo cho các thành viên khác
      socket.to(`conversation_${cuocHoiThoaiID}`).emit('user_online', {
        nguoiDungID: userId,
        cuocHoiThoaiID
      });

    } catch (error) {
      console.error('[Socket.IO] join_conversation error:', error);
      socket.emit('error', {
        event: 'join_conversation',
        message: error.message
      });
    }
  });

  /**
   * LEAVE_CONVERSATION: Rời khỏi cuộc hội thoại
   */
  socket.on('leave_conversation', ({ cuocHoiThoaiID }) => {
    socket.leave(`conversation_${cuocHoiThoaiID}`);
    
    console.log(`[Socket.IO] User ${userId} left conversation ${cuocHoiThoaiID}`);
    
    // Thông báo cho các thành viên khác
    socket.to(`conversation_${cuocHoiThoaiID}`).emit('user_offline', {
      nguoiDungID: userId,
      cuocHoiThoaiID
    });
  });

  /**
   * SEND_MESSAGE: Gửi tin nhắn
   */
  socket.on('send_message', async ({ cuocHoiThoaiID, noiDung }) => {
    try {
      // Rate limiting
      if (!checkRateLimit(userId)) {
        return socket.emit('error', {
          event: 'send_message',
          message: 'Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ một chút.'
        });
      }

      // Validation
      if (!noiDung || noiDung.trim().length === 0) {
        return socket.emit('error', {
          event: 'send_message',
          message: 'Nội dung tin nhắn không được để trống'
        });
      }

      if (noiDung.length > 5000) {
        return socket.emit('error', {
          event: 'send_message',
          message: 'Tin nhắn quá dài (tối đa 5000 ký tự)'
        });
      }

      // XSS Prevention
      const sanitizedNoiDung = sanitizeMessage(noiDung);

      // Lưu tin nhắn vào database
      const tinNhan = await ChatModel.guiTinNhan({
        CuocHoiThoaiID: cuocHoiThoaiID,
        NguoiGuiID: userId,
        NoiDung: sanitizedNoiDung
      });

      // Broadcast tin nhắn đến tất cả thành viên trong room
      io.to(`conversation_${cuocHoiThoaiID}`).emit('new_message', tinNhan);

      console.log(`[Socket.IO] Message sent: ${tinNhan.TinNhanID} in conversation ${cuocHoiThoaiID}`);

      // Audit log (async, không chờ)
      NhatKyService.ghiNhan({
        NguoiDungID: userId,
        HanhDong: 'gui_tin_nhan_socket',
        DoiTuong: 'tinnhan',
        DoiTuongID: tinNhan.TinNhanID,
        ChiTiet: JSON.stringify({ CuocHoiThoaiID: cuocHoiThoaiID })
      }).catch(err => console.error('[Socket.IO] Audit log error:', err));

    } catch (error) {
      console.error('[Socket.IO] send_message error:', error);
      socket.emit('error', {
        event: 'send_message',
        message: error.message || 'Lỗi khi gửi tin nhắn'
      });
    }
  });

  /**
   * TYPING_START: Bắt đầu gõ tin nhắn
   */
  socket.on('typing_start', ({ cuocHoiThoaiID }) => {
    socket.to(`conversation_${cuocHoiThoaiID}`).emit('user_typing', {
      nguoiDungID: userId,
      cuocHoiThoaiID,
      typing: true
    });
  });

  /**
   * TYPING_STOP: Dừng gõ tin nhắn
   */
  socket.on('typing_stop', ({ cuocHoiThoaiID }) => {
    socket.to(`conversation_${cuocHoiThoaiID}`).emit('user_typing', {
      nguoiDungID: userId,
      cuocHoiThoaiID,
      typing: false
    });
  });

  /**
   * MARK_AS_READ: Đánh dấu đã đọc
   */
  socket.on('mark_as_read', async ({ cuocHoiThoaiID }) => {
    try {
      await ChatModel.danhDauDaDoc(cuocHoiThoaiID, userId);
      
      // Thông báo cho các thành viên khác
      socket.to(`conversation_${cuocHoiThoaiID}`).emit('message_read', {
        nguoiDungID: userId,
        cuocHoiThoaiID,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('[Socket.IO] mark_as_read error:', error);
    }
  });

  /**
   * DISCONNECT: User ngắt kết nối
   */
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User ${userId} disconnected (socket ID: ${socket.id})`);
    
    // Thông báo offline cho tất cả conversations mà user đang tham gia
    // (Socket.IO tự động leave all rooms khi disconnect)
  });
}

module.exports = setupChatHandlers;


