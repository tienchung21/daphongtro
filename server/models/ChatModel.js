/**
 * @fileoverview Model quản lý Chat/Messaging
 * @module ChatModel
 * @requires config/db
 */

const db = require('../config/db');

class ChatModel {
  /**
   * Tạo hoặc lấy cuộc hội thoại
   * @param {Object} data
   * @param {number} data.NguCanhID - ID của TinDang, CuocHen, HopDong
   * @param {string} data.NguCanhLoai - 'TinDang', 'CuocHen', 'HopDong', 'HeThong'
   * @param {number[]} data.ThanhVienIDs - Mảng ID người dùng tham gia
   * @param {string} [data.TieuDe] - Tiêu đề cuộc hội thoại
   * @returns {Promise<number>} CuocHoiThoaiID
   */
  static async taoHoacLayCuocHoiThoai(data) {
    const { NguCanhID, NguCanhLoai, ThanhVienIDs, TieuDe } = data;

    // Kiểm tra xem cuộc hội thoại đã tồn tại chưa
    const [existing] = await db.query(`
      SELECT ch.CuocHoiThoaiID
      FROM cuochoithoai ch
      WHERE ch.NguCanhID = ? AND ch.NguCanhLoai = ?
      LIMIT 1
    `, [NguCanhID, NguCanhLoai]);

    if (existing.length > 0) {
      return existing[0].CuocHoiThoaiID;
    }

    // Tạo mới cuộc hội thoại
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(`
        INSERT INTO cuochoithoai (NguCanhID, NguCanhLoai, TieuDe, DangHoatDong)
        VALUES (?, ?, ?, 1)
      `, [NguCanhID, NguCanhLoai, TieuDe || null]);

      const cuocHoiThoaiID = result.insertId;

      // Thêm thành viên
      if (ThanhVienIDs && ThanhVienIDs.length > 0) {
        const values = ThanhVienIDs.map(id => [cuocHoiThoaiID, id]);
        await connection.query(`
          INSERT INTO thanhviencuochoithoai (CuocHoiThoaiID, NguoiDungID)
          VALUES ?
        `, [values]);
      }

      await connection.commit();
      return cuocHoiThoaiID;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Lấy danh sách cuộc hội thoại của người dùng
   * @param {number} nguoiDungID
   * @param {Object} options - {limit, offset}
   * @returns {Promise<Array>} Danh sách cuộc hội thoại với unread count
   */
  static async layDanhSachCuocHoiThoai(nguoiDungID, options = {}) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const [rows] = await db.query(`
      SELECT 
        ch.CuocHoiThoaiID,
        ch.NguCanhID,
        ch.NguCanhLoai,
        ch.TieuDe,
        ch.ThoiDiemTinNhanCuoi,
        ch.DangHoatDong,
        tv.TinNhanCuoiDocLuc,
        
        -- Tin nhắn cuối cùng
        (SELECT NoiDung FROM tinnhan 
         WHERE CuocHoiThoaiID = ch.CuocHoiThoaiID 
         AND DaXoa = 0
         ORDER BY ThoiGian DESC LIMIT 1) as TinNhanCuoi,
        
        (SELECT NguoiGuiID FROM tinnhan 
         WHERE CuocHoiThoaiID = ch.CuocHoiThoaiID 
         AND DaXoa = 0
         ORDER BY ThoiGian DESC LIMIT 1) as NguoiGuiIDCuoi,
        
        -- Số tin nhắn chưa đọc
        (SELECT COUNT(*) FROM tinnhan t
         WHERE t.CuocHoiThoaiID = ch.CuocHoiThoaiID
         AND t.DaXoa = 0
         AND t.NguoiGuiID != ?
         AND (tv.TinNhanCuoiDocLuc IS NULL OR t.ThoiGian > tv.TinNhanCuoiDocLuc)
        ) as SoTinChuaDoc,
        
        -- Thông tin người dùng khác trong cuộc hội thoại
        GROUP_CONCAT(
          DISTINCT CASE WHEN tv2.NguoiDungID != ? 
          THEN CONCAT(tv2.NguoiDungID, ':', nd.TenDayDu) 
          END SEPARATOR '|'
        ) as ThanhVienKhac
        
      FROM cuochoithoai ch
      INNER JOIN thanhviencuochoithoai tv ON ch.CuocHoiThoaiID = tv.CuocHoiThoaiID
      LEFT JOIN thanhviencuochoithoai tv2 ON ch.CuocHoiThoaiID = tv2.CuocHoiThoaiID
      LEFT JOIN nguoidung nd ON tv2.NguoiDungID = nd.NguoiDungID
      WHERE tv.NguoiDungID = ?
      AND ch.DangHoatDong = 1
      GROUP BY ch.CuocHoiThoaiID
      ORDER BY ch.ThoiDiemTinNhanCuoi DESC
      LIMIT ? OFFSET ?
    `, [nguoiDungID, nguoiDungID, nguoiDungID, limit, offset]);

    return rows.map(row => ({
      ...row,
      ThanhVienKhac: row.ThanhVienKhac ? row.ThanhVienKhac.split('|').map(item => {
        const [id, ten] = item.split(':');
        return { NguoiDungID: parseInt(id), TenDayDu: ten };
      }) : []
    }));
  }

