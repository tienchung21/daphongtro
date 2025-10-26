import React, { useState } from 'react';
import './ModalPheDuyetCuocHen.css';
import { HiOutlineCheck, HiOutlineXMark, HiOutlineClock, HiOutlineUser, HiOutlineHome, HiOutlineKey } from 'react-icons/hi2';
import { CuocHenService } from '../../services/ChuDuAnService';

/**
 * Modal Phê duyệt Cuộc hẹn
 * UC-PROJ-02: Xác nhận cuộc hẹn (nếu yêu cầu)
 */
function ModalPheDuyetCuocHen({ cuocHen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phuongThucVao: cuocHen?.PhuongThucVao || '',
    ghiChu: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phuongThucVao.trim()) {
      alert('Vui lòng nhập hướng dẫn vào dự án');
      return;
    }

    try {
      setLoading(true);
      
      await CuocHenService.pheDuyet(
        cuocHen.CuocHenID, 
        formData.phuongThucVao, 
        formData.ghiChu
      );

      alert('✅ Đã phê duyệt cuộc hẹn thành công!\nHệ thống đã gửi thông báo cho khách hàng và nhân viên.');
      onSuccess();
    } catch (error) {
      console.error('Lỗi phê duyệt:', error);
      alert('❌ Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content phe-duyet-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header success">
          <div className="modal-header-content">
            <div className="modal-icon success">
              <HiOutlineCheck />
            </div>
            <div>
              <h2 className="modal-title">Phê duyệt Cuộc hẹn</h2>
              <p className="modal-subtitle">Xác nhận cuộc hẹn #{cuocHen?.CuocHenID}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <HiOutlineXMark />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Thông tin cuộc hẹn */}
          <div className="info-section">
            <h3 className="section-title">📅 Thông tin cuộc hẹn</h3>
            <div className="info-grid">
              <div className="info-item">
                <HiOutlineClock className="info-icon" />
                <div>
                  <div className="info-label">Thời gian</div>
                  <div className="info-value">{formatDate(cuocHen?.ThoiGianHen)}</div>
                </div>
              </div>
              
              <div className="info-item">
                <HiOutlineUser className="info-icon" />
                <div>
                  <div className="info-label">Khách hàng</div>
                  <div className="info-value">{cuocHen?.TenKhachHang || 'N/A'}</div>
                  <div className="info-sub">{cuocHen?.SoDienThoaiKhach || 'N/A'}</div>
                </div>
              </div>
              
              <div className="info-item">
                <HiOutlineHome className="info-icon" />
                <div>
                  <div className="info-label">Phòng</div>
                  <div className="info-value">{cuocHen?.TenPhong || 'N/A'}</div>
                  <div className="info-sub">{cuocHen?.TenDuAn || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form nhập hướng dẫn */}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">
                <HiOutlineKey className="section-icon" />
                Hướng dẫn vào dự án
              </h3>
              <p className="section-description">
                Thông tin này sẽ được gửi tự động cho khách hàng qua SMS/Email
              </p>
              
              <div className="cda-form-group">
                <label className="cda-label cda-label-required">
                  Phương thức vào dự án
                </label>
                <textarea
                  className="cda-textarea"
                  rows="5"
                  placeholder="Ví dụ:&#10;• Mật khẩu cửa: 123456#&#10;• Lấy chìa khóa tại: Bảo vệ tầng 1&#10;• Gặp nhân viên tại: Sảnh chính lúc 14:00&#10;• Liên hệ: 0909123456 (Anh Mai)"
                  value={formData.phuongThucVao}
                  onChange={(e) => setFormData({ ...formData, phuongThucVao: e.target.value })}
                  required
                />
                <div className="cda-help-text">
                  💡 Hãy cung cấp thông tin chi tiết để khách hàng dễ dàng tìm đến phòng
                </div>
              </div>

              <div className="cda-form-group">
                <label className="cda-label">
                  Ghi chú thêm (tùy chọn)
                </label>
                <textarea
                  className="cda-textarea"
                  rows="3"
                  placeholder="Ghi chú nội bộ hoặc lưu ý đặc biệt..."
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                />
              </div>
            </div>

            {/* Actions sau khi phê duyệt */}
            <div className="auto-actions-info">
              <h4 className="auto-actions-title">✅ Hệ thống sẽ tự động:</h4>
              <ul className="auto-actions-list">
                <li>✓ Cập nhật trạng thái cuộc hẹn thành "Đã xác nhận"</li>
                <li>✓ Gửi SMS/Email xác nhận cho khách hàng với hướng dẫn vào dự án</li>
                <li>✓ Thông báo cho nhân viên bán hàng được phân công</li>
                <li>✓ Tạo nhắc nhở trước cuộc hẹn 1 giờ</li>
                <li>✓ Ghi nhận lịch sử thay đổi vào hệ thống</li>
              </ul>
            </div>

            {/* Footer Actions */}
            <div className="modal-footer">
              <button 
                type="button"
                className="cda-btn cda-btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                <HiOutlineXMark />
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="cda-btn cda-btn-success" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="cda-spinner small"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <HiOutlineCheck />
                    Xác nhận phê duyệt
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalPheDuyetCuocHen;
