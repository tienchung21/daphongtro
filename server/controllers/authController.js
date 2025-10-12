const crypto = require('crypto');
const User = require('../models/userModel');
const db = require('../config/db'); // nếu cần dùng trực tiếp

// POST /api/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });

  try {
    const [rows] = await db.query('SELECT * FROM nguoidung WHERE Email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });

    const user = rows[0];

    // NOTE: hiện project chưa có hashing (bcrypt). Đây là so sánh đơn giản — đổi sang bcrypt trong production.
    if (user.MatKhauHash !== password) return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });

    // loại bỏ trường mật khẩu khi trả về
    const { MatKhauHash, ...safeUser } = user;
    res.json({ user: safeUser });
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

    res.status(201).json({
      id: result.insertId,
      TenDayDu: name,
      Email: email,
      SoDienThoai: phone,
      VaiTroID: roleId
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};