/**
 * Controller cho Thông báo
 * Xử lý HTTP requests cho thông báo của Nhân viên Bán hàng
 */

const ThongBaoModel = require('../models/ThongBaoModel');

class ThongBaoController {
  /**
   * GET /api/nhan-vien-ban-hang/thong-bao
   * Lấy danh sách thông báo với pagination
   */
  static async layDanhSach(req, res) {
    try {
      const nguoiDungId = req.user.id;
      const filters = {
        trangThai: req.query.trangThai,
        loai: req.query.loai,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await ThongBaoModel.layDanhSach(nguoiDungId, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error('[ThongBaoController] Lỗi lấy danh sách thông báo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách thông báo'
      });
    }
  }

  /**
   * GET /api/nhan-vien-ban-hang/thong-bao/dem-chua-doc
   * Đếm số thông báo chưa đọc
   */
  static async demChuaDoc(req, res) {
    try {
      const nguoiDungId = req.user.id;
      const count = await ThongBaoModel.demChuaDoc(nguoiDungId);

      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('[ThongBaoController] Lỗi đếm thông báo chưa đọc:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi đếm thông báo chưa đọc'
      });
    }
  }

  /**
   * PUT /api/nhan-vien-ban-hang/thong-bao/:id/doc
   * Đánh dấu thông báo đã đọc
   */
  static async danhDauDaDoc(req, res) {
    try {
      const nguoiDungId = req.user.id;
      const thongBaoId = parseInt(req.params.id);

      if (isNaN(thongBaoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID thông báo không hợp lệ'
        });
      }

      const success = await ThongBaoModel.danhDauDaDoc(thongBaoId, nguoiDungId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông báo hoặc bạn không có quyền truy cập'
        });
      }

      res.json({
        success: true,
        message: 'Đã đánh dấu đã đọc'
      });
    } catch (error) {
      console.error('[ThongBaoController] Lỗi đánh dấu đã đọc:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi đánh dấu đã đọc'
      });
    }
  }

  /**
   * PUT /api/nhan-vien-ban-hang/thong-bao/doc-tat-ca
   * Đánh dấu tất cả thông báo đã đọc
   */
  static async danhDauDocTatCa(req, res) {
    try {
      const nguoiDungId = req.user.id;
      const count = await ThongBaoModel.danhDauDocTatCa(nguoiDungId);

      res.json({
        success: true,
        message: `Đã đánh dấu ${count} thông báo đã đọc`,
        count
      });
    } catch (error) {
      console.error('[ThongBaoController] Lỗi đánh dấu tất cả đã đọc:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi đánh dấu tất cả đã đọc'
      });
    }
  }
}

module.exports = ThongBaoController;


