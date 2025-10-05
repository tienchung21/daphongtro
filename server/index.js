const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const chuDuAnRoutes = require('./routes/chuDuAnRoutes'); // API chính cho Chủ dự án
const geocodingRoutes = require('./routes/geocodingRoutes'); // Geocoding API

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware để log tất cả requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Phục vụ file static cho uploads (để hiển thị ảnh)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Định nghĩa API
app.use('/api/users', userRoutes);
app.use('/api/chu-du-an', chuDuAnRoutes); // API nghiệp vụ chủ dự án theo đặc tả
app.use('/api/geocode', geocodingRoutes); // Geocoding API (Nominatim)

app.get('/', (req, res) => {
  res.send('API server đang chạy - Hỗ trợ UC-PROJ-01: Đăng tin Cho thuê');
});

app.listen(5000, () => {
  console.log('✅ Server chạy tại http://localhost:5000');
  console.log('📁 Static files: http://localhost:5000/uploads');
  console.log('🔗 API endpoints cho Chủ dự án (theo đặc tả use cases):');
  console.log('   📊 Dashboard: GET /api/chu-du-an/dashboard');
  console.log('   📝 Tin đăng:');
  console.log('       - GET  /api/chu-du-an/tin-dang (Danh sách)');
  console.log('       - POST /api/chu-du-an/tin-dang (Tạo mới)');
  console.log('       - GET  /api/chu-du-an/tin-dang/:id (Chi tiết)');
  console.log('       - PUT  /api/chu-du-an/tin-dang/:id (Cập nhật)');
  console.log('       - POST /api/chu-du-an/tin-dang/:id/gui-duyet (Gửi duyệt)');
  console.log('   📅 Cuộc hẹn:');
  console.log('       - GET  /api/chu-du-an/cuoc-hen (Danh sách)');
  console.log('       - POST /api/chu-du-an/cuoc-hen/:id/xac-nhan (Xác nhận)');
    console.log('   📈 Báo cáo: GET /api/chu-du-an/bao-cao-hieu-suat');
  console.log('   🏢 Dự án: GET /api/chu-du-an/du-an');
    console.log('   📋 Hợp đồng: POST /api/chu-du-an/hop-dong/bao-cao');
  console.log('   🗺️ Geocoding: POST /api/geocode (Địa chỉ → Tọa độ)');
});
