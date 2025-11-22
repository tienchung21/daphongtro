const PublicTinDangModel = require("../models/PublicTinDangModel");
const ChuDuAnModel = require("../models/ChuDuAnModel");

class PublicTinDangController {
  static async getDanhSachTinDang(req, res) {
    try {
      const filters = {
        onlyPublic: req.query.onlyPublic,
        trangThai: req.query.trangThai,
        duAnId: req.query.duAnId,
        keyword: req.query.keyword,
        limit: req.query.limit,
      };
      const data = await PublicTinDangModel.layTatCaTinDang(filters);
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Lấy chi tiết tin đăng công khai
   * GET /api/public/tin-dang/:id
   */
  static async getChiTietTinDang(req, res) {
    try {
      const tinDangId = parseInt(req.params.id, 10);
      
      if (!tinDangId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID tin đăng không hợp lệ' 
        });
      }

      const chiTiet = await PublicTinDangModel.layChiTietTinDang(tinDangId);
      
      if (!chiTiet) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy tin đăng' 
        });
      }

      return res.json({ 
        success: true, 
        data: chiTiet 
      });
    } catch (error) {
      console.error('[PublicTinDangController] Error getting detail:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // PUT /api/public/tin-dang/:id (không cần auth)
  static async updateTinDang(req, res) {
    try {
      const tinDangId = parseInt(req.params.id, 10);

      // Lấy chuDuAnId từ body thay vì req.user
      const chuDuAnId = req.body.chuDuAnId;

      if (!tinDangId || !chuDuAnId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Thiếu ID tin đăng hoặc chuDuAnId",
          });
      }

      const allowed = [
        "KhuVucID",
        "TieuDe",
        "URL",
        "MoTa",
        "TrangThai",
        "LyDoTuChoi",
        "PhongIDs",
      ];
      const updates = {};
      for (const k of allowed)
        if (req.body[k] !== undefined) updates[k] = req.body[k];

      if (Object.keys(updates).length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Không có trường hợp lệ để cập nhật",
          });
      }

      const result = await ChuDuAnModel.capNhatTinDang(
        tinDangId,
        chuDuAnId,
        updates
      );

      if (!result) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Không tìm thấy tin đăng hoặc không có quyền",
          });
      }

      const chiTiet = await ChuDuAnModel.layChiTietTinDang(
        tinDangId,
        chuDuAnId
      );

      return res.json({
        success: true,
        data: chiTiet,
        message: "Cập nhật tin đăng thành công",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/public/tin-dang/:id (không cần auth)
  static async deleteTinDang(req, res) {
    try {
      const tinDangId = parseInt(req.params.id, 10);

      // Lấy chuDuAnId từ body thay vì req.user
      const chuDuAnId = req.body.chuDuAnId;
      const { lyDoXoa } = req.body || {};

      if (!tinDangId || !chuDuAnId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Thiếu ID tin đăng hoặc chuDuAnId",
          });
      }

      const ok = await ChuDuAnModel.xoaTinDang(
        tinDangId,
        chuDuAnId,
        lyDoXoa || null
      );

      if (!ok) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Không tìm thấy tin đăng hoặc không có quyền",
          });
      }

      return res.json({
        success: true,
        message: "Xóa (lưu trữ) tin đăng thành công",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PublicTinDangController;
