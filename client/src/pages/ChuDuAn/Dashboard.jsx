import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { DashboardService } from '../../services/ChuDuAnService';

// React Icons
import {
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp,
  HiOutlineCurrencyDollar,
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlinePlus
} from 'react-icons/hi2';

/**
 * UC-PROJ-03: Dashboard tổng quan cho Chủ dự án
 * Redesigned với clean layout, focus vào metrics quan trọng
 */
function DashboardChuDuAn() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    layDuLieuDashboard();
  }, []);

  const layDuLieuDashboard = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.layDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value = 0) => {
    return Number(value || 0).toLocaleString('vi-VN');
  };

  const formatCurrency = (value = 0) => {
    const num = Number(value || 0);
    if (!num) return '0 ₫';
    return num.toLocaleString('vi-VN') + ' ₫';
  };

  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="cda-loading">
          <div className="cda-spinner"></div>
          <p className="cda-loading-text">Đang tải dữ liệu...</p>
        </div>
      </ChuDuAnLayout>
    );
  }

  if (error) {
    return (
      <ChuDuAnLayout>
        <div className="cda-card">
          <div className="cda-empty-state">
            <div className="cda-empty-icon">⚠️</div>
            <h3 className="cda-empty-title">Có lỗi xảy ra</h3>
            <p className="cda-empty-description">{error}</p>
            <button onClick={layDuLieuDashboard} className="cda-btn cda-btn-primary">
              Thử lại
            </button>
          </div>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      {/* Page Header */}
      <div className="cda-flex cda-justify-between cda-items-center cda-mb-lg">
        <div>
          <h1 className="cda-text-3xl cda-font-bold" style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>
            Tổng quan
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Chào mừng trở lại! Đây là bảng điều khiển của bạn.
          </p>
        </div>
        <Link to="/chu-du-an/tao-tin-dang" className="cda-btn cda-btn-primary cda-btn-lg">
          <span>➕</span>
          <span>Tạo tin đăng mới</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="cda-metrics-grid">
        <div className="cda-metric-card violet">
          <div className="cda-metric-icon">
            <HiOutlineChartBar />
          </div>
          <div className="cda-metric-value">{formatNumber(dashboardData?.tongTinDang || 0)}</div>
          <div className="cda-metric-label">Tổng tin đăng</div>
          <div className="cda-metric-change">
            <HiOutlineArrowTrendingUp style={{ width: '16px', height: '16px' }} />
            <span>{formatNumber(dashboardData?.tinDangChoDuyet || 0)} chờ duyệt</span>
          </div>
        </div>

        <div className="cda-metric-card blue">
          <div className="cda-metric-icon">
            <HiOutlineArrowTrendingUp />
          </div>
          <div className="cda-metric-value">{formatNumber(dashboardData?.tinDangDangHoatDong || 0)}</div>
          <div className="cda-metric-label">Đang hoạt động</div>
          <div className="cda-metric-change">
            <HiOutlineArrowTrendingUp style={{ width: '16px', height: '16px' }} />
            <span>{formatNumber(dashboardData?.luotXemHomNay || 0)} lượt xem hôm nay</span>
          </div>
        </div>

        <div className="cda-metric-card green">
          <div className="cda-metric-icon">
            <HiOutlineHome />
          </div>
          <div className="cda-metric-value">{formatNumber(dashboardData?.cuocHenSapToi?.length || 0)}</div>
          <div className="cda-metric-label">Cuộc hẹn sắp tới</div>
          <div className="cda-metric-change">
            <HiOutlineArrowTrendingUp style={{ width: '16px', height: '16px' }} />
            <span>trong 7 ngày tới</span>
          </div>
        </div>

        <div className="cda-metric-card orange">
          <div className="cda-metric-icon">
            <HiOutlineCurrencyDollar />
          </div>
          <div className="cda-metric-value" style={{ fontSize: '1.5rem' }}>
            {formatCurrency(dashboardData?.doanhThuThang || 0)}
          </div>
          <div className="cda-metric-label">Doanh thu tháng này</div>
          <div className="cda-metric-change">
            <HiOutlineHome style={{ width: '16px', height: '16px' }} />
            <span>{formatNumber(dashboardData?.tongPhongTrong || 0)} phòng trống</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Tin đăng gần đây */}
        <div className="cda-card">
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Tin đăng gần đây</h3>
              <p className="cda-card-subtitle">5 tin đăng mới nhất</p>
            </div>
            <Link to="/chu-du-an/tin-dang" className="cda-btn cda-btn-sm cda-btn-ghost">
              Xem tất cả →
            </Link>
          </div>
          <div className="cda-card-body">
            {dashboardData?.tinDangGanDay?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dashboardData.tinDangGanDay.slice(0, 5).map((tin) => (
                  <div key={tin.TinDangID} style={{ 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                        {tin.TieuDe}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {formatCurrency(tin.Gia)}
                      </div>
                    </div>
                    <span className={`cda-badge cda-badge-${
                      tin.TrangThai === 'DaDang' ? 'success' :
                      tin.TrangThai === 'ChoDuyet' ? 'warning' :
                      tin.TrangThai === 'Nhap' ? 'gray' : 'info'
                    }`}>
                      {tin.TrangThai === 'DaDang' ? 'Đang đăng' :
                       tin.TrangThai === 'ChoDuyet' ? 'Chờ duyệt' :
                       tin.TrangThai === 'Nhap' ? 'Nháp' : tin.TrangThai}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cda-empty-state">
                <div className="cda-empty-icon">
                  <HiOutlineDocumentText />
                </div>
                <p className="cda-empty-description">Chưa có tin đăng nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Cuộc hẹn sắp tới */}
        <div className="cda-card">
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Cuộc hẹn sắp tới</h3>
              <p className="cda-card-subtitle">Lịch trong 7 ngày</p>
            </div>
            <Link to="/chu-du-an/cuoc-hen" className="cda-btn cda-btn-sm cda-btn-ghost">
              Xem lịch →
            </Link>
          </div>
          <div className="cda-card-body">
            {dashboardData?.cuocHenSapToi?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dashboardData.cuocHenSapToi.slice(0, 5).map((cuocHen) => (
                  <div key={cuocHen.CuocHenID} style={{ 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                          {cuocHen.TenKhachHang || 'Khách hàng'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {cuocHen.TenPhong || 'Phòng'}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 500 }}>
                        {cuocHen.ThoiGianHen ? new Date(cuocHen.ThoiGianHen).toLocaleDateString('vi-VN') : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cda-empty-state">
                <div className="cda-empty-icon">📅</div>
                <p className="cda-empty-description">Không có cuộc hẹn nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cda-card">
        <div className="cda-card-body">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            Thao tác nhanh
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/chu-du-an/tao-tin-dang" className="cda-btn cda-btn-success">
              <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
              <span>Tạo tin đăng</span>
            </Link>
            <Link to="/chu-du-an/tin-dang" className="cda-btn cda-btn-secondary">
              <HiOutlineDocumentText style={{ width: '18px', height: '18px' }} />
              <span>Quản lý tin đăng</span>
            </Link>
            <Link to="/chu-du-an/bao-cao" className="cda-btn cda-btn-secondary">
              <HiOutlineChartBar style={{ width: '18px', height: '18px' }} />
              <span>Xem báo cáo</span>
            </Link>
            <Link to="/chu-du-an/cuoc-hen" className="cda-btn cda-btn-secondary">
              <span>📅</span>
              <span>Cuộc hẹn</span>
            </Link>
          </div>
        </div>
      </div>
    </ChuDuAnLayout>
  );
}

export default DashboardChuDuAn;