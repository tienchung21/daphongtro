import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./trangchu.css";
import tinDangPublicApi from "../../api/tinDangPublicApi";
import SearchKhuVuc from "../../components/SearchKhuVuc";
import yeuThichApi from "../../api/yeuThichApi";
import { Link } from "react-router-dom";
import { getStaticUrl } from "../../config/api";

function TrangChu() {
  const [tindangs, setTindangs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingFavId, setAddingFavId] = useState(null);

  useEffect(() => {
    fetchTinDangs();
  }, []);

  // Sử dụng tinDangPublicApi.getAll() để lấy tin đăng công khai
  const fetchTinDangs = async (params = {}) => {
    setLoading(true);
    setError("");
    console.log("[TrangChu] fetchTinDangs params:", params);
    try {
      const res = await tinDangPublicApi.getAll(params);
      console.log("[TrangChu] tinDangPublicApi.getAll response:", res);

      // Axios response structure: { data: { success, data }, status, headers }
      let raw = [];
      if (res?.data?.success && Array.isArray(res.data.data)) {
        // Backend trả: { success: true, data: [...] }
        raw = res.data.data;
      } else if (Array.isArray(res?.data)) {
        // Fallback: { data: [...] }
        raw = res.data;
      } else {
        console.warn("[TrangChu] Không nhận diện được cấu trúc response:", res);
        raw = [];
      }

      console.log("[TrangChu] RAW LIST FROM API:", raw);

      // fallback filter client-side nếu muốn
      let data = raw;
      if (params?.KhuVucID) {
        const needId = Number(params.KhuVucID);
        data = raw.filter((t) => Number(t.KhuVucID) === needId);
        console.log(
          "[TrangChu] client-filtered count:",
          data.length,
          "for KhuVucID=",
          needId
        );
      }

      setTindangs(data);
    } catch (err) {
      console.error(
        "Lỗi lấy tin đăng:",
        err?.response?.data || err.message || err
      );
      setError("Không thể tải tin đăng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKhuVuc = (payload = {}) => {
    console.log("[TrangChu] handleSearchKhuVuc payload:", payload); // debug
    if (!payload?.KhuVucID) {
      fetchTinDangs(); // load full list
      return;
    }
    fetchTinDangs({ KhuVucID: payload.KhuVucID });
  };

  const formatPrice = (g) => {
    if (!g) return "-";
    const n = Number(g);
    if (isNaN(n)) return g;
    return n.toLocaleString("vi-VN") + " VND";
  };

  const getCurrentUserId = () => {
    try {
      const raw =
        localStorage.getItem("user") || localStorage.getItem("currentUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        const actual = parsed.user ?? parsed;
        const id = actual?.NguoiDungID ?? actual?.id ?? actual?.userId;
        if (id) return Number(id);
      }
    } catch {
      /* ignore */
    }
    const idKey = localStorage.getItem("userId");
    if (idKey && !isNaN(Number(idKey))) return Number(idKey);
    return null;
  };

  const handleAddFavorite = async (tin) => {
    const tinId = tin?.TinDangID ?? tin?.id ?? tin?._id;
    const userId = getCurrentUserId();
    if (!userId) {
      // redirect to login or show message
      window.location.href = "/login";
      return;
    }
    if (!tinId) return;
    setAddingFavId(tinId);
    try {
      await yeuThichApi.add({ NguoiDungID: userId, TinDangID: tinId });
      // simple feedback
      alert("Đã thêm vào yêu thích");
    } catch (err) {
      console.error("Thêm yêu thích lỗi:", err?.response ?? err);
      alert("Thêm yêu thích thất bại");
    } finally {
      setAddingFavId(null);
    }
  };

  // chuyển hàm ra ngoài JSX, đặt trước return
  const getFirstImage = (tin) => {
    const placeholder = "https://via.placeholder.com/160x110?text=No+Image";
    const raw = tin?.URL ?? tin?.Img ?? tin?.Images ?? tin?.images;
    if (!raw) return placeholder;

    const normalizeList = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      if (typeof input === "string") {
        const s = input.trim();
        if (s.startsWith("[") && s.endsWith("]")) {
          try {
            const parsed = JSON.parse(s);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [s];
          }
        }
        return [s];
      }
      return [input];
    };

    const first = normalizeList(raw).find(Boolean);
    if (!first) return placeholder;

    const full = getStaticUrl(first);
    return full || placeholder;
  };

  return (
    <div className="trangchu">
      <Header />
      {/* CHỈNH: truyền onSearch để nhận payload khi bấm Tìm */}
      <SearchKhuVuc onSearch={handleSearchKhuVuc} />

      <div className="content">
        <div className="content1">
          <div className="danhsach">
            {loading && <div className="tindang-loading">Đang tải...</div>}
            {error && <div className="tindang-error">{error}</div>}

            {!loading && tindangs.length === 0 && (
              <div className="tindang-empty">Chưa có tin đăng</div>
            )}

            {tindangs.map((t) => {
              const key = t.TinDangID ?? t.id ?? t._id;
              const imgSrc = getFirstImage(t);

              return (
                <div className="duan" key={key}>
                  <div className="anhduan">
                    <Link to={`/tin-dang/${key}`}>
                      <img src={imgSrc} alt={t.TieuDe} />
                    </Link>
                  </div>
                  <div className="thongtinduan">
                    <div className="tieude">
                      <Link to={`/tin-dang/${key}`}>{t.TieuDe}</Link>
                    </div>
                    <div className="diachi">Địa chỉ: {t.DiaChi ?? "-"}</div>
                    <div className="gia">{formatPrice(t.Gia)}</div>
                    <div className="dientich">
                      Diện tích: {t.DienTich ?? "-"} m2
                    </div>
                    {/* <div className="lienhe">Liên hệ: - </div> */}
                    <div className="thoigian">
                      {t.TaoLuc ? new Date(t.TaoLuc).toLocaleString() : ""}
                      <button
                        type="button"
                        className="fav-btn"
                        onClick={() => handleAddFavorite(t)}
                        disabled={addingFavId === key}
                        title="Thêm vào yêu thích"
                      >
                        🩶 {addingFavId === key ? "..." : ""}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="content2">
          <div className="khuvuc">
            <div className="khuvuc-title">
              Phòng trọ Cho thuê tại các khu vực
            </div>
            <ul>
              <li>Quận Gò Vấp (6)</li>
              <li>Quận 2 (3)</li>
              <li>Quận 3 (23)</li>
              <li>Quận 4 (23)</li>
              <li>Quận Bình Thạnh (12)</li>
              <li>Quận 9 (15)</li>
            </ul>
          </div>
          <div className="tintuc">
            <div className="tintuc-title">Tin Tức Mới Nhất</div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
                <img
                  src="https://tse4.mm.bing.net/th/id/OIP.1a31QUbCZjQD8w2KP2DKnwHaGu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="Ảnh dự án"
                />
              </div>
              <div className="thongtinduan">
                <div className="tieude">
                  Cho thuê phòng trọ ngay quận 2 có đủ tiện nghi
                </div>

                <div className="thoigian">Hôm nay</div>
              </div>
            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
                <img
                  src="https://tse1.mm.bing.net/th/id/OIP.nwpNtC4zPc0jnBd5AULU-gHaFj?rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="Ảnh dự án"
                />
              </div>
              <div className="thongtinduan">
                <div className="tieude">
                  Cho thuê phòng trọ ngay quận 10 có đủ tiện nghi
                </div>

                <div className="thoigian">Hôm nay</div>
              </div>
            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
                <img
                  src="https://th.bing.com/th/id/R.e7fbd2d75d40b4a405a283c4deb7bb37?rik=nUrwglwUVlTZgQ&pid=ImgRaw&r=0"
                  alt="Ảnh dự án"
                />
              </div>
              <div className="thongtinduan">
                <div className="tieude">
                  Cho thuê phòng trọ ngay quận gò vấp có đủ tiện nghi
                </div>

                <div className="thoigian">Hôm nay</div>
              </div>
            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
                <img
                  src="https://tse3.mm.bing.net/th/id/OIP.-6ttgevwVQAzlCfmVixTBQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="Ảnh dự án"
                />
              </div>
              <div className="thongtinduan">
                <div className="tieude">
                  Cho thuê phòng trọ ngay quận 4 có đủ tiện nghi
                </div>

                <div className="thoigian">Hôm nay</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
export default TrangChu;
