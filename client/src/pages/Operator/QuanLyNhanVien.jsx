import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OperatorLayout from '../../layouts/OperatorLayout';
import TableOperator from '../../components/Operator/shared/TableOperator';
import FilterPanelOperator from '../../components/Operator/shared/FilterPanelOperator';
import BadgeStatusOperator from '../../components/Operator/shared/BadgeStatusOperator';
import ModalTaoNhanVien from './modals/ModalTaoNhanVien';
import ModalChinhSuaNhanVien from './modals/ModalChinhSuaNhanVien';
import ModalChiTietNhanVien from './modals/ModalChiTietNhanVien';
import { operatorApi } from '../../services/operatorApi';
import './QuanLyNhanVien.css';

/**
 * UC-OPER-04&05: Quản lý Nhân viên
 * Operator tạo, sửa, xem chi tiết nhân viên bán hàng
 */
const QuanLyNhanVien = () => {
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState({
    keyword: '',
    khuVucId: '',
    trangThai: '',
    page: 1,
    limit: 20
  });
  
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);
  const [modalTaoOpen, setModalTaoOpen] = useState(false);
  const [modalChinhSuaOpen, setModalChinhSuaOpen] = useState(false);
  const [modalChiTietOpen, setModalChiTietOpen] = useState(false);

  // Query danh sách nhân viên
  const { data: nhanVienData, isLoading, error } = useQuery({
    queryKey: ['nhanVienOperator', filters],
    queryFn: () => operatorApi.nhanVien.getDanhSach(filters),
    keepPreviousData: true
  });

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleTaoMoi = () => {
    setModalTaoOpen(true);
  };

  const handleChinhSua = (nhanVien) => {
    setSelectedNhanVien(nhanVien);
    setModalChinhSuaOpen(true);
  };

  const handleXemChiTiet = (nhanVien) => {
    setSelectedNhanVien(nhanVien);
    setModalChiTietOpen(true);
  };

  const handleSuccess = () => {
    setModalTaoOpen(false);
    setModalChinhSuaOpen(false);
    setModalChiTietOpen(false);
    setSelectedNhanVien(null);
    queryClient.invalidateQueries(['nhanVienOperator']);
    queryClient.invalidateQueries(['dashboardOperator']);
  };

  // Table columns
  const columns = [
    {
      key: 'NguoiDungID',
      label: 'ID',
      width: '60px',
      render: (row) => `#${row.NguoiDungID}`
    },
    {
      key: 'TenDayDu',
      label: 'Họ tên',
      width: '200px',
      render: (row) => (
        <div className="quan-ly-nhan-vien__ho-ten">
          <div className="quan-ly-nhan-vien__ten">{row.TenDayDu}</div>
          <div className="quan-ly-nhan-vien__email">{row.Email}</div>
        </div>
      )
    },
    {
      key: 'SoDienThoai',
      label: 'Số điện thoại',
      width: '140px'
    },
    {
      key: 'KhuVucPhuTrach',
      label: 'Khu vực phụ trách',
      width: '180px',
      render: (row) => row.KhuVucPhuTrach || 'Tất cả khu vực'
    },
    {
      key: 'NgayBatDau',
      label: 'Ngày bắt đầu',
      width: '130px',
      render: (row) => row.NgayBatDau ? new Date(row.NgayBatDau).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      key: 'TrangThai',
      label: 'Trạng thái',
      width: '130px',
      render: (row) => (
        <BadgeStatusOperator
          status={row.TrangThai}
          statusMap={{
            'Active': { label: 'Hoạt động', variant: 'success' },
            'Inactive': { label: 'Không hoạt động', variant: 'danger' },
            'Nghi': { label: 'Nghỉ', variant: 'warning' }
          }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '240px',
      render: (row) => (
        <div className="quan-ly-nhan-vien__actions">
          <button
            className="operator-btn operator-btn--sm operator-btn--primary"
            onClick={() => handleXemChiTiet(row)}
          >
            👁️ Chi tiết
          </button>
          <button
            className="operator-btn operator-btn--sm operator-btn--secondary"
            onClick={() => handleChinhSua(row)}
          >
            ✏️ Sửa
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
      placeholder: 'Tên, email, SĐT...',
      value: filters.keyword
    },
    {
      type: 'select',
      name: 'trangThai',
      label: 'Trạng thái',
      value: filters.trangThai,
      options: [
        { value: '', label: 'Tất cả' },
        { value: 'Active', label: 'Hoạt động' },
        { value: 'Inactive', label: 'Không hoạt động' },
        { value: 'Nghi', label: 'Nghỉ' }
      ]
    }
  ];

  // Stats - Kiểm tra nhanVienData.data là array
  const stats = (nhanVienData?.data && Array.isArray(nhanVienData.data)) ? {
    active: nhanVienData.data.filter(nv => nv.TrangThaiLamViec === 'Active').length,
    inactive: nhanVienData.data.filter(nv => nv.TrangThaiLamViec === 'Inactive').length,
    nghi: nhanVienData.data.filter(nv => nv.TrangThaiLamViec === 'Nghi').length
  } : { active: 0, inactive: 0, nghi: 0 };

  return (
    <OperatorLayout>
      <div className="quan-ly-nhan-vien">
        {/* Header */}
        <div className="quan-ly-nhan-vien__header">
          <div className="quan-ly-nhan-vien__title-section">
            <h1 className="quan-ly-nhan-vien__title">👥 Quản lý Nhân viên</h1>
            <p className="quan-ly-nhan-vien__subtitle">
              Quản lý hồ sơ và thông tin Nhân viên Bán hàng
            </p>
          </div>
          
          {/* Stats */}
          {stats && (
            <div className="quan-ly-nhan-vien__stats">
              <div className="quan-ly-nhan-vien__stat-item quan-ly-nhan-vien__stat-item--success">
                <div className="quan-ly-nhan-vien__stat-value">{stats.active}</div>
                <div className="quan-ly-nhan-vien__stat-label">Hoạt động</div>
              </div>
              <div className="quan-ly-nhan-vien__stat-item quan-ly-nhan-vien__stat-item--danger">
                <div className="quan-ly-nhan-vien__stat-value">{stats.inactive}</div>
                <div className="quan-ly-nhan-vien__stat-label">Không hoạt động</div>
              </div>
              <div className="quan-ly-nhan-vien__stat-item quan-ly-nhan-vien__stat-item--warning">
                <div className="quan-ly-nhan-vien__stat-value">{stats.nghi}</div>
                <div className="quan-ly-nhan-vien__stat-label">Nghỉ</div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            className="operator-btn operator-btn--primary"
            onClick={handleTaoMoi}
          >
            ➕ Tạo Nhân viên mới
          </button>
        </div>

        {/* Filter Panel */}
        <FilterPanelOperator
          fields={filterFields}
          onFilterChange={handleFilterChange}
          onReset={() => setFilters({
            keyword: '',
            khuVucId: '',
            trangThai: '',
            page: 1,
            limit: 20
          })}
        />

        {/* Table */}
        <div className="quan-ly-nhan-vien__content">
          {error ? (
            <div className="quan-ly-nhan-vien__error">
              ❌ Lỗi tải dữ liệu: {error.message}
            </div>
          ) : (
            <TableOperator
              columns={columns}
              data={nhanVienData?.data || []}
              isLoading={isLoading}
              pagination={{
                currentPage: filters.page,
                totalPages: nhanVienData?.totalPages || 1,
                total: nhanVienData?.total || 0,
                limit: filters.limit,
                onPageChange: handlePageChange
              }}
              emptyMessage="Chưa có nhân viên nào"
            />
          )}
        </div>

        {/* Modals */}
        {modalTaoOpen && (
          <ModalTaoNhanVien
            onClose={() => setModalTaoOpen(false)}
            onSuccess={handleSuccess}
          />
        )}

        {modalChinhSuaOpen && selectedNhanVien && (
          <ModalChinhSuaNhanVien
            nhanVienId={selectedNhanVien.NguoiDungID}
            nhanVien={selectedNhanVien}
            onClose={() => {
              setModalChinhSuaOpen(false);
              setSelectedNhanVien(null);
            }}
            onSuccess={handleSuccess}
          />
        )}

        {modalChiTietOpen && selectedNhanVien && (
          <ModalChiTietNhanVien
            nhanVienId={selectedNhanVien.NguoiDungID}
            onClose={() => {
              setModalChiTietOpen(false);
              setSelectedNhanVien(null);
            }}
          />
        )}
      </div>
    </OperatorLayout>
  );
};

export default QuanLyNhanVien;






