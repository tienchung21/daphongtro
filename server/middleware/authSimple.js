/**
 * Middleware xác thực đơn giản cho development
 */

const authMiddleware = (req, res, next) => {
  // Bypass authentication cho development
  // Mock user data
  req.user = {
    id: 1,              // Thêm field id để tương thích với roleMiddleware
    userId: 1,
    username: 'test_user',
    roles: ['chu_du_an'],
    currentRole: 'chu_du_an'
  };
  
  next();
};

module.exports = authMiddleware;