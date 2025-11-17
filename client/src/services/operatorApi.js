/**
 * Operator API Service
 * Tổng hợp các API calls cho Operator (UC-OPER-01 đến UC-OPER-06)
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Axios instance với auth token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để thêm auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== UC-OPER-01: Duyệt Tin đăng ====================
export const tinDangOperatorApi = {
  /**
   * Lấy danh sách tin đăng chờ duyệt
   */
  getDanhSachChoDuyet: (params) => api.get('/api/operator/tin-dang/cho-duyet', { params }),
  
  /**
   * Xem chi tiết tin đăng
   */
  getChiTiet: (id) => api.get(`/api/operator/tin-dang/${id}/chi-tiet`),
  
  /**
   * Duyệt tin đăng
   */
  duyetTin: (id) => api.put(`/api/operator/tin-dang/${id}/duyet`),
  duyetTinDang: (id) => api.put(`/api/operator/tin-dang/${id}/duyet`), // Alias for compatibility
  
  /**
   * Từ chối tin đăng
   */
  tuChoiTin: (id, data) => api.put(`/api/operator/tin-dang/${id}/tu-choi`, data),
  tuChoiTinDang: (id, data) => api.put(`/api/operator/tin-dang/${id}/tu-choi`, data), // Alias
  
  /**
   * Lấy thống kê tin đăng
   */
  getThongKe: () => api.get('/api/operator/tin-dang/thong-ke')
};

// ==================== UC-OPER-02: Quản lý Dự án ====================
export const duAnOperatorApi = {
  /**
   * Lấy danh sách dự án
   */
  getDanhSach: (params) => api.get('/api/operator/du-an', { params }),
  
  /**
   * Lấy chi tiết dự án
   */
  getChiTiet: (id) => api.get(`/api/operator/du-an/${id}`),
  
  /**
   * Tạm ngưng dự án
   */
  tamNgung: (id, data) => api.put(`/api/operator/du-an/${id}/tam-ngung`, data),
  
  /**
   * Kích hoạt dự án
   */
  kichHoat: (id) => api.put(`/api/operator/du-an/${id}/kich-hoat`),
  
  /**
   * Banned dự án
   */
  banned: (id, data) => api.put(`/api/operator/du-an/${id}/banned`, data),
  
  /**
   * Xử lý yêu cầu mở lại
   */
  xuLyYeuCauMoLai: (id, data) => api.put(`/api/operator/du-an/${id}/xu-ly-yeu-cau`, data),
  
  /**
   * Lấy thống kê dự án
   */
  getThongKe: () => api.get('/api/operator/du-an/thong-ke'),
  
  /**
   * Duyệt hoa hồng dự án
   */
  duyetHoaHong: (id) => api.post(`/api/operator/du-an/${id}/duyet-hoa-hong`),
  
  /**
   * Từ chối hoa hồng dự án
   */
  tuChoiHoaHong: (id, data) => api.post(`/api/operator/du-an/${id}/tu-choi-hoa-hong`, data)
};

// ==================== UC-OPER-03: Quản lý Lịch NVBH ====================
export const lichLamViecOperatorApi = {
  /**
   * Lấy lịch tháng
   */
  getLichThang: (year, month) => api.get('/api/operator/lich-lam-viec/tong-hop', { 
    params: { year, month } 
  }),
  
  /**
   * Lấy lịch tổng hợp
   */
  getLichTongHop: (params) => api.get('/api/operator/lich-lam-viec/tong-hop', { params }),
  
  /**
   * Lấy heatmap độ phủ
   */
  getHeatmap: (params) => api.get('/api/operator/lich-lam-viec/heatmap', { params }),
  
  /**
   * Lấy NVBH khả dụng
   */
  getNVBHKhaDung: (params) => api.get('/api/operator/lich-lam-viec/nvbh-kha-dung', { params }),
  
  /**
   * Lấy danh sách cuộc hẹn cần gán
   */
  getCuocHenCanGan: () => api.get('/api/operator/cuoc-hen/can-gan'),
  
  /**
   * Gán lại cuộc hẹn
   */
  ganLaiCuocHen: (id, data) => api.put(`/api/operator/cuoc-hen/${id}/gan-lai`, data)
};

