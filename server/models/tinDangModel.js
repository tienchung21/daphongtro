const db = require('../config/db');

exports.getAll = () => {
  return db.query('SELECT * FROM tindang');
};

exports.getById = (id) => {
  return db.query('SELECT * FROM tindang WHERE TinDangID = ?', [id]);
};

exports.createTinDang = (data) => {
  const sql = `
    INSERT INTO tindang
      (KhuVucID, TieuDe, URL, MoTa, Gia, DienTich, TrangThai, LyDoTuChoi, DuyetBoiNhanVienID, TaoLuc, CapNhatLuc, DuyetLuc, diachi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)
  `;
  return db.query(sql, [
    data.KhuVucID, data.TieuDe, data.URL, data.MoTa, data.Gia, data.DienTich,
    data.TrangThai || 'pending', data.LyDoTuChoi || null, data.DuyetBoiNhanVienID || null,
    data.DuyetLuc || null, data.diachi || null
  ]);
};

exports.updateTinDang = (id, updates) => {
  const keys = Object.keys(updates);
  if (keys.length === 0) return Promise.resolve();
  const sets = keys.map(() => '?? = ?').join(', ').replace(/\?\?/g, () => '?'); // we will build manually
  // safer manual builder:
  const setClauses = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE tindang SET ${setClauses}, CapNhatLuc = NOW() WHERE TinDangID = ?`;
  return db.query(sql, [...values, id]);
};

exports.deleteTinDang = (id) => {
  return db.query('DELETE FROM tindang WHERE TinDangID = ?', [id]);
};
exports.approveTinDang = (id, staffId, accept = true, reason = null) => {
  const status = accept ? 'approved' : 'rejected';
  const sql = `
    UPDATE tindang
    SET TrangThai = ?, DuyetBoiNhanVienID = ?, LyDoTuChoi = ?, DuyetLuc = NOW(), CapNhatLuc = NOW()
    WHERE TinDangID = ?
  `;
  return db.query(sql, [status, staffId || null, reason, id]);
};
