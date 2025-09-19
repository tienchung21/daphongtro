import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import deerImg from '../../assets/images/hinhdauhuou.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // nút bấm
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý đăng nhập ở đây
    alert(`Email: ${email}\nPassword: ${password}`);
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
          <a href="#">Đăng ký tài khoản mới</a>
        </div>
        {/* chế độ hủy diệt */}
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