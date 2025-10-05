import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService, DuAnService, KhuVucService } from '../../services/ChuDuAnService';
import ModalChinhSuaToaDo from '../../components/ChuDuAn/ModalChinhSuaToaDo';
import './TaoTinDang.css'; // Tái sử dụng CSS của TaoTinDang

/**
 * Trang Chỉnh Sửa Tin Đăng
 * Route: /chu-du-an/chinh-sua-tin-dang/:id
 * 
 * Features:
 * - Load thông tin tin đăng hiện tại
 * - Chỉnh sửa tất cả thông tin
 * - Lưu nháp hoặc gửi duyệt
 */
const ChinhSuaTinDang = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tinDang, setTinDang] = useState(null);
  
  // States giống TaoTinDang
  const [duAns, setDuAns] = useState([]);
  const [thanhPhos, setThanhPhos] = useState([]);
  const [quans, setQuans] = useState([]);
  const [phuongs, setPhuongs] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    DuAnID: '',
    TieuDe: '',
    MoTaChiTiet: '',
    LoaiPhong: 'Phòng trọ',
    SoPhongNgu: 1,
    SoPhongTam: 1,
    Gia: '',
    GiaDien: '',
    GiaNuoc: '',
    GiaDichVu: '',
    DienTich: '',
    DiaChi: '',
    ThanhPhoID: '',
    QuanID: '',
    PhuongID: '',
    ViDo: '',
    KinhDo: '',
    TienIch: [],
    QuyDinh: {
      GioVeSinh: '',
      ChoPhepNuoiThuCung: false,
      ChoPhepNauAn: false,
      YeuCau: ''
    }
  });
  
  const [danhSachAnh, setDanhSachAnh] = useState([]);
  const [errors, setErrors] = useState({});
  const [showModalToaDo, setShowModalToaDo] = useState(false);

  // Load tin đăng hiện tại
  useEffect(() => {
    layTinDangDeChinhSua();
  }, [id]);

  const layTinDangDeChinhSua = async () => {
    try {
      setLoading(true);
      const response = await TinDangService.layTinDangDeChinhSua(id);
      
      if (response.success) {
        const tinDangData = response.data;
        
        // Parse dữ liệu với try-catch
        let tienIchParsed = [];
        let quyDinhParsed = {};
        let anhParsed = [];

        try {
          tienIchParsed = tinDangData.TienIch ? JSON.parse(tinDangData.TienIch) : [];
        } catch (e) {
          console.error('Lỗi parse TienIch:', e);
        }

        try {
          quyDinhParsed = tinDangData.QuyDinh ? JSON.parse(tinDangData.QuyDinh) : {};
        } catch (e) {
          console.error('Lỗi parse QuyDinh:', e);
        }

        try {
          anhParsed = tinDangData.URL ? JSON.parse(tinDangData.URL) : [];
        } catch (e) {
          console.error('Lỗi parse URL:', e);
        }

        // Set form data
        setFormData({
          DuAnID: tinDangData.DuAnID || '',
          TieuDe: tinDangData.TieuDe || '',
          MoTaChiTiet: tinDangData.MoTaChiTiet || '',
          LoaiPhong: tinDangData.LoaiPhong || 'Phòng trọ',
          SoPhongNgu: tinDangData.SoPhongNgu || 1,
          SoPhongTam: tinDangData.SoPhongTam || 1,
          Gia: tinDangData.Gia || '',
          GiaDien: tinDangData.GiaDien || '',
          GiaNuoc: tinDangData.GiaNuoc || '',
          GiaDichVu: tinDangData.GiaDichVu || '',
          DienTich: tinDangData.DienTich || '',
          DiaChi: tinDangData.DiaChi || '',
          ThanhPhoID: tinDangData.ThanhPhoID || '',
          QuanID: tinDangData.QuanID || '',
          PhuongID: tinDangData.PhuongID || '',
          ViDo: tinDangData.ViDo || '',
          KinhDo: tinDangData.KinhDo || '',
          TienIch: tienIchParsed,
          QuyDinh: {
            GioVeSinh: quyDinhParsed.GioVeSinh || '',
            ChoPhepNuoiThuCung: quyDinhParsed.ChoPhepNuoiThuCung || false,
            ChoPhepNauAn: quyDinhParsed.ChoPhepNauAn || false,
            YeuCau: quyDinhParsed.YeuCau || ''
          }
        });

        setDanhSachAnh(anhParsed);
        setTinDang(tinDangData);
      }
    } catch (error) {
      console.error('Lỗi load tin đăng:', error);
      alert('Không thể tải thông tin tin đăng');
      navigate('/chu-du-an/tin-dang');
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách dự án và khu vực
  useEffect(() => {
    const loadData = async () => {
      try {
        const [duAnRes, tpRes] = await Promise.all([
          DuAnService.layDanhSach(),
          KhuVucService.layDanhSach() // Thành phố (parentId = null)
        ]);
        
        if (duAnRes.success) setDuAns(duAnRes.data);
        // KhuVucService.layDanhSach() trả về trực tiếp array
        setThanhPhos(Array.isArray(tpRes) ? tpRes : []);
      } catch (error) {
        console.error('Lỗi load dữ liệu:', error);
      }
    };
    loadData();
  }, []);

  // Load quận khi chọn thành phố
  useEffect(() => {
    if (formData.ThanhPhoID) {
      KhuVucService.layDanhSach(formData.ThanhPhoID)
        .then(res => {
          setQuans(Array.isArray(res) ? res : []);
        });
    }
  }, [formData.ThanhPhoID]);

  // Load phường khi chọn quận
  useEffect(() => {
    if (formData.QuanID) {
      KhuVucService.layDanhSach(formData.QuanID)
        .then(res => {
          setPhuongs(Array.isArray(res) ? res : []);
        });
    }
  }, [formData.QuanID]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTienIchChange = (tienIch) => {
    setFormData(prev => {
      const current = prev.TienIch || [];
      if (current.includes(tienIch)) {
        return { ...prev, TienIch: current.filter(t => t !== tienIch) };
      } else {
        return { ...prev, TienIch: [...current, tienIch] };
      }
    });
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      const dataToSend = {
        ...formData,
        TienIch: JSON.stringify(formData.TienIch),
        QuyDinh: JSON.stringify(formData.QuyDinh),
        URL: JSON.stringify(danhSachAnh),
        action: 'save_draft'
      };

      const response = await TinDangService.capNhatTinDang(id, dataToSend);
      
      if (response.success) {
        alert('✅ Lưu nháp thành công!');
      }
    } catch (error) {
      console.error('Lỗi lưu nháp:', error);
      alert('❌ Lỗi lưu nháp');
    } finally {
      setSaving(false);
    }
  };

  const handleSendReview = async () => {
    try {
      setSaving(true);
      
      // Validate
      const newErrors = {};
      if (!formData.TieuDe) newErrors.TieuDe = 'Vui lòng nhập tiêu đề';
      if (!formData.DuAnID) newErrors.DuAnID = 'Vui lòng chọn dự án';
      if (!formData.Gia) newErrors.Gia = 'Vui lòng nhập giá';
      if (danhSachAnh.length === 0) newErrors.URL = 'Vui lòng thêm ít nhất 1 ảnh';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        alert('❌ Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const dataToSend = {
        ...formData,
        TienIch: JSON.stringify(formData.TienIch),
        QuyDinh: JSON.stringify(formData.QuyDinh),
        URL: JSON.stringify(danhSachAnh),
        action: 'send_review'
      };

      const response = await TinDangService.capNhatTinDang(id, dataToSend);
      
      if (response.success) {
        alert('✅ Gửi duyệt tin đăng thành công!');
        navigate('/chu-du-an/tin-dang');
      }
    } catch (error) {
      console.error('Lỗi gửi duyệt:', error);
      alert('❌ Lỗi gửi duyệt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ChuDuAnLayout>
        <div className="ttd-container">
          <div className="ttd-loading">
            <div className="ttd-spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      <div className="ttd-container">
        <div className="ttd-header">
          <h1>Chỉnh sửa Tin đăng</h1>
          <p>Cập nhật thông tin tin đăng của bạn</p>
        </div>

        <div className="ttd-form">
          {/* Form content giống TaoTinDang - Tái sử dụng UI */}
          <div className="ttd-section">
            <h2>Thông tin cơ bản</h2>
            
            <div className="ttd-form-group">
              <label>Dự án <span className="required">*</span></label>
              <select
                name="DuAnID"
                value={formData.DuAnID}
                onChange={handleInputChange}
                className={errors.DuAnID ? 'error' : ''}
              >
                <option value="">-- Chọn dự án --</option>
                {duAns.map(da => (
                  <option key={da.DuAnID} value={da.DuAnID}>{da.TenDuAn}</option>
                ))}
              </select>
            </div>

            <div className="ttd-form-group">
              <label>Tiêu đề <span className="required">*</span></label>
              <input
                type="text"
                name="TieuDe"
                value={formData.TieuDe}
                onChange={handleInputChange}
                className={errors.TieuDe ? 'error' : ''}
                placeholder="Ví dụ: Phòng trọ cao cấp gần ĐH Sư Phạm"
              />
            </div>

            <div className="ttd-form-group">
              <label>Mô tả chi tiết</label>
              <textarea
                name="MoTaChiTiet"
                value={formData.MoTaChiTiet}
                onChange={handleInputChange}
                rows={6}
                placeholder="Mô tả chi tiết về phòng..."
              />
            </div>
          </div>

          {/* Thêm các sections khác tương tự TaoTinDang */}

          <div className="ttd-actions">
            <button
              type="button"
              className="ttd-btn-secondary"
              onClick={() => navigate('/chu-du-an/tin-dang')}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="button"
              className="ttd-btn-draft"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : '💾 Lưu nháp'}
            </button>
            <button
              type="button"
              className="ttd-btn-primary"
              onClick={handleSendReview}
              disabled={saving}
            >
              {saving ? 'Đang gửi...' : '📤 Gửi duyệt'}
            </button>
          </div>
        </div>

        {showModalToaDo && (
          <ModalChinhSuaToaDo
            viTriGoc={{ lat: parseFloat(formData.ViDo), lng: parseFloat(formData.KinhDo) }}
            onClose={() => setShowModalToaDo(false)}
            onSave={(newPos) => {
              setFormData(prev => ({ ...prev, ViDo: newPos.lat, KinhDo: newPos.lng }));
              setShowModalToaDo(false);
            }}
          />
        )}
      </div>
    </ChuDuAnLayout>
  );
};

export default ChinhSuaTinDang;
