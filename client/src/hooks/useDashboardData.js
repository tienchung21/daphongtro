/**
 * Custom Hooks cho Dashboard & Báo cáo Chủ dự án
 * Sử dụng @tanstack/react-query cho data fetching & caching
 */

import { useQuery } from '@tanstack/react-query';
import { DashboardService, BaoCaoService } from '../services/ChuDuAnService';

/**
 * Hook lấy dữ liệu Dashboard (Quick metrics)
 * Sử dụng trong: Dashboard.jsx
 * Cache: 5 phút
 */
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await DashboardService.layDashboard();
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải dữ liệu dashboard');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    retry: 2, // Retry 2 lần cho dashboard (quan trọng)
  });
};

/**
 * Hook lấy báo cáo hiệu suất tổng quan
 * Sử dụng trong: Dashboard.jsx (nếu cần)
 * Cache: 10 phút
 */
export const useBaoCaoData = (filters) => {
  return useQuery({
    queryKey: ['bao-cao', filters],
    queryFn: async () => {
      const response = await BaoCaoService.layBaoCaoHieuSuat(filters);
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải báo cáo');
      }
      return response.data;
    },
    enabled: !!(filters.tuNgay && filters.denNgay), // Chỉ fetch khi có date range
    staleTime: 10 * 60 * 1000, // Cache 10 phút
  });
};

/**
 * Hook lấy báo cáo chi tiết (Enhanced version)
 * Sử dụng trong: BaoCaoHieuSuat.jsx
 * Cache: 10 phút
 */
export const useBaoCaoChiTiet = (filters) => {
  return useQuery({
    queryKey: ['bao-cao-chi-tiet', filters],
    queryFn: async () => {
      const response = await BaoCaoService.layBaoCaoChiTiet(filters);
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải báo cáo chi tiết');
      }
      return response.data;
    },
    enabled: !!(filters.tuNgay && filters.denNgay),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook lấy doanh thu theo tháng (6 tháng)
 * Sử dụng trong: BaoCaoHieuSuat.jsx (Line Chart)
 */
export const useDoanhThuTheoThang = () => {
  return useQuery({
    queryKey: ['doanh-thu-theo-thang'],
    queryFn: async () => {
      const response = await BaoCaoService.layDoanhThuTheoThang();
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải doanh thu');
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // Cache 15 phút (historical data ít thay đổi)
  });
};

/**
 * Hook lấy Top 5 tin đăng
 * Sử dụng trong: BaoCaoHieuSuat.jsx (Bar Chart)
 */
export const useTopTinDang = (filters) => {
  return useQuery({
    queryKey: ['top-tin-dang', filters],
    queryFn: async () => {
      const response = await BaoCaoService.layTopTinDang(filters);
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải top tin đăng');
      }
      return response.data;
    },
    enabled: !!(filters.tuNgay && filters.denNgay),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook lấy Conversion Rate
 * Sử dụng trong: BaoCaoHieuSuat.jsx (KPI Card)
 */
export const useConversionRate = (filters) => {
  return useQuery({
    queryKey: ['conversion-rate', filters],
    queryFn: async () => {
      const response = await BaoCaoService.layConversionRate(filters);
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải conversion rate');
      }
      return response.data;
    },
    enabled: !!(filters.tuNgay && filters.denNgay),
    staleTime: 10 * 60 * 1000,
  });
};
