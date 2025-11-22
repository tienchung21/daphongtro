/**
 * Routes cho Operator - Quản lý Hồ sơ Nhân viên
 * UC-OPER-04 & UC-OPER-05
 */

const express = require('express');
const router = express.Router();
const HoSoNhanVienController = require('../controllers/HoSoNhanVienController');
const auth = require('../middleware/auth');
const { requireRoles } = require('../middleware/role');

// Middleware: Chỉ cho phép Operator và Admin
const operatorAuth = [auth, requireRoles(['NhanVienDieuHanh', 'QuanTriVienHeThong'])];

/**
 * GET /api/operator/nhan-vien
 * Lấy danh sách nhân viên
 */
router.get('/', operatorAuth, HoSoNhanVienController.danhSach);

/**
 * GET /api/operator/nhan-vien/thong-ke
 * Lấy thống kê nhân viên
 */
router.get('/thong-ke', operatorAuth, HoSoNhanVienController.thongKe);

/**
 * GET /api/operator/nhan-vien/:id
 * Lấy chi tiết nhân viên
 */
router.get('/:id', operatorAuth, HoSoNhanVienController.chiTiet);

/**
 * POST /api/operator/nhan-vien
 * Tạo tài khoản nhân viên mới
 */
router.post('/', operatorAuth, HoSoNhanVienController.taoMoi);

/**
 * PUT /api/operator/nhan-vien/:id
 * Cập nhật hồ sơ nhân viên
 */
router.put('/:id', operatorAuth, HoSoNhanVienController.capNhat);

/**
 * PUT /api/operator/nhan-vien/:id/trang-thai
 * Kích hoạt/vô hiệu hóa nhân viên
 */
router.put('/:id/trang-thai', operatorAuth, HoSoNhanVienController.kichHoat);

module.exports = router;





