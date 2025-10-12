import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import yeuThichApi from '../../api/yeuThichApi';
import './header.css';

function Header(props) {
  // ...existing state...
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favOpen, setFavOpen] = useState(false);

  // get current user id - adjust if you store differently (token / redux)
  const currentUserId = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null;

  useEffect(() => {
    if (currentUserId) fetchFavorites(currentUserId);
    // optional: listen event from SearchKhuVuc or login changes
  }, [currentUserId]);

  const fetchFavorites = async (userId) => {
    setFavLoading(true);
    try {
      const res = await yeuThichApi.listWithTinDetails(userId);
      // backend may return array at res.data or res.data.data
      const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setFavorites(raw);
    } catch (err) {
      console.error('Lỗi lấy yêu thích:', err?.response?.data || err.message);
      setFavorites([]);
    } finally {
      setFavLoading(false);
    }
  };

  const handleRemoveFav = async (tin) => {
    if (!currentUserId) return;
    if (!window.confirm('Xác nhận xoá yêu thích?')) return;
    try {
      await yeuThichApi.remove(currentUserId, tin.TinDangID ?? tin.tinId ?? tin.id);
      // cập nhật lại UI
      setFavorites(prev => prev.filter(f => (f.TinDangID ?? f.tinId ?? f.id) !== (tin.TinDangID ?? tin.tinId ?? tin.id)));
    } catch (err) {
      console.error('Lỗi xóa yêu thích:', err?.response?.data || err.message);
      alert('Xóa thất bại');
    }
  };

  // ...existing render...
  return (
    <header className="app-header">
      {/* ...existing header content ... */}

      <div className="header-fav">
        <button className="fav-btn" onClick={() => setFavOpen(!favOpen)}>
          Yêu thích ({favorites.length})
        </button>

        {favOpen && (
          <div className="fav-dropdown">
            {favLoading && <div className="fav-loading">Đang tải...</div>}
            {!favLoading && favorites.length === 0 && <div className="fav-empty">Chưa có mục yêu thích</div>}
            {!favLoading && favorites.map((f) => {
              // f may include TinDang fields (TieuDe, URL) or nested tinDang object; adapt as needed
              const tin = f.TinDang ?? f; // if backend wraps
              const id = tin.TinDangID ?? tin.id ?? tin._id;
              const title = tin.TieuDe ?? tin.title ?? 'Không có tiêu đề';
              const img = tin.URL ? (tin.URL.startsWith('http') ? tin.URL : `/uploads/${tin.URL}`) : 'https://via.placeholder.com/80x60?text=No+Img';
              return (
                <div className="fav-item" key={id}>
                  <img className="fav-thumb" src={img} alt={title} />
                  <div className="fav-info">
                    <Link to={`/tindang/${id}`} onClick={() => setFavOpen(false)} className="fav-title">{title}</Link>
                    <div className="fav-actions">
                      <button className="btn small" onClick={() => handleRemoveFav(tin)}>Xóa</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ...existing header content ... */}
    </header>
  );
}

export default Header;