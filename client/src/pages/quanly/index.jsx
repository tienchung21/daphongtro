import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/navigation/Navigation";
import "./QuanLy.css";

// Import các components có sẵn
import QuanLyTaiKhoan from "../quanlytaikhoan/index";
import QuanLyTinDang from "../quanlytindang/index";
import QuanLyKhuVuc from "../quanlykhuvuc/index";
import Appointments from "../cuochencuatoi/index";
import ViPage from "../Vi/index";
import QuanLyHopDongAdmin from "../quanlyhopdong/index";
import QuanLyDuAnAdmin from "./QuanLyDuAnAdmin";
import QuanLyChinhSach from "./QuanLyChinhSach";
import QuanLyRutTien from "./QuanLyRutTien";
import CaiDatAdmin from "./CaiDatAdmin";

import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineBuildingOffice2,
  HiOutlineCalendar,
  HiOutlineCreditCard,
} from "react-icons/hi2";

function QuanLy() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard"); // Tab hiện tại
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    projects: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load thống kê
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setStats({
          users: 26,
          posts: 32,
          projects: 28,
          appointments: 13,
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Quản lý tài khoản",
      description: "Thêm, sửa, xóa người dùng",
      icon: <HiOutlineUsers />,
      tab: "taikhoan", // ← Đổi từ path thành tab
      color: "#3b82f6",
    },
    {
      title: "Duyệt tin đăng",
      description: "Phê duyệt tin đăng mới",
      icon: <HiOutlineDocumentText />,
      tab: "tindang",
      color: "#10b981",
    },
    {
      title: "Quản lý dự án",
      description: "Theo dõi các dự án",
      icon: <HiOutlineBuildingOffice2 />,
      tab: "quanlyduan",
      color: "#8b5cf6",
    },
    {
      title: "Quản lý cuộc hẹn",
      description: "Theo dõi các cuộc hẹn",
      icon: <HiOutlineCalendar />,
      tab: "cuochen",
      color: "#8b5cf6",
    },
    {
      title: "Quản lý thanh toán",
      description: "Xem giao dịch & hóa đơn",
      icon: <HiOutlineCreditCard />,
      tab: "thanhtoan",
      color: "#f59e0b",
    },
  ];

  // Function chuyển tab thay vì navigate
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Render nội dung theo tab
  const renderContent = () => {
    switch (activeTab) {
      case "taikhoan":
        return <QuanLyTaiKhoan />;
      case "tindang":
        return <QuanLyTinDang />;
      case "quanlykhuvuc":
        return <QuanLyKhuVuc />;
      case "cuochen":
        return <Appointments />;
      case "quanlyduan":
        return <QuanLyDuAnAdmin />;
      case "thanhtoan":
        return (
          <div className="quanly__placeholder">
            <h2>💳 Quản lý Thanh toán</h2>
            <p>Chức năng đang phát triển...</p>
          </div>
        );
      case "vi":
        return <ViPage />;
      case "hopdong":
        return <QuanLyHopDongAdmin />;
      case "chinhsach":
        return <QuanLyChinhSach />;
      case "ruttien":
        return <QuanLyRutTien />;
      case "caidat":
        return <CaiDatAdmin />;
      case "yeucau":
        return (
          <div className="quanly__placeholder">
            <h2>💬 Quản lý Yêu cầu</h2>
            <p>Quản lý yêu cầu đang phát triển...</p>
          </div>
        );
      case "baocao":
        return (
          <div className="quanly__placeholder">
            <h2>📊 Báo cáo</h2>
            <p>Báo cáo thống kê đang phát triển...</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  // Dashboard component
  const renderDashboard = () => (
    <>
      {/* Header */}
      <header className="quanly__header">
        <div className="quanly__header-text">
          <h1 className="quanly__title">Tổng quan hệ thống</h1>
          <p className="quanly__subtitle">
            Quản lý và giám sát toàn bộ hoạt động
          </p>
        </div>
        <button
          className="quanly__refresh-btn"
          onClick={loadStats}
          disabled={loading}
        >
          🔄 Làm mới
        </button>
      </header>

      {/* Stats Grid */}
      <div className="quanly__stats">
        <div className="quanly__stat-card">
          <div className="quanly__stat-icon quanly__stat-icon--blue">
            <HiOutlineUsers />
          </div>
          <div className="quanly__stat-content">
            <div className="quanly__stat-label">Người dùng</div>
            <div className="quanly__stat-value">
              {loading ? "..." : stats.users.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="quanly__stat-card">
          <div className="quanly__stat-icon quanly__stat-icon--green">
            <HiOutlineDocumentText />
          </div>
          <div className="quanly__stat-content">
            <div className="quanly__stat-label">Tin đăng</div>
            <div className="quanly__stat-value">
              {loading ? "..." : stats.posts.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="quanly__stat-card">
          <div className="quanly__stat-icon quanly__stat-icon--purple">
            <HiOutlineBuildingOffice2 />
          </div>
          <div className="quanly__stat-content">
            <div className="quanly__stat-label">Dự án</div>
            <div className="quanly__stat-value">
              {loading ? "..." : stats.projects.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="quanly__stat-card">
          <div className="quanly__stat-icon quanly__stat-icon--orange">
            <HiOutlineCalendar />
          </div>
          <div className="quanly__stat-content">
            <div className="quanly__stat-label">Cuộc hẹn</div>
            <div className="quanly__stat-value">
              {loading ? "..." : stats.appointments.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="quanly__section">
        <h2 className="quanly__section-title">Thao tác nhanh</h2>
        <div className="quanly__actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quanly__action-card"
              onClick={() => handleTabChange(action.tab)} // ← Đổi từ navigate
              style={{ "--accent-color": action.color }}
            >
              <div className="quanly__action-icon">{action.icon}</div>
              <div className="quanly__action-content">
                <h3 className="quanly__action-title">{action.title}</h3>
                <p className="quanly__action-description">
                  {action.description}
                </p>
              </div>
              <div className="quanly__action-arrow">→</div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="quanly__section">
        <h2 className="quanly__section-title">Hoạt động gần đây</h2>
        <div className="quanly__activity">
          <div className="quanly__activity-item">
            <div className="quanly__activity-icon quanly__activity-icon--success">
              ✓
            </div>
            <div className="quanly__activity-content">
              <div className="quanly__activity-text">
                Tin đăng <strong>#342</strong> đã được duyệt
              </div>
              <div className="quanly__activity-time">5 phút trước</div>
            </div>
          </div>

          <div className="quanly__activity-item">
            <div className="quanly__activity-icon quanly__activity-icon--info">
              👤
            </div>
            <div className="quanly__activity-content">
              <div className="quanly__activity-text">
                Người dùng mới <strong>Nguyễn Văn A</strong> đã đăng ký
              </div>
              <div className="quanly__activity-time">15 phút trước</div>
            </div>
          </div>

          <div className="quanly__activity-item">
            <div className="quanly__activity-icon quanly__activity-icon--warning">
              ⚠
            </div>
            <div className="quanly__activity-content">
              <div className="quanly__activity-text">
                Tin đăng <strong>#338</strong> cần xem xét
              </div>
              <div className="quanly__activity-time">1 giờ trước</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <div className="quanly">
      {/* Sidebar Navigation - truyền activeTab để highlight */}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="quanly__content">
        <div className="quanly__container">
          {/* Breadcrumb */}
          {activeTab !== "dashboard" && (
            <nav className="quanly__breadcrumb">
              <button
                className="quanly__breadcrumb-btn"
                onClick={() => setActiveTab("dashboard")}
              >
                ← Quay lại Dashboard
              </button>
            </nav>
          )}

          {/* Render content theo tab */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default QuanLy;
