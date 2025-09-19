const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'thue_tro'
});

// Dùng .promise() để query bằng async/await
module.exports = pool.promise();
