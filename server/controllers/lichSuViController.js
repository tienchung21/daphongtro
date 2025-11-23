const LichSuViModel = require("../models/lichSuViModel");

class LichSuViController {
  static async them(req, res) {
    try {
      const { user_id, ma_giao_dich, so_tien, trang_thai, LoaiGiaoDich } =
        req.body;
      if (!user_id || !ma_giao_dich || !so_tien) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu thông tin bắt buộc" });
      }
      const result = await LichSuViModel.themLichSuVi({
        user_id,
        ma_giao_dich,
        so_tien,
        trang_thai,
        LoaiGiaoDich, // truyền thêm trường này
      });
      res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async sua(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (!id)
        return res.status(400).json({ success: false, message: "Thiếu id" });
      const { user_id, ma_giao_dich, so_tien, trang_thai } = req.body;
      const result = await LichSuViModel.suaLichSuVi(id, {
        user_id,
        ma_giao_dich,
        so_tien,
        trang_thai,
      });
      res.json({ success: true, affectedRows: result.affectedRows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async danhSach(req, res) {
    try {
      const data = await LichSuViModel.layTatCa();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async danhSachTheoUser(req, res) {
    try {
      const user_id = parseInt(req.params.user_id, 10);
      if (!user_id)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu user_id" });
      const data = await LichSuViModel.layTheoUser(user_id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = LichSuViController;
