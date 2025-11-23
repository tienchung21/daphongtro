const db = require("../config/db");

class LichSuViModel {
  static async themLichSuVi({
    user_id,
    ma_giao_dich,
    so_tien,
    trang_thai,
    LoaiGiaoDich,
  }) {
    console.log("LoaiGiaoDich nhận được:", LoaiGiaoDich);
    const sql = `
      INSERT INTO lich_su_vi (user_id, ma_giao_dich, so_tien, trang_thai, LoaiGiaoDich)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      user_id,
      ma_giao_dich,
      so_tien,
      trang_thai || "CHO_XU_LY",
      LoaiGiaoDich !== undefined && LoaiGiaoDich !== null && LoaiGiaoDich !== ""
        ? LoaiGiaoDich
        : "nap",
    ]);

    // Nếu là rút tiền thì trừ tiền trong ví
    if (
      (LoaiGiaoDich === "rut" || LoaiGiaoDich === "rút") &&
      (trang_thai === "THANH_CONG" || !trang_thai)
    ) {
      await db.execute("UPDATE vi SET SoDu = SoDu - ? WHERE NguoiDungID = ?", [
        so_tien,
        user_id,
      ]);
    }

    return result;
  }

  static async suaLichSuVi(id, { user_id, ma_giao_dich, so_tien, trang_thai }) {
    // Lấy thông tin giao dịch hiện tại
    const [rows] = await db.execute("SELECT * FROM lich_su_vi WHERE id = ?", [
      id,
    ]);
    const giaoDich = rows[0];
    if (!giaoDich) throw new Error("Không tìm thấy giao dịch");

    // Nếu trạng thái chuyển sang THANH_CONG và trước đó chưa phải THANH_CONG
    if (trang_thai === "THANH_CONG" && giaoDich.trang_thai !== "THANH_CONG") {
      // Cộng tiền vào ví
      await db.execute("UPDATE vi SET SoDu = SoDu + ? WHERE NguoiDungID = ?", [
        giaoDich.so_tien,
        giaoDich.user_id,
      ]);
    }

    // Tiếp tục cập nhật các trường còn lại
    const fields = [];
    const params = [];
    if (user_id !== undefined) {
      fields.push("user_id = ?");
      params.push(user_id);
    }
    if (ma_giao_dich !== undefined) {
      fields.push("ma_giao_dich = ?");
      params.push(ma_giao_dich);
    }
    if (so_tien !== undefined) {
      fields.push("so_tien = ?");
      params.push(so_tien);
    }
    if (trang_thai !== undefined) {
      fields.push("trang_thai = ?");
      params.push(trang_thai);
    }
    if (fields.length === 0) throw new Error("Không có trường nào để cập nhật");
    params.push(id);
    const sql = `UPDATE lich_su_vi SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await db.execute(sql, params);
    return result;
  }

  static async layTatCa() {
    const [rows] = await db.execute(
      "SELECT * FROM lich_su_vi ORDER BY thoi_gian DESC"
    );
    return rows;
  }

  static async layTheoUser(user_id) {
    const [rows] = await db.execute(
      "SELECT * FROM lich_su_vi WHERE user_id = ? ORDER BY thoi_gian DESC",
      [user_id]
    );
    return rows;
  }
}

module.exports = LichSuViModel;

