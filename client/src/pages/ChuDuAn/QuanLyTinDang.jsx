import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService, DuAnService } from '../../services/ChuDuAnService';
import '../../styles/TableLayout.css';

/**
 * Quản lý tin đăng - Table view với filters
 */
const QuanLyTinDang = () => {
  const navigate = useNavigate();
  const [tinDangs, setTinDangs] = useState([]);
  const [duAns, setDuAns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({}); // Track expanded rows
  const [filters, setFilters] = useState({
    trangThai: '',
    duAn: '',
    keyword: ''
  });

  useEffect(() => {
    layDanhSachTinDang();
    layDanhSachDuAn();
  }, []);

  const layDanhSachTinDang = async () => {
    try {
      setLoading(true);
      const response = await TinDangService.layDanhSach(filters);
      if (response.success) {
        setTinDangs(response.data.tinDangs || response.data);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách tin đăng:', error);
    } finally {
      setLoading(false);
    }
  };

  const layDanhSachDuAn = async () => {
    try {
      const response = await DuAnService.layDanhSach();
      if (response.success) {
        setDuAns(response.data);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách dự án:', error);
    }
  };

  const xacNhanGuiDuyet = async (tinDang) => {
    if (window.confirm(`Gửi tin đăng "${tinDang.TieuDe}" để duyệt?`)) {
      try {
        const response = await TinDangService.guiDuyet(tinDang.TinDangID);
        if (response.success) {
          alert('✅ Đã gửi tin đăng để duyệt thành công!');
          layDanhSachTinDang();
        } else {
          alert('❌ ' + response.message);
        }
      } catch (error) {
        alert('❌ Có lỗi xảy ra khi gửi duyệt');
      }
    }
  };

  const getTrangThaiInfo = (trangThai) => {
    const map = {
      'Nhap': { label: 'Nháp', badge: 'gray' },
      'ChoDuyet': { label: 'Chờ duyệt', badge: 'warning' },
      'DaDuyet': { label: 'Đã duyệt', badge: 'info' },
      'DaDang': { label: 'Đang đăng', badge: 'success' },
      'TuChoi': { label: 'Từ chối', badge: 'danger' }
    };
    return map[trangThai] || { label: trangThai, badge: 'gray' };
  };

  const formatCurrency = (value) => {
    return parseInt(value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const getTienIch = (tienIchJson) => {
    try {
      const tienIch = JSON.parse(tienIchJson || '[]');
      return tienIch.length > 0 ? tienIch : [];
    } catch {
      return [];
    }
  };

  const getFirstImage = (urlJson) => {
    try {
      const urls = JSON.parse(urlJson || '[]');
      if (urls.length > 0) {
        // Đảm bảo URL bắt đầu với http://localhost:5000
        const url = urls[0];
        return url.startsWith('http') ? url : `http://localhost:5000${url}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const toggleExpand = async (tinDangId) => {
    const isExpanding = !expandedRows[tinDangId];
    
    setExpandedRows(prev => ({
      ...prev,
      [tinDangId]: isExpanding
    }));

    // Nếu đang expand và chưa có dữ liệu phòng, fetch từ backend
    if (isExpanding) {
      const tinDang = tinDangs.find(td => td.TinDangID === tinDangId);
      if (tinDang && !tinDang.Phongs) {
        try {
          // Fetch danh sách phòng từ API
          const response = await fetch(`http://localhost:5000/api/chu-du-an/tin-dang/${tinDangId}/phong`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || 'mock-token-for-development'}`
            }
          });
          const data = await response.json();
          
          if (data.success && data.data) {
            // Update tinDangs với dữ liệu phòng
            setTinDangs(prev => prev.map(td => 
              td.TinDangID === tinDangId 
                ? { ...td, Phongs: data.data }
                : td
            ));
          }
        } catch (error) {
          console.error('Lỗi load danh sách phòng:', error);
        }
      }
    }
  };

  const tinDangsFiltered = tinDangs.filter(tinDang => {
    if (filters.keyword && !tinDang.TieuDe?.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false;
    }
    if (filters.duAn && tinDang.DuAnID !== parseInt(filters.duAn)) {
      return false;
    }
    if (filters.trangThai && tinDang.TrangThai !== filters.trangThai) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="cda-loading">
          <div className="cda-spinner"></div>
          <p className="cda-loading-text">Đang tải danh sách...</p>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      {/* Page Header */}
      <div className="cda-flex cda-justify-between cda-items-center cda-mb-lg">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>
            Quản lý tin đăng
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Quản lý và theo dõi tất cả tin đăng của bạn
          </p>
        </div>
        <Link to="/chu-du-an/tao-tin-dang" className="cda-btn cda-btn-primary cda-btn-lg">
          <span>➕</span>
          <span>Tạo tin đăng mới</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="cda-card cda-mb-lg">
        <div className="cda-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="cda-form-group">
              <label className="cda-label">Tìm kiếm</label>
              <input
                type="text"
                className="cda-input"
                placeholder="Tìm theo tiêu đề..."
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div className="cda-form-group">
              <label className="cda-label">Dự án</label>
              <select
                className="cda-select"
                value={filters.duAn}
                onChange={(e) => setFilters({ ...filters, duAn: e.target.value })}
              >
                <option value="">Tất cả dự án</option>
                {duAns.map(duAn => (
                  <option key={duAn.DuAnID} value={duAn.DuAnID}>
                    {duAn.TenDuAn}
                  </option>
                ))}
              </select>
            </div>
            <div className="cda-form-group">
              <label className="cda-label">Trạng thái</label>
              <select
                className="cda-select"
                value={filters.trangThai}
                onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Nhap">Nháp</option>
                <option value="ChoDuyet">Chờ duyệt</option>
                <option value="DaDuyet">Đã duyệt</option>
                <option value="DaDang">Đang đăng</option>
                <option value="TuChoi">Từ chối</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cda-card">
        <div className="cda-card-header">
          <h3 className="cda-card-title">
            Danh sách tin đăng ({tinDangsFiltered.length})
          </h3>
        </div>
        <div className="cda-card-body" style={{ padding: 0 }}>
          {tinDangsFiltered.length > 0 ? (
            <div className="cda-table-container">
              <table className="cda-table cda-table-fixed-layout">
                <colgroup>
                  <col style={{ width: '70px' }} />
                  <col style={{ width: '280px' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '130px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '160px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '150px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tin đăng</th>
                    <th>Dự án</th>
                    <th>Giá thuê</th>
                    <th>Diện tích</th>
                    <th>Chi phí phụ</th>
                    <th>Phòng</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tinDangsFiltered.map((tinDang) => {
                    const statusInfo = getTrangThaiInfo(tinDang.TrangThai);
                    const firstImage = getFirstImage(tinDang.URL);
                    return (
                      <tr key={tinDang.TinDangID}>
                        <td>
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            background: '#f3f4f6'
                          }}>
                            {firstImage ? (
                              <img 
                                src={firstImage} 
                                alt={tinDang.TieuDe}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:1.5rem;">🏠</div>';
                                }}
                              />
                            ) : (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%', 
                                fontSize: '1.5rem' 
                              }}>
                                🏠
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                            {tinDang.TieuDe}
                          </div>
                          {tinDang.MoTa && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tinDang.MoTa.substring(0, 50)}...
                            </div>
                          )}
                          {getTienIch(tinDang.TienIch).length > 0 && (
                            <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {getTienIch(tinDang.TienIch).slice(0, 3).map((tienIch, idx) => (
                                <span key={idx} style={{ 
                                  fontSize: '0.7rem', 
                                  padding: '2px 6px', 
                                  background: 'rgba(139, 92, 246, 0.1)', 
                                  color: '#8b5cf6',
                                  borderRadius: '4px'
                                }}>
                                  {tienIch}
                                </span>
                              ))}
                              {getTienIch(tinDang.TienIch).length > 3 && (
                                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                  +{getTienIch(tinDang.TienIch).length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                            {tinDang.TenDuAn}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#059669' }}>
                            {tinDang.Gia ? formatCurrency(tinDang.Gia) : (
                              tinDang.TongSoPhong > 0 ? (
                                <button 
                                  onClick={() => toggleExpand(tinDang.TinDangID)}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#8b5cf6', 
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    textDecoration: 'underline'
                                  }}
                                >
                                  {expandedRows[tinDang.TinDangID] ? '🔽 Thu gọn' : '▶️ Xem giá phòng'}
                                </button>
                              ) : (
                                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Chưa có phòng</span>
                              )
                            )}
                          </div>
                          {expandedRows[tinDang.TinDangID] && tinDang.Phongs && tinDang.Phongs.length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#4b5563' }}>
                              {tinDang.Phongs.map((phong, idx) => (
                                <div key={idx} style={{ padding: '2px 0' }}>
                                  <span style={{ color: '#6b7280' }}>{phong.TenPhong}:</span>{' '}
                                  <span style={{ fontWeight: 500, color: '#059669' }}>
                                    {formatCurrency(phong.Gia)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem' }}>
                            {tinDang.DienTich ? `${tinDang.DienTich} m²` : (
                              tinDang.TongSoPhong > 0 && expandedRows[tinDang.TinDangID] && tinDang.Phongs ? (
                                <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                                  {tinDang.Phongs.map((phong, idx) => (
                                    <div key={idx} style={{ padding: '2px 0' }}>
                                      {phong.DienTich} m²
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Xem phòng</span>
                              )
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                            {tinDang.GiaDien && (
                              <div style={{ color: '#6b7280' }}>
                                ⚡ {formatCurrency(tinDang.GiaDien)}/kWh
                              </div>
                            )}
                            {tinDang.GiaNuoc && (
                              <div style={{ color: '#6b7280' }}>
                                💧 {formatCurrency(tinDang.GiaNuoc)}/m³
                              </div>
                            )}
                            {tinDang.GiaDichVu && (
                              <div style={{ color: '#6b7280' }}>
                                🏢 {formatCurrency(tinDang.GiaDichVu)}/tháng
                              </div>
                            )}
                            {!tinDang.GiaDien && !tinDang.GiaNuoc && !tinDang.GiaDichVu && (
                              <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Chưa có</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem' }}>
                            {tinDang.TongSoPhong || 0}
                            <span style={{ color: '#6b7280' }}> ({tinDang.SoPhongTrong || 0} trống)</span>
                          </div>
                        </td>
                        <td>
                          <span className={`cda-badge cda-badge-${statusInfo.badge}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {new Date(tinDang.TaoLuc).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => navigate(`/chu-du-an/tin-dang/${tinDang.TinDangID}`)}
                              className="cda-btn cda-btn-sm cda-btn-ghost"
                              title="Xem chi tiết"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => navigate(`/chu-du-an/tin-dang/${tinDang.TinDangID}/chinh-sua`)}
                              className="cda-btn cda-btn-sm cda-btn-ghost"
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            {tinDang.TrangThai === 'Nhap' && (
                              <button
                                onClick={() => xacNhanGuiDuyet(tinDang)}
                                className="cda-btn cda-btn-sm cda-btn-success"
                                title="Gửi duyệt"
                              >
                                📤
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="cda-empty-state">
              <div className="cda-empty-icon">📝</div>
              <h3 className="cda-empty-title">Chưa có tin đăng nào</h3>
              <p className="cda-empty-description">
                Bắt đầu bằng cách tạo tin đăng đầu tiên của bạn
              </p>
              <Link to="/chu-du-an/tao-tin-dang" className="cda-btn cda-btn-primary">
                <span>➕</span>
                <span>Tạo tin đăng ngay</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </ChuDuAnLayout>
  );
};

export default QuanLyTinDang;