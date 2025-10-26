import React from 'react';
import { Link } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { useDashboardData } from '../../hooks/useDashboardData';
import './Dashboard.css';

// React Icons
import {
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineCurrencyDollar,
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineEye
} from 'react-icons/hi2';

/**
 * UC-PROJ-03: Dashboard tổng quan cho Chủ dự án
 * Redesigned với clean layout, focus vào metrics quan trọng
 * Updated: Sử dụng React Query cho data fetching
 */
function DashboardChuDuAn() {
  // React Query hook - tự động handle loading, error, caching
  const { data: dashboardData, isLoading: loading, error, refetch } = useDashboardData();

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
            <p className="cda-empty-description">{error?.message || 'Không thể tải dữ liệu dashboard'}</p>
            <button onClick={() => refetch()} className="cda-btn cda-btn-primary">
              Thử lại
            </button>
          </div>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      {/* Page Header với gradient background */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-text">
            <h1 className="dashboard-title">
              Chào mừng trở lại! 👋
            </h1>
            <p className="dashboard-subtitle">
              Quản lý dự án của bạn một cách hiệu quả
            </p>
          </div>
          
          {/* Thao tác nhanh - Đưa lên đầu */}
          <div className="quick-actions-hero">
            <Link to="/chu-du-an/tao-tin-dang" className="quick-action-btn primary">
              <div className="quick-action-icon">
                <HiOutlinePlus />
              </div>
              <div className="quick-action-text">
                <span className="quick-action-title">Tạo tin đăng</span>
                <span className="quick-action-desc">Đăng phòng mới</span>
              </div>
            </Link>

            <Link to="/chu-du-an/tin-dang" className="quick-action-btn secondary">
              <div className="quick-action-icon">
                <HiOutlineDocumentText />
              </div>
              <div className="quick-action-text">
                <span className="quick-action-title">Quản lý tin</span>
                <span className="quick-action-desc">Xem tất cả</span>
              </div>
            </Link>

            <Link to="/chu-du-an/bao-cao" className="quick-action-btn tertiary">
              <div className="quick-action-icon">
                <HiOutlineChartBar />
              </div>
              <div className="quick-action-text">
                <span className="quick-action-title">Báo cáo</span>
                <span className="quick-action-desc">Hiệu suất</span>
              </div>
            </Link>

            <Link to="/chu-du-an/cuoc-hen" className="quick-action-btn quaternary">
              <div className="quick-action-icon">
                <span style={{ fontSize: '1.25rem' }}>📅</span>
              </div>
              <div className="quick-action-text">
                <span className="quick-action-title">Cuộc hẹn</span>
                <span className="quick-action-desc">Lịch hẹn</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid - Enhanced (EMERALD NOIR THEME) */}
      <div className="cda-metrics-grid enhanced">
        <div className="cda-metric-card emerald enhanced">
          <div className="metric-card-background"></div>
          <div className="cda-metric-icon pulse">
            <HiOutlineChartBar />
          </div>
          <div className="metric-card-content">
            <div className="cda-metric-label">Tổng tin đăng</div>
            <div className="cda-metric-value">{formatNumber(dashboardData?.tongTinDang || 0)}</div>
            <div className="cda-metric-change">
              <HiOutlineArrowTrendingUp style={{ width: '16px', height: '16px' }} />
              <span>{formatNumber(dashboardData?.tinDangChoDuyet || 0)} chờ duyệt</span>
            </div>
          </div>
        </div>

        <div className="cda-metric-card teal enhanced">
          <div className="metric-card-background"></div>
          <div className="cda-metric-icon pulse">
            <HiOutlineArrowTrendingUp />
          </div>
          <div className="metric-card-content">
            <div className="cda-metric-label">Đang hoạt động</div>
            <div className="cda-metric-value">{formatNumber(dashboardData?.tinDangDangHoatDong || 0)}</div>
            <div className="cda-metric-change">
              <HiOutlineArrowTrendingUp style={{ width: '16px', height: '16px' }} />
              <span>{formatNumber(dashboardData?.luotXemHomNay || 0)} lượt xem hôm nay</span>
            </div>
          </div>
        </div>

        <div className="cda-metric-card green enhanced">
          <div className="metric-card-background"></div>
          <div className="cda-metric-icon pulse">
            <HiOutlineHome />
          </div>
          <div className="metric-card-content">
            <div className="cda-metric-label">Cuộc hẹn sắp tới</div>
            <div className="cda-metric-value">{formatNumber(dashboardData?.cuocHenSapToi || 0)}</div>
            <div className="cda-metric-change">
              <HiOutlineArrowTrendingUp style={{ width: '16px', height: '16px' }} />
              <span>trong 7 ngày tới</span>
            </div>
          </div>
        </div>

        <div className="cda-metric-card gold enhanced">
          <div className="metric-card-background"></div>
          <div className="cda-metric-icon pulse">
            <HiOutlineCurrencyDollar />
          </div>
          <div className="metric-card-content">
            <div className="cda-metric-label">Doanh thu tháng này</div>
            <div className="cda-metric-value" style={{ fontSize: '1.5rem' }}>
              {formatCurrency(dashboardData?.doanhThuThang || 0)}
            </div>
            <div className="cda-metric-change">
              <HiOutlineHome style={{ width: '16px', height: '16px' }} />
              <span>{formatNumber(dashboardData?.tongPhongTrong || 0)} phòng trống</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Mới: Biểu đồ và Thống kê Chi tiết */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Biểu đồ Doanh thu 6 tháng */}
        <div className="cda-card" style={{ gridColumn: 'span 2' }}>
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Doanh thu 6 tháng gần nhất</h3>
              <p className="cda-card-subtitle">Xu hướng doanh thu và số lượng hợp đồng</p>
            </div>
          </div>
          <div className="cda-card-body">
            <div className="chart-revenue-wrapper">
              <div className="chart-revenue-bars">
                {[
                  { month: 'T5', revenue: 85, contracts: 12, label: 'Tháng 5' },
                  { month: 'T6', revenue: 92, contracts: 15, label: 'Tháng 6' },
                  { month: 'T7', revenue: 78, contracts: 11, label: 'Tháng 7' },
                  { month: 'T8', revenue: 95, contracts: 16, label: 'Tháng 8' },
                  { month: 'T9', revenue: 88, contracts: 14, label: 'Tháng 9' },
                  { month: 'T10', revenue: 100, contracts: 18, label: 'Tháng 10' }
                ].map((data) => (
                  <div key={data.month} className="chart-revenue-bar-wrapper">
                    <div className="chart-revenue-bar" style={{ height: `${data.revenue}%` }}>
                      <div className="chart-revenue-bar-fill"></div>
                      <div className="chart-revenue-tooltip">
                        <strong>{data.label}</strong>
                        <div>Doanh thu: {formatCurrency(data.revenue * 1500000)}</div>
                        <div>Hợp đồng: {data.contracts}</div>
                      </div>
                    </div>
                    <div className="chart-revenue-label">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tỷ lệ lấp đầy phòng */}
        <div className="cda-card">
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Tỷ lệ lấp đầy</h3>
              <p className="cda-card-subtitle">Hiện trạng phòng trọ</p>
            </div>
          </div>
          <div className="cda-card-body">
            <div className="occupancy-circle-wrapper">
              <svg viewBox="0 0 200 200" className="occupancy-circle">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="90" 
                  fill="none" 
                  stroke="#14532D" 
                  strokeWidth="20"
                  strokeDasharray={`${((dashboardData?.tongPhong - dashboardData?.tongPhongTrong) / dashboardData?.tongPhong * 565) || 0} 565`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="occupancy-circle-fill"
                />
                <text x="100" y="95" textAnchor="middle" className="occupancy-percent">
                  {Math.round(((dashboardData?.tongPhong - dashboardData?.tongPhongTrong) / dashboardData?.tongPhong * 100) || 0)}%
                </text>
                <text x="100" y="115" textAnchor="middle" className="occupancy-label">
                  Đã thuê
                </text>
              </svg>
              <div className="occupancy-stats">
                <div className="occupancy-stat-item">
                  <div className="occupancy-stat-dot" style={{ background: '#14532D' }}></div>
                  <span>Đã thuê: {formatNumber((dashboardData?.tongPhong - dashboardData?.tongPhongTrong) || 0)}</span>
                </div>
                <div className="occupancy-stat-item">
                  <div className="occupancy-stat-dot" style={{ background: '#e5e7eb' }}></div>
                  <span>Còn trống: {formatNumber(dashboardData?.tongPhongTrong || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Mới: Phân bố trạng thái và Hiệu suất */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Phân bố trạng thái tin đăng */}
        <div className="cda-card">
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Phân bố trạng thái</h3>
              <p className="cda-card-subtitle">Tình trạng tin đăng</p>
            </div>
          </div>
          <div className="cda-card-body">
            <div className="status-distribution">
              <div className="status-bar-item">
                <div className="status-bar-label">
                  <span className="status-dot" style={{ background: '#10b981' }}></span>
                  <span>Đang hoạt động</span>
                </div>
                <div className="status-bar-value">{formatNumber(dashboardData?.tinDangDangHoatDong || 0)}</div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill" 
                    style={{ 
                      width: `${((dashboardData?.tinDangDangHoatDong / dashboardData?.tongTinDang) * 100) || 0}%`,
                      background: 'linear-gradient(90deg, #10b981, #059669)'
                    }}
                  ></div>
                </div>
              </div>

              <div className="status-bar-item">
                <div className="status-bar-label">
                  <span className="status-dot" style={{ background: '#D4AF37' }}></span>
                  <span>Chờ duyệt</span>
                </div>
                <div className="status-bar-value">{formatNumber(dashboardData?.tinDangChoDuyet || 0)}</div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill" 
                    style={{ 
                      width: `${((dashboardData?.tinDangChoDuyet / dashboardData?.tongTinDang) * 100) || 0}%`,
                      background: 'linear-gradient(90deg, #D4AF37, #B68C3A)'
                    }}
                  ></div>
                </div>
              </div>

              <div className="status-bar-item">
                <div className="status-bar-label">
                  <span className="status-dot" style={{ background: '#6b7280' }}></span>
                  <span>Nháp</span>
                </div>
                <div className="status-bar-value">{formatNumber(dashboardData?.tinDangNhap || 0)}</div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill" 
                    style={{ 
                      width: `${((dashboardData?.tinDangNhap / dashboardData?.tongTinDang) * 100) || 0}%`,
                      background: 'linear-gradient(90deg, #6b7280, #4b5563)'
                    }}
                  ></div>
                </div>
              </div>

              <div className="status-bar-item">
                <div className="status-bar-label">
                  <span className="status-dot" style={{ background: '#ef4444' }}></span>
                  <span>Tạm ngưng</span>
                </div>
                <div className="status-bar-value">{formatNumber(dashboardData?.tinDangTamNgung || 0)}</div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill" 
                    style={{ 
                      width: `${((dashboardData?.tinDangTamNgung / dashboardData?.tongTinDang) * 100) || 0}%`,
                      background: 'linear-gradient(90deg, #ef4444, #dc2626)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê tương tác */}
        <div className="cda-card">
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Tương tác người dùng</h3>
              <p className="cda-card-subtitle">Lượt xem và yêu thích</p>
            </div>
          </div>
          <div className="cda-card-body">
            <div className="interaction-stats">
              <div className="interaction-stat-card">
                <div className="interaction-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)' }}>
                  <HiOutlineEye style={{ color: '#3b82f6' }} />
                </div>
                <div className="interaction-stat-content">
                  <div className="interaction-stat-value">{formatNumber(dashboardData?.tongLuotXem || 0)}</div>
                  <div className="interaction-stat-label">Tổng lượt xem</div>
                  <div className="interaction-stat-change positive">
                    <HiOutlineArrowTrendingUp />
                    <span>{formatNumber(dashboardData?.luotXemHomNay || 0)} lượt hôm nay</span>
                  </div>
                </div>
              </div>

              <div className="interaction-stat-card">
                <div className="interaction-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                  <span style={{ fontSize: '1.5rem' }}>❤️</span>
                </div>
                <div className="interaction-stat-content">
                  <div className="interaction-stat-value">{formatNumber(dashboardData?.tongYeuThich || 0)}</div>
                  <div className="interaction-stat-label">Lượt yêu thích</div>
                  <div className="interaction-stat-change positive">
                    <HiOutlineArrowTrendingUp />
                    <span>{formatNumber(dashboardData?.yeuThichHomNay || 0)} lượt hôm nay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards - Existing */}
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
            {Array.isArray(dashboardData?.tinDangGanDay) && dashboardData.tinDangGanDay.length > 0 ? (
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
            {Array.isArray(dashboardData?.cuocHenSapToiList) && dashboardData.cuocHenSapToiList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dashboardData.cuocHenSapToiList.slice(0, 5).map((cuocHen) => (
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
    </ChuDuAnLayout>
  );
}

export default DashboardChuDuAn;