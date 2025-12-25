import React, { useState } from "react";
import "./footer.css";
import HommyLogoIcon from "../assets/images/Hommy_Logo_Icon.svg";

const SocialLink = ({ href, label, children }) => (
  <a
    className="social-btn"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
  >
    {children}
    <span className="sr-only">{label}</span>
  </a>
);

function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    // placeholder behavior: chỉ hiển thị xác nhận client-side
    setSent(true);
    setTimeout(() => {
      setEmail("");
      setSent(false);
    }, 2200);
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-about">
            <h1 className="logo-text">
              <img src={HommyLogoIcon} alt="Hommy Logo" className="footer-logo" />
              <span>Phòng Trọ Hommy</span>
            </h1>
            <p className="muted">
              Tìm kiếm và quản lý phòng trọ nhanh chóng — an toàn, tiện lợi.
            </p>
            <div className="contact">
              <div>📞 0349195610</div>
              <div>✉️ phongtrohommy@email.com</div>
            </div>
          </div>
          <div className="footer-links">
            <h3>Liên kết nhanh</h3>
            <ul>
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li>
                <a href="/quanlytindang">Quản lý tin</a>
              </li>
              <li>
                <a href="/thanhtoancoc">Thanh toán</a>
              </li>
              <li>
                <a href="/contact">Liên hệ</a>
              </li>
            </ul>
          </div>
          <div className="footer-news">
            <h3>Nhận thông báo</h3>
            <p className="muted">
              Đăng ký nhận tin khuyến mãi và cập nhật mới.
            </p>
            <form className="subscribe-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email"
              />
              <button type="submit" className="btn-primary">
                {sent ? "Đã gửi" : "Đăng ký"}
              </button>
            </form>

            {/* ✅ Thêm container cho social links */}
            <div className="social-links">
            <SocialLink href="https://facebook.com" label="Facebook">
  <img
    src="https://event.cafeland.vn/event/app/images/facebook.png"
    alt="Facebook"
    className="icon"
  />
</SocialLink>

<SocialLink href="https://twitter.com" label="Twitter">
  <img
    src="https://event.cafeland.vn/event/app/images/twitter.png"
    alt="Twitter"
    className="icon"
  />
</SocialLink>

<SocialLink href="https://instagram.com" label="Instagram">
  <img
    src="https://event.cafeland.vn/event/app/images/google.png"
    alt="Instagram"
    className="icon"
  />
</SocialLink>

<SocialLink href="https://youtube.com" label="YouTube">
  <img
    src="https://event.cafeland.vn/event/app/images/linkedin.png"
    alt="YouTube"
    className="icon"
  />
</SocialLink>


            </div>
          </div>{" "}
          {/* ✅ Đóng footer-news */}
        </div>{" "}
        {/* ✅ Đóng footer-top */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Phòng Trọ. All rights reserved.
          </div>
          <div className="small-muted">
            Thiết kế gọn nhẹ — trải nghiệm tối ưu trên mobile.
          </div>
        </div>
      </div>{" "}
      {/* ✅ Đóng footer-inner */}
    </footer>
  );
}

export default Footer;
