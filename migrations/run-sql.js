/**
 * Chạy một file SQL bất kỳ: node migrations/run-sql.js <relative_or_absolute_sql_path>
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let config;
try {
	// Ưu tiên dùng config từ server
	const dbConfig = require('../server/config/db.js');
	const pool = dbConfig.pool || dbConfig;
	config = {
		host: pool.config?.host || 'localhost',
		user: pool.config?.user || 'root',
		password: pool.config?.password || '',
		database: pool.config?.database || 'thue_tro',
		multipleStatements: true
	};
} catch (e) {
	config = {
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'thue_tro',
		multipleStatements: true
	};
}

async function run() {
	const argPath = process.argv[2];
	if (!argPath) {
		console.error('Usage: node migrations/run-sql.js <sql-file>');
		process.exit(1);
	}
	const sqlFile = path.isAbsolute(argPath) ? argPath : path.join(process.cwd(), argPath);

	let connection;
	try {
		console.log('🔌 Kết nối database...');
		connection = await mysql.createConnection(config);
		console.log('✅ Đã kết nối!\n');

		console.log(`📖 Đang đọc file: ${sqlFile}`);
		const sql = fs.readFileSync(sqlFile, 'utf8');
		console.log('✅ Đọc file thành công!\n');

		console.log('🚀 Đang thực thi SQL...');
		console.log('─────────────────────────────────────────');
		await connection.query(sql);
		console.log('─────────────────────────────────────────');
		console.log('✅ Thực thi thành công!');
	} catch (error) {
		console.error('\n❌ LỖI khi thực thi SQL:');
		console.error('─────────────────────────────────────────');
		console.error(`Message: ${error.message}`);
		if (error.sql) {
			console.error(`SQL: ${error.sql.substring(0, 200)}...`);
		}
		console.error('─────────────────────────────────────────');
		process.exit(1);
	} finally {
		if (connection) {
			await connection.end();
			console.log('\n🔌 Đã đóng kết nối database');
		}
	}
}

run();


