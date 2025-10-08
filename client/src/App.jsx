import { Routes, Route } from 'react-router-dom';
import './App.css';
import TrangChu from './pages/trangchu';
import Login from './pages/login';
import Dangky from './pages/dangky';
import QuanLyTaiKhoan from './pages/quanlytaikhoan';
function App() {

  return (

      <div className="App"> 
    <Routes>
      <Route path='/' element={<TrangChu />} />
      {/* <Route path='/about' element={<div>About Page</div>} /> */}
      <Route path='/login' element={<Login />} />
      <Route path='/dangky' element={<Dangky />} />
      <Route path="/quanlytaikhoan" element={<QuanLyTaiKhoan />} />
    </Routes>
        </div>
 
  )
}

export default App
