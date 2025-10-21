import Header from "../../components/Header";
import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import './trangchu.css';
import tinDangApi from '../../api/tinDangApi';
import SearchKhuVuc from "../../components/SearchKhuVuc";
import yeuThichApi from '../../api/yeuThichApi';

function TrangChu() {
  const [tindangs, setTindangs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingFavId, setAddingFavId] = useState(null);

  useEffect(() => {
    fetchTinDangs();
  }, []);

  // CHỈNH: cho phép truyền params để lọc theo KhuVucID
  const fetchTinDangs = async (params = {}) => {
    setLoading(true);
    setError('');
    console.log('[TrangChu] fetchTinDangs params:', params); // debug
    try {
      // Thử gửi params lên backend (nếu backend hỗ trợ)
      const res = await tinDangApi.getAll(params);
      console.log('[TrangChu] tinDangApi.getAll.res:', res?.data);
      const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);

      // Nếu backend không lọc theo KhuVucID, ta lọc tạm trên client
      let data = raw;
      if (params?.KhuVucID) {
        const needId = Number(params.KhuVucID);
        data = raw.filter(t => Number(t.KhuVucID) === needId);
        console.log('[TrangChu] client-filtered count:', data.length, 'for KhuVucID=', needId);
      }

      setTindangs(data);
    } catch (err) {
      console.error('Lỗi lấy tin đăng:', err?.response?.data || err.message);
      setError('Không thể tải tin đăng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKhuVuc = (payload = {}) => {
    console.log('[TrangChu] handleSearchKhuVuc payload:', payload); // debug
    // payload => { KhuVucID, path }
    if (!payload?.KhuVucID) {
      fetchTinDangs(); // load full list
      return;
    }
    // gọi fetch với param — fetchTinDangs sẽ gửi param rồi fallback lọc client-side nếu backend không hỗ trợ
    fetchTinDangs({ KhuVucID: payload.KhuVucID });
  };

  const handleSearch = () => {
    const lastSelected = selectedIds.slice().reverse().find(id => id);
    const payload = {
      KhuVucID: lastSelected ? Number(lastSelected) : null,
      path: selectedIds.filter(Boolean).map(Number),
    };
    console.log('[SearchKhuVuc] payload:', payload); // debug
    if (typeof onSearch === 'function') {
      onSearch(payload);
    } else {
      window.dispatchEvent(new CustomEvent('khuvucSearch', { detail: payload }));
      console.log('Search khu vực:', payload);
    }
  };

  const formatPrice = (g) => {
    if (!g) return '-';
    const n = Number(g);
    if (isNaN(n)) return g;
    return n.toLocaleString('vi-VN') + ' VND';
  };

  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        const actual = parsed.user ?? parsed;
        const id = actual?.NguoiDungID ?? actual?.id ?? actual?.userId;
        if (id) return Number(id);
      }
    } catch (e) { /* ignore */ }
    const idKey = localStorage.getItem('userId');
    if (idKey && !isNaN(Number(idKey))) return Number(idKey);
    return null;
  };

  const handleAddFavorite = async (tin) => {
    const tinId = tin?.TinDangID ?? tin?.id ?? tin?._id;
    const userId = getCurrentUserId();
    if (!userId) {
      // redirect to login or show message
      window.location.href = '/login';
      return;
    }
    if (!tinId) return;
    setAddingFavId(tinId);
    try {
      await yeuThichApi.add({ NguoiDungID: userId, TinDangID: tinId });
      // simple feedback
      alert('Đã thêm vào yêu thích');
    } catch (err) {
      console.error('Thêm yêu thích lỗi:', err?.response ?? err);
      alert('Thêm yêu thích thất bại');
    } finally {
      setAddingFavId(null);
    }
  };

  return (
    <div className="trangchu">
      <Header />
      {/* CHỈNH: truyền onSearch để nhận payload khi bấm Tìm */}
      <SearchKhuVuc onSearch={handleSearchKhuVuc} />

      <div className="content">
        <div className="content1">
          <div className="danhsach">
            {loading && <div className="tindang-loading">Đang tải...</div>}
            {error && <div className="tindang-error">{error}</div>}

            {(!loading && tindangs.length === 0) && (
              <div className="tindang-empty">Chưa có tin đăng</div>
            )}

            {tindangs.map((t) => {
              const key = t.TinDangID ?? t.id ?? t._id;
              const imgSrc = t.URL
                ? (typeof t.URL === 'string' && t.URL.startsWith('http') ? t.URL : `/uploads/${t.URL}`)
                : 'https://via.placeholder.com/160x110?text=No+Image';

              return (
                <div className="duan" key={key}>
                  <div className="anhduan">
                    <img src={imgSrc} alt={t.TieuDe} />
                  </div>
                  <div className="thongtinduan">
                    <div className="tieude">{t.TieuDe}</div>
                    <div className="diachi">Địa chỉ: {t.diachi ?? '-'}</div>
                    <div className="gia">{formatPrice(t.Gia)}</div>
                    <div className="dientich">Diện tích: {t.DienTich ?? '-'} m2</div>
                    <div className="lienhe">Liên hệ: - </div>
                    <div className="thoigian">
                      {t.TaoLuc ? new Date(t.TaoLuc).toLocaleString() : ''}
                      <button
                        type="button"
                        className="fav-btn"
                        onClick={() => handleAddFavorite(t)}
                        disabled={addingFavId === key}
                        title="Thêm vào yêu thích"
                      >
                        🩶 {addingFavId === key ? '...' : ''}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="content2">
          <div className="khuvuc">
            <div className="khuvuc-title">
              Phòng trọ Cho thuê tại các khu vực
            </div>
            <ul>
              <li>Quận Gò Vấp (6)</li>
              <li>Quận 2 (3)</li>
              <li>Quận 3 (23)</li>
              <li>Quận 4 (23)</li>
              <li>Quận Bình Thạnh (12)</li>
              <li>Quận 9 (15)</li>
            </ul> 
          </div>
          <div className="tintuc">
            <div className="tintuc-title">
              Tin Tức Mới Nhất
            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
              <img src="https://tse4.mm.bing.net/th/id/OIP.1a31QUbCZjQD8w2KP2DKnwHaGu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Ảnh dự án" />
              </div>
              <div className="thongtinduan">
              <div className="tieude">
                 Cho thuê phòng trọ ngay quận 2 có đủ tiện nghi
              </div>
              
              <div className="thoigian">
              Hôm nay
              
              </div>

            </div>

            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
              <img src="https://tse4.mm.bing.net/th/id/OIP.1a31QUbCZjQD8w2KP2DKnwHaGu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Ảnh dự án" />
              </div>
              <div className="thongtinduan">
              <div className="tieude">
                 Cho thuê phòng trọ ngay quận 2 có đủ tiện nghi
              </div>
              
              <div className="thoigian">
              Hôm nay
              
              </div>

            </div>

            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
              <img src="https://tse4.mm.bing.net/th/id/OIP.1a31QUbCZjQD8w2KP2DKnwHaGu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Ảnh dự án" />
              </div>
              <div className="thongtinduan">
              <div className="tieude">
                 Cho thuê phòng trọ ngay quận 2 có đủ tiện nghi
              </div>
              
              <div className="thoigian">
              Hôm nay
              
              </div>

            </div>

            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
              <img src="https://tse4.mm.bing.net/th/id/OIP.1a31QUbCZjQD8w2KP2DKnwHaGu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Ảnh dự án" />
              </div>
              <div className="thongtinduan">
              <div className="tieude">
                 Cho thuê phòng trọ ngay quận 2 có đủ tiện nghi
              </div>
              
              <div className="thoigian">
              Hôm nay
              
              </div>

            </div>

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
export default TrangChu;