import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService, DuAnService, KhuVucService } from '../../services/ChuDuAnService';
import ModalTaoNhanhDuAn from '../../components/ChuDuAn/ModalTaoNhanhDuAn';

// Import helper functions from old file
const chuanHoaTenKhuVuc = (ten = '') => {
  if (!ten) return '';
  const cleaned = ten
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.replace(/\b(\d+)\b/g, (_, group) => {
    const parsed = parseInt(group, 10);
    return Number.isNaN(parsed) ? group : String(parsed);
  });
};

const tachTokenSoVaChu = (text = '') => {
  const soMatch = text.match(/\d+/g);
  const so = soMatch ? soMatch.join('-') : '';
  const chu = text.replace(/\d+/g, '').trim();
  return { so, chu };
};

const timKhuVucTheoTen = (danhSach = [], tenCanTim = '', debugLabel = 'khu-vuc') => {
  if (!tenCanTim) return null;
  const tenChuan = chuanHoaTenKhuVuc(tenCanTim);
  
  // Exact match
  const exactMatch = danhSach.find((item) => {
    const tenTrongDs = chuanHoaTenKhuVuc(item?.TenKhuVuc || '');
    return tenTrongDs === tenChuan;
  });
  if (exactMatch) return exactMatch;
  
  // Token match
  const tokenCanTim = tachTokenSoVaChu(tenChuan);
  const tokenMatch = danhSach.find((item) => {
    const tenTrongDs = chuanHoaTenKhuVuc(item?.TenKhuVuc || '');
    const tokenDs = tachTokenSoVaChu(tenTrongDs);
    if (tokenCanTim.so && tokenDs.so && tokenCanTim.so === tokenDs.so) {
      if (!tokenCanTim.chu || !tokenDs.chu) return true;
      if (tokenDs.chu.includes(tokenCanTim.chu) || tokenCanTim.chu.includes(tokenDs.chu)) {
        return true;
      }
    }
    return false;
  });
  if (tokenMatch) return tokenMatch;
  
  // Include match
  const includesMatch = danhSach.find((item) => {
    const tenTrongDs = chuanHoaTenKhuVuc(item?.TenKhuVuc || '');
    if (!tenTrongDs) return false;
    return tenTrongDs.includes(tenChuan) || tenChuan.includes(tenTrongDs);
  });
  return includesMatch || null;
};

const tachDiaChiDuAn = (diaChi = '') => {
  if (!diaChi) return { chiTiet: '', phuong: '', quan: '', tinh: '' };
  const parts = diaChi.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return { chiTiet: '', phuong: '', quan: '', tinh: '' };
  const tinh = parts.length > 0 ? parts.pop() : '';
  const quan = parts.length > 0 ? parts.pop() : '';
  const phuong = parts.length > 0 ? parts.pop() : '';
  const chiTiet = parts.join(', ');
  return { chiTiet: chiTiet || '', phuong, quan, tinh };
};

/**
 * Tạo tin đăng mới - Version Wizard với Accordion Sections
 */
