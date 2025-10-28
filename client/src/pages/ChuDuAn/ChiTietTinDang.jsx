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
  HiOutlineClock
} from 'react-icons/hi2';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService } from '../../services/ChuDuAnService';
import MapViTriPhong from '../../components/MapViTriPhong/MapViTriPhong';
import './ChiTietTinDang.css';

/**
 * Component: Chi tiết Tin Đăng
 * Route: /chu-du-an/tin-dang/:id
 * 
 * Design: Emerald Noir Theme (Light Glass Morphism)
 * - Nền trắng/gradient nhạt (#f9fafb → #e5e7eb)
 * - Glass morphism với backdrop-blur
 * - High contrast: Emerald (#14532D) + gold accents
 * - Mobile-first responsive (480px, 768px, 1024px, 1280px)
 * 
 * Features:
 * - Image gallery slider với thumbnails
 * - Lightbox fullscreen với keyboard shortcuts
 * - Sticky info card (giá, diện tích, CTA)
 * - Multiple rooms display (nếu TongSoPhong > 1)
 * - Toast notifications
 * - Skeleton loading
 * - Scroll progress bar
 * - Accessibility (ARIA, focus states)
 */
const ChiTietTinDang = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tinDang, setTinDang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [danhSachAnh, setDanhSachAnh] = useState([]);
  const [tinTuongTu, setTinTuongTu] = useState([]);
  const [daLuu, setDaLuu] = useState(false);
  
  // 🎨 NEW: Enhanced UX states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    layChiTietTinDang();
    layTinTuongTu();
  }, [id]);

  // 🎨 NEW: Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🎨 NEW: Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (lightboxOpen) {
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'Escape') setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, currentImageIndex]);

  const layChiTietTinDang = async () => {
    try {
      setLoading(true);
      const response = await TinDangService.layChiTiet(id);
      if (response.success) {
        setTinDang(response.data);
        
        // Parse danh sách ảnh
        const urls = parseImages(response.data.URL);
        setDanhSachAnh(urls);
      }
    } catch (error) {
      console.error('Lỗi tải chi tiết tin đăng:', error);
    } finally {
      setLoading(false);
    }
  };

  const layTinTuongTu = async () => {
    try {
      // TODO: Implement API lấy tin tương tự
      // const response = await TinDangService.layTinTuongTu(id);
      // setTinTuongTu(response.data);
    } catch (error) {
      console.error('Lỗi tải tin tương tự:', error);
    }
  };

  const parseImages = (urlJson) => {
    try {
      if (!urlJson) return [];
      
      // Handle string path
      if (typeof urlJson === 'string' && urlJson.startsWith('/uploads')) {
        return [`http://localhost:5000${urlJson}`];
      }
      
      // Handle JSON array
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

  const parseTienIch = (tienIchJson) => {
    try {
      return JSON.parse(tienIchJson || '[]');
    } catch {
      return [];
    }
  };

  const formatCurrency = (value) => {
    return parseInt(value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  /**
   * 💰 Tính giá hiển thị thông minh dựa trên loại tin đăng
   * - Phòng đơn: Lấy từ tinDang.Gia
   * - Nhiều phòng: Hiển thị khoảng giá min-max từ DanhSachPhong
   */
  const getGiaHienThi = () => {
    // Case 1: Phòng đơn (TongSoPhong ≤ 1)
    if (!tinDang.TongSoPhong || tinDang.TongSoPhong <= 1) {
      return formatCurrency(tinDang.Gia);
    }

    // Case 2: Nhiều phòng - Tính khoảng giá từ DanhSachPhong
    if (tinDang.DanhSachPhong && tinDang.DanhSachPhong.length > 0) {
      const gias = tinDang.DanhSachPhong
        .map(p => parseFloat(p.Gia))
        .filter(g => !isNaN(g) && g > 0);

      if (gias.length === 0) {
        return 'Liên hệ';
      }

      const minGia = Math.min(...gias);
      const maxGia = Math.max(...gias);

      // Nếu tất cả phòng cùng giá
      if (minGia === maxGia) {
        return formatCurrency(minGia);
      }

      // Hiển thị khoảng giá
      return `${formatCurrency(minGia)} - ${formatCurrency(maxGia)}`;
    }

    // Fallback
    return 'Liên hệ';
  };

  /**
   * 📐 Tính diện tích hiển thị thông minh
   * - Phòng đơn: Lấy từ tinDang.DienTich
   * - Nhiều phòng: Hiển thị khoảng diện tích min-max
   */
  const getDienTichHienThi = () => {
    // Case 1: Phòng đơn
    if (!tinDang.TongSoPhong || tinDang.TongSoPhong <= 1) {
      return tinDang.DienTich ? `${tinDang.DienTich} m²` : 'N/A';
    }

    // Case 2: Nhiều phòng
    if (tinDang.DanhSachPhong && tinDang.DanhSachPhong.length > 0) {
      const dienTichs = tinDang.DanhSachPhong
        .map(p => parseFloat(p.DienTich))
        .filter(dt => !isNaN(dt) && dt > 0);

      if (dienTichs.length === 0) {
        return 'N/A';
      }

      const minDT = Math.min(...dienTichs);
      const maxDT = Math.max(...dienTichs);

      if (minDT === maxDT) {
        return `${minDT} m²`;
      }

      return `${minDT} - ${maxDT} m²`;
    }

    return 'N/A';
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

  const handleLuuTin = () => {
    setDaLuu(!daLuu);
    // TODO: Call API lưu/bỏ lưu tin
  };

  const handleChiaSeHu = () => {
    // Copy URL to clipboard với toast notification
    navigator.clipboard.writeText(window.location.href).then(() => {
      // 🎨 NEW: Better notification
      showToast('✅ Đã sao chép link chia sẻ!');
    });
  };

  // � Handler cho nút "Hẹn lịch ngay"
  const handleHenLichNgay = () => {
    alert('⚠️ Đây là giao diện xem mẫu\n\nĐể thực hiện thao tác hẹn lịch xem phòng, hãy đăng nhập tài khoản Khách hàng.');
  };

  // 🎯 Handler cho nút "Gửi tin nhắn"
  const handleGuiTinNhan = () => {
    alert('⚠️ Đây là giao diện xem mẫu\n\nĐể thực hiện thao tác gửi tin nhắn, hãy đăng nhập tài khoản Khách hàng.');
  };

  // 🎯 Handler cho nút "Đặt lịch xem phòng" (trong danh sách phòng)
  const handleDatLichXemPhong = (tenPhong) => {
    alert(`⚠️ Đây là giao diện xem mẫu\n\nĐể đặt lịch xem ${tenPhong}, hãy đăng nhập tài khoản Khách hàng.`);
  };

  // �🎨 NEW: Toast notification helper
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'ctd-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  // 🎨 NEW: Open lightbox
  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  // 🎨 NEW: Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
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
        color: '#D4AF37' 
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

  // 🎨 NEW: Skeleton Loading Component
  const SkeletonLoader = () => (
    <ChuDuAnLayout>
      <div className="chi-tiet-tin-dang">
        {/* Scroll Progress Bar */}
        <div className="ctd-scroll-progress" style={{ width: `${scrollProgress}%` }} />
        
        {/* Skeleton Header */}
        <div className="ctd-header">
          <div className="ctd-skeleton ctd-skeleton-button" style={{ width: '120px' }} />
          <div className="ctd-skeleton ctd-skeleton-text" style={{ width: '300px' }} />
        </div>

        {/* Skeleton Grid */}
        <div className="ctd-grid">
          <div className="ctd-left">
            {/* Skeleton Gallery */}
            <div className="ctd-skeleton ctd-skeleton-gallery" style={{ height: '500px' }} />
            
            {/* Skeleton Specs */}
            <div className="ctd-section">
              <div className="ctd-skeleton ctd-skeleton-title" style={{ width: '200px' }} />
              <div className="ctd-specs-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="ctd-skeleton ctd-skeleton-spec" />
                ))}
              </div>
            </div>

            {/* Skeleton Description */}
            <div className="ctd-section">
              <div className="ctd-skeleton ctd-skeleton-title" style={{ width: '150px' }} />
              <div className="ctd-skeleton ctd-skeleton-text" style={{ height: '100px' }} />
            </div>
          </div>

          {/* Skeleton Info Card */}
          <div className="ctd-right">
            <div className="ctd-info-card">
              <div className="ctd-skeleton ctd-skeleton-title" style={{ width: '100%', height: '30px' }} />
              <div className="ctd-skeleton ctd-skeleton-text" style={{ width: '150px', height: '40px', marginTop: '16px' }} />
              <div className="ctd-skeleton ctd-skeleton-button" style={{ width: '100%', marginTop: '24px' }} />
              <div className="ctd-skeleton ctd-skeleton-button" style={{ width: '100%', marginTop: '12px' }} />
            </div>
          </div>
        </div>
      </div>
    </ChuDuAnLayout>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!tinDang) {
    return (
      <ChuDuAnLayout>
        <div className="ctd-error">
          <HiOutlineXCircle className="ctd-error-icon" />
          <h3>Không tìm thấy tin đăng</h3>
          <button onClick={() => navigate('/chu-du-an/tin-dang')} className="ctd-btn-primary">
            Quay lại danh sách
          </button>
        </div>
      </ChuDuAnLayout>
    );
  }

  const tienIch = parseTienIch(tinDang.TienIch);
  const trangThaiInfo = getTrangThaiInfo(tinDang.TrangThai);

  return (
    <ChuDuAnLayout>
      <div className="chi-tiet-tin-dang">
        {/* Header với Breadcrumb */}
        <div className="ctd-header">
          <button onClick={() => navigate(-1)} className="ctd-back-btn">
            <HiOutlineArrowLeft />
            <span>Quay lại</span>
          </button>
          
          <div className="ctd-breadcrumb">
            <Link to="/chu-du-an">Dashboard</Link>
            <span>/</span>
            <Link to="/chu-du-an/tin-dang">Quản lý tin đăng</Link>
            <span>/</span>
            <span>Chi tiết</span>
          </div>

          <div className="ctd-header-actions">
            <button 
              onClick={handleLuuTin} 
              className={`ctd-btn-icon ${daLuu ? 'active' : ''}`}
              title="Lưu tin"
            >
              <HiOutlineHeart style={{ width: '24px', height: '24px', color: daLuu ? '#ef4444' : '#111827' }} />
            </button>
            <button 
              onClick={handleChiaSeHu} 
              className="ctd-btn-icon"
              title="Chia sẻ"
            >
              <HiOutlineShare style={{ width: '24px', height: '24px', color: '#111827' }} />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="ctd-grid">
          {/* Left Column - Gallery & Details */}
          <div className="ctd-left">
            {/* Image Gallery */}
            {danhSachAnh.length > 0 && (
              <div className="ctd-gallery">
                <div 
                  className="ctd-gallery-main"
                  onClick={() => openLightbox(currentImageIndex)}
                  style={{ cursor: 'zoom-in' }}
                  role="button"
                  tabIndex={0}
                  aria-label="Click to view full size"
                >
                  <img 
                    src={danhSachAnh[currentImageIndex]} 
                    alt={`${tinDang.TieuDe} - ${currentImageIndex + 1}`}
                    className="ctd-gallery-image"
                  />
                  
                  {danhSachAnh.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="ctd-gallery-nav ctd-gallery-prev"
                        aria-label="Previous image"
                      >
                        <HiOutlineChevronLeft />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="ctd-gallery-nav ctd-gallery-next"
                        aria-label="Next image"
                      >
                        <HiOutlineChevronRight />
                      </button>
                      <div className="ctd-gallery-counter">
                        {currentImageIndex + 1} / {danhSachAnh.length}
                      </div>
                    </>
                  )}

                  {/* 🎨 NEW: Zoom hint */}
                  <div className="ctd-zoom-hint">
                    <span>🔍 Click để xem kích thước đầy đủ</span>
                  </div>
                </div>

                {/* Thumbnails */}
                {danhSachAnh.length > 1 && (
                  <div className="ctd-gallery-thumbs">
                    {danhSachAnh.map((url, index) => (
                      <div 
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`ctd-thumb ${index === currentImageIndex ? 'active' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img src={url} alt={`Thumb ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Thông số chi tiết */}
            <div className="ctd-section">
              <h2 className="ctd-section-title">Thông số chi tiết</h2>
              <div className="ctd-specs-grid">
                <div className="ctd-spec-item">
                  <HiOutlineCurrencyDollar className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Giá thuê</span>
                    <span className="ctd-spec-value">{getGiaHienThi()}/tháng</span>
                  </div>
                </div>

                <div className="ctd-spec-item">
                  <HiOutlineSquare3Stack3D className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Diện tích</span>
                    <span className="ctd-spec-value">{getDienTichHienThi()}</span>
                  </div>
                </div>

                <div className="ctd-spec-item">
                  <HiOutlineHome className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Loại phòng</span>
                    <span className="ctd-spec-value">{tinDang.LoaiPhong || 'Phòng trọ'}</span>
                  </div>
                </div>

                <div className="ctd-spec-item">
                  <HiOutlineBuildingOffice2 className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Trạng thái</span>
                    <span className="ctd-spec-value" style={{ color: trangThaiInfo.color }}>
                      {trangThaiInfo.label}
                    </span>
                  </div>
                </div>

                {tinDang.TongSoPhong > 0 && (
                  <>
                    <div className="ctd-spec-item">
                      <HiOutlineHome className="ctd-spec-icon" />
                      <div className="ctd-spec-content">
                        <span className="ctd-spec-label">Tổng số phòng</span>
                        <span className="ctd-spec-value">{tinDang.TongSoPhong}</span>
                      </div>
                    </div>

                    <div className="ctd-spec-item">
                      <HiOutlineCheckCircle className="ctd-spec-icon" />
                      <div className="ctd-spec-content">
                        <span className="ctd-spec-label">Phòng trống</span>
                        <span className="ctd-spec-value">{tinDang.SoPhongTrong}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="ctd-spec-item">
                  <HiOutlineCalendar className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Đăng lúc</span>
                    <span className="ctd-spec-value">{formatDate(tinDang.TaoLuc)}</span>
                  </div>
                </div>

                <div className="ctd-spec-item">
                  <HiOutlineEye className="ctd-spec-icon" />
                  <div className="ctd-spec-content">
                    <span className="ctd-spec-label">Lượt xem</span>
                    <span className="ctd-spec-value">{tinDang.LuotXem || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="ctd-section">
              <h2 className="ctd-section-title">Mô tả chi tiết</h2>
              <div className="ctd-description">
                {tinDang.MoTa ? (
                  <p>{tinDang.MoTa}</p>
                ) : (
                  <p className="ctd-description-empty">Chưa có mô tả chi tiết</p>
                )}
              </div>
            </div>

            {/* Tiện ích */}
            {tienIch.length > 0 && (
              <div className="ctd-section">
                <h2 className="ctd-section-title">Tiện ích</h2>
                <div className="ctd-tienich-grid">
                  {tienIch.map((item, index) => (
                    <div key={index} className="ctd-tienich-item">
                      <HiOutlineCheckCircle className="ctd-tienich-icon" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🏢 NEW: Danh sách phòng (REDESIGN 09/10/2025 - Luôn hiển thị) */}
            {tinDang.DanhSachPhong && tinDang.DanhSachPhong.length > 0 && (
              <div className="ctd-section ctd-rooms-section">
                <div className="ctd-section-header">
                  <h2 className="ctd-section-title">
                    <HiOutlineBuildingOffice2 />
                    <span>Danh sách phòng ({tinDang.DanhSachPhong.length} phòng)</span>
                  </h2>
                  <div className="ctd-rooms-summary">
                    <span className="ctd-rooms-available">
                      <HiOutlineCheckCircle /> {tinDang.SoPhongTrong || 0} còn trống
                    </span>
                    <span className="ctd-rooms-rented">
                      {tinDang.TongSoPhong - (tinDang.SoPhongTrong || 0)} đã thuê
                    </span>
                  </div>
                </div>

                <div className="ctd-rooms-grid">
                  {tinDang.DanhSachPhong.map((phong, index) => {
                    const phongImages = parseImages(phong.URL);
                    const isAvailable = phong.TrangThai === 'Trong';

                    return (
                      <div 
                        key={phong.PhongID} 
                        className={`ctd-room-card ${!isAvailable ? 'ctd-room-card-rented' : ''}`}
                      >
                        {/* Room Image */}
                        <div className="ctd-room-image-wrapper">
                          {phongImages.length > 0 ? (
                            <img 
                              src={phongImages[0]} 
                              alt={phong.TenPhong}
                              className="ctd-room-image"
                              loading="lazy"
                            />
                          ) : (
                            <div className="ctd-room-image-placeholder">
                              <HiOutlineHome />
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className={`ctd-room-status ${isAvailable ? 'available' : 'rented'}`}>
                            {isAvailable ? (
                              <>
                                <HiOutlineCheckCircle />
                                <span>Còn trống</span>
                              </>
                            ) : (
                              <>
                                <HiOutlineXCircle />
                                <span>Đã thuê</span>
                              </>
                            )}
                          </div>

                          {/* Image Count */}
                          {phongImages.length > 1 && (
                            <div className="ctd-room-image-count">
                              <HiOutlineSquare3Stack3D />
                              <span>{phongImages.length} ảnh</span>
                            </div>
                          )}
                        </div>

                        {/* Room Info */}
                        <div className="ctd-room-info">
                          <h3 className="ctd-room-name">{phong.TenPhong}</h3>
                          
                          <div className="ctd-room-specs">
                            <div className="ctd-room-spec">
                              <HiOutlineCurrencyDollar className="ctd-room-spec-icon" />
                              <span className="ctd-room-spec-value">{formatCurrency(phong.Gia)}</span>
                              <span className="ctd-room-spec-unit">/tháng</span>
                            </div>
                            <div className="ctd-room-spec">
                              <HiOutlineSquare3Stack3D className="ctd-room-spec-icon" />
                              <span className="ctd-room-spec-value">{phong.DienTich}</span>
                              <span className="ctd-room-spec-unit">m²</span>
                            </div>
                          </div>

                          {/* Room Description */}
                          {phong.MoTa && (
                            <p className="ctd-room-description">
                              {phong.MoTa.length > 80 
                                ? `${phong.MoTa.substring(0, 80)}...` 
                                : phong.MoTa}
                            </p>
                          )}

                          {/* CTA Button */}
                          {isAvailable && (
                            <button 
                              className="ctd-room-cta"
                              onClick={() => handleDatLichXemPhong(phong.TenPhong)}
                            >
                              <HiOutlineCalendar />
                              <span>Đặt lịch xem phòng</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vị trí */}
            {(tinDang.ViDo && tinDang.KinhDo) ? (
              <MapViTriPhong
                lat={parseFloat(tinDang.ViDo)}
                lng={parseFloat(tinDang.KinhDo)}
                tenDuAn={tinDang.TenDuAn || tinDang.TieuDe}
                diaChi={tinDang.DiaChiDuAn || tinDang.DiaChi}
                zoom={15}
                height={window.innerWidth < 768 ? 300 : 400}
              />
            ) : (
              <div className="ctd-section">
                <h2 className="ctd-section-title">
                  <HiOutlineMapPin />
                  <span>Vị trí</span>
                </h2>
                <div className="ctd-location">
                  <p className="ctd-location-address">{tinDang.DiaChi || tinDang.DiaChiDuAn}</p>
                  <div className="ctd-map-placeholder">
                    <HiOutlineMapPin />
                    <p>Thông tin vị trí chưa có sẵn</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Info Card */}
          <div className="ctd-right">
            <div className="ctd-info-card">
              <div className="ctd-info-header">
                <h1 className="ctd-info-title">{tinDang.TieuDe}</h1>
                <div className="ctd-info-price">
                  <span className="ctd-price-value">{getGiaHienThi()}</span>
                  <span className="ctd-price-unit">/tháng</span>
                </div>
              </div>

              <div className="ctd-info-highlights">
                <div className="ctd-highlight">
                  <HiOutlineSquare3Stack3D />
                  <span>{getDienTichHienThi()}</span>
                </div>
                {tinDang.TongSoPhong > 0 && (
                  <div className="ctd-highlight">
                    <HiOutlineHome />
                    <span>{tinDang.TongSoPhong} phòng</span>
                  </div>
                )}
              </div>

              <div className="ctd-info-actions">
                <button 
                  className="ctd-btn-primary ctd-btn-full"
                  onClick={handleHenLichNgay}
                >
                  <HiOutlineCalendar />
                  <span>Hẹn lịch ngay</span>
                </button>
                <button 
                  className="ctd-btn-secondary ctd-btn-full"
                  onClick={handleGuiTinNhan}
                >
                  <HiOutlineEnvelope />
                  <span>Gửi tin nhắn</span>
                </button>
                 <button
                  className="ctd-btn-secondary ctd-btn-deposit"
                  onClick={() => {
                    const acc = tinDang?.BankAccountNumber ?? '80349195777';
                    const bank = tinDang?.BankName ?? 'TPBank';
                    const amount = tinDang?.Gia ?? tinDang?.TienCoc ?? '100000';
                    const des = `dk${tinDang?.TinDangID ?? tinDang?.id ?? ''}`;
                    navigate(`/thanhtoancoc?acc=${encodeURIComponent(acc)}&bank=${encodeURIComponent(bank)}&amount=${encodeURIComponent(amount)}&des=${encodeURIComponent(des)}&order=${encodeURIComponent(tinDang?.TinDangID ?? '')}`);
                  }}
                  title="Đặt cọc"
                >
                  <HiOutlineCurrencyDollar style={{ width: 18, height: 18, marginRight: 8 }} />
                  <span>Đặt cọc</span>
                </button>
              </div>

              {/* Thông tin dự án */}
              <div className="ctd-info-owner">
                <div className="ctd-owner-header">
                  <HiOutlineBuildingOffice2 className="ctd-owner-icon" />
                  <div>
                    <h4>Dự án</h4>
                    <p>{tinDang.TenDuAn || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin chủ dự án */}
              <div className="ctd-info-owner">
                <div className="ctd-owner-header">
                  <HiOutlineUser className="ctd-owner-icon" />
                  <div>
                    <h4>Chủ dự án</h4>
                    <p>{localStorage.getItem('TenDayDu') || 'Người dùng'}</p>
                  </div>
                </div>
              </div>

              {/* Trạng thái tin đăng */}
              <div className="ctd-info-status">
                <div className="ctd-status-item">
                  <span>Trạng thái:</span>
                  <div className="ctd-status-badge" style={{ color: trangThaiInfo.color }}>
                    {trangThaiInfo.icon}
                    <span>{trangThaiInfo.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tin đăng tương tự */}
        {tinTuongTu.length > 0 && (
          <div className="ctd-section ctd-similar">
            <h2 className="ctd-section-title">Tin đăng tương tự</h2>
            <div className="ctd-similar-grid">
              {/* TODO: Render danh sách tin tương tự */}
            </div>
          </div>
        )}

        {/* 🎨 NEW: Image Lightbox */}
        {lightboxOpen && (
          <div 
            className="ctd-lightbox"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            <div className="ctd-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="ctd-lightbox-close"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <HiOutlineXCircle />
              </button>

              <img 
                src={danhSachAnh[currentImageIndex]}
                alt={`${tinDang.TieuDe} - Full size`}
                className="ctd-lightbox-image"
              />

              {danhSachAnh.length > 1 && (
                <>
                  <button 
                    className="ctd-lightbox-nav ctd-lightbox-prev"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <HiOutlineChevronLeft />
                  </button>
                  <button 
                    className="ctd-lightbox-nav ctd-lightbox-next"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <HiOutlineChevronRight />
                  </button>

                  <div className="ctd-lightbox-counter">
                    {currentImageIndex + 1} / {danhSachAnh.length}
                  </div>

                  {/* Thumbnail strip */}
                  <div className="ctd-lightbox-thumbs">
                    {danhSachAnh.map((url, index) => (
                      <div
                        key={index}
                        className={`ctd-lightbox-thumb ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                      >
                        <img src={url} alt={`Thumb ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 🎨 NEW: Scroll Progress Bar */}
        <div 
          className="ctd-scroll-progress" 
          style={{ width: `${scrollProgress}%` }}
          role="progressbar"
          aria-valuenow={scrollProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </ChuDuAnLayout>
  );
};

export default ChiTietTinDang;
