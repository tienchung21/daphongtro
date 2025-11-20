import React from 'react';
import {
  HiOutlineXMark,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineCurrencyDollar,
  HiOutlineHome,
  HiOutlineSquare3Stack3D,
  HiOutlineClock,
  HiOutlineCalendar
} from 'react-icons/hi2';
import { Utils } from '../../services/ChuDuAnService';
import MapViTriPhong from '../MapViTriPhong/MapViTriPhong';
import './ModalPreviewDuAn.css';

/**
 * ModalPreviewDuAn - Modal hiển thị chi tiết dự án
 * Thay thế expanded row trong QuanLyDuAn
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - duAn: object (dữ liệu dự án)
 * - chinhSachCocList: array (danh sách chính sách cọc)
 * - onOpenChinhSachCocModal: function(mode, chinhSachCoc)
 * - onOpenYeuCauMoLaiModal: function(duAn)
 */

const PHONG_TRANG_THAI = {
  Trong: { label: 'Trống', icon: '✅', color: 'success' },
  GiuCho: { label: 'Giữ chỗ', icon: '🔒', color: 'warning' },
  DaThue: { label: 'Đã thuê', icon: '🏠', color: 'info' },
  DonDep: { label: 'Dọn dẹp', icon: '🧹', color: 'secondary' }
};

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

