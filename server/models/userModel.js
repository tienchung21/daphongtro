//  # thao tác DB (SQL query)
// models/userModel.js
const db = require('../config/db');

// Lấy tất cả users
exports.getAll = () => {
  return db.query('SELECT * FROM nguoidung');
};

// Thêm user
exports.create = (name, email) => {
  return db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
};
