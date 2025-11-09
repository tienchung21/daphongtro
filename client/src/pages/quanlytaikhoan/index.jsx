import React, { useEffect, useState } from 'react';
import './quanlytaikhoan.css';
import userApi from '../../api/userApi';

function QuanLyTaiKhoan() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [form, setForm] = useState({
    id: null,
    TenDayDu: '',
    Email: '',
    SoDienThoai: '',
    password: '',
    VaiTroID: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper để map ID vai trò ra tên vai trò
  const vaiTroMap = {
    1: 'Khách hàng',
    3: 'Chủ dự án',
    2: 'Nhân viên bán hàng',
    4: 'Nhân viên Điều hành',
    5: 'Quản trị viên Hệ thống',
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userApi.getAll();
      const raw = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.data) ? res.data.data : []);
      
      const mapped = raw.map(u => ({
        id: u.NguoiDungID ?? u.id ?? u._id,
        TenDayDu: u.TenDayDu ?? u.name ?? u.fullname,
        Email: u.Email ?? u.email,
        SoDienThoai: u.SoDienThoai ?? u.phone,
        VaiTroID: u.VaiTroID ?? u.roleId ?? u.role,
        TrangThai: u.TrangThai,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('Lỗi lấy users:', err?.response?.data || err.message);
      setError('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalMode('create');
    setForm({ id: null, TenDayDu: '', Email: '', SoDienThoai: '', password: '', VaiTroID: 1 });
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setModalMode('edit');
    setForm({
      id: user.id,
      TenDayDu: user.TenDayDu,
      Email: user.Email,
      SoDienThoai: user.SoDienThoai,
      password: '', // Không cần gửi lại mật khẩu khi sửa
      VaiTroID: user.VaiTroID ?? 1,
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
          TenDayDu: form.TenDayDu,
          Email: form.Email,
          SoDienThoai: form.SoDienThoai,
          password: form.password,
          VaiTroID: Number(form.VaiTroID),
        };
        await userApi.create(payload);
      } else {
        const payload = {
          TenDayDu: form.TenDayDu,
          Email: form.Email,
          SoDienThoai: form.SoDienThoai,
          VaiTroID: Number(form.VaiTroID),
        };
        await userApi.update(form.id, payload);
      }
      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error('Lỗi lưu user:', err?.response?.data || err.message);
      alert(err?.response?.data?.message || 'Lưu thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xác nhận xóa tài khoản: ${user.TenDayDu ?? user.Email}`)) return;
    try {
      await userApi.remove(user.id);
      await fetchUsers();
    } catch (err) {
      console.error('Lỗi xóa:', err?.response?.data || err.message);
      alert('Xóa thất bại');
    }
  };

  return (
    <div className="quanlytk-wrapper">
   
      <div className="quanlytk-container">
        <div className="ql-header">
          <h3>Quản lý tài khoản</h3>
          <button className="btn btn-add" onClick={openCreate}>Thêm tài khoản</button>
        </div>

        {loading && <div className="ql-loading">Đang tải...</div>}
        {error && <div className="ql-error">{error}</div>}

        <div className="table-responsive-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th scope="col">Họ tên</th>
                <th scope="col">Email</th>
                <th scope="col">Số điện thoại</th>
                <th scope="col">Vai trò</th>
                <th scope="col" className="th-actions">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="no-data">Chưa có tài khoản nào</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Họ tên">{user.TenDayDu ?? '-'}</td>
                    <td data-label="Email">{user.Email ?? '-'}</td>
                    <td data-label="Số điện thoại">{user.SoDienThoai ?? '-'}</td>
                    <td data-label="Vai trò">{vaiTroMap[user.VaiTroID] ?? 'Không xác định'}</td>
                    <td data-label="Hành động" className="td-actions">
                      <button className="btn btn-edit" onClick={() => openEdit(user)}>Sửa</button>
                      <button className="btn btn-delete" onClick={() => handleDelete(user)}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="ql-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="ql-modal" onClick={(e) => e.stopPropagation()}>
            <h4>{modalMode === 'create' ? 'Thêm tài khoản mới' : 'Cập nhật tài khoản'}</h4>
            <form onSubmit={handleSubmit} className="ql-form">
              <label>Họ tên
                <input name="TenDayDu" value={form.TenDayDu} onChange={handleChange} required />
              </label>
              <label>Email
                <input name="Email" value={form.Email} onChange={handleChange} type="email" required />
              </label>
              <label>Số điện thoại
                <input name="SoDienThoai" value={form.SoDienThoai} onChange={handleChange} required />
              </label>
              {modalMode === 'create' && (
                <label>Mật khẩu
                  <input name="password" value={form.password} onChange={handleChange} type="password" required />
                </label>
              )}
              <label>Vai trò
                <select name="VaiTroID" value={form.VaiTroID} onChange={handleChange}>
                  <option value={1}>Khách hàng</option>
                  <option value={2}>Chủ dự án</option>
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

export default QuanLyTaiKhoan;