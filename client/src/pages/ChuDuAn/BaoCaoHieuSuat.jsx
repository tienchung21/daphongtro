import React, { useState, useEffect } from 'react';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { BaoCaoService } from '../../services/ChuDuAnService';

// React Icons
import {
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineDocumentText
} from 'react-icons/hi2';

/**
 * UC-PROJ-03: Báo cáo hiệu suất cho Chủ dự án
 * Clean metrics visualization
 */
function BaoCaoHieuSuat() {
  const [baoCao, setBaoCao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tuNgay: getDefaultStartDate(),
    denNgay: getCurrentDate()
  });

  useEffect(() => {
    layBaoCaoHieuSuat();
  }, [filters]);

  function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  const layBaoCaoHieuSuat = async () => {
    try {
      setLoading(true);
      const response = await BaoCaoService.layBaoCaoHieuSuat(filters);
      
      if (response.success) {
        setBaoCao(response.data);
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo hiệu suất');
    } finally {
      setLoading(false);
    }
  };

  const chonKhoangThoiGian = (loai) => {
    const ngayHienTai = new Date();
    let tuNgay;

    switch (loai) {
      case '7_ngay':
        tuNgay = new Date(ngayHienTai.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30_ngay':
        tuNgay = new Date(ngayHienTai.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90_ngay':
        tuNgay = new Date(ngayHienTai.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        tuNgay = new Date(ngayHienTai.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setFilters({
      tuNgay: tuNgay.toISOString().split('T')[0],
      denNgay: ngayHienTai.toISOString().split('T')[0]
    });
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('vi-VN');
  };

  const formatCurrency = (num) => {
    return Number(num || 0).toLocaleString('vi-VN') + ' ₫';
  };

  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="cda-loading">
          <div className="cda-spinner"></div>
          <p className="cda-loading-text">Đang tải báo cáo...</p>
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
            <h3 className="cda-empty-title">Lỗi tải báo cáo</h3>
            <p className="cda-empty-description">{error}</p>
            <button onClick={layBaoCaoHieuSuat} className="cda-btn cda-btn-primary">
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>
            Báo cáo hiệu suất
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Phân tích chi tiết hiệu suất tin đăng
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="cda-btn cda-btn-secondary">
            <HiOutlineDocumentText style={{ width: '18px', height: '18px' }} />
            <span>Xuất PDF</span>
          </button>
          <button className="cda-btn cda-btn-secondary">
            <HiOutlineChartBar style={{ width: '18px', height: '18px' }} />
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
                onClick={() => chonKhoangThoiGian('7_ngay')}
                className="cda-btn cda-btn-sm cda-btn-secondary"
              >
                7 ngày
              </button>
              <button
                onClick={() => chonKhoangThoiGian('30_ngay')}
                className="cda-btn cda-btn-sm cda-btn-secondary"
              >
                30 ngày
              </button>
              <button
                onClick={() => chonKhoangThoiGian('90_ngay')}
                className="cda-btn cda-btn-sm cda-btn-secondary"
              >
                90 ngày
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
          <div className="cda-metric-value">{formatNumber(baoCao?.tongQuan?.TongLuotXem || 0)}</div>
          <div className="cda-metric-label">Tổng lượt xem</div>
        </div>

        <div className="cda-metric-card green">
          <div className="cda-metric-icon">❤️</div>
          <div className="cda-metric-value">{formatNumber(baoCao?.tongQuan?.TongLuotThich || 0)}</div>
          <div className="cda-metric-label">Lượt yêu thích</div>
        </div>

        <div className="cda-metric-card orange">
          <div className="cda-metric-icon">
            <HiOutlineCalendar />
          </div>
          <div className="cda-metric-value">{formatNumber(baoCao?.cuocHen?.TongCuocHen || 0)}</div>
          <div className="cda-metric-label">Tổng cuộc hẹn</div>
          <div className="cda-metric-change">
            <span>✅ {formatNumber(baoCao?.cuocHen?.CuocHenHoanThanh || 0)}</span>
            <span>hoàn thành</span>
          </div>
        </div>

        <div className="cda-metric-card violet">
          <div className="cda-metric-icon">
            <HiOutlineCurrencyDollar />
          </div>
          <div className="cda-metric-value" style={{ fontSize: '1.25rem' }}>
            {formatCurrency(baoCao?.coc?.TongTienCoc || 0)}
          </div>
          <div className="cda-metric-label">Tổng tiền cọc</div>
          <div className="cda-metric-change">
            <HiOutlineChartBar style={{ width: '16px', height: '16px' }} />
            <span>{formatNumber(baoCao?.coc?.TongGiaoDichCoc || 0)} giao dịch</span>
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
                <span style={{ fontWeight: 600 }}>{formatNumber(baoCao?.tongQuan?.TongTinDang || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem' }}>
                <span style={{ color: '#059669' }}>Đang hoạt động</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{formatNumber(baoCao?.tongQuan?.TinDangDaDang || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                <span style={{ color: '#d97706' }}>Chờ duyệt</span>
                <span style={{ fontWeight: 600, color: '#d97706' }}>{formatNumber(baoCao?.tongQuan?.TinDangChoDuyet || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Giá trung bình</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(baoCao?.tongQuan?.GiaTrungBinh || 0)}</span>
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
                <span style={{ fontWeight: 600 }}>{formatNumber(baoCao?.cuocHen?.TongCuocHen || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
                <span style={{ color: '#1d4ed8' }}>Đã xác nhận</span>
                <span style={{ fontWeight: 600, color: '#1d4ed8' }}>{formatNumber(baoCao?.cuocHen?.CuocHenDaXacNhan || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem' }}>
                <span style={{ color: '#065f46' }}>Hoàn thành</span>
                <span style={{ fontWeight: 600, color: '#065f46' }}>{formatNumber(baoCao?.cuocHen?.CuocHenHoanThanh || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem' }}>
                <span style={{ color: '#991b1b' }}>Hủy/Không đến</span>
                <span style={{ fontWeight: 600, color: '#991b1b' }}>{formatNumber(baoCao?.cuocHen?.CuocHenHuy || 0)}</span>
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
                <span style={{ fontWeight: 600 }}>{formatNumber(baoCao?.coc?.TongGiaoDichCoc || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                <span style={{ color: '#1e40af' }}>Cọc giữ chỗ</span>
                <span style={{ fontWeight: 600, color: '#1e40af' }}>{formatNumber(baoCao?.coc?.CocGiuCho || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                <span style={{ color: '#92400e' }}>Cọc an ninh</span>
                <span style={{ fontWeight: 600, color: '#92400e' }}>{formatNumber(baoCao?.coc?.CocAnNinh || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem' }}>
                <span style={{ color: '#059669' }}>Tổng tiền</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{formatCurrency(baoCao?.coc?.TongTienCoc || 0)}</span>
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