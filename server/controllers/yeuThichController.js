const YT = require('../models/yeuThichModel');

exports.add = async (req, res) => {
  const { NguoiDungID, TinDangID } = req.body;
  if (!NguoiDungID || !TinDangID) return res.status(400).json({ error: 'NguoiDungID và TinDangID là bắt buộc' });
  try {
    await YT.addFavorite(NguoiDungID, TinDangID);
    return res.status(201).json({ NguoiDungID, TinDangID });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const { userId, tinId } = req.params;
  try {
    await YT.removeFavorite(userId, tinId);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.listByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await YT.getByUser(userId);
    return res.json(rows.map(r => ({
      NguoiDungID: r.NguoiDungID,
      TinDangID: r.TinDangID,
      TieuDe: r.TieuDe || null,
      Gia: r.Gia != null ? r.Gia : null,
      // model trả DiaChi (chú ý chữ hoa), map về diachi để frontend dùng
      diachi: r.DiaChi || r.diachi || null,
      // trả đường dẫn ảnh đầy đủ nếu model đã thêm HinhAnhFull, fallback sang các cột khác
      Img: r.HinhAnhFull || r.HinhAnhPhong || r.Img || null
    })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.listWithTinDetails = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await YT.getByUserWithTin(userId);
    return res.json(rows.map(r => ({
      NguoiDungID: r.NguoiDungID,
      TinDangID: r.TinDangID,
      TieuDe: r.TieuDe || null,
      Img: r.HinhAnhFull || r.HinhAnhPhong || r.Img || null,
      Gia: r.Gia != null ? r.Gia : null,
      diachi: r.DiaChi || r.diachi || null
    })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.check = async (req, res) => {
  const { userId, tinId } = req.query;
  if (!userId || !tinId) return res.status(400).json({ error: 'userId và tinId là bắt buộc' });
  try {
    const [rows] = await YT.existsFavorite(userId, tinId);
    const exists = rows.length > 0;
    return res.json({ exists });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};