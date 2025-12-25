import "./header.css";
import logo from "../assets/images/Hommy_Logo_Web.svg";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import yeuThichApi from "../api/yeuThichApi";
import { getStaticUrl } from "../../config/api";

function Header() {
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  // lấy user từ localStorage (với cấu trúc bạn đã paste: { user: { ... } })
  useEffect(() => {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser") ||
      localStorage.getItem("nguoidung");
    if (!raw) {
      const idKey = localStorage.getItem("userId");
      if (idKey && !isNaN(Number(idKey)))
        setCurrentUser({ NguoiDungID: Number(idKey) });
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const actual = parsed.user ?? parsed;
      const id = actual?.NguoiDungID ?? actual?.id ?? actual?.userId;
      const name =
        actual?.TenDayDu ?? actual?.Ten ?? actual?.fullname ?? actual?.name;
      setCurrentUser({ ...actual, NguoiDungID: id, TenDayDu: name });
    } catch (e) {
      // not JSON -> ignore
      const num = Number(raw);
      if (!isNaN(num)) setCurrentUser({ NguoiDungID: num });
    }
  }, []);

  // load favorites khi có userId
  useEffect(() => {
    if (!currentUser?.NguoiDungID) return;
    (async () => {
      setFavLoading(true);
      try {
        const res = await yeuThichApi.listWithTinDetails(
          currentUser.NguoiDungID
        );
        const raw = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setFavorites(raw);
      } catch (err) {
        console.error("Lỗi lấy yêu thích:", err?.response?.data || err.message);
        setFavorites([]);
      } finally {
        setFavLoading(false);
      }
    })();
  }, [currentUser]);

  const handleRemoveFav = async (item) => {
    if (!currentUser?.NguoiDungID) return;
    const tin = item.TinDang ?? item.tinDang ?? item;
    const tinId = tin?.TinDangID ?? tin?.id ?? tin?._id;
    if (!tinId) return;
    if (!window.confirm("Xác nhận xoá yêu thích?")) return;
    try {
      await yeuThichApi.remove(currentUser.NguoiDungID, tinId);
      setFavorites((prev) =>
        prev.filter((f) => {
          const fi =
            (f.TinDang ?? f).TinDangID ??
            (f.TinDang ?? f).id ??
            (f.TinDang ?? f)._id;
          return fi !== tinId;
        })
      );
    } catch (err) {
      console.error("Lỗi xóa yêu thích:", err?.response?.data || err.message);
      alert("Xóa thất bại");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    sessionStorage.clear();
    setCurrentUser(null);
    setFavorites([]);
    // Force reload và redirect về login
    window.location.href = "/login";
  };

  const resolveImageSrc = (value) => {
    if (!value) return null;

    const normalizeCandidates = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      if (typeof input === "string") {
        if (input.trim().startsWith("[")) {
          try {
            const parsed = JSON.parse(input);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [input];
          }
        }
        return [input];
      }
      return [input];
    };

    const firstCandidate = normalizeCandidates(value).find(Boolean);
    if (!firstCandidate || typeof firstCandidate !== "string") return null;
    return getStaticUrl(firstCandidate);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-logo">
          <img src={logo} />
        </div>
        <div className="nav">
          <ul>
            <li>
              <Link to="/" style={{ cursor: "pointer" }}>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to="/blog" style={{ cursor: "pointer" }}>
                Blog
              </Link>
            </li>
            <li>
              <Link to="/bang-gia" style={{ cursor: "pointer" }}>
                Bảng giá dịch vụ
              </Link>
            </li>
            <li>
              <Link to="/quan-ly" style={{ cursor: "pointer" }}>
                Quản lý
              </Link>
            </li>
          </ul>
        </div>

        {/* giữ nguyên cấu trúc class 'yeuthich' */}
        <div className="yeuthich" style={{ position: "relative" }}>
          <button onClick={() => setShowFavorites(!showFavorites)}>
            🩶{favorites.length > 0 ? ` ${favorites.length}` : ""}
          </button>

          {showFavorites && (
            <div className="favorites-dropdown">
              <h4>Danh sách yêu thích</h4>

              {favLoading && <div className="fav-loading">Đang tải...</div>}

              {!favLoading && favorites.length === 0 && (
                <div className="fav-empty">Chưa có mục yêu thích</div>
              )}

              {!favLoading &&
                favorites.map((f) => {
                  const tin = f.TinDang ?? f.tinDang ?? f;
                  const id =
                    tin?.TinDangID ?? tin?.TinDangId ?? tin?.id ?? tin?._id;
                  const title = tin?.TieuDe ?? tin?.title ?? "Không có tiêu đề";

                  // ưu tiên trường Img từ backend, nếu không có thử URL, nếu không có dùng placeholder
                  const imgSrc =
                    resolveImageSrc(tin?.Img) ||
                    resolveImageSrc(tin?.URL) ||
                    "https://via.placeholder.com/80x60?text=No+Img";

                  // debug: in ra console để kiểm tra URL / dữ liệu gốc
                  console.log("[Header] favorite item image debug:", {
                    id,
                    title,
                    imgSrc,
                    tin,
                  });

                  return (
                    <div className="tintuc-baiviet1" key={id}>
                      <div className="anhduan">
                        <img src={imgSrc} alt={title} />
                      </div>
                      <div className="thongtinduan">
                        <div className="tieude">
                          <Link
                            to={`/tindang/${id}`}
                            onClick={() => setShowFavorites(false)}
                          >
                            {title}
                          </Link>
                        </div>
                        <div className="fav-actions">
                          <button
                            className="btn small fav-remove"
                            onClick={() => handleRemoveFav(f)}
                            title="Xóa 1 yêu thích"
                          >
                            X{" "}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="user">
          <ul>
            {!currentUser && (
              <>
                <li>
                  <Link to="/login">Đăng nhập</Link>
                </li>
                <li>
                  <Link to="/dangky">Đăng ký</Link>
                </li>
              </>
            )}

            {currentUser && (
              <>
                <li className="header-username">
                  Xin chào:{" "}
                  {currentUser.TenDayDu ??
                    currentUser.name ??
                    `ID:${currentUser.NguoiDungID}`}
                </li>
                <li>
                  <button onClick={handleLogout} className="btn small">
                    Đăng xuất
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="dangtin">
          <button>Đăng tin</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
