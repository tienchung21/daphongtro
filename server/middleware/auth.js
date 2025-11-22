/**
 * Middleware xác thực người dùng
 * Kiểm tra JWT token và thông tin người dùng
 */

const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('[AUTH] Request path:', req.path, 'Method:', req.method);

    // Lấy token từ header Authorization
    const authHeader = req.header('Authorization');
    console.log('[AUTH] Authorization header:', authHeader ? '✅ Có token' : '❌ Không có token');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực'
      });
    }

    // Cho phép token mock cho môi trường development (được định nghĩa trong front-end)
    const mockToken = process.env.MOCK_DEV_TOKEN || 'mock-token-for-development';
    if (token === mockToken) {
      req.user = {
        id: parseInt(process.env.MOCK_USER_ID || '1', 10),
        tenDayDu: process.env.MOCK_USER_NAME || 'Chu Du An Dev',
        email: process.env.MOCK_USER_EMAIL || 'chu.du.an.dev@daphongtro.local',
        vaiTroId: parseInt(process.env.MOCK_ROLE_ID || '3', 10),
        vaiTro: process.env.MOCK_ROLE_NAME || 'ChuDuAn',
        isMockUser: true
      };

      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Kiểm tra người dùng có tồn tại trong database
    const [userRows] = await db.execute(
      'SELECT NguoiDungID, TenDayDu, Email, VaiTroHoatDongID FROM nguoidung WHERE NguoiDungID = ? AND TrangThai = "HoatDong"',
      [decoded.userId]
    );

    if (userRows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị khóa'
      });
    }

    // Lấy thông tin vai trò hiện tại
    const user = userRows[0];
    const [roleRows] = await db.execute(
      'SELECT vt.TenVaiTro FROM vaitro vt WHERE vt.VaiTroID = ?',
      [user.VaiTroHoatDongID]
    );

    // Chuẩn hóa tên vai trò (bỏ dấu cách và ký tự đặc biệt)
    const rawRoleName = roleRows[0]?.TenVaiTro || 'Unknown';
    const normalizedRoleName = rawRoleName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/\s+/g, '') // Bỏ khoảng trắng
      .replace(/[đĐ]/g, match => match === 'đ' ? 'd' : 'D'); // Đổi đ → d

    console.log('🔐 [AUTH] Raw role:', rawRoleName, '→ Normalized:', normalizedRoleName);

    // Gắn thông tin user vào request
    req.user = {
      id: user.NguoiDungID,
      tenDayDu: user.TenDayDu,
      email: user.Email,
      vaiTroId: user.VaiTroHoatDongID,
      vaiTro: normalizedRoleName, // "Chủ dự án" → "ChuDuAn"
      vaiTroGoc: rawRoleName // Giữ tên gốc để hiển thị
    };

    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực'
    });
  }
};

module.exports = authMiddleware;