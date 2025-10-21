const Tin = require('../models/tinDangModel');

const mapTin = (row) => {
  if (!row) return null;
  return {
    TinDangID: row.TinDangID,
    KhuVucID: row.KhuVucID,
    TieuDe: row.TieuDe,
    URL: row.URL,
    MoTa: row.MoTa,
    Gia: row.Gia,
    DienTich: row.DienTich,
    TrangThai: row.TrangThai,
    LyDoTuChoi: row.LyDoTuChoi,
    DuyetBoiNhanVienID: row.DuyetBoiNhanVienID,
    TaoLuc: row.TaoLuc,
    CapNhatLuc: row.CapNhatLuc,
    DuyetLuc: row.DuyetLuc,
    diachi: row.diachi
  };
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await Tin.getAll();
    res.json(rows.map(mapTin));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await Tin.getById(id);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(mapTin(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      KhuVucID, TieuDe, URL, MoTa, Gia, DienTich,
      TrangThai, LyDoTuChoi, DuyetBoiNhanVienID, DuyetLuc, diachi
    } = req.body;

    if (!TieuDe || !KhuVucID) return res.status(400).json({ error: 'TieuDe và KhuVucID là bắt buộc' });

    const [result] = await Tin.createTinDang({
      KhuVucID, TieuDe, URL, MoTa, Gia, DienTich, TrangThai, LyDoTuChoi, DuyetBoiNhanVienID, DuyetLuc, diachi
    });

    const created = {
      TinDangID: result.insertId,
      KhuVucID, TieuDe, URL, MoTa, Gia, DienTich, TrangThai: TrangThai || 'pending',
      LyDoTuChoi: LyDoTuChoi || null,
      DuyetBoiNhanVienID: DuyetBoiNhanVienID || null,
      TaoLuc: new Date().toISOString(),
      CapNhatLuc: new Date().toISOString(),
      DuyetLuc: DuyetLuc || null,
      diachi: diachi || null
    };

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const allowed = ['KhuVucID','TieuDe','URL','MoTa','Gia','DienTich','TrangThai','LyDoTuChoi','DuyetBoiNhanVienID','DuyetLuc','diachi'];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];

    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Không có trường nào để cập nhật' });

    await Tin.updateTinDang(id, updates);
    const [rows] = await Tin.getById(id);
    res.json(mapTin(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Tin.deleteTinDang(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const id = req.params.id;
    const { staffId, accept = true, reason = null } = req.body;
    await Tin.approveTinDang(id, staffId, accept, reason);
    const [rows] = await Tin.getById(id);
    res.json(mapTin(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};