/**
 * Controller xử lý các API hợp đồng dành cho Khách hàng (đặt cọc/preview)
 */

const HopDongTemplateService = require('../services/HopDongTemplateService');
const NhatKyHeThongService = require('../services/NhatKyHeThongService');
const HopDongModel = require('../models/HopDongModel');
const db = require('../config/db');

class HopDongCustomerController {
  /**
   * POST /api/hop-dong/generate
   * Sinh snapshot hợp đồng với dữ liệu override (nếu có)
   */
  static async generate(req, res) {
    try {
      const { mauHopDongId, tinDangId, overrides } = req.body || {};

      if (!tinDangId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tinDangId',
        });
      }

      const preview = await HopDongTemplateService.buildPreview({
        mauHopDongId: mauHopDongId ? Number(mauHopDongId) : null,
        tinDangId: Number(tinDangId),
        khachHangId: req.user.id,
        overrides: overrides || {},
      });

      return res.status(201).json({
        success: true,
        data: {
          template: preview.template,
          payload: preview.payload,
          noiDungSnapshot: preview.renderedHtml,
        },
      });
    } catch (error) {
      console.error('[HopDongCustomerController.generate]', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể sinh hợp đồng',
      });
    }
  }

  /**
   * POST /api/hop-dong/:tinDangId/confirm-deposit
   * Tạm thời chỉ ghi nhận log xác nhận đặt cọc
   */
  static async confirmDeposit(req, res) {
    try {
      const tinDangId = Number(req.params.tinDangId);
      const { giaoDichId, soTien, noiDungSnapshot, phongId } = req.body || {};

      if (!tinDangId || Number.isNaN(tinDangId)) {
        return res.status(400).json({
          success: false,
          message: 'TinDangID không hợp lệ',
        });
      }

      if (!giaoDichId || !soTien) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin giao dịch hoặc số tiền',
        });
      }

      if (!phongId || Number.isNaN(Number(phongId))) {
        return res.status(400).json({
          success: false,
          message: 'Phòng không hợp lệ',
        });
      }

      const phongIdNum = Number(phongId);

      // Lấy thông tin phòng, dự án và giá phòng
      const [phongRows] = await db.execute(
        `
          SELECT 
            p.PhongID, 
            p.TrangThai,
            p.DuAnID,
            COALESCE(pt.GiaTinDang, p.GiaChuan) as GiaPhong,
            td.DuAnID as TinDangDuAnID
          FROM phong_tindang pt
          INNER JOIN phong p ON pt.PhongID = p.PhongID
          INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
          WHERE pt.TinDangID = ? AND p.PhongID = ?
          LIMIT 1
        `,
        [tinDangId, phongIdNum]
      );

      if (!phongRows.length) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng thuộc tin đăng này',
        });
      }

      if (phongRows[0].TrangThai !== 'Trong') {
        return res.status(400).json({
          success: false,
          message: 'Phòng đã được giữ chỗ hoặc không còn trống',
        });
      }

      const phongInfo = phongRows[0];
      const duAnId = phongInfo.DuAnID || phongInfo.TinDangDuAnID || null;
      const giaPhong = phongInfo.GiaPhong || null;

      await db.execute(
        `
          UPDATE phong
          SET TrangThai = 'GiuCho', CapNhatLuc = NOW()
          WHERE PhongID = ?
        `,
        [phongIdNum]
      );

      // Ghi nhận log
      await NhatKyHeThongService.ghiNhan({
        NguoiDungID: req.user.id,
        HanhDong: NhatKyHeThongService.HANH_DONG.DAT_COC_GIU_CHO,
        DoiTuong: 'TinDang',
        DoiTuongID: tinDangId,
        ChiTiet: {
          giaoDichId,
          soTien,
          noiDungSnapshotPreview: typeof noiDungSnapshot === 'string'
            ? noiDungSnapshot.slice(0, 1000)
            : null,
        },
        DiaChiIP: req.ip,
        TrinhDuyet: req.get('User-Agent') || '',
      });

      // Tạo record hợp đồng với nội dung đã render
      if (noiDungSnapshot && typeof noiDungSnapshot === 'string') {
        const [hopDongResult] = await db.execute(`
          INSERT INTO hopdong (
            TinDangID, 
            PhongID,
            DuAnID,
            KhachHangID, 
            GiaThueCuoiCung,
            SoTienCoc,
            noidunghopdong
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          tinDangId,
          phongIdNum,
          duAnId,
          req.user.id,
          giaPhong,
          Number(soTien),
          noiDungSnapshot
        ]);

        const hopDongId = hopDongResult.insertId;

        return res.json({
          success: true,
          message: 'Đã ghi nhận yêu cầu xác nhận đặt cọc. Hệ thống sẽ đối soát giao dịch.',
          data: {
            tinDangId,
            giaoDichId,
            soTien,
            phongId: phongIdNum,
            hopDongId,
          },
        });
      }

      return res.json({
        success: true,
        message: 'Đã ghi nhận yêu cầu xác nhận đặt cọc. Hệ thống sẽ đối soát giao dịch.',
        data: {
          tinDangId,
          giaoDichId,
          soTien,
          phongId: phongIdNum,
        },
      });
    } catch (error) {
      console.error('[HopDongCustomerController.confirmDeposit]', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Không thể ghi nhận xác nhận đặt cọc',
      });
    }
  }

  /**
   * GET /api/hop-dong/khach-hang
   * Lấy danh sách hợp đồng của khách hàng
   */
  static async layDanhSachHopDong(req, res) {
    try {
      const khachHangId = req.user.id || req.user.NguoiDungID;
      const { tuNgay, denNgay } = req.query;

      if (!khachHangId) {
        return res.status(401).json({
          success: false,
          message: 'Không xác định được khách hàng'
        });
      }

      const danhSach = await HopDongModel.layHopDongCuaKhachHang(khachHangId, {
        tuNgay,
        denNgay
      });

      res.json({
        success: true,
        data: danhSach
      });

    } catch (error) {
      console.error('[HopDongCustomerController.layDanhSachHopDong]', error);
      console.error('[HopDongCustomerController.layDanhSachHopDong] Error details:', error.message);
      console.error('[HopDongCustomerController.layDanhSachHopDong] Stack:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách hợp đồng'
      });
    }
  }
}

module.exports = HopDongCustomerController;

