import { useQuery } from '@tanstack/react-query';
import ModalOperator from '../../../components/Operator/shared/ModalOperator';
import BadgeStatusOperator from '../../../components/Operator/shared/BadgeStatusOperator';
import { operatorApi } from '../../../services/operatorApi';
import './ModalChiTietBienBan.css';

/**
 * Modal xem chi tiết biên bản
 * Hiển thị đầy đủ thông tin + chữ ký
 */
const ModalChiTietBienBan = ({ bienBanId, onClose }) => {
  const { data: bienBan, isLoading, error } = useQuery({
    queryKey: ['bienBanChiTiet', bienBanId],
    queryFn: () => operatorApi.bienBan.getChiTiet(bienBanId),
    enabled: !!bienBanId
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="modal-chi-tiet-bb__loading">
          <div className="operator-shimmer" style={{ height: '400px' }}></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="modal-chi-tiet-bb__error">
          ❌ Lỗi tải dữ liệu: {error.message}
        </div>
      );
    }

    if (!bienBan) return null;

    return (
      <div className="modal-chi-tiet-bb__content">
        {/* Thông tin chung */}
        <div className="modal-chi-tiet-bb__section">
          <h3 className="modal-chi-tiet-bb__section-title">📋 Thông tin biên bản</h3>
          <div className="modal-chi-tiet-bb__info-grid">
            <div className="modal-chi-tiet-bb__info-item">
              <label>Mã biên bản:</label>
              <span>BB-{bienBan.BienBanID}</span>
            </div>
            <div className="modal-chi-tiet-bb__info-item">
              <label>Trạng thái:</label>
              <BadgeStatusOperator
                status={bienBan.TrangThai}
                statusMap={{
                  'ChuaBanGiao': { label: 'Chưa bàn giao', variant: 'warning' },
                  'DaBanGiao': { label: 'Đã bàn giao', variant: 'success' },
                  'DaHuy': { label: 'Đã hủy', variant: 'danger' }
                }}
              />
            </div>
            <div className="modal-chi-tiet-bb__info-item">
              <label>Ngày tạo:</label>
              <span>{new Date(bienBan.TaoLuc).toLocaleString('vi-VN')}</span>
            </div>
            {bienBan.BanGiaoLuc && (
              <div className="modal-chi-tiet-bb__info-item">
                <label>Ngày bàn giao:</label>
                <span>{new Date(bienBan.BanGiaoLuc).toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin bên liên quan */}
        <div className="modal-chi-tiet-bb__section">
          <h3 className="modal-chi-tiet-bb__section-title">👥 Bên liên quan</h3>
          <div className="modal-chi-tiet-bb__info-grid">
            <div className="modal-chi-tiet-bb__info-item">
              <label>Khách hàng:</label>
              <span>{bienBan.TenKhachHang}</span>
            </div>
            <div className="modal-chi-tiet-bb__info-item">
              <label>SĐT Khách:</label>
              <span>{bienBan.SoDienThoaiKhach}</span>
            </div>
            <div className="modal-chi-tiet-bb__info-item">
              <label>NVBH:</label>
              <span>{bienBan.TenNVBH}</span>
            </div>
            <div className="modal-chi-tiet-bb__info-item">
              <label>SĐT NVBH:</label>
              <span>{bienBan.SoDienThoaiNVBH || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Thông tin phòng */}
        <div className="modal-chi-tiet-bb__section">
          <h3 className="modal-chi-tiet-bb__section-title">🏠 Thông tin phòng</h3>
          <div className="modal-chi-tiet-bb__info-grid">
            <div className="modal-chi-tiet-bb__info-item">
              <label>Phòng:</label>
              <span>{bienBan.TenPhong}</span>
            </div>
            <div className="modal-chi-tiet-bb__info-item">
              <label>Dự án:</label>
              <span>{bienBan.TenDuAn}</span>
            </div>
            <div className="modal-chi-tiet-bb__info-item">
              <label>Địa chỉ:</label>
              <span>{bienBan.DiaChiDuAn}</span>
            </div>
          </div>
        </div>

        {/* Ghi chú */}
        {bienBan.GhiChu && (
          <div className="modal-chi-tiet-bb__section">
            <h3 className="modal-chi-tiet-bb__section-title">📝 Ghi chú</h3>
            <div className="modal-chi-tiet-bb__ghi-chu">
              {bienBan.GhiChu}
            </div>
          </div>
        )}

        {/* Chữ ký */}
        {(bienBan.ChuKyKhach || bienBan.ChuKyNVBH) && (
          <div className="modal-chi-tiet-bb__section">
            <h3 className="modal-chi-tiet-bb__section-title">✍️ Chữ ký</h3>
            <div className="modal-chi-tiet-bb__chu-ky-grid">
              {bienBan.ChuKyKhach && (
                <div className="modal-chi-tiet-bb__chu-ky-item">
                  <label>Khách hàng:</label>
                  <div className="modal-chi-tiet-bb__chu-ky">{bienBan.ChuKyKhach}</div>
                  <div className="modal-chi-tiet-bb__chu-ky-time">
                    {bienBan.ChuKyKhachLuc 
                      ? new Date(bienBan.ChuKyKhachLuc).toLocaleString('vi-VN')
                      : 'N/A'}
                  </div>
                </div>
              )}
              {bienBan.ChuKyNVBH && (
                <div className="modal-chi-tiet-bb__chu-ky-item">
                  <label>NVBH:</label>
                  <div className="modal-chi-tiet-bb__chu-ky">{bienBan.ChuKyNVBH}</div>
                  <div className="modal-chi-tiet-bb__chu-ky-time">
                    {bienBan.ChuKyNVBHLuc 
                      ? new Date(bienBan.ChuKyNVBHLuc).toLocaleString('vi-VN')
                      : 'N/A'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="modal-chi-tiet-bb__actions">
          <button
            className="operator-btn operator-btn--secondary"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    );
  };

  return (
    <ModalOperator
      isOpen={true}
      onClose={onClose}
      title={`👁️ Chi tiết Biên bản #${bienBanId}`}
      size="large"
    >
      {renderContent()}
    </ModalOperator>
  );
};

export default ModalChiTietBienBan;

