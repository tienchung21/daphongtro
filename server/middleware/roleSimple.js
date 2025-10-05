/**
 * Role middleware đơn giản cho development
 */

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    // Bypass role checking cho development
    // Assume user có tất cả quyền
    next();
  };
};

module.exports = { roleMiddleware };