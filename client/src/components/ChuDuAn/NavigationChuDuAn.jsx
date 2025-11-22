import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './NavigationChuDuAn.css';

// React Icons
import {
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowTrendingUp,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';

/**
 * Component Sidebar Navigation cho trang Chủ dự án
 * Design: Modern sidebar với sections, badges, user profile
 * @returns {JSX.Element}
 */
function NavigationChuDuAn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mainMenuItems = [
    {
      path: '/chu-du-an/dashboard',
      title: 'Tổng quan',
      icon: <HiOutlineChartBar />,
      description: 'Dashboard và thống kê'
    },
    {
      path: '/chu-du-an/tin-dang',
      title: 'Tin đăng',
      icon: <HiOutlineDocumentText />,
      description: 'Quản lý tin đăng',
      badge: null // Sẽ hiển thị số tin đăng chờ duyệt
    },
    {
      path: '/chu-du-an/du-an',
      title: 'Dự án',
      icon: <HiOutlineHome />,
      description: 'Danh sách dự án'
    },
    {
      path: '/chu-du-an/cuoc-hen',
      title: 'Cuộc hẹn',
      icon: <HiOutlineCalendar />,
      description: 'Lịch xem phòng'
    },
    {
      path: '/chu-du-an/tin-nhan',
      title: 'Trò chuyện',
      icon: <HiOutlineChatBubbleLeftRight />,
      description: 'Trò chuyện với khách hàng',
      badge: null // Sẽ hiển thị số tin nhắn chưa đọc
    }
  ];

  const reportMenuItems = [
    {
      path: '/chu-du-an/bao-cao',
      title: 'Báo cáo',
      icon: <HiOutlineArrowTrendingUp />,
      description: 'Phân tích hiệu suất'
    },
    {
      path: '/chu-du-an/hop-dong',
      title: 'Hợp đồng',
      icon: <HiOutlineDocumentText />,
      description: 'Quản lý hợp đồng'
    }
  ];

  const isActive = (path) => {
    if (path === '/chu-du-an/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Redirect to login
    navigate('/login');
  };

  // Lắng nghe sự kiện global từ Header để mở/đóng sidebar trên mobile
  useEffect(() => {
    const handler = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener('cda:toggleSidebar', handler);
    return () => window.removeEventListener('cda:toggleSidebar', handler);
  }, []);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="cda-mobile-toggle"
        onClick={toggleMobile}
        aria-label={isMobileOpen ? 'Đóng menu' : 'Mở menu'}
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      <div
        className={`cda-sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside className={`cda-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div className="cda-sidebar-header">
        <div className="cda-brand">
          {!isCollapsed && (
            <>
              <div className="cda-brand-icon">🏢</div>
              <div className="cda-brand-text">
                <div className="cda-brand-title">Chủ dự án</div>
                <div className="cda-brand-subtitle">Quản lý & Phát triển</div>
              </div>
            </>
          )}
        </div>
        <button 
          className="cda-sidebar-toggle"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="cda-user-profile">
          <div className="cda-user-avatar">
            {(() => {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const name = user.TenDayDu || user.tenDayDu || 'User';
              return name.charAt(0).toUpperCase();
            })()}
          </div>
          <div className="cda-user-info">
            <div className="cda-user-name">
              {(() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                return user.TenDayDu || user.tenDayDu || 'Chủ dự án';
              })()}
            </div>
            <div className="cda-user-role">
              {(() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                return user.TenVaiTro || user.vaiTro || 'Chủ dự án';
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="cda-sidebar-nav">
        <div className="cda-nav-section">
          {!isCollapsed && <div className="cda-nav-section-title">Chính</div>}
          <ul className="cda-nav-list">
            {mainMenuItems.map((item) => (
              <li key={item.path}>
                <button
                  className={`cda-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => { navigate(item.path); setIsMobileOpen(false); }}
                  title={isCollapsed ? item.title : item.description}
                >
                  <span className="cda-nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="cda-nav-label">{item.title}</span>
                      {item.badge && (
                        <span className="cda-nav-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="cda-nav-section">
          {!isCollapsed && <div className="cda-nav-section-title">Báo cáo</div>}
          <ul className="cda-nav-list">
            {reportMenuItems.map((item) => (
              <li key={item.path}>
                <button
                  className={`cda-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => { navigate(item.path); setIsMobileOpen(false); }}
                  title={isCollapsed ? item.title : item.description}
                >
                  <span className="cda-nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="cda-nav-label">{item.title}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="cda-quick-actions">
          <button 
            className="cda-quick-action-btn primary"
            onClick={() => navigate('/chu-du-an/tao-tin-dang')}
          >
            <HiOutlineDocumentText style={{ width: '18px', height: '18px' }} />
            <span>Tạo tin đăng</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="cda-sidebar-footer">
        <button 
          className={`cda-footer-btn ${location.pathname === '/cai-dat' ? 'active' : ''}`}
          onClick={() => navigate('/cai-dat')}
          title="Cài đặt"
        >
          <HiOutlineCog6Tooth style={{ width: '20px', height: '20px' }} />
          {!isCollapsed && <span>Cài đặt</span>}
        </button>
        <button 
          className="cda-footer-btn logout-btn"
          onClick={handleLogout}
          title="Đăng xuất"
        >
          <HiOutlineArrowRightOnRectangle style={{ width: '20px', height: '20px' }} />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
    </>
  );
}

export default NavigationChuDuAn;