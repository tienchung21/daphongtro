import './footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h1 className="logo-text"><span>Phòng Trọ</span></h1>
          <p>
            Trang web giúp bạn tìm kiếm phòng trọ dễ dàng và nhanh chóng.
          </p>
          <div className="contact">
            <span> 123-456-789</span>
            <span> phongtro@email.com</span>
          </div>
        </div>
        <div className="footer-section links">
          <h2>Liên kết</h2>
          <ul>
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Bảng giá dịch vụ</a></li>
          </ul>
        </div>
        <div className="footer-section social">
          <h2>Kết nối</h2>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook"></i> Facebook</a>
            <a href="#"><i className="fab fa-instagram"></i> Instagram</a>
            <a href="#"><i className="fab fa-twitter"></i> Twitter</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; dự án phòng trọ mới nhất
      </div>
    </footer>
  );
}

export default Footer;