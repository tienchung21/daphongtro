import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OperatorLayout from '../../layouts/OperatorLayout';
import TableOperator from '../../components/Operator/shared/TableOperator';
import FilterPanelOperator from '../../components/Operator/shared/FilterPanelOperator';
import BadgeStatusOperator from '../../components/Operator/shared/BadgeStatusOperator';
import CalendarView from './components/CalendarView';
import ModalGanLaiCuocHen from './modals/ModalGanLaiCuocHen';
import ModalChiTietLichNVBH from './modals/ModalChiTietLichNVBH';
import {
  lichLamViecOperatorApi,
  cuocHenOperatorApi
} from '../../services/operatorApi';
import './QuanLyLichNVBH.css';

/**
 * UC-OPER-03: Quản lý Lịch làm việc NVBH
 * Operator xem lịch tổng thể và gán lại cuộc hẹn
 */
const QuanLyLichNVBH = () => {
  const queryClient = useQueryClient();
  
  // State
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [listTab, setListTab] = useState('cuocHen'); // 'cuocHen' | 'lichNVBH'
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filters, setFilters] = useState({
    nhanVienId: '',
    trangThai: '',
    tuNgay: '',
    denNgay: '',
    page: 1,
    limit: 20
  });
  
  const [selectedCuocHen, setSelectedCuocHen] = useState(null);
  const [modalGanLaiOpen, setModalGanLaiOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [modalChiTietLichOpen, setModalChiTietLichOpen] = useState(false);

  // Tính start/end của tháng hiện tại để dùng chung cho API
  const { startDateStr, endDateStr } = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const toStr = (d) => d.toISOString().slice(0, 10);
    return {
      startDateStr: toStr(start),
      endDateStr: toStr(end)
    };
  }, [selectedMonth]);

  // Query lịch tổng hợp (ca làm) cho calendar & list view
  const { data: lichTongHop, isLoading: loadingLichTongHop } = useQuery({
    queryKey: ['lichLamViecTongHop', startDateStr, endDateStr, filters.nhanVienId],
    queryFn: () =>
      lichLamViecOperatorApi.getLichTongHop({
        startDate: startDateStr,
        endDate: endDateStr,
        nhanVienId: filters.nhanVienId || undefined
      }),
    enabled: viewMode === 'calendar' || (viewMode === 'list' && listTab === 'lichNVBH')
  });

  // Query danh sách cuộc hẹn (cho calendar + list view)
  const { data: danhSachCuocHenResponse, isLoading: loadingDanhSachCuocHen } = useQuery({
    queryKey: ['danhSachCuocHen', { ...filters, tuNgay: startDateStr, denNgay: endDateStr }],
    queryFn: () =>
      cuocHenOperatorApi.getDanhSach({
        ...filters,
        tuNgay: startDateStr,
        denNgay: endDateStr,
        page: filters.page || 1
      }),
    keepPreviousData: true,
    enabled: viewMode === 'calendar' || (viewMode === 'list' && listTab === 'cuocHen')
  });

  const danhSachCuocHen = danhSachCuocHenResponse?.data || [];

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleGanLai = (cuocHen) => {
    setSelectedCuocHen(cuocHen);
    setModalGanLaiOpen(true);
  };

  const handleGanLaiSuccess = () => {
    setModalGanLaiOpen(false);
    setSelectedCuocHen(null);
    queryClient.invalidateQueries(['lichLamViecTongHop']);
    queryClient.invalidateQueries(['danhSachCuocHen']);
    queryClient.invalidateQueries(['dashboardOperator']);
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  // Table columns for list view
  const columns = [
    {
      key: 'CuocHenID',
      label: 'ID',
      width: '60px',
      render: (row) => `#${row.CuocHenID}`
    },
    {
      key: 'TenKhachHang',
      label: 'Khách hàng',
      width: '180px',
      render: (row) => (
        <div className="quan-ly-lich__khach-hang">
          <div className="quan-ly-lich__ten-khach">{row.TenKhachHang}</div>
          <div className="quan-ly-lich__sdt-khach">{row.SoDienThoaiKhach}</div>
        </div>
      )
    },
    {
      key: 'TenNVBH',
      label: 'NVBH',
      width: '160px',
      render: (row) => row.TenNVBH || 'Chưa phân công'
    },
    {
      key: 'TenPhong',
      label: 'Phòng',
      width: '150px',
      render: (row) => `${row.TenPhong} - ${row.TenDuAn}`
    },
    {
      key: 'ThoiGianHen',
      label: 'Thời gian',
      width: '160px',
      render: (row) => new Date(row.ThoiGianHen).toLocaleString('vi-VN')
    },
    {
      key: 'TrangThai',
      label: 'Trạng thái',
      width: '140px',
      render: (row) => (
        <BadgeStatusOperator
          status={row.TrangThai}
          statusMap={{
            'ChoXacNhan': { label: 'Chờ xác nhận', variant: 'warning' },
            'DaXacNhan': { label: 'Đã xác nhận', variant: 'success' },
            'HoanThanh': { label: 'Hoàn thành', variant: 'primary' },
            'Huy': { label: 'Đã hủy', variant: 'danger' }
          }}
        />
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '120px',
      render: (row) => (
        <div className="quan-ly-lich__actions">
          {(row.TrangThai === 'ChoXacNhan' || row.TrangThai === 'DaXacNhan') && (
            <button
              className="operator-btn operator-btn--sm operator-btn--primary"
              onClick={() => handleGanLai(row)}
            >
              🔄 Gán lại
            </button>
          )}
        </div>
      )
    }
  ];

  // Filter fields
  const filterFields = [
    {
      type: 'select',
      name: 'trangThai',
      label: 'Trạng thái',
      value: filters.trangThai,
      options: [
        { value: '', label: 'Tất cả' },
        { value: 'ChoXacNhan', label: 'Chờ xác nhận' },
        { value: 'DaXacNhan', label: 'Đã xác nhận' },
        { value: 'HoanThanh', label: 'Hoàn thành' },
        { value: 'Huy', label: 'Đã hủy' }
      ]
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
      <div className="quan-ly-lich">
        {/* Header */}
        <div className="quan-ly-lich__header">
          <div className="quan-ly-lich__title-section">
            <h1 className="quan-ly-lich__title">📅 Quản lý Lịch NVBH</h1>
            <p className="quan-ly-lich__subtitle">
              Theo dõi và quản lý lịch làm việc tổng thể
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="quan-ly-lich__view-toggle">
            <button
              className={`quan-ly-lich__toggle-btn ${viewMode === 'calendar' ? 'is-active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Lịch tháng
            </button>
            <button
              className={`quan-ly-lich__toggle-btn ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Danh sách
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="quan-ly-lich__calendar-wrapper">
            <div className="quan-ly-lich__calendar-header">
              <button
                className="operator-btn operator-btn--sm operator-btn--secondary"
                onClick={() => handleMonthChange(-1)}
              >
                ← Tháng trước
              </button>
              <h2 className="quan-ly-lich__month-title">
                Tháng {selectedMonth.getMonth() + 1}/{selectedMonth.getFullYear()}
              </h2>
              <button
                className="operator-btn operator-btn--sm operator-btn--secondary"
                onClick={() => handleMonthChange(1)}
              >
                Tháng sau →
              </button>
            </div>

            {loadingLichTongHop || loadingDanhSachCuocHen ? (
              <div className="quan-ly-lich__loading">
                <div className="operator-shimmer" style={{ height: '600px' }}></div>
              </div>
            ) : (
              <CalendarView
                shifts={lichTongHop?.data || lichTongHop || []}
                appointments={danhSachCuocHen}
                selectedMonth={selectedMonth}
                onAppointmentClick={handleGanLai}
                onShiftClick={(shift) => {
                  setSelectedShift(shift);
                  setModalChiTietLichOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Tabs cho list view: Cuộc hẹn / Lịch NVBH */}
            <div className="quan-ly-lich__list-tabs">
              <button
                type="button"
                className={`quan-ly-lich__list-tab ${listTab === 'cuocHen' ? 'is-active' : ''}`}
                onClick={() => setListTab('cuocHen')}
              >
                📋 Danh sách cuộc hẹn
              </button>
              <button
                type="button"
                className={`quan-ly-lich__list-tab ${listTab === 'lichNVBH' ? 'is-active' : ''}`}
                onClick={() => setListTab('lichNVBH')}
              >
                👥 Bảng lịch ca NVBH
              </button>
            </div>

            <FilterPanelOperator
              fields={filterFields}
              onFilterChange={handleFilterChange}
              onReset={() => setFilters({
                nhanVienId: '',
                trangThai: '',
                tuNgay: '',
                denNgay: '',
                page: 1,
                limit: 20
              })}
            />

            <div className="quan-ly-lich__content">
              {listTab === 'cuocHen' && (
                <TableOperator
                  columns={columns}
                  data={danhSachCuocHen}
                  isLoading={loadingDanhSachCuocHen}
                  pagination={{
                    currentPage: filters.page,
                    totalPages: danhSachCuocHenResponse?.data?.totalPages || danhSachCuocHenResponse?.totalPages || 1,
                    total: danhSachCuocHenResponse?.data?.total || danhSachCuocHenResponse?.total || danhSachCuocHen.length,
                    limit: filters.limit,
                    onPageChange: handlePageChange
                  }}
                  emptyMessage="Không có cuộc hẹn nào"
                />
              )}

              {listTab === 'lichNVBH' && (
                <TableOperator
                  columns={[
                    {
                      key: 'NhanVienBanHangID',
                      label: 'NVBH',
                      width: '200px',
                      render: (row) => (
                        <div className="quan-ly-lich__khach-hang">
                          <div className="quan-ly-lich__ten-khach">{row.TenNhanVien}</div>
                          <div className="quan-ly-lich__sdt-khach">
                            {row.MaNhanVien} • {row.SoDienThoai}
                          </div>
                        </div>
                      )
                    },
                    {
                      key: 'KhuVucChinhID',
                      label: 'Khu vực',
                      width: '160px',
                      render: (row) => row.TenKhuVuc || '—'
                    },
                    {
                      key: 'BatDau',
                      label: 'Bắt đầu',
                      width: '160px',
                      render: (row) => new Date(row.BatDau).toLocaleString('vi-VN')
                    },
                    {
                      key: 'KetThuc',
                      label: 'Kết thúc',
                      width: '160px',
                      render: (row) => new Date(row.KetThuc).toLocaleString('vi-VN')
                    },
                    {
                      key: 'SoCuocHen',
                      label: 'Số cuộc hẹn',
                      width: '140px',
                      render: (row) => (
                        <div>
                          <strong>{row.SoCuocHen || 0}</strong>{' '}
                          <span className="quan-ly-lich__sdt-khach">
                            ({row.SoCuocHenDaXacNhan || 0} đã xác nhận)
                          </span>
                        </div>
                      )
                    },
                    {
                      key: 'TrangThaiLamViec',
                      label: 'Trạng thái',
                      width: '140px',
                      render: (row) => row.TrangThaiLamViec || 'Đang hoạt động'
                    }
                  ]}
                  data={lichTongHop?.data || lichTongHop || []}
                  isLoading={loadingLichTongHop}
                  pagination={null}
                  emptyMessage="Chưa có ca làm việc nào trong khoảng thời gian này"
                />
              )}
            </div>
          </>
        )}

        {/* Modal Gán lại */}
        {modalGanLaiOpen && selectedCuocHen && (
          <ModalGanLaiCuocHen
            cuocHenId={selectedCuocHen.CuocHenID}
            cuocHen={selectedCuocHen}
            onClose={() => {
              setModalGanLaiOpen(false);
              setSelectedCuocHen(null);
            }}
            onSuccess={handleGanLaiSuccess}
          />
        )}

        {/* Modal Chi tiết lịch NVBH */}
        {modalChiTietLichOpen && selectedShift && (
          <ModalChiTietLichNVBH
            shift={selectedShift}
            appointments={danhSachCuocHen}
            onClose={() => {
              setModalChiTietLichOpen(false);
              setSelectedShift(null);
            }}
            onGanLai={(cuocHen) => {
              setSelectedCuocHen(cuocHen);
              setModalGanLaiOpen(true);
            }}
          />
        )}
      </div>
    </OperatorLayout>
  );
};

export default QuanLyLichNVBH;

