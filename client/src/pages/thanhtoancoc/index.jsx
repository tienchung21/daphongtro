import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './thanhtoancoc.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ThanhToanCoc() {
  const q = useQuery();
  const navigate = useNavigate();

  // allow override via query params, otherwise use sensible defa   ults
  const acc = q.get('acc') ?? '80349195777';
  const bank = q.get('bank') ?? 'TPBank';
  const amount = q.get('amount') ?? '2000';
  const des = q.get('des') ?? 'donhang666666';
  const order = q.get('order') ?? '';

  const qrUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(acc)}&bank=${encodeURIComponent(bank)}&amount=${encodeURIComponent(amount)}&des=${encodeURIComponent(des)}`;

  const handlePaid = () => {
    if (!window.confirm('Xác nhận bạn đã chuyển tiền đặt cọc?')) return;
    // temporary client-side confirmation. If you have API to notify, call it here.
    console.log('[ThanhToanCoc] user confirmed payment', { order, acc, bank, amount, des });
    alert('Ghi nhận: bạn đã xác nhận đã thanh toán đặt cọc.');
    navigate('/thanhtoan'); // redirect to history page (adjust if needed)
  };

  return (
    <div className="thanhtoancoc-page">
      <Header />

      <main className="ttc-container">
        <h3>Thanh toán đặt cọc</h3>

        <div className="ttc-info">
          <div>Đơn hàng: <strong>{order || '—'}</strong></div>
          <div>Ngân hàng: <strong>{bank}</strong></div>
          <div>Số tài khoản: <strong>{acc}</strong></div>
          <div>Số tiền: <strong>{Number(amount).toLocaleString('vi-VN')} đ</strong></div>
          <div>Nội dung: <strong>{decodeURIComponent(des)}</strong></div>
        </div>

        <div className="ttc-qr-wrap">
          <img src={qrUrl} alt="QR thanh toán đặt cọc" className="ttc-qr" />
        </div>

        <div className="ttc-actions">
          <button className="btn btn-primary" onClick={handlePaid}>Tôi đã thanh toán</button>
          <button className="btn" onClick={() => navigate(-1)}>Quay lại</button>
        </div>

       
      </main>

      <Footer />
    </div>
  );
}