const db = require("../config/db");

class PublicTinDangModel {
  static async layTatCaTinDang(filters = {}) {
    try {
      let query = `
        SELECT 
          td.TinDangID, td.DuAnID, td.KhuVucID, td.ChinhSachCocID,
          td.TieuDe, td.URL, td.MoTa,
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
          da.TenDuAn, da.DiaChi AS DiaChi, da.YeuCauPheDuyetChu,
          (SELECT COUNT(*) FROM phong_tindang pt WHERE pt.TinDangID = td.TinDangID) as TongSoPhong,
          (SELECT COUNT(*) FROM phong_tindang pt 
             JOIN phong p ON pt.PhongID = p.PhongID 
             WHERE pt.TinDangID = td.TinDangID AND p.TrangThai = 'Trong') as SoPhongTrong
        FROM tindang td
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        LEFT JOIN khuvuc kv ON td.KhuVucID = kv.KhuVucID
        WHERE td.TrangThai != 'LuuTru'
      `;
      const params = [];

      // Optional: chỉ public tin đã duyệt/đang đăng
      if (filters.onlyPublic === "true") {
        query += ` AND td.TrangThai IN ('DaDang','DaDuyet')`;
      }

      if (filters.trangThai) {
        query += " AND td.TrangThai = ?";
        params.push(filters.trangThai);
      }

      if (filters.duAnId) {
        query += " AND td.DuAnID = ?";
        params.push(filters.duAnId);
      }

      if (filters.keyword) {
        query += " AND (td.TieuDe LIKE ? OR td.MoTa LIKE ?)";
        params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
      }

      query += " ORDER BY td.CapNhatLuc DESC";

      if (filters.limit) {
        const limitNum = Number.parseInt(filters.limit, 10) || 50;
        query += ` LIMIT ${limitNum}`;
      }

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (err) {
      throw new Error(
        `Lỗi khi lấy danh sách tin đăng công khai: ${err.message}`
      );
    }
  }
}

module.exports = PublicTinDangModel;
