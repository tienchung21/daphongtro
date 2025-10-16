import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import '../../styles/ChuDuAnDesignSystem.css';
import '../../styles/TableLayout.css';
import './QuanLyDuAn.css';
import { DuAnService, Utils } from '../../services/ChuDuAnService';
import ModalTaoNhanhDuAn from '../../components/ChuDuAn/ModalTaoNhanhDuAn';
import ModalCapNhatDuAn from '../../components/ChuDuAn/ModalCapNhatDuAn';
import ModalChinhSachCoc from '../../components/ChuDuAn/ModalChinhSachCoc';
import ModalThongTinCoc from '../../components/ChuDuAn/ModalThongTinCoc';
import ModalDanhSachPhong from '../../components/ChuDuAn/ModalDanhSachPhong';
import ModalPhuongThucVao from '../../components/ChuDuAn/ModalPhuongThucVao';

import {
  HiOutlinePlus,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlineArchiveBox,
  HiOutlineArrowUturnLeft,
  HiOutlineEye
} from 'react-icons/hi2';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const TRANG_THAI_LABELS = {
  HoatDong: 'Hoạt động',
  NgungHoatDong: 'Ngưng hoạt động',
  TamNgung: 'Tạm ngưng',
  LuuTru: 'Lưu trữ'
};

const TRANG_THAI_NOTES = {
  HoatDong: 'Đang mở tin đăng và cuộc hẹn',
  NgungHoatDong: 'Liên hệ CSKH để kích hoạt lại',
  TamNgung: 'Tạm dừng nhận cuộc hẹn',
  LuuTru: 'Dự án đã lưu trữ'
};

const mergeProjectInfo = (original, incoming = {}) => ({
  ...original,
  TenDuAn: incoming.TenDuAn ?? original.TenDuAn,
  DiaChi: incoming.DiaChi ?? original.DiaChi,
  ViDo: incoming.ViDo !== undefined ? incoming.ViDo : original.ViDo,
  KinhDo: incoming.KinhDo !== undefined ? incoming.KinhDo : original.KinhDo,
  YeuCauPheDuyetChu:
    incoming.YeuCauPheDuyetChu !== undefined ? incoming.YeuCauPheDuyetChu : original.YeuCauPheDuyetChu,
  PhuongThucVao: Object.prototype.hasOwnProperty.call(incoming, 'PhuongThucVao')
    ? incoming.PhuongThucVao
    : original.PhuongThucVao,
  TrangThai: incoming.TrangThai ?? original.TrangThai,
  CapNhatLuc: incoming.CapNhatLuc ?? original.CapNhatLuc
});

