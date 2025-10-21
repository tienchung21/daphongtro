const express = require('express');
const router = express.Router();
const ChuDuAnController = require('../controllers/ChuDuAnController');
// const authMiddleware = require('../middleware/auth');
// const { roleMiddleware } = require('../middleware/role');

// === DEV MODE: Sử dụng authSimple và roleSimple cho mock user ===
const { authSimple: authMiddleware } = require('../middleware/authSimple');
const { roleSimple: roleMiddleware } = require('../middleware/roleSimple');

// Import thêm các routes con
const uploadRoutes = require('../api/ChuDuAn/uploadRoutes');
const phongRoutes = require('./phongRoutes');

// API routes chính
router.get('/dashboard', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDashboard);
router.get('/tin-dang', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachTinDang);
router.get('/tin-nhap', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachTinNhap);
router.post('/tin-dang', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.taoTinDang);
router.post('/tin-dang/nhap', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.luuNhapTinDang);
router.get('/tin-dang/:id', ChuDuAnController.layChiTietTinDang); // 🧪 DEV: Temp public for testing
router.put('/tin-dang/:id', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.capNhatTinDang);
router.delete('/tin-dang/:id', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.xoaTinDang);
router.get('/tin-dang/:id/chinh-sua', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layTinDangDeChinhSua);
router.post('/tin-dang/:id/gui-duyet', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.guiTinDangDeDuyet);
router.get('/cuoc-hen', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachCuocHen);
router.put('/cuoc-hen/:id/xac-nhan', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.xacNhanCuocHen);
router.get('/bao-cao-hieu-suat', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layBaoCaoHieuSuat);
router.get('/du-an', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachDuAn);
router.get('/du-an/:id', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layChiTietDuAn);
router.post('/du-an', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.taoDuAn);
router.post('/du-an/tao-nhanh', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.taoNhanhDuAn);
router.put('/du-an/:id', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.capNhatDuAn);
router.delete('/du-an/:id', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.luuTruDuAn);
router.post('/du-an/:id/yeu-cau-mo-lai', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.guiYeuCauMoLaiDuAn); // 🆕 UC-PROJ-BANNED
router.get('/chinh-sach-coc/:id', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layChiTietChinhSachCoc);
router.put('/chinh-sach-coc/:id', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.capNhatChinhSachCoc);
router.post('/hop-dong/bao-cao', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.baoCaoHopDongChoThue);

// Khu vực: map trực tiếp
router.get('/khu-vuc', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachKhuVuc);

// Mount sub-routes
router.use(uploadRoutes);
router.use(phongRoutes); // Routes quản lý phòng (Redesign 09/10/2025)

module.exports = router;
