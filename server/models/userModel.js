//  # thao tác DB (SQL query)
// models/userModel.js
const db = require('../config/db');

// Lấy tất cả users
exports.getAll = () => {
  return db.query('SELECT * FROM nguoidung');
};

// Thêm user

exports.createNguoiDung = (tenDayDu, email, soDienThoai, matKhauHash, vaiTroID) => {
  const sql = `
    INSERT INTO nguoidung
      (TenDayDu, Email, SoDienThoai, MatKhauHash, VaiTroID, TaoLuc, CapNhatLuc, TrangThai)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL)
  `;
  return db.query(sql, [tenDayDu, email, soDienThoai, matKhauHash, vaiTroID]);
};