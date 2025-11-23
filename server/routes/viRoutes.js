const express = require("express");
const router = express.Router();
const viController = require("../controllers/viController");

// GET /api/vi (lấy tất cả ví)
router.get("/", viController.danhSach);

// GET /api/vi/:id (lấy ví theo NguoiDungID)
router.get("/:id", viController.layTheoNguoiDungId);

module.exports = router;
