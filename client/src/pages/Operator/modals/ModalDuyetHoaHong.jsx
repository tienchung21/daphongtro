import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import ModalOperator from '../../../components/Operator/shared/ModalOperator';
import BadgeStatusOperator from '../../../components/Operator/shared/BadgeStatusOperator';
import { operatorApi } from '../../../services/operatorApi';
import './ModalDuyetHoaHong.css';

/**
 * Modal duyệt/từ chối hoa hồng dự án
 * Operator xem thông tin hoa hồng và quyết định duyệt hoặc từ chối
 */
const ModalDuyetHoaHong = ({ duAnId, duAn, onClose, onSuccess }) => {
  const [action, setAction] = useState(''); // 'duyet' hoặc 'tuChoi'
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');
  const [errors, setErrors] = useState({});

  const duyetMutation = useMutation({
    mutationFn: () => operatorApi.duAn.duyetHoaHong(duAnId),
    onSuccess: () => {
      alert('✅ Duyệt hoa hồng thành công!');
      onSuccess();
    },
    onError: (error) => {
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  });

  const tuChoiMutation = useMutation({
    mutationFn: (data) => operatorApi.duAn.tuChoiHoaHong(duAnId, data),
    onSuccess: () => {
      alert('✅ Từ chối hoa hồng thành công!');
      onSuccess();
    },
    onError: (error) => {
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  });

  const validateForm = () => {
    const newErrors = {};

    if (!action) {
      newErrors.action = 'Vui lòng chọn hành động';
    }

    if (action === 'tuChoi' && (!lyDoTuChoi || lyDoTuChoi.trim().length < 10)) {
      newErrors.lyDoTuChoi = 'Lý do từ chối phải có ít nhất 10 ký tự';
    } else if (lyDoTuChoi.length > 500) {
      newErrors.lyDoTuChoi = 'Lý do từ chối không được vượt quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (action === 'duyet') {
      if (!window.confirm(`Bạn có chắc chắn muốn duyệt hoa hồng cho dự án "${duAn?.TenDuAn}"?`)) {
        return;
      }
      await duyetMutation.mutateAsync();
    } else {
      if (!window.confirm(`Bạn có chắc chắn muốn từ chối hoa hồng cho dự án "${duAn?.TenDuAn}"?`)) {
        return;
      }
      await tuChoiMutation.mutateAsync({
        LyDoTuChoi: lyDoTuChoi.trim()
      });
    }
  };

  const isLoading = duyetMutation.isLoading || tuChoiMutation.isLoading;

  return (
    <ModalOperator
      isOpen={true}
      onClose={onClose}
      title="💰 Duyệt Hoa hồng Dự án"
      size="medium"
    >
      <div className="modal-duyet-hoa-hong__content">
        {/* Thông tin dự án */}
        <div className="modal-duyet-hoa-hong__info">
          <div className="modal-duyet-hoa-hong__info-row">
            <div className="modal-duyet-hoa-hong__info-label">Dự án:</div>
            <div className="modal-duyet-hoa-hong__info-value">
              #{duAnId} - {duAn?.TenDuAn}
            </div>
          </div>
          <div className="modal-duyet-hoa-hong__info-row">
            <div className="modal-duyet-hoa-hong__info-label">Chủ dự án:</div>
            <div className="modal-duyet-hoa-hong__info-value">
              {duAn?.TenChuDuAn}
            </div>
          </div>
        </div>

        {/* Thông tin hoa hồng hiện tại */}
        <div className="modal-duyet-hoa-hong__hoa-hong-info">
          <h3 className="modal-duyet-hoa-hong__section-title">Thông tin Hoa hồng</h3>
          <div className="modal-duyet-hoa-hong__hoa-hong-details">
            <div className="modal-duyet-hoa-hong__detail-item">
              <span className="modal-duyet-hoa-hong__detail-label">Bảng hoa hồng:</span>
              <span className="modal-duyet-hoa-hong__detail-value">
                {duAn?.BangHoaHong || 'N/A'}%
              </span>
            </div>
            {duAn?.SoThangCocToiThieu && (
              <div className="modal-duyet-hoa-hong__detail-item">
                <span className="modal-duyet-hoa-hong__detail-label">Số tháng cọc tối thiểu:</span>
                <span className="modal-duyet-hoa-hong__detail-value">
                  {duAn.SoThangCocToiThieu} tháng
                </span>
              </div>
            )}
            <div className="modal-duyet-hoa-hong__detail-item">
              <span className="modal-duyet-hoa-hong__detail-label">Trạng thái:</span>
              <BadgeStatusOperator
                status={duAn?.TrangThaiDuyetHoaHong || 'ChoDuyet'}
                statusMap={{
                  'ChoDuyet': { label: 'Chờ duyệt', variant: 'warning' },
                  'DaDuyet': { label: 'Đã duyệt', variant: 'success' },
                  'TuChoi': { label: 'Từ chối', variant: 'danger' }
                }}
              />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="modal-duyet-hoa-hong__warning">
          ⚠️ <strong>Lưu ý:</strong> Sau khi duyệt hoa hồng, dự án sẽ có thể đăng tin đăng. 
          Nếu từ chối, chủ dự án sẽ nhận được thông báo và có thể chỉnh sửa lại.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-duyet-hoa-hong__form">
          {/* Action selection */}
          <div className="modal-duyet-hoa-hong__form-group">
            <label className="modal-duyet-hoa-hong__label">
              Hành động <span className="modal-duyet-hoa-hong__required">*</span>
            </label>
            <div className="modal-duyet-hoa-hong__action-buttons">
              <button
                type="button"
                className={`modal-duyet-hoa-hong__action-btn ${
                  action === 'duyet' ? 'modal-duyet-hoa-hong__action-btn--active' : ''
                } ${action === 'duyet' ? 'operator-btn--success' : 'operator-btn--secondary'}`}
                onClick={() => {
                  setAction('duyet');
                  setLyDoTuChoi('');
                  if (errors.action) {
                    setErrors({ ...errors, action: null });
                  }
                }}
                disabled={isLoading}
              >
                ✅ Duyệt hoa hồng
              </button>
              <button
                type="button"
                className={`modal-duyet-hoa-hong__action-btn ${
                  action === 'tuChoi' ? 'modal-duyet-hoa-hong__action-btn--active' : ''
                } ${action === 'tuChoi' ? 'operator-btn--danger' : 'operator-btn--secondary'}`}
                onClick={() => {
                  setAction('tuChoi');
                  if (errors.action) {
                    setErrors({ ...errors, action: null });
                  }
                }}
                disabled={isLoading}
              >
                ❌ Từ chối hoa hồng
              </button>
            </div>
            {errors.action && (
              <span className="modal-duyet-hoa-hong__error">{errors.action}</span>
            )}
          </div>

          {/* Lý do từ chối */}
          {action === 'tuChoi' && (
            <div className="modal-duyet-hoa-hong__form-group">
              <label htmlFor="lyDoTuChoi" className="modal-duyet-hoa-hong__label">
                Lý do từ chối <span className="modal-duyet-hoa-hong__required">*</span>
              </label>
              <textarea
                id="lyDoTuChoi"
                className={`modal-duyet-hoa-hong__textarea ${errors.lyDoTuChoi ? 'has-error' : ''}`}
                placeholder="Nhập lý do từ chối hoa hồng (tối thiểu 10 ký tự)..."
                value={lyDoTuChoi}
                onChange={(e) => {
                  setLyDoTuChoi(e.target.value);
                  if (errors.lyDoTuChoi) {
                    setErrors({ ...errors, lyDoTuChoi: null });
                  }
                }}
                rows={4}
                maxLength={500}
                disabled={isLoading}
              />
              <div className="modal-duyet-hoa-hong__textarea-info">
                <span className={errors.lyDoTuChoi ? 'modal-duyet-hoa-hong__error' : ''}>
                  {errors.lyDoTuChoi || `${lyDoTuChoi.length}/500 ký tự`}
                </span>
                {lyDoTuChoi.length > 0 && lyDoTuChoi.length < 10 && !errors.lyDoTuChoi && (
                  <span className="modal-duyet-hoa-hong__hint">
                    Còn thiếu {10 - lyDoTuChoi.length} ký tự
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="modal-duyet-hoa-hong__actions">
            <button
              type="button"
              className="operator-btn operator-btn--secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`operator-btn ${
                action === 'duyet' 
                  ? 'operator-btn--success' 
                  : action === 'tuChoi' 
                  ? 'operator-btn--danger' 
                  : 'operator-btn--secondary'
              }`}
              disabled={isLoading || !action || (action === 'tuChoi' && !lyDoTuChoi.trim())}
            >
              {isLoading 
                ? 'Đang xử lý...' 
                : action === 'duyet' 
                ? '✅ Duyệt hoa hồng' 
                : action === 'tuChoi'
                ? '❌ Từ chối hoa hồng'
                : 'Chọn hành động'}
            </button>
          </div>
        </form>
      </div>
    </ModalOperator>
  );
};

export default ModalDuyetHoaHong;







