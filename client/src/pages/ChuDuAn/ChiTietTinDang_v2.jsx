import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineHeart,
  HiOutlineShare,
  HiOutlineMapPin,
  HiOutlineCurrencyDollar,
  HiOutlineHome,
  HiOutlineSquare3Stack3D,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineWifi,
  HiOutlineFire
} from 'react-icons/hi2';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService } from '../../services/ChuDuAnService';
import './ChiTietTinDang_v2.css';

/**
 * Component: Chi tiết Tin Đăng V2 - REDESIGNED
 * Route: /chu-du-an/tin-dang/:id
 * 
 * Features:
 * - Hero gallery với large images
 * - Tab navigation (Tổng quan, Chi tiết, Vị trí, Liên hệ)
 * - Floating CTA bar (sticky bottom mobile)
 * - Real data from backend
 * - Progressive disclosure pattern
 */
const ChiTietTinDangV2 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data state
  const [tinDang, setTinDang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [danhSachAnh, setDanhSachAnh] = useState([]);
  const [activeTab, setActiveTab] = useState('tong-quan');
  const [daLuu, setDaLuu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    layChiTietTinDang();
  }, [id]);

  const layChiTietTinDang = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TinDangService.layChiTiet(id);
      
      if (response.success) {
        setTinDang(response.data);
        
        // Parse danh sách ảnh
        const urls = parseImages(response.data.URL);
        setDanhSachAnh(urls);
      } else {
        setError(response.message || 'Không thể tải tin đăng');
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết tin đăng:', err);
      setError('Đã xảy ra lỗi khi tải tin đăng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (urlJson) => {
    try {
      if (!urlJson) return [];
      
      if (typeof urlJson === 'string' && urlJson.startsWith('/uploads')) {
        return [`http://localhost:5000${urlJson}?t=${Date.now()}`];
      }
      
      const urls = JSON.parse(urlJson);
      if (Array.isArray(urls)) {
        return urls.map(url => {
          const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
          return `${fullUrl}?t=${Date.now()}`;
        });
      }
      
      return [];
    } catch {
      return [];
    }
  };

  const parseTienIch = (tienIchJson) => {
    try {
      const parsed = JSON.parse(tienIchJson || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === danhSachAnh.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? danhSachAnh.length - 1 : prev - 1
    );
  };

  const handleLuuTin = () => {
    setDaLuu(!daLuu);
    // TODO: Sync với backend
  };

  const handleChiaSe = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('✅ Đã sao chép link chia sẻ!');
  };

  const handleLienHe = () => {
    setShowContactInfo(true);
    // TODO: Track action
  };

  const getTrangThaiInfo = (trangThai) => {
    const map = {
      'HoatDong': { 
        label: 'Đang hoạt động', 
        icon: <HiOutlineCheckCircle />, 
        color: '#10b981' 
      },
      'ChoXuLy': { 
        label: 'Chờ duyệt', 
        icon: <HiOutlineClock />, 
        color: '#f59e0b' 
      },
      'TuChoi': { 
        label: 'Từ chối', 
        icon: <HiOutlineXCircle />, 
        color: '#ef4444' 
      },
      'Nhap': { 
        label: 'Bản nháp', 
        icon: <HiOutlineDocumentText />, 
        color: '#6b7280' 
      }
    };
    return map[trangThai] || map['Nhap'];
  };

  // Loading state
  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="ctd2-loading">
          <div className="ctd2-loading-spinner"></div>
          <p>Đang tải chi tiết tin đăng...</p>
        </div>
      </ChuDuAnLayout>
    );
  }

  // Error state
  if (error || !tinDang) {
    return (
      <ChuDuAnLayout>
        <div className="ctd2-error">
          <HiOutlineXCircle className="ctd2-error-icon" />
          <h3>{error || 'Không tìm thấy tin đăng'}</h3>
          <button onClick={() => navigate('/chu-du-an/tin-dang')} className="ctd2-btn-primary">
            <HiOutlineArrowLeft />
            <span>Quay lại danh sách</span>
          </button>
        </div>
      </ChuDuAnLayout>
    );
  }

  const tienIch = parseTienIch(tinDang.TienIch);
  const trangThaiInfo = getTrangThaiInfo(tinDang.TrangThai);

  return (
    <ChuDuAnLayout>
      <div className="chi-tiet-tin-dang-v2">
        {/* Hero Gallery Section */}
        <div className="ctd2-hero">
          {/* Breadcrumb Overlay */}
          <div className="ctd2-breadcrumb-overlay">
            <button onClick={() => navigate(-1)} className="ctd2-back-btn">
              <HiOutlineArrowLeft />
              <span>Quay lại</span>
            </button>
            
            <div className="ctd2-breadcrumb">
              <Link to="/chu-du-an">Dashboard</Link>
              <span>/</span>
              <Link to="/chu-du-an/tin-dang">Tin đăng</Link>
              <span>/</span>
              <span>Chi tiết</span>
            </div>

            <div className="ctd2-actions">
              <button 
                onClick={handleLuuTin} 
                className={`ctd2-action-btn ${daLuu ? 'active' : ''}`}
                title="Lưu tin"
              >
                <HiOutlineHeart />
              </button>
              <button 
                onClick={handleChiaSe} 
                className="ctd2-action-btn"
                title="Chia sẻ"
              >
                <HiOutlineShare />
              </button>
            </div>
          </div>

          {/* Gallery Slider */}
          {danhSachAnh.length > 0 ? (
            <div className="ctd2-gallery">
              <div className="ctd2-gallery-main">
                <img 
                  src={danhSachAnh[currentImageIndex]} 
                  alt={`${tinDang.TieuDe} - ${currentImageIndex + 1}`}
                  className="ctd2-gallery-image"
                />
                
                {danhSachAnh.length > 1 && (
                  <>
                    <button onClick={prevImage} className="ctd2-gallery-nav ctd2-gallery-prev">
                      <HiOutlineChevronLeft />
                    </button>
                    <button onClick={nextImage} className="ctd2-gallery-nav ctd2-gallery-next">
                      <HiOutlineChevronRight />
                    </button>
                    <div className="ctd2-gallery-counter">
                      {currentImageIndex + 1} / {danhSachAnh.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {danhSachAnh.length > 1 && (
                <div className="ctd2-gallery-thumbs">
                  {danhSachAnh.slice(0, 6).map((url, index) => (
                    <div 
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`ctd2-thumb ${index === currentImageIndex ? 'active' : ''}`}
                    >
                      <img src={url} alt={`Thumb ${index + 1}`} />
                      {index === 5 && danhSachAnh.length > 6 && (
                        <div className="ctd2-thumb-overlay">
                          +{danhSachAnh.length - 6}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="ctd2-gallery-placeholder">
              <HiOutlineHome />
              <p>Chưa có ảnh</p>
            </div>
          )}

          {/* Floating Price Card */}
          <div className="ctd2-price-card">
            <div className="ctd2-price-main">
              <span className="ctd2-price-value">{formatCurrency(tinDang.Gia)}</span>
              <span className="ctd2-price-unit">/tháng</span>
            </div>
            <div className="ctd2-price-highlights">
              <div className="ctd2-highlight-item">
                <HiOutlineSquare3Stack3D />
                <span>{tinDang.DienTich} m²</span>
              </div>
              {tinDang.TongSoPhong > 0 && (
                <div className="ctd2-highlight-item">
                  <HiOutlineHome />
                  <span>{tinDang.TongSoPhong} phòng</span>
                </div>
              )}
              <div className="ctd2-highlight-item">
                <HiOutlineEye />
                <span>{tinDang.LuotXem || 0} lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section với Tabs */}
        <div className="ctd2-content">
          {/* Sticky Tab Navigation */}
          <div className="ctd2-tabs-nav">
            <button 
              onClick={() => setActiveTab('tong-quan')}
              className={`ctd2-tab-btn ${activeTab === 'tong-quan' ? 'active' : ''}`}
            >
              <HiOutlineSparkles />
              <span>Tổng quan</span>
            </button>
            <button 
              onClick={() => setActiveTab('chi-tiet')}
              className={`ctd2-tab-btn ${activeTab === 'chi-tiet' ? 'active' : ''}`}
            >
              <HiOutlineDocumentText />
              <span>Chi tiết</span>
            </button>
            <button 
              onClick={() => setActiveTab('vi-tri')}
              className={`ctd2-tab-btn ${activeTab === 'vi-tri' ? 'active' : ''}`}
            >
              <HiOutlineMapPin />
              <span>Vị trí</span>
            </button>
            <button 
              onClick={() => setActiveTab('lien-he')}
              className={`ctd2-tab-btn ${activeTab === 'lien-he' ? 'active' : ''}`}
            >
              <HiOutlineUser />
              <span>Liên hệ</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="ctd2-tab-content">
            {/* Tab: Tổng quan */}
            {activeTab === 'tong-quan' && (
              <div className="ctd2-tab-panel">
                <h1 className="ctd2-title">{tinDang.TieuDe}</h1>
                
                {tinDang.MoTa && (
                  <div className="ctd2-description">
                    <h3>Mô tả</h3>
                    <p>{tinDang.MoTa}</p>
                  </div>
                )}

                {tienIch.length > 0 && (
                  <div className="ctd2-amenities">
                    <h3>Tiện ích</h3>
                    <div className="ctd2-amenities-grid">
                      {tienIch.map((item, index) => (
                        <div key={index} className="ctd2-amenity-item">
                          <HiOutlineCheckCircle />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Chi tiết */}
            {activeTab === 'chi-tiet' && (
              <div className="ctd2-tab-panel">
                <h2>Thông số kỹ thuật</h2>
                <div className="ctd2-specs-table">
                  <div className="ctd2-spec-row">
                    <span className="ctd2-spec-label">Giá thuê</span>
                    <span className="ctd2-spec-value">{formatCurrency(tinDang.Gia)}/tháng</span>
                  </div>
                  <div className="ctd2-spec-row">
                    <span className="ctd2-spec-label">Diện tích</span>
                    <span className="ctd2-spec-value">{tinDang.DienTich} m²</span>
                  </div>
                  {tinDang.TongSoPhong > 0 && (
                    <>
                      <div className="ctd2-spec-row">
                        <span className="ctd2-spec-label">Tổng số phòng</span>
                        <span className="ctd2-spec-value">{tinDang.TongSoPhong}</span>
                      </div>
                      <div className="ctd2-spec-row">
                        <span className="ctd2-spec-label">Phòng trống</span>
                        <span className="ctd2-spec-value">{tinDang.SoPhongTrong}</span>
                      </div>
                    </>
                  )}
                  <div className="ctd2-spec-row">
                    <span className="ctd2-spec-label">Trạng thái</span>
                    <span className="ctd2-spec-value" style={{ color: trangThaiInfo.color }}>
                      {trangThaiInfo.label}
                    </span>
                  </div>
                  <div className="ctd2-spec-row">
                    <span className="ctd2-spec-label">Đăng lúc</span>
                    <span className="ctd2-spec-value">{formatDate(tinDang.TaoLuc)}</span>
                  </div>
                  <div className="ctd2-spec-row">
                    <span className="ctd2-spec-label">Mã tin</span>
                    <span className="ctd2-spec-value">#{tinDang.TinDangID}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Vị trí */}
            {activeTab === 'vi-tri' && (
              <div className="ctd2-tab-panel">
                <h2>Vị trí</h2>
                <div className="ctd2-location-address">
                  <HiOutlineMapPin />
                  <span>{tinDang.DiaChi}</span>
                </div>
                <div className="ctd2-map-placeholder">
                  <HiOutlineMapPin />
                  <p>Bản đồ sẽ được tích hợp ở đây</p>
                </div>
              </div>
            )}

            {/* Tab: Liên hệ */}
            {activeTab === 'lien-he' && (
              <div className="ctd2-tab-panel">
                <h2>Thông tin liên hệ</h2>
                <div className="ctd2-contact-card">
                  <div className="ctd2-contact-header">
                    <HiOutlineBuildingOffice2 className="ctd2-contact-icon" />
                    <div>
                      <h4>Chủ dự án</h4>
                      <p>{tinDang.TenDuAn || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  {showContactInfo ? (
                    <div className="ctd2-contact-info">
                      <div className="ctd2-contact-item">
                        <HiOutlinePhone />
                        <span>0123 456 789</span>
                      </div>
                      <div className="ctd2-contact-item">
                        <HiOutlineEnvelope />
                        <span>contact@example.com</span>
                      </div>
                    </div>
                  ) : (
                    <button onClick={handleLienHe} className="ctd2-btn-reveal">
                      Hiển thị thông tin liên hệ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating CTA Bar (Mobile) */}
        <div className="ctd2-floating-cta">
          <div className="ctd2-cta-price">
            <span className="ctd2-cta-value">{formatCurrency(tinDang.Gia)}</span>
            <span className="ctd2-cta-unit">/tháng</span>
          </div>
          <div className="ctd2-cta-actions">
            <button onClick={handleLienHe} className="ctd2-cta-btn ctd2-cta-btn-primary">
              <HiOutlinePhone />
              <span>Liên hệ</span>
            </button>
            <button className="ctd2-cta-btn ctd2-cta-btn-secondary">
              <HiOutlineEnvelope />
              <span>Nhắn tin</span>
            </button>
          </div>
        </div>
      </div>
    </ChuDuAnLayout>
  );
};

export default ChiTietTinDangV2;
