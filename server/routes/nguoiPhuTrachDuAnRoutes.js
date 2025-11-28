const express = require("express");
const router = express.Router();
const NguoiPhuTrachDuAnController = require("../controllers/NguoiPhuTrachDuAnController");

// GET /api/nguoi-phu-trach-du-an/:id
router.get("/:id", NguoiPhuTrachDuAnController.layDanhSach);

module.exports = router;
