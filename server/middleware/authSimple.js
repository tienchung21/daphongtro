/**
 * Middleware xác thực đơn giản cho development
 */

const authSimple = (req, res, next) => {
  // Bypass authentication cho development
  // Mock user data
  req.user = {
    NguoiDungID: parseInt(process.env.MOCK_USER_ID) || 1,  // Tương thích với controller
    id: parseInt(process.env.MOCK_USER_ID) || 1,           // Legacy support
    userId: parseInt(process.env.MOCK_USER_ID) || 1,
    username: 'test_user',
    vaiTro: process.env.MOCK_ROLE_NAME || 'ChuDuAn',       // Single role
    roles: [process.env.MOCK_ROLE_NAME || 'ChuDuAn'],      // Array of roles
    currentRole: process.env.MOCK_ROLE_NAME || 'ChuDuAn',
    isMockUser: true  // Flag để middleware khác biết đây là mock user
  };
  
  console.log('🔓 [authSimple] Mock user:', req.user.username, '| Role:', req.user.vaiTro);
  next();
};

module.exports = { authSimple };