function TaoTinDang() {
  const navigate = useNavigate();
  
  // ===== STATE =====
  const [duAns, setDuAns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    DuAnID: '',
    TieuDe: '',
    MoTa: '',
    DienTich: '',
    Gia: '',
    KhuVucID: '',
    ChinhSachCocID: 1,
    URL: [],
    TienIch: [],
    GiaDien: '',
    GiaNuoc: '',
    GiaDichVu: '',
    MoTaGiaDichVu: ''
  });
  
  const [anhPreview, setAnhPreview] = useState([]);
  const [tinhs, setTinhs] = useState([]);
  const [quans, setQuans] = useState([]);
  const [phuongs, setPhuongs] = useState([]);
  const [selectedTinh, setSelectedTinh] = useState('');
  const [selectedQuan, setSelectedQuan] = useState('');
  const [selectedPhuong, setSelectedPhuong] = useState('');
  const [isNhapNhieu, setIsNhapNhieu] = useState(false);
  const [phongs, setPhongs] = useState([{ tenPhong: '', gia: '', dienTich: '', ghiChu: '', url: '' }]);
  const [diaChi, setDiaChi] = useState('');
  const [dangPrefillDiaChi, setDangPrefillDiaChi] = useState(false);
  const [pendingQuanName, setPendingQuanName] = useState('');
  const [pendingPhuongName, setPendingPhuongName] = useState('');
  const [choPhepChinhSuaDiaChi, setChoPhepChinhSuaDiaChi] = useState(false);
  const [diaChiGoc, setDiaChiGoc] = useState('');
  const [hienModalTaoDuAn, setHienModalTaoDuAn] = useState(false);
  
  // ===== ACCORDION STATE =====
  const [sectionsExpanded, setSectionsExpanded] = useState({
    duAn: true,
    thongTinCoBan: true,
    tienIch: true,
    phongs: false,
    hinhAnh: true
  });

  const toggleSection = (section) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Danh sách tiện ích
  const DANH_SACH_TIEN_ICH = [
    'Wifi',
    'Máy lạnh',
    'Nóng lạnh',
    'Giường',
    'Tủ lạnh',
    'Máy giặt',
    'Bếp',
    'Chỗ để xe'
  ];

  // ===== EVENT HANDLERS =====
  const xuLyThayDoiInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const xuLyChonTienIch = (tienIch) => {
    setFormData(prev => {
      const tienIchMoi = prev.TienIch.includes(tienIch)
        ? prev.TienIch.filter(t => t !== tienIch)
        : [...prev.TienIch, tienIch];
      return { ...prev, TienIch: tienIchMoi };
    });
  };

  const xuLyChonAnh = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isImage && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Một số file không hợp lệ (chỉ chấp nhận ảnh < 5MB)');
    }

    const previews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setAnhPreview(prev => [...prev, ...previews]);
    setFormData(prev => ({
      ...prev,
      URL: [...prev.URL, ...previews.map(p => p.url)]
    }));

    if (errors.URL) {
      setErrors(prev => ({ ...prev, URL: '' }));
    }
  };

  const xoaAnh = (index) => {
    setAnhPreview(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    setFormData(prev => ({
      ...prev,
      URL: prev.URL.filter((_, i) => i !== index)
    }));
  };

  const updatePhong = (index, field, value) => {
    const newPhongs = [...phongs];
    newPhongs[index][field] = value;
    setPhongs(newPhongs);
  };

  const themPhong = () => setPhongs([...phongs, { tenPhong: '', gia: '', dienTich: '', ghiChu: '', url: '' }]);
  const xoaPhong = (index) => setPhongs(phongs.filter((_, i) => i !== index));

  const xuLyTaoDuAnThanhCong = (duAnMoi) => {
    setDuAns(prev => [duAnMoi, ...prev]);
    setFormData(prev => ({ ...prev, DuAnID: duAnMoi.DuAnID }));
  };

  // ===== VALIDATION =====
  const validate = () => {
    const newErrors = {};
    
    if (!formData.DuAnID) newErrors.DuAnID = 'Vui lòng chọn dự án';
    if (!formData.TieuDe) newErrors.TieuDe = 'Vui lòng nhập tiêu đề';
    
    if (!isNhapNhieu) {
      if (!formData.Gia || formData.Gia <= 0) newErrors.Gia = 'Vui lòng nhập giá hợp lệ';
      if (!formData.DienTich || formData.DienTich <= 0) newErrors.DienTich = 'Vui lòng nhập diện tích hợp lệ';
    } else {
      const phongKhongHopLe = phongs.some(p => !p.tenPhong || !p.gia || p.gia <= 0 || !p.dienTich || p.dienTich <= 0);
      if (phongKhongHopLe) {
        newErrors.Phongs = 'Vui lòng điền đầy đủ thông tin cho tất cả các phòng';
      }
    }
    
    if (!formData.URL || formData.URL.length === 0) newErrors.URL = 'Vui lòng tải lên ít nhất 1 hình ảnh';
    if (!selectedPhuong) newErrors.KhuVucID = 'Vui lòng chọn địa chỉ đầy đủ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== SUBMIT =====
  const xuLyGuiForm = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      alert('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setLoading(true);
      
      // Upload ảnh
      let uploadedUrls = [];
      if (anhPreview.length > 0) {
        const files = anhPreview.map(p => p.file);
        uploadedUrls = await uploadAnh(files);
      }
      
      const tinDangData = {
        DuAnID: parseInt(formData.DuAnID),
        TieuDe: formData.TieuDe,
        MoTa: formData.MoTa,
        Gia: !isNhapNhieu ? parseFloat(formData.Gia) : null,
        DienTich: !isNhapNhieu ? parseFloat(formData.DienTich) : null,
        KhuVucID: selectedPhuong ? parseInt(selectedPhuong) : null,
        ChinhSachCocID: formData.ChinhSachCocID || 1,
        URL: uploadedUrls,
        TienIch: formData.TienIch,
        GiaDien: formData.GiaDien ? parseFloat(formData.GiaDien) : null,
        GiaNuoc: formData.GiaNuoc ? parseFloat(formData.GiaNuoc) : null,
        GiaDichVu: formData.GiaDichVu ? parseFloat(formData.GiaDichVu) : null,
        MoTaGiaDichVu: formData.MoTaGiaDichVu || null,
        DiaChi: diaChi,
        Phongs: isNhapNhieu ? phongs : null,
        CapNhatDiaChiDuAn: choPhepChinhSuaDiaChi
      };
      
      const response = await TinDangService.tao(tinDangData);
      
      if (response.success) {
        alert('✅ Tạo tin đăng thành công!');
        navigate('/chu-du-an/tin-dang');
      } else {
        alert(`❌ Lỗi: ${response.message}`);
      }
    } catch (err) {
      console.error('Lỗi khi tạo tin đăng:', err);
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadAnh = async (files) => {
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('anh', file));
    const response = await fetch('/api/chu-du-an/upload-anh', {
      method: 'POST',
      body: formDataUpload
    });
    const data = await response.json();
    if (data.success) {
      return data.urls;
    }
    throw new Error(data.message);
  };

  // ===== LIFECYCLE =====
  useEffect(() => {
    layDanhSachDuAn();
    KhuVucService.layDanhSach(null)
      .then(data => setTinhs(data || []))
      .catch(err => console.error('Lỗi load tỉnh:', err));
  }, []);

  // Load quận
  useEffect(() => {
    if (selectedTinh) {
      KhuVucService.layDanhSach(selectedTinh)
        .then(data => setQuans(data || []))
        .catch(err => console.error('Lỗi load quận:', err));
    } else {
      setQuans([]);
      setPhuongs([]);
    }
  }, [selectedTinh]);

  // Load phường
  useEffect(() => {
    setPhuongs([]);
    if (selectedQuan) {
      KhuVucService.layDanhSach(selectedQuan)
        .then(data => setPhuongs(data || []))
        .catch(err => console.error('Lỗi load phường:', err));
    }
  }, [selectedQuan]);

  // Update KhuVucID
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      KhuVucID: selectedPhuong || ''
    }));
  }, [selectedPhuong]);

  // Auto-fill địa chỉ khi chọn dự án
  useEffect(() => {
    const prefillDiaChi = async () => {
      if (!formData.DuAnID) {
        setDiaChi('');
        setDangPrefillDiaChi(false);
        setPendingQuanName('');
        setPendingPhuongName('');
        setSelectedTinh('');
        setSelectedQuan('');
        setSelectedPhuong('');
        setChoPhepChinhSuaDiaChi(false);
        setDiaChiGoc('');
        return;
      }

      try {
        const duAnChon = duAns.find(d => d.DuAnID === parseInt(formData.DuAnID));
        if (duAnChon && duAnChon.DiaChi) {
          const { chiTiet, phuong, quan, tinh } = tachDiaChiDuAn(duAnChon.DiaChi);
          setDiaChi(chiTiet || '');
          setDiaChiGoc(duAnChon.DiaChi);
          setDangPrefillDiaChi(true);
          setPendingQuanName(quan || '');
          setPendingPhuongName(phuong || '');
          
          const tinhMatch = timKhuVucTheoTen(tinhs, tinh, 'tinh');
          if (tinhMatch) {
            setSelectedTinh(String(tinhMatch.KhuVucID));
          }
        }
      } catch (error) {
        console.error('Lỗi prefill địa chỉ:', error);
      }
    };

    prefillDiaChi();
  }, [formData.DuAnID, duAns, tinhs]);

  // Auto-select quận
  useEffect(() => {
    if (!dangPrefillDiaChi || !pendingQuanName || quans.length === 0) {
      return;
    }

    const quanMatch = timKhuVucTheoTen(quans, pendingQuanName, 'quan');
    if (quanMatch) {
      setSelectedQuan(String(quanMatch.KhuVucID));
    }
    setPendingQuanName('');
  }, [dangPrefillDiaChi, pendingQuanName, quans]);

  // Auto-select phường
  useEffect(() => {
    if (!selectedQuan || phuongs.length === 0) {
      return;
    }

    const phuongMatch = timKhuVucTheoTen(phuongs, pendingPhuongName, 'phuong');
    if (phuongMatch) {
      setSelectedPhuong(String(phuongMatch.KhuVucID));
    }
    setPendingPhuongName('');
    setDangPrefillDiaChi(false);
  }, [dangPrefillDiaChi, pendingPhuongName, phuongs, selectedQuan]);

  const layDanhSachDuAn = async () => {
    try {
      const response = await DuAnService.layDanhSach();
      setDuAns(response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách dự án:', err);
    }
  };

  const xuLyChonTinh = (value) => {
    if (!choPhepChinhSuaDiaChi) return;
    setSelectedTinh(value);
    setSelectedQuan('');
    setSelectedPhuong('');
    setPhuongs([]);
    setPendingQuanName('');
    setPendingPhuongName('');
    if (!value) {
      setDangPrefillDiaChi(false);
    }
  };

  const xuLyChonQuan = (value) => {
    if (!choPhepChinhSuaDiaChi) return;
    setSelectedQuan(value);
    setSelectedPhuong('');
    setPhuongs([]);
    setPendingPhuongName('');
  };

  const xuLyChonPhuong = (value) => {
    if (!choPhepChinhSuaDiaChi) return;
    setSelectedPhuong(value);
    if (errors.KhuVucID) {
      setErrors(prev => ({ ...prev, KhuVucID: '' }));
    }
  };

  const batChinhSuaDiaChi = () => {
    setChoPhepChinhSuaDiaChi(true);
  };

  const huyChinhSuaDiaChi = () => {
    setChoPhepChinhSuaDiaChi(false);
    if (diaChiGoc) {
      const { chiTiet, phuong, quan, tinh } = tachDiaChiDuAn(diaChiGoc);
      setDiaChi(chiTiet || '');
      setDangPrefillDiaChi(true);
      setPendingQuanName(quan || '');
      setPendingPhuongName(phuong || '');
      
      const tinhMatch = timKhuVucTheoTen(tinhs, tinh, 'tinh');
      if (tinhMatch) {
        setSelectedTinh(String(tinhMatch.KhuVucID));
      }
    }
  };

  // ===== RENDER =====
  const renderSectionHeader = (title, sectionKey, required = false, subtitle = null) => (
    <div 
      onClick={() => toggleSection(sectionKey)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        background: sectionsExpanded[sectionKey] ? '#f9fafb' : 'white',
        borderBottom: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'background 0.2s'
      }}
    >
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {title}
          {required && <span style={{ color: '#dc2626' }}>*</span>}
        </h3>
        {subtitle && <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{subtitle}</p>}
      </div>
      <span style={{ fontSize: '1.25rem', transition: 'transform 0.2s', transform: sectionsExpanded[sectionKey] ? 'rotate(180deg)' : 'rotate(0)' }}>
        ▼
      </span>
    </div>
  );

  return (
    <ChuDuAnLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>
            Tạo tin đăng mới
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Điền thông tin để tạo tin đăng cho thuê phòng trọ
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/chu-du-an/tin-dang')}
          className="cda-btn cda-btn-secondary"
        >
          ← Quay lại
        </button>
      </div>

      {/* Form với Accordion Sections */}
      <form onSubmit={xuLyGuiForm}>
        {/* Section 1: Chọn Dự Án */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('1. Chọn Dự Án & Địa Chỉ', 'duAn', true, 'Chọn dự án hiện có hoặc tạo mới')}
          
          {sectionsExpanded.duAn && (
            <div className="cda-card-body">
              {/* Chọn dự án */}
              <div className="cda-form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="cda-label cda-label-required">Dự án</label>
                  <button
                    type="button"
                    onClick={() => setHienModalTaoDuAn(true)}
                    className="cda-btn cda-btn-primary"
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                    disabled={loading}
                  >
                    ➕ Tạo dự án mới
                  </button>
                </div>
                <select
                  name="DuAnID"
                  value={formData.DuAnID}
                  onChange={xuLyThayDoiInput}
                  className={`cda-select ${errors.DuAnID ? 'cda-input-error' : ''}`}
                  disabled={loading}
                >
                  <option value="">-- Chọn dự án --</option>
                  {duAns.map(duAn => (
                    <option key={duAn.DuAnID} value={duAn.DuAnID}>
                      {duAn.TenDuAn}
                    </option>
                  ))}
                </select>
                {errors.DuAnID && <p className="cda-error-message">{errors.DuAnID}</p>}
              </div>

              {/* Địa chỉ */}
              {formData.DuAnID && (
                <div className="cda-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="cda-label cda-label-required">Địa chỉ dự án</label>
                    {!choPhepChinhSuaDiaChi ? (
                      <button
                        type="button"
                        onClick={batChinhSuaDiaChi}
                        className="cda-btn cda-btn-secondary"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      >
                        ✏️ Chỉnh sửa
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={huyChinhSuaDiaChi}
                        className="cda-btn cda-btn-secondary"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      >
                        ❌ Hủy
                      </button>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="cda-label" style={{ fontSize: '0.875rem' }}>Tỉnh/Thành phố</label>
                      <select 
                        value={selectedTinh} 
                        onChange={(e) => xuLyChonTinh(e.target.value)}
                        className={`cda-select ${errors.KhuVucID ? 'cda-input-error' : ''}`}
                        disabled={!choPhepChinhSuaDiaChi}
                        style={{ opacity: choPhepChinhSuaDiaChi ? 1 : 0.6 }}
                      >
                        <option value="">-- Chọn tỉnh/thành phố --</option>
                        {tinhs.map(tinh => (
                          <option key={tinh.KhuVucID} value={tinh.KhuVucID}>{tinh.TenKhuVuc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="cda-label" style={{ fontSize: '0.875rem' }}>Quận/Huyện</label>
                      <select 
                        value={selectedQuan} 
                        onChange={(e) => xuLyChonQuan(e.target.value)}
                        className={`cda-select ${errors.KhuVucID ? 'cda-input-error' : ''}`}
                        disabled={!choPhepChinhSuaDiaChi || !selectedTinh}
                        style={{ opacity: (choPhepChinhSuaDiaChi && selectedTinh) ? 1 : 0.6 }}
                      >
                        <option value="">-- Chọn quận/huyện --</option>
                        {quans.map(quan => (
                          <option key={quan.KhuVucID} value={quan.KhuVucID}>{quan.TenKhuVuc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="cda-label" style={{ fontSize: '0.875rem' }}>Phường/Xã</label>
                      <select 
                        value={selectedPhuong} 
                        onChange={(e) => xuLyChonPhuong(e.target.value)}
                        className={`cda-select ${errors.KhuVucID ? 'cda-input-error' : ''}`}
                        disabled={!choPhepChinhSuaDiaChi || !selectedQuan}
                        style={{ opacity: (choPhepChinhSuaDiaChi && selectedQuan) ? 1 : 0.6 }}
                      >
                        <option value="">-- Chọn phường/xã --</option>
                        {phuongs.map(phuong => (
                          <option key={phuong.KhuVucID} value={phuong.KhuVucID}>{phuong.TenKhuVuc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="cda-label" style={{ fontSize: '0.875rem' }}>Địa chỉ chi tiết</label>
                    <input
                      type="text"
                      value={diaChi}
                      onChange={(e) => setDiaChi(e.target.value)}
                      className="cda-input"
                      placeholder="Số nhà, tên đường..."
                      disabled={!choPhepChinhSuaDiaChi}
                      style={{ opacity: choPhepChinhSuaDiaChi ? 1 : 0.6 }}
                    />
                  </div>
                  {errors.KhuVucID && <p className="cda-error-message">{errors.KhuVucID}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Thông tin cơ bản */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('2. Thông Tin Cơ Bản', 'thongTinCoBan', true, 'Tiêu đề, mô tả, giá và diện tích')}
          
          {sectionsExpanded.thongTinCoBan && (
            <div className="cda-card-body">
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Tiêu đề */}
                <div className="cda-form-group">
                  <label className="cda-label cda-label-required">Tiêu đề tin đăng</label>
                  <input
                    type="text"
                    name="TieuDe"
                    value={formData.TieuDe}
                    onChange={xuLyThayDoiInput}
                    className={`cda-input ${errors.TieuDe ? 'cda-input-error' : ''}`}
                    placeholder="VD: Phòng trọ cao cấp giá rẻ, đầy đủ tiện nghi"
                    disabled={loading}
                  />
                  {errors.TieuDe && <p className="cda-error-message">{errors.TieuDe}</p>}
                </div>

                {/* Chế độ nhập */}
                <div className="cda-form-group">
                  <label className="cda-label">Chế độ nhập</label>
                  <select
                    value={isNhapNhieu ? 'nhieu' : 'mot'}
                    onChange={(e) => {
                      const isNhieu = e.target.value === 'nhieu';
                      setIsNhapNhieu(isNhieu);
                      // Auto expand/collapse phongs section
                      if (isNhieu) {
                        setSectionsExpanded(prev => ({ ...prev, phongs: true }));
                      }
                    }}
                    className="cda-select"
                    disabled={loading}
                  >
                    <option value="mot">Đăng 1 phòng</option>
                    <option value="nhieu">Đăng nhiều phòng</option>
                  </select>
                  <p className="cda-help-text">
                    💡 1 tin đăng chỉ nên chứa các phòng giống nhau về tổng thể
                  </p>
                </div>

                {/* Giá & Diện tích - Chỉ hiện khi đăng 1 phòng */}
                {!isNhapNhieu && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="cda-form-group">
                      <label className="cda-label cda-label-required">Giá thuê (VNĐ/tháng)</label>
                      <input
                        type="number"
                        name="Gia"
                        value={formData.Gia}
                        onChange={xuLyThayDoiInput}
                        className={`cda-input ${errors.Gia ? 'cda-input-error' : ''}`}
                        placeholder="2000000"
                        min="1"
                        disabled={loading}
                      />
                      {errors.Gia && <p className="cda-error-message">{errors.Gia}</p>}
                      <p className="cda-help-text">
                        {formData.Gia ? parseInt(formData.Gia).toLocaleString('vi-VN') + ' ₫' : '0 ₫'}
                      </p>
                    </div>

                    <div className="cda-form-group">
                      <label className="cda-label cda-label-required">Diện tích (m²)</label>
                      <input
                        type="number"
                        name="DienTich"
                        value={formData.DienTich}
                        onChange={xuLyThayDoiInput}
                        className={`cda-input ${errors.DienTich ? 'cda-input-error' : ''}`}
                        placeholder="25"
                        min="1"
                        step="0.1"
                        disabled={loading}
                      />
                      {errors.DienTich && <p className="cda-error-message">{errors.DienTich}</p>}
                    </div>
                  </div>
                )}

                {/* Mô tả */}
                <div className="cda-form-group">
                  <label className="cda-label">Mô tả chi tiết</label>
                  <textarea
                    name="MoTa"
                    value={formData.MoTa}
                    onChange={xuLyThayDoiInput}
                    className="cda-textarea"
                    placeholder="Mô tả chi tiết về phòng trọ, tiện ích, quy định..."
                    rows="5"
                    disabled={loading}
                  />
                  <p className="cda-help-text">
                    Mô tả chi tiết giúp thu hút khách hàng tốt hơn
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Tiện ích & Dịch vụ */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('3. Tiện Ích & Dịch Vụ', 'tienIch', false, 'Tùy chọn: Tiện ích phòng và giá dịch vụ')}
          
          {sectionsExpanded.tienIch && (
            <div className="cda-card-body">
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Tiện ích */}
                <div className="cda-form-group">
                  <label className="cda-label">Tiện ích phòng</label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '0.75rem',
                    marginTop: '0.5rem' 
                  }}>
                    {DANH_SACH_TIEN_ICH.map(tienIch => (
                      <label 
                        key={tienIch} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          transition: 'all 0.2s',
                          background: formData.TienIch.includes(tienIch) ? '#eff6ff' : 'white',
                          borderColor: formData.TienIch.includes(tienIch) ? '#3b82f6' : '#e5e7eb'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.TienIch.includes(tienIch)}
                          onChange={() => xuLyChonTienIch(tienIch)}
                          disabled={loading}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>{tienIch}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Giá dịch vụ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div className="cda-form-group">
                    <label className="cda-label">Giá điện (VNĐ/kWh)</label>
                    <input
                      type="number"
                      name="GiaDien"
                      value={formData.GiaDien}
                      onChange={xuLyThayDoiInput}
                      className="cda-input"
                      placeholder="3500"
                      min="0"
                      step="100"
                      disabled={loading}
                    />
                    <p className="cda-help-text">
                      {formData.GiaDien ? parseInt(formData.GiaDien).toLocaleString('vi-VN') + ' ₫/kWh' : 'Tùy chọn'}
                    </p>
                  </div>

                  <div className="cda-form-group">
                    <label className="cda-label">Giá nước (VNĐ/m³)</label>
                    <input
                      type="number"
                      name="GiaNuoc"
                      value={formData.GiaNuoc}
                      onChange={xuLyThayDoiInput}
                      className="cda-input"
                      placeholder="20000"
                      min="0"
                      step="100"
                      disabled={loading}
                    />
                    <p className="cda-help-text">
                      {formData.GiaNuoc ? parseInt(formData.GiaNuoc).toLocaleString('vi-VN') + ' ₫/m³' : 'Tùy chọn'}
                    </p>
                  </div>

                  <div className="cda-form-group">
                    <label className="cda-label">Giá dịch vụ (VNĐ/tháng)</label>
                    <input
                      type="number"
                      name="GiaDichVu"
                      value={formData.GiaDichVu}
                      onChange={xuLyThayDoiInput}
                      className="cda-input"
                      placeholder="100000"
                      min="0"
                      step="1000"
                      disabled={loading}
                    />
                    <p className="cda-help-text">
                      {formData.GiaDichVu ? parseInt(formData.GiaDichVu).toLocaleString('vi-VN') + ' ₫/tháng' : 'Tùy chọn'}
                    </p>
                  </div>
                </div>

                <div className="cda-form-group">
                  <label className="cda-label">Mô tả giá dịch vụ</label>
                  <textarea
                    name="MoTaGiaDichVu"
                    value={formData.MoTaGiaDichVu}
                    onChange={xuLyThayDoiInput}
                    className="cda-textarea"
                    placeholder="VD: Phí dịch vụ bao gồm vệ sinh chung, bảo trì thang máy..."
                    rows="2"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Danh sách phòng (chỉ hiện khi nhập nhiều) */}
        {isNhapNhieu && (
          <div className="cda-card" style={{ marginBottom: '1rem' }}>
            {renderSectionHeader('4. Danh Sách Phòng', 'phongs', true, 'Nhập thông tin từng phòng')}
            
            {sectionsExpanded.phongs && (
              <div className="cda-card-body">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Tên phòng</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Giá (VNĐ/tháng)</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Diện tích (m²)</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>URL ảnh</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Ghi chú</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb', width: '100px' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phongs.map((phong, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              value={phong.tenPhong} 
                              onChange={(e) => updatePhong(index, 'tenPhong', e.target.value)}
                              className="cda-input"
                              placeholder="VD: Phòng 101"
                              style={{ minWidth: '120px' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              type="number" 
                              value={phong.gia} 
                              onChange={(e) => updatePhong(index, 'gia', e.target.value)}
                              className="cda-input"
                              placeholder="2000000"
                              min="1"
                              style={{ minWidth: '120px' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              type="number" 
                              value={phong.dienTich} 
                              onChange={(e) => updatePhong(index, 'dienTich', e.target.value)}
                              className="cda-input"
                              placeholder="25"
                              min="1"
                              step="0.1"
                              style={{ minWidth: '100px' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              type="url"
                              value={phong.url} 
                              onChange={(e) => updatePhong(index, 'url', e.target.value)}
                              className="cda-input"
                              placeholder="https://..."
                              style={{ minWidth: '150px' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              value={phong.ghiChu} 
                              onChange={(e) => updatePhong(index, 'ghiChu', e.target.value)}
                              className="cda-input"
                              placeholder="Tùy chọn"
                              style={{ minWidth: '150px' }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button 
                              type="button"
                              onClick={() => xoaPhong(index)}
                              className="cda-btn cda-btn-secondary"
                              style={{ 
                                padding: '0.5rem', 
                                fontSize: '0.875rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none'
                              }}
                              disabled={phongs.length === 1}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  type="button"
                  onClick={themPhong}
                  className="cda-btn cda-btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  ➕ Thêm phòng
                </button>
                {errors.Phongs && <p className="cda-error-message" style={{ marginTop: '0.5rem' }}>{errors.Phongs}</p>}
              </div>
            )}
          </div>
        )}

        {/* Section 5: Hình ảnh */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('5. Hình Ảnh', 'hinhAnh', true, 'Tải lên ít nhất 1 hình ảnh')}
          
          {sectionsExpanded.hinhAnh && (
            <div className="cda-card-body">
              <div className="cda-form-group">
                <label className="cda-label cda-label-required">Chọn ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={xuLyChonAnh}
                  className="cda-input"
                  disabled={loading}
                />
                <p className="cda-help-text">
                  Chấp nhận file ảnh, tối đa 5MB/file
                </p>
                {errors.URL && <p className="cda-error-message">{errors.URL}</p>}
              </div>

              {/* Preview ảnh */}
              {anhPreview.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {anhPreview.map((preview, index) => (
                    <div key={index} style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                      <img 
                        src={preview.url} 
                        alt={preview.name}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => xoaAnh(index)}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/chu-du-an/tin-dang')}
            className="cda-btn cda-btn-secondary"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="cda-btn cda-btn-primary"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : '✓ Đăng tin'}
          </button>
        </div>
      </form>

      {/* Modal tạo nhanh dự án */}
      <ModalTaoNhanhDuAn
        isOpen={hienModalTaoDuAn}
        onClose={() => setHienModalTaoDuAn(false)}
        onSuccess={xuLyTaoDuAnThanhCong}
      />
    </ChuDuAnLayout>
  );
}

export default TaoTinDang;
