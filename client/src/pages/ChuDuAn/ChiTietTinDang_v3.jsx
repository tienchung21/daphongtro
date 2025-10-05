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
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineSparkles,
  HiOutlineBolt,
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService } from '../../services/ChuDuAnService';
import './ChiTietTinDang_v3.css';

/**
 * Component: Chi tiết Tin Đăng V3 - REDESIGNED
 * Route: /chu-du-an/tin-dang/:id
 * 
 * NEW Design Principles:
 * - Hero-first layout (Full-width image slider)
 * - Clean information architecture
 * - Mobile-first responsive
 * - Accessibility compliant
 */
const ChiTietTinDangV3 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tinDang, setTinDang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [danhSachAnh, setDanhSachAnh] = useState([]);
  const [daLuu, setDaLuu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, details, location

  useEffect(() => {
    layChiTietTinDang();
  }, [id]);

  const layChiTietTinDang = async () => {
    try {
      setLoading(true);
      const response = await TinDangService.layChiTiet(id);
      if (response.success) {
        setTinDang(response.data);
        const urls = parseImages(response.data.URL);
        setDanhSachAnh(urls);
      }
    } catch (error) {
      console.error('Lỗi tải chi tiết tin đăng:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (urlJson) => {
    try {
      if (!urlJson) return [];
      if (typeof urlJson === 'string' && urlJson.startsWith('/uploads')) {
        return [`http://localhost:5000${urlJson}`];
      }
      const urls = JSON.parse(urlJson);
      if (Array.isArray(urls)) {
        return urls.map(url => 
          url.startsWith('http') ? url : `http://localhost:5000${url}`
        );
      }
      return [];
    } catch {
      return [];
    }
  };

  const formatCurrency = (value) => {
    return parseInt(value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
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

  // Tính giá hiển thị thông minh
  const getDisplayPrice = () => {
    if (!tinDang) return { text: '0 ₫', type: 'single' };
    
    if (tinDang.TongSoPhong <= 1) {
      return { 
        text: formatCurrency(tinDang.Gia),
        type: 'single'
      };
    }
    
    if (tinDang.DanhSachPhong && tinDang.DanhSachPhong.length > 0) {
      const prices = tinDang.DanhSachPhong.map(p => parseFloat(p.Gia || 0));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      
      if (min === max) {
        return { 
          text: formatCurrency(min),
          type: 'single'
        };
      }
      
      return { 
        text: `${formatCurrency(min)} - ${formatCurrency(max)}`,
        type: 'range'
      };
    }
    
    return { text: 'Liên hệ', type: 'contact' };
  };

  const displayPrice = getDisplayPrice();

  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="ctd-v3-skeleton">
          <div className="ctd-v3-skeleton-hero" />
          <div className="ctd-v3-skeleton-content">
            <div className="ctd-v3-skeleton-text" style={{ width: '60%', height: '32px' }} />
            <div className="ctd-v3-skeleton-text" style={{ width: '30%', height: '24px', marginTop: '16px' }} />
          </div>
        </div>
      </ChuDuAnLayout>
    );
  }

  if (!tinDang) {
    return (
      <ChuDuAnLayout>
        <div className="ctd-v3-error">
          <HiOutlineXCircle />
          <h3>Không tìm thấy tin đăng</h3>
          <button onClick={() => navigate('/chu-du-an/tin-dang')}>
            Quay lại danh sách
          </button>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      <div className="chi-tiet-tin-dang-v3">
        {/* 🎨 NEW: Floating Action Bar */}
        <div className="ctd-v3-action-bar">
          <button onClick={() => navigate(-1)} className="ctd-v3-back">
            <HiOutlineArrowLeft />
            <span>Quay lại</span>
          </button>
          
          <div className="ctd-v3-actions">
            <button onClick={() => setDaLuu(!daLuu)} className={`ctd-v3-action ${daLuu ? 'active' : ''}`}>
              <HiOutlineHeart />
            </button>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="ctd-v3-action">
              <HiOutlineShare />
            </button>
          </div>
        </div>

        {/* 🎨 NEW: Hero Gallery (Full-width) */}
        <div className="ctd-v3-hero">
          {danhSachAnh.length > 0 ? (
            <>
              <img 
                src={danhSachAnh[currentImageIndex]} 
                alt={tinDang.TieuDe}
                className="ctd-v3-hero-image"
              />
              
              {danhSachAnh.length > 1 && (
                <>
                  <button onClick={prevImage} className="ctd-v3-nav ctd-v3-nav-prev">
                    <HiOutlineChevronLeft />
                  </button>
                  <button onClick={nextImage} className="ctd-v3-nav ctd-v3-nav-next">
                    <HiOutlineChevronRight />
                  </button>
                  
                  <div className="ctd-v3-hero-counter">
                    {currentImageIndex + 1} / {danhSachAnh.length}
                  </div>
                </>
              )}
              
              {/* Thumbnail Grid Overlay */}
              <div className="ctd-v3-hero-thumbs">
                {danhSachAnh.slice(0, 5).map((url, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`ctd-v3-thumb ${idx === currentImageIndex ? 'active' : ''}`}
                  >
                    <img src={url} alt={`Ảnh ${idx + 1}`} />
                  </div>
                ))}
                {danhSachAnh.length > 5 && (
                  <div className="ctd-v3-thumb ctd-v3-thumb-more">
                    +{danhSachAnh.length - 5}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="ctd-v3-hero-placeholder">
              <HiOutlineHome />
            </div>
          )}
        </div>

        {/* 🎨 NEW: Content Container */}
        <div className="ctd-v3-container">
          {/* Main Content */}
          <div className="ctd-v3-main">
            {/* Title & Price */}
            <div className="ctd-v3-header">
              <h1 className="ctd-v3-title">{tinDang.TieuDe}</h1>
              <div className="ctd-v3-meta">
                <span className="ctd-v3-location">
                  <HiOutlineMapPin />
                  {tinDang.TenKhuVuc || tinDang.DiaChiDuAn}
                </span>
                <span className="ctd-v3-date">
                  <HiOutlineClock />
                  Cập nhật {formatDate(tinDang.CapNhatLuc)}
                </span>
              </div>
            </div>

            {/* 🎨 NEW: Quick Stats Cards */}
            <div className="ctd-v3-stats">
              <div className="ctd-v3-stat-card ctd-v3-stat-primary">
                <div className="ctd-v3-stat-icon">
                  <HiOutlineCurrencyDollar />
                </div>
                <div className="ctd-v3-stat-info">
                  <span className="ctd-v3-stat-label">Giá thuê</span>
                  <span className="ctd-v3-stat-value">{displayPrice.text}</span>
                  {displayPrice.type === 'range' && (
                    <span className="ctd-v3-stat-unit">/tháng</span>
                  )}
                </div>
              </div>

              <div className="ctd-v3-stat-card">
                <div className="ctd-v3-stat-icon">
                  <HiOutlineSquare3Stack3D />
                </div>
                <div className="ctd-v3-stat-info">
                  <span className="ctd-v3-stat-label">Diện tích</span>
                  <span className="ctd-v3-stat-value">
                    {tinDang.DienTich || 'N/A'} m²
                  </span>
                </div>
              </div>

              {tinDang.TongSoPhong > 0 && (
                <div className="ctd-v3-stat-card">
                  <div className="ctd-v3-stat-icon">
                    <HiOutlineBuildingOffice2 />
                  </div>
                  <div className="ctd-v3-stat-info">
                    <span className="ctd-v3-stat-label">Số phòng</span>
                    <span className="ctd-v3-stat-value">{tinDang.TongSoPhong}</span>
                    {tinDang.SoPhongTrong > 0 && (
                      <span className="ctd-v3-stat-badge">{tinDang.SoPhongTrong} trống</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 🎨 NEW: Tab Navigation */}
            <div className="ctd-v3-tabs">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`ctd-v3-tab ${activeTab === 'overview' ? 'active' : ''}`}
              >
                <HiOutlineSparkles />
                Tổng quan
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`ctd-v3-tab ${activeTab === 'details' ? 'active' : ''}`}
              >
                <HiOutlineBolt />
                Chi tiết
              </button>
              <button 
                onClick={() => setActiveTab('location')}
                className={`ctd-v3-tab ${activeTab === 'location' ? 'active' : ''}`}
              >
                <HiOutlineMapPin />
                Vị trí
              </button>
            </div>

            {/* Tab Content */}
            <div className="ctd-v3-tab-content">
              {activeTab === 'overview' && (
                <div className="ctd-v3-overview">
                  <h2>Mô tả</h2>
                  <div className="ctd-v3-description">
                    {tinDang.MoTa || 'Chưa có mô tả'}
                  </div>

                  {/* Rooms List */}
                  {tinDang.TongSoPhong > 1 && tinDang.DanhSachPhong && (
                    <div className="ctd-v3-rooms">
                      <h2>Danh sách phòng ({tinDang.DanhSachPhong.length})</h2>
                      <div className="ctd-v3-rooms-grid">
                        {tinDang.DanhSachPhong.map((phong) => (
                          <div key={phong.PhongID} className="ctd-v3-room-card">
                            <div className="ctd-v3-room-header">
                              <h3>{phong.TenPhong}</h3>
                              <span className={`ctd-v3-room-status ${phong.TrangThai === 'Trong' ? 'available' : 'rented'}`}>
                                {phong.TrangThai === 'Trong' ? 'Còn trống' : 'Đã thuê'}
                              </span>
                            </div>
                            <div className="ctd-v3-room-specs">
                              <span><HiOutlineCurrencyDollar /> {formatCurrency(phong.Gia)}/tháng</span>
                              <span><HiOutlineSquare3Stack3D /> {phong.DienTich} m²</span>
                            </div>
                            {phong.GhiChu && (
                              <p className="ctd-v3-room-note">{phong.GhiChu}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="ctd-v3-details">
                  <h2>Thông tin chi tiết</h2>
                  <div className="ctd-v3-detail-grid">
                    <div className="ctd-v3-detail-item">
                      <span className="label">Dự án:</span>
                      <span className="value">{tinDang.TenDuAn}</span>
                    </div>
                    <div className="ctd-v3-detail-item">
                      <span className="label">Khu vực:</span>
                      <span className="value">{tinDang.TenKhuVuc}</span>
                    </div>
                    <div className="ctd-v3-detail-item">
                      <span className="label">Trạng thái:</span>
                      <span className="value">{tinDang.TrangThai}</span>
                    </div>
                    <div className="ctd-v3-detail-item">
                      <span className="label">Mã tin:</span>
                      <span className="value">#{tinDang.TinDangID}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="ctd-v3-location">
                  <h2>Vị trí</h2>
                  <p className="ctd-v3-address">{tinDang.DiaChiDuAn}</p>
                  <div className="ctd-v3-map-placeholder">
                    <HiOutlineMapPin />
                    <p>Bản đồ sẽ được tích hợp ở đây</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 🎨 NEW: Sidebar CTA */}
          <div className="ctd-v3-sidebar">
            <div className="ctd-v3-cta-card">
              <div className="ctd-v3-cta-header">
                <HiOutlineShieldCheck />
                <span>Liên hệ đặt phòng</span>
              </div>
              
              <div className="ctd-v3-price-display">
                <span className="ctd-v3-price">{displayPrice.text}</span>
                {displayPrice.type !== 'contact' && (
                  <span className="ctd-v3-price-unit">/tháng</span>
                )}
              </div>

              <button className="ctd-v3-cta-primary">
                <HiOutlineCalendar />
                Đặt lịch xem phòng
              </button>

              <button className="ctd-v3-cta-secondary">
                <HiOutlinePhone />
                Liên hệ ngay
              </button>

              {tinDang.TenChuDuAn && (
                <div className="ctd-v3-owner-info">
                  <span className="label">Chủ dự án:</span>
                  <span className="value">{tinDang.TenChuDuAn}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChuDuAnLayout>
  );
};

export default ChiTietTinDangV3;
