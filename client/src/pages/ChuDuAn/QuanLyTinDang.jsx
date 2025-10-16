import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService, DuAnService } from '../../services/ChuDuAnService';
import ModalPreviewPhong from '../../components/ChuDuAn/ModalPreviewPhong';
import './QuanLyTinDang.css';

// React Icons
import {
  HiOutlineHome,
  HiOutlineCurrencyDollar,
  HiOutlineSquare3Stack3D,
  HiOutlineCheckCircle,
  HiOutlineBolt,
  HiBeaker,
  HiOutlineCog6Tooth,
  HiOutlineMapPin,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
  HiOutlineChartBar
} from 'react-icons/hi2';

/**
 * Quản lý tin đăng - Redesigned với Figma principles
 * Card-based layout thay vì table để responsive tốt hơn
 */
const QuanLyTinDang = () => {
  const navigate = useNavigate();
  const [tinDangs, setTinDangs] = useState([]);
  const [duAns, setDuAns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    trangThai: '',
    duAn: '',
    keyword: ''
  });
  const [showDraftsOnly, setShowDraftsOnly] = useState(false);

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    danhSachPhong: [],
    loaiHienThi: 'tatCa',
    tinDang: {},
    loading: false
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
          alert('Đã gửi tin đăng để duyệt thành công!');
          layDanhSachTinDang();
        } else {
          alert('Lỗi: ' + response.message);
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi gửi duyệt');
      }
    }
  };

  const getTrangThaiInfo = (trangThai) => {
    const map = {
      'Nhap': { label: 'Nháp', badge: 'gray', color: '#6b7280' },
      'ChoDuyet': { label: 'Chờ duyệt', badge: 'warning', color: '#f59e0b' },
      'DaDuyet': { label: 'Đã duyệt', badge: 'info', color: '#3b82f6' },
      'DaDang': { label: 'Đang đăng', badge: 'success', color: '#10b981' },
      'TuChoi': { label: 'Từ chối', badge: 'danger', color: '#ef4444' }
    };
    return map[trangThai] || { label: trangThai, badge: 'gray', color: '#6b7280' };
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
      if (urls.length === 0) return null;
      
      const firstUrl = urls[0];
      // Nếu URL đã có http thì dùng luôn, nếu không thì thêm backend URL
      return firstUrl.startsWith('http') ? firstUrl : `http://localhost:5000${firstUrl}`;
    } catch {
      return null;
    }
  };

  /**
   * Lấy thông tin phòng thông minh
   * @param {Object} tinDang - Tin đăng object
   * @returns {Object} - Thông tin phòng để hiển thị
   */
  const getThongTinPhong = (tinDang) => {
    const tongSo = tinDang.TongSoPhong || 0;
    const soTrong = tinDang.SoPhongTrong || 0;
    const soDaThue = tongSo - soTrong;
    
    // Nếu chỉ có 1 phòng hoặc không có phòng riêng lẻ
    if (tongSo === 0) {
      return {
        loai: 'single',
        moTa: 'Phòng đơn',
        gia: tinDang.Gia,
        dienTich: tinDang.DienTich,
        trangThai: 'Chưa có phòng'
      };
    } else if (tongSo === 1) {
      return {
        loai: 'single',
        moTa: 'Phòng đơn',
        soPhong: 1,
        trangThai: soTrong > 0 ? 'Còn trống' : 'Đã thuê',
        gia: tinDang.Gia,
        dienTich: tinDang.DienTich
      };
    } else {
      // Nhiều phòng
      return {
        loai: 'multiple',
        moTa: `${tongSo} phòng`,
        tongSo,
        soTrong,
        soDaThue,
        tyLeTrong: ((soTrong / tongSo) * 100).toFixed(0)
      };
    }
  };

  /**
   * Mở modal preview danh sách phòng
   * @param {Object} tinDang - Tin đăng
   * @param {string} loaiHienThi - 'conTrong' | 'daThue' | 'tatCa'
   */
  const moModalPreviewPhong = async (tinDang, loaiHienThi) => {
    setModalState({
      ...modalState,
      isOpen: true,
      tinDang,
      loaiHienThi,
      loading: true
    });

    try {
      // Gọi API lấy danh sách phòng chi tiết
      const response = await TinDangService.layDanhSachPhong(tinDang.TinDangID);
      if (response.success) {
        setModalState(prev => ({
          ...prev,
          danhSachPhong: response.data || [],
          loading: false
        }));
      }
    } catch (error) {
      console.error('Lỗi tải danh sách phòng:', error);
      setModalState(prev => ({
        ...prev,
        danhSachPhong: [],
        loading: false
      }));
    }
  };

  /**
   * Đóng modal preview
   */
  const dongModalPreview = () => {
    setModalState({
      isOpen: false,
      danhSachPhong: [],
      loaiHienThi: 'tatCa',
      tinDang: {},
      loading: false
    });
  };

  const tinDangsFiltered = tinDangs.filter(tinDang => {
    // Logic nút Tin nháp: khi bật thì CHỈ hiện nháp, khi tắt thì ẨN nháp
    if (showDraftsOnly) {
      // Khi bật nút → chỉ hiện tin nháp
      if (tinDang.TrangThai !== 'Nhap') {
        return false;
      }
    } else {
      // Khi tắt nút → ẩn tin nháp
      if (tinDang.TrangThai === 'Nhap') {
        return false;
      }
    }
    
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
        <div className="qtd-loading">
          <div className="qtd-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      <div className="qtd-container">
        {/* Header */}
        <div className="qtd-header">
          <div className="qtd-header-content">
            <h1 className="qtd-title">Quản lý tin đăng</h1>
            <p className="qtd-subtitle">Quản lý và theo dõi tất cả tin đăng của bạn</p>
          </div>
          <Link to="/chu-du-an/tao-tin-dang" className="qtd-btn qtd-btn-primary">
            <HiOutlinePlus className="qtd-btn-icon" />
            <span>Tạo tin đăng mới</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="qtd-filters">
          <div className="qtd-filter-group">
            <label className="qtd-label">Tìm kiếm</label>
            <input
              type="text"
              className="qtd-input"
              placeholder="Tìm theo tiêu đề..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </div>
          <div className="qtd-filter-group">
            <label className="qtd-label">Dự án</label>
            <select
              className="qtd-select"
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
          <div className="qtd-filter-group">
            <label className="qtd-label">Trạng thái</label>
            <select
              className="qtd-select"
              value={filters.trangThai}
              onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ChoDuyet">Chờ duyệt</option>
              <option value="DaDuyet">Đã duyệt</option>
              <option value="DaDang">Đang đăng</option>
              <option value="TuChoi">Từ chối</option>
            </select>
          </div>
          <div className="qtd-filter-group">
            <label className="qtd-label">&nbsp;</label>
            <button
              className={`qtd-btn-draft-toggle ${showDraftsOnly ? 'active' : ''}`}
              onClick={() => setShowDraftsOnly(!showDraftsOnly)}
              title={showDraftsOnly ? 'Hiện tất cả tin' : 'Chỉ hiện tin nháp'}
            >
              <HiOutlineDocumentText />
              <span>{showDraftsOnly ? 'Tất cả tin' : 'Tin nháp'}</span>
            </button>
          </div>
          <button className="qtd-btn qtd-btn-secondary" onClick={layDanhSachTinDang}>
            <HiOutlineMagnifyingGlass className="qtd-btn-icon" />
            <span>Tìm kiếm</span>
          </button>
        </div>

        {/* Stats */}
        <div className="qtd-stats">
          <div className="qtd-stat-card">
            <div className="qtd-stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              <HiOutlineDocumentText />
            </div>
            <div className="qtd-stat-content">
              <div className="qtd-stat-label">Tổng tin đăng</div>
              <div className="qtd-stat-value">{tinDangsFiltered.length}</div>
            </div>
          </div>
          <div className="qtd-stat-card">
            <div className="qtd-stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
              <HiOutlineClock />
            </div>
            <div className="qtd-stat-content">
              <div className="qtd-stat-label">Chờ duyệt</div>
              <div className="qtd-stat-value">{tinDangsFiltered.filter(t => t.TrangThai === 'ChoDuyet').length}</div>
            </div>
          </div>
          <div className="qtd-stat-card">
            <div className="qtd-stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
              <HiOutlineCheckCircle />
            </div>
            <div className="qtd-stat-content">
              <div className="qtd-stat-label">Đang đăng</div>
              <div className="qtd-stat-value">{tinDangsFiltered.filter(t => t.TrangThai === 'DaDang').length}</div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {tinDangsFiltered.length > 0 ? (
          <div className="qtd-grid">
            {tinDangsFiltered.map((tinDang) => {
              const statusInfo = getTrangThaiInfo(tinDang.TrangThai);
              const firstImage = getFirstImage(tinDang.URL);
              const tienIch = getTienIch(tinDang.TienIch);
              const thongTinPhong = getThongTinPhong(tinDang);

              return (
                <div key={tinDang.TinDangID} className="qtd-card">
                  {/* Image */}
                  <div className="qtd-card-image">
                    {firstImage ? (
                      <img src={firstImage} alt={tinDang.TieuDe} />
                    ) : (
                      <div className="qtd-card-image-placeholder">🏠</div>
                    )}
                    <div className="qtd-card-badge" style={{ background: statusInfo.color }}>
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="qtd-card-content">
                    {/* Title */}
                    <h3 className="qtd-card-title">{tinDang.TieuDe}</h3>

                    {/* Description */}
                    {tinDang.MoTa && (
                      <p className="qtd-card-desc">{tinDang.MoTa.substring(0, 80)}...</p>
                    )}

                    {/* Meta Info */}
                    <div className="qtd-card-meta">
                      <div className="qtd-meta-item">
                        <HiOutlineHome className="qtd-meta-icon" />
                        <span className="qtd-meta-text">{tinDang.TenDuAn}</span>
                      </div>
                      
                      {/* Hiển thị thông minh theo loại phòng */}
                      {thongTinPhong.loai === 'single' ? (
                        <>
                          {tinDang.Gia && (
                            <div className="qtd-meta-item">
                              <HiOutlineCurrencyDollar className="qtd-meta-icon" />
                              <span className="qtd-meta-text qtd-price">{formatCurrency(tinDang.Gia)}</span>
                            </div>
                          )}
                          {tinDang.DienTich && (
                            <div className="qtd-meta-item">
                              <HiOutlineSquare3Stack3D className="qtd-meta-icon" />
                              <span className="qtd-meta-text">{tinDang.DienTich} m²</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="qtd-meta-item">
                          <HiOutlineMapPin className="qtd-meta-icon" />
                          <span className="qtd-meta-text">{thongTinPhong.moTa}</span>
                        </div>
                      )}
                    </div>

                    {/* Tiện ích */}
                    {tienIch.length > 0 && (
                      <div className="qtd-card-amenities">
                        {tienIch.slice(0, 4).map((item, idx) => (
                          <span key={idx} className="qtd-amenity-badge">{item}</span>
                        ))}
                        {tienIch.length > 4 && (
                          <span className="qtd-amenity-more">+{tienIch.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* Chi phí phụ */}
                    {(tinDang.GiaDien || tinDang.GiaNuoc || tinDang.GiaDichVu) && (
                      <div className="qtd-card-fees">
                        <div className="qtd-fees-title">Chi phí phụ:</div>
                        {tinDang.GiaDien && (
                          <div className="qtd-fee-item">
                            <HiOutlineBolt className="qtd-fee-icon" />
                            Điện: {formatCurrency(tinDang.GiaDien)}/kWh
                          </div>
                        )}
                        {tinDang.GiaNuoc && (
                          <div className="qtd-fee-item">
                            <HiBeaker className="qtd-fee-icon" />
                            Nước: {formatCurrency(tinDang.GiaNuoc)}/m³
                          </div>
                        )}
                        {tinDang.GiaDichVu && (
                          <div className="qtd-fee-item">
                            <HiOutlineCog6Tooth className="qtd-fee-icon" />
                            DV: {formatCurrency(tinDang.GiaDichVu)}/tháng
                          </div>
                        )}
                      </div>
                    )}

                    {/* Thông tin phòng thông minh */}
                    {thongTinPhong.loai === 'multiple' ? (
                      <div className="qtd-card-rooms-multiple">
                        <div className="qtd-rooms-header">
                          <span className="qtd-rooms-label">
                            <HiOutlineMapPin className="qtd-rooms-icon" />
                            {thongTinPhong.tongSo} phòng
                          </span>
                        </div>
                        <div className="qtd-rooms-stats">
                          <div 
                            className="qtd-room-stat qtd-room-stat-available qtd-room-stat-clickable"
                            onClick={() => moModalPreviewPhong(tinDang, 'conTrong')}
                            title="Xem danh sách phòng trống"
                          >
                            <HiOutlineCheckCircle className="qtd-room-stat-icon" />
                            <span className="qtd-room-stat-value">{thongTinPhong.soTrong}</span>
                            <span className="qtd-room-stat-label">Còn trống</span>
                          </div>
                          <div 
                            className="qtd-room-stat qtd-room-stat-rented qtd-room-stat-clickable"
                            onClick={() => moModalPreviewPhong(tinDang, 'daThue')}
                            title="Xem danh sách phòng đã thuê"
                          >
                            <HiOutlineHome className="qtd-room-stat-icon" />
                            <span className="qtd-room-stat-value">{thongTinPhong.soDaThue}</span>
                            <span className="qtd-room-stat-label">Đã thuê</span>
                          </div>
                          <div 
                            className="qtd-room-stat qtd-room-stat-percent qtd-room-stat-clickable"
                            onClick={() => moModalPreviewPhong(tinDang, 'tatCa')}
                            title="Xem tất cả phòng"
                          >
                            <HiOutlineChartBar className="qtd-room-stat-icon" />
                            <span className="qtd-room-stat-value">{thongTinPhong.tyLeTrong}%</span>
                            <span className="qtd-room-stat-label">Tỷ lệ trống</span>
                          </div>
                        </div>
                        <div className="qtd-rooms-progress">
                          <div 
                            className="qtd-rooms-progress-bar" 
                            style={{ width: `${thongTinPhong.tyLeTrong}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="qtd-card-rooms-single">
                        <span className="qtd-rooms-label">
                          <HiOutlineMapPin className="qtd-rooms-icon" />
                          {thongTinPhong.moTa}
                        </span>
                        {thongTinPhong.soPhong && (
                          <span className={`qtd-rooms-status ${thongTinPhong.trangThai === 'Còn trống' ? 'available' : 'rented'}`}>
                            {thongTinPhong.trangThai}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="qtd-card-footer">
                      <div className="qtd-card-date">
                        <HiOutlineClock className="qtd-date-icon" />
                        {new Date(tinDang.TaoLuc).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="qtd-card-actions">
                        <button
                          onClick={() => navigate(`/chu-du-an/tin-dang/${tinDang.TinDangID}`)}
                          className="qtd-btn-icon"
                          title="Xem chi tiết"
                        >
                          <HiOutlineEye />
                        </button>
                        <button
                          onClick={() => navigate(`/chu-du-an/chinh-sua-tin-dang/${tinDang.TinDangID}`)}
                          className="qtd-btn-icon"
                          title="Chỉnh sửa"
                        >
                          <HiOutlinePencil />
                        </button>
                        {tinDang.TrangThai === 'Nhap' && (
                          <button
                            onClick={() => xacNhanGuiDuyet(tinDang)}
                            className="qtd-btn-icon qtd-btn-icon-primary"
                            title="Gửi duyệt"
                          >
                            <HiOutlinePaperAirplane />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="qtd-empty">
            <div className="qtd-empty-icon">
              <HiOutlineDocumentText />
            </div>
            <h3 className="qtd-empty-title">Chưa có tin đăng nào</h3>
            <p className="qtd-empty-desc">Bắt đầu bằng cách tạo tin đăng đầu tiên của bạn</p>
            <Link to="/chu-du-an/tao-tin-dang" className="qtd-btn qtd-btn-primary">
              <HiOutlinePlus className="qtd-btn-icon" />
              <span>Tạo tin đăng ngay</span>
            </Link>
          </div>
        )}
      </div>
      
      {/* Modal Preview Phòng */}
      <ModalPreviewPhong
        isOpen={modalState.isOpen}
        onClose={dongModalPreview}
        danhSachPhong={modalState.danhSachPhong}
        loaiHienThi={modalState.loaiHienThi}
        tinDang={modalState.tinDang}
      />
    </ChuDuAnLayout>
  );
};

export default QuanLyTinDang;
