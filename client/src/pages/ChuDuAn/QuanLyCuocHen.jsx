import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import './QuanLyCuocHen.css';

// React Icons
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineEye,
  HiOutlineFunnel,
  HiOutlineArrowPath,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentArrowDown,
  HiOutlineBell,
  HiOutlineChartBar
} from 'react-icons/hi2';

// Components
import ModalChiTietCuocHen from '../../components/ChuDuAn/ModalChiTietCuocHen';
import ModalPheDuyetCuocHen from '../../components/ChuDuAn/ModalPheDuyetCuocHen';
import ModalTuChoiCuocHen from '../../components/ChuDuAn/ModalTuChoiCuocHen';

// Service
import { CuocHenService } from '../../services/ChuDuAnService';

/**
 * UC-PROJ-02: Quản lý cuộc hẹn cho Chủ dự án
 * Trang quản lý danh sách cuộc hẹn với các tính năng:
 * - Dashboard metrics tổng quan
 * - Danh sách cuộc hẹn với filters thông minh
 * - Phê duyệt/từ chối cuộc hẹn
 * - Xem chi tiết và thông tin liên hệ
 * - Bulk actions
 * - Export báo cáo
 */
function QuanLyCuocHen() {
  // Hooks
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [cuocHenList, setCuocHenList] = useState([]);
  const [metrics, setMetrics] = useState({
    choDuyet: 0,
    daXacNhan: 0,
    sapDienRa: 0,
    daHuy: 0,
    hoanThanh: 0
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    trangThai: '',
    duAnId: '',
    tuNgay: '',
    denNgay: '',
    quickFilter: 'tat-ca' // tat-ca, cho-duyet, sap-dien-ra, can-xu-ly
  });

  // Modal states
  const [modalChiTiet, setModalChiTiet] = useState({ open: false, cuocHen: null });
  const [modalPheDuyet, setModalPheDuyet] = useState({ open: false, cuocHen: null });
  const [modalTuChoi, setModalTuChoi] = useState({ open: false, cuocHen: null });

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Load data
  useEffect(() => {
    loadCuocHenData();
    loadMetrics();
  }, [filters]);

  const loadCuocHenData = async () => {
    try {
      setLoading(true);
      
      const response = await CuocHenService.layDanhSach(filters);
      setCuocHenList(response.data?.cuocHens || []);
    } catch (error) {
      console.error('Lỗi tải cuộc hẹn:', error);
      alert('Không thể tải danh sách cuộc hẹn: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await CuocHenService.layMetrics();
      setMetrics(response.data || metrics);
    } catch (error) {
      console.error('Lỗi tải metrics:', error);
    }
  };

  // Actions
  const handlePheDuyet = (cuocHen) => {
    setModalPheDuyet({ open: true, cuocHen });
  };

  const handleTuChoi = (cuocHen) => {
    setModalTuChoi({ open: true, cuocHen });
  };

  const handleXemChiTiet = (cuocHen) => {
    setModalChiTiet({ open: true, cuocHen });
  };

  /**
   * Mở cuộc trò chuyện với nhân viên bán hàng phụ trách cuộc hẹn
   */
  const handleOpenChat = async (cuocHen) => {
    try {
      // Kiểm tra có nhân viên bán hàng chưa
      if (!cuocHen.NhanVienBanHangID) {
        alert('⚠️ Cuộc hẹn này chưa có nhân viên bán hàng phụ trách.\nVui lòng gán nhân viên trước khi trò chuyện.');
        return;
      }

      // Tạo hoặc lấy cuộc hội thoại với context CuocHen
      const token = localStorage.getItem('token');
      const payload = {
        NguCanhID: cuocHen.CuocHenID,
        NguCanhLoai: 'CuocHen',
        ThanhVienIDs: [cuocHen.NhanVienBanHangID], // Chat với NVBH thay vì KhachHangID
        TieuDe: `Cuộc hẹn #${cuocHen.CuocHenID} - ${cuocHen.TenPhong || cuocHen.TenTinDang}`
      };
      
      console.log('[QuanLyCuocHen] 📤 Creating chat conversation:', payload);
      
      const response = await fetch(`${getApiBaseUrl()}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      console.log('[QuanLyCuocHen] 📥 Chat API response:', result);
      
      if (result.success) {
        navigate(`/chu-du-an/tin-nhan/${result.data.CuocHoiThoaiID}`);
      } else {
        console.error('[QuanLyCuocHen] ❌ Chat creation failed:', result);
        alert(`❌ Không thể tạo cuộc trò chuyện: ${result.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('[QuanLyCuocHen] Error opening chat:', error);
      alert('❌ Không thể mở cuộc trò chuyện. Vui lòng thử lại.');
    }
  };

  const handlePheDuyetSuccess = () => {
    setModalPheDuyet({ open: false, cuocHen: null });
    loadCuocHenData();
    loadMetrics();
  };

  const handleTuChoiSuccess = () => {
    setModalTuChoi({ open: false, cuocHen: null });
    loadCuocHenData();
    loadMetrics();
  };

  // Bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(cuocHenList.map(ch => ch.CuocHenID));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 cuộc hẹn');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn ${action} ${selectedIds.length} cuộc hẹn?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chu-du-an/cuoc-hen/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, cuocHenIds: selectedIds })
      });

      if (!response.ok) throw new Error('Không thể thực hiện hành động');

      alert(`Đã ${action} thành công ${selectedIds.length} cuộc hẹn`);
      setSelectedIds([]);
      loadCuocHenData();
      loadMetrics();
    } catch (error) {
      console.error('Lỗi bulk action:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  // Quick filters
  const applyQuickFilter = (filter) => {
    setFilters({ ...filters, quickFilter: filter });
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case 'cho-duyet':
        setFilters({ ...filters, trangThai: 'ChoXacNhan', quickFilter: filter });
        break;
      case 'sap-dien-ra':
        setFilters({ 
          ...filters, 
          trangThai: 'DaXacNhan',
          tuNgay: now.toISOString().split('T')[0],
          denNgay: tomorrow.toISOString().split('T')[0],
          quickFilter: filter 
        });
        break;
      case 'can-xu-ly':
        // Chờ duyệt + sắp diễn ra trong 2 giờ
        setFilters({ ...filters, trangThai: '', quickFilter: filter });
        break;
      default:
        setFilters({ search: '', trangThai: '', duAnId: '', tuNgay: '', denNgay: '', quickFilter: 'tat-ca' });
    }
  };

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTrangThai = (trangThai, pheDuyet) => {
    if (pheDuyet === 'ChoPheDuyet') {
      return { text: 'Chờ phê duyệt', class: 'status-cho-duyet' };
    }
    
    const statusMap = {
      'DaYeuCau': { text: 'Đã yêu cầu', class: 'status-da-yeu-cau' },
      'ChoXacNhan': { text: 'Chờ xác nhận', class: 'status-cho-xac-nhan' },
      'DaXacNhan': { text: 'Đã xác nhận', class: 'status-da-xac-nhan' },
      'DaDoiLich': { text: 'Đã đổi lịch', class: 'status-da-doi-lich' },
      'HuyBoiKhach': { text: 'Khách hủy', class: 'status-huy' },
      'HuyBoiHeThong': { text: 'Hệ thống hủy', class: 'status-huy' },
      'KhachKhongDen': { text: 'Khách không đến', class: 'status-khach-khong-den' },
      'HoanThanh': { text: 'Hoàn thành', class: 'status-hoan-thanh' }
    };

    return statusMap[trangThai] || { text: trangThai, class: '' };
  };

  const getTimeUrgency = (thoiGianHen) => {
    if (!thoiGianHen) return '';
    
    const now = new Date();
    const henTime = new Date(thoiGianHen);
    const diffHours = (henTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) return 'past';
    if (diffHours < 2) return 'urgent'; // Đỏ - còn dưới 2 giờ
    if (diffHours < 24) return 'soon'; // Cam - trong ngày
    return 'normal'; // Xanh
  };

  const formatTimeRemaining = (thoiGianHen) => {
    if (!thoiGianHen) return '';
    
    const now = new Date();
    const henTime = new Date(thoiGianHen);
    const diffMs = henTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) return 'Đã qua';
    if (diffHours < 1) return `Còn ${diffMinutes} phút`;
    if (diffHours < 24) return `Còn ${diffHours} giờ`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Còn ${diffDays} ngày`;
  };

  return (
    <ChuDuAnLayout>
      {/* Header */}
      <div className="cuoc-hen-header">
        <div>
          <h1 className="cuoc-hen-title">
            <HiOutlineCalendar className="title-icon" />
            Quản lý Cuộc hẹn
          </h1>
          <p className="cuoc-hen-subtitle">
            Phê duyệt và theo dõi các cuộc hẹn xem phòng
          </p>
        </div>

        <div className="cuoc-hen-header-actions">
          <button className="cda-btn cda-btn-secondary" onClick={() => loadCuocHenData()}>
            <HiOutlineArrowPath />
            Làm mới
          </button>
          <button className="cda-btn cda-btn-secondary">
            <HiOutlineDocumentArrowDown />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="cuoc-hen-metrics">
        <div className="metric-card emerald" onClick={() => applyQuickFilter('cho-duyet')}>
          <div className="metric-icon">
            <HiOutlineBell />
          </div>
          <div className="metric-content">
            <div className="metric-value">{metrics.choDuyet}</div>
            <div className="metric-label">Chờ phê duyệt</div>
            {metrics.choDuyet > 0 && (
              <div className="metric-badge urgent">Cần xử lý</div>
            )}
          </div>
        </div>

        <div className="metric-card green">
          <div className="metric-icon">
            <HiOutlineCheck />
          </div>
          <div className="metric-content">
            <div className="metric-value">{metrics.daXacNhan}</div>
            <div className="metric-label">Đã xác nhận</div>
            <div className="metric-change">
              <span className="positive">+{Math.round(metrics.daXacNhan / (metrics.daXacNhan + metrics.daHuy + 1) * 100)}%</span> tỷ lệ
            </div>
          </div>
        </div>

        <div className="metric-card orange" onClick={() => applyQuickFilter('sap-dien-ra')}>
          <div className="metric-icon">
            <HiOutlineClock />
          </div>
          <div className="metric-content">
            <div className="metric-value">{metrics.sapDienRa}</div>
            <div className="metric-label">Sắp diễn ra</div>
            <div className="metric-change">Trong 24 giờ tới</div>
          </div>
        </div>

        <div className="metric-card gray">
          <div className="metric-icon">
            <HiOutlineXMark />
          </div>
          <div className="metric-content">
            <div className="metric-value">{metrics.daHuy}</div>
            <div className="metric-label">Đã hủy</div>
          </div>
        </div>

        <div className="metric-card blue">
          <div className="metric-icon">
            <HiOutlineChartBar />
          </div>
          <div className="metric-content">
            <div className="metric-value">{metrics.hoanThanh}</div>
            <div className="metric-label">Hoàn thành</div>
            <div className="metric-change">
              Tháng này
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="quick-filters">
        <button 
          className={`quick-filter-btn ${filters.quickFilter === 'tat-ca' ? 'active' : ''}`}
          onClick={() => applyQuickFilter('tat-ca')}
        >
          Tất cả
        </button>
        <button 
          className={`quick-filter-btn ${filters.quickFilter === 'cho-duyet' ? 'active' : ''}`}
          onClick={() => applyQuickFilter('cho-duyet')}
        >
          Chờ duyệt ({metrics.choDuyet})
        </button>
        <button 
          className={`quick-filter-btn ${filters.quickFilter === 'sap-dien-ra' ? 'active' : ''}`}
          onClick={() => applyQuickFilter('sap-dien-ra')}
        >
          Sắp diễn ra ({metrics.sapDienRa})
        </button>
        <button 
          className={`quick-filter-btn ${filters.quickFilter === 'can-xu-ly' ? 'active' : ''}`}
          onClick={() => applyQuickFilter('can-xu-ly')}
        >
          Cần xử lý ({metrics.choDuyet + metrics.sapDienRa})
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="cda-card filters-card">
        <div className="filters-row">
          <div className="filter-group">
            <HiOutlineFunnel className="filter-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách hàng, phòng..."
              className="cda-input"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <select 
            className="cda-select"
            value={filters.trangThai}
            onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ChoXacNhan">Chờ xác nhận</option>
            <option value="DaXacNhan">Đã xác nhận</option>
            <option value="HoanThanh">Hoàn thành</option>
            <option value="HuyBoiKhach">Đã hủy</option>
          </select>

          <input
            type="date"
            className="cda-input"
            placeholder="Từ ngày"
            value={filters.tuNgay}
            onChange={(e) => setFilters({ ...filters, tuNgay: e.target.value })}
          />

          <input
            type="date"
            className="cda-input"
            placeholder="Đến ngày"
            value={filters.denNgay}
            onChange={(e) => setFilters({ ...filters, denNgay: e.target.value })}
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <input 
              type="checkbox" 
              checked={selectedIds.length === cuocHenList.length}
              onChange={handleSelectAll}
            />
            <span>Đã chọn {selectedIds.length} cuộc hẹn</span>
          </div>
          <div className="bulk-buttons">
            <button 
              className="cda-btn cda-btn-success cda-btn-sm"
              onClick={() => handleBulkAction('phe-duyet')}
            >
              <HiOutlineCheck /> Phê duyệt
            </button>
            <button 
              className="cda-btn cda-btn-secondary cda-btn-sm"
              onClick={() => handleBulkAction('gui-huong-dan')}
            >
              Gửi hướng dẫn
            </button>
            <button 
              className="cda-btn cda-btn-secondary cda-btn-sm"
              onClick={() => setSelectedIds([])}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Cuộc hẹn List */}
      <div className="cda-card">
        {loading ? (
          <div className="cda-loading">
            <div className="cda-spinner"></div>
            <p className="cda-loading-text">Đang tải danh sách cuộc hẹn...</p>
          </div>
        ) : cuocHenList.length === 0 ? (
          <div className="cda-empty-state">
            <div className="cda-empty-icon">📅</div>
            <h3 className="cda-empty-title">Chưa có cuộc hẹn nào</h3>
            <p className="cda-empty-description">
              Các cuộc hẹn xem phòng sẽ hiển thị tại đây
            </p>
          </div>
        ) : (
          <div className="cuoc-hen-table-container">
            <table className="cuoc-hen-table">
              <colgroup>
                <col style={{ width: '40px' }} />
                <col style={{ width: '60px' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '180px' }} />
                <col style={{ width: '180px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '200px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox"
                      checked={selectedIds.length === cuocHenList.length && cuocHenList.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Ưu tiên</th>
                  <th>Thời gian hẹn</th>
                  <th>Khách hàng</th>
                  <th>Phòng / Dự án</th>
                  <th>NV phụ trách</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {cuocHenList.map((cuocHen) => {
                  const urgency = getTimeUrgency(cuocHen.ThoiGianHen);
                  const status = formatTrangThai(cuocHen.TrangThai, cuocHen.PheDuyetChuDuAn);

                  return (
                    <tr key={cuocHen.CuocHenID} className={`urgency-${urgency}`}>
                      <td>
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(cuocHen.CuocHenID)}
                          onChange={() => handleSelectOne(cuocHen.CuocHenID)}
                        />
                      </td>
                      <td>
                        <div className={`urgency-badge ${urgency}`}>
                          {urgency === 'urgent' && '🔴'}
                          {urgency === 'soon' && '🟡'}
                          {urgency === 'normal' && '🟢'}
                          {urgency === 'past' && '⚫'}
                        </div>
                      </td>
                      <td>
                        <div className="time-cell">
                          <div className="time-main">
                            <HiOutlineClock className="cell-icon" />
                            {formatDate(cuocHen.ThoiGianHen)}
                          </div>
                          <div className={`time-remaining ${urgency}`}>
                            {formatTimeRemaining(cuocHen.ThoiGianHen)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-name">
                            <HiOutlineUser className="cell-icon" />
                            {cuocHen.TenKhachHang || 'N/A'}
                          </div>
                          <div className="customer-phone">
                            <HiOutlinePhone className="cell-icon" />
                            {cuocHen.SoDienThoaiKhach || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="room-cell">
                          <div className="room-name">
                            <HiOutlineHome className="cell-icon" />
                            {cuocHen.TenPhong || 'N/A'}
                          </div>
                          <div className="project-name">
                            {cuocHen.TenDuAn || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="staff-cell">
                          {cuocHen.TenNhanVien ? (
                            <>
                              <div>{cuocHen.TenNhanVien}</div>
                              <div className="staff-phone">{cuocHen.SoDienThoaiNV}</div>
                            </>
                          ) : (
                            <span className="text-muted">Chưa gán</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`cda-badge ${status.class}`}>
                          {status.text}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {cuocHen.PheDuyetChuDuAn === 'ChoPheDuyet' && (
                            <>
                              <button
                                className="action-btn success"
                                onClick={() => handlePheDuyet(cuocHen)}
                                title="Phê duyệt"
                              >
                                <HiOutlineCheck />
                              </button>
                              <button
                                className="action-btn danger"
                                onClick={() => handleTuChoi(cuocHen)}
                                title="Từ chối"
                              >
                                <HiOutlineXMark />
                              </button>
                            </>
                          )}
                          <button
                            className="action-btn info"
                            onClick={() => handleXemChiTiet(cuocHen)}
                            title="Xem chi tiết"
                          >
                            <HiOutlineEye />
                          </button>
                          <button
                            className="action-btn secondary"
                            title="Trò chuyện"
                            onClick={() => handleOpenChat(cuocHen)}
                          >
                            <HiOutlineChatBubbleLeftRight />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalChiTiet.open && (
        <ModalChiTietCuocHen
          cuocHen={modalChiTiet.cuocHen}
          onClose={() => setModalChiTiet({ open: false, cuocHen: null })}
          onPheDuyet={(ch) => {
            setModalChiTiet({ open: false, cuocHen: null });
            handlePheDuyet(ch);
          }}
          onTuChoi={(ch) => {
            setModalChiTiet({ open: false, cuocHen: null });
            handleTuChoi(ch);
          }}
        />
      )}

      {modalPheDuyet.open && (
        <ModalPheDuyetCuocHen
          cuocHen={modalPheDuyet.cuocHen}
          onClose={() => setModalPheDuyet({ open: false, cuocHen: null })}
          onSuccess={handlePheDuyetSuccess}
        />
      )}

      {modalTuChoi.open && (
        <ModalTuChoiCuocHen
          cuocHen={modalTuChoi.cuocHen}
          onClose={() => setModalTuChoi({ open: false, cuocHen: null })}
          onSuccess={handleTuChoiSuccess}
        />
      )}
    </ChuDuAnLayout>
  );
}

export default QuanLyCuocHen;
