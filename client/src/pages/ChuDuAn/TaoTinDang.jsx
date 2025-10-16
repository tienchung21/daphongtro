import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService, DuAnService, KhuVucService } from '../../services/ChuDuAnService';
import ModalTaoNhanhDuAn from '../../components/ChuDuAn/ModalTaoNhanhDuAn';
import ModalChinhSuaToaDo from '../../components/ChuDuAn/ModalChinhSuaToaDo';
import SectionChonPhong from '../../components/ChuDuAn/SectionChonPhong';
import axios from 'axios';

// React Icons
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineXMark,
  HiOutlineLightBulb,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from 'react-icons/hi2';

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

const normalizeGiaInput = (value) => {
  if (value === null || value === undefined) return '';
  let str = String(value).trim();
  if (!str) return '';
  str = str.replace(/,/g, '.');
  const decimalMatch = str.match(/^(\d+)\.(\d+)$/);
  if (decimalMatch) {
    const [, intPart, decimalPart] = decimalMatch;
    if (decimalPart.length <= 2) {
      const num = Math.round(parseFloat(str));
      return Number.isFinite(num) ? String(num) : '';
    }
  }
  return str.replace(/\D/g, '');
};

/**
 * Format giá tiền: 10000 → "10.000"
 */
const formatGiaTien = (value) => {
  const digits = normalizeGiaInput(value);
  if (!digits) return '';
  // Thêm dấu chấm phân cách hàng nghìn
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse giá tiền về số: "10.000" → 10000
 */
const parseGiaTien = (value) => {
  if (!value) return '';
  return value.toString().replace(/\./g, '');
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
  const [diaChi, setDiaChi] = useState('');
  const [dangPrefillDiaChi, setDangPrefillDiaChi] = useState(false);
  const [pendingQuanName, setPendingQuanName] = useState('');
  const [pendingPhuongName, setPendingPhuongName] = useState('');
  const [choPhepChinhSuaDiaChi, setChoPhepChinhSuaDiaChi] = useState(false);
  const [diaChiGoc, setDiaChiGoc] = useState('');
  const [hienModalTaoDuAn, setHienModalTaoDuAn] = useState(false);

  // State cho tọa độ (từ dự án)
  const [viDo, setViDo] = useState('');
  const [kinhDo, setKinhDo] = useState('');
  const [hienModalChinhSuaToaDo, setHienModalChinhSuaToaDo] = useState(false);
  
  // State cho kiểm tra trùng địa chỉ
  const [danhSachTinDang, setDanhSachTinDang] = useState([]);
  const [canhBaoDiaChi, setCanhBaoDiaChi] = useState('');

  // ===== STATE CHO CHỌN PHÒNG (REDESIGN 09/10/2025) =====
  const [danhSachPhongDuAn, setDanhSachPhongDuAn] = useState([]);
  const [phongDaChon, setPhongDaChon] = useState([]);
  const [modalTaoPhongMoi, setModalTaoPhongMoi] = useState(false);
  const [formPhongMoi, setFormPhongMoi] = useState({
    TenPhong: '',
    GiaChuan: '',
    DienTichChuan: '',
    MoTaPhong: ''
  });
  
  // ===== ACCORDION STATE =====
  const [sectionsExpanded, setSectionsExpanded] = useState({
    duAn: true,
    thongTinCoBan: true,
    chonPhong: true, // Redesign 09/10/2025 - mở sẵn để chọn phòng
    tienIch: false, // Đưa xuống sau chọn phòng
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

  // Handler riêng cho các trường giá tiền (tự động format)
  const xuLyThayDoiGiaTien = (fieldName) => (e) => {
    const value = e.target.value;
    const formatted = formatGiaTien(value);
    setFormData(prev => ({ ...prev, [fieldName]: formatted }));
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
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

  const xuLyTaoDuAnThanhCong = (duAnMoi) => {
    setDuAns(prev => [duAnMoi, ...prev]);
    setFormData(prev => ({ ...prev, DuAnID: duAnMoi.DuAnID }));
  };

  // ===== FUNCTIONS CHO CHỌN PHÒNG (REDESIGN 09/10/2025) =====
  
  // Load danh sách phòng khi chọn dự án
  const layDanhSachPhongDuAn = async (duAnId) => {
    try {
      const token = localStorage.getItem('token') || 'mock-token-for-development';
      const response = await axios.get(
        `http://localhost:5000/api/chu-du-an/du-an/${duAnId}/phong`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data: payload } = response;
      if (Array.isArray(payload)) {
        setDanhSachPhongDuAn(payload);
        return;
      }

      if (payload && Array.isArray(payload.data)) {
        setDanhSachPhongDuAn(payload.data);
        return;
      }

      setDanhSachPhongDuAn([]);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
      setDanhSachPhongDuAn([]);
    }
  };

  // useEffect: Load phòng khi chọn dự án
  useEffect(() => {
    if (formData.DuAnID) {
      layDanhSachPhongDuAn(formData.DuAnID);
    } else {
      setDanhSachPhongDuAn([]);
      setPhongDaChon([]);
    }
  }, [formData.DuAnID]);

  // Chọn/bỏ chọn phòng
  const xuLyChonPhong = (phong, isChecked) => {
    if (isChecked) {
      setPhongDaChon(prev => [...prev, {
        PhongID: phong.PhongID,
        TenPhong: phong.TenPhong,
        GiaTinDang: null,
        DienTichTinDang: null,
        MoTaTinDang: null,
        HinhAnhTinDang: null,
        HinhAnhTinDangFile: null,
        HinhAnhTinDangPreview: null,
        ThuTuHienThi: 0
      }]);
    } else {
      setPhongDaChon(prev => prev.filter(p => p.PhongID !== phong.PhongID));
    }
  };

  // Override giá cho phòng
  const xuLyOverrideGiaPhong = (phongId, value) => {
    const formatted = formatGiaTien(value);
    setPhongDaChon(prev => prev.map(p => 
      p.PhongID === phongId 
        ? { ...p, GiaTinDang: formatted ? parseGiaTien(formatted) : null }
        : p
    ));
  };

  // Override diện tích cho phòng
  const xuLyOverrideDienTichPhong = (phongId, value) => {
    setPhongDaChon(prev => prev.map(p =>
      p.PhongID === phongId
        ? { ...p, DienTichTinDang: value ? parseFloat(value) : null }
        : p
    ));
  };

  // Override mô tả cho phòng
  const xuLyOverrideMoTaPhong = (phongId, value) => {
    setPhongDaChon(prev => prev.map(p =>
      p.PhongID === phongId
        ? { ...p, MoTaTinDang: value || null }
        : p
    ));
  };

  // Override ảnh cho phòng (file + preview)
  const xuLyOverrideHinhAnhPhong = (phongId, file) => {
    if (!file || !(file.type || '').startsWith('image/')) return;
    const previewUrl = URL.createObjectURL(file);
    setPhongDaChon(prev => prev.map(p =>
      p.PhongID === phongId
        ? { ...p, HinhAnhTinDangFile: file, HinhAnhTinDangPreview: previewUrl, HinhAnhTinDang: null }
        : p
    ));
  };

  const xoaAnhPhongOverride = (phongId) => {
    setPhongDaChon(prev => prev.map(p => {
      if (p.PhongID !== phongId) return p;
      if (p.HinhAnhTinDangPreview) {
        try { URL.revokeObjectURL(p.HinhAnhTinDangPreview); } catch (e) {}
      }
      return { ...p, HinhAnhTinDangFile: null, HinhAnhTinDangPreview: null, HinhAnhTinDang: null };
    }));
  };

  // Tạo phòng mới
  const xuLyTaoPhongMoi = async () => {
    if (!formPhongMoi.TenPhong || !formPhongMoi.GiaChuan || !formPhongMoi.DienTichChuan) {
      alert('Vui lòng điền đầy đủ: Tên phòng, Giá chuẩn, Diện tích chuẩn');
      return;
    }

    try {
      const token = localStorage.getItem('token') || 'mock-token-for-development';
      const response = await axios.post(
        `http://localhost:5000/api/chu-du-an/du-an/${formData.DuAnID}/phong`,
        {
          TenPhong: formPhongMoi.TenPhong,
          GiaChuan: parseFloat(parseGiaTien(formPhongMoi.GiaChuan)),
          DienTichChuan: parseFloat(formPhongMoi.DienTichChuan),
          MoTaPhong: formPhongMoi.MoTaPhong || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Tạo phòng mới thành công!');
      setModalTaoPhongMoi(false);
      setFormPhongMoi({ TenPhong: '', GiaChuan: '', DienTichChuan: '', MoTaPhong: '' });
      layDanhSachPhongDuAn(formData.DuAnID); // Reload danh sách
    } catch (error) {
      console.error('Lỗi khi tạo phòng:', error);
      alert(error.response?.data?.message || 'Lỗi khi tạo phòng mới');
    }
  };

  // ===== VALIDATION =====
  const validate = () => {
    const newErrors = {};
    
    if (!formData.DuAnID) newErrors.DuAnID = 'Vui lòng chọn dự án';
    if (!formData.TieuDe) newErrors.TieuDe = 'Vui lòng nhập tiêu đề';
    if (phongDaChon.length === 0) {
      newErrors.PhongIDs = 'Vui lòng chọn ít nhất một phòng cho tin đăng';
    }
    
    if (anhPreview.length === 0) newErrors.URL = 'Vui lòng tải lên ít nhất 1 hình ảnh';
    if (!selectedPhuong) newErrors.KhuVucID = 'Vui lòng chọn địa chỉ đầy đủ';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.warn('TaoTinDang.validate() validation errors:', newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  // ===== SUBMIT =====
  const thucHienGuiTinDang = async (trangThai = 'ChoDuyet') => {
    if (loading) return;

    if (!validate()) {
      alert('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setLoading(true);

      // 1. Upload ảnh tin đăng chính
      let uploadedUrls = [];
      if (anhPreview.length > 0) {
        const files = anhPreview.map(p => p.file);
        uploadedUrls = await uploadAnh(files);
      }

      // 2. Upload ảnh override cho các phòng đã chọn từ dự án (nếu có)
      let phongDaChonUploads = phongDaChon;
      if (phongDaChon.length > 0) {
        phongDaChonUploads = await Promise.all(phongDaChon.map(async (p) => {
          let anhUrl = p.HinhAnhTinDang || null;
          if (p.HinhAnhTinDangFile) {
            const [u] = await uploadAnh([p.HinhAnhTinDangFile]);
            anhUrl = u || null;
          }
          return { ...p, HinhAnhTinDang: anhUrl };
        }));
      }

      const tinDangData = {
        DuAnID: parseInt(formData.DuAnID, 10),
        TieuDe: formData.TieuDe,
        MoTa: formData.MoTa,
        KhuVucID: selectedPhuong ? parseInt(selectedPhuong, 10) : null,
        ChinhSachCocID: formData.ChinhSachCocID || 1,
        URL: uploadedUrls,
        TienIch: formData.TienIch,
        GiaDien: formData.GiaDien ? parseFloat(parseGiaTien(formData.GiaDien)) : null,
        GiaNuoc: formData.GiaNuoc ? parseFloat(parseGiaTien(formData.GiaNuoc)) : null,
        GiaDichVu: formData.GiaDichVu ? parseFloat(parseGiaTien(formData.GiaDichVu)) : null,
        MoTaGiaDichVu: formData.MoTaGiaDichVu || null,
        DiaChi: diaChi,
        ViDo: viDo ? parseFloat(viDo) : null,
        KinhDo: kinhDo ? parseFloat(kinhDo) : null,
        TrangThai: trangThai,
        PhongIDs: phongDaChonUploads.map(p => ({
          PhongID: p.PhongID,
          GiaTinDang: p.GiaTinDang || null,
          DienTichTinDang: p.DienTichTinDang || null,
          MoTaTinDang: p.MoTaTinDang || null,
          HinhAnhTinDang: p.HinhAnhTinDang || null,
          ThuTuHienThi: 0
        })),
        CapNhatDiaChiDuAn: choPhepChinhSuaDiaChi
      };

      console.log('📤 Dữ liệu gửi lên backend:', JSON.stringify(tinDangData, null, 2));

      const response = await TinDangService.tao(tinDangData);

      if (response.success) {
        alert(trangThai === 'Nhap' ? 'Đã lưu nháp tin đăng!' : 'Đã gửi tin đăng chờ duyệt!');
        navigate('/chu-du-an/tin-dang');
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err) {
      console.error('Lỗi khi tạo tin đăng:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const xuLyGuiForm = async (e) => {
    e.preventDefault();
    await thucHienGuiTinDang('ChoDuyet');
  };

  const xuLyLuuNhap = async () => {
    await thucHienGuiTinDang('Nhap');
  };

  const uploadAnh = async (files) => {
    const token = localStorage.getItem('token') || 'mock-token-for-development';
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('anh', file));
    const response = await fetch('/api/chu-du-an/upload-anh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
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
    layDanhSachTinDang();
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

  // Kiểm tra trùng địa chỉ khi thay đổi địa chỉ
  useEffect(() => {
    const kiemTraDiaChi = () => {
      // Reset cảnh báo
      setCanhBaoDiaChi('');
      
      // Chỉ kiểm tra khi đã chọn đủ thông tin
      if (!formData.DuAnID || !selectedPhuong || !diaChi.trim()) {
        return;
      }

      // Tạo địa chỉ đầy đủ để so sánh
      const tinhObj = tinhs.find(t => t.KhuVucID === parseInt(selectedTinh));
      const quanObj = quans.find(q => q.KhuVucID === parseInt(selectedQuan));
      const phuongObj = phuongs.find(p => p.KhuVucID === parseInt(selectedPhuong));
      
      if (!tinhObj || !quanObj || !phuongObj) return;

      const diaChiDayDu = `${diaChi.trim()}, ${phuongObj.TenKhuVuc}, ${quanObj.TenKhuVuc}, ${tinhObj.TenKhuVuc}`;
      
      // Chuẩn hóa địa chỉ để so sánh (bỏ dấu, lowercase)
      const chuanHoaDiaChi = (str) => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim();
      };

      const diaChiChuanHoa = chuanHoaDiaChi(diaChiDayDu);

      // Kiểm tra trùng với tin đăng hiện có trong cùng dự án
      const tinTrung = danhSachTinDang.find(tin => {
        // Chỉ kiểm tra tin đăng của cùng dự án
        if (tin.DuAnID !== parseInt(formData.DuAnID)) return false;
        
        // So sánh địa chỉ
        const diaChiTinChuanHoa = chuanHoaDiaChi(tin.DiaChi || '');
        return diaChiTinChuanHoa === diaChiChuanHoa;
      });

      if (tinTrung) {
        setCanhBaoDiaChi(`⚠️ Địa chỉ này đã tồn tại trong tin đăng "${tinTrung.TieuDe}" (ID: ${tinTrung.TinDangID})`);
      }
    };

    // Debounce để tránh kiểm tra quá nhiều lần
    const timer = setTimeout(kiemTraDiaChi, 500);
    return () => clearTimeout(timer);
  }, [formData.DuAnID, selectedTinh, selectedQuan, selectedPhuong, diaChi, danhSachTinDang, tinhs, quans, phuongs]);

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
          console.log('🏢 Dự án được chọn:', duAnChon);
          
          const { chiTiet, phuong, quan, tinh } = tachDiaChiDuAn(duAnChon.DiaChi);
          setDiaChi(chiTiet || '');
          setDiaChiGoc(duAnChon.DiaChi);
          setDangPrefillDiaChi(true);
          setPendingQuanName(quan || '');
          setPendingPhuongName(phuong || '');
          
          // Lấy tọa độ từ dự án
          if (duAnChon.ViDo && duAnChon.KinhDo) {
            console.log('📍 Tọa độ từ dự án:', { ViDo: duAnChon.ViDo, KinhDo: duAnChon.KinhDo });
            setViDo(duAnChon.ViDo.toString());
            setKinhDo(duAnChon.KinhDo.toString());
          } else {
            console.warn('⚠️ Dự án chưa có tọa độ');
            setViDo('');
            setKinhDo('');
          }
          
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

  const layDanhSachTinDang = async () => {
    try {
      const response = await TinDangService.layDanhSach();
      // Response có thể là { success: true, data: [...] } hoặc trực tiếp là array
      const data = response?.data || response || [];
      console.log('📋 Danh sách tin đăng:', data);
      setDanhSachTinDang(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tin đăng:', err);
      setDanhSachTinDang([]);
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
                    <HiOutlinePlus style={{ width: '16px', height: '16px' }} />
                    Tạo dự án mới
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
                        <HiOutlinePencil style={{ width: '16px', height: '16px' }} />
                        Chỉnh sửa
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={huyChinhSuaDiaChi}
                        className="cda-btn cda-btn-secondary"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      >
                        <HiOutlineXMark style={{ width: '16px', height: '16px' }} />
                        Hủy
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
                      placeholder="Số nhà, tên đường (Ví dụ: 40/6 Lê Văn Thọ)"
                      disabled={!choPhepChinhSuaDiaChi}
                      style={{ opacity: choPhepChinhSuaDiaChi ? 1 : 0.6 }}
                    />
                    
                    {/* Cảnh báo trùng địa chỉ */}
                    {canhBaoDiaChi && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.75rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          color: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <HiOutlineExclamationCircle size={20} style={{ flexShrink: 0 }} />
                        <span>{canhBaoDiaChi}</span>
                      </div>
                    )}
                  </div>

                  {/* Tọa độ (từ dự án) - Read-only với nút chỉnh sửa */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <label className="cda-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                      📍 Tọa độ (Tự động từ dự án)
                    </label>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={viDo && kinhDo ? `${parseFloat(viDo).toFixed(6)}, ${parseFloat(kinhDo).toFixed(6)}` : 'Chưa có tọa độ'}
                        readOnly
                        disabled
                        className="cda-input"
                        style={{ 
                          flex: 1,
                          opacity: 0.7,
                          cursor: 'not-allowed',
                          fontSize: '0.875rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)'
                        }}
                      />
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (viDo && kinhDo) {
                            setHienModalChinhSuaToaDo(true);
                          } else {
                            alert('⚠️ Dự án chưa có tọa độ. Vui lòng cập nhật tọa độ cho dự án trước.');
                          }
                        }}
                        disabled={!viDo || !kinhDo}
                        style={{
                          padding: '0.625rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          background: viDo && kinhDo 
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                            : 'rgba(107, 114, 128, 0.1)',
                          color: viDo && kinhDo ? '#8b5cf6' : '#6b7280',
                          cursor: viDo && kinhDo ? 'pointer' : 'not-allowed',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          opacity: viDo && kinhDo ? 1 : 0.5
                        }}
                        onMouseEnter={(e) => {
                          if (viDo && kinhDo) {
                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (viDo && kinhDo) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                          }
                        }}
                      >
                        <HiOutlinePencil size={16} />
                        Chỉnh sửa
                      </button>
                    </div>
                    
                    <p style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.75rem', 
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <HiOutlineLightBulb size={14} />
                      Tọa độ được lấy tự động từ dự án. Nhấn "Chỉnh sửa" để điều chỉnh trên bản đồ.
                    </p>
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

        {/* Section: Chọn Phòng - REDESIGN 09/10/2025 */}
        {formData.DuAnID && (
          <div className="cda-card" style={{ marginBottom: '1rem' }}>
            {renderSectionHeader('3. Chọn Phòng', 'chonPhong', false, 'Chọn phòng từ dự án hoặc tạo mới')}
            
            {sectionsExpanded.chonPhong && (
              <div className="cda-card-body">
                <SectionChonPhong
                  danhSachPhongDuAn={danhSachPhongDuAn}
                  phongDaChon={phongDaChon}
                  onChonPhong={xuLyChonPhong}
                  onOverrideGia={xuLyOverrideGiaPhong}
                onOverrideDienTich={xuLyOverrideDienTichPhong}
                onOverrideMoTa={xuLyOverrideMoTaPhong}
                onOverrideHinhAnh={xuLyOverrideHinhAnhPhong}
                onXoaAnhPhong={xoaAnhPhongOverride}
                onMoModalTaoPhong={() => setModalTaoPhongMoi(true)}
                formatGiaTien={formatGiaTien}
              />
                {errors.PhongIDs && (
                  <p className="cda-error-message" style={{ marginTop: '0.75rem' }}>{errors.PhongIDs}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Section 4: Tiện ích & Dịch vụ */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('4. Tiện Ích & Dịch Vụ', 'tienIch', false, 'Tùy chọn: Tiện ích phòng và giá dịch vụ')}
          
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
                      type="text"
                      name="GiaDien"
                      value={formData.GiaDien}
                      onChange={xuLyThayDoiGiaTien('GiaDien')}
                      className="cda-input"
                      placeholder="VD: 3.500"
                      disabled={loading}
                    />
                    <p className="cda-help-text">
                      {formData.GiaDien ? parseInt(parseGiaTien(formData.GiaDien)).toLocaleString('vi-VN') + ' ₫/kWh' : 'Tùy chọn'}
                    </p>
                  </div>

                  <div className="cda-form-group">
                    <label className="cda-label">Giá nước (VNĐ/m³)</label>
                    <input
                      type="text"
                      name="GiaNuoc"
                      value={formData.GiaNuoc}
                      onChange={xuLyThayDoiGiaTien('GiaNuoc')}
                      className="cda-input"
                      placeholder="VD: 20.000"
                      disabled={loading}
                    />
                    <p className="cda-help-text">
                      {formData.GiaNuoc ? parseInt(parseGiaTien(formData.GiaNuoc)).toLocaleString('vi-VN') + ' ₫/m³' : 'Tùy chọn'}
                    </p>
                  </div>

                  <div className="cda-form-group">
                    <label className="cda-label">Giá dịch vụ (VNĐ/tháng)</label>
                    <input
                      type="text"
                      name="GiaDichVu"
                      value={formData.GiaDichVu}
                      onChange={xuLyThayDoiGiaTien('GiaDichVu')}
                      className="cda-input"
                      placeholder="VD: 100.000"
                      disabled={loading}
                    />
                    <p className="cda-help-text">
                      {formData.GiaDichVu ? parseInt(parseGiaTien(formData.GiaDichVu)).toLocaleString('vi-VN') + ' ₫/tháng' : 'Tùy chọn'}
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
            type="button"
            onClick={xuLyLuuNhap}
            className="cda-btn cda-btn-secondary"
            disabled={loading}
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            className="cda-btn cda-btn-primary"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : '✓ Gửi duyệt'}
          </button>
        </div>
      </form>

      {/* Modal tạo nhanh dự án */}
      <ModalTaoNhanhDuAn
        isOpen={hienModalTaoDuAn}
        onClose={() => setHienModalTaoDuAn(false)}
        onSuccess={xuLyTaoDuAnThanhCong}
      />

      {/* Modal chỉnh sửa tọa độ */}
      {hienModalChinhSuaToaDo && viDo && kinhDo && (
        <ModalChinhSuaToaDo
          isOpen={hienModalChinhSuaToaDo}
          onClose={() => setHienModalChinhSuaToaDo(false)}
          initialPosition={{
            lat: parseFloat(viDo),
            lng: parseFloat(kinhDo)
          }}
          onSave={(newPos) => {
            setViDo(newPos.lat.toString());
            setKinhDo(newPos.lng.toString());
            setHienModalChinhSuaToaDo(false);
          }}
          tieuDe={formData.TieuDe || 'Tin đăng mới'}
        />
      )}

      {/* Modal Tạo Phòng Mới - REDESIGN 09/10/2025 */}
      {modalTaoPhongMoi && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setModalTaoPhongMoi(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>
              Tạo Phòng Mới
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="cda-form-group">
                <label className="cda-label cda-label-required">Tên phòng</label>
                <input
                  type="text"
                  value={formPhongMoi.TenPhong}
                  onChange={(e) => setFormPhongMoi(prev => ({ ...prev, TenPhong: e.target.value }))}
                  className="cda-input"
                  placeholder="VD: 101, A01, P.202..."
                  autoFocus
                />
              </div>

              <div className="cda-form-group">
                <label className="cda-label cda-label-required">Giá chuẩn (VNĐ/tháng)</label>
                <input
                  type="text"
                  value={formPhongMoi.GiaChuan}
                  onChange={(e) => setFormPhongMoi(prev => ({ ...prev, GiaChuan: formatGiaTien(e.target.value) }))}
                  className="cda-input"
                  placeholder="VD: 3.000.000"
                />
                {formPhongMoi.GiaChuan && (
                  <p className="cda-help-text">
                    {parseInt(parseGiaTien(formPhongMoi.GiaChuan)).toLocaleString('vi-VN')} ₫/tháng
                  </p>
                )}
              </div>

              <div className="cda-form-group">
                <label className="cda-label cda-label-required">Diện tích chuẩn (m²)</label>
                <input
                  type="number"
                  value={formPhongMoi.DienTichChuan}
                  onChange={(e) => setFormPhongMoi(prev => ({ ...prev, DienTichChuan: e.target.value }))}
                  className="cda-input"
                  placeholder="VD: 25"
                  step="0.1"
                  min="1"
                />
              </div>

              <div className="cda-form-group">
                <label className="cda-label">Mô tả phòng</label>
                <textarea
                  value={formPhongMoi.MoTaPhong}
                  onChange={(e) => setFormPhongMoi(prev => ({ ...prev, MoTaPhong: e.target.value }))}
                  className="cda-textarea"
                  placeholder="Tầng, hướng, view, nội thất..."
                  rows="3"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => {
                  setModalTaoPhongMoi(false);
                  setFormPhongMoi({ TenPhong: '', GiaChuan: '', DienTichChuan: '', MoTaPhong: '' });
                }}
                className="cda-btn cda-btn-secondary"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={xuLyTaoPhongMoi}
                className="cda-btn cda-btn-primary"
              >
                ✓ Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </ChuDuAnLayout>
  );
}

export default TaoTinDang;
