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
    queryFn: async () => {
      const response = await operatorApi.nhanVien.getDanhSach(filters);
      console.log('🔍 [QuanLyNhanVien] Full Axios Response:', response);
      console.log('🔍 [QuanLyNhanVien] Response.data:', response.data);
      console.log('🔍 [QuanLyNhanVien] Stats:', response.data?.stats);
      console.log('🔍 [QuanLyNhanVien] Data array:', response.data?.data);
      return response.data; // Return response.data (backend JSON)
    },
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
      key: 'TrangThaiLamViec',
      label: 'Trạng thái',
      width: '130px',
      render: (row) => (
        <BadgeStatusOperator
          status={row.TrangThaiLamViec}
          statusMap={{
            'Active': { label: 'Hoạt động', variant: 'success' },
            'Inactive': { label: 'Không hoạt động', variant: 'danger' },
            'HoatDong': { label: 'Hoạt động', variant: 'success' },
            'TamKhoa': { label: 'Tạm khóa', variant: 'warning' },
            'VoHieuHoa': { label: 'Vô hiệu hóa', variant: 'danger' }
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
        { value: 'HoatDong', label: 'Hoạt động' },
        { value: 'TamKhoa', label: 'Tạm khóa' },
        { value: 'VoHieuHoa', label: 'Vô hiệu hóa' }
        // Không hiển thị XoaMem
      ]
    }
  ];

  // Stats - Lấy từ backend response (3 trạng thái riêng biệt)
  const stats = nhanVienData?.stats || {
    hoatDong: 0,
    tamKhoa: 0,
    voHieuHoa: 0,
    total: 0
  };

  console.log('📊 [QuanLyNhanVien] Final stats for display:', stats);

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
          <div className="quan-ly-nhan-vien__stats">
            <div className="quan-ly-nhan-vien__stat-item quan-ly-nhan-vien__stat-item--success">
              <div className="quan-ly-nhan-vien__stat-value">{stats.hoatDong || 0}</div>
              <div className="quan-ly-nhan-vien__stat-label">HOẠT ĐỘNG</div>
            </div>
            <div className="quan-ly-nhan-vien__stat-item quan-ly-nhan-vien__stat-item--warning">
              <div className="quan-ly-nhan-vien__stat-value">{stats.tamKhoa || 0}</div>
              <div className="quan-ly-nhan-vien__stat-label">TẠM KHÓA</div>
            </div>
            <div className="quan-ly-nhan-vien__stat-item quan-ly-nhan-vien__stat-item--danger">
              <div className="quan-ly-nhan-vien__stat-value">{stats.voHieuHoa || 0}</div>
              <div className="quan-ly-nhan-vien__stat-label">VÔ HIỆU HÓA</div>
            </div>
          </div>

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






