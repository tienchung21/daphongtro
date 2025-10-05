const express = require('express');
const router = express.Router();
const ChuDuAnController = require('../controllers/ChuDuAnController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/role');

// Import thêm các routes con (chỉ giữ uploadRoutes)
const uploadRoutes = require('../api/ChuDuAn/uploadRoutes');

// API routes chính
router.get('/dashboard', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDashboard);
router.get('/tin-dang', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachTinDang);
router.get('/tin-nhap', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachTinNhap);
router.post('/tin-dang', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.taoTinDang);
router.post('/tin-dang/nhap', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.luuNhapTinDang);
router.get('/tin-dang/:id', ChuDuAnController.layChiTietTinDang); // 🧪 DEV: Temp public for testing
router.get('/tin-dang/:id/phong', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachPhong);
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
router.post('/hop-dong/bao-cao', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.baoCaoHopDongChoThue);

// Khu vực: map trực tiếp
router.get('/khu-vuc', authMiddleware, roleMiddleware(['ChuDuAn']), ChuDuAnController.layDanhSachKhuVuc);
// Mount sub-routes khác
router.use(uploadRoutes);

module.exports = router;