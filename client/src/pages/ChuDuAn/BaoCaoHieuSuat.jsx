import React, { useState } from 'react';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { 
  useBaoCaoChiTiet, 
  useDoanhThuTheoThang, 
  useTopTinDang,
  useConversionRate 
} from '../../hooks/useDashboardData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// React Icons
import {
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineEye,
  HiOutlineArrowDownTray
} from 'react-icons/hi2';

/**
 * UC-PROJ-03: Báo cáo hiệu suất cho Chủ dự án
 * Enhanced với Recharts và React Query
 * Version: 2.0 - Full data integration
 */
function BaoCaoHieuSuat() {
  const [filters, setFilters] = useState({
    tuNgay: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    denNgay: format(new Date(), 'yyyy-MM-dd')
  });

  // React Query hooks - tự động caching và refetching
  const { data: baoCaoData, isLoading: loadingBaoCao, refetch: refetchBaoCao } = useBaoCaoChiTiet(filters);
  const { data: doanhThuData, isLoading: loadingDoanhThu } = useDoanhThuTheoThang();
  const { data: topTinDangData, isLoading: loadingTopTinDang } = useTopTinDang(filters);
  const { data: conversionData, isLoading: loadingConversion } = useConversionRate(filters);

  const loading = loadingBaoCao || loadingDoanhThu || loadingTopTinDang || loadingConversion;

  // Destructure data với fallback
  const baoCao = baoCaoData || {};
  const tongQuan = baoCao.tongQuan || {};
  const cuocHen = baoCao.cuocHen || {};
  const coc = baoCao.coc || {};
  const tuongTac = baoCao.tuongTac || {};

  const chonKhoangThoiGian = (ngay) => {
    const denNgay = new Date();
    const tuNgay = subDays(denNgay, ngay);
    
    setFilters({
      tuNgay: format(tuNgay, 'yyyy-MM-dd'),
      denNgay: format(denNgay, 'yyyy-MM-dd')
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Tổng quan
    const tongQuanData = [
      ['Báo cáo hiệu suất', ''],
      ['Từ ngày', filters.tuNgay],
      ['Đến ngày', filters.denNgay],
      [''],
      ['Chỉ số', 'Giá trị'],
      ['Tổng tin đăng', tongQuan.TongTinDang || 0],
      ['Tin đang hoạt động', tongQuan.TinDangDaDang || 0],
      ['Tổng lượt xem', tuongTac.TongLuotXem || 0],
      ['Tổng lượt thích', tuongTac.TongLuotThich || 0],
      ['Tổng cuộc hẹn', cuocHen.TongCuocHen || 0],
      ['Tổng tiền cọc', coc.TongTienCoc || 0],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(tongQuanData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
    
    // Sheet 2: Top tin đăng
    if (topTinDangData && topTinDangData.length > 0) {
      const topTinData = [
        ['Top tin đăng hiệu suất cao'],
        [''],
        ['Tiêu đề', 'Lượt xem', 'Lượt thích', 'Giá'],
        ...topTinDangData.map(tin => [
          tin.TieuDe,
          tin.LuotXem || 0,
          tin.LuotYeuThich || 0,
          tin.Gia || 0
        ])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(topTinData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Top tin đăng');
    }
    
    XLSX.writeFile(wb, `BaoCaoHieuSuat_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('BÁO CÁO HIỆU SUẤT', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Từ ngày: ${filters.tuNgay} đến ${filters.denNgay}`, 105, 30, { align: 'center' });
    
    // Metrics
    let y = 50;
    doc.setFontSize(14);
    doc.text('TỔNG QUAN', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.text(`Tổng tin đăng: ${formatNumber(tongQuan.TongTinDang || 0)}`, 20, y);
    y += 7;
    doc.text(`Tin đang hoạt động: ${formatNumber(tongQuan.TinDangDaDang || 0)}`, 20, y);
    y += 7;
    doc.text(`Tổng lượt xem: ${formatNumber(tuongTac.TongLuotXem || 0)}`, 20, y);
    y += 7;
    doc.text(`Tổng lượt thích: ${formatNumber(tuongTac.TongLuotThich || 0)}`, 20, y);
    y += 7;
    doc.text(`Tổng cuộc hẹn: ${formatNumber(cuocHen.TongCuocHen || 0)}`, 20, y);
    y += 7;
    doc.text(`Tổng tiền cọc: ${formatCurrency(coc.TongTienCoc || 0)}`, 20, y);
    
    doc.save(`BaoCaoHieuSuat_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('vi-VN');
  };

  const formatCurrency = (num) => {
    return Number(num || 0).toLocaleString('vi-VN') + ' ₫';
  };

  // Chart colors - EMERALD NOIR THEME
  const COLORS = {
    primary: '#14532D',     // Deep Emerald
    success: '#10b981',     // Success Green (unchanged)
    warning: '#D4AF37',     // Gold
    danger: '#ef4444',      // Danger Red (unchanged)
    info: '#0F766E',        // Teal
    gray: '#6b7280'         // Gray (unchanged)
  };

  const PIE_COLORS = [COLORS.success, COLORS.info, COLORS.warning, COLORS.danger, COLORS.gray];

  // Custom tooltip cho charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: '#111827' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '14px', margin: '4px 0' }}>
              {entry.name}: {entry.name.includes('Tiền') || entry.name.includes('Doanh thu') 
                ? formatCurrency(entry.value) 
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="cda-loading">
          <div className="cda-spinner"></div>
          <p className="cda-loading-text">Đang tải báo cáo chi tiết...</p>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      {/* Page Header */}
      <div className="cda-flex cda-justify-between cda-items-center cda-mb-lg">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>
            Báo cáo hiệu suất
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Phân tích chi tiết hiệu suất tin đăng
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportToPDF} className="cda-btn cda-btn-secondary">
            <HiOutlineDocumentText style={{ width: '18px', height: '18px' }} />
            <span>Xuất PDF</span>
          </button>
          <button onClick={exportToExcel} className="cda-btn cda-btn-secondary">
            <HiOutlineArrowDownTray style={{ width: '18px', height: '18px' }} />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="cda-card cda-mb-lg">
        <div className="cda-card-body">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => chonKhoangThoiGian(7)}
                className="cda-btn cda-btn-sm cda-btn-secondary"
              >
                7 ngày
              </button>
              <button
                onClick={() => chonKhoangThoiGian(30)}
                className="cda-btn cda-btn-sm cda-btn-secondary"
              >
                30 ngày
              </button>
              <button
                onClick={() => chonKhoangThoiGian(90)}
                className="cda-btn cda-btn-sm cda-btn-secondary"
              >
                90 ngày
              </button>
              <button
                onClick={() => chonKhoangThoiGian(180)}
                className="cda-btn cda-btn-sm cda-btn-secondary"
              >
                6 tháng
              </button>
            </div>
            
            <div className="cda-form-group" style={{ margin: 0 }}>
              <label className="cda-label" style={{ marginBottom: '0.25rem' }}>Từ ngày</label>
              <input
                type="date"
                className="cda-input"
                value={filters.tuNgay}
                onChange={(e) => setFilters({ ...filters, tuNgay: e.target.value })}
              />
            </div>
            
            <div className="cda-form-group" style={{ margin: 0 }}>
              <label className="cda-label" style={{ marginBottom: '0.25rem' }}>Đến ngày</label>
              <input
                type="date"
                className="cda-input"
                value={filters.denNgay}
                onChange={(e) => setFilters({ ...filters, denNgay: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="cda-metrics-grid">
        <div className="cda-metric-card blue">
          <div className="cda-metric-icon">👁️</div>
          <div className="cda-metric-value">{formatNumber(tuongTac.TongLuotXem || 0)}</div>
          <div className="cda-metric-label">Tổng lượt xem</div>
          <div className="cda-metric-change">
            <HiOutlineEye style={{ width: '16px', height: '16px' }} />
            <span>{formatNumber(tuongTac.LuotXemHomNay || 0)} lượt hôm nay</span>
          </div>
        </div>

        <div className="cda-metric-card green">
          <div className="cda-metric-icon">❤️</div>
          <div className="cda-metric-value">{formatNumber(tuongTac.TongLuotThich || 0)}</div>
          <div className="cda-metric-label">Lượt yêu thích</div>
          <div className="cda-metric-change">
            <HiOutlineArrowTrendingUp style={{ width: '16px', height: '16px' }} />
            <span>{formatNumber(tuongTac.YeuThichHomNay || 0)} lượt hôm nay</span>
          </div>
        </div>

        <div className="cda-metric-card orange">
          <div className="cda-metric-icon">
            <HiOutlineCalendar />
          </div>
          <div className="cda-metric-value">{formatNumber(cuocHen.TongCuocHen || 0)}</div>
          <div className="cda-metric-label">Tổng cuộc hẹn</div>
          <div className="cda-metric-change">
            <span>✅ {formatNumber(cuocHen.CuocHenHoanThanh || 0)}</span>
            <span>hoàn thành</span>
          </div>
        </div>

        <div className="cda-metric-card emerald">
          <div className="cda-metric-icon">
            <HiOutlineCurrencyDollar />
          </div>
          <div className="cda-metric-value" style={{ fontSize: '1.25rem' }}>
            {formatCurrency(coc.TongTienCoc || 0)}
          </div>
          <div className="cda-metric-label">Tổng tiền cọc</div>
          <div className="cda-metric-change">
            <HiOutlineChartBar style={{ width: '16px', height: '16px' }} />
            <span>{formatNumber(coc.TongGiaoDichCoc || 0)} giao dịch</span>
          </div>
        </div>
      </div>

      {/* Advanced Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Biểu đồ doanh thu 6 tháng - Recharts */}
        <div className="cda-card" style={{ gridColumn: 'span 2' }}>
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Doanh thu 6 tháng gần nhất</h3>
              <p className="cda-card-subtitle">Xu hướng doanh thu và số lượng giao dịch</p>
            </div>
          </div>
          <div className="cda-card-body">
            {doanhThuData && doanhThuData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={doanhThuData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="thang" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#14532D"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="doanhThu"
                    fill="rgba(20, 83, 45, 0.1)"
                    stroke="rgba(20, 83, 45, 0.3)"
                    name="Doanh thu (₫)"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="doanhThu"
                    fill="#14532D"
                    radius={[8, 8, 0, 0]}
                    name="Doanh thu (₫)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="soGiaoDich"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    name="Số giao dịch"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="cda-empty-state">
                <div className="cda-empty-icon">📊</div>
                <p className="cda-empty-description">Chưa có dữ liệu doanh thu</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Rate - Gauge Chart */}
        <div className="cda-card">
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Tỷ lệ chuyển đổi</h3>
              <p className="cda-card-subtitle">Từ lượt xem thành cuộc hẹn</p>
            </div>
          </div>
          <div className="cda-card-body">
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ 
                fontSize: '4rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #14532D 0%, #0F766E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem'
              }}>
                {(conversionData?.tyLeChuyenDoi || 0).toFixed(1)}%
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {formatNumber(conversionData?.cuocHenHoanThanh || 0)} cuộc hẹn hoàn thành / {formatNumber(conversionData?.tongLuotXem || 0)} lượt xem
              </p>
              <div style={{ 
                height: '8px', 
                background: '#e5e7eb', 
                borderRadius: '999px',
                overflow: 'hidden',
                maxWidth: '300px',
                margin: '0 auto'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(conversionData?.tyLeChuyenDoi || 0, 100)}%`,
                  background: 'linear-gradient(90deg, #14532D, #10b981)',
                  borderRadius: '999px',
                  transition: 'width 1s ease-in-out'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Tin Đăng Performance */}
        <div className="cda-card">
          <div className="cda-card-header">
            <div>
              <h3 className="cda-card-title">Top 5 tin đăng hiệu suất cao</h3>
              <p className="cda-card-subtitle">Xếp hạng theo lượt xem</p>
            </div>
          </div>
          <div className="cda-card-body">
            {topTinDangData && topTinDangData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={topTinDangData}
                  layout="vertical"
                  margin={{ left: 0, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis 
                    type="category" 
                    dataKey="TieuDe" 
                    width={150}
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                    tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="LuotXem" fill="#3b82f6" radius={[0, 8, 8, 0]} name="Lượt xem">
                    {topTinDangData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="cda-empty-state">
                <div className="cda-empty-icon">📈</div>
                <p className="cda-empty-description">Chưa có dữ liệu tin đăng</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Tin đăng Stats */}
        <div className="cda-card">
          <div className="cda-card-header">
            <h3 className="cda-card-title">Thống kê tin đăng</h3>
          </div>
          <div className="cda-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Tổng tin đăng</span>
                <span style={{ fontWeight: 600 }}>{formatNumber(tongQuan.TongTinDang || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem' }}>
                <span style={{ color: '#059669' }}>Đang hoạt động</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{formatNumber(tongQuan.TinDangDaDang || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                <span style={{ color: '#B68C3A' }}>Chờ duyệt</span>
                <span style={{ fontWeight: 600, color: '#B68C3A' }}>{formatNumber(tongQuan.TinDangChoDuyet || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Giá trung bình</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(tongQuan.GiaTrungBinh || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuộc hẹn Stats */}
        <div className="cda-card">
          <div className="cda-card-header">
            <h3 className="cda-card-title">Thống kê cuộc hẹn</h3>
          </div>
          <div className="cda-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Tổng cuộc hẹn</span>
                <span style={{ fontWeight: 600 }}>{formatNumber(cuocHen.TongCuocHen || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
                <span style={{ color: '#1d4ed8' }}>Đã xác nhận</span>
                <span style={{ fontWeight: 600, color: '#1d4ed8' }}>{formatNumber(cuocHen.CuocHenDaXacNhan || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem' }}>
                <span style={{ color: '#065f46' }}>Hoàn thành</span>
                <span style={{ fontWeight: 600, color: '#065f46' }}>{formatNumber(cuocHen.CuocHenHoanThanh || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem' }}>
                <span style={{ color: '#991b1b' }}>Hủy/Không đến</span>
                <span style={{ fontWeight: 600, color: '#991b1b' }}>{formatNumber(cuocHen.CuocHenHuy || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cọc Stats */}
        <div className="cda-card">
          <div className="cda-card-header">
            <h3 className="cda-card-title">Thống kê cọc</h3>
          </div>
          <div className="cda-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Tổng giao dịch</span>
                <span style={{ fontWeight: 600 }}>{formatNumber(coc.TongGiaoDichCoc || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                <span style={{ color: '#1e40af' }}>Cọc giữ chỗ</span>
                <span style={{ fontWeight: 600, color: '#1e40af' }}>{formatNumber(coc.CocGiuCho || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                <span style={{ color: '#92400e' }}>Cọc an ninh</span>
                <span style={{ fontWeight: 600, color: '#92400e' }}>{formatNumber(coc.CocAnNinh || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem' }}>
                <span style={{ color: '#059669' }}>Tổng tiền</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{formatCurrency(coc.TongTienCoc || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="cda-card" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
        <div className="cda-card-body">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>
              <HiOutlineChartBar style={{ width: '40px', height: '40px', color: '#10b981' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#166534' }}>
                Phân tích hiệu suất
              </h4>
              <p style={{ color: '#15803d', fontSize: '0.875rem', lineHeight: '1.6' }}>
                Báo cáo này thống kê dữ liệu từ <strong>{filters.tuNgay}</strong> đến <strong>{filters.denNgay}</strong>.
                Sử dụng các chỉ số này để tối ưu chiến lược kinh doanh và nâng cao hiệu quả cho thuê.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ChuDuAnLayout>
  );
}

export default BaoCaoHieuSuat;