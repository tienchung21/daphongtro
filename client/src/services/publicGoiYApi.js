/**
 * API Service công khai cho Gợi ý Tin đăng (Khách hàng quét QR)
 * Không yêu cầu authentication
 */

import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const API_BASE_URL = getApiBaseUrl();

// Axios instance không có authentication
const publicClient = axios.create({
  baseURL: `${API_BASE_URL}/api/public/xem-ngay`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor
publicClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error.response?.data || error.message);
  }
);

/**
 * Xem thông tin phòng từ mã QR
 * @param {string} maQR - Mã QR
 * @returns {Promise<Object>} Thông tin phòng
 */
export const xemThongTinQR = async (maQR) => {
  return publicClient.get(`/${maQR}`);
};

/**
 * Phản hồi QR (đồng ý/từ chối xem phòng)
 * @param {string} maQR - Mã QR
 * @param {boolean} dongY - true = đồng ý, false = từ chối
 * @param {string} [thoiGianHen] - Thời gian hẹn từ thiết bị khách hàng (ISO string hoặc MySQL datetime format)
 * @returns {Promise<Object>} Kết quả phản hồi
 */
export const phanHoiQR = async (maQR, dongY, thoiGianHen = null) => {
  const body = { dongY };
  // Chỉ gửi thời gian nếu khách đồng ý (để tạo cuộc hẹn)
  if (dongY && thoiGianHen) {
    body.thoiGianHen = thoiGianHen;
  }
  return publicClient.post(`/${maQR}/phan-hoi`, body);
};

export default {
  xemThongTinQR,
  phanHoiQR
};

