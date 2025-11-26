/**
 * @fileoverview Routes quản lý Hợp đồng cho Admin/Operator
 * @module hopDongAdminRoutes
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRoles } = require('../middleware/role');
const HopDongController = require('../controllers/HopDongController');

// Middleware: Chỉ cho phép Admin và Operator
const adminAuth = [authMiddleware, requireRoles(['QuanTriVienHeThong', 'NhanVienDieuHanh'])];

/**
 * GET /api/admin/hop-dong
 * Lấy tất cả hợp đồng (cho Admin/Operator)
 */
router.get(
  '/hop-dong',
  adminAuth,
  HopDongController.layTatCa
);

module.exports = router;

