const express = require("express");
const router = express.Router();
const CuocHenController = require("../controllers/cuocHenController");

// Lấy danh sách cuộc hẹn (dùng bởi Chủ dự án)
router.get("/", CuocHenController.layDanhSachCuocHen);

// Xác nhận cuộc hẹn
router.put("/:id/xac-nhan", CuocHenController.xacNhanCuocHen);

// Phê duyệt cuộc hẹn
router.put("/:id/phe-duyet", CuocHenController.pheDuyetCuocHen);

// Từ chối cuộc hẹn
router.put("/:id/tu-choi", CuocHenController.tuChoiCuocHen);

module.exports = router;
