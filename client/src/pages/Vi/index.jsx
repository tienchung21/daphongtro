import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Vi.css";
import NapTienPage from "../naptien/index";
import viApi from "../../api/viApi";
import lichSuViApi from "../../api/lichSuViApi";
import { HiOutlineDocumentText } from "react-icons/hi2";

function ViPage() {
  const [showNapTien, setShowNapTien] = useState(false);
  const [soDu, setSoDu] = useState(0);
  const [lichSu, setLichSu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id || user.NguoiDungID || user._id;
        // Lấy số dư ví
        if (userId) {
          const res = await viApi.getByUser(userId);
          console.log("🟢 [ViPage] API Response:", res);

          // 1. Xác định đâu là cục data thật
          // Nếu dùng Axios mặc định: data thật nằm ở res.data.data
          // Nếu đã có interceptor: data thật nằm ở res.data
          let realData = res.data;
          if (res.data && res.data.data) {
            realData = res.data.data; // Chọc sâu thêm 1 cấp nếu có
          }

          console.log("🟢 [ViPage] Parsed Data:", realData);

          // 2. Xử lý lấy số dư
          let soDuLayDuoc = 0;

          if (Array.isArray(realData) && realData.length > 0) {
            // Trường hợp trả về Mảng: [{ SoDu: "50000.00" }]
            soDuLayDuoc = Number(realData[0].SoDu);
          } else if (realData && typeof realData === "object") {
            // Trường hợp trả về Object: { SoDu: "50000.00" }
            // Chú ý: Cần kiểm tra cả trường hợp key viết thường (soDu) phòng hờ
            soDuLayDuoc = Number(realData.SoDu || realData.soDu || 0);
          }

          setSoDu(soDuLayDuoc);
        }
        // Lấy lịch sử giao dịch
        if (userId) {
          const res = await lichSuViApi.getByUser(userId);
          const lsData = res?.data?.data;
          if (Array.isArray(lsData)) {
            setLichSu(lsData);
          } else {
            setLichSu([]);
          }
        } else {
          setLichSu([]);
        }
      } catch (err) {
        setLichSu([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (showNapTien) {
    return (
      <div className="vi__naptien-wrapper">
        <NapTienPage onBack={() => setShowNapTien(false)} />
        <button className="vi__back-btn" onClick={() => setShowNapTien(false)}>
          ← Quay lại Ví
        </button>
      </div>
    );
  }

  return (
    <div className="vi">
      <div className="vi__header">
        <div className="vi__icon">💰</div>
        <div className="vi__balance-label">Tổng số dư</div>
        <div className="vi__balance">
          {loading ? (
            <span className="vi__loading">...</span>
          ) : (
            `${Number(soDu).toLocaleString()} ₫`
          )}
        </div>
        <button
          className="vi__deposit-btn"
          onClick={() => setShowNapTien(true)}
        >
          + Nạp tiền
        </button>
      </div>
      <div className="vi__quick-actions">
        <Link to="/hop-dong-cua-toi" className="vi__action-btn">
          <HiOutlineDocumentText />
          <span>Hợp đồng của tôi</span>
        </Link>
      </div>
      <div className="vi__history-section">
        <div className="vi__history-title">Lịch sử giao dịch</div>
        <ul className="vi__history-list">
          {loading ? (
            <li className="vi__loading">Đang tải...</li>
          ) : lichSu.length === 0 ? (
            <li className="vi__empty">Chưa có giao dịch nào</li>
          ) : (
            lichSu.map((item, idx) => (
              <li
                key={item.id}
                className={`vi__history-item vi__history-item--${
                  item.LoaiGiaoDich === "nap" ? "plus" : "minus"
                }`}
              >
                <div className="vi__history-info">
                  <span className="vi__history-type">
                    {item.LoaiGiaoDich === "nap" ? "Nạp tiền" : "Rút tiền"}
                  </span>
                  <span className="vi__history-date">
                    {new Date(item.thoi_gian).toLocaleString()}
                  </span>
                </div>
                <div className="vi__history-amount">
                  {item.LoaiGiaoDich === "nap" ? "+" : "-"}
                  {Number(item.so_tien).toLocaleString()} ₫
                </div>
                <div className="vi__history-desc">
                  Mã GD: {item.ma_giao_dich} | Trạng thái: {item.trang_thai}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default ViPage;
