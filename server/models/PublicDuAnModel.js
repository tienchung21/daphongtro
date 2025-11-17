const db = require("../config/db");

class PublicDuAnModel {
  static async layTatCaDuAn(filters = {}) {
    try {
      let query = `
        SELECT 
          da.DuAnID,
          da.TenDuAn,
          da.DiaChi,
          da.TrangThai,
          da.YeuCauPheDuyetChu,
          da.PhuongThucVao,
          da.ViDo,
          da.KinhDo,
          da.TaoLuc,
          da.CapNhatLuc,
          (SELECT COUNT(*) FROM tindang td WHERE td.DuAnID = da.DuAnID AND td.TrangThai != 'LuuTru') as SoTinDang,
          (SELECT COUNT(*) FROM tindang td WHERE td.DuAnID = da.DuAnID AND td.TrangThai IN ('DaDang','DaDuyet','ChoDuyet')) as TinDangHoatDong,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID) as TongPhong,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID AND p.TrangThai = 'Trong') as PhongTrong,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID AND p.TrangThai = 'GiuCho') as PhongGiuCho,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID AND p.TrangThai = 'DaThue') as PhongDaThue,
          (SELECT COUNT(*) FROM phong p WHERE p.DuAnID = da.DuAnID AND p.TrangThai = 'DonDep') as PhongDonDep
        FROM duan da
        WHERE 1=1
      `;
      const params = [];

      if (filters.trangThai) {
        query += " AND da.TrangThai = ?";
        params.push(filters.trangThai);
      }

      if (filters.keyword) {
        query += " AND (da.TenDuAn LIKE ? OR da.DiaChi LIKE ?)";
        params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
      }

      query += " ORDER BY da.CapNhatLuc DESC";

      if (filters.limit) {
        const limitNum = Number.parseInt(filters.limit, 10) || 50;
        query += ` LIMIT ${limitNum}`;
      }

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (err) {
      throw new Error(`Lỗi khi lấy danh sách dự án công khai: ${err.message}`);
    }
  }
}

module.exports = PublicDuAnModel;
