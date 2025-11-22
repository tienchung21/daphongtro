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
import ModalChonChinhSachCoc from '../../components/ChuDuAn/ModalChonChinhSachCoc';
import ModalPreviewDuAn from '../../components/ChuDuAn/ModalPreviewDuAn';

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
  HiOutlineDocumentArrowDown,
  HiOutlineEllipsisVertical,
  HiOutlineCurrencyDollar
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
  const [openDropdownId, setOpenDropdownId] = useState(null); // Track which dropdown is open
  const [showModalChonChinhSachCoc, setShowModalChonChinhSachCoc] = useState(false); // Modal chọn chính sách cọc
  const [duAnForChinhSachCoc, setDuAnForChinhSachCoc] = useState(null); // Dự án đang chọn chính sách cọc
  const [showModalPreview, setShowModalPreview] = useState(false); // Modal preview dự án
  const [previewDuAn, setPreviewDuAn] = useState(null); // Dự án đang preview

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

  // ===== HANDLE CLICK OUTSIDE DROPDOWN =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.action-dropdown')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

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

  // ===== PREVIEW MODAL HANDLERS =====
  const openPreviewModal = (duAn) => {
    setPreviewDuAn(duAn);
    setShowModalPreview(true);
    closeDropdown();
  };

  const closePreviewModal = () => {
    setShowModalPreview(false);
    setPreviewDuAn(null);
  };

  // ===== DROPDOWN TOGGLE =====
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
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

  // ===== MODAL CHỌN CHÍNH SÁCH CỌC HANDLERS =====
  const openModalChonChinhSachCoc = (duAn) => {
    setDuAnForChinhSachCoc(duAn);
    setShowModalChonChinhSachCoc(true);
    closeDropdown(); // Đóng dropdown
  };

  const closeModalChonChinhSachCoc = () => {
    setShowModalChonChinhSachCoc(false);
    setDuAnForChinhSachCoc(null);
  };

  const handleChonChinhSachCocSuccess = (chinhSachCocId) => {
    // Update local state
    if (duAnForChinhSachCoc) {
      setDuAns(prev =>
        prev.map(item =>
          item.DuAnID === duAnForChinhSachCoc.DuAnID
            ? { ...item, ChinhSachCocID: chinhSachCocId }
            : item
        )
      );
      setSuccessMessage('Đã cập nhật chính sách cọc cho dự án');
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
                    const isPending = pendingIds.has(duAn.DuAnID);
                    const isArchived = duAn.TrangThai === TRANG_THAI_ENUM.LuuTru;

                    return (
                      <tr key={duAn.DuAnID} className={`table-row ${isPending ? 'row-pending' : ''}`}>
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
                              <div className="project-name">
                                {duAn.TenDuAn}
                                {/* Badge trạng thái duyệt hoa hồng */}
                                {duAn.TrangThaiDuyetHoaHong && (
                                  <span
                                    style={{
                                      marginLeft: '0.5rem',
                                      padding: '0.125rem 0.5rem',
                                      borderRadius: '0.25rem',
                                      fontSize: '0.7rem',
                                      fontWeight: 500,
                                      background: duAn.TrangThaiDuyetHoaHong === 'DaDuyet'
                                        ? '#dcfce7'
                                        : duAn.TrangThaiDuyetHoaHong === 'TuChoi'
                                        ? '#fee2e2'
                                        : '#fef3c7',
                                      color: duAn.TrangThaiDuyetHoaHong === 'DaDuyet'
                                        ? '#166534'
                                        : duAn.TrangThaiDuyetHoaHong === 'TuChoi'
                                        ? '#991b1b'
                                        : '#92400e',
                                      cursor: 'help',
                                      title: duAn.TrangThaiDuyetHoaHong === 'DaDuyet'
                                        ? 'Hoa hồng đã được duyệt'
                                        : duAn.TrangThaiDuyetHoaHong === 'TuChoi'
                                        ? 'Hoa hồng bị từ chối - Cần chỉnh sửa và gửi lại'
                                        : 'Hoa hồng đang chờ duyệt'
                                    }}
                                  >
                                    {duAn.TrangThaiDuyetHoaHong === 'DaDuyet' && '✓ HH'}
                                    {duAn.TrangThaiDuyetHoaHong === 'TuChoi' && '✗ HH'}
                                    {duAn.TrangThaiDuyetHoaHong === 'ChoDuyet' && '⏳ HH'}
                                  </span>
                                )}
                              </div>
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
                            <div className="action-dropdown">
                              <button
                                type="button"
                                className="action-dropdown-trigger"
                                onClick={() => toggleDropdown(duAn.DuAnID)}
                                disabled={isPending}
                                title="Thao tác"
                              >
                                <HiOutlineEllipsisVertical />
                              </button>
                              
                              {openDropdownId === duAn.DuAnID && (
                                <div className="action-dropdown-menu">
                                  {/* Chỉnh sửa */}
                                  <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {
                                      openEditModal(duAn);
                                      closeDropdown();
                                    }}
                                  >
                                    <HiOutlinePencilSquare className="item-icon" />
                                    <span>Chỉnh sửa</span>
                                  </button>

                                  {/* Lưu trữ / Khôi phục */}
                                  {isArchived ? (
                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      onClick={() => {
                                        handleRestore(duAn);
                                        closeDropdown();
                                      }}
                                    >
                                      <HiOutlineArrowUturnLeft className="item-icon" />
                                      <span>Khôi phục</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      onClick={() => {
                                        handleArchive(duAn);
                                        closeDropdown();
                                      }}
                                    >
                                      <HiOutlineArchiveBox className="item-icon" />
                                      <span>Lưu trữ</span>
                                    </button>
                                  )}

                                  {/* Xem chi tiết */}
                                  <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => openPreviewModal(duAn)}
                                  >
                                    <HiOutlineEye className="item-icon" />
                                    <span>Xem chi tiết</span>
                                  </button>

                                  <div className="dropdown-divider"></div>

                                  {/* Chính sách cọc */}
                                  <button
                                    type="button"
                                    className="dropdown-item dropdown-item-clickable"
                                    onClick={() => openModalChonChinhSachCoc(duAn)}
                                  >
                                    <div className="item-content-full">
                                      <div className="item-header-full">
                                        <HiOutlineCurrencyDollar className="item-icon" />
                                        <span className="item-title">Chính sách cọc</span>
                                      </div>
                                      <div className="item-subtitle">
                                        {duAn.ChinhSachCocID ? (
                                          <span className="text-primary text-sm">
                                            {chinhSachCocList.find(cs => cs.ChinhSachCocID === duAn.ChinhSachCocID)?.TenChinhSach || 'Đang sử dụng'}
                                          </span>
                                        ) : (
                                          <span className="text-muted text-sm">Chưa thiết lập</span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
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

      {/* === MODAL CHỌN CHÍNH SÁCH CỌC === */}
      <ModalChonChinhSachCoc
        isOpen={showModalChonChinhSachCoc}
        onClose={closeModalChonChinhSachCoc}
        duAn={duAnForChinhSachCoc}
        onSuccess={handleChonChinhSachCocSuccess}
        onOpenCreateModal={() => openChinhSachCocModal('create')}
      />

      {/* === MODAL PREVIEW DỰ ÁN === */}
      <ModalPreviewDuAn
        isOpen={showModalPreview}
        onClose={closePreviewModal}
        duAn={previewDuAn}
        chinhSachCocList={chinhSachCocList}
        onOpenChinhSachCocModal={openChinhSachCocModal}
        onOpenYeuCauMoLaiModal={openYeuCauMoLaiModal}
      />
    </ChuDuAnLayout>
  );
}

export default QuanLyDuAn;
