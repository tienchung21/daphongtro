/**
 * UC-SALE-06: Báo cáo Thu nhập
 * Income report with Recharts (Line, Bar, Pie), export PDF/Excel
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  HiOutlineCurrencyDollar, 
  HiOutlineDocumentArrowDown, 
  HiOutlinePrinter,
  HiOutlineCalendar,
  HiOutlineChartBar
} from 'react-icons/hi2';
import { useReactToPrint } from 'react-to-print';
import { layBaoCaoThuNhap } from '../../services/nhanVienBanHangApi';
import { formatCurrency, formatDate, exportToExcel, exportToPDF, calculateChange } from '../../utils/nvbhHelpers';
import MetricCard from '../../components/NhanVienBanHang/MetricCard';
import LoadingSkeleton from '../../components/NhanVienBanHang/LoadingSkeleton';
import ErrorBanner from '../../components/NhanVienBanHang/ErrorBanner';
import './BaoCaoThuNhap.css';

const COLORS = ['#1D4ED8', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];

const BaoCaoThuNhap = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const printRef = React.useRef();

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await layBaoCaoThuNhap(dateRange);
      if (response.success) {
        // Add safe defaults for missing fields
        const data = response.data;
        setReportData({
          tongThuNhap: data.tongGiaTri || 0,
          tongThuNhapTruoc: 0,
          hoaHong: data.tongHoaHong || 0,
          hoaHongTruoc: 0,
          soCuocHenThanhCong: data.cuocHenHoanThanh || 0,
          soCuocHenThanhCongTruoc: 0,
          tyLeChot: data.tyLeChuyenDoi || 0,
          tyLePhotTruoc: 0,
          thuNhapTheoNgay: data.thuNhapTheoNgay || [],
          hoaHongTheoTuan: data.hoaHongTheoTuan || [],
          phanBoLoaiPhong: data.phanBoLoaiPhong || [],
          chiTietHoaHong: data.chiTietHoaHong || []
        });
      }
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    const exportData = reportData.chiTietHoaHong.map(item => ({
      'Mã cuộc hẹn': item.CuocHenID,
      'Khách hàng': item.TenKhachHang,
      'Phòng': item.TenPhong,
      'Ngày': formatDate(item.Ngay),
      'Giá trị HĐ': item.GiaTriHopDong,
      '% Hoa hồng': item.TyLeHoaHong,
      'Số tiền': item.SoTienHoaHong
    }));
    exportToExcel(exportData, `bao-cao-thu-nhap-${dateRange.from}-${dateRange.to}`, 'Báo cáo thu nhập');
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Báo cáo thu nhập ${dateRange.from} - ${dateRange.to}`
  });

  if (loading && !reportData) {
    return (
      <div className="nvbh-bao-cao-thu-nhap">
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="nvbh-bao-cao-thu-nhap">
        <ErrorBanner message={error} onRetry={loadReport} />
      </div>
    );
  }

  const metrics = reportData ? [
    {
      label: 'Tổng thu nhập',
      value: formatCurrency(reportData.tongThuNhap),
      change: calculateChange(reportData.tongThuNhap, reportData.tongThuNhapTruoc),
      icon: HiOutlineCurrencyDollar,
      color: 'primary'
    },
    {
      label: 'Hoa hồng',
      value: formatCurrency(reportData.hoaHong),
      change: calculateChange(reportData.hoaHong, reportData.hoaHongTruoc),
      icon: HiOutlineCurrencyDollar,
      color: 'success'
    },
    {
      label: 'Cuộc hẹn thành công',
      value: reportData.soCuocHenThanhCong,
      change: calculateChange(reportData.soCuocHenThanhCong, reportData.soCuocHenThanhCongTruoc),
      icon: HiOutlineCalendar,
      color: 'warning'
    },
    {
      label: 'Tỷ lệ chốt',
      value: `${reportData.tyLeChot}%`,
      change: calculateChange(reportData.tyLeChot, reportData.tyLePhotTruoc),
      icon: HiOutlineChartBar,
      color: 'danger'
    }
  ] : [];

  return (
    <div className="nvbh-bao-cao-thu-nhap" ref={printRef}>
      {/* Header */}
      <div className="nvbh-bao-cao-thu-nhap__header no-print">
        <div className="nvbh-bao-cao-thu-nhap__title">
          <HiOutlineCurrencyDollar />
          <h1>Báo cáo Thu nhập</h1>
        </div>
        <div className="nvbh-bao-cao-thu-nhap__actions">
          <div className="nvbh-date-range">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
            <span>đến</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
          </div>
          <button className="nvbh-btn-icon" onClick={handleExportExcel} disabled={!reportData}>
            <HiOutlineDocumentArrowDown />
            Excel
          </button>
          <button className="nvbh-btn-icon" onClick={handlePrint} disabled={!reportData}>
            <HiOutlinePrinter />
            In
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="print-only">
        <h1>Báo cáo Thu nhập</h1>
        <p>Từ {formatDate(dateRange.from)} đến {formatDate(dateRange.to)}</p>
      </div>

      {reportData && (
        <>
          {/* Metrics */}
          <div className="nvbh-bao-cao-thu-nhap__metrics">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Charts */}
          <div className="nvbh-bao-cao-thu-nhap__charts">
            {/* Line Chart - Thu nhập theo ngày */}
            <div className="nvbh-chart-card">
              <h2>Thu nhập theo ngày</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.thuNhapTheoNgay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="Thu nhập" stroke="#1D4ED8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Hoa hồng theo tuần */}
            <div className="nvbh-chart-card">
              <h2>Hoa hồng theo tuần</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.hoaHongTheoTuan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="commission" name="Hoa hồng" fill="#0EA5E9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Phân bố theo loại phòng */}
            <div className="nvbh-chart-card">
              <h2>Phân bố theo loại phòng</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.phanBoLoaiPhong}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportData.phanBoLoaiPhong.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Commission Table */}
          <div className="nvbh-bao-cao-thu-nhap__table">
            <h2>Chi tiết Hoa hồng</h2>
            <div className="nvbh-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mã CH</th>
                    <th>Khách hàng</th>
                    <th>Phòng</th>
                    <th>Ngày</th>
                    <th>Giá trị HĐ</th>
                    <th>% HH</th>
                    <th>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.chiTietHoaHong.map((item, index) => (
                    <tr key={index}>
                      <td>{item.CuocHenID}</td>
                      <td>{item.TenKhachHang}</td>
                      <td>{item.TenPhong}</td>
                      <td>{formatDate(item.Ngay)}</td>
                      <td>{formatCurrency(item.GiaTriHopDong)}</td>
                      <td>{item.TyLeHoaHong}%</td>
                      <td className="amount">{formatCurrency(item.SoTienHoaHong)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6"><strong>Tổng cộng</strong></td>
                    <td className="amount"><strong>{formatCurrency(reportData.hoaHong)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BaoCaoThuNhap;





