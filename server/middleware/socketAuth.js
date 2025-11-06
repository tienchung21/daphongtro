/**
 * @fileoverview Socket.IO JWT Authentication Middleware
 * @module socketAuth
 */

const jwt = require('jsonwebtoken');

/**
 * Socket.IO middleware để xác thực JWT token
 * Token được truyền qua socket handshake: { auth: { token: 'xxx' } }
 * 
 * Hỗ trợ bypass authentication cho development mode (AUTH_DISABLED=true)
 */
const socketAuth = (socket, next) => {
  try {
    // Kiểm tra mode từ .env
    const isAuthDisabled = process.env.AUTH_DISABLED === 'true';
    
    if (isAuthDisabled) {
      // ✅ MODE DEV: Bypass authentication với mock user
      console.log('🔓 [Socket.IO AUTH DISABLED] Bypassing authentication for development');
      
      socket.user = {
        NguoiDungID: parseInt(process.env.MOCK_USER_ID) || 1,
        id: parseInt(process.env.MOCK_USER_ID) || 1,
        TenDayDu: process.env.MOCK_USER_NAME || 'Dev User',
        Email: process.env.MOCK_USER_EMAIL || 'dev@daphongtro.local',
        VaiTro: process.env.MOCK_ROLE_NAME || 'ChuDuAn',
        VaiTroID: parseInt(process.env.MOCK_ROLE_ID) || 3,
        isMockUser: true,
        isDevelopment: true
      };
      
      console.log(`[Socket.IO] Mock user connected: ${socket.user.NguoiDungID} (${socket.user.Email})`);
      return next();
    }
    
    // ✅ MODE PRODUCTION: Yêu cầu JWT authentication đầy đủ
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to socket
    socket.user = {
      NguoiDungID: decoded.id || decoded.NguoiDungID,
      id: decoded.id || decoded.NguoiDungID,
      Email: decoded.email,
      VaiTro: decoded.role || decoded.VaiTro,
      VaiTroID: decoded.VaiTroID,
      isMockUser: false,
      isDevelopment: false
    };

    console.log(`[Socket.IO] User authenticated: ${socket.user.NguoiDungID} (${socket.user.Email})`);
    next();

  } catch (error) {
    console.error('[Socket.IO] Authentication error:', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = socketAuth;

