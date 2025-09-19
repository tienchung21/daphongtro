
import { Routes, Route } from 'react-router-dom';
import './App.css';
import TrangChu from './pages/trangchu';
import Login from './pages/login';
import Dangky from './pages/dangky';
function App() {

  return (

      <div className="App"> 
    <Routes>
      <Route path='/' element={<TrangChu />} />
      {/* <Route path='/about' element={<div>About Page</div>} /> */}
      <Route path='/login' element={<Login />} />
      <Route path='/dangky' element={<Dangky />} />
    </Routes>
        </div>
 
  )
}

export default App
