/**
 * Model cho Cuộc hẹn
 * Quản lý các nghiệp vụ liên quan đến cuộc hẹn xem phòng
 * Tách từ ChuDuAnModel.js theo domain-driven design
 */

const db = require("../config/db");

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

class CuocHenModel {
  /**
   * UC-CUST-03: Tạo cuộc hẹn mới
   * @param {Object} data - Dữ liệu cuộc hẹn
   * @param {number} data.PhongID - ID phòng
   * @param {number} data.KhachHangID - ID khách hàng
   * @param {string} data.ThoiGianHen - Thời gian hẹn (ISO datetime)
   * @param {number} [data.NhanVienBanHangID] - ID nhân viên (auto-assign nếu null)
   * @param {string} [data.GhiChu] - Ghi chú từ khách hàng
   * @returns {Promise<{CuocHenID: number}>}
   */
  static async taoMoi(data) {
    try {
      const { PhongID, KhachHangID, ThoiGianHen, NhanVienBanHangID, GhiChu } =
        data;

      // 1. Kiểm tra phòng có trống không
      const [phongRows] = await db.execute(
        "SELECT TrangThai FROM phong WHERE PhongID = ?",
        [PhongID]
      );

      if (phongRows.length === 0) {
        throw new Error("Phòng không tồn tại");
      }

      if (phongRows[0].TrangThai !== "Trong") {
        throw new Error("Phòng không còn trống");
      }

      // 2. Kiểm tra slot trùng lặp (trong khoảng ±1 giờ)
      const [slotRows] = await db.execute(
        `
        SELECT COUNT(*) as count 
        FROM cuochen 
        WHERE PhongID = ? 
          AND TrangThai NOT IN ('HuyBoiKhach', 'HuyBoiHeThong', 'KhachKhongDen')
          AND ABS(TIMESTAMPDIFF(MINUTE, ThoiGianHen, ?)) < 60
      `,
        [PhongID, ThoiGianHen]
      );

      if (slotRows[0].count > 0) {
        throw new Error(
          "Slot thời gian này đã được đặt. Vui lòng chọn slot khác."
        );
      }

      // 3. Lấy thông tin dự án + tin đăng để check yêu cầu phê duyệt
      const [duAnRows] = await db.execute(
        `
        SELECT da.YeuCauPheDuyetChu, da.DuAnID, da.ChuDuAnID, pt.TinDangID
        FROM phong p
        INNER JOIN duan da ON p.DuAnID = da.DuAnID
        LEFT JOIN phong_tindang pt ON pt.PhongID = p.PhongID
        WHERE p.PhongID = ?
        LIMIT 1
      `,
        [PhongID]
      );

      if (duAnRows.length === 0) {
        throw new Error("Không tìm thấy thông tin dự án cho phòng này");
      }

      const yeuCauPheDuyet = duAnRows[0]?.YeuCauPheDuyetChu || 0;
      const chuDuAnID = duAnRows[0]?.ChuDuAnID;
      const tinDangID = duAnRows[0]?.TinDangID;

      if (!tinDangID) {
        throw new Error("Phòng này chưa có tin đăng");
      }

      // 4. Tạo cuộc hẹn
      const trangThai = yeuCauPheDuyet ? "ChoXacNhan" : "DaXacNhan";
      const pheDuyetChuDuAn = yeuCauPheDuyet ? "ChoPheDuyet" : "DaPheDuyet";

      // Auto-assign nhân viên bán hàng nếu không truyền vào
      let nhanVienId = NhanVienBanHangID;

      if (!nhanVienId) {
        // Lấy nhân viên bán hàng có sẵn (VaiTroHoatDongID = 2)
        const [nvRows] = await db.execute(`
          SELECT NguoiDungID 
          FROM nguoidung 
          WHERE VaiTroHoatDongID = 2 AND TrangThai = 'HoatDong'
          ORDER BY NguoiDungID ASC 
          LIMIT 1
        `);

        if (nvRows.length > 0) {
          nhanVienId = nvRows[0].NguoiDungID;
          console.log(`[CuocHenModel] ℹ️ Auto-assigned NVBH ID: ${nhanVienId}`);
        } else {
          console.warn(
            "[CuocHenModel] ⚠️ Không tìm thấy nhân viên bán hàng nào!"
          );
          nhanVienId = null; // Để NULL nếu không có NVBH
        }
      }

      const [result] = await db.execute(
        `
        INSERT INTO cuochen 
        (PhongID, TinDangID, ChuDuAnID, KhachHangID, NhanVienBanHangID, ThoiGianHen, TrangThai, PheDuyetChuDuAn, GhiChu, GhiChuKetQua, TaoLuc, CapNhatLuc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
        [
          PhongID,
          tinDangID,
          chuDuAnID,
          KhachHangID,
          nhanVienId,
          ThoiGianHen,
          trangThai,
          pheDuyetChuDuAn,
          GhiChu || "", // GhiChu - NOT NULL field
          "", // GhiChuKetQua - NULL field (result notes)
        ]
      );

      console.log(
        `[CuocHenModel] ✅ Tạo cuộc hẹn #${
          result.insertId
        } cho PhongID=${PhongID}, KhachHangID=${KhachHangID}, NVBH=${
          nhanVienId || "NULL"
        }`
      );

      return { CuocHenID: result.insertId };
    } catch (error) {
      console.error("[CuocHenModel] ❌ Lỗi tạo cuộc hẹn:", error);
      throw new Error(`Lỗi khi tạo cuộc hẹn: ${error.message}`);
    }
  }

  /**
   * Lấy tất cả cuộc hẹn (Admin)
   * @param {Object} filters - Bộ lọc
   * @returns {Promise<CuocHen[]>}
   */
  static async layTatCa(filters = {}) {
    try {
      let query = `
        SELECT 
          ch.CuocHenID, ch.PhongID, ch.KhachHangID, ch.NhanVienBanHangID,
          ch.TrangThai, ch.PheDuyetChuDuAn, ch.ThoiGianHen, ch.GhiChuKetQua, ch.TaoLuc,
          p.TenPhong,
          kh.TenDayDu as TenKhachHang, kh.SoDienThoai as SDTKhachHang,
          nv.TenDayDu as TenNhanVien, nv.SoDienThoai as SDTNhanVien,
          da.TenDuAn, da.DiaChi
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN duan da ON p.DuAnID = da.DuAnID
        LEFT JOIN nguoidung kh ON ch.KhachHangID = kh.NguoiDungID
        LEFT JOIN nguoidung nv ON ch.NhanVienBanHangID = nv.NguoiDungID
        WHERE 1=1
      `;

      const params = [];

      if (filters.trangThai) {
        query += " AND ch.TrangThai = ?";
        params.push(filters.trangThai);
      }

      query += " ORDER BY ch.ThoiGianHen DESC LIMIT 100";

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Lỗi khi lấy tất cả cuộc hẹn: ${error.message}`);
    }
  }

  /**
   * Tìm cuộc hẹn theo Khách hàng
   * @param {number} khachHangId - ID khách hàng
   * @returns {Promise<CuocHen[]>}
   */
  static async timTheoKhachHang(khachHangId) {
    try {
      const [rows] = await db.execute(
        `
        SELECT 
          ch.CuocHenID, ch.PhongID, ch.TrangThai, ch.PheDuyetChuDuAn,
          ch.ThoiGianHen, ch.GhiChuKetQua, ch.TaoLuc,
          p.TenPhong,
          da.TenDuAn, da.DiaChi,
          nv.TenDayDu as TenNhanVien, nv.SoDienThoai as SDTNhanVien
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN duan da ON p.DuAnID = da.DuAnID
        LEFT JOIN nguoidung nv ON ch.NhanVienBanHangID = nv.NguoiDungID
        WHERE ch.KhachHangID = ?
        ORDER BY ch.ThoiGianHen DESC
      `,
        [khachHangId]
      );

      return rows;
    } catch (error) {
      throw new Error(`Lỗi khi tìm cuộc hẹn theo khách hàng: ${error.message}`);
    }
  }

  /**
   * Tìm cuộc hẹn theo Nhân viên
   * @param {number} nhanVienId - ID nhân viên bán hàng
   * @returns {Promise<CuocHen[]>}
   */
  static async timTheoNhanVien(nhanVienId) {
    try {
      const [rows] = await db.execute(
        `
        SELECT 
          ch.CuocHenID, ch.PhongID, ch.TrangThai, ch.PheDuyetChuDuAn,
          ch.ThoiGianHen, ch.GhiChuKetQua, ch.TaoLuc,
          p.TenPhong,
          da.TenDuAn, da.DiaChi,
          kh.TenDayDu as TenKhachHang, kh.SoDienThoai as SDTKhachHang
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN duan da ON p.DuAnID = da.DuAnID
        LEFT JOIN nguoidung kh ON ch.KhachHangID = kh.NguoiDungID
        WHERE ch.NhanVienBanHangID = ?
        ORDER BY ch.ThoiGianHen DESC
      `,
        [nhanVienId]
      );

      return rows;
    } catch (error) {
      throw new Error(`Lỗi khi tìm cuộc hẹn theo nhân viên: ${error.message}`);
    }
  }

  /**
   * Tìm cuộc hẹn theo Chủ dự án
   * @param {number} chuDuAnId - ID chủ dự án
   * @returns {Promise<CuocHen[]>}
   */
  static async timTheoChuDuAn(chuDuAnId) {
    try {
      const [rows] = await db.execute(
        `
        SELECT 
          ch.CuocHenID, ch.PhongID, ch.TrangThai, ch.PheDuyetChuDuAn,
          ch.ThoiGianHen, ch.GhiChuKetQua, ch.TaoLuc,
          p.TenPhong,
          da.TenDuAn,
          kh.TenDayDu as TenKhachHang, kh.SoDienThoai as SDTKhachHang,
          nv.TenDayDu as TenNhanVien, nv.SoDienThoai as SDTNhanVien
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN duan da ON p.DuAnID = da.DuAnID
        LEFT JOIN nguoidung kh ON ch.KhachHangID = kh.NguoiDungID
        LEFT JOIN nguoidung nv ON ch.NhanVienBanHangID = nv.NguoiDungID
        WHERE da.ChuDuAnID = ?
        ORDER BY ch.ThoiGianHen DESC
      `,
        [chuDuAnId]
      );

      return rows;
    } catch (error) {
      throw new Error(`Lỗi khi tìm cuộc hẹn theo chủ dự án: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết cuộc hẹn
   * @param {number} cuocHenId - ID cuộc hẹn
   * @returns {Promise<CuocHen|null>}
   */
  static async layChiTiet(cuocHenId) {
    try {
      const [rows] = await db.execute(
        `
        SELECT 
          ch.*,
          p.TenPhong, p.TrangThai as TrangThaiPhong,
          da.TenDuAn, da.DiaChi, da.ViDo, da.KinhDo,
          kh.TenDayDu as TenKhachHang, kh.SoDienThoai as SDTKhachHang, kh.Email as EmailKhachHang,
          nv.TenDayDu as TenNhanVien, nv.SoDienThoai as SDTNhanVien, nv.Email as EmailNhanVien
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN duan da ON p.DuAnID = da.DuAnID
        LEFT JOIN nguoidung kh ON ch.KhachHangID = kh.NguoiDungID
        LEFT JOIN nguoidung nv ON ch.NhanVienBanHangID = nv.NguoiDungID
        WHERE ch.CuocHenID = ?
      `,
        [cuocHenId]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Lỗi khi lấy chi tiết cuộc hẹn: ${error.message}`);
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
        query += " AND ch.TrangThai = ?";
        params.push(filters.trangThai);
      }

      if (filters.tinDangId) {
        query += " AND td.TinDangID = ?";
        params.push(filters.tinDangId);
      }

      if (filters.tuNgay && filters.denNgay) {
        query += " AND ch.ThoiGianHen BETWEEN ? AND ?";
        params.push(filters.tuNgay, filters.denNgay);
      }

      query += " ORDER BY ch.ThoiGianHen DESC";

      if (filters.limit) {
        query += " LIMIT ?";
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
  static async xacNhanCuocHen(cuocHenId, chuDuAnId, ghiChu = "") {
    try {
      // Kiểm tra quyền sở hữu cuộc hẹn (join đúng qua phong → tindang → duan)
      const [rows] = await db.execute(
        `
        SELECT ch.TrangThai 
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE ch.CuocHenID = ? AND da.ChuDuAnID = ?
      `,
        [cuocHenId, chuDuAnId]
      );

      if (rows.length === 0) {
        throw new Error("Không tìm thấy cuộc hẹn hoặc không có quyền xác nhận");
      }

      if (rows[0].TrangThai !== "ChoXacNhan") {
        throw new Error(
          "Chỉ có thể xác nhận cuộc hẹn ở trạng thái Chờ xác nhận"
        );
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
      const [rows] = await db.execute(
        `
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
      `,
        [chuDuAnId]
      );

      return (
        rows[0] || {
          choDuyet: 0,
          daXacNhan: 0,
          sapDienRa: 0,
          daHuy: 0,
          hoanThanh: 0,
        }
      );
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
  static async pheDuyetCuocHen(
    cuocHenId,
    chuDuAnId,
    phuongThucVao,
    ghiChu = ""
  ) {
    try {
      // Kiểm tra quyền sở hữu và trạng thái
      const [rows] = await db.execute(
        `
        SELECT ch.PheDuyetChuDuAn, ch.TrangThai 
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE ch.CuocHenID = ? AND da.ChuDuAnID = ?
      `,
        [cuocHenId, chuDuAnId]
      );

      if (rows.length === 0) {
        throw new Error(
          "Không tìm thấy cuộc hẹn hoặc không có quyền phê duyệt"
        );
      }

      if (rows[0].PheDuyetChuDuAn !== "ChoPheDuyet") {
        throw new Error(
          "Chỉ có thể phê duyệt cuộc hẹn ở trạng thái Chờ phê duyệt"
        );
      }

      // Cập nhật phê duyệt và lưu phương thức vào
      await db.execute(
        `
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
      `,
        [phuongThucVao, ghiChu, cuocHenId]
      );

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
      const [rows] = await db.execute(
        `
        SELECT ch.PheDuyetChuDuAn, ch.TrangThai 
        FROM cuochen ch
        INNER JOIN phong p ON ch.PhongID = p.PhongID
        INNER JOIN phong_tindang pt ON p.PhongID = pt.PhongID
        INNER JOIN tindang td ON pt.TinDangID = td.TinDangID
        INNER JOIN duan da ON td.DuAnID = da.DuAnID
        WHERE ch.CuocHenID = ? AND da.ChuDuAnID = ?
      `,
        [cuocHenId, chuDuAnId]
      );

      if (rows.length === 0) {
        throw new Error("Không tìm thấy cuộc hẹn hoặc không có quyền từ chối");
      }

      if (rows[0].PheDuyetChuDuAn !== "ChoPheDuyet") {
        throw new Error(
          "Chỉ có thể từ chối cuộc hẹn ở trạng thái Chờ phê duyệt"
        );
      }

      // Cập nhật từ chối
      await db.execute(
        `
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
      `,
        [lyDoTuChoi, lyDoTuChoi, cuocHenId]
      );

      return true;
    } catch (error) {
      throw new Error(`Lỗi khi từ chối cuộc hẹn: ${error.message}`);
    }
  }
}

module.exports = CuocHenModel;
