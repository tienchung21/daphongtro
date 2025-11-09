import React, { useState } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import './login.scss';
import deerImg from '../../assets/images/hinhdauhuou.png';
import authApi from '../../api/authApi';
import CryptoJS from 'crypto-js'; // 🟢 THÊM: dùng để mã hóa MD5


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // hiệu ứng cầu vồng 😆
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 🟢 MÃ HÓA MẬT KHẨU TRƯỚC KHI GỬI LÊN BACKEND
      const hashedPassword = CryptoJS.MD5(password).toString();

      const res = await authApi.login({
        email,
        password: hashedPassword, // gửi bản MD5 thay vì mật khẩu gốc
      });

      console.log('Kết quả đăng nhập:', res.data);

      // 🟢 Lưu token và thông tin user vào localStorage
      const { token, user } = res.data;
      localStorage.setItem('user', JSON.stringify({
        token,
        ...user
      }));

      alert('Đăng nhập thành công!');
      
      // 🟢 Redirect theo vai trò (VaiTroID theo DB: 1=Khách hàng, 3=Chủ dự án)
      const vaiTroId = user?.VaiTroHoatDongID || user?.VaiTroID || user?.roleId;
      const tenVaiTro = user?.TenVaiTro || user?.VaiTro || user?.role;
      
      // Check cả VaiTroID (3) và TenVaiTro ("Chủ dự án")
      if (vaiTroId === 3 || tenVaiTro === 'Chủ dự án' || tenVaiTro === 'chuduan') {
        // Chủ dự án → Dashboard
        navigate('/chu-du-an/dashboard');
      } else {
        // Khách hàng hoặc vai trò khác → Trang chủ
        navigate('/');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError('Sai email hoặc mật khẩu!');
    }
  };

  return (
    <div
      className={`login-page${isSwitchOn ? ' rainbow' : ''}`}
      style={{
        background: isSwitchOn ? undefined : '#f5f6fa',
        transition: 'background 0.3s',
      }}
    >
      <form className="login-form" onSubmit={handleSubmit}>
        <img src={deerImg} alt="Logo" className="deer-bg" />

        <h2>Đăng nhập</h2>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="form-group ">
          <label htmlFor="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Đăng nhập</button>

        <button
          type="button"
          className="back-home-btn"
          onClick={() => navigate('/')}
        >
          Quay lại trang chủ
        </button>

        <div className="login-links">
          <a href="#">Quên mật khẩu?</a>
          <Link to="/dangky">Đăng ký tài khoản mới</Link>
        </div>

        {/* Chế độ cầu vồng */}
        <div className="toggle-switch">
          <label className="switch">
            <input
              type="checkbox"
              checked={isSwitchOn}
              onChange={() => setIsSwitchOn(!isSwitchOn)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </form>
    </div>
  );
}

export default Login;