function QuanLyDuAn() {
  const navigate = useNavigate();
  const [duAns, setDuAns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [onlyHasCoords, setOnlyHasCoords] = useState(false);

  const [showModalTaoDuAn, setShowModalTaoDuAn] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [pageInput, setPageInput] = useState('1');
  const [selectedDuAn, setSelectedDuAn] = useState(null);
  const [showModalChinhSua, setShowModalChinhSua] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingDuAnId, setPendingDuAnId] = useState(null);
  const [policyModalInfo, setPolicyModalInfo] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [cocModalProject, setCocModalProject] = useState(null);
  const [showCocModal, setShowCocModal] = useState(false);
  const [phongModalProject, setPhongModalProject] = useState(null);
  const [showPhongModal, setShowPhongModal] = useState(false);
  const [phuongThucModalProject, setPhuongThucModalProject] = useState(null);
  const [showPhuongThucModal, setShowPhuongThucModal] = useState(false);

  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!actionError) return undefined;
    const timer = setTimeout(() => setActionError(''), 5000);
    return () => clearTimeout(timer);
  }, [actionError]);

  const filtered = useMemo(() => {
    const s = (search || '').trim().toLowerCase();
    return (duAns || [])
      .filter((d) => {
        if (onlyHasCoords && (!d.ViDo || !d.KinhDo)) return false;
        if (!s) return true;
        const inName = (d.TenDuAn || '').toLowerCase().includes(s);
        const inAddr = (d.DiaChi || '').toLowerCase().includes(s);
        return inName || inAddr;
      });
  }, [duAns, search, onlyHasCoords]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, onlyHasCoords, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(totalItems, startItem + pageSize - 1);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageSizeChange = (value) => {
    setPageSize(value);
  };

  const goToPage = (nextPage) => {
    const target = Math.max(1, Math.min(totalPages, nextPage));
    setPage(target);
  };

  const handleJumpSubmit = (event) => {
    event.preventDefault();
    const value = parseInt(pageInput, 10);
    if (!Number.isNaN(value)) {
      goToPage(value);
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
    setDuAns((prev) =>
      prev.map((item) => (item.DuAnID === updated.DuAnID ? mergeProjectInfo(item, updated) : item))
    );
    setSelectedDuAn((current) =>
      current && current.DuAnID === updated.DuAnID ? mergeProjectInfo(current, updated) : current
    );
    setSuccessMessage('Cập nhật dự án thành công');
    setActionError('');
  };

  const handleArchive = async (duAn) => {
    if (actionLoading) return;
    const confirmArchive = window.confirm(
      `Bạn có chắc chắn muốn lưu trữ dự án "${duAn.TenDuAn}"? Mọi tin đăng đang hoạt động cần được đóng trước.`
    );
    if (!confirmArchive) return;

    try {
      setActionError('');
      setSuccessMessage('');
      setActionLoading(true);
      setPendingDuAnId(duAn.DuAnID);
      const result = await DuAnService.luuTru(duAn.DuAnID);
      const updated = result?.data || result?.duAn || { TrangThai: 'LuuTru' };
      setDuAns((prev) =>
        prev.map((item) =>
          item.DuAnID === duAn.DuAnID ? mergeProjectInfo(item, { ...updated, TrangThai: 'LuuTru' }) : item
        )
      );
      setSelectedDuAn((current) =>
        current && current.DuAnID === duAn.DuAnID
          ? mergeProjectInfo(current, { ...updated, TrangThai: 'LuuTru' })
          : current
      );
      setSuccessMessage('Đã lưu trữ dự án');
    } catch (err) {
      setActionError(err?.message || 'Không thể lưu trữ dự án');
    } finally {
      setActionLoading(false);
      setPendingDuAnId(null);
    }
  };

  const handleRestore = async (duAn) => {
    if (actionLoading) return;
    const confirmRestore = window.confirm(`Khôi phục dự án "${duAn.TenDuAn}" về trạng thái hoạt động?`);
    if (!confirmRestore) return;

    try {
      setActionError('');
      setSuccessMessage('');
      setActionLoading(true);
      setPendingDuAnId(duAn.DuAnID);
      const result = await DuAnService.capNhat(duAn.DuAnID, { TrangThai: 'HoatDong' });
      const updated = result?.data || result?.duAn || { TrangThai: 'HoatDong' };
      setDuAns((prev) =>
        prev.map((item) =>
          item.DuAnID === duAn.DuAnID ? mergeProjectInfo(item, { ...updated, TrangThai: 'HoatDong' }) : item
        )
      );
      setSelectedDuAn((current) =>
        current && current.DuAnID === duAn.DuAnID
          ? mergeProjectInfo(current, { ...updated, TrangThai: 'HoatDong' })
          : current
      );
      setSuccessMessage('Đã khôi phục dự án');
    } catch (err) {
      setActionError(err?.message || 'Không thể khôi phục dự án');
    } finally {
      setActionLoading(false);
      setPendingDuAnId(null);
    }
  };

  const openPolicyModal = (project, policyItem) => {
    if (!policyItem?.ChinhSachCocID) {
      setActionError('Chính sách mặc định của hệ thống không thể chỉnh sửa trực tiếp.');
      return;
    }
    setPolicyModalInfo({ project, policy: policyItem });
    setShowPolicyModal(true);
  };

  const closePolicyModal = () => {
    setShowPolicyModal(false);
    setPolicyModalInfo(null);
  };

  const handlePolicySaved = (updatedPolicy) => {
    if (!updatedPolicy || !policyModalInfo) return;
    const normalized = {
      ChinhSachCocID: updatedPolicy.ChinhSachCocID ?? policyModalInfo.policy.ChinhSachCocID,
      TenChinhSach: updatedPolicy.TenChinhSach,
      MoTa: updatedPolicy.MoTa,
      ChoPhepCocGiuCho: updatedPolicy.ChoPhepCocGiuCho ?? null,
      TTL_CocGiuCho_Gio: updatedPolicy.TTL_CocGiuCho_Gio ?? null,
      TyLePhat_CocGiuCho: updatedPolicy.TyLePhat_CocGiuCho ?? null,
      ChoPhepCocAnNinh: updatedPolicy.ChoPhepCocAnNinh ?? null,
      SoTienCocAnNinhMacDinh: updatedPolicy.SoTienCocAnNinhMacDinh ?? null,
      QuyTacGiaiToa: updatedPolicy.QuyTacGiaiToa ?? null,
      HieuLuc: updatedPolicy.HieuLuc ?? policyModalInfo.policy.HieuLuc,
      CapNhatLuc: updatedPolicy.CapNhatLuc
    };

    setDuAns((prev) =>
      prev.map((item) => {
        if (item.DuAnID !== policyModalInfo.project.DuAnID) return item;
        const updatedPolicies = (item.ChinhSachCoc || []).map((policyItem) =>
          policyItem.ChinhSachCocID === normalized.ChinhSachCocID
            ? { ...policyItem, ...normalized }
            : policyItem
        );
        return { ...item, ChinhSachCoc: updatedPolicies };
      })
    );

    setSuccessMessage('Cập nhật chính sách cọc thành công');
    setShowPolicyModal(false);
    setPolicyModalInfo(null);
  };

  const openCocModal = (project) => {
    setCocModalProject(project);
    setShowCocModal(true);
  };

  const closeCocModal = () => {
    setShowCocModal(false);
    setCocModalProject(null);
  };

  const openPhongModal = (project) => {
    setPhongModalProject(project);
    setShowPhongModal(true);
  };

  const closePhongModal = () => {
    setShowPhongModal(false);
    setPhongModalProject(null);
  };

  const openPhuongThucModal = (project) => {
    setPhuongThucModalProject(project);
    setShowPhuongThucModal(true);
  };

  const handlePhuongThucSaved = (updated) => {
    if (!updated || !phuongThucModalProject) return;
    const result = updated?.data || updated;
    const yeuCau =
      result && Object.prototype.hasOwnProperty.call(result, 'YeuCauPheDuyetChu')
        ? result.YeuCauPheDuyetChu
        : undefined;
    const phuongThuc =
      result && Object.prototype.hasOwnProperty.call(result, 'PhuongThucVao')
        ? result.PhuongThucVao
        : undefined;

    setDuAns((prev) =>
      prev.map((item) =>
        item.DuAnID === phuongThucModalProject.DuAnID
          ? {
              ...item,
              YeuCauPheDuyetChu: yeuCau !== undefined ? yeuCau : item.YeuCauPheDuyetChu,
              PhuongThucVao: phuongThuc !== undefined ? phuongThuc : item.PhuongThucVao
            }
          : item
      )
    );
    setSuccessMessage('Cập nhật phương thức vào dự án thành công');
    setShowPhuongThucModal(false);
    setPhuongThucModalProject(null);
  };

  return (
    <ChuDuAnLayout>
      <div className="cda-card" role="region" aria-label="Quản lý dự án">
        <div className="cda-card-header">
          <div className="duan-page-header">
            <div>
              <div className="duan-title">🏢 Dự án của tôi</div>
              <div className="duan-subtitle">
                Theo đặc tả UC-PROJ-01: quản lý danh sách dự án, trạng thái và tọa độ.
              </div>
            </div>
            <div className="duan-actions">
              <button
                type="button"
                className="cda-btn cda-btn-primary"
                onClick={() => setShowModalTaoDuAn(true)}
              >
                <HiOutlinePlus style={{ marginRight: 6 }} /> Tạo dự án
              </button>
            </div>
          </div>
        </div>

        <div className="cda-card-body">
          {actionError && <div className="duan-alert duan-alert-error">{actionError}</div>}
          {successMessage && <div className="duan-alert duan-alert-success">{successMessage}</div>}

          <div className="duan-toolbar">
            <div className="duan-toolbar-left">
              <input
                className="cda-input duan-search"
                placeholder="Tìm theo tên hoặc địa chỉ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <label className="duan-checkbox">
                <input
                  type="checkbox"
                  checked={onlyHasCoords}
                  onChange={(e) => setOnlyHasCoords(e.target.checked)}
                />
                <span>Chỉ dự án có tọa độ</span>
              </label>
            </div>
            <div className="duan-toolbar-right">
              <div className="duan-summary">
                Tổng {duAns?.length || 0} dự án • Hiển thị {startItem}-{endItem} / {totalItems}
              </div>
              <label className="duan-page-size">
                <span>Số dòng / trang</span>
                <select
                  className="cda-select"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="duan-empty">Đang tải...</div>
          ) : error ? (
            <div className="duan-empty">❌ {error}</div>
          ) : filtered.length === 0 ? (
            <div className="duan-empty">Chưa có dự án nào</div>
          ) : (
            <>
              <div className="duan-table-wrapper" role="region" aria-label="Danh sách dự án">
                <div className="duan-table-grid" role="table" aria-label="Danh sách dự án">
                  <div className="duan-table-grid-header" role="row">
                    <div className="duan-table-header-cell align-left" role="columnheader">Dự án</div>
                    <div className="duan-table-header-cell align-center" role="columnheader">Trạng thái</div>
                    <div className="duan-table-header-cell align-center" role="columnheader">Tin đăng</div>
                    <div className="duan-table-header-cell align-right" role="columnheader">Cập nhật</div>
                  </div>
                  <div className="duan-table-grid-body" role="rowgroup">
                    {pagedData.map((d) => {
                      const isChuDuyet = Number(d.YeuCauPheDuyetChu) === 1;
                      const yeuCauLabel = isChuDuyet ? 'Chủ dự án duyệt cuộc hẹn' : 'Cuộc hẹn tự động duyệt';
                      const yeuCauClass = isChuDuyet ? 'chu-duyet' : 'auto-duyet';
                      const trangThaiLabel = TRANG_THAI_LABELS[d.TrangThai] || d.TrangThai || '—';
                      const trangThaiNote = TRANG_THAI_NOTES[d.TrangThai] || '';
                      const trangThaiClass = d.TrangThai === 'HoatDong' ? '' : (d.TrangThai === 'LuuTru' ? 'archived' : 'inactive');
                      const isArchived = d.TrangThai === 'LuuTru';
                      const isPending = pendingDuAnId === d.DuAnID;

                      const policies = Array.isArray(d.ChinhSachCoc) ? d.ChinhSachCoc : [];
                      const cocStats = d.CocStats || {};

                      const activeTinDang = toNumber(d.TinDangHoatDong ?? d.SoTinDang);
                      const totalTinDang = toNumber(d.SoTinDang);
                      const draftTinDang = toNumber(d.TinDangNhap);

                      const depositActive = toNumber(cocStats.CocDangHieuLuc);
                      const depositHold = toNumber(cocStats.CocDangHieuLucGiuCho);
                      const depositSecurity = toNumber(cocStats.CocDangHieuLucAnNinh);
                      const depositExpired = toNumber(cocStats.CocHetHan);
                      const depositReleased = toNumber(cocStats.CocDaGiaiToa);
                      const depositOffset = toNumber(cocStats.CocDaDoiTru);
                      const depositAmount = toNumber(cocStats.TongTienCocDangHieuLuc);
                      const depositAmountLabel = Utils.formatCurrency(depositAmount);
                      const hasCompletedDeposits = depositExpired + depositReleased + depositOffset > 0;

                      const phongTong = toNumber(d.TongPhong);
                      const phongTrong = toNumber(d.PhongTrong);
                      const phongGiuCho = toNumber(d.PhongGiuCho);
                      const phongDaThue = toNumber(d.PhongDaThue);
                      const phongDonDep = toNumber(d.PhongDonDep);

                      return (
                        <div key={d.DuAnID} className="duan-table-grid-row cda-table-row" role="row">
                          <div className="duan-table-cell cda-table-cell-content duan-cell-project" role="cell">
                            <div className="duan-project-header">
                              <div className="duan-project-heading">
                                <div className="cda-table-title">{d.TenDuAn}</div>
                                <div className="cda-table-desc">{d.DiaChi || '—'}</div>
                              </div>
                              <div className="duan-action-buttons duan-head-actions">
                                <button
                                  type="button"
                                  className="duan-action-btn neutral"
                                  onClick={() => openEditModal(d)}
                                  disabled={actionLoading}
                                >
                                  <HiOutlinePencilSquare />
                                  <span>Chỉnh sửa</span>
                                </button>
                                {isArchived ? (
                                  <button
                                    type="button"
                                    className="duan-action-btn primary"
                                    onClick={() => handleRestore(d)}
                                    disabled={actionLoading}
                                  >
                                    <HiOutlineArrowUturnLeft />
                                    <span>Khôi phục</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="duan-action-btn danger"
                                    onClick={() => handleArchive(d)}
                                    disabled={actionLoading}
                                  >
                                    <HiOutlineArchiveBox />
                                    <span>Lưu trữ</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="duan-project-meta">
                              {d.ViDo && d.KinhDo ? (
                                <span className="duan-coords" title="Tọa độ dự án">
                                  <HiOutlineMapPin />
                                  <span>
                                    {Number(d.ViDo).toFixed(6)}, {Number(d.KinhDo).toFixed(6)}
                                  </span>
                                </span>
                              ) : (
                                <span className="cda-badge-sm" title="Chưa có tọa độ">
                                  Chưa định vị
                                </span>
                              )}
                              <span className={`duan-meta-badge ${yeuCauClass}`}>
                                {yeuCauLabel}
                              </span>
                            </div>

                            {isPending && actionLoading && (
                              <div className="duan-inline-status" role="status">
                                Đang xử lý yêu cầu...
                              </div>
                            )}

                            <div className="duan-project-details" role="group" aria-label="Thông tin mở rộng dự án">
                              <div className="duan-detail-block">
                                <div className="duan-detail-label">Chính sách cọc</div>
                                {policies.length > 0 ? (
                                  <div className="duan-policy-group">
                                    {policies.map((policy) => {
                                      const policyName = policy.TenChinhSach || 'Mặc định hệ thống';
                                      const policyKey = `policy-${d.DuAnID}-${policy.ChinhSachCocID ?? 'default'}`;
                                      const policyClasses = ['duan-policy-badge'];
                                      if (policy.ChinhSachCocID === null) {
                                        policyClasses.push('default-policy');
                                      }
                                      if (policy.HieuLuc === false) {
                                        policyClasses.push('inactive');
                                      }
                                      const tooltipParts = [
                                        policyName,
                                        `Áp dụng: ${policy.SoTinDangApDung} tin`
                                      ];
                                      if (policy.ChoPhepCocGiuCho !== null) {
                                        tooltipParts.push(`Giữ chỗ: ${policy.ChoPhepCocGiuCho ? 'cho phép' : 'không'}`);
                                      }
                                      if (policy.ChoPhepCocAnNinh !== null) {
                                        tooltipParts.push(`Cọc an ninh: ${policy.ChoPhepCocAnNinh ? 'có' : 'không'}`);
                                      }
                                      if (policy.TTL_CocGiuCho_Gio !== null) {
                                        tooltipParts.push(`TTL giữ chỗ: ${policy.TTL_CocGiuCho_Gio} giờ`);
                                      }
                                      if (policy.TyLePhat_CocGiuCho !== null) {
                                        tooltipParts.push(`Phạt: ${policy.TyLePhat_CocGiuCho}%`);
                                      }
                                      return (
                                        <button
                                          type="button"
                                          key={policyKey}
                                          className={policyClasses.join(' ')}
                                          title={tooltipParts.join(' • ')}
                                          onClick={() => openPolicyModal(d, policy)}
                                        >
                                          {policyName} • {policy.SoTinDangApDung}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="duan-detail-text muted">Chưa áp dụng chính sách cọc</div>
                                )}
                              </div>

                              <div className="duan-detail-block">
                                <div className="duan-detail-label">Cọc đang hiệu lực</div>
                                <div className="duan-detail-value">
                                  {depositActive} đơn • {depositAmountLabel}
                                </div>
                                <div className="duan-detail-sub">
                                  Giữ chỗ {depositHold} • An ninh {depositSecurity}
                                </div>
                                {hasCompletedDeposits && (
                                  <div className="duan-detail-sub muted">
                                    Hết hạn {depositExpired} • Giải tỏa {depositReleased} • Đối trừ {depositOffset}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  className="duan-detail-link"
                                  onClick={() => openCocModal(d)}
                                >
                                  <HiOutlineEye /> Xem chi tiết
                                </button>
                              </div>

                              <div className="duan-detail-block">
                                <div className="duan-detail-label">Tình trạng phòng</div>
                                <div className="duan-detail-value">{phongTong} phòng</div>
                                <div className="duan-detail-sub">
                                  Trống {phongTrong} • Giữ chỗ {phongGiuCho} • Đang thuê {phongDaThue}
                                </div>
                                {phongDonDep > 0 && (
                                  <div className="duan-detail-sub muted">Dọn dẹp {phongDonDep}</div>
                                )}
                                <button
                                  type="button"
                                  className="duan-detail-link"
                                  onClick={() => openPhongModal(d)}
                                >
                                  <HiOutlineEye /> Danh sách phòng
                                </button>
                              </div>

                              <div className="duan-detail-block">
                                <div className="duan-detail-label">Phương thức vào</div>
                                <div className={`duan-detail-text ${d.PhuongThucVao ? '' : 'muted'}`}>
                                  {d.PhuongThucVao ? d.PhuongThucVao : 'Chưa cập nhật'}
                                </div>
                                <button
                                  type="button"
                                  className="duan-detail-link"
                                  onClick={() => openPhuongThucModal(d)}
                                >
                                  <HiOutlinePencilSquare /> Chỉnh sửa nhanh
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="duan-table-cell cda-table-cell-status duan-cell-status" role="cell">
                            <span className={`duan-status-badge ${trangThaiClass}`}>
                              {trangThaiLabel}
                            </span>
                            {trangThaiNote && (
                              <div className="duan-status-note">{trangThaiNote}</div>
                            )}
                          </div>
                          <div className="duan-table-cell cda-table-cell-text duan-cell-listings" role="cell">
                            <div className="duan-listing-count">{activeTinDang}</div>
                            <div className="duan-listing-label">Tin đăng đang hoạt động</div>
                            <div className="duan-listing-sub">
                              Tổng {totalTinDang} • Nháp {draftTinDang}
                            </div>
                            <button
                              type="button"
                              className="cda-btn cda-btn-secondary cda-btn-sm duan-listing-btn"
                              onClick={() => navigate('/chu-du-an/tao-tin-dang')}
                              title="Tạo tin đăng từ dự án này"
                            >
                              + Tạo tin đăng
                            </button>
                          </div>
                          <div className="duan-table-cell cda-table-cell-date duan-cell-updated align-right" role="cell">
                            <div className="duan-date-main">
                              {d.CapNhatLuc ? Utils.formatDateTime(d.CapNhatLuc) : '—'}
                            </div>
                            <div className="duan-date-note">Cập nhật lần cuối</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="duan-pagination" aria-label="Phân trang dự án">
                <div className="duan-pagination-info">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="duan-pagination-buttons">
                  <button
                    type="button"
                    className="cda-btn cda-btn-secondary cda-btn-sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                  >
                    « Đầu
                  </button>
                  <button
                    type="button"
                    className="cda-btn cda-btn-secondary cda-btn-sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹ Trước
                  </button>
                  <button
                    type="button"
                    className="cda-btn cda-btn-secondary cda-btn-sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalItems === 0}
                  >
                    Sau ›
                  </button>
                  <button
                    type="button"
                    className="cda-btn cda-btn-secondary cda-btn-sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages || totalItems === 0}
                  >
                    Cuối »
                  </button>
                </div>
                <form className="duan-pagination-jump" onSubmit={handleJumpSubmit}>
                  <span>Đi tới trang</span>
                  <input
                    className="duan-pagination-input"
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                  />
                  <button type="submit" className="cda-btn cda-btn-primary cda-btn-sm">
                    Đi
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal tạo dự án */}
      <ModalTaoNhanhDuAn
        isOpen={showModalTaoDuAn}
        onClose={() => setShowModalTaoDuAn(false)}
        onSuccess={() => {
          setShowModalTaoDuAn(false);
          setActionError('');
          setSuccessMessage('Tạo dự án thành công');
          loadData();
        }}
      />
      <ModalCapNhatDuAn
        isOpen={showModalChinhSua}
        duAn={selectedDuAn}
        onClose={closeEditModal}
        onSaved={handleEditSaved}
      />
      <ModalChinhSachCoc
        isOpen={showPolicyModal}
        projectName={policyModalInfo?.project?.TenDuAn}
        policy={policyModalInfo?.policy}
        onClose={closePolicyModal}
        onSaved={handlePolicySaved}
      />
      <ModalThongTinCoc
        isOpen={showCocModal}
        projectName={cocModalProject?.TenDuAn}
        stats={cocModalProject?.CocStats}
        onClose={closeCocModal}
      />
      <ModalDanhSachPhong
        isOpen={showPhongModal}
        project={phongModalProject}
        onClose={closePhongModal}
      />
      <ModalPhuongThucVao
        isOpen={showPhuongThucModal}
        project={phuongThucModalProject}
        onClose={() => {
          setShowPhuongThucModal(false);
          setPhuongThucModalProject(null);
        }}
        onSaved={handlePhuongThucSaved}
      />
    </ChuDuAnLayout>
  );
}

export default QuanLyDuAn;
