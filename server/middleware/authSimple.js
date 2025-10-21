/**
 * Middleware xác thực đơn giản cho development
 * CHỈ SỬ DỤNG TRONG DEVELOPMENT
 * 
 * Mục đích: Bỏ qua JWT authentication để tăng tốc development
 * Production: Sử dụng auth.js (JWT-based authentication)
 */

const authSimple = (req, res, next) => {
  // Bypass authentication - tạo mock user
  req.user = {
    NguoiDungID: parseInt(process.env.MOCK_USER_ID) || 1,
    id: parseInt(process.env.MOCK_USER_ID) || 1,
    userId: parseInt(process.env.MOCK_USER_ID) || 1,
    username: 'test_user',
    vaiTro: process.env.MOCK_ROLE_NAME || 'ChuDuAn',
    roles: [process.env.MOCK_ROLE_NAME || 'ChuDuAn'],
    currentRole: process.env.MOCK_ROLE_NAME || 'ChuDuAn',
    isMockUser: true
  };
  
  next();
};

module.exports = { authSimple };