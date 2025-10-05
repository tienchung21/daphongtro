import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChuDuAnLayout from '../../layouts/ChuDuAnLayout';
import { TinDangService, DuAnService, KhuVucService } from '../../services/ChuDuAnService';
import ModalTaoNhanhDuAn from '../../components/ChuDuAn/ModalTaoNhanhDuAn';

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
  
  // Bước 1: So sánh tuyệt đối chuẩn hóa (ưu tiên cao nhất)
  const exactMatch = danhSach.find((item) => {
    const tenTrongDs = chuanHoaTenKhuVuc(item?.TenKhuVuc || '');
    return tenTrongDs === tenChuan;
  });
  
  if (exactMatch) {
    console.info(`%c[AutoFill][${debugLabel}] Khớp tuyệt đối`, 'color:#059669', {
      input: tenCanTim,
      normalized: tenChuan,
      match: { KhuVucID: exactMatch.KhuVucID, TenKhuVuc: exactMatch.TenKhuVuc }
    });
    return exactMatch;
  }
  
  // Bước 2: So sánh với token số (cho các phường kiểu "Phường 15")
  const tokenCanTim = tachTokenSoVaChu(tenChuan);
  const tokenMatch = danhSach.find((item) => {
    const tenTrongDs = chuanHoaTenKhuVuc(item?.TenKhuVuc || '');
    const tokenDs = tachTokenSoVaChu(tenTrongDs);
    
    // Nếu cả hai đều có số và số trùng khớp
    if (tokenCanTim.so && tokenDs.so && tokenCanTim.so === tokenDs.so) {
      // Kiểm tra phần chữ có tương thích không
      if (!tokenCanTim.chu || !tokenDs.chu) return true;
      if (tokenDs.chu.includes(tokenCanTim.chu) || tokenCanTim.chu.includes(tokenDs.chu)) {
        return true;
      }
    }
    return false;
  });
  
  if (tokenMatch) {
    console.info(`%c[AutoFill][${debugLabel}] Khớp theo token số`, 'color:#2563eb', {
      input: tenCanTim,
      normalized: tenChuan,
      tokens: tokenCanTim,
      match: { KhuVucID: tokenMatch.KhuVucID, TenKhuVuc: tokenMatch.TenKhuVuc }
    });
    return tokenMatch;
  }
  
  // Bước 3: So sánh bao hàm (fallback)
  const includesMatch = danhSach.find((item) => {
    const tenTrongDs = chuanHoaTenKhuVuc(item?.TenKhuVuc || '');
    if (!tenTrongDs) return false;
    return tenTrongDs.includes(tenChuan) || tenChuan.includes(tenTrongDs);
  });
  
  if (includesMatch) {
    console.info(`%c[AutoFill][${debugLabel}] Khớp bao hàm`, 'color:#7c3aed', {
      input: tenCanTim,
      normalized: tenChuan,
      match: { KhuVucID: includesMatch.KhuVucID, TenKhuVuc: includesMatch.TenKhuVuc }
    });
    return includesMatch;
  }
  
  // Không tìm thấy
  console.warn(`%c[AutoFill][${debugLabel}] Không tìm thấy`, 'color:#dc2626', {
    input: tenCanTim,
    normalized: tenChuan,
    danhSachLength: danhSach.length,
    danhSachFull: danhSach.map(item => ({
      KhuVucID: item.KhuVucID,
      TenKhuVuc: item.TenKhuVuc,
      tenChuan: chuanHoaTenKhuVuc(item.TenKhuVuc)
    }))
  });
  
  return null;
};

const tachDiaChiDuAn = (diaChi = '') => {
  if (!diaChi) {
    return { chiTiet: '', phuong: '', quan: '', tinh: '' };
  }

  const parts = diaChi
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { chiTiet: '', phuong: '', quan: '', tinh: '' };
  }

  const tinh = parts.length > 0 ? parts.pop() : '';
  const quan = parts.length > 0 ? parts.pop() : '';
  const phuong = parts.length > 0 ? parts.pop() : '';
  const chiTiet = parts.join(', ');

  return {
    chiTiet: chiTiet || '',
    phuong,
    quan,
    tinh
  };
};

/**
 * UC-PROJ-01: Tạo tin đăng mới cho Chủ dự án
 * Clean form design với validation rõ ràng
 */
