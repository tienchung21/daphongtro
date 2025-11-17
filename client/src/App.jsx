import { Routes, Route } from 'react-router-dom';
import './App.css';
import TrangChu from './pages/trangchu';
import Login from './pages/login';
import Dangky from './pages/dangky';

// Import các components cho Chủ dự án
import DashboardChuDuAn from './pages/ChuDuAn/Dashboard'; // ✨ Light Glass Morphism với Dashboard mới
import QuanLyTinDangChuDuAn from './pages/ChuDuAn/QuanLyTinDang'; // Alias để tránh conflict
import ChiTietTinDang from './pages/ChuDuAn/ChiTietTinDang'; // ✨ Light Glass Morphism Theme
import BaoCaoHieuSuat from './pages/ChuDuAn/BaoCaoHieuSuat';
import TaoTinDang from './pages/ChuDuAn/TaoTinDang';
import ChinhSuaTinDang from './pages/ChuDuAn/ChinhSuaTinDang';
import QuanLyDuAn from './pages/ChuDuAn/QuanLyDuAn'; // ✨ Quản lý dự án (UC-PROJ-01 utilities)
import QuanLyCuocHen from './pages/ChuDuAn/QuanLyCuocHen'; // ✨ UC-PROJ-02: Quản lý cuộc hẹn
import QuanLyHopDong from './pages/ChuDuAn/QuanLyHopDong'; // ✨ UC-PROJ-04: Quản lý hợp đồng
import TinNhan from './pages/ChuDuAn/TinNhan'; // ✨ UC-PROJ-05: Tin nhắn Chủ dự án
import ChiTietTinNhan from './pages/ChuDuAn/ChiTietTinNhan'; // ✨ Chi tiết cuộc hội thoại
import CaiDat from './pages/ChuDuAn/CaiDat'; // ✨ Cài đặt tài khoản Chủ dự án

// Import trang Chi Tiết Tin Đăng cho Khách hàng
import ChiTietTinDangKhachHang from './pages/chitiettindang'; // 🎯 Soft Tech Theme - Dành cho khách hàng

// Import cho Nhân viên Bán hàng (UC-SALE-01 đến UC-SALE-07)
import LayoutNhanVienBanHang from './components/NhanVienBanHang/LayoutNhanVienBanHang';
import DashboardNVBH from './pages/NhanVienBanHang/Dashboard';
import LichLamViec from './pages/NhanVienBanHang/LichLamViec';
import QuanLyCuocHenNVBH from './pages/NhanVienBanHang/QuanLyCuocHen';
import ChiTietCuocHenNVBH from './pages/NhanVienBanHang/ChiTietCuocHen';
import QuanLyGiaoDich from './pages/NhanVienBanHang/QuanLyGiaoDich';
import BaoCaoThuNhap from './pages/NhanVienBanHang/BaoCaoThuNhap';
import TinNhanNVBH from './pages/NhanVienBanHang/TinNhan';
import ChiTietTinNhanNVBH from './pages/NhanVienBanHang/ChiTietTinNhan';
import CaiDatNhanVienBanHang from './pages/NhanVienBanHang/CaiDat';

// Import cho Operator (UC-OPER-01 đến UC-OPER-06)
import DashboardOperator from './pages/Operator/DashboardOperator';
import DuyetTinDang from './pages/Operator/DuyetTinDang';
import QuanLyDuAnOperator from './pages/Operator/QuanLyDuAnOperator';
import QuanLyLichNVBH from './pages/Operator/QuanLyLichNVBH';
import QuanLyNhanVien from './pages/Operator/QuanLyNhanVien';
import QuanLyBienBan from './pages/Operator/QuanLyBienBan';

// Import từ upstream
import QuanLyTaiKhoan from './pages/quanlytaikhoan';
import SearchKhuVuc from './components/SearchKhuVuc';
import QuanLyTinDang from './pages/quanlytindang';
import QuanLyKhuVuc from './pages/quanlykhuvuc';
import ThanhToan from './pages/thanhtoan';
import ThanhToanCoc from './pages/thanhtoancoc';

