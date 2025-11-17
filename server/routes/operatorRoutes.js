/**
 * Routes cho Operator/Admin
 * Quản lý banned dự án, duyệt yêu cầu mở lại
 */

const express = require('express');
const router = express.Router();
const OperatorController = require('../controllers/OperatorController');

// === PRODUCTION AUTH: JWT-based authentication ===
const auth = require('../middleware/auth');
const { requireRoles } = require('../middleware/role');

/**
 * UC-OPR-01: Banned dự án (ngưng hoạt động do vi phạm)
 * PUT /api/operator/du-an/:id/banned
 * 
 * Middleware:
 * - auth: Xác thực JWT
 * - requireRole(['NhanVienDieuHanh', 'QuanTriVienHeThong']): Chỉ Nhân viên Điều hành/Admin được thực hiện
 * 
 * Body:
 * - LyDoNgungHoatDong (string, required, min 10 chars): Lý do vi phạm
 * 
 * Response:
 * - 200: Success với thông tin dự án đã banned
 * - 400: Validation errors
 * - 401: Chưa đăng nhập
 * - 403: Không có quyền (không phải Nhân viên Điều hành/Admin)
 * - 404: Dự án không tồn tại
 * - 409: Dự án đã bị banned trước đó
 */
router.put(
  '/du-an/:id/banned',
  auth,
  requireRoles(['NhanVienDieuHanh', 'QuanTriVienHeThong']),
  OperatorController.bannedDuAn
);

/**
 * UC-OPR-02: Xử lý yêu cầu mở lại dự án (duyệt/từ chối)
 * PUT /api/operator/du-an/:id/xu-ly-yeu-cau
 * 
 * Middleware:
 * - auth: Xác thực JWT
 * - requireRole(['NhanVienDieuHanh', 'QuanTriVienHeThong']): Chỉ Nhân viên Điều hành/Admin được thực hiện
 * 
 * Body:
 * - KetQua (string, required): 'ChapNhan' hoặc 'TuChoi'
 * - LyDoTuChoiMoLai (string, required nếu KetQua = 'TuChoi', min 10 chars): Lý do từ chối
 * 
 * Response:
 * - 200: Success
 * - 400: Validation errors
 * - 401: Chưa đăng nhập
 * - 403: Không có quyền
 * - 404: Dự án không tồn tại hoặc không có yêu cầu
 * - 409: Yêu cầu đã được xử lý
 */
router.put(
  '/du-an/:id/xu-ly-yeu-cau',
  auth,
  requireRoles(['NhanVienDieuHanh', 'QuanTriVienHeThong']),
  OperatorController.xuLyYeuCauMoLai
);

module.exports = router;
