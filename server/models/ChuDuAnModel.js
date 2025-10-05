/**
 * Model cho Chủ dự án
 * Quản lý các nghiệp vụ liên quan đến tin đăng, phòng, cuộc hẹn, cọc
 */

const db = require('../config/db');

/**
 * @typedef {Object} TinDang
 * @property {number} TinDangID
 * @property {number} DuAnID
 * @property {number} KhuVucID
 * @property {string} TieuDe
 * @property {string} MoTa
 * @property {number} Gia
 * @property {number} DienTich
 * @property {string} TrangThai - Nhap|ChoDuyet|DaDuyet|DaDang|TamNgung|TuChoi|LuuTru
 * @property {string} TaoLuc
 * @property {string} CapNhatLuc
 */

/**
 * @typedef {Object} CuocHen
 * @property {number} CuocHenID
 * @property {number} TinDangID
 * @property {number} KhachHangID
 * @property {number} NhanVienBanHangID
 * @property {string} TrangThai - DaYeuCau|ChoXacNhan|DaXacNhan|DaDoiLich|HuyBoiKhach|HuyBoiHeThong|KhachKhongDen|HoanThanh
 * @property {string} ThoiGianHen
 * @property {string} GhiChu
 */

class ChuDuAnModel {
  /**
   * Lấy danh sách tin đăng của chủ dự án
   * @param {number} chuDuAnId ID của chủ dự án
   * @param {Object} filters Bộ lọc tìm kiếm
   * @returns {Promise<TinDang[]>}
   */
  static async layDanhSachTinDang(chuDuAnId, filters = {}) {
    try {
      let query = `
        SELECT 
          td.TinDangID, td.DuAnID, td.KhuVucID, td.ChinhSachCocID,
          td.TieuDe, td.URL, td.MoTa, td.TienIch, td.GiaDien, td.GiaNuoc, td.GiaDichVu, td.MoTaGiaDichVu,
          td.Gia, td.DienTich, td.TrangThai,
          td.LyDoTuChoi, td.TaoLuc, td.CapNhatLuc, td.DuyetLuc,
          da.TenDuAn, kv.TenKhuVuc,
          (SELECT COUNT(*) FROM phong p WHERE p.TinDangID = td.TinDangID) as TongSoPhong,
          (SELECT COUNT(*) FROM phong p WHERE p.TinDangID = td.TinDangID AND p.TrangThai = 'Trong') as SoPhongTrong
        FROM tindang td
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        LEFT JOIN khuvuc kv ON td.KhuVucID = kv.KhuVucID
        WHERE da.ChuDuAnID = ?
        AND td.TrangThai != 'LuuTru'
      `;
      
      const params = [chuDuAnId];
      
      // Áp dụng bộ lọc
      if (filters.trangThai) {
        query += ' AND td.TrangThai = ?';
        params.push(filters.trangThai);
      }
      
      if (filters.duAnId) {
        query += ' AND td.DuAnID = ?';
        params.push(filters.duAnId);
      }
      
      if (filters.keyword) {
        query += ' AND (td.TieuDe LIKE ? OR td.MoTa LIKE ?)';
        params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
      }
      
      query += ' ORDER BY td.CapNhatLuc DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách tin đăng: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chi tiết tin đăng
   * @param {number} tinDangId ID của tin đăng
   * @param {number} chuDuAnId ID của chủ dự án (để kiểm tra quyền sở hữu)
   * @returns {Promise<TinDang>}
   */
  static async layChiTietTinDang(tinDangId, chuDuAnId) {
    try {
      // Query chi tiết tin đăng
      let query = `
        SELECT 
          td.*, da.TenDuAn, da.DiaChi as DiaChiDuAn, da.ViDo, da.KinhDo,
          kv.TenKhuVuc, csc.TenChinhSach, csc.MoTa as MoTaChinhSach,
          nd.TenDayDu as TenChuDuAn, nd.Email as EmailChuDuAn,
          (SELECT COUNT(*) FROM phong p WHERE p.TinDangID = td.TinDangID) as TongSoPhong,
          (SELECT COUNT(*) FROM phong p WHERE p.TinDangID = td.TinDangID AND p.TrangThai = 'Trong') as SoPhongTrong
        FROM tindang td
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        LEFT JOIN khuvuc kv ON td.KhuVucID = kv.KhuVucID
        LEFT JOIN chinhsachcoc csc ON td.ChinhSachCocID = csc.ChinhSachCocID
        LEFT JOIN nguoidung nd ON da.ChuDuAnID = nd.NguoiDungID
        WHERE td.TinDangID = ?
      `;
      
      const params = [tinDangId];
      
      // Nếu có chuDuAnId, kiểm tra ownership
      if (chuDuAnId) {
        query += ' AND da.ChuDuAnID = ?';
        params.push(chuDuAnId);
      }
      
      const [rows] = await db.execute(query, params);
      const tinDang = rows[0] || null;

      if (!tinDang) {
        return null;
      }

      // Nếu tin đăng có nhiều phòng, lấy danh sách phòng chi tiết
      if (tinDang.TongSoPhong > 1) {
        const [phongRows] = await db.execute(`
          SELECT 
            PhongID, TenPhong, Gia, DienTich, TrangThai, 
            URL, GhiChu as MoTa, TaoLuc, CapNhatLuc
          FROM phong
          WHERE TinDangID = ?
          ORDER BY TenPhong ASC
        `, [tinDangId]);

        tinDang.DanhSachPhong = phongRows;
      } else {
        tinDang.DanhSachPhong = [];
      }

      return tinDang;
    } catch (error) {
      throw new Error(`Lỗi khi lấy chi tiết tin đăng: ${error.message}`);
    }
  }

  /**
   * Tạo tin đăng mới
   * @param {number} chuDuAnId ID của chủ dự án
   * @param {Object} tinDangData Dữ liệu tin đăng
   * @returns {Promise<number>} ID của tin đăng vừa tạo
   */
  static async taoTinDang(chuDuAnId, tinDangData) {
    try {
      // Kiểm tra quyền sở hữu dự án
      const [duAnRows] = await db.execute(
        'SELECT DuAnID FROM duan WHERE DuAnID = ? AND ChuDuAnID = ? AND TrangThai = "HoatDong"',
        [tinDangData.DuAnID, chuDuAnId]
      );
      
      if (duAnRows.length === 0) {
        throw new Error('Không có quyền tạo tin đăng cho dự án này hoặc dự án không hoạt động');
      }

      const query = `
        INSERT INTO tindang (
          DuAnID, KhuVucID, ChinhSachCocID, TieuDe, URL, MoTa, 
          TienIch, GiaDien, GiaNuoc, GiaDichVu, MoTaGiaDichVu,
          Gia, DienTich, TrangThai
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        tinDangData.DuAnID,
        tinDangData.KhuVucID,
        tinDangData.ChinhSachCocID || 1,
        tinDangData.TieuDe,
        JSON.stringify(tinDangData.URL || []),
        tinDangData.MoTa,
        // Các trường mới
        JSON.stringify(tinDangData.TienIch || []),
        tinDangData.GiaDien || null,
        tinDangData.GiaNuoc || null,
        tinDangData.GiaDichVu || null,
        tinDangData.MoTaGiaDichVu || null,
        tinDangData.Gia,
        tinDangData.DienTich,
        tinDangData.TrangThai || 'Nhap'
      ]);
      
      // Nếu có Phongs, tạo các phòng
      if (tinDangData.Phongs && tinDangData.Phongs.length > 0) {
        for (const phong of tinDangData.Phongs) {
          await db.execute(
            'INSERT INTO phong (TinDangID, TenPhong, Gia, DienTich, TrangThai, GhiChu, URL) VALUES (?, ?, ?, ?, "Trong", ?, ?)', 
            [
              result.insertId, 
              phong.tenPhong, 
              phong.gia, 
              phong.dienTich, 
              phong.ghiChu || null,
              phong.url || null
            ]
          );
        }
      }

      return result.insertId;
    } catch (error) {
      throw new Error(`Lỗi khi tạo tin đăng: ${error.message}`);
    }
  }

  /**
   * Cập nhật tin đăng
   * @param {number} tinDangId ID của tin đăng
   * @param {number} chuDuAnId ID của chủ dự án
   * @param {Object} updateData Dữ liệu cập nhật
   * @returns {Promise<boolean>}
   */
  static async capNhatTinDang(tinDangId, chuDuAnId, updateData) {
    try {
      // Kiểm tra quyền sở hữu
      const tinDang = await this.layChiTietTinDang(tinDangId, chuDuAnId);
      if (!tinDang) {
        throw new Error('Không tìm thấy tin đăng hoặc không có quyền chỉnh sửa');
      }

      // Chỉ KHÔNG cho phép cập nhật khi ở trạng thái LuuTru (đã xóa/lưu trữ)
      if (tinDang.TrangThai === 'LuuTru') {
        throw new Error('Không thể chỉnh sửa tin đăng đã bị xóa (Lưu trữ)');
      }

      const allowedFields = ['TieuDe', 'MoTa', 'Gia', 'DienTich', 'URL', 'KhuVucID', 'ChinhSachCocID', 'TienIch', 'GiaDien', 'GiaNuoc', 'GiaDichVu', 'MoTaGiaDichVu'];
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          // Serialize JSON cho URL và TienIch
          if (key === 'URL' || key === 'TienIch') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('Không có trường nào được cập nhật');
      }

      values.push(tinDangId);
      
      const query = `UPDATE tindang SET ${updates.join(', ')}, TrangThai = 'Nhap' WHERE TinDangID = ?`;
      await db.execute(query, values);
      
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật tin đăng: ${error.message}`);
    }
  }

  /**
   * Gửi tin đăng để duyệt
   * @param {number} tinDangId ID của tin đăng
   * @param {number} chuDuAnId ID của chủ dự án
   * @returns {Promise<boolean>}
   */
  static async guiTinDangDeDuyet(tinDangId, chuDuAnId) {
    try {
      const tinDang = await this.layChiTietTinDang(tinDangId, chuDuAnId);
      if (!tinDang) {
        throw new Error('Không tìm thấy tin đăng');
      }

      // Chỉ KHÔNG cho phép gửi duyệt khi ở trạng thái LuuTru (đã xóa)
      if (tinDang.TrangThai === 'LuuTru') {
        throw new Error('Không thể gửi duyệt tin đăng đã bị xóa (Lưu trữ)');
      }

      // Kiểm tra đầy đủ thông tin
      if (!tinDang.TieuDe || !tinDang.MoTa) {
        throw new Error('Vui lòng điền đầy đủ Tiêu đề và Mô tả');
      }

      // Kiểm tra phòng: Nếu có Gia/DienTich thì OK (phòng đơn), nếu không thì phải có ít nhất 1 phòng trong bảng phong
      const hasGiaVaDienTich = tinDang.Gia && tinDang.DienTich;
      
      if (!hasGiaVaDienTich) {
        // Tin đăng nhiều phòng: Kiểm tra phải có ít nhất 1 phòng
        const [phongRows] = await db.execute(
          'SELECT COUNT(*) as SoPhong FROM phong WHERE TinDangID = ?',
          [tinDangId]
        );
        
        if (phongRows[0].SoPhong === 0) {
          throw new Error('Vui lòng thêm ít nhất 1 phòng hoặc điền Giá và Diện tích');
        }
      }

      await db.execute(
        'UPDATE tindang SET TrangThai = "ChoDuyet" WHERE TinDangID = ?',
        [tinDangId]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi gửi tin đăng để duyệt: ${error.message}`);
    }
  }

  /**
   * Xóa tin đăng (chuyển sang trạng thái LuuTru)
   * @param {number} tinDangId ID của tin đăng
   * @param {number} chuDuAnId ID của chủ dự án
   * @param {string} lyDoXoa Lý do xóa (bắt buộc nếu tin đã duyệt/đang đăng)
   * @returns {Promise<boolean>}
   */
  static async xoaTinDang(tinDangId, chuDuAnId, lyDoXoa = null) {
    try {
      // Kiểm tra quyền sở hữu
      const tinDang = await this.layChiTietTinDang(tinDangId, chuDuAnId);
      if (!tinDang) {
        throw new Error('Không tìm thấy tin đăng hoặc không có quyền xóa');
      }

      // Nếu tin đã duyệt hoặc đang đăng → BẮT BUỘC phải có lý do xóa
      if (['DaDuyet', 'DaDang'].includes(tinDang.TrangThai)) {
        if (!lyDoXoa || lyDoXoa.trim().length < 10) {
          throw new Error('Vui lòng nhập lý do xóa (tối thiểu 10 ký tự) vì tin đăng đã được duyệt/đang đăng');
        }
      }

      // Chuyển sang trạng thái LuuTru (soft delete) và lưu lý do
      await db.execute(
        'UPDATE tindang SET TrangThai = "LuuTru", LyDoTuChoi = ? WHERE TinDangID = ?',
        [lyDoXoa || 'Chủ dự án tự xóa', tinDangId]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xóa tin đăng: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách cuộc hẹn của chủ dự án
   * @param {number} chuDuAnId ID của chủ dự án
   * @param {Object} filters Bộ lọc
   * @returns {Promise<CuocHen[]>}
   */
  static async layDanhSachCuocHen(chuDuAnId, filters = {}) {
    try {
      let query = `
        SELECT 
          ch.CuocHenID, p.PhongID, ch.KhachHangID, ch.NhanVienBanHangID,
          ch.TrangThai, ch.ThoiGianHen, ch.GhiChuKetQua as GhiChu, ch.TaoLuc,
          td.TieuDe as TieuDeTinDang, td.Gia, p.TenPhong,
          kh.TenDayDu as TenKhachHang, kh.SoDienThoai as SDTKhachHang,
          nv.TenDayDu as TenNhanVien, nv.SoDienThoai as SDTNhanVien
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN tindang td ON p.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        LEFT JOIN nguoidung kh ON ch.KhachHangID = kh.NguoiDungID
        LEFT JOIN nguoidung nv ON ch.NhanVienBanHangID = nv.NguoiDungID
        WHERE da.ChuDuAnID = ?
      `;
      
      const params = [chuDuAnId];
      
      if (filters.trangThai) {
        query += ' AND ch.TrangThai = ?';
        params.push(filters.trangThai);
      }
      
      if (filters.tinDangId) {
        query += ' AND td.TinDangID = ?';
        params.push(filters.tinDangId);
      }
      
      if (filters.tuNgay && filters.denNgay) {
        query += ' AND ch.ThoiGianHen BETWEEN ? AND ?';
        params.push(filters.tuNgay, filters.denNgay);
      }
      
      query += ' ORDER BY ch.ThoiGianHen DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách cuộc hẹn: ${error.message}`);
    }
  }

  /**
   * Xác nhận cuộc hẹn
   * @param {number} cuocHenId ID của cuộc hẹn
   * @param {number} chuDuAnId ID của chủ dự án
   * @param {string} ghiChu Ghi chú xác nhận
   * @returns {Promise<boolean>}
   */
  static async xacNhanCuocHen(cuocHenId, chuDuAnId, ghiChu = '') {
    try {
      // Kiểm tra quyền sở hữu cuộc hẹn (join đúng qua phong → tindang → duan)
      const [rows] = await db.execute(`
        SELECT ch.TrangThai 
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN tindang td ON p.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE ch.CuocHenID = ? AND da.ChuDuAnID = ?
      `, [cuocHenId, chuDuAnId]);
      
      if (rows.length === 0) {
        throw new Error('Không tìm thấy cuộc hẹn hoặc không có quyền xác nhận');
      }

      if (rows[0].TrangThai !== 'ChoXacNhan') {
        throw new Error('Chỉ có thể xác nhận cuộc hẹn ở trạng thái Chờ xác nhận');
      }

      await db.execute(
        'UPDATE cuochen SET TrangThai = "DaXacNhan", GhiChuKetQua = CONCAT(IFNULL(GhiChuKetQua, ""), ?, "\n[Xác nhận bởi chủ dự án]") WHERE CuocHenID = ?',
        [ghiChu, cuocHenId]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi xác nhận cuộc hẹn: ${error.message}`);
    }
  }

  /**
   * Lấy báo cáo hiệu suất tin đăng
   * @param {number} chuDuAnId ID của chủ dự án
   * @param {Object} filters Bộ lọc thời gian
   * @returns {Promise<Object>}
   */
  static async layBaoCaoHieuSuat(chuDuAnId, filters = {}) {
    try {
      const { tuNgay, denNgay } = filters;
      let dateFilter = '';
      const params = [chuDuAnId];
      
      if (tuNgay && denNgay) {
        dateFilter = 'AND td.TaoLuc BETWEEN ? AND ?';
        params.push(tuNgay, denNgay);
      }

      // Thống kê tổng quan
      const [tongQuanRows] = await db.execute(`
        SELECT 
          COUNT(*) as TongTinDang,
          COUNT(CASE WHEN td.TrangThai = 'DaDang' THEN 1 END) as TinDangDaDang,
          COUNT(CASE WHEN td.TrangThai = 'ChoDuyet' THEN 1 END) as TinDangChoDuyet,
          AVG(td.Gia) as GiaTrungBinh,
          SUM(td.DienTich) as TongDienTich
        FROM tindang td
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE da.ChuDuAnID = ? 
        AND td.TrangThai != 'LuuTru' ${dateFilter}
      `, params);

      // Thống kê cuộc hẹn
      const [cuocHenRows] = await db.execute(`
        SELECT 
          COUNT(*) as TongCuocHen,
          COUNT(CASE WHEN ch.TrangThai = 'DaXacNhan' THEN 1 END) as CuocHenDaXacNhan,
          COUNT(CASE WHEN ch.TrangThai = 'HoanThanh' THEN 1 END) as CuocHenHoanThanh,
          COUNT(CASE WHEN ch.TrangThai IN ('HuyBoiKhach', 'KhachKhongDen') THEN 1 END) as CuocHenHuy
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN tindang td ON p.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE da.ChuDuAnID = ? ${dateFilter}
      `, params);

      // Thống kê cọc
      const [cocRows] = await db.execute(`
        SELECT 
          COUNT(*) as TongGiaoDichCoc,
          SUM(CASE WHEN c.TrangThai = 'DaThanhToan' THEN c.SoTien ELSE 0 END) as TongTienCoc,
          COUNT(CASE WHEN c.Loai = 'CocGiuCho' THEN 1 END) as CocGiuCho,
          COUNT(CASE WHEN c.Loai = 'CocAnNinh' THEN 1 END) as CocAnNinh
        FROM coc c
        INNER JOIN tindang td ON c.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE da.ChuDuAnID = ? ${dateFilter}
      `, params);

      return {
        tongQuan: tongQuanRows[0] || {},
        cuocHen: cuocHenRows[0] || {},
        coc: cocRows[0] || {},
        thoiGianBaoCao: {
          tuNgay: tuNgay || null,
          denNgay: denNgay || null,
          taoLuc: new Date()
        }
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy báo cáo hiệu suất: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách dự án của chủ dự án
   * @param {number} chuDuAnId ID của chủ dự án
   * @returns {Promise<Array>}
   */
  static async layDanhSachDuAn(chuDuAnId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          DuAnID, TenDuAn, DiaChi, TrangThai, 
          ViDo, KinhDo,
          TaoLuc, CapNhatLuc,
          (SELECT COUNT(*) FROM tindang WHERE DuAnID = da.DuAnID AND TrangThai != 'LuuTru') as SoTinDang
        FROM duan da
        WHERE ChuDuAnID = ?
        ORDER BY TrangThai DESC, CapNhatLuc DESC
      `, [chuDuAnId]);
      
      return rows;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách dự án: ${error.message}`);
    }
  }

  static async layDanhSachKhuVuc(parentId = null) {
    try {
      const query = `
        SELECT KhuVucID, TenKhuVuc, ParentKhuVucID
        FROM khuvuc
        WHERE ParentKhuVucID ${parentId === null ? 'IS NULL' : '= ?'}
        ORDER BY TenKhuVuc ASC
      `;
      const params = parentId !== null ? [parentId] : [];
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách khu vực: ${error.message}`);
    }
  }

