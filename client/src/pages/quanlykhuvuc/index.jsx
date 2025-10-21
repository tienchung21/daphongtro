import React, { useEffect, useState } from 'react';
import '../../pages/quanlytaikhoan/quanlytaikhoan.css'; // dùng chung style
import khuvucApi from '../../api/khuvucApi';

function QuanLyKhuVuc() {
  const [tree, setTree] = useState([]);
  const [flat, setFlat] = useState([]); // bảng phẳng để hiển thị
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ KhuVucID: null, TenKhuVuc: '', ParentKhuVucID: null, ViDo: '', KinhDo: '' });
  const [mode, setMode] = useState('create');

  useEffect(() => { fetchTree(); }, []);

  const fetchTree = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await khuvucApi.getTree();
      const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setTree(raw);
      setFlat(flatten(raw));
    } catch (err) {
      console.error(err);
      setError('Không tải được khu vực');
    } finally {
      setLoading(false);
    }
  };

  // flatten tree to rows with depth for indentation
  const flatten = (nodes = [], depth = 0) => {
    let out = [];
    for (const n of nodes) {
      out.push({ ...n, depth });
      if (n.children && n.children.length) out = out.concat(flatten(n.children, depth + 1));
    }
    return out;
  };

  const openCreate = (parentId = null) => {
    setMode('create');
    setForm({ KhuVucID: null, TenKhuVuc: '', ParentKhuVucID: parentId, ViDo: '', KinhDo: '' });
    setModalOpen(true);
  };

  const openEdit = (node) => {
    setMode('edit');
    setForm({
      KhuVucID: node.KhuVucID,
      TenKhuVuc: node.TenKhuVuc || '',
      ParentKhuVucID: node.ParentKhuVucID ?? null,
      ViDo: node.ViDo ?? '',
      KinhDo: node.KinhDo ?? ''
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await khuvucApi.create({
          TenKhuVuc: form.TenKhuVuc,
          ParentKhuVucID: form.ParentKhuVucID || null,
          ViDo: form.ViDo || null,
          KinhDo: form.KinhDo || null
        });
      } else {
        await khuvucApi.update(form.KhuVucID, {
          TenKhuVuc: form.TenKhuVuc,
          ParentKhuVucID: form.ParentKhuVucID || null,
          ViDo: form.ViDo || null,
          KinhDo: form.KinhDo || null
        });
      }
      setModalOpen(false);
      await fetchTree();
    } catch (err) {
      console.error(err);
      alert('Lưu thất bại');
    }
  };

  const handleDelete = async (node) => {
    if (!window.confirm(`Xóa khu vực "${node.TenKhuVuc}" ?`)) return;
    try {
      await khuvucApi.remove(node.KhuVucID);
      await fetchTree();
    } catch (err) {
      console.error(err);
      alert('Xóa thất bại');
    }
  };

  return (
    <div className="quanlytk-wrapper">
      <div className="quanlytk-container">
        <div className="ql-header">
          <h3>Quản lý Khu Vực</h3>
          <div>
            <button className="btn btn-add" onClick={() => openCreate(null)}>Thêm khu vực gốc</button>
            <button className="btn" onClick={fetchTree}>Tải lại</button>
          </div>
        </div>

        {loading && <div className="ql-loading">Đang tải...</div>}
        {error && <div className="ql-error">{error}</div>}

        <div className="table-responsive-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Tên khu vực</th>
                <th>Parent</th>
                <th>Vĩ độ</th>
                <th>Kinh độ</th>
                <th className="th-actions">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {flat.length === 0 && !loading ? (
                <tr><td colSpan="5" className="no-data">Chưa có khu vực</td></tr>
              ) : flat.map(node => (
                <tr key={node.KhuVucID}>
                  <td style={{ paddingLeft: `${node.depth * 18 + 8}px` }}>{node.TenKhuVuc}</td>
                  <td>{node.ParentKhuVucID ?? '-'}</td>
                  <td>{node.ViDo ?? '-'}</td>
                  <td>{node.KinhDo ?? '-'}</td>
                  <td className="td-actions">
                    <button className="btn btn-add" onClick={() => openCreate(node.KhuVucID)}>Thêm con</button>
                    <button className="btn btn-edit" onClick={() => openEdit(node)}>Sửa</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(node)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="ql-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="ql-modal" onClick={e => e.stopPropagation()}>
            <h4>{mode === 'create' ? 'Thêm khu vực' : 'Cập nhật khu vực'}</h4>
            <form onSubmit={handleSubmit} className="ql-form">
              <label>
                Tên khu vực
                <input name="TenKhuVuc" value={form.TenKhuVuc} onChange={handleChange} required />
              </label>
              <label>
                ParentKhuVucID (ID)
                <input name="ParentKhuVucID" value={form.ParentKhuVucID ?? ''} onChange={handleChange} />
              </label>
              <label>
                Vĩ độ
                <input name="ViDo" value={form.ViDo} onChange={handleChange} />
              </label>
              <label>
                Kinh độ
                <input name="KinhDo" value={form.KinhDo} onChange={handleChange} />
              </label>
              <div className="ql-form-actions">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuanLyKhuVuc;