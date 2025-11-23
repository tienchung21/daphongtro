const express = require("express");
const router = express.Router();
const lichSuViController = require("../controllers/lichSuViController");

// POST /api/lich-su-vi (thêm mới)
router.post("/", lichSuViController.them);

// PUT /api/lich-su-vi/:id (sửa)
router.put("/:id", lichSuViController.sua);

// GET /api/lich-su-vi (xem tất cả)
router.get("/", lichSuViController.danhSach);

// GET /api/lich-su-vi/user/:user_id (xem theo user_id)
router.get("/user/:user_id", lichSuViController.danhSachTheoUser);

module.exports = router;
