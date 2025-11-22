import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import ModalOperator from '../../../components/Operator/shared/ModalOperator';
import { operatorApi } from '../../../services/operatorApi';
import './ModalTaoNhanVien.css';

/**
 * Modal tạo nhân viên mới
 * UC-OPER-05: Tạo tài khoản Nhân viên
 */
const ModalTaoNhanVien = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    tenDayDu: '',
    email: '',
    soDienThoai: '',
    khuVucPhuTrachID: '',
    ngayBatDau: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  const taoMutation = useMutation({
    mutationFn: (data) => operatorApi.nhanVien.taoMoi(data),
    onSuccess: () => {
      alert('✅ Tạo nhân viên thành công! Email đặt mật khẩu đã được gửi.');
      onSuccess();
    },
    onError: (error) => {
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenDayDu || formData.tenDayDu.trim().length < 3) {
      newErrors.tenDayDu = 'Họ tên phải có ít nhất 3 ký tự';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.soDienThoai || !phoneRegex.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại phải có 10 chữ số';
    }

    if (!formData.ngayBatDau) {
      newErrors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await taoMutation.mutateAsync({
      TenDayDu: formData.tenDayDu.trim(),
      Email: formData.email.trim(),
      SoDienThoai: formData.soDienThoai,
      KhuVucPhuTrachID: formData.khuVucPhuTrachID ? parseInt(formData.khuVucPhuTrachID) : null,
      NgayBatDau: formData.ngayBatDau
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
      title="➕ Tạo Nhân viên mới"
      size="medium"
    >
      <div className="modal-tao-nv__content">
        {/* Info */}
        <div className="modal-tao-nv__info">
          💡 Sau khi tạo, nhân viên sẽ nhận email hướng dẫn đặt mật khẩu và đăng nhập hệ thống.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-tao-nv__form">
          {/* Họ tên */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="tenDayDu" className="modal-tao-nv__label">
              Họ và tên <span className="modal-tao-nv__required">*</span>
            </label>
            <input
              type="text"
              id="tenDayDu"
              className={`modal-tao-nv__input ${errors.tenDayDu ? 'has-error' : ''}`}
              placeholder="Nguyễn Văn A"
              value={formData.tenDayDu}
              onChange={(e) => handleChange('tenDayDu', e.target.value)}
              disabled={taoMutation.isLoading}
            />
            {errors.tenDayDu && (
              <span className="modal-tao-nv__error">{errors.tenDayDu}</span>
            )}
          </div>

          {/* Email */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="email" className="modal-tao-nv__label">
              Email <span className="modal-tao-nv__required">*</span>
            </label>
            <input
              type="email"
              id="email"
              className={`modal-tao-nv__input ${errors.email ? 'has-error' : ''}`}
              placeholder="nhanvien@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={taoMutation.isLoading}
            />
            {errors.email && (
              <span className="modal-tao-nv__error">{errors.email}</span>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="soDienThoai" className="modal-tao-nv__label">
              Số điện thoại <span className="modal-tao-nv__required">*</span>
            </label>
            <input
              type="tel"
              id="soDienThoai"
              className={`modal-tao-nv__input ${errors.soDienThoai ? 'has-error' : ''}`}
              placeholder="0901234567"
              value={formData.soDienThoai}
              onChange={(e) => handleChange('soDienThoai', e.target.value)}
              maxLength={10}
              disabled={taoMutation.isLoading}
            />
            {errors.soDienThoai && (
              <span className="modal-tao-nv__error">{errors.soDienThoai}</span>
            )}
          </div>

          {/* Khu vực phụ trách */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="khuVucPhuTrachID" className="modal-tao-nv__label">
              Khu vực phụ trách
            </label>
            <select
              id="khuVucPhuTrachID"
              className="modal-tao-nv__select"
              value={formData.khuVucPhuTrachID}
              onChange={(e) => handleChange('khuVucPhuTrachID', e.target.value)}
              disabled={taoMutation.isLoading}
            >
              <option value="">-- Tất cả khu vực --</option>
              <option value="1">Quận 1</option>
              <option value="2">Quận 2</option>
              <option value="3">Quận 3</option>
              {/* TODO: Load from API */}
            </select>
          </div>

          {/* Ngày bắt đầu */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="ngayBatDau" className="modal-tao-nv__label">
              Ngày bắt đầu <span className="modal-tao-nv__required">*</span>
            </label>
            <input
              type="date"
              id="ngayBatDau"
              className={`modal-tao-nv__input ${errors.ngayBatDau ? 'has-error' : ''}`}
              value={formData.ngayBatDau}
              onChange={(e) => handleChange('ngayBatDau', e.target.value)}
              disabled={taoMutation.isLoading}
            />
            {errors.ngayBatDau && (
              <span className="modal-tao-nv__error">{errors.ngayBatDau}</span>
            )}
          </div>

          {/* Actions */}
          <div className="modal-tao-nv__actions">
            <button
              type="button"
              className="operator-btn operator-btn--secondary"
              onClick={onClose}
              disabled={taoMutation.isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="operator-btn operator-btn--primary"
              disabled={taoMutation.isLoading}
            >
              {taoMutation.isLoading ? 'Đang xử lý...' : '➕ Tạo nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </ModalOperator>
  );
};

export default ModalTaoNhanVien;






