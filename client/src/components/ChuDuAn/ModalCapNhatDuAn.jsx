import React, { useEffect, useState } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import './ModalCapNhatDuAn.css';
import { DuAnService } from '../../services/ChuDuAnService';

const TRANG_THAI_OPTIONS = [
  { value: 'HoatDong', label: 'Hoạt động' },
  { value: 'NgungHoatDong', label: 'Ngưng hoạt động' }
];

function ModalCapNhatDuAn({ isOpen, duAn, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    TenDuAn: '',
    DiaChi: '',
    YeuCauPheDuyetChu: false,
    PhuongThucVao: '',
    ViDo: '',
    KinhDo: '',
    TrangThai: 'HoatDong'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && duAn) {
      setFormData({
        TenDuAn: duAn.TenDuAn || '',
        DiaChi: duAn.DiaChi || '',
        YeuCauPheDuyetChu: Number(duAn.YeuCauPheDuyetChu) === 1,
        PhuongThucVao: duAn.PhuongThucVao || '',
        ViDo: duAn.ViDo !== null && duAn.ViDo !== undefined ? String(duAn.ViDo) : '',
        KinhDo: duAn.KinhDo !== null && duAn.KinhDo !== undefined ? String(duAn.KinhDo) : '',
        TrangThai: duAn.TrangThai || 'HoatDong'
      });
      setError('');
      setLoading(false);
    }
  }, [isOpen, duAn]);

  if (!isOpen || !duAn) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const tenDuAn = formData.TenDuAn.trim();
    if (!tenDuAn) {
      setError('Vui lòng nhập tên dự án');
      return;
    }

    const diaChi = formData.DiaChi.trim();

    const yeuCau = formData.YeuCauPheDuyetChu;
    const phuongThuc = (formData.PhuongThucVao || '').trim();
    if (!yeuCau && !phuongThuc) {
      setError('Vui lòng cung cấp phương thức vào dự án khi không yêu cầu phê duyệt');
      return;
    }

    const latRaw = (formData.ViDo || '').trim();
    const lngRaw = (formData.KinhDo || '').trim();
    const hasLat = latRaw !== '';
    const hasLng = lngRaw !== '';

    if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
      setError('Vui lòng nhập đầy đủ cả vĩ độ và kinh độ hoặc để trống cả hai');
      return;
    }

    let viDo = null;
    let kinhDo = null;

    if (hasLat && hasLng) {
      viDo = Number(latRaw);
      kinhDo = Number(lngRaw);

      if (Number.isNaN(viDo) || Number.isNaN(kinhDo)) {
        setError('Tọa độ không hợp lệ');
        return;
      }

      if (viDo < -90 || viDo > 90) {
        setError('Vĩ độ phải trong khoảng -90 đến 90');
        return;
      }

      if (kinhDo < -180 || kinhDo > 180) {
        setError('Kinh độ phải trong khoảng -180 đến 180');
        return;
      }
    }

    const payload = {
      TenDuAn: tenDuAn,
      DiaChi: diaChi,
      YeuCauPheDuyetChu: yeuCau ? 1 : 0,
      PhuongThucVao: yeuCau ? null : phuongThuc,
      ViDo: hasLat ? viDo : null,
      KinhDo: hasLng ? kinhDo : null,
      TrangThai: formData.TrangThai
    };

    try {
      setLoading(true);
      const result = await DuAnService.capNhat(duAn.DuAnID, payload);
      const updated = result?.data || result?.duAn || null;
      if (onSaved) {
        onSaved(
          updated || {
            ...duAn,
            ...payload,
            CapNhatLuc: new Date().toISOString()
          }
        );
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể cập nhật dự án');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('modal-duan-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-duan-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="modal-duan-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-duan-header">
          <div>
            <h2 className="modal-duan-title">Chỉnh sửa dự án</h2>
            <p className="modal-duan-subtitle">Cập nhật thông tin cơ bản và cấu hình truy cập cho dự án</p>
          </div>
          <button type="button" className="modal-duan-close" onClick={onClose} aria-label="Đóng">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form className="modal-duan-body" onSubmit={handleSubmit}>
          <div className="modal-duan-grid">
            <div className="modal-duan-field">
              <label htmlFor="TenDuAn">Tên dự án</label>
              <input
                id="TenDuAn"
                name="TenDuAn"
                value={formData.TenDuAn}
                onChange={handleChange}
                required
              />
            </div>

            <div className="modal-duan-field">
              <label htmlFor="DiaChi">Địa chỉ hiển thị</label>
              <textarea
                id="DiaChi"
                name="DiaChi"
                value={formData.DiaChi}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="modal-duan-field checkbox">
              <label htmlFor="YeuCauPheDuyetChu" className="checkbox-label">
                <input
                  type="checkbox"
                  id="YeuCauPheDuyetChu"
                  name="YeuCauPheDuyetChu"
                  checked={formData.YeuCauPheDuyetChu}
                  onChange={handleChange}
                />
                Chủ dự án duyệt cuộc hẹn
              </label>
              <p className="field-hint">
                Bật để yêu cầu chủ dự án duyệt từng cuộc hẹn. Nếu tắt, bắt buộc nhập hướng dẫn vào.
              </p>
            </div>

            <div className="modal-duan-field">
              <label htmlFor="PhuongThucVao">
                Phương thức vào dự án {!formData.YeuCauPheDuyetChu && <span className="label-required">*</span>}
              </label>
              <textarea
                id="PhuongThucVao"
                name="PhuongThucVao"
                value={formData.PhuongThucVao}
                onChange={handleChange}
                rows={3}
                disabled={formData.YeuCauPheDuyetChu}
                placeholder={
                  formData.YeuCauPheDuyetChu
                    ? 'Không cần nhập vì đã bật phê duyệt'
                    : 'Ví dụ: Mật khẩu cổng 2468, khóa trong hộp số 3'
                }
              />
            </div>

            <div className="modal-duan-field">
              <label htmlFor="ViDo">Vĩ độ (Latitude)</label>
              <input
                id="ViDo"
                name="ViDo"
                value={formData.ViDo}
                onChange={handleChange}
                type="number"
                step="0.000001"
                placeholder="10.123456"
              />
            </div>

            <div className="modal-duan-field">
              <label htmlFor="KinhDo">Kinh độ (Longitude)</label>
              <input
                id="KinhDo"
                name="KinhDo"
                value={formData.KinhDo}
                onChange={handleChange}
                type="number"
                step="0.000001"
                placeholder="106.987654"
              />
            </div>

            <div className="modal-duan-field">
              <label htmlFor="TrangThai">Trạng thái</label>
              <select
                id="TrangThai"
                name="TrangThai"
                value={formData.TrangThai}
                onChange={handleChange}
              >
                {TRANG_THAI_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="field-hint">Sử dụng Lưu trữ trong bảng dự án để ngừng hoàn toàn.</p>
            </div>
          </div>

          {error && <div className="modal-duan-error">{error}</div>}

          <div className="modal-duan-footer">
            <button type="button" className="modal-duan-btn secondary" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="modal-duan-btn primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCapNhatDuAn;
