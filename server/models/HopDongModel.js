/**
 * @fileoverview Model quản lý Hợp đồng
 * @module HopDongModel
 * @requires config/db
 */

const db = require('../config/db');

class HopDongModel {
  /**
   * Tạo hợp đồng mới (báo cáo hợp đồng đã ký)
   * @param {Object} data - Thông tin hợp đồng
   * @param {number} data.TinDangID
   * @param {number} data.KhachHangID
   * @param {number} data.PhongID - Phòng được thuê
   * @param {string} data.NgayBatDau - YYYY-MM-DD
   * @param {string} data.NgayKetThuc - YYYY-MM-DD
   * @param {number} data.GiaThueCuoiCung
   * @param {string} data.NoiDungSnapshot - Optional: Snapshot nội dung HĐ
   * @param {string} data.FileScanPath - Optional: Đường dẫn file scan
   * @param {boolean} data.DoiTruCocVaoTienThue - Đối trừ cọc vào tiền thuê
   * @param {number} chuDuAnId - ID Chủ dự án (for validation)
   * @returns {Promise<number>} HopDongID
   */
  static async baoCaoHopDong(data, chuDuAnId) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. VALIDATE: Kiểm tra Phòng thuộc sở hữu Chủ dự án
      const [phongCheck] = await connection.query(`
        SELECT p.PhongID, p.TrangThai, p.DuAnID, da.ChuDuAnID
        FROM phong p
        JOIN duan da ON p.DuAnID = da.DuAnID
        WHERE p.PhongID = ? AND da.ChuDuAnID = ?
      `, [data.PhongID, chuDuAnId]);

      if (phongCheck.length === 0) {
        throw new Error('Phòng không tồn tại hoặc không thuộc quyền sở hữu của bạn');
      }

      if (phongCheck[0].TrangThai !== 'GiuCho') {
        throw new Error(`Phòng phải ở trạng thái "GiuCho" (hiện tại: ${phongCheck[0].TrangThai})`);
      }

      // 2. VALIDATE: Kiểm tra có Cọc hợp lệ
      const [cocCheck] = await connection.query(`
        SELECT 
          c.CocID, c.Loai, c.SoTien, c.TrangThai,
          c.ChinhSachCocID, c.QuyTacGiaiToaSnapshot
        FROM coc c
        WHERE c.PhongID = ? AND c.TrangThai = 'HieuLuc'
        ORDER BY c.TaoLuc DESC
        LIMIT 1
      `, [data.PhongID]);

      if (cocCheck.length === 0) {
        throw new Error('Không tìm thấy cọc hợp lệ cho phòng này');
      }

      const cocInfo = cocCheck[0];

      // 3. INSERT Hợp đồng
      const [hopDongResult] = await connection.query(`
        INSERT INTO hopdong (
          TinDangID, KhachHangID, NgayBatDau, NgayKetThuc,
          GiaThueCuoiCung, BaoCaoLuc, NoiDungSnapshot, FileScanPath
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
      `, [
        data.TinDangID,
        data.KhachHangID,
        data.NgayBatDau,
        data.NgayKetThuc,
        data.GiaThueCuoiCung,
        data.NoiDungSnapshot || null,
        data.FileScanPath || null
      ]);

      const hopDongId = hopDongResult.insertId;

      // 4. UPDATE Phòng → DaThue
      await connection.query(`
        UPDATE phong
        SET TrangThai = 'DaThue', CapNhatLuc = NOW()
        WHERE PhongID = ?
      `, [data.PhongID]);

      // 5. XỬ LÝ CỌC theo quy tắc
      if (data.DoiTruCocVaoTienThue) {
        // Trường hợp: Đối trừ cọc vào tiền thuê tháng đầu
        await connection.query(`
          UPDATE coc
          SET 
            TrangThai = 'DaDoiTru',
            HopDongID = ?,
            LyDoKhauTru = 'Đối trừ vào tiền thuê tháng đầu',
            CapNhatLuc = NOW()
          WHERE CocID = ?
        `, [hopDongId, cocInfo.CocID]);

      } else {
        // Trường hợp: Giải tỏa cọc (hoàn lại khách)
        await connection.query(`
          UPDATE coc
          SET 
            TrangThai = 'DaGiaiToa',
            HopDongID = ?,
            LyDoGiaiToa = 'Hợp đồng đã được ký, giải tỏa cọc theo quy tắc',
            CapNhatLuc = NOW()
          WHERE CocID = ?
        `, [hopDongId, cocInfo.CocID]);

        // TODO: Tạo GiaoDich hoàn cọc (nếu có luồng thanh toán online)
        // await GiaoDichModel.taoGiaoDichHoanCoc({
        //   CocID: cocInfo.CocID,
        //   SoTien: cocInfo.SoTien,
        //   KhachHangID: data.KhachHangID
        // });
      }

