/**
 * Dashboard Operator Routes
 * Endpoint tổng hợp metrics cho Dashboard Operator
 */

const express = require('express');
const router = express.Router();
const DashboardOperatorController = require('../controllers/DashboardOperatorController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

/**
 * @route GET /api/operator/dashboard/metrics
 * @desc Lấy tất cả metrics cho dashboard operator
 * @access Private (Operator only)
 */
router.get('/metrics', authMiddleware, requireRole('Operator'), DashboardOperatorController.layMetrics);

module.exports = router;

