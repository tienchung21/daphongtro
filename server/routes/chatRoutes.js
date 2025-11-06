/**
 * @fileoverview Routes quản lý Chat/Messaging
 * @module chatRoutes
 */

const express = require('express');
const router = express.Router();
const { authFlexible } = require('../middleware/authFlexible');
const ChatController = require('../controllers/ChatController');

// Base path: /api/chat

/**
 * POST /api/chat/conversations
 * Tạo hoặc lấy cuộc hội thoại
 */
router.post(
  '/conversations',
  authFlexible,
  ChatController.taoHoacLayCuocHoiThoai
);

/**
 * GET /api/chat/conversations
 * Lấy danh sách cuộc hội thoại (với unread count)
 */
router.get(
  '/conversations',
  authFlexible,
  ChatController.layDanhSachCuocHoiThoai
);

/**
 * GET /api/chat/conversations/:id
 * Lấy chi tiết cuộc hội thoại
 */
router.get(
  '/conversations/:id',
  authFlexible,
  ChatController.layChiTietCuocHoiThoai
);

/**
 * GET /api/chat/conversations/:id/messages
 * Lấy lịch sử tin nhắn
 */
router.get(
  '/conversations/:id/messages',
  authFlexible,
  ChatController.layTinNhan
);

/**
 * POST /api/chat/conversations/:id/messages
 * Gửi tin nhắn (REST fallback when Socket.IO offline)
 */
router.post(
  '/conversations/:id/messages',
  authFlexible,
  ChatController.guiTinNhan
);

/**
 * PUT /api/chat/conversations/:id/mark-read
 * Đánh dấu đã đọc
 */
router.put(
  '/conversations/:id/mark-read',
  authFlexible,
  ChatController.danhDauDaDoc
);

/**
 * DELETE /api/chat/messages/:id
 * Xóa tin nhắn (soft delete)
 */
router.delete(
  '/messages/:id',
  authFlexible,
  ChatController.xoaTinNhan
);

module.exports = router;


