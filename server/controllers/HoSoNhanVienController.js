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
        limit,
        operatorId
      } = req.query;

      const filters = {
        keyword,
        trangThai,
        khuVucId: khuVucId ? parseInt(khuVucId) : null,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        operatorId: operatorId ? parseInt(operatorId) : null
      };

      // console.log('📊 [HoSoNhanVienController] Filters:', filters);

      const result = await HoSoNhanVienModel.layDanhSachNhanVien(filters);

      console.log('HoSoNhanVienController - danhsach: ', result.data);

      // Lấy thống kê tổng thể
      const stats = await HoSoNhanVienModel.layThongKeNhanVien(filters.operatorId);

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách nhân viên thành công',
         ...result,
        stats: {
          hoatDong: stats.HoatDong || 0,
          tamKhoa: stats.TamKhoa || 0,
          voHieuHoa: stats.VoHieuHoa || 0,
          total: stats.TongSo || 0
        }
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
      const nhanVienId = parseInt(req.params.id || req.params[0]);

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
      const nhanVienId = parseInt(req.params.id || req.params[0]);
      const operatorId = req.user.id;
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
      const {
        Email,
        TenDayDu,
        SoDienThoai,
        KhuVucChinhID,
        KhuVucPhuTrachID,
        NgayBatDau,
        operatorId
      } = req.body;

      // console.log('Tao nhan vien moi: ', req.body);

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
        KhuVucPhuTrachID: KhuVucPhuTrachID ? parseInt(KhuVucPhuTrachID) : parseInt(KhuVucChinhID),
        NgayBatDau,
        operatorId
      };

      const result = await HoSoNhanVienModel.taoTaiKhoanNhanVien(data);

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
      const nhanVienId = parseInt(req.params.id || req.params[0]);
      const operatorId = req.user.id;
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

  /**
   * GET /api/operator/nhan-vien/khu-vuc/mac-dinh
   * Lấy thông tin khu vực chính và phụ trách mặc định của Operator hiện tại
   * Dùng để mặc định cho nhân viên mới
   */
  static async layKhuVucMacDinh(req, res) {
    try {
      console.log('\n========== [HoSoNhanVienController.layKhuVucMacDinh] START ==========');
      console.log('[HoSoNhanVienController] Raw req.user.id:', req.user?.id, 'Type:', typeof req.user?.id);
      console.log('[HoSoNhanVienController] Full req.user:', JSON.stringify(req.user));

      const operatorId = req.user.id;

      console.log('[HoSoNhanVienController] After assignment - operatorId:', operatorId, 'Type:', typeof operatorId);

      const khuVuc = await HoSoNhanVienModel.layKhuVucPhuTrach(operatorId);

      console.log('[HoSoNhanVienController] Khu vực lấy được:', khuVuc);
      console.log('========== [HoSoNhanVienController.layKhuVucMacDinh] END ==========\n');

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin khu vực mặc định thành công',
        data: khuVuc
      });
    } catch (error) {
      console.error('[HoSoNhanVienController] Lỗi layKhuVucMacDinh:', error.message);
      console.error('[HoSoNhanVienController] Stack:', error.stack);

      // Trả về 404 nếu nhân viên không tồn tại
      if (error.message === 'Nhân viên không tồn tại') {
        return res.status(404).json({
          success: false,
          message: 'Nhân viên điều hành không tồn tại (không có hồ sơ trong hosonhanvien)',
          operatorId: req.user?.id
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy khu vực mặc định',
        error: error.message
      });
    }
  }

  /**
   * GET /api/operator/nhan-vien/:id/khu-vuc
   * Lấy thông tin khu vực chính và phụ trách của nhân viên
   */
  static async layKhuVucPhuTrach(req, res) {
    try {
      const nhanVienId = parseInt(req.params.id || req.params[0]);

      if (!nhanVienId || isNaN(nhanVienId)) {
        return res.status(400).json({
          success: false,
          message: 'ID nhân viên không hợp lệ'
        });
      }

      const khuVuc = await HoSoNhanVienModel.layKhuVucPhuTrach(nhanVienId);

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin khu vực thành công',
        data: khuVuc
      });
    } catch (error) {
      console.error('[HoSoNhanVienController] Lỗi layKhuVucPhuTrach:', error);

      // Trả về 404 nếu nhân viên không tồn tại
      if (error.message === 'Nhân viên không tồn tại') {
        return res.status(404).json({
          success: false,
          message: 'Nhân viên không tồn tại'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy khu vực phụ trách',
        error: error.message
      });
    }
  }
}

module.exports = HoSoNhanVienController;






