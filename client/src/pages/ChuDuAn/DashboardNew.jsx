import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { DashboardService } from '../../services/ChuDuAnService';

// Components
import MetricCard from '../../components/ChuDuAn/MetricCard';
const RevenueChart = React.lazy(() => import('../../components/ChuDuAn/Charts/RevenueChart'));

// React Icons
import {
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineBuildingOffice2,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';

import './Dashboard.css';

/**
 * UC-PROJ-03: Dashboard tổng quan cho Chủ dự án
 * Redesigned với Dark Luxury theme, glass morphism, và advanced animations
 */
function DashboardChuDuAn() {
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    layDuLieuDashboard();
    layDuLieuDoanhThu();
  }, [selectedPeriod]);

  const layDuLieuDashboard = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.layDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const layDuLieuDoanhThu = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData = [
        { month: 'T1', revenue: 180, deposits: 45, contracts: 30 },
        { month: 'T2', revenue: 210, deposits: 52, contracts: 35 },
        { month: 'T3', revenue: 250, deposits: 60, contracts: 42 },
        { month: 'T4', revenue: 195, deposits: 48, contracts: 32 },
        { month: 'T5', revenue: 280, deposits: 70, contracts: 50 },
        { month: 'T6', revenue: 320, deposits: 80, contracts: 58 },
      ];
      setRevenueData(mockData);
    } catch (err) {
      console.error('Revenue data error:', err);
    }
  };

  // Chart skeleton loader
  const ChartSkeleton = () => (
    <div className="chart-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-legend"></div>
      </div>
      <div className="skeleton-chart"></div>
    </div>
  );

  // Loading state với animation
  if (loading) {
    return (
      <ChuDuAnLayout>
        <motion.div 
          className="dashboard-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Đang tải dữ liệu dashboard...</p>
        </motion.div>
      </ChuDuAnLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <ChuDuAnLayout>
        <motion.div 
          className="dashboard-error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="error-icon">
            <HiOutlineExclamationCircle className="w-16 h-16" />
          </div>
          <h3 className="error-title">Có lỗi xảy ra</h3>
          <p className="error-message">{error}</p>
          <button 
            onClick={layDuLieuDashboard} 
            className="error-retry-btn"
          >
            Thử lại
          </button>
        </motion.div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      <div className="dashboard-container">
        {/* Page Header với Breadcrumb */}
        <motion.div 
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <div>
              {/* Breadcrumb */}
              <div className="breadcrumb">
                <HiOutlineHome className="breadcrumb-icon" />
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Dashboard</span>
              </div>
              
              {/* Title */}
              <h1 className="page-title">
                Tổng quan
                <motion.span 
                  className="title-accent"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  .
                </motion.span>
              </h1>
              <p className="page-subtitle">
                Theo dõi hiệu suất kinh doanh và các chỉ số quan trọng
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="header-actions">
              <Link to="/chu-du-an/tao-tin-dang" className="action-btn action-btn-primary">
                <HiOutlinePlus className="btn-icon" />
                <span>Tạo tin đăng</span>
                <div className="btn-glow"></div>
              </Link>
              
              <button className="action-btn action-btn-secondary">
                <HiOutlineChartBar className="btn-icon" />
                <span>Báo cáo</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid - KPIs chính */}
        <div className="metrics-grid">
          <MetricCard
            icon={HiOutlineDocumentText}
            title="Tổng Tin Đăng"
            value={dashboardData?.tongTinDang || 0}
            subtitle={`${dashboardData?.tinDangChoDuyet || 0} chờ duyệt`}
            trend="+5 so với tháng trước"
            trendUp={true}
            color="primary"
            animated={true}
            delay={0}
          />
          
          <MetricCard
            icon={HiOutlineBuildingOffice2}
            title="Phòng Trống"
            value={`${dashboardData?.phongTrong || 28}/${dashboardData?.tongPhong || 150}`}
            subtitle={`${((dashboardData?.phongTrong || 28) / (dashboardData?.tongPhong || 150) * 100).toFixed(1)}% tỷ lệ trống`}
            trend="18.7% khả dụng"
            trendUp={true}
            color="success"
            animated={true}
            delay={100}
          />
          
          <MetricCard
            icon={HiOutlineEye}
            title="Lượt Xem"
            value={dashboardData?.luotXemThang || 12450}
            subtitle="Tháng này"
            trend="+23.5% so tháng trước"
            trendUp={true}
            color="info"
            animated={true}
            delay={200}
          />
          
          <MetricCard
            icon={HiOutlineCurrencyDollar}
            title="Doanh Thu"
            value="₫250.5M"
            subtitle="Tháng này"
            trend="+12.3% so tháng trước"
            trendUp={true}
            color="warning"
            animated={true}
            delay={300}
          />
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Revenue Chart - Full width */}
          <motion.div 
            className="content-card card-full-width"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueChart 
                data={revenueData} 
                height={400}
                showGrid={true}
                showLegend={true}
                gradientColor="primary"
              />
            </Suspense>
          </motion.div>

          {/* Cuộc Hẹn Sắp Tới */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <HiOutlineCalendar className="card-icon" />
                  Cuộc Hẹn Sắp Tới
                </h3>
                <p className="card-subtitle">7 ngày tới</p>
              </div>
              <Link to="/chu-du-an/cuoc-hen" className="card-action-link">
                Xem tất cả →
              </Link>
            </div>
            
            <div className="appointments-list">
              {(dashboardData?.cuocHenSapToi || []).slice(0, 5).map((hen, index) => (
                <motion.div 
                  key={hen.id}
                  className="appointment-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="appointment-date">
                    <span className="date-day">{new Date(hen.thoiGian).getDate()}</span>
                    <span className="date-month">Th{new Date(hen.thoiGian).getMonth() + 1}</span>
                  </div>
                  
                  <div className="appointment-details">
                    <h4 className="appointment-title">{hen.tinDangTitle}</h4>
                    <p className="appointment-customer">{hen.khachHangName}</p>
                    <span className="appointment-time">
                      {new Date(hen.thoiGian).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  <div className={`appointment-status status-${hen.trangThai.toLowerCase()}`}>
                    {hen.trangThai === 'DaXacNhan' ? (
                      <HiOutlineCheckCircle className="status-icon" />
                    ) : (
                      <HiOutlineExclamationCircle className="status-icon" />
                    )}
                  </div>
                </motion.div>
              ))}
              
              {(!dashboardData?.cuocHenSapToi || dashboardData.cuocHenSapToi.length === 0) && (
                <div className="empty-state-small">
                  <HiOutlineCalendar className="empty-icon" />
                  <p>Chưa có cuộc hẹn nào</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Trạng Thái Tin Đăng */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <HiOutlineChartBar className="card-icon" />
                  Trạng Thái Tin Đăng
                </h3>
                <p className="card-subtitle">Phân bổ theo trạng thái</p>
              </div>
            </div>
            
            <div className="status-list">
              <div className="status-item status-active">
                <div className="status-bar" style={{ width: '70%' }}></div>
                <div className="status-info">
                  <span className="status-label">Đang hoạt động</span>
                  <span className="status-count">{dashboardData?.tinDangDangHoatDong || 28}</span>
                </div>
              </div>
              
              <div className="status-item status-pending">
                <div className="status-bar" style={{ width: '15%' }}></div>
                <div className="status-info">
                  <span className="status-label">Chờ duyệt</span>
                  <span className="status-count">{dashboardData?.tinDangChoDuyet || 5}</span>
                </div>
              </div>
              
              <div className="status-item status-rejected">
                <div className="status-bar" style={{ width: '8%' }}></div>
                <div className="status-info">
                  <span className="status-label">Từ chối</span>
                  <span className="status-count">{dashboardData?.tinDangTuChoi || 2}</span>
                </div>
              </div>
              
              <div className="status-item status-paused">
                <div className="status-bar" style={{ width: '7%' }}></div>
                <div className="status-info">
                  <span className="status-label">Tạm ngưng</span>
                  <span className="status-count">{dashboardData?.tinDangTamNgung || 3}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="content-card card-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="card-header">
              <h3 className="card-title">
                <HiOutlineHeart className="card-icon" />
                Tương Tác
              </h3>
            </div>
            
            <div className="stats-grid">
              <div className="stat-item">
                <HiOutlineEye className="stat-icon stat-icon-primary" />
                <div className="stat-content">
                  <span className="stat-value">{(dashboardData?.luotXemThang || 12450).toLocaleString('vi-VN')}</span>
                  <span className="stat-label">Lượt xem</span>
                </div>
              </div>
              
              <div className="stat-item">
                <HiOutlineHeart className="stat-icon stat-icon-danger" />
                <div className="stat-content">
                  <span className="stat-value">{(dashboardData?.luotYeuThich || 312).toLocaleString('vi-VN')}</span>
                  <span className="stat-label">Yêu thích</span>
                </div>
              </div>
              
              <div className="stat-item">
                <HiOutlineCalendar className="stat-icon stat-icon-success" />
                <div className="stat-content">
                  <span className="stat-value">{(dashboardData?.cuocHenThang || 156).toLocaleString('vi-VN')}</span>
                  <span className="stat-label">Cuộc hẹn</span>
                </div>
              </div>
              
              <div className="stat-item">
                <HiOutlineCheckCircle className="stat-icon stat-icon-warning" />
                <div className="stat-content">
                  <span className="stat-value">{(dashboardData?.hopDongThang || 52).toLocaleString('vi-VN')}</span>
                  <span className="stat-label">Hợp đồng</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ChuDuAnLayout>
  );
}

export default DashboardChuDuAn;
