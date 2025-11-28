const db = require('../config/db');

exports.getAll = () => {
  return db.query('SELECT * FROM KhuVuc ORDER BY KhuVucID');
};

exports.getChildren = (parentId) => {
  if (parentId === null) {
    return db.query('SELECT * FROM KhuVuc WHERE ParentKhuVucID IS NULL ORDER BY TenKhuVuc ASC');
  }

  return db.query(
    'SELECT * FROM KhuVuc WHERE ParentKhuVucID = ? ORDER BY TenKhuVuc ASC',
    [parentId]
  );
};

exports.getById = (id) => {
  return db.query('SELECT * FROM KhuVuc WHERE KhuVucID = ?', [id]);
};

exports.create = (TenKhuVuc, ParentKhuVucID, ViDo, KinhDo) => {
  return db.query(
    'INSERT INTO KhuVuc (TenKhuVuc, ParentKhuVucID, ViDo, KinhDo) VALUES (?, ?, ?, ?)',
    [TenKhuVuc, ParentKhuVucID || null, ViDo || null, KinhDo || null]
  );
};

exports.update = (id, updates) => {
  const keys = Object.keys(updates);
  if (keys.length === 0) return Promise.resolve();
  const set = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => updates[k]);
  const sql = `UPDATE KhuVuc SET ${set} WHERE KhuVucID = ?`;
  return db.query(sql, [...values, id]);
};

exports.delete = (id) => {
  return db.query('DELETE FROM KhuVuc WHERE KhuVucID = ?', [id]);
};