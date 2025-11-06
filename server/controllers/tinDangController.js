/**
 * Controller cho Tin đăng
 * Xử lý các nghiệp vụ liên quan đến tin đăng cho thuê
 * Tách từ ChuDuAnController.js theo domain-driven design
 */

const TinDangModel = require('../models/TinDangModel');
const NhatKyHeThongService = require('../services/NhatKyHeThongService');

class TinDangController {
  /**
   * UC-PROJ-01: Tạo tin đăng mới
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

      const tinDangId = await TinDangModel.taoTinDang(chuDuAnId, tinDangData);

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

      const danhSach = await TinDangModel.layDanhSachTinDang(chuDuAnId, filters);

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
      const chuDuAnId = req.user ? req.user.id : null;
      const tinDangId = parseInt(req.params.id);

      const tinDang = await TinDangModel.layChiTietTinDang(tinDangId, chuDuAnId);

      if (!tinDang) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
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
      const danhSachPhong = await TinDangModel.layDanhSachPhong(tinDangId);

      res.json({
        success: true,
        data: danhSachPhong
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

      const success = await TinDangModel.capNhatTinDang(tinDangId, chuDuAnId, updateData);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'cap_nhat_tin_dang',
        'TinDang',
        tinDangId,
        null,
        updateData,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Cập nhật tin đăng thành công'
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
   * UC-PROJ-01: Gửi tin đăng để duyệt
   * POST /api/chu-du-an/tin-dang/:id/gui-duyet
   */
  static async guiTinDangDeDuyet(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const tinDangId = parseInt(req.params.id);

      const success = await TinDangModel.guiTinDangDeDuyet(tinDangId, chuDuAnId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

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
    } catch (error) {
      console.error('Lỗi gửi tin đăng để duyệt:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Lưu nháp tin đăng
   * PUT /api/chu-du-an/tin-dang/:id/luu-nhap
   */
  static async luuNhapTinDang(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const tinDangId = parseInt(req.params.id);
      const updateData = { ...req.body, action: 'save_draft' };

      const success = await TinDangModel.capNhatTinDang(tinDangId, chuDuAnId, updateData);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      res.json({
        success: true,
        message: 'Lưu nháp tin đăng thành công'
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
   * Lấy tin đăng để chỉnh sửa
   * GET /api/chu-du-an/tin-dang/:id/chinh-sua
   */
  static async layTinDangDeChinhSua(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const tinDangId = parseInt(req.params.id);

      const tinDang = await TinDangModel.layChiTietTinDang(tinDangId, chuDuAnId);

      if (!tinDang) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      res.json({
        success: true,
        data: tinDang
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
   * Lấy danh sách tin nháp
   * GET /api/chu-du-an/tin-nhap
   */
  static async layDanhSachTinNhap(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const filters = {
        trangThai: 'Nhap',
        limit: req.query.limit || 20
      };

      const danhSach = await TinDangModel.layDanhSachTinDang(chuDuAnId, filters);

      res.json({
        success: true,
        data: danhSach
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
   * Xóa tin đăng
   * DELETE /api/chu-du-an/tin-dang/:id
   */
  static async xoaTinDang(req, res) {
    try {
      const chuDuAnId = req.user.id;
      const tinDangId = parseInt(req.params.id);
      const { lyDoXoa } = req.body;

      const success = await TinDangModel.xoaTinDang(tinDangId, chuDuAnId, lyDoXoa);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan(
        chuDuAnId,
        'xoa_tin_dang',
        'TinDang',
        tinDangId,
        null,
        { trangThai: 'LuuTru', lyDoXoa },
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Xóa tin đăng thành công'
      });
    } catch (error) {
      console.error('Lỗi xóa tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== API methods cho routes từ upstream (tinDangRoutes.js) =====
  
  /**
   * Lấy tất cả tin đăng (public API)
   * GET /api/tindangs
   */
  static async getAll(req, res) {
    try {
      const filters = {
        trangThai: req.query.trangThai,
        keyword: req.query.keyword,
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0
      };

      const danhSach = await TinDangModel.layDanhSachTinDang(null, filters);

      res.json({
        success: true,
        data: danhSach,
        total: danhSach.length
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
   * Tạo tin đăng mới (public API)
   * POST /api/tindangs
   */
  static async create(req, res) {
    try {
      const tinDangData = req.body;

      if (!tinDangData.DuAnID || !tinDangData.TieuDe) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: DuAnID, TieuDe'
        });
      }

      const chuDuAnId = tinDangData.ChuDuAnID || req.user?.id;
      if (!chuDuAnId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ChuDuAnID'
        });
      }

      const tinDangId = await TinDangModel.taoTinDang(chuDuAnId, tinDangData);

      res.status(201).json({
        success: true,
        message: 'Tạo tin đăng thành công',
        data: { id: tinDangId }
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
   * Lấy tin đăng theo ID (public API)
   * GET /api/tindangs/:id
   */
  static async getById(req, res) {
    try {
      const tinDangId = parseInt(req.params.id);
      const tinDang = await TinDangModel.layChiTietTinDang(tinDangId, null);

      if (!tinDang) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      res.json({
        success: true,
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
   * Cập nhật tin đăng (public API)
   * PUT /api/tindangs/:id
   */
  static async update(req, res) {
    try {
      const tinDangId = parseInt(req.params.id);
      const updateData = req.body;
      const chuDuAnId = updateData.ChuDuAnID || req.user?.id;

      if (!chuDuAnId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ChuDuAnID'
        });
      }

      const success = await TinDangModel.capNhatTinDang(tinDangId, chuDuAnId, updateData);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật tin đăng thành công'
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
   * Xóa tin đăng (public API)
   * DELETE /api/tindangs/:id
   */
  static async delete(req, res) {
    try {
      const tinDangId = parseInt(req.params.id);
      const chuDuAnId = req.body.ChuDuAnID || req.user?.id;

      if (!chuDuAnId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin ChuDuAnID'
        });
      }

      const success = await TinDangModel.xoaTinDang(tinDangId, chuDuAnId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      res.json({
        success: true,
        message: 'Xóa tin đăng thành công'
      });
    } catch (error) {
      console.error('Lỗi xóa tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Duyệt tin đăng (public API)
   * POST /api/tindangs/:id/approve
   */
  static async approve(req, res) {
    try {
      const tinDangId = parseInt(req.params.id);
      const { approved, reason } = req.body;

      // Tìm tin đăng và cập nhật trạng thái
      const tinDang = await TinDangModel.layChiTietTinDang(tinDangId, null);
      
      if (!tinDang) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      const trangThai = approved ? 'DaDuyet' : 'TuChoi';
      const success = await TinDangModel.capNhatTinDang(tinDangId, tinDang.ChuDuAnID, {
        trangThai,
        lyDoTuChoi: reason || null
      });

      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Không thể cập nhật trạng thái tin đăng'
        });
      }

      res.json({
        success: true,
        message: approved ? 'Đã duyệt tin đăng' : 'Đã từ chối tin đăng'
      });
    } catch (error) {
      console.error('Lỗi duyệt tin đăng:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = TinDangController;
