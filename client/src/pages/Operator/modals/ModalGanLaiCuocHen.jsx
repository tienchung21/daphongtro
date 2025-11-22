import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import ModalOperator from '../../../components/Operator/shared/ModalOperator';
import { operatorApi } from '../../../services/operatorApi';
import './ModalGanLaiCuocHen.css';

/**
 * Modal gán lại cuộc hẹn cho NVBH khác
 * Operator chọn NVBH mới và nhập lý do
 */
const ModalGanLaiCuocHen = ({ cuocHenId, cuocHen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nhanVienMoiId: '',
    lyDoGanLai: ''
  });
  const [errors, setErrors] = useState({});

  // Query danh sách NVBH khả dụng
  const { data: nhanVienList, isLoading: loadingNV } = useQuery({
    queryKey: ['nhanVienKhaDung'],
    queryFn: () => operatorApi.nhanVien.getDanhSachKhaDung()
  });

  const ganLaiMutation = useMutation({
    mutationFn: (data) => operatorApi.cuocHen.ganLai(data.cuocHenId, data.payload),
    onSuccess: () => {
      alert('✅ Gán lại cuộc hẹn thành công!');
      onSuccess();
    },
    onError: (error) => {
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nhanVienMoiId) {
      newErrors.nhanVienMoiId = 'Vui lòng chọn nhân viên';
    }

    if (!formData.lyDoGanLai || formData.lyDoGanLai.trim().length < 10) {
      newErrors.lyDoGanLai = 'Lý do gán lại phải có ít nhất 10 ký tự';
    } else if (formData.lyDoGanLai.length > 300) {
      newErrors.lyDoGanLai = 'Lý do gán lại không được vượt quá 300 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn gán lại cuộc hẹn này?')) {
      return;
    }

    await ganLaiMutation.mutateAsync({
      cuocHenId,
      payload: {
        NhanVienMoiID: parseInt(formData.nhanVienMoiId),
        LyDoGanLai: formData.lyDoGanLai.trim()
      }
    });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <ModalOperator
      isOpen={true}
      onClose={onClose}
      title="🔄 Gán lại cuộc hẹn"
      size="medium"
    >
      <div className="modal-gan-lai__content">
        {/* Thông tin cuộc hẹn */}
        <div className="modal-gan-lai__info">
          <div className="modal-gan-lai__info-row">
            <label>Cuộc hẹn:</label>
            <span>#{cuocHenId}</span>
          </div>
          <div className="modal-gan-lai__info-row">
            <label>Khách hàng:</label>
            <span>{cuocHen.TenKhachHang} - {cuocHen.SoDienThoaiKhach}</span>
          </div>
          <div className="modal-gan-lai__info-row">
            <label>NVBH hiện tại:</label>
            <span>{cuocHen.TenNVBH || 'Chưa phân công'}</span>
          </div>
          <div className="modal-gan-lai__info-row">
            <label>Thời gian:</label>
            <span>{new Date(cuocHen.ThoiGianHen).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-gan-lai__form">
          {/* Chọn NVBH mới */}
          <div className="modal-gan-lai__form-group">
            <label htmlFor="nhanVienMoiId" className="modal-gan-lai__label">
              Gán cho NVBH <span className="modal-gan-lai__required">*</span>
            </label>
            {loadingNV ? (
              <div className="modal-gan-lai__loading">Đang tải...</div>
            ) : (
              <select
                id="nhanVienMoiId"
                className={`modal-gan-lai__select ${errors.nhanVienMoiId ? 'has-error' : ''}`}
                value={formData.nhanVienMoiId}
                onChange={(e) => handleChange('nhanVienMoiId', e.target.value)}
                disabled={ganLaiMutation.isLoading}
              >
                <option value="">-- Chọn nhân viên --</option>
                {nhanVienList?.data?.map(nv => (
                  <option key={nv.NguoiDungID} value={nv.NguoiDungID}>
                    {nv.TenDayDu} - {nv.KhuVucPhuTrach || 'Tất cả khu vực'}
                  </option>
                ))}
              </select>
            )}
            {errors.nhanVienMoiId && (
              <span className="modal-gan-lai__error">{errors.nhanVienMoiId}</span>
            )}
          </div>

          {/* Lý do gán lại */}
          <div className="modal-gan-lai__form-group">
            <label htmlFor="lyDoGanLai" className="modal-gan-lai__label">
              Lý do gán lại <span className="modal-gan-lai__required">*</span>
            </label>
            <textarea
              id="lyDoGanLai"
              className={`modal-gan-lai__textarea ${errors.lyDoGanLai ? 'has-error' : ''}`}
              placeholder="Nhập lý do gán lại (tối thiểu 10 ký tự)..."
              value={formData.lyDoGanLai}
              onChange={(e) => handleChange('lyDoGanLai', e.target.value)}
              rows={4}
              maxLength={300}
              disabled={ganLaiMutation.isLoading}
            />
            
            <div className="modal-gan-lai__textarea-info">
              <span className={errors.lyDoGanLai ? 'modal-gan-lai__error' : ''}>
                {errors.lyDoGanLai || `${formData.lyDoGanLai.length}/300 ký tự`}
              </span>
              {formData.lyDoGanLai.length > 0 && formData.lyDoGanLai.length < 10 && !errors.lyDoGanLai && (
                <span className="modal-gan-lai__hint">
                  Còn thiếu {10 - formData.lyDoGanLai.length} ký tự
                </span>
              )}
            </div>
          </div>

          {/* Gợi ý lý do */}
          <div className="modal-gan-lai__suggestions">
            <div className="modal-gan-lai__suggestions-title">
              💡 Gợi ý lý do:
            </div>
            <div className="modal-gan-lai__suggestions-list">
              <button
                type="button"
                className="modal-gan-lai__suggestion-btn"
                onClick={() => handleChange('lyDoGanLai', 'NVBH hiện tại không thể tham gia do bận việc đột xuất.')}
                disabled={ganLaiMutation.isLoading}
              >
                NVBH bận việc
              </button>
              <button
                type="button"
                className="modal-gan-lai__suggestion-btn"
                onClick={() => handleChange('lyDoGanLai', 'Gán lại để cân bằng tải công việc giữa các NVBH.')}
                disabled={ganLaiMutation.isLoading}
              >
                Cân bằng tải
              </button>
              <button
                type="button"
                className="modal-gan-lai__suggestion-btn"
                onClick={() => handleChange('lyDoGanLai', 'NVBH mới có chuyên môn phù hợp hơn với yêu cầu khách hàng.')}
                disabled={ganLaiMutation.isLoading}
              >
                Chuyên môn phù hợp
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-gan-lai__actions">
            <button
              type="button"
              className="operator-btn operator-btn--secondary"
              onClick={onClose}
              disabled={ganLaiMutation.isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="operator-btn operator-btn--primary"
              disabled={ganLaiMutation.isLoading || !formData.nhanVienMoiId || !formData.lyDoGanLai}
            >
              {ganLaiMutation.isLoading ? 'Đang xử lý...' : '🔄 Gán lại cuộc hẹn'}
            </button>
          </div>
        </form>
      </div>
    </ModalOperator>
  );
};

export default ModalGanLaiCuocHen;






