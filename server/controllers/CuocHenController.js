/**
 * Controller cho Cuộc hẹn
 * Xử lý các nghiệp vụ liên quan đến quản lý cuộc hẹn xem phòng
 * Tách từ ChuDuAnController.js theo domain-driven design
 */

const CuocHenModel = require('../models/CuocHenModel');
const NhatKyHeThongService = require('../services/NhatKyHeThongService');

class CuocHenController {
  /**
   * Lấy danh sách cuộc hẹn
   * GET /api/chu-du-an/cuoc-hen
   */
  static async layDanhSachCuocHen(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const filters = {
        trangThai: req.query.trangThai,
        tinDangId: req.query.tinDangId,
        tuNgay: req.query.tuNgay,
        denNgay: req.query.denNgay,
        limit: req.query.limit || 50
      };

      const danhSach = await CuocHenModel.layDanhSachCuocHen(chuDuAnId, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách cuộc hẹn thành công',
        data: {
          cuocHens: danhSach,
          tongSo: danhSach.length
        }
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách cuộc hẹn:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-02: Xác nhận cuộc hẹn
   * PUT /api/chu-du-an/cuoc-hen/:id/xac-nhan
   */
  static async xacNhanCuocHen(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const cuocHenId = parseInt(req.params.id);
      const { ghiChu } = req.body;

      const success = await CuocHenModel.xacNhanCuocHen(cuocHenId, chuDuAnId, ghiChu);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy cuộc hẹn'
        });
      }

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'xac_nhan_cuoc_hen',
        'CuocHen',
        cuocHenId,
        { trangThai: 'ChoXacNhan' },
        { trangThai: 'DaXacNhan', ghiChu },
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Xác nhận cuộc hẹn thành công'
      });
    } catch (error) {
      console.error('Lỗi xác nhận cuộc hẹn:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Lấy metrics cuộc hẹn
   * GET /api/chu-du-an/cuoc-hen/metrics
   */
  static async layMetricsCuocHen(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const metrics = await CuocHenModel.layMetricsCuocHen(chuDuAnId);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Lỗi lấy metrics cuộc hẹn:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-02: Phê duyệt cuộc hẹn
   * PUT /api/chu-du-an/cuoc-hen/:id/phe-duyet
   */
  static async pheDuyetCuocHen(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const cuocHenId = parseInt(req.params.id);
      const { phuongThucVao, ghiChu } = req.body;

      if (!phuongThucVao) {
        return res.status(400).json({
          success: false,
          message: 'Phương thức vào là bắt buộc'
        });
      }

      const success = await CuocHenModel.pheDuyetCuocHen(cuocHenId, chuDuAnId, phuongThucVao, ghiChu);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy cuộc hẹn'
        });
      }

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'phe_duyet_cuoc_hen',
        'CuocHen',
        cuocHenId,
        { pheDuyet: 'ChoPheDuyet' },
        { pheDuyet: 'DaPheDuyet', phuongThucVao },
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Phê duyệt cuộc hẹn thành công'
      });
    } catch (error) {
      console.error('Lỗi phê duyệt cuộc hẹn:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-02: Từ chối cuộc hẹn
   * PUT /api/chu-du-an/cuoc-hen/:id/tu-choi
   */
  static async tuChoiCuocHen(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const cuocHenId = parseInt(req.params.id);
      const { lyDoTuChoi } = req.body;

      if (!lyDoTuChoi) {
        return res.status(400).json({
          success: false,
          message: 'Lý do từ chối là bắt buộc'
        });
      }

      const success = await CuocHenModel.tuChoiCuocHen(cuocHenId, chuDuAnId, lyDoTuChoi);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy cuộc hẹn'
        });
      }

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'tu_choi_cuoc_hen',
        'CuocHen',
        cuocHenId,
        { pheDuyet: 'ChoPheDuyet' },
        { pheDuyet: 'TuChoi', lyDoTuChoi },
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Từ chối cuộc hẹn thành công'
      });
    } catch (error) {
      console.error('Lỗi từ chối cuộc hẹn:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = CuocHenController;