// ==================== UC-OPER-03: Cuộc hẹn (list view cho Operator) ====================
export const cuocHenOperatorApi = {
  /**
   * Lấy danh sách cuộc hẹn với phân trang + bộ lọc
   */
  getDanhSach: (params) => api.get('/api/operator/cuoc-hen', { params }),

  /**
   * Lấy danh sách cuộc hẹn cần gán (alias)
   */
  getCuocHenCanGan: () => api.get('/api/operator/cuoc-hen/can-gan'),

  /**
   * Gán lại cuộc hẹn (alias)
   */
  ganLaiCuocHen: (id, data) => api.put(`/api/operator/cuoc-hen/${id}/gan-lai`, data)
};

// ==================== UC-OPER-04&05: Quản lý Nhân viên ====================
export const nhanVienApi = {
  /**
   * Lấy danh sách nhân viên
   */
  getDanhSach: (params) => api.get('/api/operator/nhan-vien', { params }),
  
  /**
   * Lấy danh sách nhân viên khả dụng (cho gán cuộc hẹn)
   */
  getDanhSachKhaDung: (params) => api.get('/api/operator/nhan-vien/kha-dung', { params }),
  
  /**
   * Lấy chi tiết nhân viên
   */
  getChiTiet: (id) => api.get(`/api/operator/nhan-vien/${id}`),
  
  /**
   * Tạo nhân viên mới
   */
  taoMoi: (data) => api.post('/api/operator/nhan-vien', data),
  
  /**
   * Cập nhật hồ sơ
   */
  capNhat: (id, data) => api.put(`/api/operator/nhan-vien/${id}`, data),
  
  /**
   * Kích hoạt/Vô hiệu hóa nhân viên
   */
  capNhatTrangThai: (id, data) => api.put(`/api/operator/nhan-vien/${id}/trang-thai`, data),
  
  /**
   * Lấy thống kê nhân viên
   */
  getThongKe: () => api.get('/api/operator/nhan-vien/thong-ke')
};

// ==================== UC-OPER-06: Biên bản Bàn giao ====================
export const bienBanApi = {
  /**
   * Lấy danh sách biên bản
   */
  getDanhSach: (params) => api.get('/api/operator/bien-ban', { params }),
  
  /**
   * Lấy danh sách phòng cần bàn giao
   */
  getDanhSachCanBanGiao: (params) => api.get('/api/operator/bien-ban/can-ban-giao', { params }),
  
  /**
   * Lấy chi tiết biên bản
   */
  getChiTiet: (id) => api.get(`/api/operator/bien-ban/${id}`),
  
  /**
   * Tạo biên bản mới
   */
  taoMoi: (data) => api.post('/api/operator/bien-ban', data),
  
  /**
   * Cập nhật biên bản
   */
  capNhat: (id, data) => api.put(`/api/operator/bien-ban/${id}`, data),
  
  /**
   * Ký biên bản
   */
  ky: (id, data) => api.put(`/api/operator/bien-ban/${id}/ky`, data),
  
  /**
   * Lấy thống kê biên bản
   */
  getThongKe: () => api.get('/api/operator/bien-ban/thong-ke')
};

// ==================== Dashboard ====================
export const dashboardOperatorApi = {
  /**
   * Lấy metrics tổng quan
   */
  getMetrics: async () => {
    const [tinDang, duAn, nhanVien, bienBan] = await Promise.all([
      tinDangOperatorApi.getThongKe(),
      duAnOperatorApi.getThongKe(),
      nhanVienApi.getThongKe(),
      bienBanApi.getThongKe()
    ]);
    
    return {
      tinDang: tinDang.data.data,
      duAn: duAn.data.data,
      nhanVien: nhanVien.data.data,
      bienBan: bienBan.data.data
    };
  }
};

// Export default object chứa tất cả APIs (đổi tên Việt hóa: NVDH)
const nvdhApi = {
  tinDang: tinDangOperatorApi,
  duAn: duAnOperatorApi,
  lichLamViec: lichLamViecOperatorApi,
  cuocHen: cuocHenOperatorApi,
  nhanVien: nhanVienApi,
  bienBan: bienBanApi,
  dashboard: dashboardOperatorApi
};

// Giữ alias cũ để tương thích tạm thời, nhưng ưu tiên dùng nvdhApi
const operatorApi = nvdhApi;

// Export cả 2 (ưu tiên dùng nvdhApi)
export { nvdhApi, operatorApi };
export default nvdhApi;

