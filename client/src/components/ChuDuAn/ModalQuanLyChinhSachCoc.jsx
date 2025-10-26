/**
 * Modal Quản lý Chính sách Cọc
 * Component: Form tạo mới/cập nhật chính sách cọc
 */

import React, { useState, useEffect } from 'react';
import { HiOutlineXMark, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi2';
import ChinhSachCocService from '../../services/ChinhSachCocService';
import './ModalQuanLyChinhSachCoc.css';

const ModalQuanLyChinhSachCoc = ({ isOpen, onClose, onSuccess, chinhSachCoc = null, mode = 'create' }) => {
  // Form state
  const [formData, setFormData] = useState({
    TenChinhSach: '',
    MoTa: '',
    ChoPhepCocGiuCho: true,
    TTL_CocGiuCho_Gio: 72, // Default 3 ngày
    TyLePhat_CocGiuCho: 100, // Default 100%
    ChoPhepCocAnNinh: false,
    SoTienCocAnNinhMacDinh: 0,
    QuyTacGiaiToa: 'BanGiao',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Load data khi mode = edit
  useEffect(() => {
    if (mode === 'edit' && chinhSachCoc) {
      setFormData({
        TenChinhSach: chinhSachCoc.TenChinhSach || '',
        MoTa: chinhSachCoc.MoTa || '',
        ChoPhepCocGiuCho: chinhSachCoc.ChoPhepCocGiuCho === 1,
        TTL_CocGiuCho_Gio: chinhSachCoc.TTL_CocGiuCho_Gio || 72,
        TyLePhat_CocGiuCho: chinhSachCoc.TyLePhat_CocGiuCho || 100,
        ChoPhepCocAnNinh: chinhSachCoc.ChoPhepCocAnNinh === 1,
        SoTienCocAnNinhMacDinh: chinhSachCoc.SoTienCocAnNinhMacDinh || 0,
        QuyTacGiaiToa: chinhSachCoc.QuyTacGiaiToa || 'BanGiao',
      });
    }
  }, [mode, chinhSachCoc]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error khi user sửa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.TenChinhSach.trim()) {
      newErrors.TenChinhSach = 'Tên chính sách không được để trống';
    } else if (formData.TenChinhSach.length < 1 || formData.TenChinhSach.length > 255) {
      newErrors.TenChinhSach = 'Tên chính sách phải từ 1-255 ký tự';
    }

    if (formData.ChoPhepCocGiuCho) {
      const ttl = parseInt(formData.TTL_CocGiuCho_Gio);
      if (isNaN(ttl) || ttl < 1 || ttl > 168) {
        newErrors.TTL_CocGiuCho_Gio = 'TTL cọc giữ chỗ phải từ 1-168 giờ (tối đa 7 ngày)';
      }

      const tyLePhat = parseFloat(formData.TyLePhat_CocGiuCho);
      if (isNaN(tyLePhat) || tyLePhat < 0 || tyLePhat > 100) {
        newErrors.TyLePhat_CocGiuCho = 'Tỷ lệ phạt phải từ 0-100%';
      }
    }

    if (formData.ChoPhepCocAnNinh) {
      const soTien = parseFloat(formData.SoTienCocAnNinhMacDinh);
      if (isNaN(soTien) || soTien < 0) {
        newErrors.SoTienCocAnNinhMacDinh = 'Số tiền cọc an ninh phải >= 0';
      }
    }

    if (!['BanGiao', 'TheoNgay', 'Khac'].includes(formData.QuyTacGiaiToa)) {
      newErrors.QuyTacGiaiToa = 'Quy tắc giải tỏa không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data
      const submitData = {
        TenChinhSach: formData.TenChinhSach.trim(),
        MoTa: formData.MoTa.trim(),
        ChoPhepCocGiuCho: formData.ChoPhepCocGiuCho,
        TTL_CocGiuCho_Gio: parseInt(formData.TTL_CocGiuCho_Gio),
        TyLePhat_CocGiuCho: parseFloat(formData.TyLePhat_CocGiuCho),
        ChoPhepCocAnNinh: formData.ChoPhepCocAnNinh,
        SoTienCocAnNinhMacDinh: parseFloat(formData.SoTienCocAnNinhMacDinh),
        QuyTacGiaiToa: formData.QuyTacGiaiToa,
      };

      let response;
      if (mode === 'create') {
        response = await ChinhSachCocService.taoMoi(submitData);
      } else {
        response = await ChinhSachCocService.capNhat(chinhSachCoc.ChinhSachCocID, submitData);
      }

      if (response.success) {
        onSuccess(response.data);
        onClose();
      } else {
        setSubmitError(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lỗi submit form:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Lỗi server khi xử lý yêu cầu'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-csc" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? '➕ Tạo Chính sách Cọc mới' : '✏️ Cập nhật Chính sách Cọc'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <HiOutlineXMark />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {submitError && (
            <div className="alert alert-danger">
              <HiOutlineExclamationCircle className="icon" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Tên chính sách */}
            <div className="form-group">
              <label className="form-label required">
                Tên chính sách
              </label>
              <input
                type="text"
                name="TenChinhSach"
                className={`form-input ${errors.TenChinhSach ? 'error' : ''}`}
                value={formData.TenChinhSach}
                onChange={handleChange}
                placeholder="Ví dụ: Chính sách cọc tiêu chuẩn"
                maxLength={255}
              />
              {errors.TenChinhSach && <span className="error-text">{errors.TenChinhSach}</span>}
            </div>

            {/* Mô tả */}
            <div className="form-group">
              <label className="form-label">Mô tả chi tiết</label>
              <textarea
                name="MoTa"
                className="form-textarea"
                value={formData.MoTa}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về chính sách cọc này..."
                rows={3}
              />
            </div>

            {/* Cọc giữ chỗ */}
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="ChoPhepCocGiuCho"
                  name="ChoPhepCocGiuCho"
                  checked={formData.ChoPhepCocGiuCho}
                  onChange={handleChange}
                />
                <label htmlFor="ChoPhepCocGiuCho" className="checkbox-label">
                  Cho phép cọc giữ chỗ
                </label>
              </div>
            </div>

            {formData.ChoPhepCocGiuCho && (
              <>
                {/* TTL cọc giữ chỗ */}
                <div className="form-group form-group-inline">
                  <label className="form-label required">TTL cọc giữ chỗ (giờ)</label>
                  <input
                    type="number"
                    name="TTL_CocGiuCho_Gio"
                    className={`form-input input-small ${errors.TTL_CocGiuCho_Gio ? 'error' : ''}`}
                    value={formData.TTL_CocGiuCho_Gio}
                    onChange={handleChange}
                    min="1"
                    max="168"
                  />
                  <span className="form-hint">1-168 giờ (tối đa 7 ngày)</span>
                  {errors.TTL_CocGiuCho_Gio && <span className="error-text">{errors.TTL_CocGiuCho_Gio}</span>}
                </div>

                {/* Tỷ lệ phạt */}
                <div className="form-group form-group-inline">
                  <label className="form-label required">Tỷ lệ phạt (%)</label>
                  <input
                    type="number"
                    name="TyLePhat_CocGiuCho"
                    className={`form-input input-small ${errors.TyLePhat_CocGiuCho ? 'error' : ''}`}
                    value={formData.TyLePhat_CocGiuCho}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="form-hint">0-100%</span>
                  {errors.TyLePhat_CocGiuCho && <span className="error-text">{errors.TyLePhat_CocGiuCho}</span>}
                </div>
              </>
            )}

            {/* Cọc an ninh */}
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="ChoPhepCocAnNinh"
                  name="ChoPhepCocAnNinh"
                  checked={formData.ChoPhepCocAnNinh}
                  onChange={handleChange}
                />
                <label htmlFor="ChoPhepCocAnNinh" className="checkbox-label">
                  Cho phép cọc an ninh
                </label>
              </div>
            </div>

            {formData.ChoPhepCocAnNinh && (
              <div className="form-group">
                <label className="form-label">Số tiền cọc an ninh mặc định (VNĐ)</label>
                <input
                  type="number"
                  name="SoTienCocAnNinhMacDinh"
                  className={`form-input ${errors.SoTienCocAnNinhMacDinh ? 'error' : ''}`}
                  value={formData.SoTienCocAnNinhMacDinh}
                  onChange={handleChange}
                  min="0"
                  step="100000"
                />
                {errors.SoTienCocAnNinhMacDinh && <span className="error-text">{errors.SoTienCocAnNinhMacDinh}</span>}
              </div>
            )}

            {/* Quy tắc giải tỏa */}
            <div className="form-group">
              <label className="form-label required">Quy tắc giải tỏa</label>
              <select
                name="QuyTacGiaiToa"
                className={`form-select ${errors.QuyTacGiaiToa ? 'error' : ''}`}
                value={formData.QuyTacGiaiToa}
                onChange={handleChange}
              >
                <option value="BanGiao">Bàn giao phòng</option>
                <option value="TheoNgay">Theo ngày</option>
                <option value="Khac">Khác</option>
              </select>
              {errors.QuyTacGiaiToa && <span className="error-text">{errors.QuyTacGiaiToa}</span>}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  '⏳ Đang xử lý...'
                ) : mode === 'create' ? (
                  <>
                    <HiOutlineCheckCircle className="icon" />
                    Tạo mới
                  </>
                ) : (
                  <>
                    <HiOutlineCheckCircle className="icon" />
                    Cập nhật
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalQuanLyChinhSachCoc;
