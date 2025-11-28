import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService, DuAnService, KhuVucService } from '../../services/ChuDuAnService';
import ModalChinhSuaToaDo from '../../components/ChuDuAn/ModalChinhSuaToaDo';
import SectionChonPhong from '../../components/ChuDuAn/SectionChonPhong';
import axios from 'axios';
import './ChinhSuaTinDang.css';

// React Icons - Thêm các icon cần thiết
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLightBulb,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft
} from 'react-icons/hi2';

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
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse giá tiền về số: "10.000" → 10000
 */
const parseGiaTien = (value) => {
  if (!value) return '';
  return value.toString().replace(/\./g, '');
};

/**
 * Tách địa chỉ dự án thành các phần
 * Input: "40/6 Lê Văn Thọ, Phường 11, Quận Gò Vấp, TP. Hồ Chí Minh"
 * Output: { chiTiet: "40/6 Lê Văn Thọ", phuong: "Phường 11", quan: "Quận Gò Vấp", tinh: "TP. Hồ Chí Minh" }
 */
const tachDiaChiDuAn = (diaChi = '') => {
  if (!diaChi) return { chiTiet: '', phuong: '', quan: '', tinh: '' };
  
  const parts = diaChi.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return { chiTiet: '', phuong: '', quan: '', tinh: '' };
  
  // Lấy từ cuối lên: tỉnh, quận, phường, địa chỉ chi tiết
  const tinh = parts.length > 0 ? parts.pop() : '';
  const quan = parts.length > 0 ? parts.pop() : '';
  const phuong = parts.length > 0 ? parts.pop() : '';
  const chiTiet = parts.join(', '); // Phần còn lại là địa chỉ chi tiết
  
  return { chiTiet: chiTiet || '', phuong, quan, tinh };
};

import { getApiBaseUrl } from '../../config/api';

const API_BASE_URL = getApiBaseUrl();

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
  return url;
};

const toRelativeUploadPath = (url = '') => {
  if (!url) return null;
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads')) return url;
  if (url.startsWith('uploads/')) return `/${url}`;
  try {
    const parsed = new URL(url);
    if (parsed.pathname?.startsWith('/uploads')) {
      return parsed.pathname;
    }
  } catch {
    // ignore
  }
  return url;
};

/**
 * Trang Chỉnh Sửa Tin Đăng - Redesigned
 * Dựa trên cấu trúc TaoTinDang.jsx
 * 
 * Features:
 * - Load tin đăng hiện tại (1 phòng hoặc nhiều phòng)
 * - Accordion sections
 * - Chỉnh sửa toàn bộ thông tin
 * - Lưu nháp hoặc gửi duyệt
 */
