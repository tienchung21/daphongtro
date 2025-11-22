import React, { useEffect, useState, useRef, useMemo } from 'react';
import { HiOutlineXMark, HiOutlineMapPin, HiOutlineInformationCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ModalCapNhatDuAn.css';
import { DuAnService, KhuVucService } from '../../services/ChuDuAnService';
import { kiemTraKhoangCachChoPhep } from '../../utils/geoUtils';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Draggable Marker Component with 1km restriction
 */
function DraggableMarker({ position, onPositionChange, tenDuAn }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onPositionChange({ lat: newPos.lat, lng: newPos.lng });
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup minWidth={200}>
        <div style={{ textAlign: 'center' }}>
          <strong>{tenDuAn || 'Dự án'}</strong><br />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
          <hr style={{ margin: '0.5rem 0' }} />
          <span style={{ fontSize: '0.75rem', color: '#0369a1' }}>
            🔄 Kéo thả marker để điều chỉnh vị trí (tối đa 1km)
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

const TRANG_THAI_OPTIONS = [
  { 
    value: 'HoatDong', 
    label: 'Hoạt động',
    description: 'Dự án đang hoạt động bình thường, khách hàng có thể xem và đặt hẹn'
  },
  { 
    value: 'LuuTru', 
    label: 'Lưu trữ',
    description: 'Dự án ngừng hoạt động hoàn toàn, ẩn khỏi danh sách công khai'
  }
];

const TRANG_THAI_DESCRIPTIONS = {
  'HoatDong': {
    icon: '✅',
    color: '#10b981',
    text: 'Dự án đang hoạt động bình thường. Khách hàng có thể tìm kiếm, xem chi tiết và đặt hẹn xem phòng.'
  },
  'LuuTru': {
    icon: '📦',
    color: '#6b7280',
    text: 'Dự án được lưu trữ, ngừng hoạt động hoàn toàn. Tất cả tin đăng liên quan sẽ bị ẩn khỏi kết quả tìm kiếm.'
  }
};

function ModalCapNhatDuAn({ isOpen, duAn, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    TenDuAn: '',
    DiaChiChiTiet: '',
    YeuCauPheDuyetChu: false,
    PhuongThucVao: '',
    ViDo: null,
    KinhDo: null,
    TrangThai: 'HoatDong'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State cho geocoding
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [geocodeError, setGeocodeError] = useState('');
  const [viTriGoc, setViTriGoc] = useState(null); // Vị trí gốc ban đầu từ DB
  const [canhBaoKhoangCach, setCanhBaoKhoangCach] = useState('');
  
  // State cho cascade địa chỉ
  const [tinhs, setTinhs] = useState([]);
  const [quans, setQuans] = useState([]);
  const [phuongs, setPhuongs] = useState([]);
  const [selectedTinh, setSelectedTinh] = useState('');
  const [selectedQuan, setSelectedQuan] = useState('');
  const [selectedPhuong, setSelectedPhuong] = useState('');

  // State cho hoa hồng
  const [soThangCocToiThieu, setSoThangCocToiThieu] = useState(1);
  const [bangHoaHong, setBangHoaHong] = useState([]); // [{soThang: 6, tyLe: 30}, ...]

  // State cho confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [changes, setChanges] = useState([]);

  // Dữ liệu gốc từ props
  const [originalData, setOriginalData] = useState(null);

  // Load tỉnh khi modal mở
  useEffect(() => {
    if (isOpen) {
      KhuVucService.layDanhSach(null)
        .then(data => setTinhs(data || []))
        .catch(err => console.error('Lỗi load tỉnh:', err));
    }
  }, [isOpen]);

  // Load quận khi chọn tỉnh
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

  // Load phường khi chọn quận
  useEffect(() => {
    setPhuongs([]);
    if (selectedQuan) {
      KhuVucService.layDanhSach(selectedQuan)
        .then(data => setPhuongs(data || []))
        .catch(err => console.error('Lỗi load phường:', err));
    }
  }, [selectedQuan]);

  // Initialize form khi mở modal
  useEffect(() => {
    if (isOpen && duAn) {
      const viDo = duAn.ViDo !== null && duAn.ViDo !== undefined ? parseFloat(duAn.ViDo) : null;
      const kinhDo = duAn.KinhDo !== null && duAn.KinhDo !== undefined ? parseFloat(duAn.KinhDo) : null;
      
      // Parse địa chỉ để tách ra Tỉnh/Quận/Phường
      const diaChiParts = (duAn.DiaChi || '').split(',').map(s => s.trim());
      const diaChiChiTiet = diaChiParts.length > 3 ? diaChiParts[0] : '';
      
      setFormData({
        TenDuAn: duAn.TenDuAn || '',
        DiaChiChiTiet: diaChiChiTiet,
        YeuCauPheDuyetChu: Number(duAn.YeuCauPheDuyetChu) === 1,
        PhuongThucVao: duAn.PhuongThucVao || '',
        ViDo: viDo,
        KinhDo: kinhDo,
        TrangThai: duAn.TrangThai || 'HoatDong'
      });

      // Lưu dữ liệu gốc để so sánh
      setOriginalData({
        TenDuAn: duAn.TenDuAn || '',
        DiaChi: duAn.DiaChi || '',
        YeuCauPheDuyetChu: Number(duAn.YeuCauPheDuyetChu) === 1,
        PhuongThucVao: duAn.PhuongThucVao || '',
        ViDo: viDo,
        KinhDo: kinhDo,
        TrangThai: duAn.TrangThai || 'HoatDong',
        SoThangCocToiThieu: duAn.SoThangCocToiThieu || 1,
        BangHoaHong: duAn.BangHoaHong ? (typeof duAn.BangHoaHong === 'string' ? JSON.parse(duAn.BangHoaHong) : duAn.BangHoaHong) : []
      });
      
      // Initialize hoa hong data
      setSoThangCocToiThieu(duAn.SoThangCocToiThieu || 1);
      const bangHoaHongParsed = duAn.BangHoaHong 
        ? (typeof duAn.BangHoaHong === 'string' ? JSON.parse(duAn.BangHoaHong) : duAn.BangHoaHong)
        : [];
      setBangHoaHong(bangHoaHongParsed);
      
      // Set vị trí gốc cho kiểm tra khoảng cách
      if (viDo && kinhDo) {
        const coords = { lat: viDo, lng: kinhDo };
        setViTriGoc(coords);
        setGeocodeResult(coords);
      } else {
        setViTriGoc(null);
        setGeocodeResult(null);
      }
      
      setError('');
      setLoading(false);
      setGeocodeError('');
      setCanhBaoKhoangCach('');
      setShowConfirmation(false);
      setChanges([]);
      
      // TODO: Parse địa chỉ để set selectedTinh/Quan/Phuong
      // Tạm thời để trống, user phải chọn lại nếu muốn thay đổi địa chỉ
      setSelectedTinh('');
      setSelectedQuan('');
      setSelectedPhuong('');
    }
  }, [isOpen, duAn]);

  const xuLyThayDoi = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (error) setError('');
  };

  const xuLyChonTinh = (value) => {
    setSelectedTinh(value);
    setSelectedQuan('');
    setSelectedPhuong('');
  };

  const xuLyChonQuan = (value) => {
    setSelectedQuan(value);
    setSelectedPhuong('');
  };

  // Handler khi user kéo marker trên map
  const xuLyThayDoiViTri = (newPosition) => {
    console.log('[ModalCapNhatDuAn] Marker dragged to:', newPosition);
    
    // Kiểm tra khoảng cách so với vị trí gốc (từ DB ban đầu)
    if (viTriGoc) {
      const checkResult = kiemTraKhoangCachChoPhep(viTriGoc, newPosition, 1000); // 1km
      
      if (!checkResult.valid) {
        setCanhBaoKhoangCach(checkResult.message);
        // Không cho phép di chuyển, reset về vị trí gốc
        console.warn('⚠️ Vị trí quá xa, reset về vị trí gốc');
        setFormData(prev => ({
          ...prev,
          ViDo: viTriGoc.lat,
          KinhDo: viTriGoc.lng
        }));
        setGeocodeResult(viTriGoc);
        return;
      } else {
        setCanhBaoKhoangCach(''); // Clear warning nếu hợp lệ
      }
    }
    
    setFormData(prev => ({
      ...prev,
      ViDo: newPosition.lat,
      KinhDo: newPosition.lng
    }));
    // Cập nhật geocodeResult để map re-render
    setGeocodeResult(prev => ({
      ...prev,
      lat: newPosition.lat,
      lng: newPosition.lng
    }));
  };

  // Geocoding tự động khi đủ thông tin địa chỉ
  useEffect(() => {
    const timKiemToaDo = async () => {
      // CHỈ geocode khi user đã chọn địa chỉ mới (có selectedTinh, Quan, Phuong)
      if (!selectedTinh || !selectedQuan || !selectedPhuong) {
        return;
      }

      try {
        setGeocoding(true);
        setGeocodeError('');

        // Build địa chỉ đầy đủ (smart formatting như ModalTaoNhanhDuAn)
        const tinhName = tinhs.find(t => t.KhuVucID === parseInt(selectedTinh))?.TenKhuVuc || '';
        const quanName = quans.find(q => q.KhuVucID === parseInt(selectedQuan))?.TenKhuVuc || '';
        const phuongName = phuongs.find(p => p.KhuVucID === parseInt(selectedPhuong))?.TenKhuVuc || '';
        
        // Smart address formatting for Nominatim
        let searchAddress = '';
        
        if (formData.DiaChiChiTiet) {
          const diaChiChiTiet = formData.DiaChiChiTiet.trim();
          
          // Case 1: Có dấu "/" (hẻm) → Ưu tiên cấp thành phố
          if (diaChiChiTiet.includes('/')) {
            const parts = diaChiChiTiet.split(' ');
            const soHem = parts[0].split('/')[0];
            const tenDuong = parts.slice(1).join(' ');
            
            if (tinhName.toLowerCase().includes('hồ chí minh') || tinhName.toLowerCase().includes('hà nội')) {
              searchAddress = `Hẻm ${soHem} ${tenDuong}, ${tinhName}`;
            } else {
              searchAddress = `Hẻm ${soHem} ${tenDuong}, ${quanName}, ${tinhName}`;
            }
          } 
          // Case 2: Chỉ có số nhà và tên đường → Ưu tiên cấp tỉnh
          else {
            searchAddress = `${diaChiChiTiet}, ${tinhName}`;
          }
        } else {
          // Không có địa chỉ chi tiết → Dùng phường/quận/tỉnh
          searchAddress = [phuongName, quanName, tinhName].filter(Boolean).join(', ');
        }

        console.log('[ModalCapNhatDuAn] Smart search:', searchAddress);

        // Call geocoding API
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || 'mock-token-for-development'}`
          },
          body: JSON.stringify({ address: searchAddress })
        });

        const data = await response.json();

        if (data.success) {
          console.log('[ModalCapNhatDuAn] Geocode success:', data.data);
          setGeocodeResult(data.data);
          
          // Nếu chưa có viTriGoc (dự án cũ không có tọa độ), set nó
          if (!viTriGoc) {
            setViTriGoc({ lat: data.data.lat, lng: data.data.lng });
          }
          
          setCanhBaoKhoangCach(''); // Reset warning
          
          // Tự động cập nhật tọa độ vào form
          setFormData(prev => ({
            ...prev,
            ViDo: data.data.lat,
            KinhDo: data.data.lng
          }));
        } else {
          console.warn('[ModalCapNhatDuAn] Geocode failed:', data.message);
          setGeocodeError(data.message || 'Không tìm thấy vị trí');
          setGeocodeResult(null);
        }
      } catch (err) {
        console.error('[ModalCapNhatDuAn] Geocode error:', err);
        setGeocodeError('Lỗi kết nối geocoding service');
        setGeocodeResult(null);
      } finally {
        setGeocoding(false);
      }
    };

    // Debounce: Chờ 500ms sau khi user chọn phường
    const timer = setTimeout(timKiemToaDo, 500);
    return () => clearTimeout(timer);
  }, [selectedTinh, selectedQuan, selectedPhuong, formData.DiaChiChiTiet, tinhs, quans, phuongs]);

  // Helper functions cho hoa hồng
  const themMucHoaHong = () => {
    setBangHoaHong([...bangHoaHong, { soThang: '', tyLe: '' }]);
  };

  const xoaMucHoaHong = (index) => {
    setBangHoaHong(bangHoaHong.filter((_, i) => i !== index));
  };

  const capNhatMucHoaHong = (index, field, value) => {
    const updated = [...bangHoaHong];
    updated[index] = { ...updated[index], [field]: value };
    setBangHoaHong(updated);
  };

  const detectChanges = () => {
    if (!originalData) return [];

    const changeList = [];

    // So sánh từng field
    if (formData.TenDuAn !== originalData.TenDuAn) {
      changeList.push({
        field: 'Tên dự án',
        old: originalData.TenDuAn,
        new: formData.TenDuAn
      });
    }

    // Build địa chỉ mới
    let newDiaChi = originalData.DiaChi; // Mặc định giữ nguyên
    if (selectedTinh && selectedQuan && selectedPhuong) {
      const tinhName = tinhs.find(t => t.KhuVucID === parseInt(selectedTinh))?.TenKhuVuc || '';
      const quanName = quans.find(q => q.KhuVucID === parseInt(selectedQuan))?.TenKhuVuc || '';
      const phuongName = phuongs.find(p => p.KhuVucID === parseInt(selectedPhuong))?.TenKhuVuc || '';
      newDiaChi = [formData.DiaChiChiTiet, phuongName, quanName, tinhName].filter(Boolean).join(', ');
      
      if (newDiaChi !== originalData.DiaChi) {
        changeList.push({
          field: 'Địa chỉ',
          old: originalData.DiaChi,
          new: newDiaChi
        });
      }
    }

    if (formData.YeuCauPheDuyetChu !== originalData.YeuCauPheDuyetChu) {
      changeList.push({
        field: 'Yêu cầu phê duyệt chủ',
        old: originalData.YeuCauPheDuyetChu ? 'Có' : 'Không',
        new: formData.YeuCauPheDuyetChu ? 'Có' : 'Không'
      });
    }

    if (formData.PhuongThucVao !== originalData.PhuongThucVao) {
      changeList.push({
        field: 'Phương thức vào',
        old: originalData.PhuongThucVao || '(Trống)',
        new: formData.PhuongThucVao || '(Trống)'
      });
    }

    // Chỉ so sánh tọa độ nếu có thay đổi địa chỉ (selectedTinh được chọn)
    if (selectedTinh && (formData.ViDo !== originalData.ViDo || formData.KinhDo !== originalData.KinhDo)) {
      changeList.push({
        field: 'Tọa độ GPS',
        old: originalData.ViDo && originalData.KinhDo 
          ? `${originalData.ViDo.toFixed(6)}, ${originalData.KinhDo.toFixed(6)}`
          : '(Chưa có)',
        new: formData.ViDo && formData.KinhDo 
          ? `${formData.ViDo.toFixed(6)}, ${formData.KinhDo.toFixed(6)}`
          : '(Chưa có)'
      });
    }

    if (formData.TrangThai !== originalData.TrangThai) {
      const statusLabels = { 'HoatDong': 'Hoạt động', 'LuuTru': 'Lưu trữ', 'NgungHoatDong': 'Ngưng hoạt động' };
      changeList.push({
        field: 'Trạng thái',
        old: statusLabels[originalData.TrangThai] || originalData.TrangThai,
        new: statusLabels[formData.TrangThai] || formData.TrangThai
      });
    }

    // Kiểm tra thay đổi hoa hồng
    if (soThangCocToiThieu !== originalData.SoThangCocToiThieu) {
      changeList.push({
        field: 'Số tháng cọc tối thiểu',
        old: originalData.SoThangCocToiThieu || 1,
        new: soThangCocToiThieu
      });
    }

    const bangHoaHongStr = JSON.stringify(bangHoaHong.sort((a, b) => a.soThang - b.soThang));
    const originalBangHoaHongStr = JSON.stringify((originalData.BangHoaHong || []).sort((a, b) => a.soThang - b.soThang));
    if (bangHoaHongStr !== originalBangHoaHongStr) {
      changeList.push({
        field: 'Bảng hoa hồng',
        old: originalData.BangHoaHong?.length > 0 
          ? `${originalData.BangHoaHong.length} mức` 
          : '(Chưa cấu hình)',
        new: bangHoaHong.length > 0 
          ? `${bangHoaHong.length} mức` 
          : '(Chưa cấu hình)'
      });
    }

    return changeList;
  };

  const xuLySubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.TenDuAn.trim()) {
      setError('Vui lòng nhập tên dự án');
      return;
    }

    // Nếu không yêu cầu phê duyệt thì phương thức vào là bắt buộc
    if (!formData.YeuCauPheDuyetChu && !formData.PhuongThucVao.trim()) {
      setError('Vui lòng nhập phương thức vào dự án');
      return;
    }

    // Validation hoa hồng nếu có thay đổi
    const hoaHongChanged = soThangCocToiThieu !== originalData?.SoThangCocToiThieu ||
      JSON.stringify(bangHoaHong) !== JSON.stringify(originalData?.BangHoaHong || []);
    
    if (hoaHongChanged) {
      // Validate số tháng cọc
      if (!soThangCocToiThieu || soThangCocToiThieu < 1) {
        setError('Số tháng cọc tối thiểu phải >= 1');
        return;
      }

      // Validate bảng hoa hồng
      const validBangHoaHong = bangHoaHong.filter(item => item.soThang && item.tyLe);
      if (validBangHoaHong.length === 0 && bangHoaHong.length > 0) {
        setError('Vui lòng nhập đầy đủ thông tin cho các mức hoa hồng');
        return;
      }

      // Check duplicates và validate values
      const soThangs = new Set();
      for (const item of validBangHoaHong) {
        const soThang = parseInt(item.soThang);
        const tyLe = parseFloat(item.tyLe);
        if (isNaN(soThang) || soThang < 1) {
          setError(`Số tháng hợp đồng "${item.soThang}" không hợp lệ (phải >= 1)`);
          return;
        }
        if (isNaN(tyLe) || tyLe < 0 || tyLe > 100) {
          setError(`Tỷ lệ hoa hồng "${item.tyLe}" không hợp lệ (phải từ 0-100%)`);
          return;
        }
        if (soThangs.has(soThang)) {
          setError(`Số tháng ${soThang} bị trùng lặp trong bảng hoa hồng`);
          return;
        }
        soThangs.add(soThang);
      }
    }

    // Phát hiện thay đổi
    const detectedChanges = detectChanges();
    
    if (detectedChanges.length === 0) {
      setError('Không có thay đổi nào để lưu');
      return;
    }

    // Hiển thị confirmation
    setChanges(detectedChanges);
    setShowConfirmation(true);
  };

  const xuLyXacNhanLuu = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build địa chỉ đầy đủ
      let diaChiDayDu = originalData.DiaChi; // Mặc định giữ nguyên
      if (selectedTinh && selectedQuan && selectedPhuong) {
        const tinhName = tinhs.find(t => t.KhuVucID === parseInt(selectedTinh))?.TenKhuVuc || '';
        const quanName = quans.find(q => q.KhuVucID === parseInt(selectedQuan))?.TenKhuVuc || '';
        const phuongName = phuongs.find(p => p.KhuVucID === parseInt(selectedPhuong))?.TenKhuVuc || '';
        diaChiDayDu = [formData.DiaChiChiTiet, phuongName, quanName, tinhName].filter(Boolean).join(', ');
      }
      
      // Gọi API cập nhật
      const payload = {
        TenDuAn: formData.TenDuAn.trim(),
        DiaChi: diaChiDayDu,
        YeuCauPheDuyetChu: formData.YeuCauPheDuyetChu ? 1 : 0,
        PhuongThucVao: formData.YeuCauPheDuyetChu ? null : formData.PhuongThucVao.trim(),
        TrangThai: formData.TrangThai
      };

      // Chỉ gửi tọa độ nếu có thay đổi địa chỉ
      if (selectedTinh) {
        payload.ViDo = formData.ViDo;
        payload.KinhDo = formData.KinhDo;
      }

      // Thêm hoa hồng nếu có thay đổi
      const hoaHongChanged = soThangCocToiThieu !== originalData?.SoThangCocToiThieu ||
        JSON.stringify(bangHoaHong) !== JSON.stringify(originalData?.BangHoaHong || []);
      
      if (hoaHongChanged) {
        payload.SoThangCocToiThieu = soThangCocToiThieu;
        // Chỉ gửi bảng hoa hồng nếu có ít nhất 1 mức hợp lệ
        const validBangHoaHong = bangHoaHong
          .filter(item => item.soThang && item.tyLe)
          .map(item => ({
            soThang: parseInt(item.soThang),
            tyLe: parseFloat(item.tyLe)
          }));
        payload.BangHoaHong = validBangHoaHong.length > 0 ? validBangHoaHong : null;
      }

      await DuAnService.capNhat(duAn.DuAnID, payload);
      
      onSaved();
      setShowConfirmation(false);
      onClose();
    } catch (err) {
      console.error('[ModalCapNhatDuAn] Update error:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật dự án');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const xuLyDong = () => {
    setShowConfirmation(false);
    setChanges([]);
    onClose();
  };

  if (!isOpen || !duAn) {
    return null;
  }

  // Render confirmation dialog
  if (showConfirmation) {
    return (
      <div className="modal-cap-nhat-du-an__overlay" onClick={(e) => e.target.className === 'modal-cap-nhat-du-an__overlay' && setShowConfirmation(false)}>
        <div className="modal-cap-nhat-du-an" style={{ maxWidth: '600px' }}>
          <div className="modal-cap-nhat-du-an__header">
            <div>
              <h2 className="modal-cap-nhat-du-an__title">Xác nhận cập nhật dự án</h2>
              <p className="modal-cap-nhat-du-an__subtitle">Vui lòng kiểm tra lại các thay đổi trước khi lưu</p>
            </div>
            <button className="modal-cap-nhat-du-an__close-btn" onClick={() => setShowConfirmation(false)}>
              <HiOutlineXMark size={20} />
            </button>
          </div>

          <div className="modal-cap-nhat-du-an__body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(59, 130, 246, 0.1)', 
              borderLeft: '4px solid #3b82f6',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <HiOutlineInformationCircle size={20} color="#3b82f6" />
                <strong style={{ color: '#1e40af' }}>Phát hiện {changes.length} thay đổi</strong>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                Hệ thống sẽ ghi nhận các thay đổi này vào nhật ký audit log.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {changes.map((change, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: '1rem', 
                    background: '#f9fafb', 
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    {change.field}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      <span style={{ color: '#6b7280' }}>Cũ: </span>
                      <span style={{ 
                        color: '#dc2626', 
                        textDecoration: 'line-through',
                        background: 'rgba(220, 38, 38, 0.1)',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem'
                      }}>
                        {change.old}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                      <span style={{ color: '#6b7280' }}>Mới: </span>
                      <span style={{ 
                        color: '#059669', 
                        fontWeight: 600,
                        background: 'rgba(5, 150, 105, 0.1)',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem'
                      }}>
                        {change.new}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ 
                marginTop: '1rem',
                padding: '0.75rem', 
                background: '#fee2e2', 
                color: '#dc2626',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="modal-cap-nhat-du-an__footer">
            <button 
              type="button" 
              className="modal-cap-nhat-du-an__btn modal-cap-nhat-du-an__btn--secondary" 
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
            >
              Quay lại chỉnh sửa
            </button>
            <button 
              type="button" 
              className="modal-cap-nhat-du-an__btn modal-cap-nhat-du-an__btn--primary" 
              onClick={xuLyXacNhanLuu}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : '✓ Xác nhận và lưu'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form render
  return (
    <div className="modal-cap-nhat-du-an__overlay" onClick={(e) => e.target.className === 'modal-cap-nhat-du-an__overlay' && xuLyDong()}>
      <div className="modal-cap-nhat-du-an">
        <div className="modal-cap-nhat-du-an__header">
          <div>
            <h2 className="modal-cap-nhat-du-an__title">Chỉnh sửa dự án</h2>
            <p className="modal-cap-nhat-du-an__subtitle">Cập nhật thông tin dự án: {duAn.TenDuAn}</p>
          </div>
          <button className="modal-cap-nhat-du-an__close-btn" onClick={xuLyDong}>
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={xuLySubmit}>
          <div className="modal-cap-nhat-du-an__body">
            <div className="modal-cap-nhat-du-an__field">
              <label htmlFor="TenDuAn" className="modal-cap-nhat-du-an__label">
                Tên dự án <span className="modal-cap-nhat-du-an__label--required">*</span>
              </label>
              <input
                id="TenDuAn"
                name="TenDuAn"
                className="modal-cap-nhat-du-an__input"
                value={formData.TenDuAn}
                onChange={xuLyThayDoi}
                placeholder="VD: Chung cư Vinhomes Central Park"
              />
            </div>

            {/* Cascade Địa chỉ */}
            <div style={{ 
              padding: '1rem', 
              background: '#f9fafb', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: '#374151',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <HiOutlineMapPin size={16} />
                Thay đổi địa chỉ (tùy chọn)
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
                📍 Địa chỉ hiện tại: <strong>{originalData?.DiaChi}</strong><br />
                💡 Chỉ chọn nếu muốn thay đổi địa chỉ. Bỏ trống để giữ nguyên địa chỉ cũ.
              </p>

              <div className="modal-cap-nhat-du-an__grid modal-cap-nhat-du-an__grid--col-2">
                <div className="modal-cap-nhat-du-an__field">
                  <label htmlFor="selectedTinh" className="modal-cap-nhat-du-an__label">Tỉnh/Thành phố</label>
                  <select
                    id="selectedTinh"
                    className="modal-cap-nhat-du-an__select"
                    value={selectedTinh}
                    onChange={(e) => xuLyChonTinh(e.target.value)}
                  >
                    <option value="">-- Không thay đổi --</option>
                    {tinhs.map(tinh => (
                      <option key={tinh.KhuVucID} value={tinh.KhuVucID}>
                        {tinh.TenKhuVuc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-cap-nhat-du-an__field">
                  <label htmlFor="selectedQuan" className="modal-cap-nhat-du-an__label">Quận/Huyện</label>
                  <select
                    id="selectedQuan"
                    className="modal-cap-nhat-du-an__select"
                    value={selectedQuan}
                    onChange={(e) => xuLyChonQuan(e.target.value)}
                    disabled={!selectedTinh}
                  >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {quans.map(quan => (
                      <option key={quan.KhuVucID} value={quan.KhuVucID}>
                        {quan.TenKhuVuc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-cap-nhat-du-an__field">
                  <label htmlFor="selectedPhuong" className="modal-cap-nhat-du-an__label">Phường/Xã</label>
                  <select
                    id="selectedPhuong"
                    className="modal-cap-nhat-du-an__select"
                    value={selectedPhuong}
                    onChange={(e) => setSelectedPhuong(e.target.value)}
                    disabled={!selectedQuan}
                  >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {phuongs.map(phuong => (
                      <option key={phuong.KhuVucID} value={phuong.KhuVucID}>
                        {phuong.TenKhuVuc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-cap-nhat-du-an__field">
                  <label htmlFor="DiaChiChiTiet" className="modal-cap-nhat-du-an__label">Địa chỉ chi tiết</label>
                  <input
                    id="DiaChiChiTiet"
                    name="DiaChiChiTiet"
                    className="modal-cap-nhat-du-an__input"
                    value={formData.DiaChiChiTiet}
                    onChange={xuLyThayDoi}
                    placeholder="VD: 40/6 Lê Văn Thọ"
                    disabled={!selectedPhuong}
                  />
                </div>
              </div>

              {/* Geocoding result */}
              {selectedTinh && (geocoding || geocodeResult || geocodeError) && (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#fff',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  {geocoding && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: '#0369a1',
                      fontSize: '0.875rem'
                    }}>
                      <span className="modal-cap-nhat-du-an__spinner" style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #0369a1',
                        borderTopColor: 'transparent',
                        borderRadius: '50%'
                      }} />
                      Đang tìm tọa độ GPS...
                    </div>
                  )}

                  {geocodeError && (
                    <div style={{ 
                      padding: '0.75rem',
                      background: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}>
                      ⚠️ {geocodeError}
                    </div>
                  )}

                  {geocodeResult && !geocoding && (
                    <>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>📍</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                            Đã tìm thấy tọa độ GPS
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {geocodeResult.lat.toFixed(6)}, {geocodeResult.lng.toFixed(6)}
                          </div>
                        </div>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: geocodeResult.source === 'google' ? '#dcfce7' : '#fef3c7',
                          color: geocodeResult.source === 'google' ? '#166534' : '#92400e',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {geocodeResult.source === 'google' ? '✓ Google Maps' : '~ OpenStreetMap'}
                        </span>
                      </div>

                      {/* Leaflet Map */}
                      <div style={{ 
                        height: '200px', 
                        borderRadius: '0.375rem', 
                        overflow: 'hidden',
                        border: '2px solid #0ea5e9'
                      }}>
                        <MapContainer 
                          center={[geocodeResult.lat, geocodeResult.lng]} 
                          zoom={16} 
                          style={{ height: '100%', width: '100%' }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <DraggableMarker 
                            position={{ lat: geocodeResult.lat, lng: geocodeResult.lng }}
                            onPositionChange={xuLyThayDoiViTri}
                            tenDuAn={formData.TenDuAn}
                          />
                        </MapContainer>
                      </div>

                      {/* Cảnh báo khoảng cách quá xa */}
                      {canhBaoKhoangCach && (
                        <div style={{
                          marginTop: '0.75rem',
                          padding: '0.75rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <HiOutlineExclamationTriangle size={20} />
                          <span><strong>Giới hạn di chuyển:</strong> {canhBaoKhoangCach}</span>
                        </div>
                      )}

                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#0369a1', 
                        marginTop: '0.5rem',
                        marginBottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}>
                        <span>🔄</span>
                        <span><strong>Kéo thả marker</strong> trên map để điều chỉnh vị trí (tối đa 1km từ vị trí gốc).</span>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="modal-cap-nhat-du-an__field modal-cap-nhat-du-an__field--checkbox">
              <label htmlFor="YeuCauPheDuyetChu" className="modal-cap-nhat-du-an__label--checkbox">
                <input
                  type="checkbox"
                  id="YeuCauPheDuyetChu"
                  name="YeuCauPheDuyetChu"
                  checked={formData.YeuCauPheDuyetChu}
                  onChange={xuLyThayDoi}
                />
                Chủ dự án duyệt cuộc hẹn
              </label>
              <p className="modal-cap-nhat-du-an__hint">
                Bật để yêu cầu chủ dự án duyệt từng cuộc hẹn
              </p>
            </div>

            <div className="modal-cap-nhat-du-an__field">
              <label htmlFor="PhuongThucVao" className="modal-cap-nhat-du-an__label">
                Phương thức vào dự án {!formData.YeuCauPheDuyetChu && <span className="modal-cap-nhat-du-an__label--required">*</span>}
              </label>
              <textarea
                id="PhuongThucVao"
                name="PhuongThucVao"
                className="modal-cap-nhat-du-an__textarea"
                value={formData.PhuongThucVao}
                onChange={xuLyThayDoi}
                rows={3}
                disabled={formData.YeuCauPheDuyetChu}
                placeholder={
                  formData.YeuCauPheDuyetChu
                    ? 'Không cần nhập vì đã bật phê duyệt'
                    : 'VD: Mật khẩu cổng 2468, khóa trong hộp số 3'
                }
              />
            </div>

            {/* Section Hoa hồng */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    💰 Cấu hình Hoa hồng
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Thiết lập mức hoa hồng cho nhân viên bán hàng khi chốt hợp đồng
                  </p>
                </div>
                {/* Trạng thái duyệt */}
                {duAn?.TrangThaiDuyetHoaHong && (
                  <div style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: duAn.TrangThaiDuyetHoaHong === 'DaDuyet' 
                      ? '#dcfce7' 
                      : duAn.TrangThaiDuyetHoaHong === 'TuChoi'
                      ? '#fee2e2'
                      : '#fef3c7',
                    color: duAn.TrangThaiDuyetHoaHong === 'DaDuyet'
                      ? '#166534'
                      : duAn.TrangThaiDuyetHoaHong === 'TuChoi'
                      ? '#991b1b'
                      : '#92400e'
                  }}>
                    {duAn.TrangThaiDuyetHoaHong === 'DaDuyet' && '✓ Đã duyệt'}
                    {duAn.TrangThaiDuyetHoaHong === 'TuChoi' && '✗ Từ chối'}
                    {duAn.TrangThaiDuyetHoaHong === 'ChoDuyet' && '⏳ Chờ duyệt'}
                  </div>
                )}
              </div>

              {/* Hiển thị lý do từ chối và ghi chú */}
              {duAn?.TrangThaiDuyetHoaHong === 'TuChoi' && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fee2e2',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  {duAn.LyDoTuChoiHoaHong && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#991b1b' }}>Lý do từ chối:</strong>
                      <div style={{ color: '#dc2626', marginTop: '0.25rem' }}>
                        {duAn.LyDoTuChoiHoaHong}
                      </div>
                    </div>
                  )}
                  {duAn.GhiChuHoaHong && (
                    <div>
                      <strong style={{ color: '#991b1b' }}>Ghi chú:</strong>
                      <div style={{ color: '#dc2626', marginTop: '0.25rem' }}>
                        {duAn.GhiChuHoaHong}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Số tháng cọc tối thiểu */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Số tháng cọc tối thiểu
                </label>
                <input
                  type="number"
                  min="1"
                  value={soThangCocToiThieu}
                  onChange={(e) => setSoThangCocToiThieu(parseInt(e.target.value) || 1)}
                  className="modal-cap-nhat-du-an__input"
                  style={{ maxWidth: '150px' }}
                  disabled={loading || (duAn?.TrangThaiDuyetHoaHong === 'DaDuyet')}
                />
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem'
                }}>
                  Số tháng cọc mà khách hàng phải đặt khi thuê phòng
                </p>
                {soThangCocToiThieu > 1 && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#fef3c7',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    color: '#92400e'
                  }}>
                    ⚠️ Dự án yêu cầu cọc {soThangCocToiThieu} tháng (cao hơn mức thông thường 1 tháng)
                  </div>
                )}
              </div>

              {/* Bảng hoa hồng */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151'
                  }}>
                    Bảng tỷ lệ hoa hồng (% tiền cọc)
                  </label>
                  {(!duAn?.TrangThaiDuyetHoaHong || duAn.TrangThaiDuyetHoaHong === 'TuChoi') && (
                    <button
                      type="button"
                      onClick={themMucHoaHong}
                      className="cda-btn cda-btn-secondary"
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem'
                      }}
                      disabled={loading}
                    >
                      + Thêm mức
                    </button>
                  )}
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginBottom: '0.75rem'
                }}>
                  💡 Đề xuất: 6 tháng = 30%, 12 tháng = 70%
                </p>

                {bangHoaHong.length === 0 ? (
                  <div style={{
                    padding: '1rem',
                    background: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    Chưa có mức hoa hồng nào. Nhấn "Thêm mức" để bắt đầu.
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    overflow: 'hidden'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.875rem'
                    }}>
                      <thead>
                        <tr style={{
                          background: '#f9fafb',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <th style={{
                            padding: '0.75rem',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#374151',
                            width: '40%'
                          }}>
                            Số tháng hợp đồng
                          </th>
                          <th style={{
                            padding: '0.75rem',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#374151',
                            width: '40%'
                          }}>
                            Tỷ lệ hoa hồng (%)
                          </th>
                          {(!duAn?.TrangThaiDuyetHoaHong || duAn.TrangThaiDuyetHoaHong === 'TuChoi') && (
                            <th style={{
                              padding: '0.75rem',
                              textAlign: 'center',
                              fontWeight: 600,
                              color: '#374151',
                              width: '20%'
                            }}>
                              Thao tác
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {bangHoaHong.map((item, index) => {
                          const isRecommended = (item.soThang == 6 && item.tyLe == 30) || 
                                                (item.soThang == 12 && item.tyLe == 70);
                          const isWarning = !isRecommended && item.soThang && item.tyLe;
                          
                          return (
                            <tr key={index} style={{
                              borderBottom: index < bangHoaHong.length - 1 ? '1px solid #e5e7eb' : 'none'
                            }}>
                              <td style={{ padding: '0.75rem' }}>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.soThang}
                                  onChange={(e) => capNhatMucHoaHong(index, 'soThang', e.target.value)}
                                  className="modal-cap-nhat-du-an__input"
                                  placeholder="VD: 6"
                                  disabled={loading || (duAn?.TrangThaiDuyetHoaHong === 'DaDuyet')}
                                  style={{
                                    width: '100%',
                                    fontSize: '0.875rem'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={item.tyLe}
                                    onChange={(e) => capNhatMucHoaHong(index, 'tyLe', e.target.value)}
                                    className="modal-cap-nhat-du-an__input"
                                    placeholder="VD: 30"
                                    disabled={loading || (duAn?.TrangThaiDuyetHoaHong === 'DaDuyet')}
                                    style={{
                                      width: '100%',
                                      fontSize: '0.875rem'
                                    }}
                                  />
                                  <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>%</span>
                                </div>
                                {isWarning && (
                                  <div style={{
                                    marginTop: '0.25rem',
                                    fontSize: '0.7rem',
                                    color: '#f59e0b'
                                  }}>
                                    ⚠️ Khác mức đề xuất
                                  </div>
                                )}
                              </td>
                              {(!duAn?.TrangThaiDuyetHoaHong || duAn.TrangThaiDuyetHoaHong === 'TuChoi') && (
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => xoaMucHoaHong(index)}
                                    className="cda-btn cda-btn-secondary"
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.75rem'
                                    }}
                                    disabled={loading}
                                  >
                                    Xóa
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Thông báo khi đã duyệt */}
              {duAn?.TrangThaiDuyetHoaHong === 'DaDuyet' && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: '#dcfce7',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  color: '#166534'
                }}>
                  ✓ Hoa hồng đã được duyệt. Để chỉnh sửa, vui lòng liên hệ nhân viên điều hành hoặc chờ từ chối để có thể sửa lại.
                </div>
              )}
            </div>

            <div className="modal-cap-nhat-du-an__field">
              <label htmlFor="TrangThai" className="modal-cap-nhat-du-an__label">Trạng thái dự án</label>
              <select
                id="TrangThai"
                name="TrangThai"
                className="modal-cap-nhat-du-an__select"
                value={formData.TrangThai}
                onChange={xuLyThayDoi}
              >
                {TRANG_THAI_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              {/* Status description */}
              {TRANG_THAI_DESCRIPTIONS[formData.TrangThai] && (
                <div 
                  className="modal-cap-nhat-du-an__status"
                  style={{ borderLeftColor: TRANG_THAI_DESCRIPTIONS[formData.TrangThai].color }}
                >
                  <span className="modal-cap-nhat-du-an__status-icon">
                    {TRANG_THAI_DESCRIPTIONS[formData.TrangThai].icon}
                  </span>
                  <div className="modal-cap-nhat-du-an__status-text">
                    <HiOutlineInformationCircle size={16} />
                    <span>{TRANG_THAI_DESCRIPTIONS[formData.TrangThai].text}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && <div className="modal-cap-nhat-du-an__error">{error}</div>}

          <div className="modal-cap-nhat-du-an__footer">
            <button type="button" className="modal-cap-nhat-du-an__btn modal-cap-nhat-du-an__btn--secondary" onClick={xuLyDong} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="modal-cap-nhat-du-an__btn modal-cap-nhat-du-an__btn--primary" disabled={loading}>
              {loading ? 'Đang kiểm tra...' : 'Xem thay đổi và xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCapNhatDuAn;
