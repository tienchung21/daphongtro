const db = require("../config/db");

class PublicTinDangModel {
  /**
   * Lấy danh sách tin đăng công khai cho trang chủ
   * 
   * Điều kiện hiển thị:
   * - Trạng thái không phải 'LuuTru'
   * - Trạng thái phải là 'DaDuyet' hoặc 'DaDang' (đã duyệt hoặc đã đăng)
   * - Phải có ít nhất 1 phòng trống (TrangThai = 'Trong')
   * 
   * @param {Object} filters - Bộ lọc tìm kiếm
   * @param {string} [filters.trangThai] - Lọc theo trạng thái cụ thể (không khuyến khích dùng, vì đã filter mặc định)
   * @param {number} [filters.duAnId] - Lọc theo dự án
   * @param {string} [filters.keyword] - Từ khóa tìm kiếm (tiêu đề, mô tả)
   * @param {number} [filters.khuVucId] - Lọc theo khu vực (bao gồm cả children)
   * @param {string} [filters.diaChi] - Tìm kiếm theo địa chỉ
   * @param {number} [filters.limit] - Giới hạn số lượng kết quả
   * @returns {Promise<Array>} Danh sách tin đăng công khai
   * @throws {Error} Nếu có lỗi xảy ra
   */
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
          AND td.TrangThai IN ('DaDuyet', 'DaDang')
          AND EXISTS (
            SELECT 1
            FROM phong_tindang pt
            JOIN phong p ON pt.PhongID = p.PhongID
            WHERE pt.TinDangID = td.TinDangID
              AND p.TrangThai = 'Trong'
          )
      `;
      const params = [];

      // 🔍 DEBUG: Log filters
      console.log("[PublicTinDangModel] Filters:", filters);
      console.log(
        "[PublicTinDangModel] ✅ Chỉ hiển thị tin đăng có trạng thái DaDuyet hoặc DaDang"
      );

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

      // Filter theo KhuVucID (bao gồm cả children nếu có)
      if (filters.khuVucId) {
        const khuVucId = Number.parseInt(filters.khuVucId, 10);
        if (!isNaN(khuVucId) && khuVucId > 0) {
          try {
            // Lấy tất cả KhuVucID con (recursive) của khu vực được chọn
            // MySQL 8.0+ và MariaDB 10.2+ hỗ trợ RECURSIVE CTE
            const [childRows] = await db.execute(
              `WITH RECURSIVE khuVucTree AS (
                SELECT KhuVucID, ParentKhuVucID, TenKhuVuc
                FROM khuvuc
                WHERE KhuVucID = ?
                UNION ALL
                SELECT kv.KhuVucID, kv.ParentKhuVucID, kv.TenKhuVuc
                FROM khuvuc kv
                INNER JOIN khuVucTree kvt ON kv.ParentKhuVucID = kvt.KhuVucID
              )
              SELECT KhuVucID FROM khuVucTree`,
              [khuVucId]
            );
            
            const khuVucIds = childRows.map((r) => r.KhuVucID);
            console.log(
              `[PublicTinDangModel] 🔍 KhuVucID ${khuVucId} và ${khuVucIds.length} children:`,
              khuVucIds
            );
            
            if (khuVucIds.length > 0) {
              const placeholders = khuVucIds.map(() => "?").join(",");
              query += ` AND td.KhuVucID IN (${placeholders})`;
              params.push(...khuVucIds);
            } else {
              // Fallback: chỉ tìm chính xác KhuVucID đó
              query += " AND td.KhuVucID = ?";
              params.push(khuVucId);
            }
          } catch (recursiveError) {
            // Nếu CTE không được hỗ trợ, fallback về cách đơn giản
            console.warn(
              "[PublicTinDangModel] ⚠️ RECURSIVE CTE không được hỗ trợ, dùng filter đơn giản:",
              recursiveError.message
            );
            query += " AND td.KhuVucID = ?";
            params.push(khuVucId);
          }
        }
      }

      // Filter theo địa chỉ (fallback - tìm kiếm theo tên khu vực)
      if (filters.diaChi) {
        query += " AND (da.DiaChi LIKE ? OR kv.TenKhuVuc LIKE ?)";
        params.push(`%${filters.diaChi}%`, `%${filters.diaChi}%`);
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
   * 
   * Điều kiện hiển thị:
   * - Trạng thái không phải 'LuuTru'
   * - Trạng thái phải là 'DaDuyet' hoặc 'DaDang' (đã duyệt hoặc đã đăng)
   * - Phải có ít nhất 1 phòng trống (TrangThai = 'Trong')
   * 
   * @param {number} tinDangId - ID tin đăng
   * @returns {Promise<Object|null>} Chi tiết tin đăng hoặc null nếu không tìm thấy
   * @throws {Error} Nếu có lỗi xảy ra
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
        da.BangHoaHong, da.SoThangCocToiThieu,
        kv.TenKhuVuc,
        (SELECT COUNT(*) FROM phong_tindang pt WHERE pt.TinDangID = td.TinDangID) as TongSoPhong
      FROM tindang td
      INNER JOIN duan da ON td.DuAnID = da.DuAnID
      LEFT JOIN khuvuc kv ON td.KhuVucID = kv.KhuVucID
      WHERE td.TinDangID = ? 
        AND td.TrangThai != 'LuuTru'
        AND td.TrangThai IN ('DaDuyet', 'DaDang')
        AND EXISTS (
          SELECT 1
          FROM phong_tindang pt
          JOIN phong p ON pt.PhongID = p.PhongID
          WHERE pt.TinDangID = td.TinDangID
            AND p.TrangThai = 'Trong'
        )
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
        WHERE pt.TinDangID = ? AND p.TrangThai = 'Trong'
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
