import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import '../../styles/ChuDuAnDesignSystem.css';
import './QuanLyDuAn.css';
import { DuAnService, Utils } from '../../services/ChuDuAnService';
import ChinhSachCocService from '../../services/ChinhSachCocService';
import ModalTaoNhanhDuAn from '../../components/ChuDuAn/ModalTaoNhanhDuAn';
import ModalChinhSuaDuAn from '../../components/ChuDuAn/ModalChinhSuaDuAn';
import ModalQuanLyChinhSachCoc from '../../components/ChuDuAn/ModalQuanLyChinhSachCoc';
import ModalYeuCauMoLaiDuAn from '../../components/ChuDuAn/ModalYeuCauMoLaiDuAn';

import {
  HiOutlinePlus,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlineArchiveBox,
  HiOutlineArrowUturnLeft,
  HiOutlineEye,
  HiOutlineFunnel,
  HiOutlineArrowsUpDown,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineDocumentArrowDown
} from 'react-icons/hi2';

/**
 * QuanLyDuAn - Quản lý Dự án cho Chủ dự án
 * Features:
 * - Compact table layout + expandable rows
 * - Quick filters (tabs)
 * - Bulk operations
 * - Advanced search & sorting
 * - State persistence
 * - Banned workflow + Chính sách Cọc
 * 
 * Tham chiếu: docs/QUANLYDUAN_UX_ANALYSIS_AND_REDESIGN.md
 */

// ===== CONSTANTS =====
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const TRANG_THAI_ENUM = {
  HoatDong: 'HoatDong',
  NgungHoatDong: 'NgungHoatDong',
  LuuTru: 'LuuTru'
};

const TRANG_THAI_LABELS = {
  [TRANG_THAI_ENUM.HoatDong]: 'Hoạt động',
  [TRANG_THAI_ENUM.NgungHoatDong]: 'Ngưng hoạt động',
  [TRANG_THAI_ENUM.LuuTru]: 'Lưu trữ'
};

const PHONG_TRANG_THAI = {
  Trong: { label: 'Trống', icon: '✅', color: 'success' },
  GiuCho: { label: 'Giữ chỗ', icon: '🔒', color: 'warning' },
  DaThue: { label: 'Đã thuê', icon: '🏠', color: 'info' },
  DonDep: { label: 'Dọn dẹp', icon: '🧹', color: 'secondary' }
};

const QUICK_FILTERS = {
  all: { label: 'Tất cả', icon: '📊' },
  active: { label: 'Hoạt động', icon: '●', color: 'success' },
  hasEmptyRooms: { label: 'Có phòng trống', icon: '🏠' },
  hasDeposits: { label: 'Có cọc', icon: '💰' },
  archived: { label: 'Lưu trữ', icon: '📦', color: 'secondary' }
};

const SORT_OPTIONS = {
  TenDuAn_asc: { field: 'TenDuAn', order: 'asc', label: 'Tên A-Z' },
  TenDuAn_desc: { field: 'TenDuAn', order: 'desc', label: 'Tên Z-A' },
  CapNhatLuc_desc: { field: 'CapNhatLuc', order: 'desc', label: 'Mới cập nhật' },
  CapNhatLuc_asc: { field: 'CapNhatLuc', order: 'asc', label: 'Cũ nhất' },
  PhongTrong_desc: { field: 'PhongTrong', order: 'desc', label: 'Nhiều phòng trống' },
  TinDangHoatDong_desc: { field: 'TinDangHoatDong', order: 'desc', label: 'Nhiều tin đăng' }
};

const STORAGE_KEY = 'quanlyduan_preferences';

// ===== HELPER FUNCTIONS =====
const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const saveToStorage = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save preferences:', error);
  }
};

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load preferences:', error);
    return null;
  }
};

