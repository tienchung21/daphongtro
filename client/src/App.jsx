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
import CaiDat from './pages/ChuDuAn/CaiDat'; // ✨ Cài đặt tài khoản Chủ dự án

// Import trang Chi Tiết Tin Đăng cho Khách hàng
import ChiTietTinDangKhachHang from './pages/chitiettindang'; // 🎯 Soft Tech Theme - Dành cho khách hàng

// Import từ upstream
import QuanLyTaiKhoan from './pages/quanlytaikhoan';
import SearchKhuVuc from './components/SearchKhuVuc';
import QuanLyTinDang from './pages/quanlytindang';
import QuanLyKhuVuc from './pages/quanlykhuvuc';
import ThanhToan from './pages/thanhtoan';
import ThanhToanCoc from './pages/thanhtoancoc';
import Appointments from './pages/cuochencuatoi'; // đúng thư mục hiện tại
import QuanLy from './pages/QuanLy';
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
      
      {/* Routes cho Chủ dự án */}
      <Route path='/chu-du-an/dashboard' element={<DashboardChuDuAn />} />
      <Route path='/chu-du-an/du-an' element={<QuanLyDuAn />} /> {/* ✨ Quản lý dự án */}
      <Route path='/chu-du-an/tin-dang' element={<QuanLyTinDangChuDuAn />} />
      <Route path='/chu-du-an/tin-dang/:id' element={<ChiTietTinDang />} /> {/* ✨ Light Glass Morphism Theme */}
      <Route path='/chu-du-an/tao-tin-dang' element={<TaoTinDang />} />
      <Route path='/chu-du-an/chinh-sua-tin-dang/:id' element={<ChinhSuaTinDang />} />
      <Route path='/chu-du-an/bao-cao' element={<BaoCaoHieuSuat />} />
      <Route path='/chu-du-an/cuoc-hen' element={<QuanLyCuocHen />} /> {/* ✨ UC-PROJ-02: Quản lý cuộc hẹn */}
      <Route path='/cai-dat' element={<CaiDat />} /> {/* ✨ Cài đặt tài khoản Chủ dự án */}
      
      {/* Routes từ upstream */}
      <Route path='/searchkhuvuc' element={<SearchKhuVuc />} />
      <Route path="/quanlytaikhoan" element={<QuanLyTaiKhoan />} />
      <Route path="/quanlytindang" element={<QuanLyTinDang />} />
      <Route path="/quanlykhuvuc" element={<QuanLyKhuVuc />} />
      <Route path="/thanhtoan" element={<ThanhToan />} />
      <Route path="/thanhtoancoc" element={<ThanhToanCoc />} />
      <Route path="/cuochencuatoi" element={<Appointments />} />
 

<Route path="/quan-ly" element={<QuanLy />} />
    </Routes>
        </div>
 
  )
}

export default App
