import React, { useState } from "react";
import "./naptien.css";

const NapTienPage = () => {
  const [amount, setAmount] = useState("");

  // Thông tin tài khoản mẫu
  const acc = "80349195777";
  const bank = "TPBank";
  const des = "Naptien";

  // Link QR sepay đúng chuẩn
  const qrUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(
    acc
  )}&bank=${encodeURIComponent(bank)}&amount=${encodeURIComponent(
    amount
  )}&des=${encodeURIComponent(des)}`;

  const handleCancel = () => {
    setAmount("");
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    alert("Đã sao chép link QR!");
  };

  return (
    <div className="napTien__wrapper">
      <div className="napTien__card">
        <h2 className="napTien__title">Tạo yêu cầu nạp tiền</h2>
        <div className="napTien__desc">
          1. Nhập số tiền. 2. Quét mã QR bằng app ngân hàng.
        </div>
        <div className="napTien__amount">
          {parseInt(amount || 0).toLocaleString()} VNĐ
        </div>
        {amount && parseInt(amount) > 0 && (
          <div className="napTien__qr">
            <img src={qrUrl} alt="QR nạp tiền" className="napTien__qr-img" />
            <button className="napTien__copy-link" onClick={handleCopy}>
              📋 Sao chép link QR
            </button>
          </div>
        )}
        <form className="napTien__form" onSubmit={(e) => e.preventDefault()}>
          <label className="napTien__form-label">
            Nhập số tiền cần nạp
            <input
              className="napTien__form-input"
              type="number"
              min={1000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Số tiền VNĐ"
            />
          </label>
        </form>
        <div className="napTien__actions">
          <button
            className="napTien__btn napTien__btn--cancel"
            onClick={handleCancel}
          >
            Hủy giao dịch
          </button>
          <button
            className="napTien__btn napTien__btn--secondary"
            onClick={handleScrollTop}
          >
            Quay về
          </button>
        </div>
        <div className="napTien__footer">
          <span>
            Ngân hàng: <strong>{bank}</strong>
          </span>{" "}
          |{" "}
          <span>
            Số tài khoản: <strong>{acc}</strong>
          </span>{" "}
          |{" "}
          <span>
            Nội dung: <strong>{des}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default NapTienPage;
