/**
 * @fileoverview Trang Quản lý Hợp đồng
 * @component QuanLyHopDong
 */

import React, { useState, useEffect } from 'react';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import {
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye
} from 'react-icons/hi2';
import { layDanhSachHopDong } from '../../services/HopDongService';
import './QuanLyHopDong.css';

/**
 * Trang Quản lý Hợp đồng
 */
export default function QuanLyHopDong() {
  const [hopDongs, setHopDongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tuNgay: '',
    denNgay: ''
  });

  useEffect(() => {
    taiDanhSach();
  }, []);

  const taiDanhSach = async () => {
    try {
      setLoading(true);
      const data = await layDanhSachHopDong(filters);
      setHopDongs(data);
    } catch (error) {
      console.error('Lỗi tải danh sách hợp đồng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const apDungFilter = () => {
    taiDanhSach();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <ChuDuAnLayout>
      <div className="qlhd-container">
        {/* Header */}
        <div className="qlhd-header">
          <div className="qlhd-header-left">
            <HiOutlineDocumentText className="qlhd-icon-large" />
            <div>
              <h1>Quản lý Hợp đồng</h1>
              <p className="qlhd-subtitle">Danh sách hợp đồng cho thuê đã báo cáo</p>
            </div>
          </div>
        </div>

      {/* Filters */}
      <div className="qlhd-filters">
        <div className="qlhd-filter-group">
          <label>
            <HiOutlineCalendar />
            Từ ngày
          </label>
          <input
            type="date"
            name="tuNgay"
            value={filters.tuNgay}
            onChange={handleFilterChange}
          />
        </div>

        <div className="qlhd-filter-group">
          <label>
            <HiOutlineCalendar />
            Đến ngày
          </label>
          <input
            type="date"
            name="denNgay"
            value={filters.denNgay}
            onChange={handleFilterChange}
          />
        </div>

        <button className="btn-filter" onClick={apDungFilter}>
          Áp dụng
        </button>
      </div>

      {/* Stats */}
      <div className="qlhd-stats">
        <div className="stat-card">
          <HiOutlineDocumentText className="stat-icon" />
          <div className="stat-content">
            <h3>{hopDongs.length}</h3>
            <p>Tổng hợp đồng</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="qlhd-table-container">
        {loading ? (
          <div className="qlhd-loading">Đang tải...</div>
        ) : hopDongs.length === 0 ? (
          <div className="qlhd-empty">
            <HiOutlineDocumentText className="empty-icon" />
            <p>Chưa có hợp đồng nào được báo cáo</p>
          </div>
        ) : (
          <table className="qlhd-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Tin đăng</th>
                <th>Phòng</th>
                <th>Khách hàng</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Giá thuê</th>
                <th>Cọc</th>
                <th>Báo cáo lúc</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {hopDongs.map(hd => (
                <tr key={hd.HopDongID}>
                  <td>#{hd.HopDongID}</td>
                  <td>
                    <div className="td-tin-dang">
                      <HiOutlineDocumentText />
                      <span>{hd.TenTinDang}</span>
                    </div>
                  </td>
                  <td>{hd.TenPhong || 'N/A'}</td>
                  <td>
                    <div className="td-khach-hang">
                      <HiOutlineUser />
                      <div>
                        <p className="kh-name">{hd.TenKhachHang}</p>
                        <p className="kh-phone">{hd.SoDienThoai}</p>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(hd.NgayBatDau)}</td>
                  <td>{formatDate(hd.NgayKetThuc)}</td>
                  <td className="td-currency">{formatCurrency(hd.GiaThueCuoiCung)}</td>
                  <td>
                    <div className="td-coc">
                      <span className="coc-amount">{formatCurrency(hd.SoTienCoc)}</span>
                      {hd.TrangThaiCoc === 'DaGiaiToa' && (
                        <span className="badge badge-success">
                          <HiOutlineCheckCircle /> Đã giải tỏa
                        </span>
                      )}
                      {hd.TrangThaiCoc === 'DaDoiTru' && (
                        <span className="badge badge-info">
                          <HiOutlineCheckCircle /> Đã đối trừ
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(hd.BaoCaoLuc)}</td>
                  <td>
                    <button className="btn-action btn-view" title="Xem chi tiết">
                      <HiOutlineEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </ChuDuAnLayout>
  );
}
