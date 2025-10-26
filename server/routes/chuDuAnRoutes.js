const express = require('express');
const router = express.Router();
const ChuDuAnController = require('../controllers/ChuDuAnController');

// === FLEXIBLE AUTH: Auto switch between dev/prod mode ===
// AUTH_DISABLED=true  → Bypass authentication (mock user)
// AUTH_DISABLED=false → Require JWT authentication
const { authFlexible } = require('../middleware/authFlexible');
const { requireRole, requireRoles } = require('../middleware/role');

// Import thêm các routes con
const uploadRoutes = require('../api/ChuDuAn/uploadRoutes');
const phongRoutes = require('./phongRoutes');

// API routes chính
router.get('/dashboard', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layDashboard);
router.get('/tin-dang', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachTinDang);
router.get('/tin-nhap', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachTinNhap);
router.post('/tin-dang', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.taoTinDang);
router.post('/tin-dang/nhap', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.luuNhapTinDang);
router.get('/tin-dang/:id', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layChiTietTinDang);
router.put('/tin-dang/:id', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.capNhatTinDang);
router.delete('/tin-dang/:id', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.xoaTinDang);
router.get('/tin-dang/:id/chinh-sua', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layTinDangDeChinhSua);
router.post('/tin-dang/:id/gui-duyet', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.guiTinDangDeDuyet);
router.get('/cuoc-hen', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachCuocHen);
router.get('/cuoc-hen/metrics', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layMetricsCuocHen);
router.put('/cuoc-hen/:id/xac-nhan', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.xacNhanCuocHen);
router.post('/cuoc-hen/:id/phe-duyet', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.pheDuyetCuocHen);
router.post('/cuoc-hen/:id/tu-choi', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.tuChoiCuocHen);

// === BÁO CÁO & ANALYTICS ===
router.get('/bao-cao-hieu-suat', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layBaoCaoHieuSuat);
router.get('/bao-cao-chi-tiet', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layBaoCaoHieuSuatChiTiet);
router.get('/bao-cao/doanh-thu-theo-thang', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layDoanhThuTheoThang);
router.get('/bao-cao/top-tin-dang', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layTopTinDang);
router.get('/bao-cao/conversion-rate', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layConversionRate);

router.get('/du-an', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachDuAn);
router.get('/du-an/:id', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layChiTietDuAn);
router.post('/du-an', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.taoDuAn);
router.post('/du-an/tao-nhanh', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.taoNhanhDuAn);
router.put('/du-an/:id', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.capNhatDuAn);
router.delete('/du-an/:id', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.luuTruDuAn);
router.post('/du-an/:id/yeu-cau-mo-lai', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.guiYeuCauMoLaiDuAn);
router.get('/chinh-sach-coc/:id', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layChiTietChinhSachCoc);
router.put('/chinh-sach-coc/:id', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.capNhatChinhSachCoc);
router.post('/hop-dong/bao-cao', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.baoCaoHopDongChoThue);

// Khu vực: map trực tiếp
router.get('/khu-vuc', authFlexible, requireRole('ChuDuAn'), ChuDuAnController.layDanhSachKhuVuc);

// Mount sub-routes
router.use(uploadRoutes);
router.use(phongRoutes); // Routes quản lý phòng (Redesign 09/10/2025)

module.exports = router;