function ModalPreviewDuAn({
  isOpen,
  onClose,
  duAn,
  chinhSachCocList = [],
  onOpenChinhSachCocModal,
  onOpenYeuCauMoLaiModal
}) {
  // Body scroll prevention
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !duAn) return null;

  return (
    <div className="modal-preview-du-an__overlay" onClick={onClose}>
      <div className="modal-preview-du-an" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-preview-du-an__header">
          <div className="modal-preview-du-an__header-content">
            <h2 className="modal-preview-du-an__title">Chi tiết Dự án</h2>
            <p className="modal-preview-du-an__subtitle">{duAn.TenDuAn}</p>
          </div>
          <button
            type="button"
            className="modal-preview-du-an__close-btn"
            onClick={onClose}
            title="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </div>

        {/* Body */}
        <div className="modal-preview-du-an__body">
          <div className="modal-preview-du-an__preview-content">
            {/* === HERO INFO SECTION === */}
            <div className="modal-preview-du-an__hero">
              <div className="modal-preview-du-an__hero-left">
                <h1 className="modal-preview-du-an__hero-title">{duAn.TenDuAn}</h1>
                <div className="modal-preview-du-an__hero-address">
                  <HiOutlineMapPin />
                  <span>{duAn.DiaChi || 'Chưa có địa chỉ'}</span>
                </div>
                <div className="modal-preview-du-an__hero-stats">
                  <div className="modal-preview-du-an__hero-stat-item">
                    <HiOutlineHome />
                    <div className="modal-preview-du-an__hero-stat-content">
                      <span className="modal-preview-du-an__hero-stat-value">{toNumber(duAn.TongPhong)}</span>
                      <span className="modal-preview-du-an__hero-stat-label">Tổng phòng</span>
                    </div>
                  </div>
                  <div className="modal-preview-du-an__hero-stat-item modal-preview-du-an__hero-stat-item--success">
                    <HiOutlineCheckCircle />
                    <div className="modal-preview-du-an__hero-stat-content">
                      <span className="modal-preview-du-an__hero-stat-value">{toNumber(duAn.PhongTrong)}</span>
                      <span className="modal-preview-du-an__hero-stat-label">Phòng trống</span>
                    </div>
                  </div>
                  <div className="modal-preview-du-an__hero-stat-item">
                    <HiOutlineSquare3Stack3D />
                    <div className="modal-preview-du-an__hero-stat-content">
                      <span className="modal-preview-du-an__hero-stat-value">{toNumber(duAn.TinDangHoatDong)}/{toNumber(duAn.SoTinDang)}</span>
                      <span className="modal-preview-du-an__hero-stat-label">Tin đăng</span>
                    </div>
                  </div>
                  {duAn.CocStats && toNumber(duAn.CocStats.CocDangHieuLuc) > 0 && (
                    <div className="modal-preview-du-an__hero-stat-item modal-preview-du-an__hero-stat-item--warning">
                      <HiOutlineCurrencyDollar />
                      <div className="modal-preview-du-an__hero-stat-content">
                        <span className="modal-preview-du-an__hero-stat-value">{toNumber(duAn.CocStats.CocDangHieuLuc)}</span>
                        <span className="modal-preview-du-an__hero-stat-label">Cọc hiệu lực</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-preview-du-an__hero-right">
                <div className="modal-preview-du-an__hero-meta">
                  {duAn.YeuCauPheDuyetChu === 1 ? (
                    <div className="modal-preview-du-an__hero-meta-item">
                      <HiOutlineCheckCircle />
                      <span>Yêu cầu duyệt cuộc hẹn</span>
                    </div>
                  ) : (
                    <div className="modal-preview-du-an__hero-meta-item">
                      <HiOutlineClock />
                      <span>Tự động duyệt cuộc hẹn</span>
                    </div>
                  )}
                  {duAn.CapNhatLuc && (
                    <div className="modal-preview-du-an__hero-meta-item">
                      <HiOutlineCalendar />
                      <span>Cập nhật: {Utils.formatDateTime(duAn.CapNhatLuc)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === BANNED INFO SECTION === */}
            {duAn.TrangThai === 'NgungHoatDong' && (
              <div className="modal-preview-du-an__detail-section banned-info-section">
                <div className="modal-preview-du-an__detail-header">
                  <HiOutlineExclamationTriangle className="modal-preview-du-an__detail-icon text-danger" />
                  <span className="modal-preview-du-an__detail-title">⚠️ Thông tin Ngưng hoạt động</span>
                </div>
                <div className="banned-info-content">
                  {/* Lý do */}
                  <div className="banned-reason">
                    <strong>Lý do:</strong>
                    <p className="reason-text">{duAn.LyDoNgungHoatDong || 'Không có thông tin'}</p>
                  </div>
                  
                  {/* Người xử lý & Thời gian */}
                  <div className="banned-meta">
                    {duAn.NguoiNgungHoatDong_TenDayDu && (
                      <div className="meta-item">
                        <span className="meta-label">Người xử lý:</span>
                        <span className="meta-value">{duAn.NguoiNgungHoatDong_TenDayDu}</span>
                      </div>
                    )}
                    {duAn.NgungHoatDongLuc && (
                      <div className="meta-item">
                        <span className="meta-label">Thời gian:</span>
                        <span className="meta-value">{Utils.formatDateTime(duAn.NgungHoatDongLuc)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Trạng thái yêu cầu mở lại */}
                  <div className="request-status-row">
                    <div className="status-label">
                      <strong>Yêu cầu mở lại:</strong>
                    </div>
                    <div className="status-badges">
                      {duAn.YeuCauMoLai === 'ChuaGui' && (
                        <>
                          <span className="request-status-badge badge-secondary">
                            Chưa gửi
                          </span>
                          <button
                            type="button"
                            className="cda-btn cda-btn-primary cda-btn-sm btn-request-reopen"
                            onClick={() => {
                              onOpenYeuCauMoLaiModal(duAn);
                              onClose();
                            }}
                          >
                            Gửi yêu cầu mở lại
                          </button>
                        </>
                      )}
                      {duAn.YeuCauMoLai === 'DangXuLy' && (
                        <>
                          <span className="request-status-badge badge-warning">
                            ⏳ Đang xử lý
                          </span>
                          {duAn.NoiDungGiaiTrinh && (
                            <div className="giaitrinh-box">
                              <strong>Nội dung giải trình:</strong>
                              <p>{duAn.NoiDungGiaiTrinh}</p>
                            </div>
                          )}
                        </>
                      )}
                      {duAn.YeuCauMoLai === 'ChapNhan' && (
                        <span className="request-status-badge badge-success">
                          ✅ Đã chấp nhận
                        </span>
                      )}
                      {duAn.YeuCauMoLai === 'TuChoi' && (
                        <>
                          <span className="request-status-badge badge-danger">
                            ❌ Đã từ chối
                          </span>
                          {duAn.LyDoTuChoiMoLai && (
                            <div className="giaitrinh-box">
                              <strong>Lý do từ chối:</strong>
                              <p className="text-danger">{duAn.LyDoTuChoiMoLai}</p>
                            </div>
                          )}
                          <button
                            type="button"
                            className="cda-btn cda-btn-primary cda-btn-sm btn-request-reopen"
                            onClick={() => {
                              onOpenYeuCauMoLaiModal(duAn);
                              onClose();
                            }}
                          >
                            Gửi yêu cầu mới
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === CHÍNH SÁCH CỌC SECTION === */}
            <div className="modal-preview-du-an__detail-section policy-section">
              <div className="modal-preview-du-an__detail-header">
                <HiOutlineCurrencyDollar className="modal-preview-du-an__detail-icon" />
                <span className="modal-preview-du-an__detail-title">Chính sách Cọc</span>
                <button
                  type="button"
                  className="cda-btn cda-btn-secondary cda-btn-sm"
                  onClick={() => {
                    onOpenChinhSachCocModal('create');
                    onClose();
                  }}
                  style={{ marginLeft: 'auto' }}
                >
                  <HiOutlinePlus className="icon" />
                  Tạo mới
                </button>
              </div>
              <div className="detail-policies">
                {chinhSachCocList.length === 0 ? (
                  <div className="empty-state">
                    <HiOutlineCurrencyDollar className="empty-icon" />
                    <p className="empty-text">Chưa có chính sách cọc nào</p>
                    <button
                      type="button"
                      className="cda-btn cda-btn-primary cda-btn-sm"
                      onClick={() => {
                        onOpenChinhSachCocModal('create');
                        onClose();
                      }}
                    >
                      <HiOutlinePlus />
                      <span>Tạo chính sách đầu tiên</span>
                    </button>
                  </div>
                ) : (
                  <div className="policy-cards">
                    {chinhSachCocList.map((policy) => (
                      <div key={policy.ChinhSachCocID} className="policy-card">
                        <div className="policy-card-header">
                          <h4 className="policy-name">{policy.TenChinhSach}</h4>
                          {policy.ChuDuAnID && (
                            <button
                              type="button"
                              className="policy-edit-btn"
                              onClick={() => {
                                onOpenChinhSachCocModal('edit', policy);
                                onClose();
                              }}
                              title="Chỉnh sửa"
                            >
                              <HiOutlinePencilSquare />
                            </button>
                          )}
                        </div>
                        <div className="policy-tags">
                          {policy.ChoPhepCocGiuCho === 1 && (
                            <>
                              <span className="policy-tag tag-primary">
                                <HiOutlineClock className="tag-icon" />
                                TTL: {policy.TTL_CocGiuCho_Gio}h
                              </span>
                              <span className="policy-tag tag-warning">
                                <HiOutlineExclamationTriangle className="tag-icon" />
                                Phạt: {policy.TyLePhat_CocGiuCho}%
                              </span>
                            </>
                          )}
                          <span className="policy-tag tag-info">
                            <HiOutlineCheckCircle className="tag-icon" />
                            {policy.QuyTacGiaiToa === 'BanGiao' ? 'Giải tỏa khi bàn giao' : 
                             policy.QuyTacGiaiToa === 'TheoNgay' ? 'Giải tỏa theo ngày' : 'Khác'}
                          </span>
                          {policy.SoTinDangSuDung > 0 && (
                            <span className="policy-tag tag-success">
                              <HiOutlineHome className="tag-icon" />
                              {policy.SoTinDangSuDung} tin đăng
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* === CHI TIẾT PHÒNG SECTION === */}
            <div className="modal-preview-du-an__detail-section rooms-section">
              <div className="modal-preview-du-an__detail-header">
                <HiOutlineHome className="modal-preview-du-an__detail-icon" />
                <span className="modal-preview-du-an__detail-title">Chi tiết Phòng trọ</span>
              </div>
              <div className="rooms-grid">
                {Object.entries(PHONG_TRANG_THAI).map(([key, config]) => {
                  const fieldName = `Phong${key.charAt(0).toUpperCase() + key.slice(1)}`;
                  const value = toNumber(duAn[fieldName]);
                  
                  return (
                    <div key={key} className={`room-stat-card room-stat-${config.color}`}>
                      <div className="room-stat-icon">
                        <span style={{ fontSize: '24px' }}>{config.icon}</span>
                      </div>
                      <div className="room-stat-content">
                        <div className="room-stat-value">{value}</div>
                        <div className="room-stat-label">{config.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* === THỐNG KÊ CỌC SECTION === */}
            {duAn.CocStats && toNumber(duAn.CocStats.CocDangHieuLuc) > 0 && (
              <div className="modal-preview-du-an__detail-section coc-section">
                <div className="modal-preview-du-an__detail-header">
                  <HiOutlineCurrencyDollar className="modal-preview-du-an__detail-icon" />
                  <span className="modal-preview-du-an__detail-title">Thống kê Cọc chi tiết</span>
                </div>
                <div className="coc-stats-grid">
                  <div className="coc-stat-card coc-stat-primary">
                    <div className="coc-stat-icon">💰</div>
                    <div className="coc-stat-content">
                      <div className="coc-stat-value">{toNumber(duAn.CocStats.CocDangHieuLucGiuCho)}</div>
                      <div className="coc-stat-label">Cọc giữ chỗ</div>
                    </div>
                  </div>
                  <div className="coc-stat-card coc-stat-info">
                    <div className="coc-stat-icon">🔒</div>
                    <div className="coc-stat-content">
                      <div className="coc-stat-value">{toNumber(duAn.CocStats.CocDangHieuLucAnNinh)}</div>
                      <div className="coc-stat-label">Cọc an ninh</div>
                    </div>
                  </div>
                  <div className="coc-stat-card coc-stat-warning">
                    <div className="coc-stat-icon">⏰</div>
                    <div className="coc-stat-content">
                      <div className="coc-stat-value">{toNumber(duAn.CocStats.CocHetHan)}</div>
                      <div className="coc-stat-label">Đã hết hạn</div>
                    </div>
                  </div>
                  <div className="coc-stat-card coc-stat-secondary">
                    <div className="coc-stat-icon">✅</div>
                    <div className="coc-stat-content">
                      <div className="coc-stat-value">{toNumber(duAn.CocStats.CocDaGiaiToa)}</div>
                      <div className="coc-stat-label">Đã giải tỏa</div>
                    </div>
                  </div>
                  {duAn.CocStats.TongTienCocDangHieuLuc && (
                    <div className="coc-stat-card coc-stat-success coc-stat-wide">
                      <div className="coc-stat-icon">💵</div>
                      <div className="coc-stat-content">
                        <div className="coc-stat-value">{Utils.formatCurrency(duAn.CocStats.TongTienCocDangHieuLuc)}</div>
                        <div className="coc-stat-label">Tổng giá trị cọc hiệu lực</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === BẢNG HOA HỒNG === */}
            {(duAn.BangHoaHong || duAn.SoThangCocToiThieu) && (
              <div className="modal-preview-du-an__detail-section info-section">
                <div className="modal-preview-du-an__detail-header">
                  <HiOutlineCurrencyDollar className="modal-preview-du-an__detail-icon" />
                  <span className="modal-preview-du-an__detail-title">Bảng Hoa Hồng</span>
                </div>
                <div className="info-grid">
                  {duAn.SoThangCocToiThieu && (
                    <div className="info-item">
                      <div className="info-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                        📅
                      </div>
                      <div className="info-content">
                        <div className="info-label">Số tháng cọc tối thiểu</div>
                        <div className="info-value">{duAn.SoThangCocToiThieu} tháng</div>
                      </div>
                    </div>
                  )}
                  {duAn.BangHoaHong && (() => {
                    try {
                      const bangHoaHong = typeof duAn.BangHoaHong === 'string' 
                        ? JSON.parse(duAn.BangHoaHong) 
                        : duAn.BangHoaHong;
                      if (Array.isArray(bangHoaHong) && bangHoaHong.length > 0) {
                        return bangHoaHong.map((muc, idx) => (
                          <div key={idx} className="info-item">
                            <div className="info-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                              💰
                            </div>
                            <div className="info-content">
                              <div className="info-label">Cọc {muc.soThang} tháng</div>
                              <div className="info-value" style={{ color: '#059669', fontWeight: 700 }}>
                                {muc.tyLe}% hoa hồng
                              </div>
                            </div>
                          </div>
                        ));
                      }
                    } catch (err) {
                      console.error('Parse BangHoaHong error:', err);
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}

            {/* === THÔNG TIN BỔ SUNG === */}
            {duAn.PhuongThucVao && (
              <div className="modal-preview-du-an__detail-section info-section">
                <div className="modal-preview-du-an__detail-header">
                  <span className="modal-preview-du-an__detail-icon">🔑</span>
                  <span className="modal-preview-du-an__detail-title">Thông tin bổ sung</span>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon">
                      <HiOutlineMapPin />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Phương thức vào</div>
                      <div className="info-value">{duAn.PhuongThucVao}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === VỊ TRÍ BẢN ĐỐ SECTION === */}
            {duAn.ViDo && duAn.KinhDo && (
              <div className="modal-preview-du-an__detail-section map-section">
                <MapViTriPhong
                  lat={parseFloat(duAn.ViDo)}
                  lng={parseFloat(duAn.KinhDo)}
                  tenDuAn={duAn.TenDuAn}
                  diaChi={duAn.DiaChi}
                  zoom={15}
                  height={window.innerWidth < 768 ? 300 : 400}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-preview-du-an__footer">
          <button
            type="button"
            className="cda-btn cda-btn-secondary"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalPreviewDuAn;
