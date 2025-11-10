require('dotenv').config(); // Load .env file FIRST

const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Routes từ local (Module Chủ dự án)
const chuDuAnRoutes = require('./routes/chuDuAnRoutes'); // API chính cho Chủ dự án
const chinhSachCocRoutes = require('./routes/chinhSachCocRoutes'); // API Chính sách Cọc
const operatorRoutes = require('./routes/operatorRoutes'); // API Operator/Admin (Banned dự án)
const geocodingRoutes = require('./routes/geocodingRoutes'); // Geocoding API

// Routes từ upstream
const tinDangRoutes = require('./routes/tinDangRoutes');
const khuVucRoutes = require('./routes/khuVucRoutes');
const yeuThichRoutes = require('./routes/yeuThichRoutes');
const sepayRoutes = require('./routes/sepayRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const sepayCallbackRoutes = require('./routes/sepayCallbackRoutes');
const cuocHenRoutes = require('./routes/cuocHenRoutes');

const sepaySync = require('./services/sepaySyncService');
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
app.use('/api', authRoutes);

// API từ local (Module Chủ dự án)
app.use('/api/chu-du-an', chuDuAnRoutes); // API nghiệp vụ chủ dự án theo đặc tả
app.use('/api/chu-du-an/chinh-sach-coc', chinhSachCocRoutes); // API Chính sách Cọc
app.use('/api/operator', operatorRoutes); // API Operator/Admin (UC-OPR-01, UC-OPR-02)
app.use('/api/geocode', geocodingRoutes); // Geocoding API (Nominatim)

// API từ upstream
app.use('/api/tindangs', tinDangRoutes); 
app.use('/api/khuvucs', khuVucRoutes);
app.use('/api/yeuthich', yeuThichRoutes);
app.use('/api/sepay', sepayRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/sepay', sepayCallbackRoutes);
app.use('/api/cuoc-hen', cuocHenRoutes);
app.get('/', (req, res) => {
  res.send('API server đang chạy - Module Chủ dự án + Upstream APIs');
});













app.listen(5000, () => {
  console.log('✅ Server chạy tại http://localhost:5000');
  console.log('� JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded from .env' : '⚠️ Using fallback key');
  console.log('�📁 Static files: http://localhost:5000/uploads');
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
  console.log('🔗 API endpoints từ upstream:');
  console.log('   📝 /api/tindangs, /api/khuvucs, /api/yeuthich');
  console.log('   💰 /api/sepay, /api/transactions');
  
  // Khởi động job đồng bộ Sepay (sau 1 giây để server ổn định)
  setTimeout(() => {
    sepaySync.startPolling(60 * 1000); // Poll mỗi 60 giây
  }, 1000);
});
