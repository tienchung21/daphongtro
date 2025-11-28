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
      
      // ✅ FIX CRITICAL: Lưu token riêng để API services dùng
      localStorage.setItem('token', token);
      
      // Lưu thông tin user
      localStorage.setItem('user', JSON.stringify({
        token,
        ...user
      }));

      alert('Đăng nhập thành công!');
      
      // 🟢 Redirect theo vai trò (VaiTroID theo DB)
      // 1=Khách hàng, 2=Nhân viên Bán hàng, 3=Chủ dự án, 4=Điều hành, 5=Admin
      const vaiTroId = user?.VaiTroHoatDongID || user?.VaiTroID || user?.roleId;
      const tenVaiTro = user?.TenVaiTro || user?.VaiTro || user?.role;
      
      // 🔍 DEBUG: Log để kiểm tra
      console.log('📊 Login Debug:', {
        vaiTroId,
        tenVaiTro,
        VaiTroHoatDongID: user?.VaiTroHoatDongID,
        VaiTroID: user?.VaiTroID,
        fullUser: user
      });
      
      // Route theo vai trò
      if (vaiTroId === 2 || tenVaiTro === 'Nhân viên Bán hàng' || tenVaiTro === 'NhanVienBanHang') {
        // Nhân viên Bán hàng → Dashboard NVBH
        console.log('✅ Redirecting to NVBH Dashboard');
        navigate('/nhan-vien-ban-hang');
      } else if (vaiTroId === 3 || tenVaiTro === 'Chủ dự án' || tenVaiTro === 'chuduan') {
        // Chủ dự án → Dashboard Chủ dự án
        console.log('✅ Redirecting to Chủ dự án Dashboard');
        navigate('/chu-du-an/dashboard');
      } else if (vaiTroId === 4 || tenVaiTro === 'Nhân viên Điều hành' || tenVaiTro === 'DieuHanh' || tenVaiTro === 'Operator') {
        // Điều hành → Trang quản lý
        console.log('✅ Redirecting to Quan Ly');
        navigate('/nvdh/dashboard');
      } else if (vaiTroId === 5 || tenVaiTro === 'Quản trị viên Hệ thống' || tenVaiTro === 'Admin') {
        // Admin → Trang quản lý
        console.log('✅ Redirecting to Quan Ly');
        navigate('/quan-ly');
      } else {
        // Khách hàng hoặc vai trò khác → Trang chủ
        console.log('✅ Redirecting to Home');
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
