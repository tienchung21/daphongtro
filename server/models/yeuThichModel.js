const db = require('../config/db');

exports.addFavorite = (NguoiDungID, TinDangID) => {
  // nếu đã tồn tại sẽ bị IGNORE
  return db.query(
    'INSERT IGNORE INTO yeuthich (NguoiDungID, TinDangID) VALUES (?, ?)',
    [NguoiDungID, TinDangID]
  );
};

exports.removeFavorite = (NguoiDungID, TinDangID) => {
  return db.query('DELETE FROM yeuthich WHERE NguoiDungID = ? AND TinDangID = ?', [NguoiDungID, TinDangID]);
};

exports.getByUser = (NguoiDungID) => {
  return db.query(
    `SELECT y.NguoiDungID, y.TinDangID, t.TieuDe, t.Gia, t.diachi
     FROM yeuthich y
     LEFT JOIN tindang t ON t.TinDangID = y.TinDangID
     WHERE y.NguoiDungID = ?`,
    [NguoiDungID]
  );
};

// Thêm: trả thêm ảnh (sử dụng cột URL của tindang làm ảnh nếu có)
exports.getByUserWithTin = (NguoiDungID) => {
  return db.query(
    `SELECT y.NguoiDungID, y.TinDangID, t.TieuDe, t.URL AS Img, t.Gia, t.diachi
     FROM yeuthich y
     LEFT JOIN tindang t ON t.TinDangID = y.TinDangID
     WHERE y.NguoiDungID = ?`,
    [NguoiDungID]
  );
};

exports.existsFavorite = (NguoiDungID, TinDangID) => {
  return db.query('SELECT 1 AS exists_flag FROM yeuthich WHERE NguoiDungID = ? AND TinDangID = ? LIMIT 1', [NguoiDungID, TinDangID]);
};