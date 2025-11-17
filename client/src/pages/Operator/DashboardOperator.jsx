import React, { useEffect, useState } from 'react';
import OperatorLayout from '../../layouts/OperatorLayout';
import operatorApi from '../../services/operatorApi';
import { Link } from 'react-router-dom';
import './DashboardOperator.css';
import IconOperator from '../../components/Operator/Icon';
import {
  HiOutlineDocumentText,
  HiOutlineBuildingOffice,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineCalendar
} from 'react-icons/hi2';

function DashboardOperator() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await operatorApi.dashboard.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Lỗi lấy metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <OperatorLayout>
        <div className="dashboard-operator">
          <div className="operator-shimmer" style={{height: '200px', marginBottom: '2rem'}} />
        </div>
      </OperatorLayout>
    );
  }

  const cardData = [
    {
      title: 'Tin đăng chờ duyệt',
      value: metrics?.tinDang?.ChoDuyet || 0,
      icon: <HiOutlineDocumentText />,
      link: '/nvdh/duyet-tin-dang',
      color: 'warning'
    },
    {
      title: 'Dự án hoạt động',
      value: metrics?.duAn?.duAn?.HoatDong || 0,
      icon: <HiOutlineBuildingOffice />,
      link: '/nvdh/du-an',
      color: 'success'
    },
    {
      title: 'Nhân viên active',
      value: metrics?.nhanVien?.Active || 0,
      icon: <HiOutlineUsers />,
      link: '/nvdh/nhan-vien',
      color: 'primary'
    },
    {
      title: 'Biên bản chờ',
      value: metrics?.bienBan?.ChuaBanGiao || 0,
      icon: <HiOutlineClipboardDocumentList />,
      link: '/nvdh/bien-ban',
      color: 'info'
    }
  ];

  return (
    <OperatorLayout>
      <div className="dashboard-operator">
        <div className="dashboard-operator__header">
          <h1 className="dashboard-operator__title">Bảng điều khiển Điều hành</h1>
          <p className="dashboard-operator__subtitle">Tổng quan vận hành hệ thống</p>
        </div>

        <div className="dashboard-operator__metrics">
          {cardData.map((card, index) => (
            <Link 
              key={index} 
              to={card.link} 
              className="operator-card operator-card--interactive dashboard-operator__metric-card operator-stagger-item"
            >
              <div className="dashboard-operator__metric-icon">
                <IconOperator size={24} title={card.title}>
                  {card.icon}
                </IconOperator>
              </div>
              <div className="dashboard-operator__metric-content">
                <div className="dashboard-operator__metric-value">{card.value}</div>
                <div className="dashboard-operator__metric-label">{card.title}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="dashboard-operator__quick-actions operator-card">
          <div className="operator-card__header">
            <h2 className="operator-card__title">Thao tác nhanh</h2>
          </div>
          <div className="operator-card__body">
            <div className="dashboard-operator__actions">
              <Link to="/nvdh/duyet-tin-dang" className="operator-btn operator-btn--primary">
                <span><IconOperator size={18} title="Duyệt Tin đăng"><HiOutlineCheckCircle /></IconOperator></span>
                <span>Duyệt Tin đăng</span>
              </Link>
              <Link to="/nvdh/nhan-vien" className="operator-btn operator-btn--success">
                <span><IconOperator size={18} title="Tạo mới"><HiOutlinePlus /></IconOperator></span>
                <span>Tạo Nhân viên mới</span>
              </Link>
              <Link to="/nvdh/lich-nvbh" className="operator-btn operator-btn--ghost">
                <span><IconOperator size={18} title="Lịch NVBH"><HiOutlineCalendar /></IconOperator></span>
                <span>Xem Lịch NVBH</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </OperatorLayout>
  );
}

export default DashboardOperator;