function App() {

  return (

      <div className="App"> 
    <Routes>
      <Route path='/' element={<TrangChu />} />
      {/* <Route path='/about' element={<div>About Page</div>} /> */}
      <Route path='/login' element={<Login />} />
      <Route path='/dangky' element={<Dangky />} />
      
      {/* 🎯 Route cho Khách hàng - Chi tiết tin đăng công khai (Soft Tech Theme) */}
      <Route path='/tin-dang/:id' element={<ChiTietTinDangKhachHang />} />
      
      {/* Routes cho Nhân viên Bán hàng */}
      <Route path='/nhan-vien-ban-hang' element={<LayoutNhanVienBanHang />}>
        <Route index element={<DashboardNVBH />} />
        <Route path='lich-lam-viec' element={<LichLamViec />} />
        <Route path='cuoc-hen' element={<QuanLyCuocHenNVBH />} />
        <Route path='cuoc-hen/:id' element={<ChiTietCuocHenNVBH />} />
        <Route path='giao-dich' element={<QuanLyGiaoDich />} />
        <Route path='thu-nhap' element={<BaoCaoThuNhap />} />
        <Route path='tin-nhan' element={<TinNhanNVBH />} />
        <Route path='tin-nhan/:id' element={<ChiTietTinNhanNVBH />} />
        <Route path='cai-dat' element={<CaiDatNhanVienBanHang />} />
      </Route>

      {/* Routes cho NVDH (UC-OPER-01 đến UC-OPER-06) */}
      <Route path='/nvdh/dashboard' element={<DashboardOperator />} />
      <Route path='/nvdh/duyet-tin-dang' element={<DuyetTinDang />} />
      <Route path='/nvdh/du-an' element={<QuanLyDuAnOperator />} />
      <Route path='/nvdh/lich-nvbh' element={<QuanLyLichNVBH />} />
      <Route path='/nvdh/nhan-vien' element={<QuanLyNhanVien />} />
      <Route path='/nvdh/bien-ban' element={<QuanLyBienBan />} />

      {/* Routes cho Chủ dự án */}
      <Route path='/chu-du-an/dashboard' element={<DashboardChuDuAn />} />
      <Route path='/chu-du-an/du-an' element={<QuanLyDuAn />} /> {/* ✨ Quản lý dự án */}
      <Route path='/chu-du-an/tin-dang' element={<QuanLyTinDangChuDuAn />} />
      <Route path='/chu-du-an/tin-dang/:id' element={<ChiTietTinDang />} /> {/* ✨ Light Glass Morphism Theme */}
      <Route path='/chu-du-an/tao-tin-dang' element={<TaoTinDang />} />
      <Route path='/chu-du-an/chinh-sua-tin-dang/:id' element={<ChinhSuaTinDang />} />
      <Route path='/chu-du-an/bao-cao' element={<BaoCaoHieuSuat />} />
      <Route path='/chu-du-an/cuoc-hen' element={<QuanLyCuocHen />} /> {/* ✨ UC-PROJ-02: Quản lý cuộc hẹn */}
      <Route path='/chu-du-an/hop-dong' element={<QuanLyHopDong />} /> {/* ✨ UC-PROJ-04: Quản lý hợp đồng */}
      <Route path='/chu-du-an/tin-nhan' element={<TinNhan />} /> {/* ✨ UC-PROJ-05: Tin nhắn */}
      <Route path='/chu-du-an/tin-nhan/:id' element={<ChiTietTinNhan />} /> {/* ✨ Chi tiết cuộc hội thoại */}
      <Route path='/cai-dat' element={<CaiDat />} /> {/* ✨ Cài đặt tài khoản Chủ dự án */}
      
      {/* Routes từ upstream */}
      <Route path='/searchkhuvuc' element={<SearchKhuVuc />} />
      <Route path="/quanlytaikhoan" element={<QuanLyTaiKhoan />} />
      <Route path="/quanlytindang" element={<QuanLyTinDang />} />
      <Route path="/quanlykhuvuc" element={<QuanLyKhuVuc />} />
      <Route path="/thanhtoan" element={<ThanhToan />} />
      <Route path="/thanhtoancoc" element={<ThanhToanCoc />} />
    </Routes>
        </div>
 
  )
}

export default App
