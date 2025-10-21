/**
 * Role middleware đơn giản cho development
 */

const roleSimple = (allowedRoles = []) => {
  return (req, res, next) => {
    // Bypass role checking cho development
    // Log để debug
    console.log(`🔓 [roleSimple] Allowing access for roles: ${allowedRoles.join(', ')}`);
    
    // Assume user có tất cả quyền trong dev mode
    if (req.user) {
      req.user.coQuyenTruyCap = true;
    }
    
    next();
  };
};

module.exports = { roleSimple };