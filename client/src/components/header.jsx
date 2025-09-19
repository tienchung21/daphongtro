import './header.css';
import logo from '../assets/images/logo-hinh-mai-nha_.jpg'
 import React, { useState } from 'react';
 import { Link } from 'react-router-dom';
function Header() {
  
const [showFavorites, setShowFavorites] = useState(false);

return(
    <header className="header">
    <div className="container">
        <div className="header-logo">
            <img src={logo} />
        </div>
        <div className="header-search">
            <input type="text" placeholder="Tìm kiếm..." />
            <button>Tìm</button>
        </div>
        <div className="nav">
        <ul>
    <li><a href="#">Trang chủ</a></li>
    <li><a href="#">Blog</a></li>
    <li><a href="#">Bảng giá dịch vụ</a></li>
        </ul>
        </div>
        {/* yêu thích */}
       <div className='yeuthich' style={{ position: 'relative' }}>
  <button onClick={() => setShowFavorites(!showFavorites)}>🩶</button>
  {showFavorites && (
    <div className="favorites-dropdown">
      <h4>Danh sách yêu thích</h4>
     <div className="tintuc-baiviet1">
          <div className="anhduan">
          <img src="https://tse4.mm.bing.net/th/id/OIP.1a31QUbCZjQD8w2KP2DKnwHaGu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Ảnh dự án" />
          </div>
          <div className="thongtinduan">
          <div className="tieude">
             Cho thuê phòng trọ ngay quận 2 có đủ tiện nghi
          </div>

        </div>

        </div>
    <div className="tintuc-baiviet1">
          <div className="anhduan">
          <img src="https://tse4.mm.bing.net/th/id/OIP.1a31QUbCZjQD8w2KP2DKnwHaGu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Ảnh dự án" />
          </div>
          <div className="thongtinduan">
          <div className="tieude">
             Cho thuê phòng trọ ngay quận 2 có đủ tiện nghi
          </div>

        </div>

        </div>
    </div>
  )}
</div>
        
        <div className="user">
         <ul>
    <li><Link to="/login">Đăng nhập</Link></li>
    <li><Link to="/dangky">Đăng ký</Link></li>

        </ul>

        </div>
    <div className="dangtin">
    <button>Đăng tin</button>

    </div>


    </div>


    </header>


)    

}

export default Header;