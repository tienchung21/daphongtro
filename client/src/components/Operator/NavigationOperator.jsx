import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./NavigationOperator.css";
import IconOperator from "./Icon";
import {
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineBuildingOffice,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

/**
 * Navigation sidebar cho Operator
 * Glass morphism design với BEM naming
 */
function NavigationOperator() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Load user info từ localStorage khi component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log(userData);
        setUser(userData);
      }
    } catch (error) {
      console.error("Lỗi khi parse user data:", error);
    }
  }, []);

  // Listen for toggle event from mobile topbar
  useEffect(() => {
    const handleToggle = () => setIsOpen(!isOpen);
    window.addEventListener("operator:toggleSidebar", handleToggle);
    return () =>
      window.removeEventListener("operator:toggleSidebar", handleToggle);
  }, [isOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth <= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  const navItems = [
    {
      path: "/nvdh/dashboard",
      icon: <HiOutlineChartBar />,
      label: "Bảng điều khiển",
      description: "Xem dashboard hệ thống",
    },
    {
      path: "/nvdh/duyet-tin-dang",
      icon: <HiOutlineCheckCircle />,
      label: "Duyệt Tin đăng",
      description: "Duyệt tin đăng",
    },
    {
      path: "/nvdh/du-an",
      icon: <HiOutlineBuildingOffice />,
      label: "Quản lý Dự án",
      description: "Quản lý dự án",
    },
    {
      path: "/nvdh/lich-nvbh",
      icon: <HiOutlineCalendar />,
      label: "Lịch NVBH",
      description: "Phân công NVBH cho cuộc hẹn",
    },
    {
      path: "/nvdh/nhan-vien",
      icon: <HiOutlineUsers />,
      label: "Quản lý Nhân viên",
      description: "Quản lý nhân viên",
    },
    {
      path: "/nvdh/bien-ban",
      icon: <HiOutlineClipboardDocumentList />,
      label: "Biên bản Bàn giao",
      description: "Quản lý/Lập biên bản bàn giao",
    },
  ];

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
    } finally {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Overlay for mobile - MUST be sibling, not child */}
      {isOpen && (
        <div
          className="operator-nav__overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`operator-nav ${isOpen ? "operator-nav--open" : ""}`}>
        <div className="operator-nav__container">
          {/* Logo/Brand */}
          <div className="operator-nav__brand">
            <div className="operator-nav__brand-icon">
              <IconOperator size={24} title="Điều hành">
                <HiOutlineBuildingOffice />
              </IconOperator>
            </div>
            <div className="operator-nav__brand-text">
              <div className="operator-nav__brand-title">Điều hành</div>
              <div className="operator-nav__brand-subtitle">
                Quản trị vận hành hệ thống
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="operator-nav__items">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `operator-nav__item ${
                    isActive ? "operator-nav__item--active" : ""
                  }`
                }
                onClick={() => window.innerWidth <= 1024 && setIsOpen(false)}
              >
                <span className="operator-nav__item-icon">
                  <IconOperator size={18} title={item.label}>
                    {item.icon}
                  </IconOperator>
                </span>
                <div className="operator-nav__item-content">
                  <span className="operator-nav__item-label">{item.label}</span>
                  <span className="operator-nav__item-desc">
                    {item.description}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>

          {/* Footer */}
          <div className="operator-nav__footer">
            <div className="operator-nav__user">
              <div className="operator-nav__user-avatar">
                {user?.TenDayDu?.charAt(0).toUpperCase() || "Đ"}
              </div>
              <div className="operator-nav__user-info">
                <div className="operator-nav__user-name">
                  {user?.TenDayDu || "Điều hành"}
                </div>
                <div className="operator-nav__user-role">
                  {user?.VaiTro || "Nhân viên Điều hành"}
                </div>
              </div>
            </div>
            <button
              className="operator-nav__hide"
              onClick={() => setIsOpen(false)}
              aria-label="Ẩn menu điều hành"
            >
              <span>⬅️</span>
              <span>Ẩn menu</span>
            </button>
            <button
              className="operator-nav__logout"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <span>🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavigationOperator;
