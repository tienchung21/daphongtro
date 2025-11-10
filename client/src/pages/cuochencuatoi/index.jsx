import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import cuocHenApi from "../../api/cuocHenApi";
import "./cuocHenCuaToi.css";

const formatDateTimeVN = (input) => {
  if (!input) return "";
  const d = new Date(String(input).replace(" ", "T"));
  if (isNaN(d.getTime())) return String(input);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCurrentUser = () => {
  try {
    const raw =
      localStorage.getItem("user") || localStorage.getItem("currentUser");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.user ?? parsed;
    }
  } catch {}
  const userId = localStorage.getItem("userId");
  return userId ? { NguoiDungID: Number(userId) } : null;
};

const getUserRole = (u) => {
  const v = u?.VaiTroID ?? u?.vaiTroId ?? u?.roleId ?? u?.RoleID;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
};

const extractIds = (u) => {
  console.log("[extractIds] Raw user object:", u);

  return {
    khachHangId: u?.KhachHangID ?? u?.NguoiDungID ?? u?.id ?? u?.userId ?? null,
    nhanVienId:
      u?.NhanVienID ??
      u?.NhanVienBanHangID ??
      u?.nhanVienId ??
      u?.id ??
      u?.NguoiDungID ??
      null,
    chuDuAnId:
      u?.ChuDuAnID ??
      u?.chuDuAnId ??
      u?.chuDuAnID ??
      u?.ChuDuAn?.ChuDuAnID ??
      u?.NguoiDungID ??
      u?.id ??
      null,
  };
};

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState({});
  const [deleting, setDeleting] = useState({});
  const [editingStatus, setEditingStatus] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    const root = document.querySelector(".appointments");
    const measure = () => {
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
      const f = footer ? Math.ceil(footer.getBoundingClientRect().height) : 0;
      root?.style.setProperty("--safe-top", `${h}px`);
      root?.style.setProperty("--safe-bottom", `${f}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const loadAppointments = async (u) => {
    if (!u) {
      navigate("/login");
      return;
    }

    const role = getUserRole(u);
    const ids = extractIds(u);

    console.log("[loadAppointments] Role:", role);
    console.log("[loadAppointments] Extracted IDs:", ids);

    try {
      setLoading(true);
      setError("");

      let res;
      if (role === 4) {
        res = await cuocHenApi.getAll();
      } else if (role === 3) {
        const chuDuAnId = ids.chuDuAnId ?? u?.NguoiDungID ?? u?.id;

        if (!chuDuAnId) {
          console.error(
            "[loadAppointments] Cannot find ChuDuAnID. User object:",
            u
          );
          setError("Không tìm thấy ChuDuAnID của tài khoản.");
          return;
        }

        console.log("[loadAppointments] Using ChuDuAnID:", chuDuAnId);
        res = await cuocHenApi.findByChuDuAn(chuDuAnId);
      } else if (role === 2) {
        if (!ids.nhanVienId) {
          setError("Không tìm thấy NhanVienID của tài khoản.");
          return;
        }
        res = await cuocHenApi.findByNhanVien(ids.nhanVienId);
      } else {
        if (!ids.khachHangId) {
          setError("Không tìm thấy KhachHangID của tài khoản.");
          return;
        }
        res = await cuocHenApi.findByKhachHang(ids.khachHangId);
      }

      const data = res?.data?.data ?? res?.data ?? [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[loadAppointments] Error:", e);
      setError(
        e?.response?.data?.message || "Không tải được danh sách cuộc hẹn"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = getCurrentUser();
    setCurrentUser(u);
    console.log("[Appointments] Current user:", u);
    loadAppointments(u);
  }, [navigate]);

  const handleApprove = async (cuocHenId) => {
    try {
      setApproving((prev) => ({ ...prev, [cuocHenId]: true }));
      await cuocHenApi.update(cuocHenId, { PheDuyetChuDuAn: "DaPheDuyet" });
      await loadAppointments(currentUser);
    } catch (e) {
      alert(e?.response?.data?.message || "Lỗi phê duyệt cuộc hẹn");
    } finally {
      setApproving((prev) => ({ ...prev, [cuocHenId]: false }));
    }
  };

  const handleDelete = async (cuocHenId) => {
    if (!confirm("Bạn có chắc muốn xóa cuộc hẹn này?")) return;

    try {
      setDeleting((prev) => ({ ...prev, [cuocHenId]: true }));
      await cuocHenApi.remove(cuocHenId);
      await loadAppointments(currentUser);
    } catch (e) {
      alert(e?.response?.data?.message || "Lỗi xóa cuộc hẹn");
    } finally {
      setDeleting((prev) => ({ ...prev, [cuocHenId]: false }));
    }
  };

  const handleStatusChange = async (cuocHenId) => {
    const newStatus = selectedStatus[cuocHenId];
    if (!newStatus) return;

    try {
      setEditingStatus((prev) => ({ ...prev, [cuocHenId]: true }));
      await cuocHenApi.update(cuocHenId, { TrangThai: newStatus });
      await loadAppointments(currentUser);
      setSelectedStatus((prev) => {
        const next = { ...prev };
        delete next[cuocHenId];
        return next;
      });
    } catch (e) {
      alert(e?.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setEditingStatus((prev) => ({ ...prev, [cuocHenId]: false }));
    }
  };

  const isChuDuAn = getUserRole(currentUser) === 3;
  const isAdmin = getUserRole(currentUser) === 4;

  const statusOptions = [
    "ChoXacNhan",
    "DaXacNhan",
    "DangXuLy",
    "HoanThanh",
    "DaHuy",
  ];

  return (
    <div className="appointments">
      <Header />
      <main className="appointments__content">
        <div className="appointments__header">
          <h2 className="appointments__title">
            {isChuDuAn ? "Quản lý cuộc hẹn" : "Cuộc hẹn của tôi"}
          </h2>
          <Link to="/" className="appointments__home-link">
            ← Về trang chủ
          </Link>
        </div>

        {currentUser && (
          <div className="appointments__user">
            Người dùng: ID{" "}
            {currentUser.NguoiDungID ?? currentUser.id ?? currentUser.userId} •
            VaiTroID {getUserRole(currentUser) ?? "—"}
          </div>
        )}

        {loading && <div className="appointments__state">Đang tải...</div>}
        {error && <div className="appointments__error">{error}</div>}

        {!loading && !error && appointments.length === 0 && (
          <div className="appointments__empty">Chưa có cuộc hẹn nào.</div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="appointments__grid">
            {appointments.map((c) => {
              const needsApproval =
                isChuDuAn && c.PheDuyetChuDuAn === "ChoPheDuyet";
              const isApproved = c.PheDuyetChuDuAn === "DaPheDuyet";

              return (
                <article
                  key={c.CuocHenID ?? `${c.TinDangID}-${c.ThoiGianHen}`}
                  className="appointments__card"
                >
                  <div className="appointments__card-top">
                    <strong className="appointments__card-id">
                      # {c.CuocHenID || "-"}
                    </strong>
                    <span className="appointments__card-time">
                      {formatDateTimeVN(c.ThoiGianHen)}
                    </span>
                  </div>

                  <div className="appointments__info-grid">
                    <div className="appointments__info-item">
                      Tin đăng: <strong>{c.TinDangID}</strong>
                    </div>
                    <div className="appointments__info-item">
                      Phòng: <strong>{c.PhongID ?? "—"}</strong>
                    </div>
                    <div className="appointments__info-item">
                      Nhân viên: <strong>{c.NhanVienBanHangID ?? "—"}</strong>
                    </div>
                    <div className="appointments__info-item">
                      Trạng thái:{" "}
                      {isAdmin ? (
                        <div className="appointments__status-edit">
                          <select
                            value={selectedStatus[c.CuocHenID] ?? c.TrangThai}
                            onChange={(e) =>
                              setSelectedStatus((prev) => ({
                                ...prev,
                                [c.CuocHenID]: e.target.value,
                              }))
                            }
                            disabled={editingStatus[c.CuocHenID]}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {selectedStatus[c.CuocHenID] &&
                            selectedStatus[c.CuocHenID] !== c.TrangThai && (
                              <button
                                onClick={() => handleStatusChange(c.CuocHenID)}
                                disabled={editingStatus[c.CuocHenID]}
                                className="appointments__btn-mini"
                              >
                                {editingStatus[c.CuocHenID] ? "..." : "Lưu"}
                              </button>
                            )}
                        </div>
                      ) : (
                        <strong>{c.TrangThai || "—"}</strong>
                      )}
                    </div>
                    {(isChuDuAn || isAdmin) && (
                      <div className="appointments__info-item">
                        Khách hàng: <strong>{c.KhachHangID ?? "—"}</strong>
                      </div>
                    )}
                  </div>

                  {(isChuDuAn || isAdmin) && (
                    <div
                      className={`appointments__approval-status ${
                        isApproved ? "approved" : "pending"
                      }`}
                    >
                      Phê duyệt chủ dự án:{" "}
                      <strong>
                        {isApproved ? "✓ Đã phê duyệt" : "⏳ Chờ phê duyệt"}
                      </strong>
                    </div>
                  )}

                  {c.GhiChu && (
                    <div className="appointments__note">
                      Ghi chú: {c.GhiChu}
                    </div>
                  )}

                  <div className="appointments__actions">
                    <button
                      onClick={() => navigate(`/tin-dang/${c.TinDangID}`)}
                      className="appointments__btn"
                      title="Xem tin đăng"
                    >
                      Xem tin
                    </button>
                    {needsApproval && (
                      <button
                        onClick={() => handleApprove(c.CuocHenID)}
                        className="appointments__btn appointments__btn--approve"
                        disabled={approving[c.CuocHenID]}
                        title="Phê duyệt cuộc hẹn"
                      >
                        {approving[c.CuocHenID] ? "Đang xử lý..." : "Phê duyệt"}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(c.CuocHenID)}
                        className="appointments__btn appointments__btn--delete"
                        disabled={deleting[c.CuocHenID]}
                        title="Xóa cuộc hẹn"
                      >
                        {deleting[c.CuocHenID] ? "Đang xóa..." : "Xóa"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Appointments;
