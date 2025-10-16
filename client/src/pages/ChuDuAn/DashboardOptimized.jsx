import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { DashboardService } from '../../services/ChuDuAnService';
import './DashboardOptimized.css';

// React Icons - Light theme compatible
import {
  HiOutlineHome,
  HiOutlineCurrencyDollar,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineChartBar,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle
} from 'react-icons/hi2';

/**
 * UC-PROJ-03: Dashboard tối ưu cho Chủ dự án
 * - Light Glass Morphism Theme (đồng bộ với hệ thống)
 * - Layout tối ưu giống Dashboard cũ
 * - Animations mượt mà với Framer Motion
 * - Không dependency Recharts (dùng CSS thuần)
 */
function DashboardOptimized() {
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
      // Mock data cho development
      setDashboardData({
        tongTinDang: 24,
        tinDangMoi: 3,
        phongTrong: 18,
        tongPhong: 45,
        luotXem: 1248,
        luotXemTangGiam: 12.5,
        doanhThu: 125500000,
        doanhThuTangGiam: 8.3,
        cuocHenSapToi: [
          { id: 1, ngay: '2025-10-08', gio: '10:00', khachHang: 'Nguyễn Văn A', tinDang: 'Phòng trọ gần ĐH Bách Khoa', trangThai: 'XacNhan' },
          { id: 2, ngay: '2025-10-08', gio: '14:30', khachHang: 'Trần Thị B', tinDang: 'Căn hộ mini Q7', trangThai: 'ChoXacNhan' },
          { id: 3, ngay: '2025-10-09', gio: '09:00', khachHang: 'Lê Minh C', tinDang: 'Phòng trọ Quận 1', trangThai: 'XacNhan' },
        ],
        trangThaiTinDang: {
          hoatDong: 18,
          choDuyet: 3,
          tuChoi: 2,
          tamNgung: 1
        }
      });
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
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + ' tỷ';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + ' triệu';
    }
    return num.toLocaleString('vi-VN') + ' ₫';
  };

  const tinhTyLePhongTrong = () => {
    if (!dashboardData) return 0;
    const { phongTrong = 0, tongPhong = 1 } = dashboardData;
    return Math.round((phongTrong / tongPhong) * 100);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
  };

  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="dash-loading">
          <div className="dash-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </ChuDuAnLayout>
    );
  }

  if (error && !dashboardData) {
    return (
      <ChuDuAnLayout>
        <div className="dash-error-state">
          <div className="dash-error-icon">⚠️</div>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={layDuLieuDashboard} className="dash-btn dash-btn-primary">
            Thử lại
          </button>
        </div>
      </ChuDuAnLayout>
    );
  }

  const {
    tongTinDang = 0,
    tinDangMoi = 0,
    phongTrong = 0,
    tongPhong = 0,
    luotXem = 0,
    luotXemTangGiam = 0,
    doanhThu = 0,
    doanhThuTangGiam = 0,
    cuocHenSapToi = [],
    trangThaiTinDang = {}
  } = dashboardData || {};

  const tyLePhongTrong = tinhTyLePhongTrong();

  return (
    <ChuDuAnLayout>
      <motion.div
        className="dash-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="dash-header" variants={itemVariants}>
          <div className="dash-header-content">
            <h1 className="dash-title">Tổng quan</h1>
            <p className="dash-subtitle">Chào mừng trở lại! Đây là bảng điều khiển của bạn.</p>
          </div>
          <Link to="/chu-du-an/tao-tin-dang" className="dash-btn dash-btn-primary">
            <HiOutlinePlus />
            <span>Tạo tin đăng mới</span>
          </Link>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div className="dash-metrics-grid" variants={itemVariants}>
          {/* Metric 1: Tổng tin đăng */}
          <div className="dash-metric-card dash-card-violet">
            <div className="dash-metric-icon">
              <HiOutlineHome />
            </div>
            <div className="dash-metric-content">
              <div className="dash-metric-label">Tổng tin đăng</div>
              <div className="dash-metric-value">{formatNumber(tongTinDang)}</div>
              {tinDangMoi > 0 && (
                <div className="dash-metric-subtitle">{tinDangMoi} chờ duyệt</div>
              )}
            </div>
          </div>

          {/* Metric 2: Phòng trống */}
          <div className="dash-metric-card dash-card-emerald">
            <div className="dash-metric-icon">
              <HiOutlineCheckCircle />
            </div>
            <div className="dash-metric-content">
              <div className="dash-metric-label">Phòng trống</div>
              <div className="dash-metric-value">
                {formatNumber(phongTrong)}/{formatNumber(tongPhong)}
              </div>
              <div className="dash-metric-subtitle">Tỷ lệ {tyLePhongTrong}%</div>
            </div>
          </div>

          {/* Metric 3: Lượt xem */}
          <div className="dash-metric-card dash-card-blue">
            <div className="dash-metric-icon">
              <HiOutlineEye />
            </div>
            <div className="dash-metric-content">
              <div className="dash-metric-label">Lượt xem</div>
              <div className="dash-metric-value">{formatNumber(luotXem)}</div>
              <div className={`dash-metric-trend ${luotXemTangGiam >= 0 ? 'up' : 'down'}`}>
                {luotXemTangGiam >= 0 ? <HiOutlineArrowTrendingUp /> : <HiOutlineArrowTrendingDown />}
                <span>{Math.abs(luotXemTangGiam).toFixed(1)}% so tháng trước</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Doanh thu */}
          <div className="dash-metric-card dash-card-amber">
            <div className="dash-metric-icon">
              <HiOutlineCurrencyDollar />
            </div>
            <div className="dash-metric-content">
              <div className="dash-metric-label">Doanh thu</div>
              <div className="dash-metric-value">{formatCurrency(doanhThu)}</div>
              <div className={`dash-metric-trend ${doanhThuTangGiam >= 0 ? 'up' : 'down'}`}>
                {doanhThuTangGiam >= 0 ? <HiOutlineArrowTrendingUp /> : <HiOutlineArrowTrendingDown />}
                <span>{Math.abs(doanhThuTangGiam).toFixed(1)}% so tháng trước</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid - 2 columns */}
        <div className="dash-content-grid">
          {/* Left Column: Cuộc hẹn sắp tới */}
          <motion.div className="dash-card" variants={itemVariants}>
            <div className="dash-card-header">
              <div className="dash-card-title">
                <HiOutlineCalendar />
                <span>Cuộc hẹn sắp tới</span>
              </div>
              <Link to="/chu-du-an/cuoc-hen" className="dash-link">
                Xem tất cả →
              </Link>
            </div>
            <div className="dash-card-body">
              {cuocHenSapToi.length === 0 ? (
                <div className="dash-empty-state">
                  <div className="dash-empty-icon">📅</div>
                  <p>Chưa có cuộc hẹn nào</p>
                </div>
              ) : (
                <div className="dash-appointment-list">
                  {cuocHenSapToi.map((hen) => (
                    <div key={hen.id} className="dash-appointment-item">
                      <div className="dash-appointment-date">
                        <div className="dash-date-day">{new Date(hen.ngay).getDate()}</div>
                        <div className="dash-date-month">Th{new Date(hen.ngay).getMonth() + 1}</div>
                      </div>
                      <div className="dash-appointment-info">
                        <div className="dash-appointment-title">{hen.tinDang}</div>
                        <div className="dash-appointment-meta">
                          <span>👤 {hen.khachHang}</span>
                          <span>🕐 {hen.gio}</span>
                        </div>
                      </div>
                      <div className={`dash-appointment-status status-${hen.trangThai.toLowerCase()}`}>
                        {hen.trangThai === 'XacNhan' ? (
                          <><HiOutlineCheckCircle /> Xác nhận</>
                        ) : (
                          <><HiOutlineClock /> Chờ xác nhận</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Trạng thái tin đăng */}
          <motion.div className="dash-card" variants={itemVariants}>
            <div className="dash-card-header">
              <div className="dash-card-title">
                <HiOutlineChartBar />
                <span>Trạng thái tin đăng</span>
              </div>
            </div>
            <div className="dash-card-body">
              <div className="dash-status-list">
                {/* Hoạt động */}
                <div className="dash-status-item">
                  <div className="dash-status-label">
                    <div className="dash-status-dot status-active"></div>
                    <span>Hoạt động</span>
                  </div>
                  <div className="dash-status-value">{trangThaiTinDang.hoatDong || 0}</div>
                  <div className="dash-status-bar">
                    <div
                      className="dash-status-bar-fill status-active"
                      style={{ width: `${(trangThaiTinDang.hoatDong / tongTinDang) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Chờ duyệt */}
                <div className="dash-status-item">
                  <div className="dash-status-label">
                    <div className="dash-status-dot status-pending"></div>
                    <span>Chờ duyệt</span>
                  </div>
                  <div className="dash-status-value">{trangThaiTinDang.choDuyet || 0}</div>
                  <div className="dash-status-bar">
                    <div
                      className="dash-status-bar-fill status-pending"
                      style={{ width: `${(trangThaiTinDang.choDuyet / tongTinDang) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Từ chối */}
                <div className="dash-status-item">
                  <div className="dash-status-label">
                    <div className="dash-status-dot status-rejected"></div>
                    <span>Từ chối</span>
                  </div>
                  <div className="dash-status-value">{trangThaiTinDang.tuChoi || 0}</div>
                  <div className="dash-status-bar">
                    <div
                      className="dash-status-bar-fill status-rejected"
                      style={{ width: `${(trangThaiTinDang.tuChoi / tongTinDang) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tạm ngừng */}
                <div className="dash-status-item">
                  <div className="dash-status-label">
                    <div className="dash-status-dot status-paused"></div>
                    <span>Tạm ngừng</span>
                  </div>
                  <div className="dash-status-value">{trangThaiTinDang.tamNgung || 0}</div>
                  <div className="dash-status-bar">
                    <div
                      className="dash-status-bar-fill status-paused"
                      style={{ width: `${(trangThaiTinDang.tamNgung / tongTinDang) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </ChuDuAnLayout>
  );
}

export default DashboardOptimized;
