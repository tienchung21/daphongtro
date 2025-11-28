import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService } from '../../services/ChuDuAnService';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
import './QuanLyTinDang.css'; // Tái sử dụng CSS
import { getStaticUrl } from '../../config/api';

/**
 * Trang Quản Lý Tin Nháp
 * Route: /chu-du-an/tin-nhap
 * 
 * Features:
 * - Danh sách tin đăng ở trạng thái "Nhap"
 * - Tiếp tục chỉnh sửa
 * - Xóa nháp
 * - Xem trước
 */
const QuanLyNhap = () => {
  const navigate = useNavigate();
  const [tinNhaps, setTinNhaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    layDanhSachTinNhap();
  }, []);

  const layDanhSachTinNhap = async () => {
    try {
      setLoading(true);
      const response = await TinDangService.layDanhSachTinNhap();
      
      if (response.success) {
        setTinNhaps(response.data);
      }
    } catch (error) {
      console.error('Lỗi load tin nháp:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tinDangId) => {
    navigate(`/chu-du-an/chinh-sua-tin-dang/${tinDangId}`);
  };

  const handleDelete = async (tinDangId) => {
    if (!confirm('Bạn có chắc muốn xóa tin nháp này?')) return;

    try {
      // TODO: Implement delete API
      alert('Chức năng xóa đang được phát triển');
    } catch (error) {
      console.error('Lỗi xóa:', error);
      alert('Lỗi xóa tin nháp');
    }
  };

  const formatCurrency = (value) => {
    return parseInt(value || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="qtd-container">
          <div className="qtd-loading">
            <div className="qtd-spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      <div className="qtd-container">
        <div className="qtd-header">
          <div>
            <h1>📝 Tin Nháp</h1>
            <p>Quản lý các tin đăng chưa hoàn thành</p>
          </div>
          <Link to="/chu-du-an/tao-tin-dang" className="qtd-btn-primary">
            + Tạo tin mới
          </Link>
        </div>

        {tinNhaps.length === 0 ? (
          <div className="qtd-empty">
            <div className="qtd-empty-icon">📝</div>
            <h3>Chưa có tin nháp</h3>
            <p>Các tin đăng lưu nháp sẽ xuất hiện tại đây</p>
            <Link to="/chu-du-an/tao-tin-dang" className="qtd-btn-primary">
              Tạo tin đăng mới
            </Link>
          </div>
        ) : (
          <div className="qtd-grid">
            {tinNhaps.map(tin => {
              let anhDauTien = null;
              try {
                if (tin.URL) {
                  const parsed = JSON.parse(tin.URL);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    anhDauTien = getStaticUrl(parsed[0]);
                  }
                }
              } catch (e) {
                console.error('Lỗi parse URL:', e);
                if (typeof tin.URL === 'string') {
                  anhDauTien = getStaticUrl(tin.URL);
                }
              }
              
              return (
                <div key={tin.TinDangID} className="qtd-card qtd-card-draft">
                  <div className="qtd-card-badge qtd-badge-draft">
                    Nháp
                  </div>

                  {anhDauTien ? (
                    <img 
                      src={anhDauTien} 
                      alt={tin.TieuDe}
                      className="qtd-card-image"
                    />
                  ) : (
                    <div className="qtd-card-image-placeholder">
                      📷 Chưa có ảnh
                    </div>
                  )}

                  <div className="qtd-card-content">
                    <h3 className="qtd-card-title">
                      {tin.TieuDe || '(Chưa có tiêu đề)'}
                    </h3>

                    <div className="qtd-card-meta">
                      <div className="qtd-meta-item">
                        <span className="qtd-meta-icon">💰</span>
                        <span className="qtd-meta-text">
                          {tin.Gia ? formatCurrency(tin.Gia) : 'Chưa nhập giá'}
                        </span>
                      </div>
                      <div className="qtd-meta-item">
                        <span className="qtd-meta-icon">📐</span>
                        <span className="qtd-meta-text">
                          {tin.DienTich ? `${tin.DienTich} m²` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="qtd-card-info">
                      <p className="qtd-card-date">
                        Cập nhật: {formatDate(tin.CapNhatLuc)}
                      </p>
                    </div>

                    <div className="qtd-card-actions">
                      <button
                        className="qtd-btn-icon qtd-btn-edit"
                        onClick={() => handleEdit(tin.TinDangID)}
                        title="Tiếp tục chỉnh sửa"
                      >
                        <HiOutlinePencil />
                        Chỉnh sửa
                      </button>
                      <button
                        className="qtd-btn-icon qtd-btn-view"
                        onClick={() => navigate(`/chu-du-an/tin-dang/${tin.TinDangID}`)}
                        title="Xem trước"
                      >
                        <HiOutlineEye />
                      </button>
                      <button
                        className="qtd-btn-icon qtd-btn-delete"
                        onClick={() => handleDelete(tin.TinDangID)}
                        title="Xóa nháp"
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ChuDuAnLayout>
  );
};

export default QuanLyNhap;
