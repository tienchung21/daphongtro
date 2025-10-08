const User = require('../models/userModel');
const crypto = require('crypto');

const mapUser = (row) => {
  if (!row) return null;
  return {
    NguoiDungID: row.NguoiDungID,
    TenDayDu: row.TenDayDu,
    Email: row.Email,
    SoDienThoai: row.SoDienThoai,
    TrangThai: row.TrangThai === undefined ? null : row.TrangThai,
    TaoLuc: row.TaoLuc,
    CapNhatLuc: row.CapNhatLuc,
    VaiTroID: row.VaiTroID
  };
};

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await User.getAll();
    res.json(rows.map(mapUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  // Accept Vietnamese fields (preferred) or English
  const {
    TenDayDu, name,
    Email, email,
    SoDienThoai, phone,
    MatKhauHash, password,
    VaiTroID, roleId
  } = req.body;

  const finalName = TenDayDu || name;
  const finalEmail = Email || email;
  const finalPhone = SoDienThoai || phone;
  const finalRole = (VaiTroID != null) ? VaiTroID : roleId;

  if (!finalName || !finalEmail || !finalPhone) {
    return res.status(400).json({ error: 'TenDayDu, Email, SoDienThoai là bắt buộc' });
  }

  const hash = MatKhauHash || (password ? crypto.createHash('md5').update(String(password)).digest('hex') : null);

  try {
    // expects models/userModel.js to expose createNguoiDung(tenDayDu, email, soDienThoai, matKhauHash, vaiTroID)
    const [result] = await User.createNguoiDung(finalName, finalEmail, finalPhone, hash, finalRole || null);
    const created = {
      NguoiDungID: result.insertId,
      TenDayDu: finalName,
      Email: finalEmail,
      SoDienThoai: finalPhone,
      TrangThai: null,
      TaoLuc: new Date().toISOString(),
      CapNhatLuc: new Date().toISOString(),
      VaiTroID: finalRole || null
    };
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await User.getById(id);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(mapUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const {
    // Vietnamese
    TenDayDu, Email, SoDienThoai, MatKhauHash, VaiTroID, TrangThai,
    // English
    name, email, phone, password, roleId, trangThai
  } = req.body;

  const updates = {};
  const finalName = TenDayDu || name;
  const finalEmail = Email || email;
  const finalPhone = SoDienThoai || phone;
  const finalRole = (VaiTroID != null) ? VaiTroID : (roleId != null ? roleId : undefined);
  const finalTrangThai = (TrangThai != null) ? TrangThai : (trangThai != null ? trangThai : undefined);

  if (finalName) updates.TenDayDu = finalName;
  if (finalEmail) updates.Email = finalEmail;
  if (finalPhone) updates.SoDienThoai = finalPhone;
  if (finalRole != null) updates.VaiTroID = finalRole;
  if (finalTrangThai != null) updates.TrangThai = finalTrangThai;

  if (MatKhauHash) {
    updates.MatKhauHash = MatKhauHash;
  } else if (password) {
    updates.MatKhauHash = crypto.createHash('md5').update(String(password)).digest('hex');
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
  }

  try {
    await User.updateNguoiDung(id, updates);
    const [rows] = await User.getById(id);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found after update' });
    res.json(mapUser(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    await User.deleteNguoiDung(id);
    res.status(204).send('thanhcong');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
