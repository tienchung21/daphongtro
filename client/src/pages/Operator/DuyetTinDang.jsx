import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OperatorLayout from '../../layouts/OperatorLayout';
import TableOperator from '../../components/Operator/shared/TableOperator';
import FilterPanelOperator from '../../components/Operator/shared/FilterPanelOperator';
import BadgeStatusOperator from '../../components/Operator/shared/BadgeStatusOperator';
import ModalChiTietTinDang from './modals/ModalChiTietTinDang';
import ModalTuChoiTinDang from './modals/ModalTuChoiTinDang';
import { operatorApi } from '../../services/operatorApi';
import './DuyetTinDang.css';

/**
 * UC-OPER-01: Duyệt Tin đăng
 * Operator duyệt hoặc từ chối tin đăng dựa trên KYC checklist
 */
const DuyetTinDang = () => {
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState({
    keyword: '',
    khuVucId: '',
    duAnId: '',
    tuNgay: '',
    denNgay: '',
    page: 1,
    limit: 20
  });
  
  const [selectedTinDang, setSelectedTinDang] = useState(null);
  const [modalChiTietOpen, setModalChiTietOpen] = useState(false);
  const [modalTuChoiOpen, setModalTuChoiOpen] = useState(false);

  // Query danh sách tin đăng chờ duyệt
  const { data: tinDangData, isLoading, error } = useQuery({
    queryKey: ['tinDangChoDuyet', filters],
    queryFn: () => operatorApi.tinDang.getDanhSachChoDuyet(filters),
    keepPreviousData: true
  });

  // Mutation duyệt tin
  const duyetMutation = useMutation({
    mutationFn: (tinDangId) => operatorApi.tinDang.duyetTinDang(tinDangId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tinDangChoDuyet']);
      queryClient.invalidateQueries(['dashboardOperator']);
      alert('✅ Duyệt tin đăng thành công!');
    },
    onError: (error) => {
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  });

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleXemChiTiet = (tinDang) => {
    setSelectedTinDang(tinDang);
    setModalChiTietOpen(true);
  };

  const handleDuyet = async (tinDangId) => {
    if (window.confirm('Bạn có chắc chắn muốn duyệt tin đăng này?')) {
      await duyetMutation.mutateAsync(tinDangId);
    }
  };

  const handleTuChoi = (tinDang) => {
    setSelectedTinDang(tinDang);
    setModalTuChoiOpen(true);
  };

  const handleTuChoiSuccess = () => {
    setModalTuChoiOpen(false);
    setSelectedTinDang(null);
    queryClient.invalidateQueries(['tinDangChoDuyet']);
    queryClient.invalidateQueries(['dashboardOperator']);
  };

  // Table columns
  const columns = [
    {
      key: 'TinDangID',
      label: 'ID',
      width: '60px',
      render: (row) => `#${row.TinDangID}`
    },
    {
      key: 'TieuDe',
      label: 'Tiêu đề',
      width: '250px',
      render: (row) => (
        <div className="duyet-tin-dang__tieu-de">
          <div className="duyet-tin-dang__tieu-de-text">{row.TieuDe}</div>
          <div className="duyet-tin-dang__so-phong">
            {row.SoPhong} phòng
          </div>
        </div>
      )
    },
    {
      key: 'TenDuAn',
      label: 'Dự án',
      width: '200px',
      render: (row) => (
        <div className="duyet-tin-dang__du-an">
          <div className="duyet-tin-dang__ten-du-an">{row.TenDuAn}</div>
          <div className="duyet-tin-dang__khu-vuc">{row.TenKhuVuc || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'TenChuDuAn',
      label: 'Chủ dự án',
      width: '180px',
      render: (row) => (
        <div className="duyet-tin-dang__chu-du-an">
          <div className="duyet-tin-dang__ten-chu">{row.TenChuDuAn}</div>
          <div className="duyet-tin-dang__email">{row.EmailChuDuAn}</div>
        </div>
      )
    },
    {
      key: 'TrangThaiKYC',
      label: 'KYC',
      width: '120px',
      render: (row) => (
        <BadgeStatusOperator
          status={row.TrangThaiKYC}
          statusMap={{
            'DaXacMinh': { label: 'Đã xác minh', variant: 'success' },
            'ChuaXacMinh': { label: 'Chưa xác minh', variant: 'danger' }
          }}
        />
      )
    },
    {
      key: 'HoaHong',
      label: 'Hoa hồng',
      width: '140px',
      render: (row) => {
        // Parse BangHoaHong từ DuAn
        if (!row.DuAn_BangHoaHong) {
          return (
            <span className="duyet-tin-dang__hoa-hong-empty">
              Không áp dụng
            </span>
          );
        }
        
        try {
          const bangHoaHong = typeof row.DuAn_BangHoaHong === 'string' 
            ? JSON.parse(row.DuAn_BangHoaHong) 
            : row.DuAn_BangHoaHong;
          
          if (Array.isArray(bangHoaHong) && bangHoaHong.length > 0) {
            const tyLeMax = Math.max(...bangHoaHong.map(m => m.tyLe));
            return (
              <span className="duyet-tin-dang__hoa-hong-active" title={JSON.stringify(bangHoaHong)}>
                💰 Lên đến {tyLeMax}%
              </span>
            );
          }
        } catch (err) {
          console.error('Parse BangHoaHong error:', err);
        }
        
        return (
          <span className="duyet-tin-dang__hoa-hong-empty">
            Không áp dụng
          </span>
        );
      }
    },
    {
      key: 'TaoLuc',
      label: 'Ngày tạo',
      width: '140px',
      render: (row) => new Date(row.TaoLuc).toLocaleString('vi-VN')
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '280px',
      render: (row) => (
        <div className="duyet-tin-dang__actions">
          <button
            className="operator-btn operator-btn--sm operator-btn--primary"
            onClick={() => handleXemChiTiet(row)}
          >
            📋 Chi tiết
          </button>
          <button
            className="operator-btn operator-btn--sm operator-btn--success"
            onClick={() => {
              console.log('🔍 DEBUG - Row data:', {
                TinDangID: row.TinDangID,
                TrangThaiKYC: row.TrangThaiKYC,
                DuAn_BangHoaHong: row.DuAn_BangHoaHong
              });
              handleDuyet(row.TinDangID);
            }}
            disabled={duyetMutation.isLoading}
            title="Duyệt tin đăng này"
          >
            ✅ Duyệt
          </button>
          <button
            className="operator-btn operator-btn--sm operator-btn--danger"
            onClick={() => handleTuChoi(row)}
          >
            ❌ Từ chối
          </button>
        </div>
      )
    }
  ];

  // Filter fields
  const filterFields = [
    {
      type: 'text',
      name: 'keyword',
      label: 'Tìm kiếm',
      placeholder: 'Tiêu đề, tên dự án...',
      value: filters.keyword
    },
    {
      type: 'date',
      name: 'tuNgay',
      label: 'Từ ngày',
      value: filters.tuNgay
    },
    {
      type: 'date',
      name: 'denNgay',
      label: 'Đến ngày',
      value: filters.denNgay
    }
  ];

  return (
    <OperatorLayout>
      <div className="duyet-tin-dang">
        {/* Header */}
        <div className="duyet-tin-dang__header">
          <div className="duyet-tin-dang__title-section">
            <h1 className="duyet-tin-dang__title">📋 Duyệt Tin đăng</h1>
            <p className="duyet-tin-dang__subtitle">
              Quản lý và duyệt tin đăng chờ phê duyệt
            </p>
          </div>
          
          {/* Quick Stats */}
          {tinDangData && (
            <div className="duyet-tin-dang__stats">
              <div className="duyet-tin-dang__stat-item">
                <div className="duyet-tin-dang__stat-value">
                  {tinDangData.total || 0}
                </div>
                <div className="duyet-tin-dang__stat-label">
                  Chờ duyệt
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Panel */}
        <FilterPanelOperator
          fields={filterFields}
          onFilterChange={handleFilterChange}
          onReset={() => setFilters({
            keyword: '',
            khuVucId: '',
            duAnId: '',
            tuNgay: '',
            denNgay: '',
            page: 1,
            limit: 20
          })}
        />

        {/* Table */}
        <div className="duyet-tin-dang__content">
          {error ? (
            <div className="duyet-tin-dang__error">
              ❌ Lỗi tải dữ liệu: {error.message}
            </div>
          ) : (
            <TableOperator
              columns={columns}
              data={tinDangData?.data || []}
              isLoading={isLoading}
              pagination={{
                currentPage: filters.page,
                totalPages: tinDangData?.totalPages || 1,
                total: tinDangData?.total || 0,
                limit: filters.limit,
                onPageChange: handlePageChange
              }}
              emptyMessage="Không có tin đăng chờ duyệt"
            />
          )}
        </div>

        {/* Modals */}
        {modalChiTietOpen && selectedTinDang && (
          <ModalChiTietTinDang
            tinDangId={selectedTinDang.TinDangID}
            onClose={() => {
              setModalChiTietOpen(false);
              setSelectedTinDang(null);
            }}
            onDuyet={handleDuyet}
            onTuChoi={handleTuChoi}
          />
        )}

        {modalTuChoiOpen && selectedTinDang && (
          <ModalTuChoiTinDang
            tinDangId={selectedTinDang.TinDangID}
            tieuDe={selectedTinDang.TieuDe}
            onClose={() => {
              setModalTuChoiOpen(false);
              setSelectedTinDang(null);
            }}
            onSuccess={handleTuChoiSuccess}
          />
        )}
      </div>
    </OperatorLayout>
  );
};

export default DuyetTinDang;