      await connection.commit();
      return hopDongId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Lấy danh sách hợp đồng của Chủ dự án
   * @param {number} chuDuAnId - ID Chủ dự án
   * @param {Object} filters - Filters: {tuNgay, denNgay}
   * @returns {Promise<Array>}
   */
  static async layDanhSach(chuDuAnId, filters = {}) {
    let query = `
      SELECT 
        hd.HopDongID,
        hd.TinDangID,
        td.TieuDe as TenTinDang,
        hd.KhachHangID,
        nd.TenDayDu as TenKhachHang,
        nd.SoDienThoai,
        p.TenPhong,
        p.PhongID,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.GiaThueCuoiCung,
        hd.BaoCaoLuc,
        hd.FileScanPath,
        c.SoTien as SoTienCoc,
        c.TrangThai as TrangThaiCoc
      FROM hopdong hd
      JOIN tindang td ON hd.TinDangID = td.TinDangID
      JOIN duan da ON td.DuAnID = da.DuAnID
      JOIN nguoidung nd ON hd.KhachHangID = nd.NguoiDungID
      LEFT JOIN coc c ON c.HopDongID = hd.HopDongID
      LEFT JOIN phong p ON c.PhongID = p.PhongID
      WHERE da.ChuDuAnID = ?
    `;

    const params = [chuDuAnId];

    if (filters.tuNgay) {
      query += ` AND hd.NgayBatDau >= ?`;
      params.push(filters.tuNgay);
    }

    if (filters.denNgay) {
      query += ` AND hd.NgayKetThuc <= ?`;
      params.push(filters.denNgay);
    }

    query += ` ORDER BY hd.BaoCaoLuc DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Lấy chi tiết hợp đồng
   * @param {number} hopDongId
   * @param {number} chuDuAnId - For ownership check
   * @returns {Promise<Object|null>}
   */
  static async layChiTiet(hopDongId, chuDuAnId) {
    const [rows] = await db.query(`
      SELECT 
        hd.*,
        td.TieuDe as TenTinDang,
        td.DiaChi,
        nd.TenDayDu as TenKhachHang,
        nd.Email as EmailKhachHang,
        nd.SoDienThoai as SdtKhachHang,
        p.TenPhong,
        p.TrangThai as TrangThaiPhong,
        c.CocID,
        c.SoTien as SoTienCoc,
        c.TrangThai as TrangThaiCoc,
        c.LyDoGiaiToa,
        c.LyDoKhauTru
      FROM hopdong hd
      JOIN tindang td ON hd.TinDangID = td.TinDangID
      JOIN duan da ON td.DuAnID = da.DuAnID
      JOIN nguoidung nd ON hd.KhachHangID = nd.NguoiDungID
      LEFT JOIN coc c ON c.HopDongID = hd.HopDongID
      LEFT JOIN phong p ON c.PhongID = p.PhongID
      WHERE hd.HopDongID = ? AND da.ChuDuAnID = ?
    `, [hopDongId, chuDuAnId]);

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Cập nhật file scan cho hợp đồng
   * @param {number} hopDongId
   * @param {string} filePath - Đường dẫn file
   * @param {number} chuDuAnId - For ownership check
   * @returns {Promise<boolean>}
   */
  static async capNhatFileScan(hopDongId, filePath, chuDuAnId) {
    // Verify ownership
    const [check] = await db.query(`
      SELECT hd.HopDongID
      FROM hopdong hd
      JOIN tindang td ON hd.TinDangID = td.TinDangID
      JOIN duan da ON td.DuAnID = da.DuAnID
      WHERE hd.HopDongID = ? AND da.ChuDuAnID = ?
    `, [hopDongId, chuDuAnId]);

    if (check.length === 0) {
      throw new Error('Hợp đồng không tồn tại hoặc không thuộc quyền sở hữu');
    }

    await db.query(`
      UPDATE hopdong
      SET FileScanPath = ?
      WHERE HopDongID = ?
    `, [filePath, hopDongId]);

    return true;
  }
}

module.exports = HopDongModel;
