import React from 'react';
import './ModalChiTietCuocHen.css';
import { 
  HiOutlineXMark, 
  HiOutlineClock, 
  HiOutlineUser, 
  HiOutlineHome,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineKey,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheck,
  HiOutlineBanknotes,
  HiOutlineCalendar
} from 'react-icons/hi2';

/**
 * Modal Chi tiết Cuộc hẹn
 * Hiển thị đầy đủ thông tin cuộc hẹn và lịch sử
 */
function ModalChiTietCuocHen({ cuocHen, onClose, onPheDuyet, onTuChoi }) {
  if (!cuocHen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return Number(value).toLocaleString('vi-VN') + ' ₫';
  };

  const formatTrangThai = (trangThai, pheDuyet) => {
    if (pheDuyet === 'ChoPheDuyet') return { text: 'Chờ phê duyệt của bạn', class: 'status-warning' };
    
    const statusMap = {
      'DaXacNhan': { text: 'Đã xác nhận', class: 'status-success' },
      'HoanThanh': { text: 'Hoàn thành', class: 'status-info' },
      'HuyBoiKhach': { text: 'Khách hủy', class: 'status-gray' },
      'KhachKhongDen': { text: 'Khách không đến', class: 'status-danger' }
    };

    return statusMap[trangThai] || { text: trangThai, class: '' };
  };

  const status = formatTrangThai(cuocHen.TrangThai, cuocHen.PheDuyetChuDuAn);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chi-tiet-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-icon info">
              <HiOutlineCalendar />
            </div>
            <div>
              <h2 className="modal-title">Chi tiết Cuộc hẹn</h2>
              <p className="modal-subtitle">Mã cuộc hẹn: #{cuocHen.CuocHenID}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <HiOutlineXMark />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body scrollable">
          {/* Status Badge */}
          <div className="status-banner">
            <span className={`status-badge ${status.class}`}>
              {status.text}
            </span>
            {cuocHen.PheDuyetChuDuAn === 'ChoPheDuyet' && (
              <span className="status-note">⏰ Cuộc hẹn đang chờ bạn phê duyệt</span>
            )}
          </div>

          {/* Thông tin Cuộc hẹn */}
          <div className="detail-section">
            <h3 className="section-title">📅 Thông tin Cuộc hẹn</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineClock />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Thời gian hẹn</div>
                  <div className="detail-value">{formatDate(cuocHen.ThoiGianHen)}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineCalendar />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Đã đổi lịch</div>
                  <div className="detail-value">{cuocHen.SoLanDoiLich || 0} / 3 lần</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineClock />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Tạo lúc</div>
                  <div className="detail-value">{formatDate(cuocHen.TaoLuc)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin Khách hàng */}
          <div className="detail-section">
            <h3 className="section-title">👤 Thông tin Khách hàng</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineUser />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Họ tên</div>
                  <div className="detail-value">{cuocHen.TenKhachHang || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlinePhone />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Số điện thoại</div>
                  <div className="detail-value">
                    <a href={`tel:${cuocHen.SoDienThoaiKhach}`} className="phone-link">
                      {cuocHen.SoDienThoaiKhach || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineEnvelope />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{cuocHen.EmailKhach || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineCheck />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Xác minh KYC</div>
                  <div className="detail-value">
                    {cuocHen.TrangThaiXacMinhKhach === 'DaXacMinh' ? (
                      <span className="kyc-badge success">✅ Đã xác minh</span>
                    ) : (
                      <span className="kyc-badge pending">⏳ Chưa xác minh</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin Phòng */}
          <div className="detail-section">
            <h3 className="section-title">🏠 Thông tin Phòng</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineHome />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Dự án</div>
                  <div className="detail-value">{cuocHen.TenDuAn || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineHome />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Phòng</div>
                  <div className="detail-value">{cuocHen.TenPhong || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineBanknotes />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Giá thuê</div>
                  <div className="detail-value">{formatCurrency(cuocHen.GiaThue)}/tháng</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <HiOutlineMapPin />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Địa chỉ</div>
                  <div className="detail-value">{cuocHen.DiaChiDuAn || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-item full-width">
                <div className="detail-icon">
                  <HiOutlineCheck />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Trạng thái phòng</div>
                  <div className="detail-value">
                    {cuocHen.TrangThaiPhong === 'Trong' ? (
                      <span className="room-badge available">✅ Còn trống</span>
                    ) : (
                      <span className="room-badge occupied">❌ Đã cho thuê</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nhân viên phụ trách */}
          {cuocHen.TenNhanVien && (
            <div className="detail-section">
              <h3 className="section-title">👨‍💼 Nhân viên Phụ trách</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <HiOutlineUser />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Họ tên</div>
                    <div className="detail-value">{cuocHen.TenNhanVien}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <HiOutlinePhone />
                  </div>
                  <div className="detail-content">
                    <div className="detail-label">Số điện thoại</div>
                    <div className="detail-value">
                      <a href={`tel:${cuocHen.SoDienThoaiNV}`} className="phone-link">
                        {cuocHen.SoDienThoaiNV}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hướng dẫn vào dự án */}
          {cuocHen.PhuongThucVao && (
            <div className="detail-section">
              <h3 className="section-title">
                <HiOutlineKey className="section-icon" />
                Hướng dẫn vào Dự án
              </h3>
              <div className="guide-box">
                <pre className="guide-content">{cuocHen.PhuongThucVao}</pre>
              </div>
            </div>
          )}

          {/* Ghi chú từ khách hàng */}
          {cuocHen.GhiChuKhach && (
            <div className="detail-section">
              <h3 className="section-title">📝 Ghi chú từ Khách hàng</h3>
              <div className="note-box">
                <p>{cuocHen.GhiChuKhach}</p>
              </div>
            </div>
          )}

          {/* Kết quả cuộc hẹn */}
          {cuocHen.GhiChuKetQua && (
            <div className="detail-section">
              <h3 className="section-title">📋 Kết quả Cuộc hẹn</h3>
              <div className="note-box">
                <p>{cuocHen.GhiChuKetQua}</p>
              </div>
            </div>
          )}

          {/* Lịch sử thay đổi */}
          <div className="detail-section">
            <h3 className="section-title">📜 Lịch sử Thay đổi</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-time">{formatDate(cuocHen.TaoLuc)}</div>
                  <div className="timeline-text">Khách hàng tạo yêu cầu cuộc hẹn</div>
                </div>
              </div>

              {cuocHen.NhanVienBanHangID && (
                <div className="timeline-item">
                  <div className="timeline-dot success"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{formatDate(cuocHen.TaoLuc)}</div>
                    <div className="timeline-text">Hệ thống gán nhân viên {cuocHen.TenNhanVien}</div>
                  </div>
                </div>
              )}

              {cuocHen.ThoiGianPheDuyet && (
                <div className="timeline-item">
                  <div className="timeline-dot success"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{formatDate(cuocHen.ThoiGianPheDuyet)}</div>
                    <div className="timeline-text">
                      {cuocHen.PheDuyetChuDuAn === 'DaPheDuyet' 
                        ? 'Chủ dự án phê duyệt cuộc hẹn'
                        : 'Chủ dự án từ chối cuộc hẹn'}
                    </div>
                  </div>
                </div>
              )}

              {cuocHen.PheDuyetChuDuAn === 'ChoPheDuyet' && (
                <div className="timeline-item">
                  <div className="timeline-dot pending pulse"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">Hiện tại</div>
                    <div className="timeline-text">Đang chờ bạn phê duyệt...</div>
                  </div>
                </div>
              )}

              {cuocHen.CapNhatLuc && cuocHen.CapNhatLuc !== cuocHen.TaoLuc && (
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-time">{formatDate(cuocHen.CapNhatLuc)}</div>
                    <div className="timeline-text">Cập nhật thông tin cuộc hẹn</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <div className="footer-actions-left">
            <button className="cda-btn cda-btn-secondary">
              <HiOutlineChatBubbleLeftRight />
              Nhắn tin
            </button>
            <button className="cda-btn cda-btn-secondary">
              <HiOutlinePhone />
              Gọi điện
            </button>
          </div>

          <div className="footer-actions-right">
            {cuocHen.PheDuyetChuDuAn === 'ChoPheDuyet' && (
              <>
                <button 
                  className="cda-btn cda-btn-danger"
                  onClick={() => onTuChoi(cuocHen)}
                >
                  <HiOutlineXMark />
                  Từ chối
                </button>
                <button 
                  className="cda-btn cda-btn-success"
                  onClick={() => onPheDuyet(cuocHen)}
                >
                  <HiOutlineCheck />
                  Phê duyệt
                </button>
              </>
            )}
            <button className="cda-btn cda-btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalChiTietCuocHen;
