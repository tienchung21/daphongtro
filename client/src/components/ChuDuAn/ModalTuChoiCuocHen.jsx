import React, { useState } from 'react';
import './ModalTuChoiCuocHen.css';
import { HiOutlineXMark, HiOutlineClock, HiOutlineUser, HiOutlineHome } from 'react-icons/hi2';
import { CuocHenService } from '../../services/ChuDuAnService';

/**
 * Modal Từ chối Cuộc hẹn
 * UC-PROJ-02: Từ chối cuộc hẹn với lý do rõ ràng
 */
function ModalTuChoiCuocHen({ cuocHen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lyDoTuChoi: '',
    lyDoKhac: '',
    ghiChu: ''
  });

  const lyDoOptions = [
    { value: 'phong_da_cho_thue', label: 'Phòng đã cho thuê' },
    { value: 'khung_gio_khong_phu_hop', label: 'Khung giờ không phù hợp' },
    { value: 'khach_khong_du_dieu_kien', label: 'Khách hàng không đủ điều kiện' },
    { value: 'du_an_tam_ngung', label: 'Dự án tạm ngừng hoạt động' },
    { value: 'khac', label: 'Lý do khác' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const lyDoFinal = formData.lyDoTuChoi === 'khac' 
      ? formData.lyDoKhac 
      : lyDoOptions.find(o => o.value === formData.lyDoTuChoi)?.label;

    if (!lyDoFinal || !lyDoFinal.trim()) {
      alert('Vui lòng chọn/nhập lý do từ chối');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn từ chối cuộc hẹn này?')) {
      return;
    }

    try {
      setLoading(true);
      
      await CuocHenService.tuChoi(cuocHen.CuocHenID, lyDoFinal);

      alert('✅ Đã từ chối cuộc hẹn.\nHệ thống đã gửi thông báo lịch sự cho khách hàng kèm gợi ý phòng khác.');
      onSuccess();
    } catch (error) {
      console.error('Lỗi từ chối:', error);
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
      <div className="modal-content tu-choi-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header danger">
          <div className="modal-header-content">
            <div className="modal-icon danger">
              <HiOutlineXMark />
            </div>
            <div>
              <h2 className="modal-title">Từ chối Cuộc hẹn</h2>
              <p className="modal-subtitle">Cuộc hẹn #{cuocHen?.CuocHenID}</p>
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

          {/* Warning */}
          <div className="warning-box">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <strong>Lưu ý quan trọng:</strong>
              <p>Việc từ chối cuộc hẹn có thể ảnh hưởng đến trải nghiệm khách hàng và đánh giá của bạn. 
              Hãy đảm bảo lý do từ chối rõ ràng và hợp lý.</p>
            </div>
          </div>

          {/* Form nhập lý do */}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="cda-form-group">
                <label className="cda-label cda-label-required">
                  Lý do từ chối
                </label>
                <select
                  className="cda-select"
                  value={formData.lyDoTuChoi}
                  onChange={(e) => setFormData({ ...formData, lyDoTuChoi: e.target.value })}
                  required
                >
                  <option value="">-- Chọn lý do --</option>
                  {lyDoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.lyDoTuChoi === 'khac' && (
                <div className="cda-form-group">
                  <label className="cda-label cda-label-required">
                    Mô tả chi tiết lý do
                  </label>
                  <textarea
                    className="cda-textarea"
                    rows="4"
                    placeholder="Vui lòng mô tả chi tiết lý do từ chối..."
                    value={formData.lyDoKhac}
                    onChange={(e) => setFormData({ ...formData, lyDoKhac: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="cda-form-group">
                <label className="cda-label">
                  Ghi chú nội bộ (tùy chọn)
                </label>
                <textarea
                  className="cda-textarea"
                  rows="3"
                  placeholder="Ghi chú nội bộ, không gửi cho khách hàng..."
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                />
              </div>
            </div>

            {/* Actions sau khi từ chối */}
            <div className="auto-actions-info info">
              <h4 className="auto-actions-title">ℹ️ Hệ thống sẽ tự động:</h4>
              <ul className="auto-actions-list">
                <li>• Cập nhật trạng thái cuộc hẹn thành "Đã từ chối"</li>
                <li>• Gửi thông báo lịch sự cho khách hàng kèm lý do</li>
                <li>• Đề xuất các tin đăng khác phù hợp cho khách</li>
                <li>• Thông báo cho nhân viên bán hàng</li>
                <li>• Giải phóng slot thời gian cho cuộc hẹn khác</li>
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
                Quay lại
              </button>
              <button 
                type="submit"
                className="cda-btn cda-btn-danger" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="cda-spinner small"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <HiOutlineXMark />
                    Xác nhận từ chối
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

export default ModalTuChoiCuocHen;