  /**
   * Lấy tin nhắn trong cuộc hội thoại
   * @param {number} cuocHoiThoaiID
   * @param {Object} options - {limit, offset, beforeTimestamp}
   * @returns {Promise<Array>}
   */
  static async layTinNhan(cuocHoiThoaiID, options = {}) {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const beforeTimestamp = options.beforeTimestamp;

    let query = `
      SELECT 
        t.TinNhanID,
        t.CuocHoiThoaiID,
        t.NguoiGuiID,
        t.NoiDung,
        t.ThoiGian,
        t.DaXoa,
        nd.TenDayDu as NguoiGuiTen
      FROM tinnhan t
      JOIN nguoidung nd ON t.NguoiGuiID = nd.NguoiDungID
      WHERE t.CuocHoiThoaiID = ?
      AND t.DaXoa = 0
    `;

    const params = [cuocHoiThoaiID];

    if (beforeTimestamp) {
      query += ` AND t.ThoiGian < ?`;
      params.push(beforeTimestamp);
    }

    query += ` ORDER BY t.ThoiGian DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows.reverse(); // Reverse để tin nhắn cũ ở trên, mới ở dưới
  }

  /**
   * Gửi tin nhắn
   * @param {Object} data
   * @param {number} data.CuocHoiThoaiID
   * @param {number} data.NguoiGuiID
   * @param {string} data.NoiDung
   * @returns {Promise<Object>} Tin nhắn vừa tạo
   */
  static async guiTinNhan(data) {
    const { CuocHoiThoaiID, NguoiGuiID, NoiDung } = data;

    // Kiểm tra người dùng có phải thành viên của cuộc hội thoại không
    const [membership] = await db.query(`
      SELECT 1 FROM thanhviencuochoithoai
      WHERE CuocHoiThoaiID = ? AND NguoiDungID = ?
    `, [CuocHoiThoaiID, NguoiGuiID]);

    if (membership.length === 0) {
      throw new Error('Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này');
    }

    // Insert tin nhắn (Trigger sẽ tự động cập nhật ThoiDiemTinNhanCuoi)
    const [result] = await db.query(`
      INSERT INTO tinnhan (CuocHoiThoaiID, NguoiGuiID, NoiDung)
      VALUES (?, ?, ?)
    `, [CuocHoiThoaiID, NguoiGuiID, NoiDung]);

    // Lấy tin nhắn vừa tạo
    const [tinNhan] = await db.query(`
      SELECT 
        t.*,
        nd.TenDayDu as NguoiGuiTen
      FROM tinnhan t
      JOIN nguoidung nd ON t.NguoiGuiID = nd.NguoiDungID
      WHERE t.TinNhanID = ?
    `, [result.insertId]);

    return tinNhan[0];
  }

  /**
   * Đánh dấu đã đọc
   * @param {number} cuocHoiThoaiID
   * @param {number} nguoiDungID
   * @returns {Promise<boolean>}
   */
  static async danhDauDaDoc(cuocHoiThoaiID, nguoiDungID) {
    await db.query(`
      UPDATE thanhviencuochoithoai
      SET TinNhanCuoiDocLuc = NOW()
      WHERE CuocHoiThoaiID = ? AND NguoiDungID = ?
    `, [cuocHoiThoaiID, nguoiDungID]);

    return true;
  }

  /**
   * Xóa mềm tin nhắn
   * @param {number} tinNhanID
   * @param {number} nguoiDungID - Chỉ người gửi mới được xóa
   * @returns {Promise<boolean>}
   */
  static async xoaTinNhan(tinNhanID, nguoiDungID) {
    const [result] = await db.query(`
      UPDATE tinnhan
      SET DaXoa = 1
      WHERE TinNhanID = ? AND NguoiGuiID = ?
    `, [tinNhanID, nguoiDungID]);

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy tin nhắn hoặc bạn không có quyền xóa');
    }

    return true;
  }

  /**
   * Kiểm tra quyền truy cập cuộc hội thoại
   * @param {number} cuocHoiThoaiID
   * @param {number} nguoiDungID
   * @returns {Promise<boolean>}
   */
  static async kiemTraQuyenTruyCap(cuocHoiThoaiID, nguoiDungID) {
    const [result] = await db.query(`
      SELECT 1 FROM thanhviencuochoithoai
      WHERE CuocHoiThoaiID = ? AND NguoiDungID = ?
    `, [cuocHoiThoaiID, nguoiDungID]);

    return result.length > 0;
  }

  /**
   * Lấy chi tiết cuộc hội thoại
   * @param {number} cuocHoiThoaiID
   * @param {number} nguoiDungID - For authorization check
   * @returns {Promise<Object|null>}
   */
  static async layChiTietCuocHoiThoai(cuocHoiThoaiID, nguoiDungID) {
    // Kiểm tra quyền truy cập
    const hasAccess = await this.kiemTraQuyenTruyCap(cuocHoiThoaiID, nguoiDungID);
    if (!hasAccess) {
      throw new Error('Bạn không có quyền truy cập cuộc hội thoại này');
    }

    const [rows] = await db.query(`
      SELECT 
        ch.*,
        GROUP_CONCAT(
          CONCAT(nd.NguoiDungID, ':', nd.TenDayDu)
          SEPARATOR '|'
        ) as ThanhVien
      FROM cuochoithoai ch
      LEFT JOIN thanhviencuochoithoai tv ON ch.CuocHoiThoaiID = tv.CuocHoiThoaiID
      LEFT JOIN nguoidung nd ON tv.NguoiDungID = nd.NguoiDungID
      WHERE ch.CuocHoiThoaiID = ?
      GROUP BY ch.CuocHoiThoaiID
    `, [cuocHoiThoaiID]);

    if (rows.length === 0) return null;

    const result = rows[0];
    result.ThanhVien = result.ThanhVien ? result.ThanhVien.split('|').map(item => {
      const [id, ten] = item.split(':');
      return {
        NguoiDungID: parseInt(id),
        TenDayDu: ten
      };
    }) : [];

    return result;
  }
}

module.exports = ChatModel;

