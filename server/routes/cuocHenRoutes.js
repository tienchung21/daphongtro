const express = require("express");
const router = express.Router();
const cuocHenCtrl = require("../controllers/cuocHenController");

// Public: tạo cuộc hẹn (khách) - body bắt buộc: PhongID, KhachHangID, NhanVienBanHangID, ThoiGianHen
router.post("/", cuocHenCtrl.create);

// Lấy tất cả cuộc hẹn
router.get("/", cuocHenCtrl.getAll);

// Tìm theo Khách hàng
router.get("/search/khach-hang/:khachHangId", cuocHenCtrl.findByKhachHang);

// Tìm theo Nhân viên
router.get("/search/nhan-vien/:nhanVienId", cuocHenCtrl.findByNhanVien);

// Tìm theo Chủ dự án (admin/owner view)
router.get("/search/chu-du-an/:chuDuAnId", cuocHenCtrl.findByChuDuAn);

// Lấy chi tiết cuộc hẹn
router.get("/:id", cuocHenCtrl.getById);

// Cập nhật cuộc hẹn
router.put("/:id", cuocHenCtrl.update);

// Xóa cuộc hẹn
router.delete("/:id", cuocHenCtrl.delete);

module.exports = router;
