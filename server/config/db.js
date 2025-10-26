const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'thue_tro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection khi khởi động
async function testConnection() {
  try {
    const connection = await pool.promise().getConnection();
    console.log('✅ Kết nối database thành công - thue_tro');
    
    // Test query đơn giản
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM khuvuc WHERE ParentKhuVucID IS NULL');
    console.log('📊 Database có', rows[0].total, 'tỉnh/thành phố');
    
    connection.release();
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    console.error('🔧 Kiểm tra XAMPP MySQL đã khởi động chưa');
  }
}

// Test ngay khi load module
testConnection();

// Dùng .promise() để query bằng async/await
module.exports = pool.promise();
