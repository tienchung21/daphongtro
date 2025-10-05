import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService, DuAnService, KhuVucService } from '../../services/ChuDuAnService';
import ModalChinhSuaToaDo from '../../components/ChuDuAn/ModalChinhSuaToaDo';
import './TaoTinDang.css'; // Tái sử dụng CSS

// React Icons - Thêm các icon cần thiết
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLightBulb,
  HiOutlineExclamationCircle,
  HiOutlineArrowLeft
} from 'react-icons/hi2';

/**
 * Format giá tiền: 10000 → "10.000"
 * FIX: Backend trả về DECIMAL string (VD: "3500.00")
 * Phải parse thành số trước để loại bỏ phần thập phân
 */
const formatGiaTien = (value) => {
  if (!value) return '';
  
  // Nếu là string có dấu thập phân → parse thành số trước
  const numValue = typeof value === 'string' && value.includes('.') 
    ? parseFloat(value) 
    : value;
  
  const numberOnly = numValue.toString().replace(/\D/g, '');
  if (!numberOnly) return '';
  return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
    DienTich: '',
    Gia: '',
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
  
  // Nhiều phòng
  const [isNhapNhieu, setIsNhapNhieu] = useState(false);
  const [phongs, setPhongs] = useState([]);
  const [phongsDaXoa, setPhongsDaXoa] = useState([]); // Track phòng đã xóa để xóa trên server
  
  const [diaChi, setDiaChi] = useState('');
  const [viDo, setViDo] = useState('');
  const [kinhDo, setKinhDo] = useState('');
  const [hienModalChinhSuaToaDo, setHienModalChinhSuaToaDo] = useState(false);
  
  // ===== ACCORDION STATE =====
  const [sectionsExpanded, setSectionsExpanded] = useState({
    thongTinCoBan: true,
    diaChi: true,
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

        // Kiểm tra: Nhiều phòng hay 1 phòng?
        const coNhieuPhong = tinDangData.TongSoPhong && tinDangData.TongSoPhong > 1;
        setIsNhapNhieu(coNhieuPhong);

        // Set form data
        setFormData({
          DuAnID: tinDangData.DuAnID || '',
          TieuDe: tinDangData.TieuDe || '',
          MoTa: tinDangData.MoTa || '',
          DienTich: tinDangData.DienTich ? tinDangData.DienTich.toString() : '',
          Gia: tinDangData.Gia ? formatGiaTien(tinDangData.Gia) : '',
          KhuVucID: tinDangData.KhuVucID || '',
          TienIch: tienIchParsed,
          GiaDien: tinDangData.GiaDien ? formatGiaTien(tinDangData.GiaDien) : '',
          GiaNuoc: tinDangData.GiaNuoc ? formatGiaTien(tinDangData.GiaNuoc) : '',
          GiaDichVu: tinDangData.GiaDichVu ? formatGiaTien(tinDangData.GiaDichVu) : '',
          MoTaGiaDichVu: tinDangData.MoTaGiaDichVu || '',
          TrangThai: tinDangData.TrangThai || 'Nhap' // Set trạng thái hiện tại
        });

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
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const previews = anhParsed.map((url, idx) => {
          // Nếu URL là relative path (không có http), thêm backend URL
          const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
          return {
            file: null, // Ảnh cũ không có file object
            url: fullUrl,
            name: `anh-${idx + 1}`,
            isExisting: true // Flag để biết ảnh cũ
          };
        });
        setAnhPreview(previews);

        // Load danh sách phòng nếu nhiều phòng
        if (coNhieuPhong) {
          layDanhSachPhong();
          setSectionsExpanded(prev => ({ ...prev, phongs: true })); // Auto expand section
        }

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

  const layDanhSachPhong = async () => {
    try {
      const response = await TinDangService.layDanhSachPhong(id);
      if (response.success && response.data) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const phongData = response.data.map(p => {
          // Fix URL ảnh phòng
          const fullUrl = p.URL && !p.URL.startsWith('http') ? `${API_BASE_URL}${p.URL}` : p.URL;
          return {
            PhongID: p.PhongID,
            tenPhong: p.TenPhong || '',
            gia: p.Gia ? formatGiaTien(p.Gia) : '',
            dienTich: p.DienTich ? p.DienTich.toString() : '',
            ghiChu: p.GhiChu || '',
            url: fullUrl || '',
            anhFile: null,
            anhPreview: fullUrl || '',
            isExisting: true // Phòng đã tồn tại
          };
        });
        setPhongs(phongData);
      }
    } catch (error) {
      console.error('❌ Lỗi load danh sách phòng:', error);
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

  // Handler cho phòng
  const updatePhong = (index, field, value) => {
    const newPhongs = [...phongs];
    if (field === 'gia') {
      newPhongs[index][field] = formatGiaTien(value);
    } else {
      newPhongs[index][field] = value;
    }
    setPhongs(newPhongs);
  };

  const themPhong = () => setPhongs([...phongs, { 
    PhongID: null, // Null = phòng mới
    tenPhong: '', 
    gia: '', 
    dienTich: '', 
    ghiChu: '', 
    url: '', 
    anhFile: null, 
    anhPreview: '',
    isExisting: false
  }]);

  const xoaPhong = (index) => {
    const phongBiXoa = phongs[index];
    if (phongBiXoa.PhongID) {
      // Phòng đã tồn tại → Track để xóa trên server
      setPhongsDaXoa(prev => [...prev, phongBiXoa.PhongID]);
    }
    setPhongs(phongs.filter((_, i) => i !== index));
  };

  const xuLyChonAnhPhong = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }

    const newPhongs = [...phongs];
    newPhongs[index].anhFile = file;
    newPhongs[index].anhPreview = URL.createObjectURL(file);
    setPhongs(newPhongs);
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
    
    if (!isNhapNhieu) {
      if (!formData.Gia || parseFloat(parseGiaTien(formData.Gia)) <= 0) {
        newErrors.Gia = 'Vui lòng nhập giá hợp lệ';
      }
      if (!formData.DienTich || parseFloat(formData.DienTich) <= 0) {
        newErrors.DienTich = 'Vui lòng nhập diện tích hợp lệ';
      }
    } else {
      const phongKhongHopLe = phongs.some(p => 
        !p.tenPhong || 
        !p.gia || parseFloat(parseGiaTien(p.gia)) <= 0 || 
        !p.dienTich || parseFloat(p.dienTich) <= 0
      );
      if (phongKhongHopLe) {
        newErrors.Phongs = 'Vui lòng điền đầy đủ thông tin cho tất cả các phòng';
      }
    }
    
    if (anhPreview.length === 0) newErrors.URL = 'Vui lòng tải lên ít nhất 1 hình ảnh';
    if (!selectedPhuong) newErrors.KhuVucID = 'Vui lòng chọn địa chỉ đầy đủ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== SUBMIT =====
  const xuLyLuuNhap = async (e) => {
    e.preventDefault();
    await xuLyGui('save_draft');
  };

  const xuLyGuiDuyet = async (e) => {
    e.preventDefault();
    
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

      const allUrls = [...anhCu, ...uploadedUrls];

      // 2. Upload ảnh phòng (nếu có)
      let phongDataClean = null;
      if (isNhapNhieu) {
        phongDataClean = await Promise.all(phongs.map(async (p) => {
          let urlPhong = p.url || null;
          
          if (p.anhFile) {
            const uploadedPhongUrls = await uploadAnh([p.anhFile]);
            urlPhong = uploadedPhongUrls[0];
          }

          return {
            PhongID: p.PhongID, // Null = phòng mới, có ID = cập nhật
            tenPhong: p.tenPhong,
            gia: p.gia ? parseFloat(parseGiaTien(p.gia)) : null,
            dienTich: p.dienTich ? parseFloat(p.dienTich) : null,
            ghiChu: p.ghiChu || null,
            url: urlPhong
          };
        }));
      }
      
      const tinDangData = {
        DuAnID: parseInt(formData.DuAnID),
        TieuDe: formData.TieuDe,
        MoTa: formData.MoTa,
        Gia: !isNhapNhieu ? parseFloat(parseGiaTien(formData.Gia)) : null,
        DienTich: !isNhapNhieu ? parseFloat(formData.DienTich) : null,
        KhuVucID: selectedPhuong ? parseInt(selectedPhuong) : null,
        URL: allUrls,
        TienIch: formData.TienIch,
        GiaDien: formData.GiaDien ? parseFloat(parseGiaTien(formData.GiaDien)) : null,
        GiaNuoc: formData.GiaNuoc ? parseFloat(parseGiaTien(formData.GiaNuoc)) : null,
        GiaDichVu: formData.GiaDichVu ? parseFloat(parseGiaTien(formData.GiaDichVu)) : null,
        MoTaGiaDichVu: formData.MoTaGiaDichVu || null,
        DiaChi: diaChi,
        ViDo: viDo ? parseFloat(viDo) : null,
        KinhDo: kinhDo ? parseFloat(kinhDo) : null,
        // KHÔNG gửi TrangThai - Backend sẽ tự quyết định dựa trên action
        Phongs: phongDataClean,
        PhongsDaXoa: phongsDaXoa, // Danh sách PhongID cần xóa
        action: action // save_draft → Nhap, send_review → ChoDuyet
      };

      console.log('📤 Dữ liệu gửi lên backend:', JSON.stringify(tinDangData, null, 2));
      
      const response = await TinDangService.capNhatTinDang(id, tinDangData);
      
      if (response.success) {
        const message = action === 'send_review' 
          ? '✅ Gửi duyệt thành công!' 
          : '✅ Lưu nháp thành công!';
        alert(message);
        
        if (action === 'send_review') {
          // Navigate và reload để cập nhật data mới
          navigate('/chu-du-an/tin-dang');
          window.location.reload();
        } else {
          // Lưu nháp: Reload trang hiện tại để cập nhật trạng thái
          window.location.reload();
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

  // ===== RENDER HELPERS =====
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
            ID: {id} • {isNhapNhieu ? `${phongs.length} phòng` : '1 phòng'}
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
          {renderSectionHeader('1. Thông Tin Cơ Bản', 'thongTinCoBan', true, 'Tiêu đề, mô tả, giá và diện tích')}
          
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
                    <HiOutlineLightBulb style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0 }} />
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

                {/* Chế độ nhập - READ ONLY */}
                <div className="cda-form-group">
                  <label className="cda-label">Chế độ nhập</label>
                  <select
                    value={isNhapNhieu ? 'nhieu' : 'mot'}
                    disabled={true}
                    className="cda-select"
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    <option value="mot">Đăng 1 phòng</option>
                    <option value="nhieu">Đăng nhiều phòng</option>
                  </select>
                  <p className="cda-help-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineLightBulb style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0 }} />
                    Không thể thay đổi chế độ sau khi đã tạo
                  </p>
                </div>

                {/* Trạng thái tin đăng - READ-ONLY (chỉ hiển thị) */}
                <div className="cda-form-group">
                  <label className="cda-label">Trạng thái tin đăng</label>
                  
                  {/* Hiển thị trạng thái dạng badge */}
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: (() => {
                      switch(formData.TrangThai) {
                        case 'Nhap': return 'rgba(156, 163, 175, 0.1)';
                        case 'ChoDuyet': return 'rgba(245, 158, 11, 0.1)';
                        case 'DaDuyet': return 'rgba(34, 197, 94, 0.1)';
                        case 'DaDang': return 'rgba(59, 130, 246, 0.1)';
                        case 'TuChoi': return 'rgba(239, 68, 68, 0.1)';
                        case 'DaXoa': return 'rgba(107, 114, 128, 0.1)';
                        default: return 'rgba(156, 163, 175, 0.1)';
                      }
                    })(),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.9375rem',
                    fontWeight: 500
                  }}>
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
                    <span style={{
                      color: (() => {
                        switch(formData.TrangThai) {
                          case 'Nhap': return '#6b7280';
                          case 'ChoDuyet': return '#f59e0b';
                          case 'DaDuyet': return '#22c55e';
                          case 'DaDang': return '#3b82f6';
                          case 'TuChoi': return '#ef4444';
                          case 'DaXoa': return '#6b7280';
                          default: return '#6b7280';
                        }
                      })()
                    }}>
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
                    <HiOutlineLightBulb style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0 }} />
                    Trạng thái sẽ tự động thay đổi khi bạn nhấn <strong>"Lưu nháp"</strong> hoặc <strong>"Gửi duyệt"</strong>
                  </p>
                </div>

                {/* Giá & Diện tích - Chỉ hiện khi 1 phòng */}
                {!isNhapNhieu && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="cda-form-group">
                      <label className="cda-label cda-label-required">Giá thuê (VNĐ/tháng)</label>
                      <input
                        type="text"
                        name="Gia"
                        value={formData.Gia}
                        onChange={xuLyThayDoiGiaTien('Gia')}
                        className={`cda-input ${errors.Gia ? 'cda-input-error' : ''}`}
                        placeholder="VD: 2.000.000"
                        disabled={saving}
                      />
                      {errors.Gia && <p className="cda-error-message">{errors.Gia}</p>}
                      <p className="cda-help-text">
                        {formData.Gia ? parseInt(parseGiaTien(formData.Gia)).toLocaleString('vi-VN') + ' ₫/tháng' : '0 ₫/tháng'}
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
                        disabled={saving}
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
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Danh sách phòng (chỉ hiện khi nhiều phòng) */}
        {isNhapNhieu && (
          <div className="cda-card" style={{ marginBottom: '1rem' }}>
            {renderSectionHeader('2. Danh Sách Phòng', 'phongs', true, `${phongs.length} phòng • Thêm, sửa, xóa phòng`)}
            
            {sectionsExpanded.phongs && (
              <div className="cda-card-body">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Tên phòng</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Giá (VNĐ/tháng)</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Diện tích (m²)</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Ảnh phòng</th>
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
                            {phong.isExisting && (
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                                ID: {phong.PhongID}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input 
                              type="text" 
                              value={phong.gia} 
                              onChange={(e) => updatePhong(index, 'gia', e.target.value)}
                              className="cda-input"
                              placeholder="VD: 2.000.000"
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input 
                                type="file"
                                accept="image/*"
                                onChange={(e) => xuLyChonAnhPhong(index, e)}
                                style={{ display: 'none' }}
                                id={`upload-anh-phong-${index}`}
                              />
                              <label 
                                htmlFor={`upload-anh-phong-${index}`}
                                className="cda-btn cda-btn-secondary"
                                style={{ 
                                  cursor: 'pointer',
                                  padding: '0.5rem 0.75rem',
                                  fontSize: '0.875rem',
                                  margin: 0,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                📁 Chọn ảnh
                              </label>
                              {phong.anhPreview && (
                                <img 
                                  src={phong.anhPreview} 
                                  alt="Preview" 
                                  style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    objectFit: 'cover', 
                                    borderRadius: '0.25rem',
                                    border: '1px solid #e5e7eb'
                                  }} 
                                />
                              )}
                            </div>
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
                              <HiOutlineTrash style={{ width: '18px', height: '18px' }} />
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
                  <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                  Thêm phòng
                </button>
                {errors.Phongs && <p className="cda-error-message" style={{ marginTop: '0.5rem' }}>{errors.Phongs}</p>}
              </div>
            )}
          </div>
        )}

        {/* Section 3: Địa chỉ */}
        <div className="cda-card" style={{ marginBottom: '1rem' }}>
          {renderSectionHeader(`${isNhapNhieu ? '3' : '2'}. Địa Chỉ & Vị Trí`, 'diaChi', false, 'Tùy chọn: Cập nhật địa chỉ chi tiết')}
          
          {sectionsExpanded.diaChi && (
            <div className="cda-card-body">
              {/* Cảnh báo ảnh hưởng */}
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '1px solid #fbbf24',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <HiOutlineExclamationCircle style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: '#f59e0b',
                  flexShrink: 0,
                  marginTop: '2px'
                }} />
                <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                    ⚠️ Lưu ý quan trọng
                  </strong>
                  Thay đổi <strong>Khu vực</strong> hoặc <strong>Tọa độ</strong> sẽ ảnh hưởng đến <strong style={{ color: '#d97706' }}>TẤT CẢ các tin đăng</strong> thuộc cùng dự án này.
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
                    onClick={() => {
                      // Toggle edit mode cho cascading dropdowns
                      const tinhSelect = document.getElementById('tinh-select');
                      const quanSelect = document.getElementById('quan-select');
                      const phuongSelect = document.getElementById('phuong-select');
                      
                      const isReadOnly = tinhSelect.disabled;
                      
                      if (isReadOnly) {
                        // Đang ở chế độ readonly → Muốn bật edit
                        const xacNhan = window.confirm(
                          '⚠️ CẢNH BÁO QUAN TRỌNG\n\n' +
                          'Thay đổi khu vực sẽ ảnh hưởng đến TẤT CẢ các tin đăng thuộc cùng dự án này.\n\n' +
                          'Bạn có chắc chắn muốn chỉnh sửa khu vực?'
                        );
                        
                        if (!xacNhan) return;
                        
                        // Cho phép chỉnh sửa
                        tinhSelect.disabled = false;
                        quanSelect.disabled = false;
                        phuongSelect.disabled = false;
                        
                        // Thay đổi text button
                        event.target.innerHTML = '<svg style="margin-right: 4px">✅</svg> Lưu thay đổi';
                      } else {
                        // Đang ở chế độ edit → Muốn lưu
                        const xacNhanLuu = window.confirm(
                          '💾 Xác nhận lưu thay đổi khu vực?\n\n' +
                          'Thay đổi này sẽ được áp dụng khi bạn nhấn "Lưu nháp" hoặc "Gửi duyệt".'
                        );
                        
                        if (!xacNhanLuu) return;
                        
                        // Khóa lại
                        tinhSelect.disabled = true;
                        quanSelect.disabled = true;
                        phuongSelect.disabled = true;
                        
                        // Thay đổi text button
                        event.target.innerHTML = '<svg style="margin-right: 4px">✏️</svg> Chỉnh sửa khu vực';
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
                    <HiOutlineLightBulb style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0 }} />
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
          {renderSectionHeader(`${isNhapNhieu ? '4' : '3'}. Tiện Ích & Dịch Vụ`, 'tienIch', false, 'Tùy chọn: Tiện ích phòng và giá dịch vụ')}
          
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
                          disabled={saving}
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
          {renderSectionHeader(`${isNhapNhieu ? '5' : '4'}. Hình Ảnh`, 'hinhAnh', true, `${anhPreview.length} ảnh • Tối thiểu 1 ảnh`)}
          
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {anhPreview.map((preview, index) => (
                    <div key={index} style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: '0.375rem', overflow: 'hidden' }}>
                      <img 
                        src={preview.url} 
                        alt={preview.name}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                      {preview.isExisting && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          left: '0.5rem',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem'
                        }}>
                          Ảnh cũ
                        </div>
                      )}
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
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          {/* Nút Xóa - bên trái */}
          <button
            type="button"
            onClick={xuLyXoaTinDang}
            className="cda-btn"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              border: 'none'
            }}
            disabled={saving}
          >
            <HiOutlineTrash style={{ width: '18px', height: '18px', marginRight: '6px' }} />
            {saving ? 'Đang xóa...' : 'Xóa tin đăng'}
          </button>

          {/* Các nút khác - bên phải */}
          <div style={{ display: 'flex', gap: '1rem' }}>
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
              className="cda-btn"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
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
