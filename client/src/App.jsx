
import { Routes, Route } from 'react-router-dom';
import './App.css';
import TrangChu from './pages/trangchu';
import Login from './pages/login';
import Dangky from './pages/dangky';

// Import các components cho Chủ dự án
import DashboardChuDuAn from './pages/ChuDuAn/Dashboard'; // ✨ Light Glass Morphism với Dashboard mới
import QuanLyTinDang from './pages/ChuDuAn/QuanLyTinDang';
import ChiTietTinDang from './pages/ChuDuAn/ChiTietTinDang'; // ✨ Light Glass Morphism Theme
import BaoCaoHieuSuat from './pages/ChuDuAn/BaoCaoHieuSuat';
import TaoTinDang from './pages/ChuDuAn/TaoTinDang';
import ChinhSuaTinDang from './pages/ChuDuAn/ChinhSuaTinDang';
import QuanLyDuAn from './pages/ChuDuAn/QuanLyDuAn'; // ✨ Quản lý dự án (UC-PROJ-01 utilities)

function App() {

  return (

      <div className="App"> 
    <Routes>
      <Route path='/' element={<TrangChu />} />
      {/* <Route path='/about' element={<div>About Page</div>} /> */}
      <Route path='/login' element={<Login />} />
      <Route path='/dangky' element={<Dangky />} />
      
      {/* Routes cho Chủ dự án */}
      <Route path='/chu-du-an/dashboard' element={<DashboardChuDuAn />} />
      <Route path='/chu-du-an/du-an' element={<QuanLyDuAn />} /> {/* ✨ Quản lý dự án */}
      <Route path='/chu-du-an/tin-dang' element={<QuanLyTinDang />} />
      <Route path='/chu-du-an/tin-dang/:id' element={<ChiTietTinDang />} /> {/* ✨ Light Glass Morphism Theme */}
      <Route path='/chu-du-an/tao-tin-dang' element={<TaoTinDang />} />
      <Route path='/chu-du-an/chinh-sua-tin-dang/:id' element={<ChinhSuaTinDang />} />
      <Route path='/chu-du-an/bao-cao' element={<BaoCaoHieuSuat />} />
    </Routes>
        </div>
 
  )
}

export default App
