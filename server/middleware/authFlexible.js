/**
 * Middleware xác thực linh hoạt - Tự động chọn auth mode
 * Dựa vào biến môi trường AUTH_DISABLED
 * 
 * AUTH_DISABLED=true  → Bypass authentication (dùng mock user)
 * AUTH_DISABLED=false → Yêu cầu JWT authentication đầy đủ
 */

const jwt = require('jsonwebtoken');

/**
 * Authentication middleware linh hoạt
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const authFlexible = (req, res, next) => {
  // Kiểm tra mode từ .env
  const isAuthDisabled = process.env.AUTH_DISABLED === 'true';
  
  if (isAuthDisabled) {
    // ✅ MODE DEV: Bypass authentication với mock user
    console.log('🔓 [AUTH DISABLED] Bypassing authentication for development');
    
    req.user = {
      NguoiDungID: parseInt(process.env.MOCK_USER_ID) || 1,
      id: parseInt(process.env.MOCK_USER_ID) || 1,
      userId: parseInt(process.env.MOCK_USER_ID) || 1,
      TenDayDu: process.env.MOCK_USER_NAME || 'Dev User',
      Email: process.env.MOCK_USER_EMAIL || 'dev@daphongtro.local',
      username: 'dev_user',
      vaiTro: process.env.MOCK_ROLE_NAME || 'ChuDuAn',
      VaiTroID: parseInt(process.env.MOCK_ROLE_ID) || 3,
      roles: [process.env.MOCK_ROLE_NAME || 'ChuDuAn'],
      currentRole: process.env.MOCK_ROLE_NAME || 'ChuDuAn',
      isMockUser: true,
      isDevelopment: true
    };
    
    return next();
  }
  
  // ✅ MODE PRODUCTION: Yêu cầu JWT authentication đầy đủ
  console.log('🔒 [AUTH ENABLED] Requiring JWT authentication');
  
  // Lấy token từ header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Không có token xác thực'
    });
  }
  
  const token = authHeader.substring(7); // Bỏ "Bearer "
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Gán thông tin user vào req
    req.user = {
      NguoiDungID: decoded.NguoiDungID || decoded.id,
      id: decoded.NguoiDungID || decoded.id,
      userId: decoded.NguoiDungID || decoded.id,
      TenDayDu: decoded.TenDayDu,
      Email: decoded.Email,
      username: decoded.username || decoded.Email,
      vaiTro: decoded.vaiTro,
      VaiTroID: decoded.VaiTroID,
      roles: decoded.roles || [decoded.vaiTro],
      currentRole: decoded.currentRole || decoded.vaiTro,
      isMockUser: false,
      isDevelopment: false
    };
    
    next();
  } catch (error) {
    console.error('❌ [AUTH ERROR]', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Xác thực thất bại'
    });
  }
};

module.exports = { authFlexible };
