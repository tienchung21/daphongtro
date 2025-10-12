import React, { useEffect, useState } from 'react';
import '../quanlytaikhoan/quanlytaikhoan.css'; // reuse styles
import tinDangApi from '../../api/tinDangApi';

function QuanLyTinDang() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [form, setForm] = useState({
    id: null,
    TieuDe: '',
    Gia: '',
    DiaChi: '',
    DienTich: '',
    KhuVucID: '',
    TrangThai: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await tinDangApi.getAll();
      const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      const mapped = raw.map(t => ({
        id: t.TinDangID ?? t.id ?? t._id,
        TieuDe: t.TieuDe ?? t.title ?? '-',
        Gia: t.Gia ?? t.Price ?? '',
        DiaChi: t.diachi ?? t.DiaChi ?? t.address ?? '-',
        DienTich: t.DienTich ?? t.DienTich ?? t.area ?? '',
        KhuVucID: t.KhuVucID ?? t.khuvucId ?? null,
        TrangThai: t.TrangThai ?? t.trangthai ?? t.status ?? '',
        raw: t,
      }));
      setItems(mapped);
    } catch (err) {
      console.error('Lỗi lấy tin đăng:', err?.response?.data || err.message);
      setError('Không thể tải danh sách tin đăng');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalMode('create');
    setForm({ id: null, TieuDe: '', Gia: '', DiaChi: '', DienTich: '', KhuVucID: '', TrangThai: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setModalMode('edit');
    setForm({
      id: item.id,
      TieuDe: item.TieuDe,
      Gia: item.Gia,
      DiaChi: item.DiaChi,
      DienTich: item.DienTich,
      KhuVucID: item.KhuVucID ?? '',
      TrangThai: item.TrangThai ?? '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        const payload = {
          TieuDe: form.TieuDe,
          Gia: form.Gia,
          DiaChi: form.DiaChi,
          DienTich: form.DienTich,
          KhuVucID: form.KhuVucID || undefined,
          TrangThai: form.TrangThai || undefined,
        };
        await tinDangApi.create(payload);
      } else {
        const payload = {
          TieuDe: form.TieuDe,
          Gia: form.Gia,
          DiaChi: form.DiaChi,
          DienTich: form.DienTich,
          KhuVucID: form.KhuVucID || undefined,
          TrangThai: form.TrangThai || undefined,
        };
        await tinDangApi.update(form.id, payload);
      }
      setModalOpen(false);
      await fetchItems();
    } catch (err) {
      console.error('Lỗi lưu tin đăng:', err?.response?.data || err.message);
      alert(err?.response?.data?.message || 'Lưu thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xác nhận xóa tin: ${item.TieuDe}`)) return;
    try {
      await tinDangApi.remove(item.id);
      await fetchItems();
    } catch (err) {
      console.error('Lỗi xóa tin:', err?.response?.data || err.message);
      alert('Xóa thất bại');
    }
  };

  const handleApprove = async (item) => {
    if (!window.confirm(`Phê duyệt tin: ${item.TieuDe} ?`)) return;
    try {
      await tinDangApi.approve(item.id, { approved: true });
      await fetchItems();
    } catch (err) {
      console.error('Lỗi phê duyệt:', err?.response?.data || err.message);
      alert('Phê duyệt thất bại');
    }
  };

  return (
    <div className="quanlytk-wrapper">
      <div className="quanlytk-container">
        <div className="ql-header">
          <h3>Quản lý Tin Đăng</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-add" onClick={openCreate}>Thêm tin</button>
            <button className="btn" onClick={fetchItems}>Tải lại</button>
          </div>
        </div>

        {loading && <div className="ql-loading">Đang tải...</div>}
        {error && <div className="ql-error">{error}</div>}

        <div className="table-responsive-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Giá</th>
                <th>Địa chỉ</th>
                <th>Diện tích</th>
                <th>Trạng thái</th>
                <th className="th-actions">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading ? (
                <tr><td colSpan="6" className="no-data">Chưa có tin đăng</td></tr>
              ) : items.map(item => (
                <tr key={item.id}>
                  <td data-label="Tiêu đề">{item.TieuDe}</td>
                  <td data-label="Giá">{item.Gia ?? '-'}</td>
                  <td data-label="Địa chỉ">{item.DiaChi ?? '-'}</td>
                  <td data-label="Diện tích">{item.DienTich ?? '-'}</td>
                  <td data-label="Trạng thái">{item.TrangThai ?? '-'}</td>
                  <td data-label="Hành động" className="td-actions">
                    <button className="btn btn-edit" onClick={() => openEdit(item)}>Sửa</button>
                    <button className="btn btn-primary" onClick={() => handleApprove(item)}>Phê duyệt</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(item)}>Xóa</button>
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
            <h4>{modalMode === 'create' ? 'Thêm tin đăng mới' : 'Cập nhật tin đăng'}</h4>
            <form onSubmit={handleSubmit} className="ql-form">
              <label>Tiêu đề
                <input name="TieuDe" value={form.TieuDe} onChange={handleChange} required />
              </label>
              <label>Giá
                <input name="Gia" value={form.Gia} onChange={handleChange} />
              </label>
              <label>Địa chỉ
                <input name="DiaChi" value={form.DiaChi} onChange={handleChange} />
              </label>
              <label>Diện tích
                <input name="DienTich" value={form.DienTich} onChange={handleChange} />
              </label>
              <label>Trạng thái
                <select name="TrangThai" value={form.TrangThai} onChange={handleChange}>
                  <option value="">-- Chọn --</option>
                  <option value="pending">Đang chờ</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Bị từ chối</option>
                </select>
              </label>
              <div className="ql-form-actions">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuanLyTinDang;