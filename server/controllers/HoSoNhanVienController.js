/**
 * Controller xử lý Quản lý Hồ sơ Nhân viên cho Operator
 * UC-OPER-04 & UC-OPER-05: Quản lý hồ sơ và tạo tài khoản NVBH
 */

const HoSoNhanVienModel = require('../models/HoSoNhanVienModel');

class HoSoNhanVienController {
  /**
   * GET /api/operator/nhan-vien
   * Lấy danh sách nhân viên với phân trang và bộ lọc
   */
  static async danhSach(req, res) {
    try {
      const {
        keyword,
        trangThai,
        khuVucId,
        page,
        limit
      } = req.query;

      const filters = {
        keyword,
        trangThai,
        khuVucId: khuVucId ? parseInt(khuVucId) : null,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20
      };

      const result = await HoSoNhanVienModel.layDanhSachNhanVien(filters);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách nhân viên thành công',
        ...result
      });
    } catch (error) {
      console.error('[HoSoNhanVienController] Lỗi danhSach:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách nhân viên',
        error: error.message
      });
    }
  }

  /**
   * GET /api/operator/nhan-vien/:id
   * Lấy chi tiết hồ sơ nhân viên
   */
  static async chiTiet(req, res) {
    try {
      const nhanVienId = parseInt(req.params.id);

      if (!nhanVienId || isNaN(nhanVienId)) {
        return res.status(400).json({
          success: false,
          message: 'ID nhân viên không hợp lệ'
        });
      }

      const raw = await HoSoNhanVienModel.layChiTietNhanVien(nhanVienId);

      // Map dữ liệu về view model cho frontend (ModalChiTietNhanVien)
      const nhanVien = {
        NguoiDungID: raw.NguoiDungID,
        HoSoID: raw.HoSoID,
        MaNhanVien: raw.MaNhanVien,
        TenDayDu: raw.TenDayDu,
        Email: raw.Email,
        SoDienThoai: raw.SoDienThoai,
        KhuVucPhuTrach: raw.TenKhuVuc || null,
        TrangThai: raw.TrangThaiLamViec || raw.TrangThaiTaiKhoan || null,
        TrangThaiLamViec: raw.TrangThaiLamViec || null,
        TrangThaiTaiKhoan: raw.TrangThaiTaiKhoan || null,
        TrangThaiXacMinh: raw.TrangThaiXacMinh || null,
        NgayBatDau: raw.NgayBatDau || null,
        NgayKetThuc: raw.NgayKetThuc || null,
        TyLeHoaHong: raw.TyLeHoaHong,
        GhiChu: raw.GhiChu,
        ThongKe: {
          TongCuocHen: raw.TongSoCuocHen || 0,
          CuocHenHoanThanh: raw.SoCuocHenHoanThanh || 0,
          TongHopDong: raw.TongHopDong || 0, // hiện chưa tính, để 0
          TyLeThanhCong: raw.TyLeHoanThanh || 0
        },
        // Lịch làm việc gần đây (tối đa 10 ca)
        LichLamViec: Array.isArray(raw.LichLamViecGanDay)
          ? raw.LichLamViecGanDay
          : [],
        // Chuẩn hóa lịch sử cho UI hiển thị gọn
        LichSu: Array.isArray(raw.LichSuCuocHen)
          ? raw.LichSuCuocHen.map((item) => ({
              TaoLuc: item.ThoiGianHen,
              HanhDong: `Cuộc hẹn ${item.TrangThai}`,
              ChiTiet: `${item.TenPhong} - ${item.TieuDeTinDang} - ${item.TenKhachHang}`
            }))
          : []
      };

      return res.status(200).json({
        success: true,
        message: 'Lấy chi tiết nhân viên thành công',
        data: nhanVien
      });
    } catch (error) {
      console.error('[HoSoNhanVienController] Lỗi chiTiet:', error);

      if (error.message === 'Nhân viên không tồn tại') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy chi tiết nhân viên',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/operator/nhan-vien/:id
   * Cập nhật hồ sơ nhân viên
   */
  static async capNhat(req, res) {
    try {
      const nhanVienId = parseInt(req.params.id);
      const operatorId = req.user.NguoiDungID;
      const {
        TenDayDu,
        SoDienThoai,
        KhuVucChinhID,
        TyLeHoaHong,
        GhiChu
      } = req.body;

      if (!nhanVienId || isNaN(nhanVienId)) {
        return res.status(400).json({
          success: false,
          message: 'ID nhân viên không hợp lệ'
        });
      }

      const data = {
        TenDayDu,
        SoDienThoai,
        KhuVucChinhID: KhuVucChinhID ? parseInt(KhuVucChinhID) : undefined,
        TyLeHoaHong: TyLeHoaHong !== undefined ? parseFloat(TyLeHoaHong) : undefined,
        GhiChu
      };

      const nhanVien = await HoSoNhanVienModel.capNhatHoSo(nhanVienId, data, operatorId);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ nhân viên thành công',
        data: nhanVien
      });
    } catch (error) {
      console.error('[HoSoNhanVienController] Lỗi capNhat:', error);
      
      if (error.message === 'Nhân viên không tồn tại') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('không hợp lệ') || 
          error.message.includes('phải') ||
          error.message.includes('Tỷ lệ')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật hồ sơ',
        error: error.message
      });
    }
  }

  /**
   * POST /api/operator/nhan-vien
   * Tạo tài khoản nhân viên mới
   */
  static async taoMoi(req, res) {
    try {
      const operatorId = req.user.NguoiDungID;
      const {
        Email,
        TenDayDu,
        SoDienThoai,
        KhuVucChinhID,
        TyLeHoaHong
      } = req.body;

      // Validation cơ bản
      if (!Email || !TenDayDu || !SoDienThoai || !KhuVucChinhID) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: Email, TenDayDu, SoDienThoai, KhuVucChinhID'
        });
      }

      const data = {
        Email,
        TenDayDu,
        SoDienThoai,
        KhuVucChinhID: parseInt(KhuVucChinhID),
        TyLeHoaHong: TyLeHoaHong ? parseFloat(TyLeHoaHong) : 5
      };

      const result = await HoSoNhanVienModel.taoTaiKhoanNhanVien(data, operatorId);

      // TODO: Gửi email thiết lập mật khẩu (sẽ implement trong EmailService)
      // await EmailService.guiEmailThietLapMatKhau(result.userId, result.email, result.setupToken);

      return res.status(201).json({
        success: true,
        message: 'Tạo tài khoản nhân viên thành công. Email thiết lập mật khẩu đã được gửi.',
        data: {
          userId: result.userId,
          email: result.email,
          maNhanVien: result.maNhanVien
        }
      });
    } catch (error) {
      console.error('[HoSoNhanVienController] Lỗi taoMoi:', error);
      
      if (error.message.includes('không hợp lệ') || 
          error.message.includes('phải') ||
          error.message.includes('đã được sử dụng') ||
          error.message.includes('Phải chọn') ||
          error.message.includes('chưa được tạo')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo tài khoản nhân viên',
        error: error.message
      });
    }
  }

  /**
   * PUT /api/operator/nhan-vien/:id/trang-thai
   * Kích hoạt/vô hiệu hóa nhân viên
   */
  static async kichHoat(req, res) {
    try {
      const nhanVienId = parseInt(req.params.id);
      const operatorId = req.user.NguoiDungID;
      const { TrangThai } = req.body;

      if (!nhanVienId || isNaN(nhanVienId)) {
        return res.status(400).json({
          success: false,
          message: 'ID nhân viên không hợp lệ'
        });
      }

      if (!['Active', 'Inactive'].includes(TrangThai)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái phải là 'Active' hoặc 'Inactive'"
        });
      }

      const nhanVien = await HoSoNhanVienModel.kichHoat_VoHieuHoaNhanVien(nhanVienId, TrangThai, operatorId);

      return res.status(200).json({
        success: true,
        message: `${TrangThai === 'Active' ? 'Kích hoạt' : 'Vô hiệu hóa'} nhân viên thành công`,
        data: nhanVien
      });
    } catch (error) {
      console.error('[HoSoNhanVienController] Lỗi kichHoat:', error);
      
      if (error.message.includes('Trạng thái phải là')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi thay đổi trạng thái nhân viên',
        error: error.message
      });
    }
  }

  /**
   * GET /api/operator/nhan-vien/thong-ke
   * Lấy thống kê nhân viên
   */
  static async thongKe(req, res) {
    try {
      const thongKe = await HoSoNhanVienModel.layThongKeNhanVien();

      return res.status(200).json({
        success: true,
        message: 'Lấy thống kê nhân viên thành công',
        data: thongKe
      });
    } catch (error) {
      console.error('[HoSoNhanVienController] Lỗi thongKe:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê',
        error: error.message
      });
    }
  }
}

module.exports = HoSoNhanVienController;






