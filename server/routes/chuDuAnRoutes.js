const express = require('express');
const router = express.Router();
const ChuDuAnController = require('../controllers/ChuDuAnController');

// === PRODUCTION AUTH: JWT-based authentication ===
const authMiddleware = require('../middleware/auth');
const { requireRole, requireRoles } = require('../middleware/role');

// Import thêm các routes con
const uploadRoutes = require('../api/ChuDuAn/uploadRoutes');
const phongRoutes = require('./phongRoutes');

// API routes chính
router.get('/dashboard', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layDashboard);
router.get('/tin-dang', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachTinDang);
router.get('/tin-nhap', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachTinNhap);
router.post('/tin-dang', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.taoTinDang);
router.post('/tin-dang/nhap', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.luuNhapTinDang);
router.get('/tin-dang/:id', ChuDuAnController.layChiTietTinDang); // 🧪 DEV: Temp public for testing
router.put('/tin-dang/:id', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.capNhatTinDang);
router.delete('/tin-dang/:id', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.xoaTinDang);
router.get('/tin-dang/:id/chinh-sua', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layTinDangDeChinhSua);
router.post('/tin-dang/:id/gui-duyet', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.guiTinDangDeDuyet);
router.get('/cuoc-hen', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachCuocHen);
router.put('/cuoc-hen/:id/xac-nhan', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.xacNhanCuocHen);

// === BÁO CÁO & ANALYTICS ===
router.get('/bao-cao-hieu-suat', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layBaoCaoHieuSuat); // Tổng quan (Dashboard)
router.get('/bao-cao-chi-tiet', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layBaoCaoHieuSuatChiTiet); // Chi tiết (Báo cáo page) 🆕
router.get('/bao-cao/doanh-thu-theo-thang', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layDoanhThuTheoThang); // 🆕
router.get('/bao-cao/top-tin-dang', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layTopTinDang); // 🆕
router.get('/bao-cao/conversion-rate', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layConversionRate); // 🆕

router.get('/du-an', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachDuAn);
router.get('/du-an/:id', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layChiTietDuAn);
router.post('/du-an', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.taoDuAn);
router.post('/du-an/tao-nhanh', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.taoNhanhDuAn);
router.put('/du-an/:id', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.capNhatDuAn);
router.delete('/du-an/:id', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.luuTruDuAn);
router.post('/du-an/:id/yeu-cau-mo-lai', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.guiYeuCauMoLaiDuAn); // 🆕 UC-PROJ-BANNED
router.get('/chinh-sach-coc/:id', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layChiTietChinhSachCoc);
router.put('/chinh-sach-coc/:id', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.capNhatChinhSachCoc);
router.post('/hop-dong/bao-cao', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.baoCaoHopDongChoThue);

// Khu vực: map trực tiếp
router.get('/khu-vuc', authMiddleware, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachKhuVuc);

// Mount sub-routes
router.use(uploadRoutes);
router.use(phongRoutes); // Routes quản lý phòng (Redesign 09/10/2025)

module.exports = router;
