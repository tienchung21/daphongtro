import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import ModalOperator from '../../../components/Operator/shared/ModalOperator';
import { operatorApi } from '../../../services/operatorApi';
import './ModalTuChoiTinDang.css';

/**
 * Modal từ chối tin đăng
 * Operator nhập lý do từ chối (min 10 ký tự)
 */
const ModalTuChoiTinDang = ({ tinDangId, tieuDe, onClose, onSuccess }) => {
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');
  const [errors, setErrors] = useState({});
  const [operatorId] = useState(() => {
    try {
      const operator = localStorage.getItem("user");
      if (operator) {
        const parsed = JSON.parse(operator);
        return parsed.NguoiDungID || -1;
      }
    } catch (e) {
      return -1;
    }
    return -1;
  });

  const tuChoiMutation = useMutation({
    mutationFn: (data) => operatorApi.tinDang.tuChoiTinDang(data.tinDangId, data.lyDoTuChoi, operatorId),
    onSuccess: () => {
      alert('✅ Từ chối tin đăng thành công!');
      onSuccess();
    },
    onError: (error) => {
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  });

  const validateForm = () => {
    const newErrors = {};

    if (!lyDoTuChoi.trim()) {
      newErrors.lyDoTuChoi = 'Vui lòng nhập lý do từ chối';
    } else if (lyDoTuChoi.trim().length < 10) {
      newErrors.lyDoTuChoi = 'Lý do từ chối phải có ít nhất 10 ký tự';
    } else if (lyDoTuChoi.length > 1000) {
      newErrors.lyDoTuChoi = 'Lý do từ chối không được vượt quá 1000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn từ chối tin đăng này?')) {
      return;
    }

    await tuChoiMutation.mutateAsync({
      tinDangId,
      lyDoTuChoi: lyDoTuChoi.trim()
    });
  };

  return (
    <ModalOperator
      isOpen={true}
      onClose={onClose}
      title="❌ Từ chối tin đăng"
      size="medium"
    >
      <div className="modal-tu-choi__content">
        {/* Thông tin tin đăng */}
        <div className="modal-tu-choi__info">
          <div className="modal-tu-choi__info-label">Tin đăng:</div>
          <div className="modal-tu-choi__info-value">
            #{tinDangId} - {tieuDe}
          </div>
        </div>

        {/* Warning */}
        <div className="modal-tu-choi__warning">
          ⚠️ <strong>Lưu ý:</strong> Hành động này sẽ từ chối tin đăng và thông báo cho Chủ dự án. 
          Vui lòng ghi rõ lý do để Chủ dự án có thể chỉnh sửa và gửi lại.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-tu-choi__form">
          <div className="modal-tu-choi__form-group">
            <label htmlFor="lyDoTuChoi" className="modal-tu-choi__label">
              Lý do từ chối <span className="modal-tu-choi__required">*</span>
            </label>
            <textarea
              id="lyDoTuChoi"
              className={`modal-tu-choi__textarea ${errors.lyDoTuChoi ? 'has-error' : ''}`}
              placeholder="Nhập lý do từ chối chi tiết (tối thiểu 10 ký tự)..."
              value={lyDoTuChoi}
              onChange={(e) => {
                setLyDoTuChoi(e.target.value);
                if (errors.lyDoTuChoi) {
                  setErrors({ ...errors, lyDoTuChoi: null });
                }
              }}
              rows={6}
              maxLength={1000}
              disabled={tuChoiMutation.isLoading}
            />
            
            <div className="modal-tu-choi__textarea-info">
              <span className={errors.lyDoTuChoi ? 'modal-tu-choi__error' : ''}>
                {errors.lyDoTuChoi || `${lyDoTuChoi.length}/1000 ký tự`}
              </span>
              {lyDoTuChoi.length > 0 && lyDoTuChoi.length < 10 && !errors.lyDoTuChoi && (
                <span className="modal-tu-choi__hint">
                  Còn thiếu {10 - lyDoTuChoi.length} ký tự
                </span>
              )}
            </div>
          </div>

          {/* Gợi ý lý do */}
          <div className="modal-tu-choi__suggestions">
            <div className="modal-tu-choi__suggestions-title">
              💡 Gợi ý lý do thường gặp:
            </div>
            <div className="modal-tu-choi__suggestions-list">
              <button
                type="button"
                className="modal-tu-choi__suggestion-btn"
                onClick={() => setLyDoTuChoi('Thông tin dự án chưa đầy đủ, vui lòng bổ sung địa chỉ chi tiết và hình ảnh rõ nét.')}
                disabled={tuChoiMutation.isLoading}
              >
                Thông tin chưa đầy đủ
              </button>
              <button
                type="button"
                className="modal-tu-choi__suggestion-btn"
                onClick={() => setLyDoTuChoi('Hình ảnh không rõ nét hoặc không phù hợp với quy định của hệ thống.')}
                disabled={tuChoiMutation.isLoading}
              >
                Hình ảnh không đạt
              </button>
              <button
                type="button"
                className="modal-tu-choi__suggestion-btn"
                onClick={() => setLyDoTuChoi('Thông tin giá và diện tích chưa chính xác, vui lòng kiểm tra và cập nhật lại.')}
                disabled={tuChoiMutation.isLoading}
              >
                Giá/diện tích chưa đúng
              </button>
              <button
                type="button"
                className="modal-tu-choi__suggestion-btn"
                onClick={() => setLyDoTuChoi('Chủ dự án chưa hoàn thành xác minh KYC. Vui lòng hoàn tất xác minh trước khi đăng tin.')}
                disabled={tuChoiMutation.isLoading}
              >
                KYC chưa hoàn tất
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-tu-choi__actions">
            <button
              type="button"
              className="operator-btn operator-btn--secondary"
              onClick={onClose}
              disabled={tuChoiMutation.isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="operator-btn operator-btn--danger"
              disabled={tuChoiMutation.isLoading || !lyDoTuChoi.trim()}
            >
              {tuChoiMutation.isLoading ? 'Đang xử lý...' : '❌ Từ chối tin đăng'}
            </button>
          </div>
        </form>
      </div>
    </ModalOperator>
  );
};

export default ModalTuChoiTinDang;