  static async layChiTietDuAn(duAnId, chuDuAnId) {
    try {
      const query = `
        SELECT 
          d.DuAnID,
          d.TenDuAn,
          d.DiaChi,
          d.ChuDuAnID,
          d.YeuCauPheDuyetChu,
          d.TrangThai,
          d.TaoLuc,
          d.CapNhatLuc
        FROM duan d
        WHERE d.DuAnID = ? AND d.ChuDuAnID = ?
      `;
      const [rows] = await db.execute(query, [duAnId, chuDuAnId]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Lỗi lấy chi tiết dự án: ${error.message}`);
    }
  }

  /**
   * Tạo dự án mới
   */
  static async taoDuAn(chuDuAnId, data) {
    try {
      // Kiểm tra trùng địa chỉ
      const [existingProjects] = await db.execute(
        `SELECT DuAnID, TenDuAn FROM duan 
         WHERE ChuDuAnID = ? AND DiaChi = ? AND TrangThai != 'LuuTru'`,
        [chuDuAnId, data.DiaChi]
      );

      if (existingProjects.length > 0) {
        throw new Error(`Địa chỉ này đã được sử dụng cho dự án "${existingProjects[0].TenDuAn}". Vui lòng sử dụng địa chỉ khác.`);
      }

      const [result] = await db.execute(
        `INSERT INTO duan (TenDuAn, DiaChi, ViDo, KinhDo, ChuDuAnID, YeuCauPheDuyetChu, PhuongThucVao, TrangThai, TaoLuc, CapNhatLuc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          data.TenDuAn, 
          data.DiaChi || '', 
          data.ViDo || null,
          data.KinhDo || null,
          chuDuAnId,
          data.YeuCauPheDuyetChu || 0,
          data.PhuongThucVao || null,
          data.TrangThai || 'HoatDong'
        ]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Lỗi tạo dự án: ${error.message}`);
    }
  }

  static async taoDuAnNhanh(data) {
    try {
      // Kiểm tra trùng địa chỉ
      const [existingProjects] = await db.execute(
        `SELECT DuAnID, TenDuAn FROM duan 
         WHERE ChuDuAnID = ? AND DiaChi = ? AND TrangThai != 'LuuTru'`,
        [data.ChuDuAnID, data.DiaChi]
      );

      if (existingProjects.length > 0) {
        throw new Error(`Địa chỉ này đã được sử dụng cho dự án "${existingProjects[0].TenDuAn}". Vui lòng sử dụng địa chỉ khác.`);
      }

      const [result] = await db.execute(
        `INSERT INTO duan (TenDuAn, DiaChi, ChuDuAnID, TrangThai, TaoLuc, CapNhatLuc)
         VALUES (?, ?, ?, 'HoatDong', NOW(), NOW())`,
        [data.TenDuAn, data.DiaChi || '', data.ChuDuAnID]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Lỗi tạo dự án: ${error.message}`);
    }
  }
  
  /**
   * Lấy danh sách phòng của tin đăng
   * @param {number} tinDangId ID của tin đăng
   * @returns {Promise<Array>}
   */
  static async layDanhSachPhong(tinDangId) {
    try {
      const [rows] = await db.execute(
        `SELECT PhongID, TinDangID, TenPhong, TrangThai, Gia, DienTich, GhiChu, URL, TaoLuc, CapNhatLuc
         FROM phong 
         WHERE TinDangID = ?
         ORDER BY TenPhong`,
        [tinDangId]
      );
      return rows;
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách phòng: ${error.message}`);
    }
  }
}

module.exports = ChuDuAnModel;