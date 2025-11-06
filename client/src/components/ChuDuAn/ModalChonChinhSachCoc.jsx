import React, { useState, useEffect } from 'react';
import {
  HiOutlineXMark,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineDocumentCheck,
  HiOutlineExclamationTriangle,
  HiOutlineCurrencyDollar,
  HiOutlineCalendarDays
} from 'react-icons/hi2';
import ChinhSachCocService from '../../services/ChinhSachCocService';
import { DuAnService, Utils } from '../../services/ChuDuAnService';
import './ModalChonChinhSachCoc.css';

/**
 * ModalChonChinhSachCoc - Modal chọn chính sách cọc cho dự án
 * Features:
 * - Hiển thị danh sách chính sách cọc (hệ thống + của chủ dự án)
 * - Radio select (chỉ chọn 1 chính sách)
 * - Hiển thị chi tiết chính sách được chọn
 * - Nút tạo chính sách cọc mới
 * - Lưu chính sách đã chọn vào dự án
 */

function ModalChonChinhSachCoc({ isOpen, onClose, duAn, onSuccess, onOpenCreateModal }) {
  const [chinhSachCocList, setChinhSachCocList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current body overflow
      const originalOverflow = document.body.style.overflow;
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Cleanup: restore body scroll when modal closes
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Load danh sách chính sách cọc
  // Load danh sách chính sách và pre-select chính sách đang dùng
  useEffect(() => {
    if (isOpen && duAn) {
      loadChinhSachCoc();
      
      // Pre-select chính sách hiện tại của dự án (nếu có)
      if (duAn.ChinhSachCocID) {
        setSelectedId(duAn.ChinhSachCocID);
      } else {
        setSelectedId(null);
      }
      
      setError('');
    }
  }, [isOpen, duAn]);

  const loadChinhSachCoc = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ChinhSachCocService.layDanhSach({ chiLayHieuLuc: true });
      if (response.success) {
        setChinhSachCocList(response.data || []);
      } else {
        setError('Không thể tải danh sách chính sách cọc');
      }
    } catch (err) {
      setError(err?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!duAn || !duAn.DuAnID) return;

    try {
      setSaving(true);
      setError('');
      
      // Cập nhật chính sách cọc cho dự án
      await DuAnService.capNhat(duAn.DuAnID, { ChinhSachCocID: selectedId });
      
      if (onSuccess) {
        onSuccess(selectedId);
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể lưu chính sách cọc');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    onClose();
    if (onOpenCreateModal) {
      onOpenCreateModal();
    }
  };

  const selectedPolicy = chinhSachCocList.find(cs => cs.ChinhSachCocID === selectedId);

  if (!isOpen) return null;

  return (
    <div className="modal-chon-chinh-sach-coc__overlay" onClick={onClose}>
      <div className="modal-chon-chinh-sach-coc" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-chon-chinh-sach-coc__header">
          <div className="modal-chon-chinh-sach-coc__header-title-group">
            <h2 className="modal-chon-chinh-sach-coc__title">Chọn Chính sách Cọc</h2>
            {duAn && (
              <p className="modal-chon-chinh-sach-coc__subtitle">Dự án: {duAn.TenDuAn}</p>
            )}
          </div>
          <button type="button" className="modal-chon-chinh-sach-coc__close-btn" onClick={onClose}>
            <HiOutlineXMark />
          </button>
        </div>

        {/* Body */}
        <div className="modal-chon-chinh-sach-coc__body">
          {error && (
            <div className="modal-chon-chinh-sach-coc__alert modal-chon-chinh-sach-coc__alert--error">
              <HiOutlineInformationCircle className="modal-chon-chinh-sach-coc__alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="modal-chon-chinh-sach-coc__loading">
              <div className="modal-chon-chinh-sach-coc__loading-spinner"></div>
              <p>Đang tải danh sách...</p>
            </div>
          ) : (
            <div className="modal-chon-chinh-sach-coc__content">
              {/* Left: Danh sách chính sách */}
              <div className="modal-chon-chinh-sach-coc__list-panel">
                <div className="modal-chon-chinh-sach-coc__panel-header">
                  <h3 className="modal-chon-chinh-sach-coc__panel-title">Danh sách chính sách</h3>
                  <button
                    type="button"
                    className="cda-btn cda-btn-primary cda-btn-sm"
                    onClick={handleCreateNew}
                  >
                    <HiOutlinePlus className="btn-icon" />
                    Tạo mới
                  </button>
                </div>

                <div className="modal-chon-chinh-sach-coc__list">
                  {chinhSachCocList.length === 0 ? (
                    <div className="modal-chon-chinh-sach-coc__empty">
                      <p className="modal-chon-chinh-sach-coc__empty-text">Chưa có chính sách cọc nào</p>
                      <button
                        type="button"
                        className="cda-btn cda-btn-primary cda-btn-sm"
                        onClick={handleCreateNew}
                      >
                        <HiOutlinePlus className="btn-icon" />
                        Tạo chính sách đầu tiên
                      </button>
                    </div>
                  ) : (
                    chinhSachCocList.map((policy) => (
                      <label
                        key={policy.ChinhSachCocID}
                        className={`modal-chon-chinh-sach-coc__item ${selectedId === policy.ChinhSachCocID ? 'modal-chon-chinh-sach-coc__item--active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="chinhSachCoc"
                          value={policy.ChinhSachCocID}
                          checked={selectedId === policy.ChinhSachCocID}
                          onChange={() => setSelectedId(policy.ChinhSachCocID)}
                        />
                        <div className="modal-chon-chinh-sach-coc__item-content">
                          <div className="modal-chon-chinh-sach-coc__item-header">
                            <span className="modal-chon-chinh-sach-coc__item-name">{policy.TenChinhSach}</span>
                            {selectedId === policy.ChinhSachCocID && (
                              <HiOutlineCheckCircle className="modal-chon-chinh-sach-coc__check-icon" />
                            )}
                          </div>
                          <div className="modal-chon-chinh-sach-coc__item-tags">
                            {policy.ChuDuAnID ? (
                              <span className="modal-chon-chinh-sach-coc__tag modal-chon-chinh-sach-coc__tag--custom">Của tôi</span>
                            ) : (
                              <span className="modal-chon-chinh-sach-coc__tag modal-chon-chinh-sach-coc__tag--system">Hệ thống</span>
                            )}
                            {policy.ChoPhepCocGiuCho === 1 && (
                              <span className="modal-chon-chinh-sach-coc__tag modal-chon-chinh-sach-coc__tag--info">Giữ chỗ</span>
                            )}
                            {policy.ChoPhepCocAnNinh === 1 && (
                              <span className="modal-chon-chinh-sach-coc__tag modal-chon-chinh-sach-coc__tag--success">An ninh</span>
                            )}
                          </div>
                          {policy.SoTinDangSuDung > 0 && (
                            <div className="modal-chon-chinh-sach-coc__item-usage">
                              Đang dùng: {policy.SoTinDangSuDung} tin đăng
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Chi tiết chính sách */}
              <div className="modal-chon-chinh-sach-coc__detail-panel">
                <div className="modal-chon-chinh-sach-coc__panel-header">
                  <h3 className="modal-chon-chinh-sach-coc__panel-title">Chi tiết</h3>
                </div>

                {selectedPolicy ? (
                  <div className="modal-chon-chinh-sach-coc__detail">
                    {/* Header */}
                    <div className="modal-chon-chinh-sach-coc__detail-header">
                      <h3 className="modal-chon-chinh-sach-coc__detail-title">{selectedPolicy.TenChinhSach}</h3>
                      {selectedPolicy.MoTa && (
                        <p className="modal-chon-chinh-sach-coc__detail-description">{selectedPolicy.MoTa}</p>
                      )}
                    </div>

                    {/* Section 1: Cọc giữ chỗ */}
                    <div className="modal-chon-chinh-sach-coc__detail-card">
                      <div className="modal-chon-chinh-sach-coc__detail-card-header">
                        <HiOutlineClock className="modal-chon-chinh-sach-coc__detail-card-icon modal-chon-chinh-sach-coc__detail-card-icon--blue" />
                        <h4 className="modal-chon-chinh-sach-coc__detail-card-title">Cọc giữ chỗ</h4>
                      </div>
                      <div className="modal-chon-chinh-sach-coc__detail-card-body">
                        <div className="modal-chon-chinh-sach-coc__info-row">
                          <span className="modal-chon-chinh-sach-coc__info-label">Cho phép</span>
                          <span className={`modal-chon-chinh-sach-coc__info-badge ${selectedPolicy.ChoPhepCocGiuCho === 1 ? 'modal-chon-chinh-sach-coc__info-badge--success' : 'modal-chon-chinh-sach-coc__info-badge--gray'}`}>
                            {selectedPolicy.ChoPhepCocGiuCho === 1 ? 'Có' : 'Không'}
                          </span>
                        </div>
                        {selectedPolicy.ChoPhepCocGiuCho === 1 && (
                          <>
                            <div className="modal-chon-chinh-sach-coc__info-row">
                              <span className="modal-chon-chinh-sach-coc__info-label">
                                <HiOutlineClock className="modal-chon-chinh-sach-coc__inline-icon" />
                                Thời hạn hiệu lực
                              </span>
                              <span className="modal-chon-chinh-sach-coc__info-value">{selectedPolicy.TTL_CocGiuCho_Gio} giờ</span>
                            </div>
                            <div className="modal-chon-chinh-sach-coc__info-row">
                              <span className="modal-chon-chinh-sach-coc__info-label">
                                <HiOutlineExclamationTriangle className="modal-chon-chinh-sach-coc__inline-icon" />
                                Tỷ lệ phạt nếu hủy
                              </span>
                              <span className="modal-chon-chinh-sach-coc__info-value modal-chon-chinh-sach-coc__info-value--highlight">
                                {selectedPolicy.TyLePhat_CocGiuCho !== null && selectedPolicy.TyLePhat_CocGiuCho !== undefined
                                  ? `${selectedPolicy.TyLePhat_CocGiuCho}%`
                                  : 'Không phạt (0%)'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Cọc an ninh */}
                    <div className="modal-chon-chinh-sach-coc__detail-card">
                      <div className="modal-chon-chinh-sach-coc__detail-card-header">
                        <HiOutlineShieldCheck className="modal-chon-chinh-sach-coc__detail-card-icon modal-chon-chinh-sach-coc__detail-card-icon--green" />
                        <h4 className="modal-chon-chinh-sach-coc__detail-card-title">Cọc an ninh</h4>
                      </div>
                      <div className="modal-chon-chinh-sach-coc__detail-card-body">
                        <div className="modal-chon-chinh-sach-coc__info-row">
                          <span className="modal-chon-chinh-sach-coc__info-label">Cho phép</span>
                          <span className={`modal-chon-chinh-sach-coc__info-badge ${selectedPolicy.ChoPhepCocAnNinh === 1 ? 'modal-chon-chinh-sach-coc__info-badge--success' : 'modal-chon-chinh-sach-coc__info-badge--gray'}`}>
                            {selectedPolicy.ChoPhepCocAnNinh === 1 ? 'Có' : 'Không'}
                          </span>
                        </div>
                        {selectedPolicy.ChoPhepCocAnNinh === 1 && (
                          <div className="modal-chon-chinh-sach-coc__info-row">
                            <span className="modal-chon-chinh-sach-coc__info-label">
                              <HiOutlineCurrencyDollar className="modal-chon-chinh-sach-coc__inline-icon" />
                              Số tiền mặc định
                            </span>
                            <span className="modal-chon-chinh-sach-coc__info-value modal-chon-chinh-sach-coc__info-value--money">
                              {selectedPolicy.SoTienCocAnNinhMacDinh 
                                ? `${Number(selectedPolicy.SoTienCocAnNinhMacDinh).toLocaleString('vi-VN')} ₫` 
                                : 'Chưa thiết lập'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 3: Quy tắc giải tỏa */}
                    <div className="modal-chon-chinh-sach-coc__detail-card">
                      <div className="modal-chon-chinh-sach-coc__detail-card-header">
                        <HiOutlineDocumentCheck className="modal-chon-chinh-sach-coc__detail-card-icon modal-chon-chinh-sach-coc__detail-card-icon--purple" />
                        <h4 className="modal-chon-chinh-sach-coc__detail-card-title">Quy tắc giải tỏa</h4>
                      </div>
                      <div className="modal-chon-chinh-sach-coc__detail-card-body">
                        <div className="modal-chon-chinh-sach-coc__info-row">
                          <span className="modal-chon-chinh-sach-coc__info-label">Quy tắc áp dụng</span>
                          <span className="modal-chon-chinh-sach-coc__info-badge modal-chon-chinh-sach-coc__info-badge--primary">
                            {selectedPolicy.QuyTacGiaiToa === 'BanGiao' && 'Bàn giao phòng'}
                            {selectedPolicy.QuyTacGiaiToa === 'TheoNgay' && 'Theo ngày'}
                            {selectedPolicy.QuyTacGiaiToa === 'Khac' && 'Quy tắc khác'}
                          </span>
                        </div>
                        {selectedPolicy.QuyTacGiaiToa === 'TheoNgay' && selectedPolicy.SoNgayGiaiToa && (
                          <div className="modal-chon-chinh-sach-coc__info-row">
                            <span className="modal-chon-chinh-sach-coc__info-label">
                              <HiOutlineCalendarDays className="modal-chon-chinh-sach-coc__inline-icon" />
                              Số ngày giải tỏa
                            </span>
                            <span className="modal-chon-chinh-sach-coc__info-value">{selectedPolicy.SoNgayGiaiToa} ngày</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata footer */}
                    <div className="modal-chon-chinh-sach-coc__detail-footer">
                      <div className="modal-chon-chinh-sach-coc__footer-item">
                        <span className="modal-chon-chinh-sach-coc__footer-label">Loại chính sách:</span>
                        <span className="modal-chon-chinh-sach-coc__footer-value">
                          {selectedPolicy.ChuDuAnID ? 'Tùy chỉnh' : 'Hệ thống'}
                        </span>
                      </div>
                      {selectedPolicy.SoTinDangSuDung > 0 && (
                        <div className="modal-chon-chinh-sach-coc__footer-item">
                          <span className="modal-chon-chinh-sach-coc__footer-label">Đang sử dụng:</span>
                          <span className="modal-chon-chinh-sach-coc__footer-value">{selectedPolicy.SoTinDangSuDung} tin đăng</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="modal-chon-chinh-sach-coc__detail-empty">
                    <HiOutlineInformationCircle className="modal-chon-chinh-sach-coc__detail-empty-icon" />
                    <p>Chọn một chính sách để xem chi tiết</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-chon-chinh-sach-coc__footer">
          <button
            type="button"
            className="cda-btn cda-btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            type="button"
            className="cda-btn cda-btn-primary"
            onClick={handleSave}
            disabled={saving || !selectedId}
          >
            {saving ? 'Đang lưu...' : 'Lưu chính sách'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalChonChinhSachCoc;
