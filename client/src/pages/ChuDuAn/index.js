/**
 * Export tất cả components của Chủ dự án
 * Tổ chức theo use cases trong đặc tả v1.2
 */

// UC-PROJ-03: Dashboard tổng quan
export { default as DashboardChuDuAn } from './Dashboard';

// UC-PROJ-01: Quản lý tin đăng
export { default as QuanLyTinDang } from './QuanLyTinDang';
export { default as ChiTietTinDang } from './ChiTietTinDang'; // Original + Enhanced
export { default as ChiTietTinDangV3 } from './ChiTietTinDang_v3'; // ✨ REDESIGNED V3 - Figma-Inspired
export { default as TaoTinDang } from './TaoTinDang';
export { default as ChinhSuaTinDang } from './ChinhSuaTinDang';
export { default as QuanLyNhap } from './QuanLyNhap';

// UC-PROJ-03: Báo cáo hiệu suất
export { default as BaoCaoHieuSuat } from './BaoCaoHieuSuat';

// TODO: Các components khác sẽ được bổ sung
// UC-PROJ-02: Quản lý cuộc hẹn
// UC-PROJ-04: Báo cáo hợp đồng cho thuê
// UC-PROJ-05: Nhắn tin