const KhuVuc = require('../models/khuVucModel');

const mapRow = (r) => ({
  KhuVucID: r.KhuVucID,
  TenKhuVuc: r.TenKhuVuc,
  ParentKhuVucID: r.ParentKhuVucID,
  ViDo: r.ViDo,
  KinhDo: r.KinhDo
});

// build nested tree from flat list
const buildTree = (rows) => {
  const map = new Map();
  rows.forEach(r => map.set(r.KhuVucID, { ...mapRow(r), children: [] }));
  const roots = [];
  for (const node of map.values()) {
    if (node.ParentKhuVucID == null) {
      roots.push(node);
    } else {
      const parent = map.get(node.ParentKhuVucID);
      if (parent) parent.children.push(node);
      else roots.push(node); // orphan, treat as root
    }
  }
  return roots;
};

exports.getAll = async (req, res) => {
  try {
    const [rows] = await KhuVuc.getAll();
    res.json(rows.map(mapRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTree = async (req, res) => {
  try {
    const [rows] = await KhuVuc.getAll();
    res.json(buildTree(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await KhuVuc.getById(id);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { TenKhuVuc, ParentKhuVucID, ViDo, KinhDo } = req.body;
    if (!TenKhuVuc) return res.status(400).json({ error: 'TenKhuVuc là bắt buộc' });
    const [result] = await KhuVuc.create(TenKhuVuc, ParentKhuVucID, ViDo, KinhDo);
    res.status(201).json({
      KhuVucID: result.insertId,
      TenKhuVuc,
      ParentKhuVucID: ParentKhuVucID || null,
      ViDo: ViDo || null,
      KinhDo: KinhDo || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { TenKhuVuc, ParentKhuVucID, ViDo, KinhDo } = req.body;
    const updates = {};
    if (TenKhuVuc !== undefined) updates.TenKhuVuc = TenKhuVuc;
    if (ParentKhuVucID !== undefined) updates.ParentKhuVucID = ParentKhuVucID;
    if (ViDo !== undefined) updates.ViDo = ViDo;
    if (KinhDo !== undefined) updates.KinhDo = KinhDo;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    await KhuVuc.update(id, updates);
    const [rows] = await KhuVuc.getById(id);
    res.json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await KhuVuc.delete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};