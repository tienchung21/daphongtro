/**
 * Model cho Nhân viên Điều hành - Quản lý Hồ sơ Nhân viên
 * UC-OPER-04 & UC-OPER-05: Quản lý hồ sơ và tạo tài khoản NVBH
 */

const db = require('../config/db');
const NhatKyHeThongService = require('../services/NhatKyHeThongService');
const crypto = require('crypto');

class HoSoNhanVienModel {
  /**
   * Lấy danh sách nhân viên bán hàng với phân trang và bộ lọc
   * @param {Object} filters - Bộ lọc
   * @param {string} [filters.keyword] - Từ khóa tìm kiếm
   * @param {string} [filters.trangThai] - Trạng thái làm việc
   * @param {number} [filters.khuVucId] - ID khu vực
   * @param {number} [filters.page=1] - Trang hiện tại
   * @param {number} [filters.limit=20] - Số items mỗi trang
   * @returns {Promise<{data: Array, total: number, page: number, totalPages: number}>}
   */
  static async layDanhSachNhanVien(filters = {}) {
    try {
      const {
        keyword = '',
        trangThai = null,
        khuVucId = null,
        page = 1,
        limit = 20
      } = filters;

      const offset = (page - 1) * limit;

      let whereConditions = [];
      const params = [];

      if (keyword && keyword.trim()) {
        whereConditions.push(`(nd.TenDayDu LIKE ? OR nd.Email LIKE ? OR hs.MaNhanVien LIKE ?)`);
        const keywordParam = `%${keyword.trim()}%`;
        params.push(keywordParam, keywordParam, keywordParam);
      }

      if (trangThai) {
        whereConditions.push(`hs.TrangThaiLamViec = ?`);
        params.push(trangThai);
      }

      if (khuVucId) {
        whereConditions.push(`hs.KhuVucChinhID = ?`);
        params.push(khuVucId);
      }

      const whereClause = whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      const query = `
        SELECT 
          hs.HoSoID,
          hs.NguoiDungID,
          hs.MaNhanVien,
          hs.KhuVucChinhID,
          hs.TyLeHoaHong,
          hs.TrangThaiLamViec,
          hs.NgayBatDau,
          hs.NgayKetThuc,
          hs.GhiChu,
          nd.TenDayDu,
          nd.Email,
          nd.SoDienThoai,
          nd.TrangThai as TrangThaiTaiKhoan,
          kv.TenKhuVuc,
          COUNT(DISTINCT ch.CuocHenID) as TongSoCuocHen,
          COUNT(DISTINCT CASE WHEN ch.TrangThai = 'HoanThanh' THEN ch.CuocHenID END) as SoCuocHenHoanThanh
        FROM hosonhanvien hs
        INNER JOIN nguoidung nd ON hs.NguoiDungID = nd.NguoiDungID
        LEFT JOIN khuvuc kv ON hs.KhuVucChinhID = kv.KhuVucID
        LEFT JOIN cuochen ch ON nd.NguoiDungID = ch.NhanVienBanHangID
        ${whereClause}
        GROUP BY hs.HoSoID
        ORDER BY hs.TrangThaiLamViec ASC, nd.TenDayDu ASC
        LIMIT ? OFFSET ?
      `;

      params.push(limit, offset);
      const [rows] = await db.execute(query, params);

      // Query total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM hosonhanvien hs
        INNER JOIN nguoidung nd ON hs.NguoiDungID = nd.NguoiDungID
        ${whereClause}
      `;

      const countParams = params.slice(0, -2);
      const [countRows] = await db.execute(countQuery, countParams);
      const total = countRows[0].total;

      return {
        data: rows,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('[HoSoNhanVienModel] Lỗi layDanhSachNhanVien:', error);
      throw new Error(`Lỗi lấy danh sách nhân viên: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết hồ sơ nhân viên
   * @param {number} nhanVienId - ID nhân viên (NguoiDungID)
   * @returns {Promise<Object>} Chi tiết hồ sơ
   */
  static async layChiTietNhanVien(nhanVienId) {
    try {
      const query = `
        SELECT 
          hs.*,
          nd.TenDayDu,
          nd.Email,
          nd.SoDienThoai,
          nd.TrangThai as TrangThaiTaiKhoan,
          nd.TrangThaiXacMinh,
          kv.TenKhuVuc,
          COUNT(DISTINCT ch.CuocHenID) as TongSoCuocHen,
          COUNT(DISTINCT CASE WHEN ch.TrangThai = 'HoanThanh' THEN ch.CuocHenID END) as SoCuocHenHoanThanh,
          COUNT(DISTINCT CASE WHEN ch.TrangThai = 'KhachKhongDen' THEN ch.CuocHenID END) as SoCuocHenKhachKhongDen
        FROM hosonhanvien hs
        INNER JOIN nguoidung nd ON hs.NguoiDungID = nd.NguoiDungID
        LEFT JOIN khuvuc kv ON hs.KhuVucChinhID = kv.KhuVucID
        LEFT JOIN cuochen ch ON nd.NguoiDungID = ch.NhanVienBanHangID
        WHERE hs.NguoiDungID = ?
        GROUP BY hs.HoSoID
      `;

      const [rows] = await db.execute(query, [nhanVienId]);

      if (!rows.length) {
        // Giữ nguyên message thuần để controller có thể phân biệt 404
        throw new Error('Nhân viên không tồn tại');
      }

      const nhanVien = rows[0];

      // Tính KPI
      if (nhanVien.TongSoCuocHen > 0) {
        nhanVien.TyLeHoanThanh = (nhanVien.SoCuocHenHoanThanh / nhanVien.TongSoCuocHen * 100).toFixed(2);
        nhanVien.TyLeKhachKhongDen = (nhanVien.SoCuocHenKhachKhongDen / nhanVien.TongSoCuocHen * 100).toFixed(2);
      } else {
        nhanVien.TyLeHoanThanh = 0;
        nhanVien.TyLeKhachKhongDen = 0;
      }

      // Lấy lịch sử cuộc hẹn gần đây
      // LƯU Ý: Bảng `phong` KHÔNG có cột `TinDangID`, quan hệ phòng - tin đăng
      // đi qua bảng trung gian `phong_tindang`
      const lichSuQuery = `
        SELECT 
          ch.CuocHenID,
          ch.ThoiGianHen,
          ch.TrangThai,
          p.TenPhong,
          td.TieuDe as TieuDeTinDang,
          kh.TenDayDu as TenKhachHang
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN nguoidung kh ON ch.KhachHangID = kh.NguoiDungID
        WHERE ch.NhanVienBanHangID = ?
        ORDER BY ch.ThoiGianHen DESC
        LIMIT 10
      `;

      const [lichSuRows] = await db.execute(lichSuQuery, [nhanVienId]);
      nhanVien.LichSuCuocHen = lichSuRows;

      // Lấy lịch làm việc gần đây của nhân viên
      const lichLamViecQuery = `
        SELECT 
          ll.LichID,
          ll.NhanVienBanHangID,
          ll.BatDau,
          ll.KetThuc
        FROM lichlamviec ll
        WHERE ll.NhanVienBanHangID = ?
        ORDER BY ll.BatDau DESC
        LIMIT 10
      `;

      const [lichLamViecRows] = await db.execute(lichLamViecQuery, [nhanVienId]);
      nhanVien.LichLamViecGanDay = lichLamViecRows;

      return nhanVien;
    } catch (error) {
      console.error('[HoSoNhanVienModel] Lỗi layChiTietNhanVien:', error);
      // Không wrap message "Nhân viên không tồn tại" để controller trả về 404 đúng
      if (error.message === 'Nhân viên không tồn tại') {
        throw error;
      }
      throw new Error(`Lỗi lấy chi tiết nhân viên: ${error.message}`);
    }
  }

  /**
   * Cập nhật hồ sơ nhân viên
   * @param {number} nhanVienId - ID nhân viên
   * @param {Object} data - Dữ liệu cập nhật
   * @param {number} operatorId - ID operator thực hiện
   * @returns {Promise<Object>} Thông tin sau khi cập nhật
   */
  static async capNhatHoSo(nhanVienId, data, operatorId) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Validate phone số điện thoại
      if (data.SoDienThoai && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(data.SoDienThoai)) {
        throw new Error('Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx)');
      }

      // Lấy thông tin cũ
      const [oldRows] = await connection.execute(
        `SELECT hs.*, nd.TenDayDu, nd.SoDienThoai, nd.Email
         FROM hosonhanvien hs
         INNER JOIN nguoidung nd ON hs.NguoiDungID = nd.NguoiDungID
         WHERE hs.NguoiDungID = ?`,
        [nhanVienId]
      );

      if (!oldRows.length) {
        throw new Error('Nhân viên không tồn tại');
      }

      const oldData = oldRows[0];

      // Cập nhật nguoidung
      if (data.TenDayDu || data.SoDienThoai) {
        const updateUserFields = [];
        const updateUserParams = [];

        if (data.TenDayDu) {
          updateUserFields.push('TenDayDu = ?');
          updateUserParams.push(data.TenDayDu);
        }

        if (data.SoDienThoai) {
          updateUserFields.push('SoDienThoai = ?');
          updateUserParams.push(data.SoDienThoai);
        }

        if (updateUserFields.length > 0) {
          updateUserParams.push(nhanVienId);
          await connection.execute(
            `UPDATE nguoidung SET ${updateUserFields.join(', ')}, CapNhatLuc = NOW() WHERE NguoiDungID = ?`,
            updateUserParams
          );
        }
      }

      // Cập nhật hosonhanvien
      const updateHSFields = [];
      const updateHSParams = [];

      if (data.KhuVucChinhID !== undefined) {
        updateHSFields.push('KhuVucChinhID = ?');
        updateHSParams.push(data.KhuVucChinhID);
      }

      if (data.TyLeHoaHong !== undefined) {
        if (data.TyLeHoaHong < 0 || data.TyLeHoaHong > 100) {
          throw new Error('Tỷ lệ hoa hồng phải từ 0-100');
        }
        updateHSFields.push('TyLeHoaHong = ?');
        updateHSParams.push(data.TyLeHoaHong);
      }

      if (data.GhiChu !== undefined) {
        updateHSFields.push('GhiChu = ?');
        updateHSParams.push(data.GhiChu);
      }

      if (updateHSFields.length > 0) {
        updateHSParams.push(nhanVienId);
        await connection.execute(
          `UPDATE hosonhanvien SET ${updateHSFields.join(', ')} WHERE NguoiDungID = ?`,
          updateHSParams
        );
      }

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan({
        TacNhan: 'Operator',
        NguoiDungID: operatorId,
        HanhDong: 'CAP_NHAT_HO_SO_NHAN_VIEN',
        DoiTuong: 'HoSoNhanVien',
        DoiTuongID: nhanVienId,
        ChiTiet: JSON.stringify({
          DuLieuCu: oldData,
          DuLieuMoi: data
        })
      });

      await connection.commit();

      // Lấy thông tin sau khi cập nhật
      return await this.layChiTietNhanVien(nhanVienId);
    } catch (error) {
      await connection.rollback();
      console.error('[HoSoNhanVienModel] Lỗi capNhatHoSo:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Tạo tài khoản nhân viên mới (user + vai trò + hồ sơ)
   * @param {Object} data - Dữ liệu nhân viên
   * @param {string} data.Email - Email (unique)
   * @param {string} data.TenDayDu - Họ tên
   * @param {string} data.SoDienThoai - Số điện thoại
   * @param {number} data.KhuVucChinhID - Khu vực chính
   * @param {number} [data.TyLeHoaHong=5] - Tỷ lệ hoa hồng (%)
   * @param {number} operatorId - ID operator thực hiện
   * @returns {Promise<{userId: number, setupToken: string}>}
   */
  static async taoTaiKhoanNhanVien(data, operatorId) {
    const connection = await db.getConnection();

    try {
      // Validation
      if (!data.Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Email)) {
        throw new Error('Email không hợp lệ');
      }

      if (!data.TenDayDu || data.TenDayDu.trim().length < 3) {
        throw new Error('Họ tên phải có ít nhất 3 ký tự');
      }

      if (!data.SoDienThoai || !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(data.SoDienThoai)) {
        throw new Error('Số điện thoại không hợp lệ');
      }

      if (!data.KhuVucChinhID) {
        throw new Error('Phải chọn khu vực chính');
      }

      await connection.beginTransaction();

      // Kiểm tra email trùng
      const [existingUsers] = await connection.execute(
        `SELECT NguoiDungID FROM nguoidung WHERE Email = ?`,
        [data.Email]
      );

      if (existingUsers.length > 0) {
        throw new Error('Email đã được sử dụng');
      }

      // Tạo mật khẩu tạm thời (sẽ bắt buộc đổi khi đăng nhập lần đầu)
      const tempPassword = this._generateTempPassword();
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Tạo nguoidung
      const [userResult] = await connection.execute(
        `INSERT INTO nguoidung 
         (TenDayDu, Email, SoDienThoai, MatKhauHash, TrangThai, TrangThaiXacMinh, TaoLuc, CapNhatLuc) 
         VALUES (?, ?, ?, ?, 'Active', 'ChuaXacMinh', NOW(), NOW())`,
        [data.TenDayDu.trim(), data.Email.toLowerCase(), data.SoDienThoai, hashedPassword]
      );

      const userId = userResult.insertId;

      // Lấy ID vai trò NhanVienBanHang
      const [vaiTroRows] = await connection.execute(
        `SELECT VaiTroID FROM vaitro WHERE TenVaiTro = 'NhanVienBanHang' LIMIT 1`
      );

      if (!vaiTroRows.length) {
        throw new Error('Vai trò NhanVienBanHang chưa được tạo trong hệ thống');
      }

      const vaiTroId = vaiTroRows[0].VaiTroID;

      // Gán vai trò
      await connection.execute(
        `INSERT INTO nguoidung_vaitro (NguoiDungID, VaiTroID) VALUES (?, ?)`,
        [userId, vaiTroId]
      );

      // Cập nhật VaiTroHoatDongID
      await connection.execute(
        `UPDATE nguoidung SET VaiTroHoatDongID = ? WHERE NguoiDungID = ?`,
        [vaiTroId, userId]
      );

      // Tạo mã nhân viên
      const maNhanVien = this._generateMaNhanVien(userId);

      // Tạo hồ sơ nhân viên
      await connection.execute(
        `INSERT INTO hosonhanvien 
         (NguoiDungID, MaNhanVien, KhuVucChinhID, TyLeHoaHong, TrangThaiLamViec, NgayBatDau) 
         VALUES (?, ?, ?, ?, 'Active', CURDATE())`,
        [userId, maNhanVien, data.KhuVucChinhID, data.TyLeHoaHong || 5]
      );

      // Tạo setup token (để gửi email)
      const setupToken = this._generateSetupToken(userId);

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan({
        TacNhan: 'Operator',
        NguoiDungID: operatorId,
        HanhDong: 'TAO_TAI_KHOAN_NHAN_VIEN',
        DoiTuong: 'NguoiDung',
        DoiTuongID: userId,
        ChiTiet: JSON.stringify({
          Email: data.Email,
          TenDayDu: data.TenDayDu,
          MaNhanVien: maNhanVien,
          KhuVucChinhID: data.KhuVucChinhID
        })
      });

      await connection.commit();

      return {
        userId,
        setupToken,
        email: data.Email,
        maNhanVien
      };
    } catch (error) {
      await connection.rollback();
      console.error('[HoSoNhanVienModel] Lỗi taoTaiKhoanNhanVien:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Kích hoạt/vô hiệu hóa nhân viên
   * @param {number} nhanVienId - ID nhân viên
   * @param {string} trangThai - 'Active' hoặc 'Inactive'
   * @param {number} operatorId - ID operator thực hiện
   * @returns {Promise<Object>}
   */
  static async kichHoat_VoHieuHoaNhanVien(nhanVienId, trangThai, operatorId) {
    const connection = await db.getConnection();

    try {
      if (!['Active', 'Inactive'].includes(trangThai)) {
        throw new Error("Trạng thái phải là 'Active' hoặc 'Inactive'");
      }

      await connection.beginTransaction();

      // Cập nhật trạng thái
      await connection.execute(
        `UPDATE hosonhanvien SET TrangThaiLamViec = ? WHERE NguoiDungID = ?`,
        [trangThai, nhanVienId]
      );

      // Nếu vô hiệu hóa, set NgayKetThuc
      if (trangThai === 'Inactive') {
        await connection.execute(
          `UPDATE hosonhanvien SET NgayKetThuc = CURDATE() WHERE NguoiDungID = ? AND NgayKetThuc IS NULL`,
          [nhanVienId]
        );
      }

      // Ghi audit log
      await NhatKyHeThongService.ghiNhan({
        TacNhan: 'Operator',
        NguoiDungID: operatorId,
        HanhDong: trangThai === 'Active' ? 'KICH_HOAT_NHAN_VIEN' : 'VO_HIEU_HOA_NHAN_VIEN',
        DoiTuong: 'HoSoNhanVien',
        DoiTuongID: nhanVienId,
        ChiTiet: JSON.stringify({ TrangThaiMoi: trangThai })
      });

      await connection.commit();

      return await this.layChiTietNhanVien(nhanVienId);
    } catch (error) {
      await connection.rollback();
      console.error('[HoSoNhanVienModel] Lỗi kichHoat_VoHieuHoaNhanVien:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Generate mật khẩu tạm thời
   * @private
   */
  static _generateTempPassword() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Generate mã nhân viên (format: NV + timestamp + random)
   * @private
   */
  static _generateMaNhanVien(userId) {
    const timestamp = Date.now().toString().slice(-6);
    const userPart = userId.toString().padStart(4, '0');
    return `NV${timestamp}${userPart}`;
  }

  /**
   * Generate setup token (JWT-like token, TTL 24h)
   * @private
   */
  static _generateSetupToken(userId) {
    const payload = {
      userId,
      type: 'setup_password',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    // Simple base64 encoding (in production, use proper JWT)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Lấy thống kê nhân viên
   * @returns {Promise<Object>}
   */
  static async layThongKeNhanVien() {
    try {
      const query = `
        SELECT 
          COUNT(CASE WHEN hs.TrangThaiLamViec = 'Active' THEN 1 END) as Active,
          COUNT(CASE WHEN hs.TrangThaiLamViec = 'Inactive' THEN 1 END) as Inactive,
          COUNT(*) as TongSo,
          AVG(hs.TyLeHoaHong) as TyLeHoaHongTrungBinh
        FROM hosonhanvien hs
      `;

      const [rows] = await db.execute(query);
      return rows[0];
    } catch (error) {
      console.error('[HoSoNhanVienModel] Lỗi layThongKeNhanVien:', error);
      throw new Error(`Lỗi lấy thống kê nhân viên: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin khu vực chính và phụ trách của nhân viên (với tên khu vực)
   * @param {number} nhanVienId - ID nhân viên (NguoiDungID)
   * @returns {Promise<Object>} Thông tin khu vực với tên
   */
  static async layKhuVucPhuTrach(nhanVienId) {
    try {
      console.log('[HoSoNhanVienModel] layKhuVucPhuTrach - nhanVienId:', nhanVienId);

      // Lấy KhuVucChinhID, KhuVucPhuTrachID + TÊN khu vực từ bảng khuvuc
      const [hoSoRows] = await db.execute(
        `SELECT 
          h.HoSoID, 
          h.KhuVucChinhID,
          kv_chinh.TenKhuVuc AS TenKhuVucChinh,
          h.KhuVucPhuTrachID,
          kv_phu.TenKhuVuc AS TenKhuVucPhuTrach
         FROM hosonhanvien h
         LEFT JOIN khuvuc kv_chinh ON h.KhuVucChinhID = kv_chinh.KhuVucID
         LEFT JOIN khuvuc kv_phu ON h.KhuVucPhuTrachID = kv_phu.KhuVucID
         WHERE h.NguoiDungID = ?`,
        [nhanVienId]
      );

      console.log('[HoSoNhanVienModel] layKhuVucPhuTrach - hoSoRows:', JSON.stringify(hoSoRows));

      if (!hoSoRows.length) {
        console.log('[HoSoNhanVienModel] layKhuVucPhuTrach - Không tìm thấy hồ sơ');
        throw new Error('Nhân viên không tồn tại');
      }

      const hoSo = hoSoRows[0];
      console.log('[HoSoNhanVienModel] layKhuVucPhuTrach - hoSo chi tiết:', hoSo);

      const result = {
        KhuVucChinhID: hoSo.KhuVucChinhID || null,
        TenKhuVucChinh: hoSo.TenKhuVucChinh || 'N/A',
        KhuVucPhuTrachID: hoSo.KhuVucPhuTrachID || null,
        TenKhuVucPhuTrach: hoSo.TenKhuVucPhuTrach || 'N/A'
      };

      console.log('[HoSoNhanVienModel] layKhuVucPhuTrach - Kết quả trả về:', result);

      return result;
    } catch (error) {
      console.error('[HoSoNhanVienModel] Lỗi layKhuVucPhuTrach:', error.message);
      if (error.message === 'Nhân viên không tồn tại') {
        throw error;
      }
      throw new Error(`Lỗi lấy khu vực phụ trách: ${error.message}`);
    }
  }
}

module.exports = HoSoNhanVienModel;






