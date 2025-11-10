import React, { useState } from "react";
import "./footer.css";

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

            <div className="social-row">
              <SocialLink href="https://facebook.com" label="Facebook">
                {/* Facebook SVG */}
                <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M22 12a10 10 0 10-11.5 9.9v-7h-2.1V12h2.1V9.8c0-2.1 1.3-3.3 3.2-3.3.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.3V12h2.3l-.4 2.9h-1.9v7A10 10 0 0022 12z"
                  />
                </svg>
              </SocialLink>

              <SocialLink href="https://youtube.com" label="YouTube">
                {/* YouTube SVG */}
                <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.6 7.2s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1-3-.2-7.5-.2-7.5-.2s-4.6 0-7.5.2c-.4.1-1.3.1-2.1 1C2.6 5.6 2.4 7.2 2.4 7.2S2 9 2 10.8v2.4c0 1.8.4 3.6.4 3.6s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.7.1 7.1.2 7.1.2s4.6 0 7.5-.2c.4-.1 1.3-.1 2.1-1 .6-.7.8-2.3.8-2.3s.4-1.8.4-3.6v-2.4c0-1.8-.4-3.6-.4-3.6zM9.8 15.1V8.9l5.6 3.1-5.6 3.1z"
                  />
                </svg>
              </SocialLink>

              <SocialLink href="https://tiktok.com" label="TikTok">
                {/* TikTok SVG */}
                <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M16.5 3h2.4v3.6c-1.3 0-2.6-.3-3.6-.9v5.3a4 4 0 11-4-4V3h3.2C16 3.5 16.3 3.7 16.5 3z"
                  />
                </svg>
              </SocialLink>

              <SocialLink href="https://instagram.com" label="Instagram">
                {/* Instagram SVG */}
                <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.4-2.6a1.2 1.2 0 11-1.2-1.2 1.2 1.2 0 011.2 1.2zM12 15.4A3.4 3.4 0 1115.4 12 3.4 3.4 0 0112 15.4z"
                  />
                </svg>
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Phòng Trọ. All rights reserved.
          </div>
          <div className="small-muted">
            Thiết kế gọn nhẹ — trải nghiệm tối ưu trên mobile.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
