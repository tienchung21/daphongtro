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
      console.log('🗄️ [MODEL] layDanhSachTinDang called with:', { chuDuAnId, filters });

      let query = `
        SELECT 
          td.TinDangID, td.DuAnID, td.KhuVucID, td.ChinhSachCocID,
          td.TieuDe, td.URL, td.MoTa, td.TienIch, td.GiaDien, td.GiaNuoc, td.GiaDichVu, td.MoTaGiaDichVu,
          (
            SELECT MIN(COALESCE(pt.GiaTinDang, p.GiaChuan))
            FROM phong_tindang pt
            JOIN phong p ON pt.PhongID = p.PhongID
            WHERE pt.TinDangID = td.TinDangID
          ) as Gia,
          (
            SELECT MIN(COALESCE(pt.DienTichTinDang, p.DienTichChuan))
            FROM phong_tindang pt
            JOIN phong p ON pt.PhongID = p.PhongID
            WHERE pt.TinDangID = td.TinDangID
          ) as DienTich,
          td.TrangThai,
          td.LyDoTuChoi, td.TaoLuc, td.CapNhatLuc, td.DuyetLuc,
          da.TenDuAn, da.DiaChi AS DiaChi, kv.TenKhuVuc,
          (SELECT COUNT(*) FROM phong_tindang pt WHERE pt.TinDangID = td.TinDangID) as TongSoPhong,
          (SELECT COUNT(*) FROM phong_tindang pt 
           JOIN phong p ON pt.PhongID = p.PhongID 
           WHERE pt.TinDangID = td.TinDangID AND p.TrangThai = 'Trong') as SoPhongTrong
        FROM tindang td
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        LEFT JOIN khuvuc kv ON td.KhuVucID = kv.KhuVucID
        WHERE da.ChuDuAnID = ?
        AND td.TrangThai != 'LuuTru'
      `;
      
      const params = [chuDuAnId];
      
      console.log('🗄️ [MODEL] Query params:', params);
      
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
      
      console.log('🗄️ [MODEL] Final query:', query.replace(/\s+/g, ' '));
      console.log('🗄️ [MODEL] Final params:', params);

      const [rows] = await db.execute(query, params);

      console.log('🗄️ [MODEL] Query returned:', rows.length, 'rows');
      if (rows.length > 0) {
        console.log('🗄️ [MODEL] Sample record:', JSON.stringify(rows[0]));
      }

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
          td.TinDangID, td.DuAnID, td.KhuVucID, td.ChinhSachCocID,
          td.TieuDe, td.URL, td.MoTa, td.TienIch, td.GiaDien, td.GiaNuoc, td.GiaDichVu, td.MoTaGiaDichVu,
          (
            SELECT MIN(COALESCE(pt.GiaTinDang, p.GiaChuan))
            FROM phong_tindang pt
            JOIN phong p ON pt.PhongID = p.PhongID
            WHERE pt.TinDangID = td.TinDangID
          ) as Gia,
          (
            SELECT MIN(COALESCE(pt.DienTichTinDang, p.DienTichChuan))
            FROM phong_tindang pt
            JOIN phong p ON pt.PhongID = p.PhongID
            WHERE pt.TinDangID = td.TinDangID
          ) as DienTich,
          td.TrangThai, td.LyDoTuChoi, td.TaoLuc, td.CapNhatLuc, td.DuyetLuc,
          da.TenDuAn, da.DiaChi as DiaChiDuAn, da.ViDo, da.KinhDo,
          kv.TenKhuVuc, csc.TenChinhSach, csc.MoTa as MoTaChinhSach,
          nd.TenDayDu as TenChuDuAn, nd.Email as EmailChuDuAn,
          (SELECT COUNT(*) FROM phong_tindang pt WHERE pt.TinDangID = td.TinDangID) as TongSoPhong,
          (SELECT COUNT(*) FROM phong_tindang pt
           JOIN phong p ON pt.PhongID = p.PhongID
           WHERE pt.TinDangID = td.TinDangID AND p.TrangThai = 'Trong') as SoPhongTrong
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

      // Lấy danh sách phòng từ bảng phong_tindang
      const [phongRows] = await db.execute(`
        SELECT 
          p.PhongID, p.TenPhong, p.TrangThai,
          COALESCE(pt.GiaTinDang, p.GiaChuan) as Gia,
          COALESCE(pt.DienTichTinDang, p.DienTichChuan) as DienTich,
          COALESCE(pt.HinhAnhTinDang, p.HinhAnhPhong) as URL,
          COALESCE(pt.MoTaTinDang, p.MoTaPhong) as MoTa,
          p.GiaChuan, p.DienTichChuan,
          pt.GiaTinDang as GiaOverride,
          pt.DienTichTinDang as DienTichOverride,
          pt.ThuTuHienThi,
          p.TaoLuc, p.CapNhatLuc
        FROM phong_tindang pt
        JOIN phong p ON pt.PhongID = p.PhongID
        WHERE pt.TinDangID = ?
        ORDER BY pt.ThuTuHienThi, p.TenPhong ASC
      `, [tinDangId]);

      tinDang.DanhSachPhong = phongRows;

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
          TrangThai
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        tinDangData.TrangThai || 'Nhap'
      ]);

      const tinDangID = result.insertId;
      
      // Nếu có PhongIDs, thêm mapping vào phong_tindang
      if (tinDangData.PhongIDs && tinDangData.PhongIDs.length > 0) {
        const PhongModel = require('./PhongModel');
        
        // Chuẩn bị danh sách phòng để thêm vào tin đăng
        const danhSachPhong = tinDangData.PhongIDs.map(item => ({
          PhongID: item.PhongID || item,
          GiaTinDang: item.GiaTinDang || null,
          DienTichTinDang: item.DienTichTinDang || null,
          MoTaTinDang: item.MoTaTinDang || null,
          HinhAnhTinDang: item.HinhAnhTinDang || null,
          ThuTuHienThi: item.ThuTuHienThi || 0
        }));
        
        await PhongModel.themPhongVaoTinDang(tinDangID, chuDuAnId, danhSachPhong);
      }

      return tinDangID;
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

      const allowedFields = ['TieuDe', 'MoTa', 'URL', 'KhuVucID', 'ChinhSachCocID', 'TienIch', 'GiaDien', 'GiaNuoc', 'GiaDichVu', 'MoTaGiaDichVu'];
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

      const shouldResetStatus = updateData.action !== 'send_review';
      if (updates.length > 0) {
        values.push(tinDangId);
        const trangThaiClause = shouldResetStatus ? `, TrangThai = 'Nhap'` : '';
        const query = `UPDATE tindang SET ${updates.join(', ')}` + trangThaiClause + ' WHERE TinDangID = ?';
        await db.execute(query, values);
      } else if (shouldResetStatus) {
        await db.execute(
          'UPDATE tindang SET TrangThai = \'Nhap\' WHERE TinDangID = ?',
          [tinDangId]
        );
      }

      if (Array.isArray(updateData.PhongIDs)) {
        const PhongModel = require('./PhongModel');
        const phongIds = updateData.PhongIDs
          .map(item => {
            const rawId = typeof item === 'object' ? item.PhongID : item;
            return rawId ? parseInt(rawId, 10) : null;
          })
          .filter(id => !!id);

        if (phongIds.length === 0) {
          throw new Error('Tin đăng phải có ít nhất một phòng được gắn vào');
        }

        const placeholders = phongIds.map(() => '?').join(', ');
        await db.execute(
          `DELETE FROM phong_tindang WHERE TinDangID = ? AND PhongID NOT IN (${placeholders})`,
          [tinDangId, ...phongIds]
        );

        const danhSachPhong = updateData.PhongIDs.map(item => ({
          PhongID: item.PhongID || item,
          GiaTinDang: item.GiaTinDang || null,
          DienTichTinDang: item.DienTichTinDang || null,
          MoTaTinDang: item.MoTaTinDang || null,
          HinhAnhTinDang: item.HinhAnhTinDang || null,
          ThuTuHienThi: item.ThuTuHienThi || 0
        }));

        await PhongModel.themPhongVaoTinDang(tinDangId, chuDuAnId, danhSachPhong);
      }

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

      // Tin đăng bắt buộc phải gắn với ít nhất một phòng
      const [phongRows] = await db.execute(
        'SELECT COUNT(*) as SoPhong FROM phong_tindang WHERE TinDangID = ?',
        [tinDangId]
      );

      if ((phongRows[0]?.SoPhong || 0) === 0 && (!updateData.PhongIDs || updateData.PhongIDs.length === 0)) {
        throw new Error('Vui lòng thêm ít nhất 1 phòng vào tin đăng');
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
          td.TieuDe as TieuDeTinDang,
          COALESCE(pt.GiaTinDang, p.GiaChuan) as Gia,
          p.TenPhong,
          kh.TenDayDu as TenKhachHang, kh.SoDienThoai as SDTKhachHang,
          nv.TenDayDu as TenNhanVien, nv.SoDienThoai as SDTNhanVien
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
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
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
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
   * Lấy metrics/thống kê cuộc hẹn
   * @param {number} chuDuAnId ID của chủ dự án
   * @returns {Promise<Object>}
   */
  static async layMetricsCuocHen(chuDuAnId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          COUNT(CASE WHEN ch.PheDuyetChuDuAn = 'ChoPheDuyet' THEN 1 END) as choDuyet,
          COUNT(CASE WHEN ch.TrangThai = 'DaXacNhan' THEN 1 END) as daXacNhan,
          COUNT(CASE WHEN ch.TrangThai = 'ChoXacNhan' 
                   AND ch.ThoiGianHen BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) THEN 1 END) as sapDienRa,
          COUNT(CASE WHEN ch.TrangThai IN ('HuyBoiKhach', 'KhachKhongDen') THEN 1 END) as daHuy,
          COUNT(CASE WHEN ch.TrangThai = 'HoanThanh' THEN 1 END) as hoanThanh
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE da.ChuDuAnID = ?
      `, [chuDuAnId]);

      return rows[0] || {
        choDuyet: 0,
        daXacNhan: 0,
        sapDienRa: 0,
        daHuy: 0,
        hoanThanh: 0
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy metrics cuộc hẹn: ${error.message}`);
    }
  }

  /**
   * Phê duyệt cuộc hẹn
   * @param {number} cuocHenId ID cuộc hẹn
   * @param {number} chuDuAnId ID chủ dự án
   * @param {string} phuongThucVao Phương thức vào (bắt buộc)
   * @param {string} ghiChu Ghi chú thêm
   * @returns {Promise<boolean>}
   */
  static async pheDuyetCuocHen(cuocHenId, chuDuAnId, phuongThucVao, ghiChu = '') {
    try {
      // Kiểm tra quyền sở hữu và trạng thái
      const [rows] = await db.execute(`
        SELECT ch.PheDuyetChuDuAn, ch.TrangThai 
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE ch.CuocHenID = ? AND da.ChuDuAnID = ?
      `, [cuocHenId, chuDuAnId]);
      
      if (rows.length === 0) {
        throw new Error('Không tìm thấy cuộc hẹn hoặc không có quyền phê duyệt');
      }

      if (rows[0].PheDuyetChuDuAn !== 'ChoPheDuyet') {
        throw new Error('Chỉ có thể phê duyệt cuộc hẹn ở trạng thái Chờ phê duyệt');
      }

      // Cập nhật phê duyệt và lưu phương thức vào
      await db.execute(`
        UPDATE cuochen 
        SET PheDuyetChuDuAn = 'DaPheDuyet',
            ThoiGianPheDuyet = NOW(),
            PhuongThucVao = ?,
            GhiChuKetQua = CONCAT(
              IFNULL(GhiChuKetQua, ""), 
              ?, 
              "\n[Phê duyệt bởi chủ dự án lúc ", NOW(), "]"
            )
        WHERE CuocHenID = ?
      `, [phuongThucVao, ghiChu, cuocHenId]);
      
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi phê duyệt cuộc hẹn: ${error.message}`);
    }
  }

  /**
   * Từ chối cuộc hẹn
   * @param {number} cuocHenId ID cuộc hẹn
   * @param {number} chuDuAnId ID chủ dự án
   * @param {string} lyDoTuChoi Lý do từ chối (bắt buộc)
   * @returns {Promise<boolean>}
   */
  static async tuChoiCuocHen(cuocHenId, chuDuAnId, lyDoTuChoi) {
    try {
      // Kiểm tra quyền sở hữu và trạng thái
      const [rows] = await db.execute(`
        SELECT ch.PheDuyetChuDuAn, ch.TrangThai 
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE ch.CuocHenID = ? AND da.ChuDuAnID = ?
      `, [cuocHenId, chuDuAnId]);
      
      if (rows.length === 0) {
        throw new Error('Không tìm thấy cuộc hẹn hoặc không có quyền từ chối');
      }

      if (rows[0].PheDuyetChuDuAn !== 'ChoPheDuyet') {
        throw new Error('Chỉ có thể từ chối cuộc hẹn ở trạng thái Chờ phê duyệt');
      }

      // Cập nhật từ chối
      await db.execute(`
        UPDATE cuochen 
        SET PheDuyetChuDuAn = 'TuChoi',
            TrangThai = 'DaTuChoi',
            LyDoTuChoi = ?,
            ThoiGianPheDuyet = NOW(),
            GhiChuKetQua = CONCAT(
              IFNULL(GhiChuKetQua, ""), 
              "\n[Từ chối bởi chủ dự án lúc ", NOW(), "]",
              "\nLý do: ", ?
            )
        WHERE CuocHenID = ?
      `, [lyDoTuChoi, lyDoTuChoi, cuocHenId]);
      
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi từ chối cuộc hẹn: ${error.message}`);
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
          COUNT(CASE WHEN td.TrangThai = 'Nhap' THEN 1 END) as TinDangNhap,
          COUNT(CASE WHEN td.TrangThai = 'TamNgung' THEN 1 END) as TinDangTamNgung,
          COUNT(CASE WHEN td.TrangThai = 'TuChoi' THEN 1 END) as TinDangTuChoi,
          COUNT(CASE WHEN td.TrangThai = 'DaDuyet' THEN 1 END) as TinDangDaDuyet,
          AVG(
            (
              SELECT AVG(COALESCE(pt.GiaTinDang, p.GiaChuan))
              FROM phong_tindang pt
              JOIN phong p ON pt.PhongID = p.PhongID
              WHERE pt.TinDangID = td.TinDangID
            )
          ) as GiaTrungBinh,
          SUM(
            (
              SELECT SUM(COALESCE(pt.DienTichTinDang, p.DienTichChuan))
              FROM phong_tindang pt
              JOIN phong p ON pt.PhongID = p.PhongID
              WHERE pt.TinDangID = td.TinDangID
            )
          ) as TongDienTich
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
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE da.ChuDuAnID = ? ${dateFilter}
      `, params);

      // Thống kê cọc
      const [cocRows] = await db.execute(`
        SELECT 
          COUNT(*) as TongGiaoDichCoc,
          SUM(CASE WHEN c.TrangThai = 'DaThanhToan' THEN c.SoTien ELSE 0 END) as TongTienCoc,
          SUM(
            CASE 
              WHEN c.TrangThai = 'DaThanhToan' 
                AND MONTH(c.TaoLuc) = MONTH(CURRENT_DATE())
                AND YEAR(c.TaoLuc) = YEAR(CURRENT_DATE()) 
              THEN c.SoTien 
              ELSE 0 
            END
          ) as TongTienCocThangNay,
          COUNT(CASE WHEN c.Loai = 'CocGiuCho' THEN 1 END) as CocGiuCho,
          COUNT(CASE WHEN c.Loai = 'CocAnNinh' THEN 1 END) as CocAnNinh
        FROM coc c
        INNER JOIN phong p ON c.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE da.ChuDuAnID = ? ${dateFilter}
      `, params);

      const [tuongTacRows] = await db.execute(`
        SELECT
          SUM(tktd.SoLuotXem) as TongLuotXem,
          SUM(tktd.SoYeuThich) as TongYeuThich,
          SUM(CASE WHEN tktd.Ky = CURRENT_DATE THEN tktd.SoLuotXem ELSE 0 END) as LuotXemHomNay,
          SUM(CASE WHEN tktd.Ky = CURRENT_DATE THEN tktd.SoYeuThich ELSE 0 END) as YeuThichHomNay
        FROM thongketindang tktd
        INNER JOIN tindang td ON tktd.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE da.ChuDuAnID = ?
        ${tuNgay && denNgay ? 'AND tktd.Ky BETWEEN ? AND ?' : ''}
      `, params);

      return {
        tongQuan: tongQuanRows[0] || {},
        cuocHen: cuocHenRows[0] || {},
        coc: cocRows[0] || {},
        tuongTac: tuongTacRows[0] || {},
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
          da.DuAnID,
          da.TenDuAn,
          da.DiaChi,
          da.TrangThai,
          da.YeuCauPheDuyetChu,
          da.PhuongThucVao,
          da.ViDo,
          da.KinhDo,
          da.ChinhSachCocID,
          da.TaoLuc,
          da.CapNhatLuc,
          da.LyDoNgungHoatDong,
          da.NguoiNgungHoatDongID,
          da.NgungHoatDongLuc,
          da.YeuCauMoLai,
          da.NoiDungGiaiTrinh,
          da.ThoiGianGuiYeuCau,
          da.NguoiXuLyYeuCauID,
          da.ThoiGianXuLyYeuCau,
          da.LyDoTuChoiMoLai,
          nd_banned.TenDayDu AS NguoiNgungHoatDong_TenDayDu,
          nd_xulyban.TenDayDu AS NguoiXuLyYeuCau_TenDayDu,
          (SELECT COUNT(*) FROM tindang td WHERE td.DuAnID = da.DuAnID AND td.TrangThai != 'LuuTru') as SoTinDang,
          (SELECT COUNT(*) FROM tindang td WHERE td.DuAnID = da.DuAnID AND td.TrangThai IN ('DaDang','DaDuyet','ChoDuyet')) as TinDangHoatDong,
          (SELECT COUNT(*) FROM tindang td WHERE td.DuAnID = da.DuAnID AND td.TrangThai = 'Nhap') as TinDangNhap,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID) as TongPhong,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID AND p.TrangThai = 'Trong') as PhongTrong,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID AND p.TrangThai = 'GiuCho') as PhongGiuCho,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID AND p.TrangThai = 'DaThue') as PhongDaThue,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID AND p.TrangThai = 'DonDep') as PhongDonDep
        FROM duan da
        LEFT JOIN nguoidung nd_banned ON da.NguoiNgungHoatDongID = nd_banned.NguoiDungID
        LEFT JOIN nguoidung nd_xulyban ON da.NguoiXuLyYeuCauID = nd_xulyban.NguoiDungID
        WHERE da.ChuDuAnID = ?
        ORDER BY da.TrangThai DESC, da.CapNhatLuc DESC
      `, [chuDuAnId]);

      if (!rows.length) {
        return [];
      }

      const duAnIds = rows.map((row) => row.DuAnID);
      const placeholders = duAnIds.map(() => '?').join(', ');

      let depositRows = [];
      let policyRows = [];

      if (placeholders.length > 0) {
        [depositRows] = await db.execute(`
          SELECT 
            p.DuAnID,
            SUM(CASE WHEN c.TrangThai = 'HieuLuc' THEN c.SoTien ELSE 0 END) as TongTienCocDangHieuLuc,
            SUM(CASE WHEN c.TrangThai = 'HieuLuc' THEN 1 ELSE 0 END) as CocDangHieuLuc,
            SUM(CASE WHEN c.TrangThai = 'HieuLuc' AND c.Loai = 'CocGiuCho' THEN 1 ELSE 0 END) as CocDangHieuLucGiuCho,
            SUM(CASE WHEN c.TrangThai = 'HieuLuc' AND c.Loai = 'CocAnNinh' THEN 1 ELSE 0 END) as CocDangHieuLucAnNinh,
            SUM(CASE WHEN c.TrangThai = 'HetHan' THEN 1 ELSE 0 END) as CocHetHan,
            SUM(CASE WHEN c.TrangThai = 'DaGiaiToa' THEN 1 ELSE 0 END) as CocDaGiaiToa,
            SUM(CASE WHEN c.TrangThai = 'DaDoiTru' THEN 1 ELSE 0 END) as CocDaDoiTru
          FROM coc c
          INNER JOIN phong p ON c.PhongID = p.PhongID
          WHERE p.DuAnID IN (${placeholders})
          GROUP BY p.DuAnID
        `, duAnIds);

        [policyRows] = await db.execute(`
          SELECT 
            td.DuAnID,
            td.ChinhSachCocID,
            csc.TenChinhSach,
            csc.MoTa,
            csc.ChoPhepCocGiuCho,
            csc.TTL_CocGiuCho_Gio,
            csc.TyLePhat_CocGiuCho,
            csc.ChoPhepCocAnNinh,
            csc.SoTienCocAnNinhMacDinh,
            csc.QuyTacGiaiToa,
            csc.HieuLuc,
            csc.CapNhatLuc,
            COUNT(*) as SoTinDangApDung
          FROM tindang td
          LEFT JOIN chinhsachcoc csc ON td.ChinhSachCocID = csc.ChinhSachCocID
          WHERE td.DuAnID IN (${placeholders}) AND td.TrangThai != 'LuuTru'
          GROUP BY 
            td.DuAnID,
            td.ChinhSachCocID,
            csc.TenChinhSach,
            csc.MoTa,
            csc.ChoPhepCocGiuCho,
            csc.TTL_CocGiuCho_Gio,
            csc.TyLePhat_CocGiuCho,
            csc.ChoPhepCocAnNinh,
            csc.SoTienCocAnNinhMacDinh,
            csc.QuyTacGiaiToa,
            csc.HieuLuc,
            csc.CapNhatLuc
        `, duAnIds);
      }

      const depositMap = new Map();
      depositRows.forEach((row) => {
        depositMap.set(row.DuAnID, {
          CocDangHieuLuc: Number(row.CocDangHieuLuc) || 0,
          TongTienCocDangHieuLuc: Number(row.TongTienCocDangHieuLuc) || 0,
          CocDangHieuLucGiuCho: Number(row.CocDangHieuLucGiuCho) || 0,
          CocDangHieuLucAnNinh: Number(row.CocDangHieuLucAnNinh) || 0,
          CocHetHan: Number(row.CocHetHan) || 0,
          CocDaGiaiToa: Number(row.CocDaGiaiToa) || 0,
          CocDaDoiTru: Number(row.CocDaDoiTru) || 0
        });
      });

      const policyMap = new Map();
      policyRows.forEach((row) => {
        const list = policyMap.get(row.DuAnID) || [];
        list.push({
          ChinhSachCocID: row.ChinhSachCocID !== null ? Number(row.ChinhSachCocID) : null,
          TenChinhSach: row.TenChinhSach || null,
          MoTa: row.MoTa || null,
          ChoPhepCocGiuCho: row.ChoPhepCocGiuCho === null ? null : Number(row.ChoPhepCocGiuCho) === 1,
          TTL_CocGiuCho_Gio: row.TTL_CocGiuCho_Gio !== null ? Number(row.TTL_CocGiuCho_Gio) : null,
          TyLePhat_CocGiuCho: row.TyLePhat_CocGiuCho !== null ? Number(row.TyLePhat_CocGiuCho) : null,
          ChoPhepCocAnNinh: row.ChoPhepCocAnNinh === null ? null : Number(row.ChoPhepCocAnNinh) === 1,
          SoTienCocAnNinhMacDinh: row.SoTienCocAnNinhMacDinh !== null ? Number(row.SoTienCocAnNinhMacDinh) : null,
          QuyTacGiaiToa: row.QuyTacGiaiToa || null,
          HieuLuc: row.HieuLuc === null ? null : Number(row.HieuLuc) === 1,
          CapNhatLuc: row.CapNhatLuc || null,
          SoTinDangApDung: Number(row.SoTinDangApDung) || 0
        });
        policyMap.set(row.DuAnID, list);
      });

      return rows.map((row) => {
        const duAnId = row.DuAnID;
        const cocStats = depositMap.get(duAnId) || {
          CocDangHieuLuc: 0,
          TongTienCocDangHieuLuc: 0,
          CocDangHieuLucGiuCho: 0,
          CocDangHieuLucAnNinh: 0,
          CocHetHan: 0,
          CocDaGiaiToa: 0,
          CocDaDoiTru: 0
        };

        return {
          ...row,
          ViDo: row.ViDo !== null ? Number(row.ViDo) : null,
          KinhDo: row.KinhDo !== null ? Number(row.KinhDo) : null,
          SoTinDang: Number(row.SoTinDang) || 0,
          TinDangHoatDong: Number(row.TinDangHoatDong) || 0,
          TinDangNhap: Number(row.TinDangNhap) || 0,
          TongPhong: Number(row.TongPhong) || 0,
          PhongTrong: Number(row.PhongTrong) || 0,
          PhongGiuCho: Number(row.PhongGiuCho) || 0,
          PhongDaThue: Number(row.PhongDaThue) || 0,
          PhongDonDep: Number(row.PhongDonDep) || 0,
          CocStats: cocStats,
          ChinhSachCoc: policyMap.get(duAnId) || []
        };
      });
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách dự án: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê phòng theo trạng thái cho toàn bộ dự án thuộc chủ dự án
   * @param {number} chuDuAnId
   * @returns {Promise<Object>}
   */
  static async layThongKePhong(chuDuAnId) {
    try {
      const [rows] = await db.execute(`
        SELECT
          COUNT(p.PhongID) as TongPhong,
          COUNT(CASE WHEN p.TrangThai = 'Trong' THEN 1 END) as PhongTrong,
          COUNT(CASE WHEN p.TrangThai = 'DaThue' THEN 1 END) as PhongDaThue,
          COUNT(CASE WHEN p.TrangThai = 'GiuCho' THEN 1 END) as PhongGiuCho,
          COUNT(CASE WHEN p.TrangThai = 'DonDep' THEN 1 END) as PhongDonDep
        FROM phong p
        INNER JOIN duan da ON p.DuAnID = da.DuAnID
        WHERE da.ChuDuAnID = ?
      `, [chuDuAnId]);

      const result = rows[0] || {};
      return {
        TongPhong: result.TongPhong || 0,
        PhongTrong: result.PhongTrong || 0,
        PhongDaThue: result.PhongDaThue || 0,
        PhongGiuCho: result.PhongGiuCho || 0,
        PhongDonDep: result.PhongDonDep || 0
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê phòng: ${error.message}`);
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

  static async demTinDangHoatDong(duAnId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as Tong
       FROM tindang
       WHERE DuAnID = ?
         AND TrangThai IN ('ChoDuyet','DaDuyet','DaDang','TamNgung')`,
      [duAnId]
    );
    return rows[0]?.Tong || 0;
  }

  static async capNhatDuAn(duAnId, chuDuAnId, data = {}) {
    try {
      const [rows] = await db.execute(
        `SELECT DuAnID, TenDuAn, DiaChi, YeuCauPheDuyetChu, PhuongThucVao
         FROM duan
         WHERE DuAnID = ? AND ChuDuAnID = ?`,
        [duAnId, chuDuAnId]
      );

      if (rows.length === 0) {
        return null;
      }

      const updates = [];
      const params = [];
      const allowedStatuses = new Set(['HoatDong', 'NgungHoatDong', 'LuuTru']);

      if (Object.prototype.hasOwnProperty.call(data, 'TenDuAn')) {
        const ten = (data.TenDuAn || '').trim();
        if (!ten) {
          throw new Error('Tên dự án không được để trống');
        }
        updates.push('TenDuAn = ?');
        params.push(ten);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'DiaChi')) {
        const diaChi = (data.DiaChi || '').trim();

        if (diaChi) {
          const [dupRows] = await db.execute(
            `SELECT DuAnID FROM duan
             WHERE ChuDuAnID = ? AND DiaChi = ? AND DuAnID != ? AND TrangThai != 'LuuTru'`,
            [chuDuAnId, diaChi, duAnId]
          );

          if (dupRows.length > 0) {
            throw new Error('Địa chỉ này đã được sử dụng cho một dự án khác');
          }
        }

        updates.push('DiaChi = ?');
        params.push(diaChi);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'ViDo')) {
        let value = null;
        if (data.ViDo !== null && data.ViDo !== undefined && data.ViDo !== '') {
          const parsed = Number(data.ViDo);
          if (Number.isNaN(parsed)) {
            throw new Error('Vĩ độ không hợp lệ');
          }
          value = parsed;
        }
        updates.push('ViDo = ?');
        params.push(value);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'KinhDo')) {
        let value = null;
        if (data.KinhDo !== null && data.KinhDo !== undefined && data.KinhDo !== '') {
          const parsed = Number(data.KinhDo);
          if (Number.isNaN(parsed)) {
            throw new Error('Kinh độ không hợp lệ');
          }
          value = parsed;
        }
        updates.push('KinhDo = ?');
        params.push(value);
      }

      let requireApproval = null;
      const hasApprovalField = Object.prototype.hasOwnProperty.call(data, 'YeuCauPheDuyetChu');
      if (hasApprovalField) {
        requireApproval = data.YeuCauPheDuyetChu ? 1 : 0;
        updates.push('YeuCauPheDuyetChu = ?');
        params.push(requireApproval);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'PhuongThucVao') || hasApprovalField) {
        let phuongThuc = null;
        if (requireApproval === null) {
          requireApproval = rows[0]?.YeuCauPheDuyetChu || 0;
        }

        if (requireApproval === 1) {
          phuongThuc = null;
        } else if (Object.prototype.hasOwnProperty.call(data, 'PhuongThucVao')) {
          const raw = data.PhuongThucVao === undefined ? null : data.PhuongThucVao;
          phuongThuc = raw ? String(raw).trim() : null;
          if (!phuongThuc) {
            throw new Error('Phương thức vào không được để trống khi không yêu cầu phê duyệt');
          }
        } else {
          phuongThuc = rows[0]?.PhuongThucVao || null;
        }

        updates.push('PhuongThucVao = ?');
        params.push(phuongThuc);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'TrangThai')) {
        const trangThai = data.TrangThai;
        if (!allowedStatuses.has(trangThai)) {
          throw new Error('Trạng thái dự án không hợp lệ');
        }

        if (trangThai === 'LuuTru') {
          const activeCount = await this.demTinDangHoatDong(duAnId);
          if (activeCount > 0) {
            throw new Error('Không thể lưu trữ dự án khi vẫn còn tin đăng hoạt động');
          }
        }

        updates.push('TrangThai = ?');
        params.push(trangThai);
      }

      if (updates.length === 0) {
        return await this.layChiTietDuAn(duAnId, chuDuAnId);
      }

      updates.push('CapNhatLuc = NOW()');

      await db.execute(
        `UPDATE duan
         SET ${updates.join(', ')}
         WHERE DuAnID = ? AND ChuDuAnID = ?`,
        [...params, duAnId, chuDuAnId]
      );

      return await this.layChiTietDuAn(duAnId, chuDuAnId);
    } catch (error) {
      throw new Error(`Lỗi cập nhật dự án: ${error.message}`);
    }
  }

  static async luuTruDuAn(duAnId, chuDuAnId) {
    try {
      const [rows] = await db.execute(
        `SELECT DuAnID FROM duan WHERE DuAnID = ? AND ChuDuAnID = ?`,
        [duAnId, chuDuAnId]
      );

      if (rows.length === 0) {
        return null;
      }

      const activeCount = await this.demTinDangHoatDong(duAnId);
      if (activeCount > 0) {
        throw new Error('Không thể lưu trữ dự án khi vẫn còn tin đăng hoạt động');
      }

      await db.execute(
        `UPDATE duan
         SET TrangThai = 'LuuTru', CapNhatLuc = NOW()
         WHERE DuAnID = ? AND ChuDuAnID = ?`,
        [duAnId, chuDuAnId]
      );

      return await this.layChiTietDuAn(duAnId, chuDuAnId);
    } catch (error) {
      throw new Error(`Lỗi lưu trữ dự án: ${error.message}`);
    }
  }

  static async layChiTietChinhSachCoc(chuDuAnId, chinhSachCocId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
           csc.ChinhSachCocID,
           csc.TenChinhSach,
           csc.MoTa,
           csc.ChoPhepCocGiuCho,
           csc.TTL_CocGiuCho_Gio,
           csc.TyLePhat_CocGiuCho,
           csc.ChoPhepCocAnNinh,
           csc.SoTienCocAnNinhMacDinh,
           csc.QuyTacGiaiToa,
           csc.HieuLuc,
           csc.TaoLuc,
           csc.CapNhatLuc,
           COUNT(DISTINCT td.TinDangID) as SoTinDangLienKet
         FROM chinhsachcoc csc
         JOIN tindang td ON td.ChinhSachCocID = csc.ChinhSachCocID
         JOIN duan da ON td.DuAnID = da.DuAnID
         WHERE csc.ChinhSachCocID = ? AND da.ChuDuAnID = ?
         GROUP BY csc.ChinhSachCocID`,
        [chinhSachCocId, chuDuAnId]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        ChinhSachCocID: Number(row.ChinhSachCocID),
        TenChinhSach: row.TenChinhSach,
        MoTa: row.MoTa,
        ChoPhepCocGiuCho: row.ChoPhepCocGiuCho === null ? null : Number(row.ChoPhepCocGiuCho) === 1,
        TTL_CocGiuCho_Gio: row.TTL_CocGiuCho_Gio !== null ? Number(row.TTL_CocGiuCho_Gio) : null,
        TyLePhat_CocGiuCho: row.TyLePhat_CocGiuCho !== null ? Number(row.TyLePhat_CocGiuCho) : null,
        ChoPhepCocAnNinh: row.ChoPhepCocAnNinh === null ? null : Number(row.ChoPhepCocAnNinh) === 1,
        SoTienCocAnNinhMacDinh:
          row.SoTienCocAnNinhMacDinh !== null ? Number(row.SoTienCocAnNinhMacDinh) : null,
        QuyTacGiaiToa: row.QuyTacGiaiToa,
        HieuLuc: row.HieuLuc === null ? null : Number(row.HieuLuc) === 1,
        TaoLuc: row.TaoLuc,
        CapNhatLuc: row.CapNhatLuc,
        SoTinDangLienKet: Number(row.SoTinDangLienKet) || 0
      };
    } catch (error) {
      throw new Error(`Lỗi lấy chi tiết chính sách cọc: ${error.message}`);
    }
  }

  static async capNhatChinhSachCoc(chuDuAnId, chinhSachCocId, data = {}) {
    try {
      const chiTiet = await this.layChiTietChinhSachCoc(chuDuAnId, chinhSachCocId);
      if (!chiTiet) {
        return null;
      }

      const updates = [];
      const params = [];

      if (Object.prototype.hasOwnProperty.call(data, 'TenChinhSach')) {
        const ten = (data.TenChinhSach || '').trim();
        if (!ten) {
          throw new Error('Tên chính sách không được để trống');
        }
        updates.push('TenChinhSach = ?');
        params.push(ten);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'MoTa')) {
        updates.push('MoTa = ?');
        params.push(data.MoTa ? String(data.MoTa).trim() : null);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'ChoPhepCocGiuCho')) {
        const value = data.ChoPhepCocGiuCho ? 1 : 0;
        updates.push('ChoPhepCocGiuCho = ?');
        params.push(value);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'TTL_CocGiuCho_Gio')) {
        let ttl = data.TTL_CocGiuCho_Gio;
        if (ttl === '' || ttl === null || ttl === undefined) {
          ttl = null;
        } else {
          ttl = Number(ttl);
          if (Number.isNaN(ttl) || ttl < 0) {
            throw new Error('TTL giữ chỗ phải là số không âm');
          }
        }
        updates.push('TTL_CocGiuCho_Gio = ?');
        params.push(ttl);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'TyLePhat_CocGiuCho')) {
        let tyLe = data.TyLePhat_CocGiuCho;
        if (tyLe === '' || tyLe === null || tyLe === undefined) {
          tyLe = null;
        } else {
          tyLe = Number(tyLe);
          if (Number.isNaN(tyLe) || tyLe < 0 || tyLe > 100) {
            throw new Error('Tỷ lệ phạt phải trong khoảng 0-100');
          }
        }
        updates.push('TyLePhat_CocGiuCho = ?');
        params.push(tyLe);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'ChoPhepCocAnNinh')) {
        const value = data.ChoPhepCocAnNinh ? 1 : 0;
        updates.push('ChoPhepCocAnNinh = ?');
        params.push(value);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'SoTienCocAnNinhMacDinh')) {
        let soTien = data.SoTienCocAnNinhMacDinh;
        if (soTien === '' || soTien === null || soTien === undefined) {
          soTien = null;
        } else {
          soTien = Number(soTien);
          if (Number.isNaN(soTien) || soTien < 0) {
            throw new Error('Số tiền cọc an ninh mặc định phải lớn hơn hoặc bằng 0');
          }
        }
        updates.push('SoTienCocAnNinhMacDinh = ?');
        params.push(soTien);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'QuyTacGiaiToa')) {
        const allowed = new Set(['BanGiao', 'TheoNgay', 'Khac']);
        const value = data.QuyTacGiaiToa || null;
        if (value !== null && !allowed.has(value)) {
          throw new Error('Quy tắc giải tỏa không hợp lệ');
        }
        updates.push('QuyTacGiaiToa = ?');
        params.push(value);
      }

      if (Object.prototype.hasOwnProperty.call(data, 'HieuLuc')) {
        const value = data.HieuLuc ? 1 : 0;
        updates.push('HieuLuc = ?');
        params.push(value);
      }

      if (updates.length === 0) {
        return chiTiet;
      }

      updates.push('CapNhatLuc = NOW()');

      await db.execute(
        `UPDATE chinhsachcoc 
         SET ${updates.join(', ')}
         WHERE ChinhSachCocID = ?`,
        [...params, chinhSachCocId]
      );

      return await this.layChiTietChinhSachCoc(chuDuAnId, chinhSachCocId);
    } catch (error) {
      throw new Error(`Lỗi cập nhật chính sách cọc: ${error.message}`);
    }
  }
  
  /**
   * Lấy danh sách phòng của tin đăng (sử dụng PhongModel)
   * @deprecated Sử dụng PhongModel.layPhongCuaTinDang() thay thế
   * @param {number} tinDangId ID của tin đăng
   * @returns {Promise<Array>}
   */
  static async layDanhSachPhong(tinDangId) {
    const PhongModel = require('./PhongModel');
    return await PhongModel.layPhongCuaTinDang(tinDangId);
  }

  /**
   * ============================================================================
   * METHODS MỚI CHO DASHBOARD & BÁO CÁO CHI TIẾT (2025-10-24)
   * ============================================================================
   */

  /**
   * Lấy doanh thu theo tháng (6 tháng gần nhất)
   * Sử dụng cho: Biểu đồ Line Chart trong Báo cáo
   * @param {number} chuDuAnId ID của chủ dự án
   * @returns {Promise<Array>} Array of {Thang, TongTien, SoGiaoDich, SoPhong}
   */
  static async layDoanhThuTheoThang(chuDuAnId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          DATE_FORMAT(c.TaoLuc, '%Y-%m') as Thang,
          SUM(c.SoTien) as TongTien,
          COUNT(DISTINCT c.CocID) as SoGiaoDich,
          COUNT(DISTINCT c.PhongID) as SoPhong
        FROM coc c
        INNER JOIN phong p ON c.PhongID = p.PhongID
        INNER JOIN duan d ON p.DuAnID = d.DuAnID
        WHERE d.ChuDuAnID = ?
          AND c.TrangThai = 'DaThanhToan'
          AND c.TaoLuc >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(c.TaoLuc, '%Y-%m')
        ORDER BY Thang ASC
      `, [chuDuAnId]);

      return rows;
    } catch (error) {
      throw new Error(`Lỗi lấy doanh thu theo tháng: ${error.message}`);
    }
  }

  /**
   * Lấy Top 5 tin đăng hiệu quả nhất (theo lượt xem)
   * Sử dụng cho: Bar Chart trong Báo cáo
   * @param {number} chuDuAnId 
   * @param {Object} filters {tuNgay, denNgay}
   * @returns {Promise<Array>}
   */
  static async layTopTinDang(chuDuAnId, filters = {}) {
    try {
      const { tuNgay, denNgay } = filters;
      const params = [];
      let tkDateFilter = '';
      let chDateFilter = '';

      // Build WHERE clause cho thongketindang
      if (tuNgay && denNgay) {
        tkDateFilter = 'AND tk.Ky BETWEEN ? AND ?';
        chDateFilter = 'AND ch.TaoLuc BETWEEN ? AND ?';
      }

      // Build params array theo đúng thứ tự trong query
      if (tuNgay && denNgay) {
        params.push(tuNgay, denNgay, tuNgay, denNgay);
      }
      params.push(chuDuAnId);

      const [rows] = await db.execute(`
        SELECT 
          td.TinDangID,
          td.TieuDe,
          COALESCE(MIN(p.GiaChuan), 0) as Gia,
          COALESCE(SUM(tk.SoLuotXem), 0) as LuotXem,
          COALESCE(SUM(tk.SoYeuThich), 0) as LuotYeuThich,
          COUNT(DISTINCT ch.CuocHenID) as SoCuocHen
        FROM tindang td
        INNER JOIN duan d ON td.DuAnID = d.DuAnID
        LEFT JOIN thongketindang tk ON td.TinDangID = tk.TinDangID ${tkDateFilter}
        LEFT JOIN phong_tindang pt ON td.TinDangID = pt.TinDangID
        LEFT JOIN phong p ON pt.PhongID = p.PhongID
        LEFT JOIN cuochen ch ON p.PhongID = ch.PhongID ${chDateFilter}
        WHERE d.ChuDuAnID = ?
          AND td.TrangThai IN ('DaDang', 'DaDuyet')
        GROUP BY td.TinDangID, td.TieuDe
        ORDER BY LuotXem DESC
        LIMIT 5
      `, params);

      return rows;
    } catch (error) {
      throw new Error(`Lỗi lấy top tin đăng: ${error.message}`);
    }
  }

  /**
   * Lấy Conversion Rate (Tỷ lệ chuyển đổi từ cuộc hẹn → hoàn thành)
   * @param {number} chuDuAnId 
   * @param {Object} filters {tuNgay, denNgay}
   * @returns {Promise<Object>}
   */
  static async layConversionRate(chuDuAnId, filters = {}) {
    try {
      const { tuNgay, denNgay } = filters;
      const params = [];
      let dateFilter = '';

      if (tuNgay && denNgay) {
        dateFilter = 'AND ch.TaoLuc BETWEEN ? AND ?';
        params.push(chuDuAnId, tuNgay, denNgay);
      } else {
        params.push(chuDuAnId);
      }

      const [rows] = await db.execute(`
        SELECT 
          COUNT(DISTINCT ch.CuocHenID) as tongCuocHen,
          COUNT(DISTINCT CASE WHEN ch.TrangThai = 'HoanThanh' THEN ch.CuocHenID END) as cuocHenHoanThanh,
          COALESCE(SUM(tk.SoLuotXem), 0) as tongLuotXem,
          ROUND(
            COUNT(DISTINCT CASE WHEN ch.TrangThai = 'HoanThanh' THEN ch.CuocHenID END) * 100.0 
            / NULLIF(COUNT(DISTINCT ch.CuocHenID), 0), 
            2
          ) as tyLeChuyenDoi
        FROM duan d
        LEFT JOIN phong p ON d.DuAnID = p.DuAnID
        LEFT JOIN cuochen ch ON p.PhongID = ch.PhongID ${dateFilter}
        LEFT JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        LEFT JOIN tindang td ON pt.TinDangID = td.TinDangID
        LEFT JOIN thongketindang tk ON td.TinDangID = tk.TinDangID
        WHERE d.ChuDuAnID = ?
      `, params);

      return rows[0] || { tongCuocHen: 0, cuocHenHoanThanh: 0, tongLuotXem: 0, tyLeChuyenDoi: 0 };
    } catch (error) {
      throw new Error(`Lỗi lấy conversion rate: ${error.message}`);
    }
  }

  /**
   * Lấy lượt xem theo giờ (Heatmap data)
   * @param {number} chuDuAnId 
   * @param {Object} filters {tuNgay, denNgay}
   * @returns {Promise<Array>}
   */
  static async layLuotXemTheoGio(chuDuAnId, filters = {}) {
    try {
      const { tuNgay, denNgay } = filters;
      let dateFilter = '';
      const params = [chuDuAnId];

      if (tuNgay && denNgay) {
        dateFilter = 'AND tk.Ky BETWEEN ? AND ?';
        params.push(tuNgay, denNgay);
      }

      const [rows] = await db.execute(`
        SELECT 
          HOUR(tk.Ky) as Gio,
          SUM(tk.SoLuotXem) as LuotXem
        FROM thongketindang tk
        INNER JOIN tindang td ON tk.TinDangID = td.TinDangID
        INNER JOIN duan d ON td.DuAnID = d.DuAnID
        WHERE d.ChuDuAnID = ? ${dateFilter}
        GROUP BY HOUR(tk.Ky)
        ORDER BY Gio ASC
      `, params);

      return rows;
    } catch (error) {
      throw new Error(`Lỗi lấy lượt xem theo giờ: ${error.message}`);
    }
  }

  /**
   * Lấy báo cáo hiệu suất ENHANCED với tất cả metrics cần thiết
   * Kết hợp các method trên để trả về đầy đủ data cho Báo cáo page
   * @param {number} chuDuAnId 
   * @param {Object} filters {tuNgay, denNgay}
   * @returns {Promise<Object>}
   */
  static async layBaoCaoHieuSuatChiTiet(chuDuAnId, filters = {}) {
    try {
      // Gọi song song tất cả queries để tối ưu performance
      const [
        tongQuan,
        doanhThuTheoThang,
        topTinDang,
        conversionRate,
        luotXemTheoGio,
        thongKePhong
      ] = await Promise.all([
        this.layBaoCaoHieuSuat(chuDuAnId, filters), // Method cũ cho tổng quan
        this.layDoanhThuTheoThang(chuDuAnId),
        this.layTopTinDang(chuDuAnId, filters),
        this.layConversionRate(chuDuAnId, filters),
        this.layLuotXemTheoGio(chuDuAnId, filters),
        this.layThongKePhong(chuDuAnId)
      ]);

      return {
        // Tổng quan (từ method cũ)
        tongQuan: tongQuan.tongQuan,
        cuocHen: tongQuan.cuocHen,
        coc: tongQuan.coc,
        tuongTac: tongQuan.tuongTac,
        
        // Thống kê phòng
        thongKePhong,
        
        // Advanced analytics (methods mới)
        doanhThuTheoThang,
        topTinDang,
        conversionRate,
        luotXemTheoGio,
        
        // Metadata
        thoiGianBaoCao: {
          tuNgay: filters.tuNgay || null,
          denNgay: filters.denNgay || null,
          taoLuc: new Date()
        }
      };
    } catch (error) {
      throw new Error(`Lỗi lấy báo cáo chi tiết: ${error.message}`);
    }
  }
}

module.exports = ChuDuAnModel;



