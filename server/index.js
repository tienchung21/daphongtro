require('dotenv').config(); // Load .env file FIRST

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const socketAuth = require('./middleware/socketAuth');
const setupChatHandlers = require('./socket/chatHandlers');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Routes từ local (Module Chủ dự án)
const chuDuAnRoutes = require('./routes/chuDuAnRoutes'); // API chính cho Chủ dự án
const chinhSachCocRoutes = require('./routes/chinhSachCocRoutes'); // API Chính sách Cọc
const operatorRoutes = require('./routes/operatorRoutes'); // API Operator/Admin (Banned dự án)
const geocodingRoutes = require('./routes/geocodingRoutes'); // Geocoding API
const chatRoutes = require('./routes/chatRoutes'); // API Chat/Messaging (UC-PROJ-05)

// Routes cho Nhân viên Bán hàng (UC-SALE-01 đến UC-SALE-07)
const nhanVienBanHangRoutes = require('./routes/nhanVienBanHangRoutes');

// Routes cho Operator (UC-OPER-01 đến UC-OPER-06)
const tinDangOperatorRoutes = require('./routes/tinDangOperatorRoutes'); // UC-OPER-01: Duyệt tin đăng
const duAnOperatorRoutes = require('./routes/duAnOperatorRoutes'); // UC-OPER-02: Quản lý dự án
const lichLamViecOperatorRoutes = require('./routes/lichLamViecOperatorRoutes'); // UC-OPER-03: Lịch NVBH
const cuocHenOperatorRoutes = require('./routes/cuocHenOperatorRoutes'); // UC-OPER-03: Gán cuộc hẹn
const hoSoNhanVienRoutes = require('./routes/hoSoNhanVienRoutes'); // UC-OPER-04&05: Quản lý NVBH
const bienBanBanGiaoRoutes = require('./routes/bienBanBanGiaoRoutes'); // UC-OPER-06: Biên bản bàn giao
const dashboardOperatorRoutes = require('./routes/dashboardOperatorRoutes'); // Dashboard metrics

// Routes từ upstream
const tinDangRoutes = require('./routes/tinDangRoutes');
const khuVucRoutes = require('./routes/khuVucRoutes');
const yeuThichRoutes = require('./routes/yeuThichRoutes');
const sepayRoutes = require('./routes/sepayRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const sepayCallbackRoutes = require('./routes/sepayCallbackRoutes');
const cuocHenRoutes = require('./routes/cuocHenRoutes');
const publicDuAnRoutes = require('./routes/publicDuAnRoutes');
const publicTinDangRoutes = require('./routes/publicTinDangRoutes');
const sepaySync = require('./services/sepaySyncService');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.IO Authentication & Event Handlers
io.use(socketAuth);
io.on('connection', (socket) => {
  setupChatHandlers(socket, io);
});

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
app.use('/api/chat', chatRoutes); // API Chat/Messaging (UC-PROJ-05)

// API Operator (UC-OPER-01 đến UC-OPER-06)
app.use('/api/operator/tin-dang', tinDangOperatorRoutes); // UC-OPER-01: Duyệt tin đăng
app.use('/api/operator/du-an', duAnOperatorRoutes); // UC-OPER-02: Quản lý dự án
app.use('/api/operator/lich-lam-viec', lichLamViecOperatorRoutes); // UC-OPER-03: Lịch NVBH
app.use('/api/operator/cuoc-hen', cuocHenOperatorRoutes); // UC-OPER-03: Gán cuộc hẹn
app.use('/api/operator/nhan-vien', hoSoNhanVienRoutes); // UC-OPER-04&05: Quản lý NVBH
app.use('/api/operator/bien-ban', bienBanBanGiaoRoutes); // UC-OPER-06: Biên bản bàn giao
app.use('/api/operator/dashboard', dashboardOperatorRoutes); // Dashboard metrics

// API Nhân viên Bán hàng (UC-SALE-01 đến UC-SALE-07)
app.use('/api/nhan-vien-ban-hang', nhanVienBanHangRoutes);

// API từ upstream
app.use('/api/tindangs', tinDangRoutes); 
app.use('/api/khuvucs', khuVucRoutes);
app.use('/api/yeuthich', yeuThichRoutes);
app.use('/api/sepay', sepayRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/sepay', sepayCallbackRoutes);
app.use('/api/cuoc-hen', cuocHenRoutes);
app.use('/api/public/du-an', publicDuAnRoutes);
app.use('/api/public/tin-dang', publicTinDangRoutes);
app.get('/', (req, res) => {
  res.send('API server đang chạy - Module Chủ dự án + Upstream APIs');
});













const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('✅ Server chạy tại http://localhost:' + PORT);
  console.log('🔌 Socket.IO chạy tại ws://localhost:' + PORT);
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
  console.log('   💬 Chat: GET/POST /api/chat/conversations (Real-time với Socket.IO)');
  console.log('   🗺️ Geocoding: POST /api/geocode (Địa chỉ → Tọa độ)');
  console.log('🔗 API endpoints từ upstream:');
  console.log('   📝 /api/tindangs, /api/khuvucs, /api/yeuthich');
  console.log('   💰 /api/sepay, /api/transactions');
  console.log('');
  console.log('📡 Socket.IO Events:');
  console.log('   - join_conversation, leave_conversation');
  console.log('   - send_message, typing_start, typing_stop');
  console.log('   - mark_as_read');
  
  // Khởi động job đồng bộ Sepay (sau 1 giây để server ổn định)
  setTimeout(() => {
    sepaySync.startPolling(60 * 1000); // Poll mỗi 60 giây
  }, 1000);
});
