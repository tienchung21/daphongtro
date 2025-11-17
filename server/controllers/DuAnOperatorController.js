/**
 * Controller mở rộng OperatorController - Quản lý Dự án
 * UC-OPER-02: Quản lý danh sách dự án
 * Bổ sung thêm các methods: danh sách, tạm ngưng, kích hoạt, thống kê
 * (Đã có sẵn: bannedDuAn, xuLyYeuCauMoLai trong OperatorController.js)
 */

const DuAnOperatorModel = require('../models/DuAnOperatorModel');

class DuAnOperatorController {
  /**
   * GET /api/operator/du-an
   * Lấy danh sách dự án với bộ lọc và phân trang
   */
  static async danhSachDuAn(req, res) {
    try {
      const {
        keyword,
        trangThai,
        chuDuAnId,
        page,
        limit
      } = req.query;

      const filters = {
        keyword,
        trangThai,
        chuDuAnId: chuDuAnId ? parseInt(chuDuAnId) : null,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20
      };

      const result = await DuAnOperatorModel.layDanhSachDuAn(filters);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách dự án thành công',
        ...result
      });
    } catch (error) {
      console.error('[DuAnOperatorController] Lỗi danhSachDuAn:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách dự án',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/operator/du-an/:id/tam-ngung
   * Tạm ngưng dự án (không banned, chỉ tạm ngưng)
   */
  static async tamNgung(req, res) {
    try {
      const duAnId = parseInt(req.params.id);
      const nhanVienId = req.user.NguoiDungID;
      const { LyDo } = req.body;

      if (!duAnId || isNaN(duAnId)) {
        return res.status(400).json({
          success: false,
          message: 'ID dự án không hợp lệ'
        });
      }

      if (!LyDo || LyDo.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Lý do tạm ngưng phải có ít nhất 10 ký tự'
        });
      }

      const duAn = await DuAnOperatorModel.tamNgungDuAn(duAnId, nhanVienId, LyDo);

      return res.status(200).json({
        success: true,
        message: 'Tạm ngưng dự án thành công',
        data: duAn
      });
    } catch (error) {
      console.error('[DuAnOperatorController] Lỗi tamNgung:', error);
      
      if (error.message === 'Dự án không tồn tại') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('không thể') || error.message.includes('đã')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạm ngưng dự án',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/operator/du-an/:id/kich-hoat
   * Kích hoạt lại dự án (từ LuuTru → HoatDong)
   */
  static async kichHoat(req, res) {
    try {
      const duAnId = parseInt(req.params.id);
      const nhanVienId = req.user.NguoiDungID;

      if (!duAnId || isNaN(duAnId)) {
        return res.status(400).json({
          success: false,
          message: 'ID dự án không hợp lệ'
        });
      }

      const duAn = await DuAnOperatorModel.kichHoatDuAn(duAnId, nhanVienId);

      return res.status(200).json({
        success: true,
        message: 'Kích hoạt dự án thành công',
        data: duAn
      });
    } catch (error) {
      console.error('[DuAnOperatorController] Lỗi kichHoat:', error);
      
      if (error.message === 'Dự án không tồn tại') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('không thể') || error.message.includes('đã') || error.message.includes('banned')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi kích hoạt dự án',
        error: error.message
      });
    }
  }

  /**
   * GET /api/operator/du-an/thong-ke
   * Lấy thống kê dự án theo trạng thái
   */
  static async thongKe(req, res) {
    try {
      const thongKe = await DuAnOperatorModel.layThongKeDuAn();

      return res.status(200).json({
        success: true,
        message: 'Lấy thống kê dự án thành công',
        data: thongKe
      });
    } catch (error) {
      console.error('[DuAnOperatorController] Lỗi thongKe:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê',
        error: error.message
      });
    }
  }

  /**
   * GET /api/operator/du-an/:id
   * Lấy chi tiết dự án
   */
  static async chiTiet(req, res) {
    try {
      const duAnId = parseInt(req.params.id);

      if (!duAnId || isNaN(duAnId)) {
        return res.status(400).json({
          success: false,
          message: 'ID dự án không hợp lệ'
        });
      }

      const duAn = await DuAnOperatorModel.layChiTietDuAn(duAnId);

      return res.status(200).json({
        success: true,
        message: 'Lấy chi tiết dự án thành công',
        data: duAn
      });
    } catch (error) {
      console.error('[DuAnOperatorController] Lỗi chiTiet:', error);
      
      if (error.message === 'Dự án không tồn tại') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy chi tiết dự án',
        error: error.message
      });
    }
  }

  /**
   * ❌ REMOVED: duyetHoaHong() - Không cần endpoint duyệt hoa hồng riêng
   * 
   * Thay thế:
   * - Nếu hoa hồng vi phạm → Dùng ngungHoatDongDuAn() để banned
   * - Nếu chủ dự án sửa và yêu cầu mở lại → Dùng xuLyYeuCauMoLai()
   * 
   * Xem docs/HOA_HONG_SCHEMA_ANALYSIS.md
   */

  /**
   * POST /api/operator/du-an/:id/tu-choi-hoa-hong
   * Từ chối hoa hồng dự án
   */
  static async tuChoiHoaHong(req, res) {
    try {
      const duAnId = parseInt(req.params.id);
      const operatorId = req.user.NguoiDungID;
      const { lyDo, ghiChu } = req.body;

      if (!duAnId || isNaN(duAnId)) {
        return res.status(400).json({
          success: false,
          message: 'ID dự án không hợp lệ'
        });
      }

      if (!lyDo || lyDo.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Lý do từ chối phải có ít nhất 10 ký tự'
        });
      }

      const duAn = await DuAnOperatorModel.tuChoiHoaHongDuAn(duAnId, operatorId, lyDo, ghiChu);

      return res.status(200).json({
        success: true,
        message: 'Từ chối hoa hồng dự án thành công',
        data: duAn
      });
    } catch (error) {
      console.error('[DuAnOperatorController] Lỗi tuChoiHoaHong:', error);
      
      if (error.message === 'Dự án không tồn tại') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('đã được duyệt') || error.message.includes('phải có ít nhất')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi từ chối hoa hồng',
        error: error.message
      });
    }
  }
}

module.exports = DuAnOperatorController;