// ===== MAIN COMPONENT =====
function QuanLyDuAn() {
  const navigate = useNavigate();

  // Core data
  const [duAns, setDuAns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('CapNhatLuc_desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Modals
  const [showModalTaoDuAn, setShowModalTaoDuAn] = useState(false);
  const [showModalChinhSua, setShowModalChinhSua] = useState(false);
  const [selectedDuAn, setSelectedDuAn] = useState(null);
  const [showModalChinhSachCoc, setShowModalChinhSachCoc] = useState(false);
  const [chinhSachCocMode, setChinhSachCocMode] = useState('create'); // 'create' | 'edit'
  const [selectedChinhSachCoc, setSelectedChinhSachCoc] = useState(null);
  const [showModalYeuCauMoLai, setShowModalYeuCauMoLai] = useState(false);
  const [chinhSachCocList, setChinhSachCocList] = useState([]); // Danh sách chính sách cọc
  const [tooltipDuAnId, setTooltipDuAnId] = useState(null); // For banned reason tooltip

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingIds, setPendingIds] = useState(new Set());

  // ===== LOAD DATA =====
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await DuAnService.layDanhSach();
      const items = data?.data ?? data ?? [];
      setDuAns(items);
    } catch (e) {
      setError(e?.message || 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadChinhSachCoc(); // Load chính sách cọc
  }, [loadData]);

  // ===== LOAD PREFERENCES =====
  useEffect(() => {
    const prefs = loadFromStorage();
    if (prefs) {
      if (prefs.pageSize) setPageSize(prefs.pageSize);
      if (prefs.sortBy) setSortBy(prefs.sortBy);
      if (prefs.activeFilter) setActiveFilter(prefs.activeFilter);
    }
  }, []);

  // ===== SAVE PREFERENCES =====
  useEffect(() => {
    saveToStorage({ pageSize, sortBy, activeFilter });
  }, [pageSize, sortBy, activeFilter]);

  // ===== AUTO-HIDE MESSAGES =====
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!actionError) return;
    const timer = setTimeout(() => setActionError(''), 5000);
    return () => clearTimeout(timer);
  }, [actionError]);

  // ===== FILTER & SORT LOGIC =====
  const filtered = useMemo(() => {
    let result = [...duAns];

    // Apply quick filter
    switch (activeFilter) {
      case 'active':
        result = result.filter(d => d.TrangThai === TRANG_THAI_ENUM.HoatDong);
        break;
      case 'hasEmptyRooms':
        result = result.filter(d => toNumber(d.PhongTrong) > 0);
        break;
      case 'hasDeposits':
        result = result.filter(d => toNumber(d.CocStats?.CocDangHieuLuc) > 0);
        break;
      case 'archived':
        result = result.filter(d => d.TrangThai === TRANG_THAI_ENUM.LuuTru);
        break;
      default:
        // 'all' - no filter
        break;
    }

    // Apply search
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(d => {
        const inName = (d.TenDuAn || '').toLowerCase().includes(s);
        const inAddr = (d.DiaChi || '').toLowerCase().includes(s);
        return inName || inAddr;
      });
    }

    // Apply sorting
    const sortConfig = SORT_OPTIONS[sortBy];
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.field];
        let bVal = b[sortConfig.field];

        // Handle numeric fields
        if (['PhongTrong', 'TinDangHoatDong'].includes(sortConfig.field)) {
          aVal = toNumber(aVal);
          bVal = toNumber(bVal);
        }

        // Handle date fields
        if (sortConfig.field === 'CapNhatLuc') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        }

        // Handle string fields
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }

        if (sortConfig.order === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    return result;
  }, [duAns, activeFilter, search, sortBy]);

  // ===== PAGINATION LOGIC =====
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set()); // Clear selection when filter changes
  }, [search, activeFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(totalItems, startItem + pageSize - 1);

  // ===== QUICK FILTER COUNTS =====
  const filterCounts = useMemo(() => {
    return {
      all: duAns.length,
      active: duAns.filter(d => d.TrangThai === TRANG_THAI_ENUM.HoatDong).length,
      hasEmptyRooms: duAns.filter(d => toNumber(d.PhongTrong) > 0).length,
      hasDeposits: duAns.filter(d => toNumber(d.CocStats?.CocDangHieuLuc) > 0).length,
      archived: duAns.filter(d => d.TrangThai === TRANG_THAI_ENUM.LuuTru).length
    };
  }, [duAns]);

  // ===== BULK SELECTION =====
  const toggleSelectAll = () => {
    if (selectedIds.size === pagedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagedData.map(d => d.DuAnID)));
    }
  };

  const toggleSelectOne = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // ===== EXPANDABLE ROWS =====
  const toggleExpand = (id) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  // ===== ACTION HANDLERS =====
  const handleArchive = async (duAn) => {
    if (actionLoading) return;
    const confirmArchive = window.confirm(
      `Bạn có chắc chắn muốn lưu trữ dự án "${duAn.TenDuAn}"?`
    );
    if (!confirmArchive) return;

    try {
      setActionError('');
      setSuccessMessage('');
      setActionLoading(true);
      setPendingIds(new Set([duAn.DuAnID]));
      
      await DuAnService.luuTru(duAn.DuAnID);
      
      setDuAns(prev =>
        prev.map(item =>
          item.DuAnID === duAn.DuAnID
            ? { ...item, TrangThai: TRANG_THAI_ENUM.LuuTru }
            : item
        )
      );
      setSuccessMessage('Đã lưu trữ dự án thành công');
    } catch (err) {
      setActionError(err?.message || 'Không thể lưu trữ dự án');
    } finally {
      setActionLoading(false);
      setPendingIds(new Set());
    }
  };

  const handleRestore = async (duAn) => {
    if (actionLoading) return;
    const confirmRestore = window.confirm(
      `Khôi phục dự án "${duAn.TenDuAn}" về trạng thái hoạt động?`
    );
    if (!confirmRestore) return;

    try {
      setActionError('');
      setSuccessMessage('');
      setActionLoading(true);
      setPendingIds(new Set([duAn.DuAnID]));
      
      await DuAnService.capNhat(duAn.DuAnID, { TrangThai: TRANG_THAI_ENUM.HoatDong });
      
      setDuAns(prev =>
        prev.map(item =>
          item.DuAnID === duAn.DuAnID
            ? { ...item, TrangThai: TRANG_THAI_ENUM.HoatDong }
            : item
        )
      );
      setSuccessMessage('Đã khôi phục dự án thành công');
    } catch (err) {
      setActionError(err?.message || 'Không thể khôi phục dự án');
    } finally {
      setActionLoading(false);
      setPendingIds(new Set());
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0 || actionLoading) return;
    
    const count = selectedIds.size;
    const confirmBulk = window.confirm(
      `Bạn có chắc chắn muốn lưu trữ ${count} dự án đã chọn?`
    );
    if (!confirmBulk) return;

    try {
      setActionError('');
      setSuccessMessage('');
      setActionLoading(true);
      setPendingIds(new Set(selectedIds));
      
      // Archive in parallel
      await Promise.all(
        Array.from(selectedIds).map(id => DuAnService.luuTru(id))
      );
      
      setDuAns(prev =>
        prev.map(item =>
          selectedIds.has(item.DuAnID)
            ? { ...item, TrangThai: TRANG_THAI_ENUM.LuuTru }
            : item
        )
      );
      setSuccessMessage(`Đã lưu trữ ${count} dự án thành công`);
      setSelectedIds(new Set());
    } catch (err) {
      setActionError(err?.message || 'Không thể lưu trữ các dự án đã chọn');
    } finally {
      setActionLoading(false);
      setPendingIds(new Set());
    }
  };

  const openEditModal = (duAn) => {
    setSelectedDuAn(duAn);
    setShowModalChinhSua(true);
    setActionError('');
  };

  const closeEditModal = () => {
    setShowModalChinhSua(false);
    setSelectedDuAn(null);
  };

  const handleEditSaved = (updated) => {
    if (!updated) return;
    setDuAns(prev =>
      prev.map(item =>
        item.DuAnID === updated.DuAnID ? { ...item, ...updated } : item
      )
    );
    setSuccessMessage('Cập nhật dự án thành công');
    closeEditModal();
  };

  // ===== CHÍNH SÁCH CỌC HANDLERS =====
  const loadChinhSachCoc = async () => {
    try {
      const response = await ChinhSachCocService.layDanhSach({ chiLayHieuLuc: true });
      if (response.success) {
        setChinhSachCocList(response.data || []);
      }
    } catch (error) {
      console.error('Lỗi load chính sách cọc:', error);
    }
  };

  const openChinhSachCocModal = (mode = 'create', chinhSachCoc = null) => {
    setChinhSachCocMode(mode);
    setSelectedChinhSachCoc(chinhSachCoc);
    setShowModalChinhSachCoc(true);
  };

  const closeChinhSachCocModal = () => {
    setShowModalChinhSachCoc(false);
    setSelectedChinhSachCoc(null);
  };

  const handleChinhSachCocSuccess = () => {
    setSuccessMessage(
      chinhSachCocMode === 'create' 
        ? 'Tạo chính sách cọc thành công' 
        : 'Cập nhật chính sách cọc thành công'
    );
    loadChinhSachCoc(); // Reload danh sách
  };

  // ===== YÊU CẦU MỞ LẠI HANDLERS =====
  const openYeuCauMoLaiModal = (duAn) => {
    setSelectedDuAn(duAn);
    setShowModalYeuCauMoLai(true);
  };

  const closeYeuCauMoLaiModal = () => {
    setShowModalYeuCauMoLai(false);
    setSelectedDuAn(null);
  };

  const handleGuiYeuCauMoLai = async (duAnId, noiDungGiaiTrinh) => {
    try {
      const response = await DuAnService.guiYeuCauMoLai(duAnId, noiDungGiaiTrinh);
      if (response.success) {
        // Update local state
        setDuAns(prev =>
          prev.map(item =>
            item.DuAnID === duAnId
              ? { ...item, YeuCauMoLai: 'DangXuLy', NoiDungGiaiTrinh: noiDungGiaiTrinh }
              : item
          )
        );
        setSuccessMessage('Đã gửi yêu cầu mở lại dự án. Operator sẽ xử lý trong 3-5 ngày làm việc.');
      }
    } catch (error) {
      console.error('Lỗi gửi yêu cầu:', error);
      throw error; // Modal sẽ xử lý error
    }
  };

  // ===== RENDER HELPERS =====
  const getTrangThaiClass = (trangThai) => {
    switch (trangThai) {
      case TRANG_THAI_ENUM.HoatDong:
        return 'status-active';
      case TRANG_THAI_ENUM.NgungHoatDong:
        return 'status-inactive';
      case TRANG_THAI_ENUM.LuuTru:
        return 'status-archived';
      default:
        return '';
    }
  };

  const renderPhongStats = (duAn) => {
    const tong = toNumber(duAn.TongPhong);
    const trong = toNumber(duAn.PhongTrong);
    const giuCho = toNumber(duAn.PhongGiuCho);
    const daThue = toNumber(duAn.PhongDaThue);

    if (tong === 0) {
      return <span className="text-muted">—</span>;
    }

    const tyLeTrong = tong > 0 ? Math.round((trong / tong) * 100) : 0;

    return (
      <div className="stats-compact">
        <div className="stats-value">
          {trong}/{tong}
        </div>
        <div className="stats-bar">
          <div
            className="stats-bar-fill stats-bar-success"
            style={{ width: `${tyLeTrong}%` }}
          />
        </div>
        <div className="stats-label">
          {tyLeTrong}% trống • {giuCho} giữ • {daThue} thuê
        </div>
      </div>
    );
  };

  const renderTinDangStats = (duAn) => {
    const hoatDong = toNumber(duAn.TinDangHoatDong);
    const tong = toNumber(duAn.SoTinDang);

    if (tong === 0) {
      return <span className="text-muted">—</span>;
    }

    return (
      <div className="stats-compact">
        <div className="stats-value">{hoatDong}/{tong}</div>
        <div className="stats-label">tin đăng</div>
      </div>
    );
  };

  const renderCocStats = (duAn) => {
    const cocStats = duAn.CocStats || {};
    const dangHieuLuc = toNumber(cocStats.CocDangHieuLuc);
    const tongTien = toNumber(cocStats.TongTienCocDangHieuLuc);

    if (dangHieuLuc === 0) {
      return <span className="text-muted">—</span>;
    }

    return (
      <div className="stats-compact">
        <div className="stats-value">{dangHieuLuc}</div>
        <div className="stats-label">{Utils.formatCurrency(tongTien)}</div>
      </div>
    );
  };

  // ===== RENDER =====
  return (
    <ChuDuAnLayout>
      <div className="qlda-container">
        {/* Header */}
        <div className="qlda-header">
          <div className="qlda-header-left">
            <h1 className="qlda-title">
              <span className="qlda-title-icon">🏢</span>
              Quản lý Dự án
            </h1>
            <p className="qlda-subtitle">
              Quản lý toàn bộ dự án, phòng, tin đăng và chính sách cọc
            </p>
          </div>
          <div className="qlda-header-actions">
            <button
              type="button"
              className="cda-btn cda-btn-primary"
              onClick={() => setShowModalTaoDuAn(true)}
            >
              <HiOutlinePlus className="btn-icon" />
              Tạo dự án mới
            </button>
          </div>
        </div>

        {/* Messages */}
        {actionError && (
          <div className="qlda-alert qlda-alert-error">
            <HiOutlineExclamationTriangle className="alert-icon" />
            <span>{actionError}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setActionError('')}
            >
              <HiOutlineXMark />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="qlda-alert qlda-alert-success">
            <HiOutlineCheckCircle className="alert-icon" />
            <span>{successMessage}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setSuccessMessage('')}
            >
              <HiOutlineXMark />
            </button>
          </div>
        )}

        {/* Quick Filters */}
        <div className="qlda-quick-filters">
          {Object.entries(QUICK_FILTERS).map(([key, config]) => {
            const count = filterCounts[key];
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                type="button"
                className={`quick-filter ${isActive ? 'active' : ''} ${config.color || ''}`}
                onClick={() => setActiveFilter(key)}
              >
                <span className="filter-icon">{config.icon}</span>
                <span className="filter-label">{config.label}</span>
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="qlda-toolbar">
          <div className="toolbar-left">
            {/* Search */}
            <div className="search-box">
              <HiOutlineMagnifyingGlass className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm theo tên hoặc địa chỉ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch('')}
                  title="Xóa tìm kiếm"
                >
                  <HiOutlineXMark />
                </button>
              )}
            </div>

            {/* Search results count */}
            {search && (
              <div className="search-results-info">
                <HiOutlineInformationCircle className="info-icon" />
                Tìm thấy <strong>{filtered.length}</strong> kết quả
              </div>
            )}
          </div>

          <div className="toolbar-right">
            {/* Sort */}
            <div className="sort-box">
              <HiOutlineArrowsUpDown className="sort-icon" />
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {Object.entries(SORT_OPTIONS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Page size */}
            <div className="pagesize-box">
              <span className="pagesize-label">Hiển thị</span>
              <select
                className="pagesize-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="pagesize-label">dự án</span>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="qlda-bulk-actions">
            <div className="bulk-info">
              <input
                type="checkbox"
                checked={selectedIds.size === pagedData.length}
                onChange={toggleSelectAll}
                title="Chọn/Bỏ chọn tất cả"
              />
              <span className="bulk-count">
                <strong>{selectedIds.size}</strong> dự án đã chọn
              </span>
            </div>
            <div className="bulk-buttons">
              <button
                type="button"
                className="cda-btn cda-btn-secondary cda-btn-sm"
                onClick={handleBulkArchive}
                disabled={actionLoading}
              >
                <HiOutlineArchiveBox className="btn-icon" />
                Lưu trữ ({selectedIds.size})
              </button>
              <button
                type="button"
                className="cda-btn cda-btn-secondary cda-btn-sm"
                onClick={clearSelection}
              >
                <HiOutlineXMark className="btn-icon" />
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="qlda-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="qlda-empty">
            <HiOutlineExclamationTriangle className="empty-icon" />
            <p className="empty-title">Lỗi tải dữ liệu</p>
            <p className="empty-text">{error}</p>
            <button
              type="button"
              className="cda-btn cda-btn-primary"
              onClick={loadData}
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="qlda-empty">
            <HiOutlineInformationCircle className="empty-icon" />
            <p className="empty-title">
              {search || activeFilter !== 'all'
                ? 'Không tìm thấy dự án'
                : 'Chưa có dự án nào'}
            </p>
            <p className="empty-text">
              {search || activeFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Tạo dự án đầu tiên để bắt đầu'}
            </p>
            {!search && activeFilter === 'all' && (
              <button
                type="button"
                className="cda-btn cda-btn-primary"
                onClick={() => setShowModalTaoDuAn(true)}
              >
                <HiOutlinePlus className="btn-icon" />
                Tạo dự án đầu tiên
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="qlda-table-container">
              <table className="qlda-table">
                <thead>
                  <tr>
                    <th className="col-select">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === pagedData.length && pagedData.length > 0}
                        onChange={toggleSelectAll}
                        title="Chọn/Bỏ chọn tất cả"
                      />
                    </th>
                    <th className="col-project">Dự án</th>
                    <th className="col-stats">Phòng</th>
                    <th className="col-stats">Tin đăng</th>
                    <th className="col-stats">Cọc</th>
                    <th className="col-status">Trạng thái</th>
                    <th className="col-actions">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((duAn) => {
                    const isSelected = selectedIds.has(duAn.DuAnID);
                    const isExpanded = expandedRows.has(duAn.DuAnID);
                    const isPending = pendingIds.has(duAn.DuAnID);
                    const isArchived = duAn.TrangThai === TRANG_THAI_ENUM.LuuTru;

                    return (
                      <React.Fragment key={duAn.DuAnID}>
                        <tr className={`table-row ${isPending ? 'row-pending' : ''}`}>
                          <td className="col-select">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(duAn.DuAnID)}
                              disabled={isPending}
                            />
                          </td>
                          <td className="col-project">
                            <div className="project-info">
                              <div className="project-name">{duAn.TenDuAn}</div>
                              <div className="project-address">
                                {duAn.ViDo && duAn.KinhDo ? (
                                  <>
                                    <HiOutlineMapPin className="addr-icon" />
                                    {duAn.DiaChi || '—'}
                                  </>
                                ) : (
                                  <span className="text-muted">{duAn.DiaChi || 'Chưa có địa chỉ'}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="col-stats">{renderPhongStats(duAn)}</td>
                          <td className="col-stats">{renderTinDangStats(duAn)}</td>
                          <td className="col-stats">{renderCocStats(duAn)}</td>
                          <td className="col-status">
                            {duAn.TrangThai === 'NgungHoatDong' ? (
                              <div
                                className="status-badge-container"
                                onMouseEnter={() => setTooltipDuAnId(duAn.DuAnID)}
                                onMouseLeave={() => setTooltipDuAnId(null)}
                              >
                                <span className={`status-badge ${getTrangThaiClass(duAn.TrangThai)}`}>
                                  <HiOutlineExclamationTriangle className="badge-icon" />
                                  {TRANG_THAI_LABELS[duAn.TrangThai]}
                                </span>
                                {tooltipDuAnId === duAn.DuAnID && duAn.LyDoNgungHoatDong && (
                                  <div className="tooltip banned-tooltip">
                                    <div className="tooltip-header">
                                      <HiOutlineExclamationTriangle className="icon" />
                                      <strong>Lý do ngưng hoạt động:</strong>
                                    </div>
                                    <div className="tooltip-body">{duAn.LyDoNgungHoatDong}</div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className={`status-badge ${getTrangThaiClass(duAn.TrangThai)}`}>
                                {TRANG_THAI_LABELS[duAn.TrangThai] || duAn.TrangThai}
                              </span>
                            )}
                          </td>
                          <td className="col-actions">
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="action-btn"
                                onClick={() => openEditModal(duAn)}
                                disabled={isPending}
                                title="Chỉnh sửa"
                              >
                                <HiOutlinePencilSquare />
                              </button>
                              {isArchived ? (
                                <button
                                  type="button"
                                  className="action-btn action-restore"
                                  onClick={() => handleRestore(duAn)}
                                  disabled={isPending}
                                  title="Khôi phục"
                                >
                                  <HiOutlineArrowUturnLeft />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="action-btn action-archive"
                                  onClick={() => handleArchive(duAn)}
                                  disabled={isPending}
                                  title="Lưu trữ"
                                >
                                  <HiOutlineArchiveBox />
                                </button>
                              )}
                              <button
                                type="button"
                                className="action-btn action-expand"
                                onClick={() => toggleExpand(duAn.DuAnID)}
                                title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                              >
                                {isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="table-row-expanded">
                            <td colSpan="7">
                              <div className="expanded-content">
                                {/* === TASK 14: BANNED INFO SECTION === */}
                                {duAn.TrangThai === 'NgungHoatDong' && (
                                  <div className="detail-section banned-info-section">
                                    <div className="detail-header">
                                      <HiOutlineExclamationTriangle className="detail-icon text-danger" />
                                      <span className="detail-title">⚠️ Thông tin Ngưng hoạt động</span>
                                    </div>
                                    <div className="banned-info-content">
                                      {/* Lý do */}
                                      <div className="banned-reason">
                                        <strong>Lý do:</strong>
                                        <p className="reason-text">{duAn.LyDoNgungHoatDong || 'Không có thông tin'}</p>
                                      </div>
                                      
                                      {/* Người xử lý & Thời gian */}
                                      <div className="banned-meta">
                                        {duAn.NguoiNgungHoatDong_TenDayDu && (
                                          <div className="meta-item">
                                            <span className="meta-label">Người xử lý:</span>
                                            <span className="meta-value">{duAn.NguoiNgungHoatDong_TenDayDu}</span>
                                          </div>
                                        )}
                                        {duAn.NgungHoatDongLuc && (
                                          <div className="meta-item">
                                            <span className="meta-label">Thời gian:</span>
                                            <span className="meta-value">{Utils.formatDateTime(duAn.NgungHoatDongLuc)}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Trạng thái yêu cầu mở lại */}
                                      <div className="request-status-row">
                                        <div className="status-label">
                                          <strong>Yêu cầu mở lại:</strong>
                                        </div>
                                        <div className="status-badges">
                                          {duAn.YeuCauMoLai === 'ChuaGui' && (
                                            <>
                                              <span className="request-status-badge badge-secondary">
                                                Chưa gửi
                                              </span>
                                              <button
                                                type="button"
                                                className="cda-btn cda-btn-primary cda-btn-sm btn-request-reopen"
                                                onClick={() => openYeuCauMoLaiModal(duAn)}
                                              >
                                                Gửi yêu cầu mở lại
                                              </button>
                                            </>
                                          )}
                                          {duAn.YeuCauMoLai === 'DangXuLy' && (
                                            <>
                                              <span className="request-status-badge badge-warning">
                                                ⏳ Đang xử lý
                                              </span>
                                              {duAn.NoiDungGiaiTrinh && (
                                                <div className="giaitrinh-box">
                                                  <strong>Nội dung giải trình:</strong>
                                                  <p>{duAn.NoiDungGiaiTrinh}</p>
                                                </div>
                                              )}
                                            </>
                                          )}
                                          {duAn.YeuCauMoLai === 'ChapNhan' && (
                                            <span className="request-status-badge badge-success">
                                              ✅ Đã chấp nhận
                                            </span>
                                          )}
                                          {duAn.YeuCauMoLai === 'TuChoi' && (
                                            <>
                                              <span className="request-status-badge badge-danger">
                                                ❌ Đã từ chối
                                              </span>
                                              {duAn.LyDoTuChoiMoLai && (
                                                <div className="giaitrinh-box">
                                                  <strong>Lý do từ chối:</strong>
                                                  <p className="text-danger">{duAn.LyDoTuChoiMoLai}</p>
                                                </div>
                                              )}
                                              <button
                                                type="button"
                                                className="cda-btn cda-btn-primary cda-btn-sm btn-request-reopen"
                                                onClick={() => openYeuCauMoLaiModal(duAn)}
                                              >
                                                Gửi yêu cầu mới
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* === TASK 11: CHÍNH SÁCH CỌC SECTION === */}
                                <div className="detail-section">
                                  <div className="detail-header">
                                    <span className="detail-icon">💎</span>
                                    <span className="detail-title">Chính sách Cọc</span>
                                    <button
                                      type="button"
                                      className="cda-btn cda-btn-secondary cda-btn-sm"
                                      onClick={() => openChinhSachCocModal('create')}
                                      style={{ marginLeft: 'auto' }}
                                    >
                                      <HiOutlinePlus className="icon" />
                                      Thêm chính sách cọc
                                    </button>
                                  </div>
                                  <div className="detail-policies">
                                    {chinhSachCocList.length === 0 ? (
                                      <p className="text-muted">Chưa có chính sách cọc nào</p>
                                    ) : (
                                      <div className="policy-cards">
                                        {chinhSachCocList.map((policy) => (
                                          <div key={policy.ChinhSachCocID} className="policy-card">
                                            <div className="policy-info">
                                              <div className="policy-name">{policy.TenChinhSach}</div>
                                              <div className="policy-details">
                                                {policy.ChoPhepCocGiuCho === 1 && (
                                                  <>
                                                    <span className="policy-tag">TTL: {policy.TTL_CocGiuCho_Gio}h</span>
                                                    <span className="policy-tag">Phạt: {policy.TyLePhat_CocGiuCho}%</span>
                                                  </>
                                                )}
                                                <span className="policy-tag">
                                                  Giải tỏa: {policy.QuyTacGiaiToa === 'BanGiao' ? 'Bàn giao' : policy.QuyTacGiaiToa === 'TheoNgay' ? 'Theo ngày' : 'Khác'}
                                                </span>
                                                {policy.SoTinDangSuDung > 0 && (
                                                  <span className="policy-usage">
                                                    {policy.SoTinDangSuDung} tin đăng
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            {policy.ChuDuAnID && ( // Chỉ edit được chính sách của mình
                                              <button
                                                type="button"
                                                className="policy-edit-btn"
                                                onClick={() => openChinhSachCocModal('edit', policy)}
                                                title="Chỉnh sửa"
                                              >
                                                <HiOutlinePencilSquare />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Phòng details */}
                                <div className="detail-section">
                                  <div className="detail-header">
                                    <span className="detail-icon">🏠</span>
                                    <span className="detail-title">Tình trạng phòng</span>
                                  </div>
                                  <div className="detail-stats">
                                    {Object.entries(PHONG_TRANG_THAI).map(([key, config]) => {
                                      const value = toNumber(duAn[`Phong${key.charAt(0).toUpperCase() + key.slice(1)}`]);
                                      return (
                                        <div key={key} className="stat-item">
                                          <span className="stat-icon">{config.icon}</span>
                                          <span className="stat-label">{config.label}:</span>
                                          <span className={`stat-value text-${config.color}`}>{value}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Cọc details */}
                                {duAn.CocStats && toNumber(duAn.CocStats.CocDangHieuLuc) > 0 && (
                                  <div className="detail-section">
                                    <div className="detail-header">
                                      <span className="detail-icon">💰</span>
                                      <span className="detail-title">Thống kê cọc</span>
                                    </div>
                                    <div className="detail-stats">
                                      <div className="stat-item">
                                        <span className="stat-label">Giữ chỗ:</span>
                                        <span className="stat-value">{toNumber(duAn.CocStats.CocDangHieuLucGiuCho)}</span>
                                      </div>
                                      <div className="stat-item">
                                        <span className="stat-label">An ninh:</span>
                                        <span className="stat-value">{toNumber(duAn.CocStats.CocDangHieuLucAnNinh)}</span>
                                      </div>
                                      <div className="stat-item">
                                        <span className="stat-label">Hết hạn:</span>
                                        <span className="stat-value text-warning">{toNumber(duAn.CocStats.CocHetHan)}</span>
                                      </div>
                                      <div className="stat-item">
                                        <span className="stat-label">Đã giải tỏa:</span>
                                        <span className="stat-value text-secondary">{toNumber(duAn.CocStats.CocDaGiaiToa)}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Metadata */}
                                <div className="detail-section">
                                  <div className="detail-header">
                                    <span className="detail-icon">ℹ️</span>
                                    <span className="detail-title">Thông tin khác</span>
                                  </div>
                                  <div className="detail-metadata">
                                    {duAn.ViDo && duAn.KinhDo && (
                                      <div className="meta-item">
                                        <span className="meta-label">Tọa độ:</span>
                                        <span className="meta-value">
                                          {Number(duAn.ViDo).toFixed(6)}, {Number(duAn.KinhDo).toFixed(6)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="meta-item">
                                      <span className="meta-label">Phê duyệt cuộc hẹn:</span>
                                      <span className="meta-value">
                                        {Number(duAn.YeuCauPheDuyetChu) === 1
                                          ? '✅ Chủ dự án duyệt'
                                          : '⚡ Tự động duyệt'}
                                      </span>
                                    </div>
                                    {duAn.PhuongThucVao && (
                                      <div className="meta-item">
                                        <span className="meta-label">Phương thức vào:</span>
                                        <span className="meta-value">{duAn.PhuongThucVao}</span>
                                      </div>
                                    )}
                                    {duAn.CapNhatLuc && (
                                      <div className="meta-item">
                                        <span className="meta-label">Cập nhật lần cuối:</span>
                                        <span className="meta-value">{Utils.formatDateTime(duAn.CapNhatLuc)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="qlda-pagination">
              <div className="pagination-info">
                Hiển thị {startItem}-{endItem} trong tổng số {totalItems} dự án
              </div>
              <div className="pagination-buttons">
                <button
                  type="button"
                  className="cda-btn cda-btn-secondary cda-btn-sm"
                  onClick={() => setPage(1)}
                  disabled={currentPage === 1}
                >
                  « Đầu
                </button>
                <button
                  type="button"
                  className="cda-btn cda-btn-secondary cda-btn-sm"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹ Trước
                </button>
                <span className="pagination-current">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="cda-btn cda-btn-secondary cda-btn-sm"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau ›
                </button>
                <button
                  type="button"
                  className="cda-btn cda-btn-secondary cda-btn-sm"
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Cuối »
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ModalTaoNhanhDuAn
        isOpen={showModalTaoDuAn}
        onClose={() => setShowModalTaoDuAn(false)}
        onSuccess={() => {
          setShowModalTaoDuAn(false);
          setSuccessMessage('Tạo dự án thành công');
          loadData();
        }}
      />

      <ModalChinhSuaDuAn
        isOpen={showModalChinhSua}
        duAn={selectedDuAn}
        onClose={closeEditModal}
        onSaved={handleEditSaved}
      />

      {/* === TASK 10: MODAL CHÍNH SÁCH CỌC === */}
      <ModalQuanLyChinhSachCoc
        isOpen={showModalChinhSachCoc}
        onClose={closeChinhSachCocModal}
        onSuccess={handleChinhSachCocSuccess}
        chinhSachCoc={selectedChinhSachCoc}
        mode={chinhSachCocMode}
      />

      {/* === TASK 12: MODAL YÊU CẦU MỞ LẠI === */}
      <ModalYeuCauMoLaiDuAn
        isOpen={showModalYeuCauMoLai}
        onClose={closeYeuCauMoLaiModal}
        onSubmit={handleGuiYeuCauMoLai}
        duAn={selectedDuAn}
      />
    </ChuDuAnLayout>
  );
}

export default QuanLyDuAn;
