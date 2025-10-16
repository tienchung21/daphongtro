/**
 * Controller cho Chủ dự án
 * Xử lý các request liên quan đến nghiệp vụ của chủ dự án
 */

const ChuDuAnModel = require('../models/ChuDuAnModel');
const NhatKyHeThongService = require('../services/NhatKyHeThongService');

/**
 * @typedef {Object} ResponseFormat
 * @property {boolean} success
 * @property {string} message
 * @property {*} data
 */

class ChuDuAnController {
  /**
   * UC-PROJ-01: Đăng tin cho thuê
   * POST /api/chu-du-an/tin-dang
   */
  static async taoTinDang(req, res) {
    try {
      const chuDuAnId = req.user.id; // Từ middleware auth
      const tinDangData = req.body;

      console.log('📥 Backend nhận dữ liệu:', JSON.stringify(tinDangData, null, 2));

      // Validate dữ liệu đầu vào
      if (!tinDangData.DuAnID || !tinDangData.TieuDe) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: DuAnID, TieuDe'
        });
      }

      // Bắt buộc phải chọn phòng từ danh sách dự án
      if (!Array.isArray(tinDangData.PhongIDs) || tinDangData.PhongIDs.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tin đăng phải chọn ít nhất một phòng từ dự án'
        });
      }

      const phongIdKhongHopLe = tinDangData.PhongIDs.some(item => !item || !item.PhongID);
      if (phongIdKhongHopLe) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách phòng không hợp lệ'
        });
      }

      const tinDangId = await ChuDuAnModel.taoTinDang(chuDuAnId, tinDangData);

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'tao_tin_dang',
        'TinDang',
        tinDangId,
        null,
        { trangThai: 'Nhap', tieuDe: tinDangData.TieuDe },
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json({
        success: true,
        message: 'Tạo tin đăng thành công',
        data: { tinDangId }
      });
    } catch (error) {
      console.error('Lỗi tạo tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-01: Lấy danh sách tin đăng của chủ dự án
   * GET /api/chu-du-an/tin-dang
   */
  static async layDanhSachTinDang(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const filters = {
        trangThai: req.query.trangThai,
        duAnId: req.query.duAnId,
        keyword: req.query.keyword,
        limit: req.query.limit || 20
      };

      const danhSach = await ChuDuAnModel.layDanhSachTinDang(chuDuAnId, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách tin đăng thành công',
        data: {
          tinDangs: danhSach,
          tongSo: danhSach.length,
          filters: filters
        }
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-01: Lấy chi tiết tin đăng
   * GET /api/chu-du-an/tin-dang/:id
   */
  static async layChiTietTinDang(req, res) {
    try {
      // 🧪 DEV: Allow testing without auth (fallback to owner ID from DB)
      const chuDuAnId = req.user?.id || null; // NULL allows fetching without ownership check
      const tinDangId = parseInt(req.params.id);

      if (!tinDangId) {
        return res.status(400).json({
          success: false,
          message: 'ID tin đăng không hợp lệ'
        });
      }

      const tinDang = await ChuDuAnModel.layChiTietTinDang(tinDangId, chuDuAnId);

      if (!tinDang) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng hoặc không có quyền truy cập'
        });
      }

      res.json({
        success: true,
        message: 'Lấy chi tiết tin đăng thành công',
        data: tinDang
      });
    } catch (error) {
      console.error('Lỗi lấy chi tiết tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Lấy danh sách phòng của tin đăng
   * GET /api/chu-du-an/tin-dang/:id/phong
   */
  static async layDanhSachPhong(req, res) {
    try {
      const tinDangId = parseInt(req.params.id);
      
      if (!tinDangId) {
        return res.status(400).json({
          success: false,
          message: 'ID tin đăng không hợp lệ'
        });
      }

      const phongs = await ChuDuAnModel.layDanhSachPhong(tinDangId);

      res.json({
        success: true,
        message: 'Lấy danh sách phòng thành công',
        data: phongs
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách phòng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-01: Cập nhật tin đăng
   * PUT /api/chu-du-an/tin-dang/:id
   */
  static async capNhatTinDang(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const tinDangId = parseInt(req.params.id);
      const updateData = req.body;

      if (!tinDangId) {
        return res.status(400).json({
          success: false,
          message: 'ID tin đăng không hợp lệ'
        });
      }

      const ketQua = await ChuDuAnModel.capNhatTinDang(tinDangId, chuDuAnId, updateData);

      if (ketQua) {
        // Ghi audit log
        await NhatKyHeThongService.ghiNhan(
          chuDuAnId,
          'cap_nhat_tin_dang',
          'TinDang',
          tinDangId,
          { trangThai: 'Cũ' },
          { trangThai: 'Nhap', ...updateData },
          req.ip,
          req.get('User-Agent')
        );

        res.json({
          success: true,
          message: 'Cập nhật tin đăng thành công'
        });
      }
    } catch (error) {
      console.error('Lỗi cập nhật tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-01: Gửi tin đăng để duyệt
   * POST /api/chu-du-an/tin-dang/:id/gui-duyet
   */
  static async guiTinDangDeDuyet(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const tinDangId = parseInt(req.params.id);

      if (!tinDangId) {
        return res.status(400).json({
          success: false,
          message: 'ID tin đăng không hợp lệ'
        });
      }

      const ketQua = await ChuDuAnModel.guiTinDangDeDuyet(tinDangId, chuDuAnId);

      if (ketQua) {
        // Ghi audit log
        await NhatKyHeThongService.ghiNhan(
          chuDuAnId,
          'gui_tin_dang_de_duyet',
          'TinDang',
          tinDangId,
          { trangThai: 'Nhap' },
          { trangThai: 'ChoDuyet' },
          req.ip,
          req.get('User-Agent')
        );

        res.json({
          success: true,
          message: 'Gửi tin đăng để duyệt thành công'
        });
      }
    } catch (error) {
      console.error('Lỗi gửi tin đăng để duyệt:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-02: Quản lý cuộc hẹn xem phòng
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

      const danhSach = await ChuDuAnModel.layDanhSachCuocHen(chuDuAnId, filters);

      res.json({
        success: true,
        message: 'Lấy danh sách cuộc hẹn thành công',
        data: {
          cuocHens: danhSach,
          tongSo: danhSach.length,
          filters: filters
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
   * POST /api/chu-du-an/cuoc-hen/:id/xac-nhan
   */
  static async xacNhanCuocHen(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const cuocHenId = parseInt(req.params.id);
      const { ghiChu } = req.body;

      if (!cuocHenId) {
        return res.status(400).json({
          success: false,
          message: 'ID cuộc hẹn không hợp lệ'
        });
      }

      const ketQua = await ChuDuAnModel.xacNhanCuocHen(cuocHenId, chuDuAnId, ghiChu);

      if (ketQua) {
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
      }
    } catch (error) {
      console.error('Lỗi xác nhận cuộc hẹn:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-03: Xem báo cáo hiệu suất
   * GET /api/chu-du-an/bao-cao
   */
  static async layBaoCaoHieuSuat(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const filters = {
        tuNgay: req.query.tuNgay,
        denNgay: req.query.denNgay
      };

      const baoCao = await ChuDuAnModel.layBaoCaoHieuSuat(chuDuAnId, filters);

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'chu_du_an_xem_bao_cao',
        'BaoCao',
        null,
        null,
        { loaiBaoCao: 'HieuSuat', ...filters },
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Lấy báo cáo hiệu suất thành công',
        data: baoCao
      });
    } catch (error) {
      console.error('Lỗi lấy báo cáo hiệu suất:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Lấy danh sách dự án của chủ dự án
   * GET /api/chu-du-an/du-an
   */
  static async layDanhSachDuAn(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const danhSach = await ChuDuAnModel.layDanhSachDuAn(chuDuAnId);

      res.json({
        success: true,
        message: 'Lấy danh sách dự án thành công',
        data: danhSach
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách dự án:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async layChiTietDuAn(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const duAnId = req.params.id;
      const duAn = await ChuDuAnModel.layChiTietDuAn(duAnId, chuDuAnId);
      
      if (!duAn) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dự án'
        });
      }
      
      res.json({
        success: true,
        data: duAn
      });
    } catch (error) {
      console.error('Lỗi lấy chi tiết dự án:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Lấy danh sách khu vực theo parent (null = Tỉnh/TP)
   */
  static async layDanhSachKhuVuc(req, res) {
    try {
      let { parentId } = req.query;
      if (parentId === undefined || parentId === null || parentId === '' || parentId === 'null') {
        parentId = null;
      }
      const danhSach = await ChuDuAnModel.layDanhSachKhuVuc(parentId);
      return res.json({ success: true, data: danhSach });
    } catch (error) {
      console.error('Lỗi lấy danh sách khu vực:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Tạo mới Dự án (đơn giản cho Chủ dự án tự tạo nhanh khi đăng tin)
   */
  static async taoDuAn(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const { TenDuAn, DiaChi } = req.body;
      if (!TenDuAn) {
        return res.status(400).json({ success: false, message: 'Thiếu TenDuAn' });
      }

      const duAnId = await ChuDuAnModel.taoDuAnNhanh({
        TenDuAn,
        DiaChi: DiaChi || '',
        ChuDuAnID: chuDuAnId
      });

      res.status(201).json({ success: true, duAnId });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async capNhatDuAn(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const duAnId = parseInt(req.params.id, 10);

      if (Number.isNaN(duAnId)) {
        return res.status(400).json({
          success: false,
          message: 'ID dự án không hợp lệ'
        });
      }

      const allowedFields = [
        'TenDuAn',
        'DiaChi',
        'ViDo',
        'KinhDo',
        'YeuCauPheDuyetChu',
        'PhuongThucVao',
        'TrangThai'
      ];

      const payload = {};
      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          payload[field] = req.body[field];
        }
      });

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có dữ liệu để cập nhật'
        });
      }

      const duAn = await ChuDuAnModel.capNhatDuAn(duAnId, chuDuAnId, payload);

      if (!duAn) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dự án hoặc bạn không có quyền truy cập'
        });
      }

      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'cap_nhat_du_an',
        'DuAn',
        duAnId,
        null,
        payload,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Cập nhật dự án thành công',
        data: duAn
      });
    } catch (error) {
      console.error('Lỗi cập nhật dự án:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async luuTruDuAn(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const duAnId = parseInt(req.params.id, 10);

      if (Number.isNaN(duAnId)) {
        return res.status(400).json({
          success: false,
          message: 'ID dự án không hợp lệ'
        });
      }

      const lyDo = req.body?.lyDo || null;

      const duAn = await ChuDuAnModel.luuTruDuAn(duAnId, chuDuAnId);

      if (!duAn) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dự án hoặc bạn không có quyền truy cập'
        });
      }

      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'luu_tru_du_an',
        'DuAn',
        duAnId,
        null,
        { lyDo: lyDo || undefined },
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Lưu trữ dự án thành công',
        data: duAn
      });
    } catch (error) {
      console.error('Lỗi lưu trữ dự án:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async layChiTietChinhSachCoc(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const chinhSachId = parseInt(req.params.id, 10);

      if (Number.isNaN(chinhSachId)) {
        return res.status(400).json({
          success: false,
          message: 'ID chính sách không hợp lệ'
        });
      }

      const chinhSach = await ChuDuAnModel.layChiTietChinhSachCoc(chuDuAnId, chinhSachId);

      if (!chinhSach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chính sách cọc hoặc bạn không có quyền truy cập'
        });
      }

      res.json({
        success: true,
        message: 'Lấy chi tiết chính sách cọc thành công',
        data: chinhSach
      });
    } catch (error) {
      console.error('Lỗi lấy chi tiết chính sách cọc:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async capNhatChinhSachCoc(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const chinhSachId = parseInt(req.params.id, 10);

      if (Number.isNaN(chinhSachId)) {
        return res.status(400).json({
          success: false,
          message: 'ID chính sách không hợp lệ'
        });
      }

      const allowedFields = [
        'TenChinhSach',
        'MoTa',
        'ChoPhepCocGiuCho',
        'TTL_CocGiuCho_Gio',
        'TyLePhat_CocGiuCho',
        'ChoPhepCocAnNinh',
        'SoTienCocAnNinhMacDinh',
        'QuyTacGiaiToa',
        'HieuLuc'
      ];

      const payload = {};
      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          payload[field] = req.body[field];
        }
      });

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có dữ liệu để cập nhật'
        });
      }

      const chinhSach = await ChuDuAnModel.capNhatChinhSachCoc(chuDuAnId, chinhSachId, payload);

      if (!chinhSach) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chính sách cọc hoặc bạn không có quyền truy cập'
        });
      }

      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'cap_nhat_chinh_sach_coc',
        'ChinhSachCoc',
        chinhSachId,
        null,
        payload,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Cập nhật chính sách cọc thành công',
        data: chinhSach
      });
    } catch (error) {
      console.error('Lỗi cập nhật chính sách cọc:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Lưu nháp tin đăng
   * POST /api/chu-du-an/tin-dang/nhap
   */
  static async luuNhapTinDang(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const tinDangData = {
        ...req.body,
        TrangThai: 'Nhap' // Đảm bảo trạng thái là Nháp
      };

      // Validate cơ bản (không yêu cầu đầy đủ như khi gửi duyệt)
      if (!tinDangData.DuAnID) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin dự án'
        });
      }

      const tinDangId = await ChuDuAnModel.taoTinDang(chuDuAnId, tinDangData);

      res.status(201).json({
        success: true,
        message: 'Lưu nháp thành công',
        tinDangId
      });
    } catch (error) {
      console.error('Lỗi lưu nháp tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * UC-PROJ-04: Báo cáo hợp đồng cho thuê
   * POST /api/chu-du-an/hop-dong/bao-cao
   */
  static async baoCaoHopDongChoThue(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const { phongId, khachHangId, thongTinHopDong } = req.body;

      if (!phongId || !khachHangId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin phòng hoặc khách hàng'
        });
      }

      // TODO: Implement logic báo cáo hợp đồng
      // - Kiểm tra quyền sở hữu phòng
      // - Kiểm tra trạng thái phòng (GiuCho)
      // - Kiểm tra giao dịch cọc hợp lệ
      // - Chuyển trạng thái phòng sang DaThue
      // - Chuẩn bị giải tỏa TiềnTạmGiữ

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'bao_cao_hop_dong_thue',
        'Phong',
        phongId,
        { trangThai: 'GiuCho' },
        { trangThai: 'DaThue', khachHangId, ...thongTinHopDong },
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Báo cáo hợp đồng cho thuê thành công',
        data: {
          phongId,
          khachHangId,
          trangThaiMoi: 'DaThue'
        }
      });
    } catch (error) {
      console.error('Lỗi báo cáo hợp đồng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Tạo nhanh dự án (dùng từ modal trong trang tạo tin đăng)
   * POST /api/chu-du-an/du-an/tao-nhanh
   */
  static async taoNhanhDuAn(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const { TenDuAn, DiaChi, ViDo, KinhDo, YeuCauPheDuyetChu, PhuongThucVao, TrangThai } = req.body;

      // Validate
      if (!TenDuAn || !TenDuAn.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Tên dự án không được để trống'
        });
      }

      if (!DiaChi || !DiaChi.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Địa chỉ không được để trống'
        });
      }

      // Nếu không yêu cầu phê duyệt thì phải có phương thức vào
      if (!YeuCauPheDuyetChu && (!PhuongThucVao || !PhuongThucVao.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Phương thức vào dự án là bắt buộc khi không yêu cầu phê duyệt'
        });
      }

      // Tạo dự án với thông tin đầy đủ (bao gồm tọa độ)
      const duAnId = await ChuDuAnModel.taoDuAn(chuDuAnId, {
        TenDuAn: TenDuAn.trim(),
        DiaChi: DiaChi.trim(),
        ViDo: ViDo || null,
        KinhDo: KinhDo || null,
        YeuCauPheDuyetChu: YeuCauPheDuyetChu ? 1 : 0,
        PhuongThucVao: YeuCauPheDuyetChu ? null : (PhuongThucVao ? PhuongThucVao.trim() : null),
        TrangThai: TrangThai || 'HoatDong'
      });

      // Lấy thông tin dự án vừa tạo
      const duAn = await ChuDuAnModel.layChiTietDuAn(duAnId, chuDuAnId);

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'tao_nhanh_du_an',
        'DuAn',
        duAnId,
        null,
        { tenDuAn: TenDuAn, diaChi: DiaChi },
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json({
        success: true,
        message: 'Tạo dự án thành công',
        duAn: duAn
      });
    } catch (error) {
      console.error('Lỗi tạo nhanh dự án:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Dashboard tổng quan cho chủ dự án
   * GET /api/chu-du-an/dashboard
   */
  static async layDashboard(req, res) {
    try {
      const chuDuAnId = req.user.id;
      
      // Lấy thống kê nhanh và dữ liệu cần thiết
      const [tinDangs, cuocHens, duAns, thongKeTong, thongKePhong] = await Promise.all([
        ChuDuAnModel.layDanhSachTinDang(chuDuAnId, { limit: 5 }),
        ChuDuAnModel.layDanhSachCuocHen(chuDuAnId, { limit: 10 }),
        ChuDuAnModel.layDanhSachDuAn(chuDuAnId),
        ChuDuAnModel.layBaoCaoHieuSuat(chuDuAnId),
        ChuDuAnModel.layThongKePhong(chuDuAnId)
      ]);

      const cuocHenSapToi = cuocHens.filter(ch => 
        new Date(ch.ThoiGianHen) > new Date() && 
        ['ChoXacNhan', 'DaXacNhan'].includes(ch.TrangThai)
      );

      const tongQuan = thongKeTong?.tongQuan || {};
      const tuongTac = thongKeTong?.tuongTac || {};
      const coc = thongKeTong?.coc || {};

      const summary = {
        tongTinDang: tongQuan.TongTinDang || 0,
        tinDangDangHoatDong: tongQuan.TinDangDaDang || 0,
        tinDangChoDuyet: tongQuan.TinDangChoDuyet || 0,
        tinDangNhap: tongQuan.TinDangNhap || 0,
        tinDangTamNgung: tongQuan.TinDangTamNgung || 0,
        tinDangDaDuyet: tongQuan.TinDangDaDuyet || 0,
        tinDangTuChoi: tongQuan.TinDangTuChoi || 0,
        giaTrungBinh: tongQuan.GiaTrungBinh || 0,
        tongDienTich: tongQuan.TongDienTich || 0,
        tongPhong: thongKePhong.TongPhong || 0,
        tongPhongTrong: thongKePhong.PhongTrong || 0,
        tongPhongDaThue: thongKePhong.PhongDaThue || 0,
        tongPhongGiuCho: thongKePhong.PhongGiuCho || 0,
        tongPhongDonDep: thongKePhong.PhongDonDep || 0,
        tongLuotXem: tuongTac.TongLuotXem || 0,
        tongYeuThich: tuongTac.TongYeuThich || 0,
        luotXemHomNay: tuongTac.LuotXemHomNay || 0,
        yeuThichHomNay: tuongTac.YeuThichHomNay || 0,
        tongGiaoDichCoc: coc.TongGiaoDichCoc || 0,
        tongTienCoc: coc.TongTienCoc || 0,
        doanhThuThang: coc.TongTienCocThangNay || 0
      };

      res.json({
        success: true,
        message: 'Lấy dashboard thành công',
        data: {
          summary,
          thongKeTong,
          thongKePhong,
          tinDangGanDay: tinDangs,
          cuocHenSapToi,
          duAns
        }
      });
    } catch (error) {
      console.error('Lỗi lấy dashboard:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Lấy tin đăng để chỉnh sửa
   * GET /api/chu-du-an/chinh-sua-tin-dang/:id
   */
  static async layTinDangDeChinhSua(req, res) {
    try {
      const tinDangId = req.params.id;
      const chuDuAnId = req.user.id;

      // Lấy chi tiết tin đăng
      const tinDang = await ChuDuAnModel.layChiTietTinDang(tinDangId, chuDuAnId);

      if (!tinDang) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng hoặc không có quyền truy cập'
        });
      }

      // Lấy danh sách phòng nếu có
      const danhSachPhong = await ChuDuAnModel.layDanhSachPhong(tinDangId);

      // Audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'xem_tin_dang_de_chinh_sua',
        'TinDang',
        tinDangId,
        null,
        null,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Lấy thông tin tin đăng thành công',
        data: {
          ...tinDang,
          DanhSachPhong: danhSachPhong
        }
      });
    } catch (error) {
      console.error('Lỗi lấy tin đăng để chỉnh sửa:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Cập nhật tin đăng (lưu nháp hoặc gửi duyệt)
   * PUT /api/chu-du-an/chinh-sua-tin-dang/:id
   */
  static async capNhatTinDang(req, res) {
    try {
      const tinDangId = req.params.id;
      const chuDuAnId = req.user.id;
      const updateData = req.body;
      const { action } = req.body; // 'save_draft' hoặc 'send_review'

      console.log('📥 Backend nhận dữ liệu cập nhật:', JSON.stringify(updateData, null, 2));

      // Validate ownership
      const tinDangCu = await ChuDuAnModel.layChiTietTinDang(tinDangId, chuDuAnId);
      if (!tinDangCu) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng hoặc không có quyền truy cập'
        });
      }

      if (!Array.isArray(updateData.PhongIDs) || updateData.PhongIDs.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tin đăng phải chọn ít nhất một phòng thuộc dự án'
        });
      }

      const phongIdsHopLe = updateData.PhongIDs.every(item => {
        if (typeof item === 'object') {
          return item && item.PhongID;
        }
        return !!item;
      });

      if (!phongIdsHopLe) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách phòng không hợp lệ'
        });
      }

      // Validate dữ liệu nếu gửi duyệt
      if (action === 'send_review') {
        if (!updateData.TieuDe || !updateData.DuAnID) {
          return res.status(400).json({
            success: false,
            message: 'Thiếu thông tin bắt buộc khi gửi duyệt'
          });
        }
      }

      // Cập nhật tin đăng
      const result = await ChuDuAnModel.capNhatTinDang(tinDangId, chuDuAnId, updateData);

      // Nếu gửi duyệt, chuyển trạng thái sang ChoDuyet
      if (action === 'send_review') {
        await ChuDuAnModel.guiTinDangDeDuyet(tinDangId, chuDuAnId);
        
        // Audit log
        await NhatKyHeThongService.ghiNhan(
          chuDuAnId,
          'gui_duyet_tin_dang',
          'TinDang',
          tinDangId,
          null,
          updateData,
          req.ip,
          req.get('User-Agent')
        );
      } else {
        // Audit log cho lưu nháp
        await NhatKyHeThongService.ghiNhan(
          chuDuAnId,
          'luu_nhap_tin_dang',
          'TinDang',
          tinDangId,
          null,
          updateData,
          req.ip,
          req.get('User-Agent')
        );
      }

      res.json({
        success: true,
        message: action === 'send_review' ? 'Gửi duyệt tin đăng thành công' : 'Lưu nháp thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi cập nhật tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Lấy danh sách tin nháp
   * GET /api/chu-du-an/tin-nhap
   */
  static async layDanhSachTinNhap(req, res) {
    try {
      const chuDuAnId = req.user.id;

      // Lấy danh sách tin đăng với trạng thái Nhap
      const tinNhaps = await ChuDuAnModel.layDanhSachTinDang(chuDuAnId, { 
        trangThai: 'Nhap',
        limit: 100
      });

      res.json({
        success: true,
        message: 'Lấy danh sách tin nháp thành công',
        data: tinNhaps
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách tin nháp:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Xóa tin đăng (chuyển sang trạng thái LuuTru)
   * DELETE /api/chu-du-an/tin-dang/:id
   * Body: { lyDoXoa: string } - Bắt buộc nếu tin đã duyệt/đang đăng
   */
  static async xoaTinDang(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const tinDangId = parseInt(req.params.id);
      const { lyDoXoa } = req.body;

      if (!tinDangId) {
        return res.status(400).json({
          success: false,
          message: 'ID tin đăng không hợp lệ'
        });
      }

      // Xóa tin đăng (chuyển sang LuuTru)
      const result = await ChuDuAnModel.xoaTinDang(tinDangId, chuDuAnId, lyDoXoa);

      // Audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'xoa_tin_dang',
        'TinDang',
        tinDangId,
        null,
        { TrangThai: 'LuuTru', LyDoXoa: lyDoXoa || 'Chủ dự án tự xóa' },
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Xóa tin đăng thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi xóa tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ChuDuAnController;
