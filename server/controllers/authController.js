const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db'); // nếu cần dùng trực tiếp

// Helper: Tạo JWT token
const generateToken = (userId, vaiTroId) => {
  return jwt.sign(
    { userId, vaiTroId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' } // Token hết hạn sau 7 ngày
  );
};

// POST /api/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });

  try {
    // Query user với thông tin vai trò (JOIN với bảng vaitro)
    const sql = `
      SELECT n.*, v.TenVaiTro, v.VaiTroID
      FROM nguoidung n
      LEFT JOIN vaitro v ON n.VaiTroHoatDongID = v.VaiTroID
      WHERE n.Email = ?
    `;
    const [rows] = await db.query(sql, [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });

    const user = rows[0];

    // NOTE: hiện project chưa có hashing (bcrypt). Đây là so sánh đơn giản — đổi sang bcrypt trong production.
    if (user.MatKhauHash !== password) return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });

    // Tạo JWT token
    const token = generateToken(user.NguoiDungID, user.VaiTroHoatDongID);

    // loại bỏ trường mật khẩu khi trả về
    const { MatKhauHash, ...safeUser } = user;
    
    res.json({ 
      success: true,
      token,
      user: safeUser 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/register
exports.register = async (req, res) => {
  const { name, email, phone, password, roleId } = req.body;
  if (!name || !email || !phone || !password || roleId == null) {
    return res.status(400).json({ error: 'name, email, phone, password và roleId là bắt buộc' });
  }

  try {
    const matKhauHash = crypto.createHash('md5').update(String(password)).digest('hex');
    const [result] = await User.createNguoiDung(name, email, phone, matKhauHash, roleId);

    // Tạo JWT token cho user mới
    const token = generateToken(result.insertId, roleId);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertId,
        TenDayDu: name,
        Email: email,
        SoDienThoai: phone,
        VaiTroHoatDongID: roleId,
        TenVaiTro: roleId === 3 ? 'Chủ dự án' : 'Khách hàng'
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};