function TaoTinDang() {
  const navigate = useNavigate();
  const [duAns, setDuAns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // ===== WIZARD STATE =====
  const [buocHienTai, setBuocHienTai] = useState(1);
  const TONG_SO_BUOC = 6;
  
  const [formData, setFormData] = useState({
    DuAnID: '',
    TieuDe: '',
    MoTa: '',
    DienTich: '',
    Gia: '',
    KhuVucID: '',
    ChinhSachCocID: 1,
    URL: [], // Mảng URL ảnh
    TienIch: [], // Mảng tiện ích
    GiaDien: '',
    GiaNuoc: '',
    GiaDichVu: '',
    MoTaGiaDichVu: ''
  });
  
  const [anhPreview, setAnhPreview] = useState([]); // Preview ảnh
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
  const [diaChiGoc, setDiaChiGoc] = useState(''); // Lưu địa chỉ gốc từ dự án
  const [hienModalTaoDuAn, setHienModalTaoDuAn] = useState(false);

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
    setPhuongs([]); // Reset danh sách phường khi đổi quận
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
    // Khôi phục lại địa chỉ gốc
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

  useEffect(() => {
    layDanhSachDuAn();
    // Load tỉnh
    KhuVucService.layDanhSach(null)
      .then(data => {
        setTinhs(data || []);
      })
      .catch(err => console.error('Lỗi load tỉnh:', err));
  }, []);

  // Load quận khi chọn tỉnh
  useEffect(() => {
    let huy = false;

    if (selectedTinh) {
      KhuVucService.layDanhSach(selectedTinh)
        .then(data => {
          if (huy) return;
          setQuans(data || []);
        })
        .catch(err => console.error('Lỗi load quận:', err));
    } else {
      setQuans([]);
      setPhuongs([]);
    }

    return () => {
      huy = true;
    };
  }, [selectedTinh]);

  // Load phường khi chọn quận
  useEffect(() => {
    let huy = false;

    // Reset danh sách phường ngay lập tức khi selectedQuan thay đổi
    setPhuongs([]);

    if (selectedQuan) {
      KhuVucService.layDanhSach(selectedQuan)
        .then(data => {
          if (huy) return;
          setPhuongs(data || []);
        })
        .catch(err => console.error('Lỗi load phường:', err));
    }

    return () => {
      huy = true;
    };
  }, [selectedQuan]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      KhuVucID: selectedPhuong || ''
    }));

    if (selectedPhuong) {
      setErrors(prev => {
        if (!prev.KhuVucID) {
          return prev;
        }
        const updated = { ...prev };
        delete updated.KhuVucID;
        return updated;
      });
    }
  }, [selectedPhuong]);

  // When select DuAn: auto-fill địa chỉ và tự chọn các cấp khu vực
  useEffect(() => {
    const prefillDiaChi = async () => {
      if (!formData.DuAnID) {
        setDiaChi('');
        setDangPrefillDiaChi(false);
        setPendingQuanName('');
        setPendingPhuongName('');
        xuLyChonTinh('');
        return;
      }

      if (tinhs.length === 0) {
        return;
      }

      try {
        const data = await DuAnService.layChiTiet(formData.DuAnID);
        const duAn = data.data || data;
        if (!duAn) {
          return;
        }

        const { chiTiet, phuong, quan, tinh } = tachDiaChiDuAn(duAn.DiaChi || '');
        setDiaChi(chiTiet || '');
        setDiaChiGoc(duAn.DiaChi || ''); // Lưu địa chỉ gốc
        setChoPhepChinhSuaDiaChi(false); // Khóa chỉnh sửa khi chọn dự án mới

        if (!tinh) {
          setDangPrefillDiaChi(false);
          setPendingQuanName('');
          setPendingPhuongName('');
          return;
        }

        setDangPrefillDiaChi(true);
        setPendingQuanName(quan || '');
        setPendingPhuongName(phuong || '');

        const tinhMatch = timKhuVucTheoTen(tinhs, tinh, 'tinh');
        if (tinhMatch) {
          setSelectedQuan('');
          setSelectedPhuong('');
          setSelectedTinh(String(tinhMatch.KhuVucID));
        } else {
          setDangPrefillDiaChi(false);
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết dự án:', err);
      }
    };

    prefillDiaChi();
  }, [formData.DuAnID, tinhs]);

  useEffect(() => {
    if (!dangPrefillDiaChi) {
      return;
    }

    if (!pendingQuanName) {
      return;
    }

    if (quans.length === 0) {
      return;
    }

    const quanMatch = timKhuVucTheoTen(quans, pendingQuanName, 'quan');
    if (quanMatch) {
      const quanId = String(quanMatch.KhuVucID);
      if (quanId !== selectedQuan) {
        setSelectedQuan(quanId);
      }
    } else {
      setDangPrefillDiaChi(false);
    }
  }, [dangPrefillDiaChi, pendingQuanName, quans, selectedQuan]);

  useEffect(() => {
    if (!dangPrefillDiaChi) {
      return;
    }

    if (!pendingPhuongName) {
      setDangPrefillDiaChi(false);
      return;
    }

    // Đợi đến khi selectedQuan có giá trị và danh sách phường đã được load
    if (!selectedQuan || phuongs.length === 0) {
      return;
    }

    console.log('[AutoFill] Đang tìm phường:', {
      pendingPhuongName,
      selectedQuan,
      phuongsDanhSach: phuongs.map(p => p.TenKhuVuc)
    });

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

  const xuLyThayDoiInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ===== WIZARD NAVIGATION =====
  const tenCacBuoc = [
    'Chọn Dự Án',
    'Thông Tin Cơ Bản',
    'Tiện Ích & Dịch Vụ',
    'Danh Sách Phòng',
    'Hình Ảnh',
    'Xác Nhận'
  ];

  const sangBuocTiepTheo = () => {
    // Validate bước hiện tại trước khi chuyển
    if (validateBuocHienTai()) {
      if (buocHienTai === 4 && !isNhapNhieu) {
        // Bỏ qua bước 4 nếu không nhập nhiều phòng
        setBuocHienTai(5);
      } else if (buocHienTai < TONG_SO_BUOC) {
        setBuocHienTai(buocHienTai + 1);
      }
    }
  };

  const quayLaiBuocTruoc = () => {
    if (buocHienTai === 5 && !isNhapNhieu) {
      // Bỏ qua bước 4 khi quay lại nếu không nhập nhiều
      setBuocHienTai(3);
    } else if (buocHienTai > 1) {
      setBuocHienTai(buocHienTai - 1);
    }
  };

  const validateBuocHienTai = () => {
    const newErrors = {};
    
    switch (buocHienTai) {
      case 1: // Chọn dự án
        if (!formData.DuAnID) newErrors.DuAnID = 'Vui lòng chọn dự án';
        if (!selectedPhuong) newErrors.KhuVucID = 'Vui lòng chọn địa chỉ đầy đủ';
        break;
      
      case 2: // Thông tin cơ bản
        if (!formData.TieuDe) newErrors.TieuDe = 'Vui lòng nhập tiêu đề';
        if (!isNhapNhieu) {
          if (!formData.Gia || formData.Gia <= 0) newErrors.Gia = 'Vui lòng nhập giá hợp lệ';
          if (!formData.DienTich || formData.DienTich <= 0) newErrors.DienTich = 'Vui lòng nhập diện tích hợp lệ';
        }
        break;
      
      case 3: // Tiện ích & Dịch vụ (không bắt buộc)
        break;
      
      case 4: // Danh sách phòng
        if (isNhapNhieu) {
          const phongKhongHopLe = phongs.some(p => !p.tenPhong || !p.gia || p.gia <= 0 || !p.dienTich || p.dienTich <= 0);
          if (phongKhongHopLe) {
            newErrors.Phongs = 'Vui lòng điền đầy đủ thông tin cho tất cả các phòng';
          }
        }
        break;
      
      case 5: // Hình ảnh
        if (!formData.URL || formData.URL.length === 0) {
          newErrors.URL = 'Vui lòng tải lên ít nhất 1 hình ảnh';
        }
        break;
      
      case 6: // Xác nhận (không validate, chỉ submit)
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.DuAnID) newErrors.DuAnID = 'Vui lòng chọn dự án';
    if (!formData.TieuDe) newErrors.TieuDe = 'Vui lòng nhập tiêu đề';
    
    // Kiểm tra giá và diện tích nếu đăng 1 phòng
    if (!isNhapNhieu) {
      if (!formData.Gia || formData.Gia <= 0) newErrors.Gia = 'Vui lòng nhập giá hợp lệ';
      if (!formData.DienTich || formData.DienTich <= 0) newErrors.DienTich = 'Vui lòng nhập diện tích hợp lệ';
    } else {
      // Kiểm tra danh sách phòng nếu đăng nhiều phòng
      const phongKhongHopLe = phongs.some(p => !p.tenPhong || !p.gia || p.gia <= 0 || !p.dienTich || p.dienTich <= 0);
      if (phongKhongHopLe) {
        newErrors.Phongs = 'Vui lòng điền đầy đủ thông tin cho tất cả các phòng';
      }
    }
    
    if (!formData.URL || formData.URL.length === 0) newErrors.URL = 'Vui lòng tải lên ít nhất 1 hình ảnh (theo đặc tả UC-PROJ-01)';
    if (!selectedPhuong) newErrors.KhuVucID = 'Vui lòng chọn địa chỉ đầy đủ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const xuLyChonAnh = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file type và size
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // Max 5MB
      return isImage && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Một số file không hợp lệ (chỉ chấp nhận ảnh < 5MB)');
    }

    // Tạo preview URLs
    const previews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setAnhPreview(prev => [...prev, ...previews]);
    
    // Update form data (tạm thời dùng local URLs, sẽ upload sau)
      // Tạm thời lưu local preview, sẽ upload khi submit
      setFormData(prev => ({
        ...prev,
        URL: [...prev.URL, ...previews.map(p => p.url)]
      }));

    // Clear error nếu đã có ảnh
    if (errors.URL) {
      setErrors(prev => ({ ...prev, URL: '' }));
    }
  };

  const xoaAnh = (index) => {
    setAnhPreview(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url); // Cleanup
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setFormData(prev => ({
      ...prev,
      URL: prev.URL.filter((_, i) => i !== index)
    }));
  };

  const xuLyGuiForm = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      
      // Upload ảnh trước khi submit
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
        // Các trường mới
        TienIch: formData.TienIch,
        GiaDien: formData.GiaDien ? parseFloat(formData.GiaDien) : null,
        GiaNuoc: formData.GiaNuoc ? parseFloat(formData.GiaNuoc) : null,
        GiaDichVu: formData.GiaDichVu ? parseFloat(formData.GiaDichVu) : null,
        MoTaGiaDichVu: formData.MoTaGiaDichVu || null,
        DiaChi: diaChi, // Địa chỉ chi tiết
        Phongs: isNhapNhieu ? phongs : null, // Chỉ gửi phongs khi nhập nhiều
        CapNhatDiaChiDuAn: choPhepChinhSuaDiaChi // Flag để backend biết có cần update địa chỉ dự án không
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
    const formData = new FormData();
    files.forEach(file => formData.append('anh', file));
      const response = await fetch('/api/chu-du-an/upload-anh', {
        method: 'POST',
        body: formData
        // No headers needed for FormData - browser will set multipart/form-data automatically
      });
    const data = await response.json();
    if (data.success) {
      return data.urls;
    }
    throw new Error(data.message);
  };

  const luuNhap = async () => {
    try {
      const response = await TinDangService.luuNhap(formData);
      if (response.success) {
        alert('Lưu nháp thành công!');
      }
    } catch (error) {
      alert('Lỗi lưu nháp: ' + error.message);
    }
  };

  // Hàm helper cho nhiều phòng
  const updatePhong = (index, field, value) => {
    const newPhongs = [...phongs];
    newPhongs[index][field] = value;
    setPhongs(newPhongs);
  };

  const themPhong = () => setPhongs([...phongs, { tenPhong: '', gia: '', dienTich: '', ghiChu: '', url: '' }]);

  const xoaPhong = (index) => setPhongs(phongs.filter((_, i) => i !== index));

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

  const xuLyChonTienIch = (tienIch) => {
    setFormData(prev => {
      const tienIchMoi = prev.TienIch.includes(tienIch)
        ? prev.TienIch.filter(t => t !== tienIch)
        : [...prev.TienIch, tienIch];
      return { ...prev, TienIch: tienIchMoi };
    });
  };

  const xuLyTaoDuAnThanhCong = (duAnMoi) => {
    // Thêm dự án mới vào danh sách
    setDuAns(prev => [duAnMoi, ...prev]);
    // Tự động chọn dự án vừa tạo
    setFormData(prev => ({ ...prev, DuAnID: duAnMoi.DuAnID }));
  };

  // ===== RENDER CÁC BƯỚC =====
  const renderNoiDungBuoc = () => {
    switch (buocHienTai) {
      case 1:
        return renderBuoc1_ChonDuAn();
      case 2:
        return renderBuoc2_ThongTinCoBan();
      case 3:
        return renderBuoc3_TienIchDichVu();
      case 4:
        return renderBuoc4_DanhSachPhong();
      case 5:
        return renderBuoc5_HinhAnh();
      case 6:
        return renderBuoc6_XacNhan();
      default:
        return null;
    }
  };

  return (
    <ChuDuAnLayout>
      {/* Page Header */}
      <div className="cda-flex cda-justify-between cda-items-center cda-mb-lg">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>
            Tạo tin đăng mới
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Bước {buocHienTai}/{TONG_SO_BUOC}: {tenCacBuoc[buocHienTai - 1]}
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

      {/* Progress Stepper */}
      <div className="cda-card" style={{ marginBottom: '1.5rem' }}>
        <div className="cda-card-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            {/* Line connector */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '0',
              right: '0',
              height: '2px',
              background: '#e5e7eb',
              zIndex: 0
            }}>
              <div style={{
                height: '100%',
                background: '#3b82f6',
                width: `${((buocHienTai - 1) / (TONG_SO_BUOC - 1)) * 100}%`,
                transition: 'width 0.3s'
              }}></div>
            </div>

            {/* Steps */}
            {tenCacBuoc.map((ten, index) => {
              const soBuoc = index + 1;
              const isCompleted = soBuoc < buocHienTai;
              const isCurrent = soBuoc === buocHienTai;
              const isSkipped = soBuoc === 4 && !isNhapNhieu && buocHienTai > 4;
              
              return (
                <div key={soBuoc} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  flex: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isCompleted ? '#3b82f6' : isCurrent ? '#3b82f6' : isSkipped ? '#d1d5db' : 'white',
                    border: `2px solid ${isCompleted || isCurrent ? '#3b82f6' : isSkipped ? '#d1d5db' : '#e5e7eb'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    color: isCompleted || isCurrent ? 'white' : isSkipped ? '#9ca3af' : '#6b7280',
                    transition: 'all 0.3s',
                    marginBottom: '0.5rem'
                  }}>
                    {isCompleted ? '✓' : isSkipped ? '⊘' : soBuoc}
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: isCurrent ? '#3b82f6' : isSkipped ? '#9ca3af' : '#6b7280',
                    fontWeight: isCurrent ? 600 : 400,
                    textAlign: 'center'
                  }}>
                    {ten}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={xuLyGuiForm}>
        <div className="cda-card">
          <div className="cda-card-body">
            {renderNoiDungBuoc()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={quayLaiBuocTruoc}
            className="cda-btn cda-btn-secondary"
            disabled={buocHienTai === 1 || loading}
          >
            ← Quay lại
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {buocHienTai < TONG_SO_BUOC && (
              <button
                type="button"
                onClick={sangBuocTiepTheo}
                className="cda-btn cda-btn-primary"
                disabled={loading}
              >
                Tiếp theo →
              </button>
            )}

            {buocHienTai === TONG_SO_BUOC && (
              <>
                <button
                  type="button"
                  onClick={luuNhap}
                  className="cda-btn cda-btn-secondary"
                  disabled={loading}
                >
                  💾 Lưu nháp
                </button>
                <button
                  type="submit"
                  className="cda-btn cda-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : '✓ Đăng tin'}
                </button>
              </>
            )}
          </div>
        </div

              {/* Địa chỉ - Hiển thị trong thông tin cơ bản */}
              {formData.DuAnID && (
                <>
                  <div className="cda-form-group" style={{ gridColumn: 'span 3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="cda-label cda-label-required">Địa chỉ dự án</label>
                      {!choPhepChinhSuaDiaChi ? (
                        <button
                          type="button"
                          onClick={batChinhSuaDiaChi}
                          className="cda-btn cda-btn-secondary"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        >
                          ✏️ Chỉnh sửa địa chỉ
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={huyChinhSuaDiaChi}
                          className="cda-btn cda-btn-secondary"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        >
                          ❌ Hủy chỉnh sửa
                        </button>
                      )}
                    </div>
                    
                    {/* Tỉnh/Thành phố */}
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

                      {/* Quận/Huyện */}
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

                      {/* Phường/Xã */}
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

                    {/* Địa chỉ chi tiết */}
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
                    {choPhepChinhSuaDiaChi && (
                      <p className="cda-help-text" style={{ color: '#d97706', marginTop: '0.5rem' }}>
                        ⚠️ Địa chỉ đã chỉnh sửa sẽ được cập nhật vào thông tin dự án
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Tiêu đề */}
              <div className="cda-form-group" style={{ gridColumn: 'span 3' }}>
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
              <div className="cda-form-group" style={{ gridColumn: 'span 3' }}>
                <label className="cda-label">Chế độ nhập</label>
                <select
                  value={isNhapNhieu ? 'nhieu' : 'mot'}
                  onChange={(e) => setIsNhapNhieu(e.target.value === 'nhieu')}
                  className="cda-select"
                  disabled={loading}
                >
                  <option value="mot">Đăng 1 phòng</option>
                  <option value="nhieu">Đăng nhiều phòng</option>
                </select>
                <p className="cda-help-text">
                  💡 Lưu ý: 1 tin đăng chỉ nên chứa các phòng giống nhau về tổng thể (cùng loại, cùng tiện ích). Nếu khác nhau thì tạo tin đăng riêng.
                </p>
              </div>

              {/* Giá & Diện tích - Chỉ hiện khi đăng 1 phòng */}
              {!isNhapNhieu && (
                <>
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
                      Giá: {formData.Gia ? parseInt(formData.Gia).toLocaleString('vi-VN') + ' ₫' : '0 ₫'}
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
                </>
              )}

              {/* Mô tả */}
              <div className="cda-form-group" style={{ gridColumn: 'span 3' }}>
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

              {/* Tiện ích */}
              <div className="cda-form-group" style={{ gridColumn: 'span 3' }}>
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
                <p className="cda-help-text">
                  Chọn các tiện ích có sẵn trong phòng
                </p>
              </div>

              {/* Giá dịch vụ */}
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

              <div className="cda-form-group" style={{ gridColumn: 'span 3' }}>
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
                <p className="cda-help-text">
                  Giải thích chi tiết về các khoản phí dịch vụ (nếu có)
                </p>
              </div>
              
              {/* Bảng nhập nhiều phòng */}
              {isNhapNhieu && (
                <div style={{ gridColumn: 'span 3', marginTop: '1rem' }}>
                  <div style={{ 
                    background: '#f9fafb', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    padding: '1.5rem' 
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
                      📋 Danh sách phòng
                    </h4>
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Ảnh - BẮT BUỘC theo UC-PROJ-01 */}
        <div className="cda-card">
          <div className="cda-card-header">
            <h3 className="cda-card-title">Hình ảnh <span style={{ color: 'var(--color-danger)' }}>*</span></h3>
            <p className="cda-card-subtitle">Ít nhất 1 hình ảnh (theo UC-PROJ-01)</p>
          </div>
          <div className="cda-card-body">
            <div className="cda-form-group">
              <label 
                htmlFor="upload-anh" 
                className="cda-btn cda-btn-secondary"
                style={{ cursor: 'pointer', display: 'inline-flex' }}
              >
                <span>📷</span>
                <span>Chọn hình ảnh</span>
              </label>
              <input
                id="upload-anh"
                type="file"
                accept="image/*"
                multiple
                onChange={xuLyChonAnh}
                style={{ display: 'none' }}
                disabled={loading}
              />
              {errors.URL && <p className="cda-error-message">{errors.URL}</p>}
              <p className="cda-help-text">
                Định dạng: JPG, PNG, GIF. Tối đa 5MB/ảnh. Tối đa 10 ảnh.
              </p>
            </div>

            {/* Preview ảnh */}
            {anhPreview.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                gap: '1rem', 
                marginTop: '1rem' 
              }}>
                {anhPreview.map((item, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      position: 'relative', 
                      borderRadius: '0.5rem', 
                      overflow: 'hidden',
                      border: '1px solid var(--color-dark-border)',
                      aspectRatio: '1'
                    }}
                  >
                    <img
                      src={item.url}
                      alt={`Preview ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => xoaAnh(index)}
                      style={{
                        position: 'absolute',
                        top: '0.25rem',
                        right: '0.25rem',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      ✕
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      padding: '0.25rem',
                      fontSize: '0.625rem',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>



        {/* Action Buttons */}
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
            onClick={luuNhap}
            className="cda-btn cda-btn-secondary"
            disabled={loading}
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            className="cda-btn cda-btn-success cda-btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="cda-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>Tạo tin đăng</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tips Card */}
      <div className="cda-card" style={{ marginTop: '1.5rem', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div className="cda-card-body">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>💡</div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1e40af' }}>
                Mẹo tạo tin đăng hiệu quả
              </h4>
              <ul style={{ color: '#1e3a8a', fontSize: '0.875rem', lineHeight: '1.6', paddingLeft: '1.25rem' }}>
                <li>Tiêu đề ngắn gọn, súc tích, nêu rõ ưu điểm</li>
                <li>Mô tả chi tiết về vị trí, diện tích, tiện ích</li>
                <li>Giá cả minh bạch, rõ ràng</li>
                <li>Thêm hình ảnh chất lượng cao (sắp có)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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