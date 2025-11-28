const ViModel = require("../models/viModel");

class ViController {
  static async danhSach(req, res) {
    try {
      const data = await ViModel.getAll();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async layTheoNguoiDungId(req, res) {
    try {
      const nguoiDungId = parseInt(req.params.id, 10);
      if (!nguoiDungId)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu NguoiDungID" });
      const data = await ViModel.getByNguoiDungId(nguoiDungId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ViController;
