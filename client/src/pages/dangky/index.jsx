import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dangky.scss';
import deerImg from '../../assets/images/hinhdauhuou.png';
import authApi from '../../api/authApi';
import CryptoJS from 'crypto-js';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('khachhang');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // MD5 password trước khi gửi
      const hashedPassword = CryptoJS.MD5(password).toString();

      // Map role sang roleId (chỉnh theo backend nếu cần)
      const roleId = role === 'chuduan' ? 2 : 1;

      const payload = {
        name: fullname,
        email,
        phone,
        password: hashedPassword,
        roleId,
      };

      const res = await authApi.register(payload); // [`authApi.register`](src/api/authApi.js)
      console.log('register res', res.data);
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      console.error('Lỗi đăng ký:', err?.response?.data || err.message);
      alert(err?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
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
        <h2>Đăng ký tài khoản</h2>
        <div className="form-group">
          <label htmlFor="fullname">Họ tên:</label>
          <input
            type="text"
            id="fullname"
            placeholder="Nhập họ tên"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="phone">Số điện thoại:</label>
          <input
            type="tel"
            id="phone"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
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
        <div className="form-group">
          <label htmlFor="role">Vai trò:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="chuduan">Chủ dự án</option>
            <option value="khachhang">Khách hàng</option>
          </select>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
        </button>

        <button
          type="button"
          className="back-home-btn"
          onClick={() => navigate('/')}
        >
          Quay lại trang chủ
        </button>
        <div className="login-links">
          <a href="#">Đã có tài khoản? Đăng nhập</a>
        </div>
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

export default Register;