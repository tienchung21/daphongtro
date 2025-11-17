/**
 * @fileoverview Socket.IO JWT Authentication Middleware
 * @module socketAuth
 */

const jwt = require('jsonwebtoken');

/**
 * Socket.IO middleware để xác thực JWT token
 * Token được truyền qua socket handshake: { auth: { token: 'xxx' } }
 * 
 * Hỗ trợ mock token cho development: process.env.MOCK_DEV_TOKEN
 */
const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Cho phép token mock cho môi trường development (giống auth.js)
    const mockToken = process.env.MOCK_DEV_TOKEN || 'mock-token-for-development';
    if (token === mockToken) {
      socket.user = {
        NguoiDungID: parseInt(process.env.MOCK_USER_ID || '1', 10),
        id: parseInt(process.env.MOCK_USER_ID || '1', 10),
        TenDayDu: process.env.MOCK_USER_NAME || 'Chu Du An Dev',
        Email: process.env.MOCK_USER_EMAIL || 'chu.du.an.dev@daphongtro.local',
        vaiTroId: parseInt(process.env.MOCK_ROLE_ID || '3', 10),
        vaiTro: process.env.MOCK_ROLE_NAME || 'ChuDuAn',
        isMockUser: true
      };
      
      console.log(`[Socket.IO] Mock user connected: ${socket.user.NguoiDungID} (${socket.user.Email})`);
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Attach user info to socket (chuẩn hóa từ decoded JWT)
    socket.user = {
      NguoiDungID: decoded.userId || decoded.id || decoded.NguoiDungID,
      id: decoded.userId || decoded.id || decoded.NguoiDungID,
      TenDayDu: decoded.tenDayDu || decoded.TenDayDu,
      Email: decoded.email || decoded.Email,
      vaiTroId: decoded.vaiTroId || decoded.VaiTroHoatDongID,
      vaiTro: decoded.vaiTro,
      vaiTroGoc: decoded.vaiTroGoc,
      isMockUser: false
    };

    console.log(`🔐 [Socket.IO] User authenticated: ${socket.user.NguoiDungID} (${socket.user.Email})`);
    next();

  } catch (error) {
    console.error('❌ [Socket.IO] Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    
    next(new Error('Authentication error: ' + error.message));
  }
};

module.exports = socketAuth;

