const CuocHen = require("../models/cuocHenModel");
const NhatKyHeThongService = require("../services/NhatKyHeThongService");

exports.create = async (req, res) => {
  try {
    const {
      TinDangID,
      PhongID,
      ChuDuAnID: ChuDuAnID_in, // <-- thêm dòng này
      NhanVienBanHangID,
      KhachHangID,
      PheDuyetChuDuAn,
      ThoiGianHen,
      GhiChu,
    } = req.body;

    // Bắt buộc theo yêu cầu: phải có KhachHangID, NhanVienBanHangID, PhongID, TinDangID, ThoiGianHen
    if (
      !KhachHangID ||
      !NhanVienBanHangID ||
      !PhongID ||
      !TinDangID ||
      !ThoiGianHen
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu trường bắt buộc: KhachHangID, NhanVienBanHangID, PhongID, TinDangID, ThoiGianHen",
      });
    }

    // Tự động lấy ChuDuAnID từ TinDangID nếu không gửi
    let ChuDuAnID = ChuDuAnID_in;
    if (!ChuDuAnID && TinDangID) {
      try {
        ChuDuAnID = await CuocHen.getChuDuAnIdByTinDangId(TinDangID);
      } catch (e) {
        console.warn("Cannot resolve ChuDuAnID from TinDangID:", e.message);
      }
    }

    // Nếu vẫn NULL và DB bắt buộc → trả lỗi 400
    if (!ChuDuAnID) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xác định ChuDuAnID. Vui lòng gửi ChuDuAnID hoặc kiểm tra TinDangID.",
      });
    }

    const data = {
      PhongID: Number(PhongID),
      ChuDuAnID: Number(ChuDuAnID),
      TinDangID: Number(TinDangID),
      KhachHangID: Number(KhachHangID),
      NhanVienBanHangID: Number(NhanVienBanHangID),
      PheDuyetChuDuAn: PheDuyetChuDuAn,
      ThoiGianHen: ThoiGianHen,
      GhiChu: GhiChu || null,
    };

    const [result] = await CuocHen.createCuocHen(data);

    // Lấy lại bản ghi vừa tạo để trả về đầy đủ
    const [[createdRow]] = await Promise.all([
      CuocHen.getById(result.insertId),
    ]); // getById trả về [rows]
    // Nếu getById trả về mảng dạng [rows], ensure lấy đúng phần tử
    const created = Array.isArray(createdRow)
      ? createdRow[0]
      : createdRow || null;

    // Ghi nhật ký (không bắt buộc)
    try {
      await NhatKyHeThongService.ghiNhan(
        null,
        NhatKyHeThongService.HANH_DONG?.TAO_CUOC_HEN || "tao_cuoc_hen",
        "CuocHen",
        result.insertId,
        null,
        data,
        req.ip,
        req.get("User-Agent") || ""
      );
    } catch (e) {
      console.warn("NhatKyHeThongService.ghiNhan failed:", e.message);
    }

    return res.status(201).json({
      success: true,
      message: "Tạo cuộc hẹn thành công",
      data: created || { CuocHenID: result.insertId },
    });
  } catch (error) {
    console.error("create cuoc hen error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await CuocHen.getAll();
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi getAll cuoc hen:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    const [rows] = await CuocHen.getById(id);
    if (!rows || rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy" });
    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.findByKhachHang = async (req, res) => {
  try {
    const khId = parseInt(req.params.khachHangId, 10);
    if (!khId)
      return res
        .status(400)
        .json({ success: false, message: "KhachHangID không hợp lệ" });
    const [rows] = await CuocHen.findByKhachHangId(khId);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi findByKhachHang:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.findByNhanVien = async (req, res) => {
  try {
    const nvId = parseInt(req.params.nhanVienId, 10);
    if (!nvId)
      return res
        .status(400)
        .json({ success: false, message: "NhanVienID không hợp lệ" });
    const [rows] = await CuocHen.findByNhanVienId(nvId);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi findByNhanVien:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.findByChuDuAn = async (req, res) => {
  try {
    const chuId = parseInt(req.params.chuDuAnId, 10);
    if (!chuId)
      return res
        .status(400)
        .json({ success: false, message: "ChuDuAnID không hợp lệ" });
    const [rows] = await CuocHen.findByChuDuAnId(chuId);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Lỗi findByChuDuAn:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });

    const allowed = [
      "TrangThai",
      "ThoiGianHen",
      "GhiChu",
      "PhuongThucVao",
      "PheDuyetChuDuAn",
      "NhanVienBanHangID",
      "TenKhachHang",
      "Email",
      "SoDienThoai",
      "PhongID",
      "TinDangID",
      "KhachHangID",
    ];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có trường hợp lệ để cập nhật",
      });
    }

    await CuocHen.updateCuocHen(id, updates);

    try {
      await NhatKyHeThongService.ghiNhan(
        null,
        "cap_nhat_cuoc_hen",
        "CuocHen",
        id,
        null,
        updates,
        req.ip,
        req.get("User-Agent") || ""
      );
    } catch (e) {
      console.warn("NhatKyHeThongService.ghiNhan failed:", e.message);
    }

    return res.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi update cuoc hen:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    await CuocHen.deleteCuocHen(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Lỗi delete cuoc hen:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
