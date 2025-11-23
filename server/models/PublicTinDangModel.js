const db = require("../config/db");

class PublicTinDangModel {
  static async layTatCaTinDang(filters = {}) {
    try {
      let query = `
        SELECT 
          td.TinDangID, td.DuAnID, td.KhuVucID, td.ChinhSachCocID,
          td.TieuDe, td.URL, td.MoTa,
          td.TienIch, td.GiaDien, td.GiaNuoc, td.GiaDichVu, td.MoTaGiaDichVu,
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
          td.TrangThai, td.TaoLuc, td.CapNhatLuc, td.DuyetLuc,
          da.TenDuAn, da.DiaChi AS DiaChi, da.YeuCauPheDuyetChu,
          da.ViDo, da.KinhDo,
          kv.TenKhuVuc,
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

      // 🔍 DEBUG: Log filters
      console.log("[PublicTinDangModel] Filters:", filters);

      // Optional: chỉ public tin đã duyệt/đang đăng
      // 🔧 TẠM THỜI bỏ filter này để test - lấy tất cả tin (trừ LuuTru)
      if (filters.onlyPublic === "true") {
        console.log(
          "[PublicTinDangModel] ⚠️ Applying onlyPublic filter - only DaDang/DaDuyet"
        );
        query += ` AND td.TrangThai IN ('DaDang','DaDuyet')`;
      } else {
        console.log(
          "[PublicTinDangModel] ✅ No onlyPublic filter - getting all non-archived listings"
        );
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

      console.log("[PublicTinDangModel] 🔍 Final Query:", query);
      console.log("[PublicTinDangModel] 🔍 Query Params:", params);

      const [rows] = await db.execute(query, params);

      console.log(`[PublicTinDangModel] ✅ Found ${rows.length} listings`);
      if (rows.length > 0) {
        console.log("[PublicTinDangModel] 📋 Sample listing:", {
          TinDangID: rows[0].TinDangID,
          TieuDe: rows[0].TieuDe,
          TrangThai: rows[0].TrangThai,
          Gia: rows[0].Gia,
        });
      }

      return rows;
    } catch (err) {
      throw new Error(
        `Lỗi khi lấy danh sách tin đăng công khai: ${err.message}`
      );
    }
  }

  /**
   * Lấy chi tiết tin đăng công khai (bao gồm danh sách phòng)
   * @param {number} tinDangId - ID tin đăng
   * @returns {Promise<Object|null>} Chi tiết tin đăng hoặc null nếu không tìm thấy
   */
  static async layChiTietTinDang(tinDangId) {
    try {
      console.log(
        `[PublicTinDangModel] 🔍 Getting detail for TinDangID: ${tinDangId}`
      );

      // Query chi tiết tin đăng
      const queryTinDang = `
      SELECT 
        td.TinDangID, td.DuAnID, td.KhuVucID, td.ChinhSachCocID,
        td.TieuDe, td.URL, td.MoTa,
        td.TienIch, td.GiaDien, td.GiaNuoc, td.GiaDichVu, td.MoTaGiaDichVu,
        td.TrangThai, td.TaoLuc, td.CapNhatLuc, td.DuyetLuc,td.KhuVucID,
        da.ChuDuAnID, da.TenDuAn,da.PhuongThucVao, da.DiaChi, da.YeuCauPheDuyetChu,
        da.ViDo, da.KinhDo,
        kv.TenKhuVuc,
        (SELECT COUNT(*) FROM phong_tindang pt WHERE pt.TinDangID = td.TinDangID) as TongSoPhong
      FROM tindang td
      INNER JOIN duan da ON td.DuAnID = da.DuAnID
      LEFT JOIN khuvuc kv ON td.KhuVucID = kv.KhuVucID
      WHERE td.TinDangID = ? AND td.TrangThai != 'LuuTru'
    `;

      const [rows] = await db.execute(queryTinDang, [tinDangId]);

      if (rows.length === 0) {
        console.log(`[PublicTinDangModel] ❌ Tin đăng ${tinDangId} not found`);
        return null;
      }

      const tinDang = rows[0];

      // Query danh sách phòng (nếu có)
      const queryPhong = `
        SELECT 
          p.PhongID, p.TenPhong,
          p.TrangThai as TrangThaiPhong,
          COALESCE(pt.GiaTinDang, p.GiaChuan) as Gia,
          COALESCE(pt.DienTichTinDang, p.DienTichChuan) as DienTich,
          p.HinhAnhPhong as AnhPhong
        FROM phong_tindang pt
        INNER JOIN phong p ON pt.PhongID = p.PhongID
        WHERE pt.TinDangID = ?
        ORDER BY p.PhongID ASC
      `;

      const [phongRows] = await db.execute(queryPhong, [tinDangId]);

      // Attach danh sách phòng vào tin đăng
      tinDang.DanhSachPhong = phongRows;

      console.log(
        `[PublicTinDangModel] ✅ Found tin đăng with ${phongRows.length} phòng`
      );

      return tinDang;
    } catch (err) {
      console.error("[PublicTinDangModel] Error:", err);
      throw new Error(`Lỗi khi lấy chi tiết tin đăng: ${err.message}`);
    }
  }
}

module.exports = PublicTinDangModel;
