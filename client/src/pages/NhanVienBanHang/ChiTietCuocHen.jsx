/**
 * UC-SALE-03: Chi tiết Cuộc hẹn
 * View detail với timeline, map, actions, confirmations
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineHome,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';
import {
  xemChiTietCuocHen,
  xacNhanCuocHen,
  doiLichCuocHen,
  huyCuocHen
} from '../../services/nhanVienBanHangApi';
import { getApiBaseUrl } from '../../config/api';
import { formatDate, formatCurrency, formatPhone } from '../../utils/nvbhHelpers';
import StatusBadge from '../../components/NhanVienBanHang/StatusBadge';
import TimelineCuocHen from '../../components/NhanVienBanHang/TimelineCuocHen';
import ActivityTimeline from '../../components/NhanVienBanHang/ActivityTimeline';
import LoadingSkeleton from '../../components/NhanVienBanHang/LoadingSkeleton';
import ErrorBanner from '../../components/NhanVienBanHang/ErrorBanner';
import ModalBaoCaoKetQua from '../../components/NhanVienBanHang/ModalBaoCaoKetQua';
import './ChiTietCuocHen.css';

const ChiTietCuocHen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load appointment details
  useEffect(() => {
    loadAppointment();
    
    // Check for action param from navigation
    const action = searchParams.get('action');
    if (action === 'reschedule') {
      setShowRescheduleModal(true);
    }
  }, [id, searchParams]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await xemChiTietCuocHen(id);
      
      if (response.success) {
        setAppointment(response.data);
      }
    } catch (err) {
      console.error('[ChiTietCuocHen] Load error:', err);
      setError(err.message || 'Không thể tải chi tiết cuộc hẹn');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleConfirm = async () => {
    if (!window.confirm('Xác nhận cuộc hẹn này?')) return;
    
    try {
      setActionLoading(true);
      const response = await xacNhanCuocHen(id);
      
      if (response.success) {
        alert('Đã xác nhận cuộc hẹn thành công');
        loadAppointment();
      }
    } catch (err) {
      console.error('[ChiTietCuocHen] Confirm error:', err);
      alert('Không thể xác nhận: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (newDate) => {
    try {
      setActionLoading(true);
      const response = await doiLichCuocHen(id, {
        thoiGianHenMoi: newDate,
        lyDo: 'Theo yêu cầu'
      });
      
      if (response.success) {
        alert('Đã đổi lịch thành công');
        setShowRescheduleModal(false);
        loadAppointment();
      }
    } catch (err) {
      console.error('[ChiTietCuocHen] Reschedule error:', err);
      alert('Không thể đổi lịch: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (reason) => {
    try {
      setActionLoading(true);
      const response = await huyCuocHen(id, { lyDoHuy: reason });
      
      if (response.success) {
        alert('Đã hủy cuộc hẹn');
        setShowCancelModal(false);
        loadAppointment();
      }
    } catch (err) {
      console.error('[ChiTietCuocHen] Cancel error:', err);
      alert('Không thể hủy: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportResult = () => {
    setShowReportModal(true);
  };

  const handleBack = () => {
    navigate('/nhan-vien-ban-hang/cuoc-hen');
  };

  const handleChatWithCustomer = async () => {
    if (!appointment.KhachHangID) {
      alert('Không tìm thấy thông tin khách hàng');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        NguCanhID: appointment.CuocHenID,
        NguCanhLoai: 'CuocHen',
        ThanhVienIDs: [appointment.KhachHangID],
        TieuDe: `Cuộc hẹn #${appointment.CuocHenID} - ${appointment.TenKhachHang || 'Khách hàng'}`
      };

      const response = await fetch(`${getApiBaseUrl()}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        navigate(`/nhan-vien-ban-hang/tin-nhan/${result.data.CuocHoiThoaiID}`);
      } else {
        alert(`❌ Không thể tạo cuộc trò chuyện: ${result.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('[ChiTietCuocHen] Error opening chat with customer:', error);
      alert('❌ Không thể mở cuộc trò chuyện. Vui lòng thử lại.');
    }
  };

  const handleChatWithOwner = async () => {
    if (!appointment.ChuDuAnID) {
      alert('Không tìm thấy thông tin chủ dự án');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        NguCanhID: appointment.CuocHenID,
        NguCanhLoai: 'CuocHen',
        ThanhVienIDs: [appointment.ChuDuAnID],
        TieuDe: `Cuộc hẹn #${appointment.CuocHenID} - ${appointment.TenDuAn || 'Dự án'}`
      };

      const response = await fetch(`${getApiBaseUrl()}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        navigate(`/nhan-vien-ban-hang/tin-nhan/${result.data.CuocHoiThoaiID}`);
      } else {
        alert(`❌ Không thể tạo cuộc trò chuyện: ${result.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('[ChiTietCuocHen] Error opening chat with owner:', error);
      alert('❌ Không thể mở cuộc trò chuyện. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="nvbh-chi-tiet-cuoc-hen">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="nvbh-chi-tiet-cuoc-hen">
        <ErrorBanner
          message={error}
          onRetry={loadAppointment}
          onDismiss={() => navigate('/nhan-vien-ban-hang/cuoc-hen')}
        />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="nvbh-chi-tiet-cuoc-hen">
        <ErrorBanner
          message="Không tìm thấy cuộc hẹn"
          onDismiss={() => navigate('/nhan-vien-ban-hang/cuoc-hen')}
        />
      </div>
    );
  }

  const canConfirm = appointment.TrangThai === 'ChoXacNhan';
  const canReschedule = ['DaXacNhan', 'DaYeuCau'].includes(appointment.TrangThai);
  const canCancel = ['ChoXacNhan', 'DaXacNhan', 'DaYeuCau'].includes(appointment.TrangThai);
  const canReport = appointment.TrangThai === 'DaXacNhan';

  // Parse coordinates for map
  const hasCoordinates = appointment.ToaDo && appointment.ToaDo.lat && appointment.ToaDo.lng;

  return (
    <div className="nvbh-chi-tiet-cuoc-hen">
      {/* Header */}
      <div className="nvbh-chi-tiet-cuoc-hen__header">
        <button
          className="nvbh-chi-tiet-cuoc-hen__back"
          onClick={handleBack}
          aria-label="Quay lại"
        >
          <HiOutlineArrowLeft />
          Quay lại
        </button>
        <h1 className="nvbh-chi-tiet-cuoc-hen__title">Chi tiết Cuộc hẹn</h1>
        <StatusBadge status={appointment.TrangThai} size="md" showDot />
      </div>

      {/* Content Grid */}
      <div className="nvbh-chi-tiet-cuoc-hen__grid">
        {/* Appointment Info Card */}
        <div className="nvbh-card">
          <div className="nvbh-card__header">
            <HiOutlineCalendarDays />
            <h2>Thông tin Cuộc hẹn</h2>
          </div>
          <div className="nvbh-card__body">
            <div className="nvbh-info-row">
              <span className="nvbh-info-row__label">
                <HiOutlineClock />
                Thời gian hẹn:
              </span>
              <span className="nvbh-info-row__value">
                {formatDate(appointment.ThoiGianHen, 'datetime')}
              </span>
            </div>
            <div className="nvbh-info-row">
              <span className="nvbh-info-row__label">Số lần đổi lịch:</span>
              <span className="nvbh-info-row__value">{appointment.SoLanDoiLich || 0}</span>
            </div>
            {appointment.PhuongThucVao && (
              <div className="nvbh-info-row">
                <span className="nvbh-info-row__label">Phương thức vào:</span>
                <span className="nvbh-info-row__value">{appointment.PhuongThucVao}</span>
              </div>
            )}

            {/* Activity Timeline */}
            {appointment.ActivityLog && appointment.ActivityLog.length > 0 && (
              <div className="nvbh-info-row nvbh-info-row--full">
                <span className="nvbh-info-row__label">Lịch sử hoạt động:</span>
                <ActivityTimeline activities={appointment.ActivityLog} />
              </div>
            )}

            {appointment.BaoCaoKetQua && (
              <div className="nvbh-info-row nvbh-info-row--full">
                <span className="nvbh-info-row__label">Báo cáo kết quả:</span>
                <div className="nvbh-bao-cao-ket-qua">
                  <div className="nvbh-bao-cao-ket-qua__header">
                    <h4 className="nvbh-bao-cao-ket-qua__title">
                      📋 Kết quả cuộc hẹn
                    </h4>
                    {appointment.BaoCaoKetQua.thoiGianBaoCao && (
                      <span className="nvbh-bao-cao-ket-qua__time">
                        🕐 {formatDate(appointment.BaoCaoKetQua.thoiGianBaoCao, 'datetime')}
                      </span>
                    )}
                  </div>
                  
                  <div className="nvbh-bao-cao-item">
                    <span className="nvbh-bao-cao-item__label">Kết quả</span>
                    <div className="nvbh-bao-cao-item__value">
                      <span className={`nvbh-bao-cao-badge nvbh-bao-cao-badge--${
                        appointment.BaoCaoKetQua.ketQua === 'thanh_cong' ? 'success' : 'fail'
                      }`}>
                        {appointment.BaoCaoKetQua.ketQua === 'thanh_cong' ? '✓ Thành công' : '✕ Thất bại'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="nvbh-bao-cao-item">
                    <span className="nvbh-bao-cao-item__label">Khách hàng quan tâm</span>
                    <div className="nvbh-bao-cao-item__value">
                      {appointment.BaoCaoKetQua.khachQuanTam ? 'Có' : 'Không'}
                    </div>
                  </div>
                  
                  {appointment.BaoCaoKetQua.lyDoThatBai && (
                    <div className="nvbh-bao-cao-item">
                      <span className="nvbh-bao-cao-item__label">Lý do thất bại</span>
                      <div className="nvbh-bao-cao-item__value">
                        {appointment.BaoCaoKetQua.lyDoThatBai}
                      </div>
                    </div>
                  )}
                  
                  {appointment.BaoCaoKetQua.keHoachFollowUp && (
                    <div className="nvbh-bao-cao-item">
                      <span className="nvbh-bao-cao-item__label">Kế hoạch follow-up</span>
                      <div className="nvbh-bao-cao-item__value">
                        {appointment.BaoCaoKetQua.keHoachFollowUp}
                      </div>
                    </div>
                  )}
                  
                  {appointment.BaoCaoKetQua.ghiChu && (
                    <div className="nvbh-bao-cao-item">
                      <span className="nvbh-bao-cao-item__label">Ghi chú</span>
                      <div className="nvbh-bao-cao-item__value">
                        {appointment.BaoCaoKetQua.ghiChu}
                      </div>
                    </div>
                  )}
                  
                  {appointment.BaoCaoKetQua.slaWarning && (
                    <div className="nvbh-bao-cao-sla-warning">
                      ⚠️ {appointment.BaoCaoKetQua.slaWarning}
                    </div>
                  )}
                </div>
              </div>
            )}
            {appointment.GhiChuKetQua && !appointment.BaoCaoKetQua && (
              <div className="nvbh-info-row">
                <span className="nvbh-info-row__label">Ghi chú kết quả (cũ):</span>
                <p className="nvbh-info-row__note">{appointment.GhiChuKetQua}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="nvbh-card">
          <div className="nvbh-card__header">
            <HiOutlineUser />
            <h2>Thông tin Khách hàng</h2>
          </div>
          <div className="nvbh-card__body">
            <div className="nvbh-customer-info">
              <div className="nvbh-customer-info__avatar">
                {appointment.TenKhachHang?.[0] || 'K'}
              </div>
              <div className="nvbh-customer-info__details">
                <h3>{appointment.TenKhachHang || 'Khách hàng'}</h3>
                <div className="nvbh-info-row">
                  <HiOutlinePhone />
                  <a href={`tel:${appointment.SDTKhachHang}`}>
                    {formatPhone(appointment.SDTKhachHang)}
                  </a>
                </div>
                {appointment.EmailKhachHang && (
                  <div className="nvbh-info-row">
                    <HiOutlineEnvelope />
                    <a href={`mailto:${appointment.EmailKhachHang}`}>{appointment.EmailKhachHang}</a>
                  </div>
                )}
                <button
                  className="nvbh-btn nvbh-btn--secondary nvbh-btn--sm"
                  onClick={handleChatWithCustomer}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  <HiOutlineChatBubbleLeftRight />
                  Trò chuyện với khách hàng
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Owner Info Card */}
        <div className="nvbh-card">
          <div className="nvbh-card__header">
            <HiOutlineHome />
            <h2>Thông tin Chủ dự án</h2>
          </div>
          <div className="nvbh-card__body">
            <div className="nvbh-customer-info">
              <div className="nvbh-customer-info__avatar">
                {appointment.TenChuDuAn?.[0] || appointment.TenDuAn?.[0] || 'C'}
              </div>
              <div className="nvbh-customer-info__details">
                <h3>{appointment.TenChuDuAn || appointment.TenDuAn || 'Chủ dự án'}</h3>
                {appointment.SoDienThoaiChuDuAn && (
                  <div className="nvbh-info-row">
                    <HiOutlinePhone />
                    <a href={`tel:${appointment.SoDienThoaiChuDuAn}`}>
                      {formatPhone(appointment.SoDienThoaiChuDuAn)}
                    </a>
                  </div>
                )}
                {appointment.EmailChuDuAn && (
                  <div className="nvbh-info-row">
                    <HiOutlineEnvelope />
                    <a href={`mailto:${appointment.EmailChuDuAn}`}>{appointment.EmailChuDuAn}</a>
                  </div>
                )}
                <button
                  className="nvbh-btn nvbh-btn--secondary nvbh-btn--sm"
                  onClick={handleChatWithOwner}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  <HiOutlineChatBubbleLeftRight />
                  Trò chuyện với chủ dự án
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Room Details Card */}
        <div className="nvbh-card nvbh-card--full">
          <div className="nvbh-card__header">
            <HiOutlineHome />
            <h2>Thông tin Phòng</h2>
          </div>
          <div className="nvbh-card__body">
            <h3 className="nvbh-room__title">{appointment.TieuDePhong || 'Phòng trọ'}</h3>
            <p className="nvbh-room__price">{formatCurrency(appointment.GiaPhong)}/tháng</p>
            <div className="nvbh-info-row">
              <HiOutlineMapPin />
              <span>{appointment.DiaChiPhong || 'Địa chỉ phòng'}</span>
            </div>
            
            {appointment.DienTich && (
              <p className="nvbh-room__spec">Diện tích: {appointment.DienTich}m²</p>
            )}
            
            {/* Room Images */}
            {appointment.HinhAnhPhong && appointment.HinhAnhPhong.length > 0 && (
              <div className="nvbh-room__images">
                {appointment.HinhAnhPhong.slice(0, 4).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Phòng ${index + 1}`}
                    className="nvbh-room__image"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {hasCoordinates && (
          <div className="nvbh-card nvbh-card--full">
            <div className="nvbh-card__header">
              <HiOutlineMapPin />
              <h2>Vị trí</h2>
            </div>
            <div className="nvbh-card__body nvbh-card__body--no-padding">
              <div className="nvbh-map">
                <MapContainer
                  center={[appointment.ToaDo.lat, appointment.ToaDo.lng]}
                  zoom={15}
                  style={{ height: '300px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[appointment.ToaDo.lat, appointment.ToaDo.lng]}>
                    <Popup>{appointment.DiaChiPhong}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="nvbh-card nvbh-card--full">
          <div className="nvbh-card__header">
            <HiOutlineClock />
            <h2>Lịch sử</h2>
          </div>
          <div className="nvbh-card__body">
            <TimelineCuocHen events={appointment.LichSu || []} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="nvbh-chi-tiet-cuoc-hen__actions">
        {canConfirm && (
          <button
            className="nvbh-btn nvbh-btn--primary"
            onClick={handleConfirm}
            disabled={actionLoading}
          >
            Xác nhận cuộc hẹn
          </button>
        )}
        {canReschedule && (
          <button
            className="nvbh-btn nvbh-btn--secondary"
            onClick={() => setShowRescheduleModal(true)}
            disabled={actionLoading}
          >
            Đổi lịch
          </button>
        )}
        {canReport && (
          <button
            className="nvbh-btn nvbh-btn--secondary"
            onClick={handleReportResult}
            disabled={actionLoading}
          >
            Báo cáo kết quả
          </button>
        )}
        {canCancel && (
          <button
            className="nvbh-btn nvbh-btn--danger"
            onClick={() => setShowCancelModal(true)}
            disabled={actionLoading}
          >
            Hủy cuộc hẹn
          </button>
        )}
      </div>

      {/* Modals */}
      {showRescheduleModal && (
        <RescheduleModal
          onConfirm={handleReschedule}
          onClose={() => setShowRescheduleModal(false)}
          currentDate={appointment.ThoiGianHen}
        />
      )}

      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancel}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {showReportModal && (
        <ModalBaoCaoKetQua
          appointment={appointment}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={() => {
            setShowReportModal(false);
            loadAppointment();
          }}
        />
      )}
    </div>
  );
};

// Reschedule Modal
const RescheduleModal = ({ onConfirm, onClose, currentDate }) => {
  const [newDate, setNewDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDate) return;
    onConfirm(newDate);
  };

  return (
    <div className="nvbh-modal-overlay" role="dialog" aria-modal="true">
      <div className="nvbh-modal">
        <h2>Đổi lịch cuộc hẹn</h2>
        <form onSubmit={handleSubmit}>
          <div className="nvbh-form-group">
            <label htmlFor="current-date">Thời gian hiện tại:</label>
            <input
              id="current-date"
              type="text"
              value={formatDate(currentDate, 'datetime')}
              disabled
            />
          </div>
          <div className="nvbh-form-group">
            <label htmlFor="new-date">Thời gian mới:</label>
            <input
              id="new-date"
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>
          <div className="nvbh-modal__actions">
            <button type="button" className="nvbh-btn nvbh-btn--secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="nvbh-btn nvbh-btn--primary">
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Cancel Modal
const CancelModal = ({ onConfirm, onClose }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;
    onConfirm(reason);
  };

  return (
    <div className="nvbh-modal-overlay" role="dialog" aria-modal="true">
      <div className="nvbh-modal">
        <h2>Hủy cuộc hẹn</h2>
        <form onSubmit={handleSubmit}>
          <div className="nvbh-form-group">
            <label htmlFor="cancel-reason">Lý do hủy:</label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              placeholder="Nhập lý do hủy cuộc hẹn..."
            />
          </div>
          <div className="nvbh-modal__actions">
            <button type="button" className="nvbh-btn nvbh-btn--secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="nvbh-btn nvbh-btn--danger">
              Xác nhận hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChiTietCuocHen;







