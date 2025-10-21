/**
 * Role middleware đơn giản cho development
 * CHỈ SỬ DỤNG TRONG DEVELOPMENT
 * 
 * Mục đích: Bỏ qua role checking để tăng tốc development
 * Production: Sử dụng role.js (database-based RBAC)
 */

const roleSimple = (allowedRoles = []) => {
  return (req, res, next) => {
    // Bypass role checking - cho phép tất cả requests
    if (req.user) {
      req.user.coQuyenTruyCap = true;
    }
    
    next();
  };
};

module.exports = { roleSimple };