function ChinhSuaTinDang() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duAns, setDuAns] = useState([]);
  const [errors, setErrors] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    DuAnID: '',
    TieuDe: '',
    MoTa: '',
    KhuVucID: '',
    TienIch: [],
    GiaDien: '',
    GiaNuoc: '',
    GiaDichVu: '',
    MoTaGiaDichVu: '',
    TrangThai: '' // Thêm trạng thái
  });
  
  const [anhPreview, setAnhPreview] = useState([]);
  const [tinhs, setTinhs] = useState([]);
  const [quans, setQuans] = useState([]);
  const [phuongs, setPhuongs] = useState([]);
  const [selectedTinh, setSelectedTinh] = useState('');
  const [selectedQuan, setSelectedQuan] = useState('');
  const [selectedPhuong, setSelectedPhuong] = useState('');
  const [danhSachPhongDuAn, setDanhSachPhongDuAn] = useState([]);
  const [phongDaChon, setPhongDaChon] = useState([]);
  const [modalTaoPhongMoi, setModalTaoPhongMoi] = useState(false);
  const [dangTaoPhong, setDangTaoPhong] = useState(false);
  const [formPhongMoi, setFormPhongMoi] = useState({
    TenPhong: '',
    GiaChuan: '',
    DienTichChuan: '',
    MoTaPhong: ''
  });
  
  const [diaChi, setDiaChi] = useState('');
  const [viDo, setViDo] = useState('');
  const [kinhDo, setKinhDo] = useState('');
  const [hienModalChinhSuaToaDo, setHienModalChinhSuaToaDo] = useState(false);
  
  const phongCount = phongDaChon.length;

  // ===== ACCORDION STATE =====
  const [sectionsExpanded, setSectionsExpanded] = useState({
    thongTinCoBan: true,
    diaChi: true,
    chonPhong: true,
    tienIch: true,
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

  // ===== LIFECYCLE - LOAD DỮ LIỆU =====
  useEffect(() => {
    layTinDangDeChinhSua();
  }, [id]);

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

  useEffect(() => {
    if (formData.DuAnID) {
      layDanhSachPhongDuAn(formData.DuAnID);
    } else {
      setDanhSachPhongDuAn([]);
      setPhongDaChon([]);
    }
  }, [formData.DuAnID]);

  // ===== API CALLS =====
  const layTinDangDeChinhSua = async () => {
    try {
      setLoading(true);
      const response = await TinDangService.layTinDangDeChinhSua(id);
      
      if (response.success) {
        const tinDangData = response.data;
        console.log('📥 Tin đăng loaded:', tinDangData);
        
        // Parse JSON fields với try-catch
        const tienIchParsed = (() => {
          try {
            return tinDangData.TienIch ? JSON.parse(tinDangData.TienIch) : [];
          } catch {
            return [];
          }
        })();
        
        const anhParsed = (() => {
          try {
            return tinDangData.URL ? JSON.parse(tinDangData.URL) : [];
          } catch {
            return [];
          }
        })();

        // Set form data
        setFormData({
          DuAnID: tinDangData.DuAnID || '',
          TieuDe: tinDangData.TieuDe || '',
          MoTa: tinDangData.MoTa || '',
          KhuVucID: tinDangData.KhuVucID || '',
          TienIch: tienIchParsed,
          GiaDien: tinDangData.GiaDien ? formatGiaTien(tinDangData.GiaDien) : '',
          GiaNuoc: tinDangData.GiaNuoc ? formatGiaTien(tinDangData.GiaNuoc) : '',
          GiaDichVu: tinDangData.GiaDichVu ? formatGiaTien(tinDangData.GiaDichVu) : '',
          MoTaGiaDichVu: tinDangData.MoTaGiaDichVu || '',
          TrangThai: tinDangData.TrangThai || 'Nhap' // Set trạng thái hiện tại
        });

        // Map phòng đã gắn với tin đăng
        const danhSachPhongTinDang = tinDangData.DanhSachPhong || [];
        const phongDaChonBanDau = danhSachPhongTinDang.map((phong, index) => {
          const anhOverride = phong.HinhAnhOverride || null;
          const previewSource = anhOverride || phong.URL || phong.HinhAnhHienThi || phong.HinhAnhPhong;
          const previewUrl = resolveImageUrl(previewSource) || ''
          return {
            PhongID: phong.PhongID,
            TenPhong: phong.TenPhong || '',
            GiaTinDang: phong.GiaOverride ?? null,
            DienTichTinDang: phong.DienTichOverride ?? null,
            MoTaTinDang: phong.MoTaOverride ?? null,
            HinhAnhTinDang: anhOverride,
            HinhAnhTinDangPreview: previewUrl,
            HinhAnhTinDangFile: null,
            ThuTuHienThi: phong.ThuTuHienThi || index
          };
        });
        setPhongDaChon(phongDaChonBanDau);

        if (tinDangData.DuAnID) {
          await layDanhSachPhongDuAn(tinDangData.DuAnID);
        }

        // Set địa chỉ - TÁCH TỪ DiaChiDuAn
        // Backend trả về: "40/6 Lê Văn Thọ, Phường 11, Quận Gò Vấp, TP. Hồ Chí Minh"
        const diaChiDayDu = tinDangData.DiaChiDuAn || tinDangData.DiaChi || '';
        console.log('📍 Địa chỉ đầy đủ từ backend:', diaChiDayDu);
        
        const { chiTiet, phuong, quan, tinh } = tachDiaChiDuAn(diaChiDayDu);
        console.log('📍 Địa chỉ đã tách:', { chiTiet, phuong, quan, tinh });
        
        setDiaChi(chiTiet); // Chỉ lấy phần chi tiết
        setViDo(tinDangData.ViDo ? tinDangData.ViDo.toString() : '');
        setKinhDo(tinDangData.KinhDo ? tinDangData.KinhDo.toString() : '');

        // Set ảnh preview - FIX: Thêm backend URL
        const previews = anhParsed.map((url, idx) => ({
          file: null,
          url: resolveImageUrl(url) || '',
          name: `anh-${idx + 1}`,
          isExisting: true
        }));
        setAnhPreview(previews);

        // Auto-select địa chỉ - Reverse lookup KhuVucID
        if (tinDangData.KhuVucID) {
          // Phường được chọn
          setSelectedPhuong(tinDangData.KhuVucID.toString());
          
          // Reverse lookup để tìm Quận và Tỉnh
          reverseLookupKhuVuc(tinDangData.KhuVucID);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi load tin đăng:', error);
      alert('Không thể tải thông tin tin đăng');
      navigate('/chu-du-an/tin-dang');
    } finally {
      setLoading(false);
    }
  };

  // Reverse lookup KhuVucID → Tìm Tỉnh, Quận
  const reverseLookupKhuVuc = async (phuongId) => {
    try {
      // Load toàn bộ cây khu vực từ API hoặc từ cache
      // Cách 1: Gọi API riêng để get parent hierarchy
      // Cách 2: Iterate qua danh sách đã load
      
      // Tạm thời: Load quận từ phường, rồi tỉnh từ quận
      const allTinhs = await KhuVucService.layDanhSach();
      
      for (const tinh of allTinhs) {
        const quansInTinh = await KhuVucService.layDanhSach(tinh.KhuVucID);
        
        for (const quan of quansInTinh) {
          const phuongsInQuan = await KhuVucService.layDanhSach(quan.KhuVucID);
          
          const foundPhuong = phuongsInQuan.find(p => p.KhuVucID === parseInt(phuongId));
          if (foundPhuong) {
            // Found! Set cascading
            console.log('✅ Found location:', { tinh: tinh.TenKhuVuc, quan: quan.TenKhuVuc, phuong: foundPhuong.TenKhuVuc });
            setSelectedTinh(tinh.KhuVucID.toString());
            setSelectedQuan(quan.KhuVucID.toString());
            
            // Load quận và phường cho dropdowns
            const quans = await KhuVucService.layDanhSach(tinh.KhuVucID);
            setQuans(quans || []);
            
            const phuongs = await KhuVucService.layDanhSach(quan.KhuVucID);
            setPhuongs(phuongs || []);
            
            return;
          }
        }
      }
      
      console.warn('⚠️ Không tìm thấy khu vực với ID:', phuongId);
    } catch (error) {
      console.error('❌ Lỗi reverse lookup:', error);
    }
  };

const layDanhSachPhongDuAn = async (duAnId) => {
  try {
    const token = localStorage.getItem('token') || 'mock-token-for-development';
    const response = await axios.get(
      `${API_BASE_URL}/api/chu-du-an/du-an/${duAnId}/phong`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data: payload } = response;
      if (Array.isArray(payload)) {
        setDanhSachPhongDuAn(payload);
        setPhongDaChon(prev =>
          prev
            .map(p => {
              const matched = payload.find(dp => dp.PhongID === p.PhongID);
              return matched
                ? {
                    ...p,
                    TenPhong: matched.TenPhong || p.TenPhong,
                    GiaTinDang: p.GiaTinDang,
                    DienTichTinDang: p.DienTichTinDang,
                    MoTaTinDang: p.MoTaTinDang,
                    HinhAnhTinDangPreview: p.HinhAnhTinDangPreview || resolveImageUrl(matched.HinhAnhPhong)
                  }
                : p;
            })
            .filter(p => payload.some(dp => dp.PhongID === p.PhongID))
        );
        return;
      }

      if (payload && Array.isArray(payload.data)) {
        setDanhSachPhongDuAn(payload.data);
        setPhongDaChon(prev =>
          prev
            .map(p => {
              const matched = payload.data.find(dp => dp.PhongID === p.PhongID);
              return matched
                ? {
                    ...p,
                    TenPhong: matched.TenPhong || p.TenPhong,
                    GiaTinDang: p.GiaTinDang,
                    DienTichTinDang: p.DienTichTinDang,
                    MoTaTinDang: p.MoTaTinDang,
                    HinhAnhTinDangPreview: p.HinhAnhTinDangPreview || resolveImageUrl(matched.HinhAnhPhong)
                  }
                : p;
            })
            .filter(p => payload.data.some(dp => dp.PhongID === p.PhongID))
        );
        return;
      }

      setDanhSachPhongDuAn([]);
      setPhongDaChon(prev =>
        prev.filter(p => (payload?.data || []).some(dp => dp.PhongID === p.PhongID))
      );
  } catch (error) {
    console.error('❌ Lỗi khi tải danh sách phòng dự án:', error);
    setDanhSachPhongDuAn([]);
  }
};

  const xuLyChonPhong = (phong, isChecked) => {
    if (isChecked) {
      setPhongDaChon(prev => {
        if (prev.some(p => p.PhongID === phong.PhongID)) {
          return prev;
        }
        return [
          ...prev,
          {
            PhongID: phong.PhongID,
            TenPhong: phong.TenPhong,
            GiaTinDang: null,
            DienTichTinDang: null,
            MoTaTinDang: null,
            HinhAnhTinDang: null,
            HinhAnhTinDangFile: null,
            HinhAnhTinDangPreview: null,
            ThuTuHienThi: prev.length
          }
        ];
      });
    } else {
      setPhongDaChon(prev => prev.filter(p => p.PhongID !== phong.PhongID));
    }
  };

  const xuLyOverrideGiaPhong = (phongId, value) => {
    const formatted = formatGiaTien(value);
    setPhongDaChon(prev => prev.map(p =>
      p.PhongID === phongId
        ? { ...p, GiaTinDang: formatted ? parseGiaTien(formatted) : null }
        : p
    ));
  };

  const xuLyOverrideDienTichPhong = (phongId, value) => {
    setPhongDaChon(prev => prev.map(p =>
      p.PhongID === phongId
        ? { ...p, DienTichTinDang: value ? parseFloat(value) : null }
        : p
    ));
  };

  const xuLyOverrideMoTaPhong = (phongId, value) => {
    setPhongDaChon(prev => prev.map(p =>
      p.PhongID === phongId
        ? { ...p, MoTaTinDang: value || null }
        : p
    ));
  };

  const xuLyOverrideHinhAnhPhong = (phongId, file) => {
    if (!file || !(file.type || '').startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }
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
        try { URL.revokeObjectURL(p.HinhAnhTinDangPreview); } catch (error) { /* ignore */ }
      }
      return { ...p, HinhAnhTinDangFile: null, HinhAnhTinDangPreview: null, HinhAnhTinDang: null };
    }));
  };

  const resetFormPhongMoi = () => {
    setFormPhongMoi({
      TenPhong: '',
      GiaChuan: '',
      DienTichChuan: '',
      MoTaPhong: ''
    });
  };

  const xuLyTaoPhongMoi = async () => {
    if (!formData.DuAnID) {
      alert('Vui lòng chọn dự án trước khi tạo phòng mới');
      return;
    }

    const tenPhong = formPhongMoi.TenPhong.trim();
    if (!tenPhong) {
      alert('Vui lòng nhập tên phòng');
      return;
    }

    if (!formPhongMoi.GiaChuan) {
      alert('Vui lòng nhập giá chuẩn của phòng');
      return;
    }

    if (!formPhongMoi.DienTichChuan) {
      alert('Vui lòng nhập diện tích chuẩn của phòng');
      return;
    }

    try {
      setDangTaoPhong(true);

      const token = localStorage.getItem('token') || 'mock-token-for-development';
      const giaChuanValue = parseInt(parseGiaTien(formPhongMoi.GiaChuan), 10);
      if (!Number.isFinite(giaChuanValue) || giaChuanValue <= 0) {
        alert('Giá chuẩn phải lớn hơn 0');
        setDangTaoPhong(false);
        return;
      }
      const dienTichValue = parseFloat(formPhongMoi.DienTichChuan);
      if (!Number.isFinite(dienTichValue) || dienTichValue <= 0) {
        alert('Diện tích chuẩn phải lớn hơn 0');
        setDangTaoPhong(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/chu-du-an/du-an/${formData.DuAnID}/phong`,
        {
          TenPhong: tenPhong,
          GiaChuan: giaChuanValue,
          DienTichChuan: dienTichValue,
          MoTaPhong: formPhongMoi.MoTaPhong || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newPhongId = response.data?.data?.PhongID;

      await layDanhSachPhongDuAn(formData.DuAnID);

      if (newPhongId) {
        setPhongDaChon(prev => [
          ...prev,
          {
            PhongID: newPhongId,
            TenPhong: tenPhong,
            GiaTinDang: null,
            DienTichTinDang: null,
            MoTaTinDang: null,
            HinhAnhTinDang: null,
            HinhAnhTinDangPreview: null,
            HinhAnhTinDangFile: null,
            ThuTuHienThi: prev.length
          }
        ]);
      }

      alert('Tạo phòng mới thành công!');
      resetFormPhongMoi();
      setModalTaoPhongMoi(false);
    } catch (error) {
      console.error('❌ Lỗi khi tạo phòng mới:', error);
      const message = error.response?.data?.message || 'Không thể tạo phòng mới. Vui lòng thử lại.';
      alert(message);
    } finally {
      setDangTaoPhong(false);
    }
  };

  const layDanhSachDuAn = async () => {
    try {
      const response = await DuAnService.layDanhSach();
      setDuAns(response.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách dự án:', err);
    }
  };

  // ===== EVENT HANDLERS =====
  const xuLyThayDoiInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
      name: file.name,
      isExisting: false // Ảnh mới
    }));

    setAnhPreview(prev => [...prev, ...previews]);

    if (errors.URL) {
      setErrors(prev => ({ ...prev, URL: '' }));
    }
  };

  const xoaAnh = (index) => {
    setAnhPreview(prev => {
      const newPreviews = [...prev];
      if (!newPreviews[index].isExisting) {
        URL.revokeObjectURL(newPreviews[index].url);
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  // ===== VALIDATION =====
  const validate = () => {
    const newErrors = {};
    
    if (!formData.DuAnID) newErrors.DuAnID = 'Vui lòng chọn dự án';
    if (!formData.TieuDe) newErrors.TieuDe = 'Vui lòng nhập tiêu đề';
    
    // Validation giá dịch vụ (tránh nhập quá lớn)
    const MAX_PRICE = 1000000; // 1 triệu VNĐ/kWh hoặc /m³ là quá lớn
    
    if (formData.GiaDien) {
      const giaDien = parseFloat(parseGiaTien(formData.GiaDien));
      if (giaDien > MAX_PRICE) {
        newErrors.GiaDien = `Giá điện quá lớn (>${MAX_PRICE.toLocaleString('vi-VN')} ₫/kWh). Vui lòng kiểm tra lại.`;
      }
    }
    
    if (formData.GiaNuoc) {
      const giaNuoc = parseFloat(parseGiaTien(formData.GiaNuoc));
      if (giaNuoc > MAX_PRICE) {
        newErrors.GiaNuoc = `Giá nước quá lớn (>${MAX_PRICE.toLocaleString('vi-VN')} ₫/m³). Vui lòng kiểm tra lại.`;
      }
    }
    
    if (formData.GiaDichVu) {
      const giaDichVu = parseFloat(parseGiaTien(formData.GiaDichVu));
      const MAX_DICHVU = 10000000; // 10 triệu/tháng
      if (giaDichVu > MAX_DICHVU) {
        newErrors.GiaDichVu = `Giá dịch vụ quá lớn (>${MAX_DICHVU.toLocaleString('vi-VN')} ₫/tháng). Vui lòng kiểm tra lại.`;
      }
    }

    if (phongDaChon.length === 0) {
      newErrors.PhongIDs = 'Vui lòng chọn ít nhất một phòng cho tin đăng';
    }
    
    if (anhPreview.length === 0) newErrors.URL = 'Vui lòng tải lên ít nhất 1 hình ảnh';
    if (!selectedPhuong) newErrors.KhuVucID = 'Vui lòng chọn địa chỉ đầy đủ';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.warn('ChinhSuaTinDang.validate() validation errors:', newErrors);
    }
    return Object.keys(newErrors).length === 0;
  };

  // ===== SUBMIT =====
  const xuLyLuuNhap = async () => {
    if (!validate()) {
      alert('Vui lòng kiểm tra lại thông tin');
      return;
    }
    await xuLyGui('save_draft');
  };

  const xuLyGuiDuyet = async () => {
    if (!validate()) {
      alert('Vui lòng kiểm tra lại thông tin');
      return;
    }
    await xuLyGui('send_review');
  };

  // XÓA TIN ĐĂNG
  const xuLyXoaTinDang = async () => {
    const xacNhan = window.confirm(
      '⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA TIN ĐĂNG NÀY?\n\n' +
      'Hành động này không thể hoàn tác.\n' +
      `Tin đăng: "${formData.TieuDe}"`
    );

    if (!xacNhan) return;

    // Xác nhận lần 2
    const xacNhanLan2 = window.confirm(
      '🔴 XÁC NHẬN LẦN CUỐI!\n\n' +
      'Tin đăng sẽ chuyển sang trạng thái "Lưu trữ" và không thể hiển thị công khai nữa.'
    );

    if (!xacNhanLan2) return;

    try {
      setSaving(true);
      
      // Kiểm tra xem có cần nhập lý do không (tin đã duyệt/đang đăng)
      let lyDoXoa = null;
      
      if (['DaDuyet', 'DaDang'].includes(formData.TrangThai)) {
        lyDoXoa = prompt(
          '⚠️ Tin đăng đã được duyệt/đang đăng!\n\n' +
          'Vui lòng nhập lý do xóa (tối thiểu 10 ký tự):'
        );
        
        // Nếu user nhấn Cancel hoặc nhập ít hơn 10 ký tự
        if (!lyDoXoa || lyDoXoa.trim().length < 10) {
          alert('❌ Vui lòng nhập lý do xóa hợp lệ (tối thiểu 10 ký tự)');
          setSaving(false);
          return;
        }
      }
      
      const response = await TinDangService.xoaTinDang(id, lyDoXoa);
      
      if (response.success) {
        alert('✅ Đã xóa tin đăng thành công!');
        navigate('/chu-du-an/tin-dang');
      } else {
        alert(`❌ Lỗi: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Lỗi xóa tin đăng:', error);
      alert(`❌ Không thể xóa tin đăng: ${error.message || 'Vui lòng thử lại'}`);
    } finally {
      setSaving(false);
    }
  };

  const xuLyGui = async (action) => {
    try {
      setSaving(true);
      
      // 1. Upload ảnh mới
      let uploadedUrls = [];
      const anhCu = anhPreview.filter(p => p.isExisting).map(p => p.url);
      const anhMoi = anhPreview.filter(p => !p.isExisting);
      
      if (anhMoi.length > 0) {
        const files = anhMoi.map(p => p.file);
        uploadedUrls = await uploadAnh(files);
      }

      const allUrls = [...anhCu, ...uploadedUrls].map(toRelativeUploadPath).filter(Boolean);

      // 2. Upload ảnh override cho các phòng đã chọn
      let phongDaChonUploads = phongDaChon;
      if (phongDaChon.length > 0) {
        phongDaChonUploads = await Promise.all(phongDaChon.map(async (p) => {
          let anhUrl = p.HinhAnhTinDang || null;
          if (p.HinhAnhTinDangFile) {
            const [uploadedUrl] = await uploadAnh([p.HinhAnhTinDangFile]);
            anhUrl = uploadedUrl || null;
          }
          return { ...p, HinhAnhTinDang: toRelativeUploadPath(anhUrl) };
        }));
      }
      
      const tinDangData = {
        DuAnID: parseInt(formData.DuAnID, 10),
        TieuDe: formData.TieuDe,
        MoTa: formData.MoTa,
        KhuVucID: selectedPhuong ? parseInt(selectedPhuong, 10) : null,
        URL: allUrls,
        TienIch: formData.TienIch,
        GiaDien: formData.GiaDien ? parseFloat(parseGiaTien(formData.GiaDien)) : null,
        GiaNuoc: formData.GiaNuoc ? parseFloat(parseGiaTien(formData.GiaNuoc)) : null,
        GiaDichVu: formData.GiaDichVu ? parseFloat(parseGiaTien(formData.GiaDichVu)) : null,
        MoTaGiaDichVu: formData.MoTaGiaDichVu || null,
        DiaChi: diaChi,
        ViDo: viDo ? parseFloat(viDo) : null,
        KinhDo: kinhDo ? parseFloat(kinhDo) : null,
        PhongIDs: phongDaChonUploads.map((p, idx) => ({
          PhongID: p.PhongID,
          GiaTinDang: p.GiaTinDang ? parseFloat(parseGiaTien(p.GiaTinDang)) : null,
          DienTichTinDang: p.DienTichTinDang ? parseFloat(p.DienTichTinDang) : null,
          MoTaTinDang: p.MoTaTinDang || null,
          HinhAnhTinDang: p.HinhAnhTinDang || null,
          ThuTuHienThi: p.ThuTuHienThi ?? idx
        })),
        action
      };

      console.log('📤 Dữ liệu gửi lên backend:', JSON.stringify(tinDangData, null, 2));
      
      const response = await TinDangService.capNhatTinDang(id, tinDangData);
      
      if (response.success) {
        const message = action === 'send_review' 
          ? '✅ Gửi duyệt thành công!' 
          : '✅ Lưu nháp thành công!';
        alert(message);
        
        if (action === 'send_review') {
          navigate('/chu-du-an/tin-dang');
        } else {
          await layTinDangDeChinhSua();
        }
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật tin đăng:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const uploadAnh = async (files) => {
    const token = localStorage.getItem('token') || 'mock-token-for-development';
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('anh', file));
    const response = await fetch(`${API_BASE_URL}/api/chu-du-an/upload-anh`, {
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

  // ===== RENDER HELPERS =====
  const renderSectionHeader = (title, sectionKey, required = false, subtitle = null) => (
    <div 
      onClick={() => toggleSection(sectionKey)}
      className={`cda-accordion-header ${sectionsExpanded[sectionKey] ? 'expanded' : ''}`}
    >
      <div>
        <h3 className="cda-accordion-title">
          {title}
          {required && <span style={{ color: '#dc2626' }}>*</span>}
        </h3>
        {subtitle && <p className="cda-accordion-subtitle">{subtitle}</p>}
      </div>
      <span className={`cda-accordion-icon ${sectionsExpanded[sectionKey] ? 'expanded' : ''}`}>
        ▼
      </span>
    </div>
  );

  // ===== MAIN RENDER =====
  if (loading) {
    return (
      <ChuDuAnLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '4px solid #e5e7eb', 
              borderTopColor: '#667eea', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#6b7280' }}>Đang tải thông tin...</p>
          </div>
        </div>
      </ChuDuAnLayout>
    );
  }

  return (
    <ChuDuAnLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>
            Chỉnh sửa tin đăng
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            ID: {id} • {phongCount} phòng
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/chu-du-an/tin-dang')}
          className="cda-btn cda-btn-secondary"
        >
          <HiOutlineArrowLeft style={{ width: '20px', height: '20px' }} />
          Quay lại
        </button>
      </div>

      {/* Form với Accordion Sections */}
      <form>
        {/* Section 1: Thông tin cơ bản */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('1. Thông Tin Cơ Bản', 'thongTinCoBan', true, 'Tiêu đề, mô tả và trạng thái tin đăng')}
          
          {sectionsExpanded.thongTinCoBan && (
            <div className="cda-card-body">
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Dự án - READ ONLY */}
                <div className="cda-form-group">
                  <label className="cda-label cda-label-required">Dự án</label>
                  <select
                    name="DuAnID"
                    value={formData.DuAnID}
                    onChange={xuLyThayDoiInput}
                    className={`cda-select ${errors.DuAnID ? 'cda-input-error' : ''}`}
                    disabled={true}
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    <option value="">-- Chọn dự án --</option>
                    {duAns.map(duAn => (
                      <option key={duAn.DuAnID} value={duAn.DuAnID}>
                        {duAn.TenDuAn}
                      </option>
                    ))}
                  </select>
                  <p className="cda-help-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineLightBulb style={{ width: '16px', height: '16px', color: '#D4AF37', flexShrink: 0 }} />
                    Không thể thay đổi dự án sau khi đã tạo tin đăng
                  </p>
                </div>

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
                    disabled={saving}
                  />
                  {errors.TieuDe && <p className="cda-error-message">{errors.TieuDe}</p>}
                </div>

                {/* Trạng thái tin đăng - READ-ONLY (chỉ hiển thị) */}
                <div className="cda-form-group">
                  <label className="cda-label">Trạng thái tin đăng</label>
                  
                  {/* Hiển thị trạng thái dạng badge */}
                  <div className={`cda-status-badge ${formData.TrangThai.toLowerCase()}`}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {(() => {
                        switch(formData.TrangThai) {
                          case 'Nhap': return '📝';
                          case 'ChoDuyet': return '⏳';
                          case 'DaDuyet': return '✅';
                          case 'DaDang': return '🚀';
                          case 'TuChoi': return '❌';
                          case 'DaXoa': return '🗑️';
                          default: return '📝';
                        }
                      })()}
                    </span>
                    <span>
                      {(() => {
                        switch(formData.TrangThai) {
                          case 'Nhap': return 'Nháp';
                          case 'ChoDuyet': return 'Chờ duyệt';
                          case 'DaDuyet': return 'Đã duyệt';
                          case 'DaDang': return 'Đang đăng';
                          case 'TuChoi': return 'Từ chối';
                          case 'DaXoa': return 'Đã xóa';
                          default: return 'Không xác định';
                        }
                      })()}
                    </span>
                  </div>
                  
                  <p className="cda-help-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.5rem' }}>
                    <HiOutlineLightBulb style={{ width: '16px', height: '16px', color: '#D4AF37', flexShrink: 0 }} />
                    Trạng thái sẽ tự động thay đổi khi bạn nhấn <strong>"Lưu nháp"</strong> hoặc <strong>"Gửi duyệt"</strong>
                  </p>
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
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Chọn phòng */}
        {formData.DuAnID && (
          <div className="cda-card" style={{ marginBottom: '1rem' }}>
            {renderSectionHeader('2. Chọn Phòng', 'chonPhong', true, 'Gắn phòng thuộc dự án vào tin đăng')}
            
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

        {/* Section 3: Địa chỉ */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('3. Địa Chỉ & Vị Trí', 'diaChi', false, 'Tùy chọn: Cập nhật địa chỉ chi tiết')}
          
          {sectionsExpanded.diaChi && (
            <div className="cda-card-body">
              {/* Cảnh báo ảnh hưởng */}
              <div className="cda-warning-box">
                <HiOutlineExclamationCircle className="cda-warning-icon" />
                <div className="cda-warning-content">
                  <strong className="cda-warning-title">
                    ⚠️ Lưu ý quan trọng
                  </strong>
                  Thay đổi <strong>Khu vực</strong> hoặc <strong>Tọa độ</strong> sẽ ảnh hưởng đến <strong style={{ color: '#B68C3A' }}>TẤT CẢ các tin đăng</strong> thuộc cùng dự án này.
                </div>
              </div>

              {/* Khu vực - Tỉnh/Quận/Phường với nút chỉnh sửa riêng */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="cda-label" style={{ fontSize: '0.875rem', marginBottom: 0 }}>
                    🏙️ Khu vực (Tỉnh/Quận/Phường)
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      const tinhSelect = document.getElementById('tinh-select');
                      const quanSelect = document.getElementById('quan-select');
                      const phuongSelect = document.getElementById('phuong-select');

                      const isReadOnly = tinhSelect?.disabled;

                      if (isReadOnly) {
                        const xacNhan = window.confirm(
                          '⚠️ CẢNH BÁO QUAN TRỌNG\n\n' +
                          'Thay đổi khu vực sẽ ảnh hưởng đến TẤT CẢ các tin đăng thuộc cùng dự án này.\n\n' +
                          'Bạn có chắc chắn muốn chỉnh sửa khu vực?'
                        );

                        if (!xacNhan) return;

                        if (tinhSelect) tinhSelect.disabled = false;
                        if (quanSelect) quanSelect.disabled = false;
                        if (phuongSelect) phuongSelect.disabled = false;

                        e.currentTarget.innerHTML = '<svg style="margin-right: 4px">✅</svg> Lưu thay đổi';
                      } else {
                        const xacNhanLuu = window.confirm(
                          '💾 Xác nhận lưu thay đổi khu vực?\n\n' +
                          'Thay đổi này sẽ được áp dụng khi bạn nhấn "Lưu nháp" hoặc "Gửi duyệt".'
                        );

                        if (!xacNhanLuu) return;

                        if (tinhSelect) tinhSelect.disabled = true;
                        if (quanSelect) quanSelect.disabled = true;
                        if (phuongSelect) phuongSelect.disabled = true;

                        e.currentTarget.innerHTML = '<svg style="margin-right: 4px">✏️</svg> Chỉnh sửa khu vực';
                      }
                    }}
                    className="cda-btn cda-btn-secondary"
                    style={{
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <HiOutlinePencil size={14} style={{ marginRight: '4px' }} />
                    Chỉnh sửa khu vực
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div>
                    <label className="cda-label" style={{ fontSize: '0.875rem' }}>Tỉnh/Thành phố</label>
                    <select 
                      id="tinh-select"
                      value={selectedTinh} 
                      onChange={(e) => setSelectedTinh(e.target.value)}
                      className="cda-select"
                      disabled={true}
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
                      id="quan-select"
                      value={selectedQuan} 
                      onChange={(e) => setSelectedQuan(e.target.value)}
                      className="cda-select"
                      disabled={true}
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
                      id="phuong-select"
                      value={selectedPhuong} 
                      onChange={(e) => setSelectedPhuong(e.target.value)}
                      className="cda-select"
                      disabled={true}
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      {phuongs.map(phuong => (
                        <option key={phuong.KhuVucID} value={phuong.KhuVucID}>{phuong.TenKhuVuc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Địa chỉ chi tiết */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="cda-label" style={{ fontSize: '0.875rem' }}>
                  📮 Địa chỉ chi tiết (Số nhà, tên đường)
                </label>
                <input
                  type="text"
                  value={diaChi}
                  onChange={(e) => setDiaChi(e.target.value)}
                  className="cda-input"
                  placeholder="Ví dụ: 40/6 Lê Văn Thọ, Số 123 Nguyễn Văn Linh..."
                  style={{ fontSize: '0.9375rem' }}
                />
                {diaChi && (
                  <p className="cda-help-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.5rem' }}>
                    <HiOutlineLightBulb style={{ width: '16px', height: '16px', color: '#D4AF37', flexShrink: 0 }} />
                    Hiện tại: <strong>{diaChi}</strong>
                  </p>
                )}
              </div>

              {/* Tọa độ với nút chỉnh sửa riêng */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="cda-label" style={{ fontSize: '0.875rem', marginBottom: 0 }}>
                    📍 Tọa độ GPS (Vĩ độ, Kinh độ)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!viDo || !kinhDo) {
                        alert('⚠️ Chưa có tọa độ. Vui lòng cập nhật địa chỉ trước.');
                        return;
                      }

                      const xacNhan = window.confirm(
                        '⚠️ CẢNH BÁO QUAN TRỌNG\n\n' +
                        'Thay đổi tọa độ sẽ ảnh hưởng đến TẤT CẢ các tin đăng thuộc cùng dự án này.\n\n' +
                        'Bạn có chắc chắn muốn chỉnh sửa tọa độ?'
                      );

                      if (xacNhan) {
                        setHienModalChinhSuaToaDo(true);
                      }
                    }}
                    disabled={!viDo || !kinhDo}
                    className="cda-btn cda-btn-secondary"
                    style={{
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <HiOutlinePencil size={14} style={{ marginRight: '4px' }} />
                    Chỉnh sửa tọa độ
                  </button>
                </div>
                
                <input
                  type="text"
                  value={viDo && kinhDo ? `${parseFloat(viDo).toFixed(6)}, ${parseFloat(kinhDo).toFixed(6)}` : 'Chưa có tọa độ'}
                  readOnly
                  disabled
                  className="cda-input"
                  style={{ 
                    opacity: 0.7,
                    cursor: 'not-allowed',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Tiện ích & Dịch vụ */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('4. Tiện Ích & Dịch Vụ', 'tienIch', false, 'Tùy chọn: Tiện ích phòng và giá dịch vụ')}
          
          {sectionsExpanded.tienIch && (
            <div className="cda-card-body">
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Tiện ích */}
                <div className="cda-form-group">
                  <label className="cda-label">Tiện ích phòng</label>
                  <div className="cda-amenities-grid">
                    {DANH_SACH_TIEN_ICH.map(tienIch => (
                      <label 
                        key={tienIch} 
                        className={`cda-amenity-item ${formData.TienIch.includes(tienIch) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.TienIch.includes(tienIch)}
                          onChange={() => xuLyChonTienIch(tienIch)}
                          disabled={saving}
                        />
                        <span>{tienIch}</span>
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
                      disabled={saving}
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
                      disabled={saving}
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
                      disabled={saving}
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
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Hình ảnh */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader('5. Hình Ảnh', 'hinhAnh', true, `${anhPreview.length} ảnh • Tối thiểu 1 ảnh`)}
          
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
                  disabled={saving}
                />
                <p className="cda-help-text">
                  Chấp nhận file ảnh, tối đa 5MB/file
                </p>
                {errors.URL && <p className="cda-error-message">{errors.URL}</p>}
              </div>

              {/* Preview ảnh */}
              {anhPreview.length > 0 && (
                <div className="cda-image-grid">
                  {anhPreview.map((preview, index) => (
                    <div key={index} className="cda-image-item">
                      <img 
                        src={preview.url} 
                        alt={preview.name}
                      />
                      {preview.isExisting && (
                        <div className="cda-image-badge">
                          Ảnh cũ
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => xoaAnh(index)}
                        className="cda-image-remove"
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
        <div className="cda-actions-footer">
          {/* Nút Xóa - bên trái */}
          <button
            type="button"
            onClick={xuLyXoaTinDang}
            className="cda-btn cda-btn-danger"
            disabled={saving}
          >
            <HiOutlineTrash style={{ width: '18px', height: '18px', marginRight: '6px' }} />
            {saving ? 'Đang xóa...' : 'Xóa tin đăng'}
          </button>

          {/* Các nút khác - bên phải */}
          <div className="cda-actions-group">
            <button
              type="button"
              onClick={() => navigate('/chu-du-an/tin-dang')}
              className="cda-btn cda-btn-secondary"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={xuLyLuuNhap}
              className="cda-btn cda-btn-warning"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : '💾 Lưu nháp'}
            </button>
            <button
              type="button"
              onClick={xuLyGuiDuyet}
              className="cda-btn cda-btn-primary"
              disabled={saving}
            >
              {saving ? 'Đang gửi...' : '📤 Gửi duyệt'}
            </button>
          </div>
        </div>
      </form>

      {/* Modal Tạo Phòng Mới */}
      {modalTaoPhongMoi && (
        <div
          className="cda-modal-overlay"
          onClick={() => {
            if (!dangTaoPhong) {
              setModalTaoPhongMoi(false);
              resetFormPhongMoi();
            }
          }}
        >
          <div
            className="cda-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="cda-modal-title">
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
                  disabled={dangTaoPhong}
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
                  disabled={dangTaoPhong}
                />
                {formPhongMoi.GiaChuan && (
                  <p className="cda-help-text">
                    {parseInt(parseGiaTien(formPhongMoi.GiaChuan), 10).toLocaleString('vi-VN')} ₫/tháng
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
                  disabled={dangTaoPhong}
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
                  disabled={dangTaoPhong}
                />
              </div>
            </div>

            <div className="cda-modal-actions">
              <button
                type="button"
                onClick={() => {
                  if (!dangTaoPhong) {
                    setModalTaoPhongMoi(false);
                    resetFormPhongMoi();
                  }
                }}
                className="cda-btn cda-btn-secondary"
                disabled={dangTaoPhong}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={xuLyTaoPhongMoi}
                className="cda-btn cda-btn-primary"
                disabled={dangTaoPhong}
              >
                {dangTaoPhong ? 'Đang tạo...' : '✓ Tạo phòng'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          tieuDe={formData.TieuDe || 'Tin đăng'}
        />
      )}
    </ChuDuAnLayout>
  );
}

export default ChinhSuaTinDang;




