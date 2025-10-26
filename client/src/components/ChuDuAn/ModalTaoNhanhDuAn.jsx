import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { KhuVucService } from '../../services/ChuDuAnService';
import { kiemTraKhoangCachChoPhep } from '../../utils/geoUtils';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Draggable Marker Component
 */
function DraggableMarker({ position, onPositionChange, tenDuAn }) {
  const [draggable, setDraggable] = useState(true);
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
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup minWidth={200}>
        <div style={{ textAlign: 'center' }}>
          <strong>{tenDuAn || 'Dự án mới'}</strong><br />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
          <hr style={{ margin: '0.5rem 0' }} />
          <span style={{ fontSize: '0.75rem', color: '#0369a1' }}>
            🔄 Kéo thả marker để điều chỉnh vị trí
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

/**
 * Modal tạo dự án với geocoding tự động và map preview
 */
function ModalTaoNhanhDuAn({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    TenDuAn: '',
    DiaChiChiTiet: '',
    YeuCauPheDuyetChu: false,
    PhuongThucVao: '',
    ViDo: null,
    KinhDo: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State cho geocoding
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [geocodeError, setGeocodeError] = useState('');
  const [viTriGoc, setViTriGoc] = useState(null); // Vị trí từ Nominatim (không được di chuyển xa hơn 1km)
  const [canhBaoKhoangCach, setCanhBaoKhoangCach] = useState('');
  
  // State cho cascade địa chỉ
  const [tinhs, setTinhs] = useState([]);
  const [quans, setQuans] = useState([]);
  const [phuongs, setPhuongs] = useState([]);
  const [selectedTinh, setSelectedTinh] = useState('');
  const [selectedQuan, setSelectedQuan] = useState('');
  const [selectedPhuong, setSelectedPhuong] = useState('');

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
    console.log('[ModalTaoNhanhDuAn] Marker dragged to:', newPosition);
    
    // Kiểm tra khoảng cách so với vị trí gốc (từ Nominatim)
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
        setGeocodeResult(prev => ({
          ...prev,
          lat: viTriGoc.lat,
          lng: viTriGoc.lng
        }));
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
      // Chỉ geocode khi đủ thông tin
      if (!selectedTinh || !selectedQuan || !selectedPhuong) {
        return;
      }

      try {
        setGeocoding(true);
        setGeocodeError('');

        // Build địa chỉ đầy đủ
        const tinhName = tinhs.find(t => t.KhuVucID === parseInt(selectedTinh))?.TenKhuVuc || '';
        const quanName = quans.find(q => q.KhuVucID === parseInt(selectedQuan))?.TenKhuVuc || '';
        const phuongName = phuongs.find(p => p.KhuVucID === parseInt(selectedPhuong))?.TenKhuVuc || '';
        
        // Smart address formatting for Nominatim
        let searchAddress = '';
        
        if (formData.DiaChiChiTiet) {
          const diaChiChiTiet = formData.DiaChiChiTiet.trim();
          
          // Case 1: Có dấu "/" (hẻm) → Ưu tiên cấp thành phố
          // Ví dụ: "40/6 Lê Văn Thọ" → "Hẻm 40 Lê Văn Thọ, TP. Hồ Chí Minh"
          if (diaChiChiTiet.includes('/')) {
            const parts = diaChiChiTiet.split(' ');
            const soHem = parts[0].split('/')[0]; // "40/6" → "40"
            const tenDuong = parts.slice(1).join(' '); // "Lê Văn Thọ"
            
            // Ưu tiên thành phố > quận > phường
            if (tinhName.toLowerCase().includes('hồ chí minh') || tinhName.toLowerCase().includes('hà nội')) {
              searchAddress = `Hẻm ${soHem} ${tenDuong}, ${tinhName}`;
            } else {
              searchAddress = `Hẻm ${soHem} ${tenDuong}, ${quanName}, ${tinhName}`;
            }
          } 
          // Case 2: Chỉ có số nhà và tên đường → Ưu tiên cấp tỉnh
          // Ví dụ: "15 Hà Huy Tập" → "15 Hà Huy Tập, Bình Thuận"
          else {
            searchAddress = `${diaChiChiTiet}, ${tinhName}`;
          }
        } else {
          // Không có địa chỉ chi tiết → Dùng phường/quận/tỉnh
          searchAddress = [phuongName, quanName, tinhName].filter(Boolean).join(', ');
        }

        console.log('[ModalTaoNhanhDuAn] Smart search:', searchAddress);

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
          console.log('[ModalTaoNhanhDuAn] Geocode success:', data.data);
          setGeocodeResult(data.data);
          
          // Lưu vị trí gốc từ Nominatim (để kiểm tra khoảng cách sau này)
          setViTriGoc({ lat: data.data.lat, lng: data.data.lng });
          setCanhBaoKhoangCach(''); // Reset warning
          
          // Tự động cập nhật tọa độ vào form
          setFormData(prev => ({
            ...prev,
            ViDo: data.data.lat,
            KinhDo: data.data.lng
          }));
        } else {
          console.warn('[ModalTaoNhanhDuAn] Geocode failed:', data.message);
          setGeocodeError(data.message || 'Không tìm thấy vị trí');
          setGeocodeResult(null);
          setViTriGoc(null);
        }
      } catch (err) {
        console.error('[ModalTaoNhanhDuAn] Geocode error:', err);
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

  const xuLySubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.TenDuAn.trim()) {
      setError('Vui lòng nhập tên dự án');
      return;
    }
    if (!selectedTinh || !selectedQuan || !selectedPhuong) {
      setError('Vui lòng chọn đầy đủ địa chỉ (Tỉnh/Quận/Phường)');
      return;
    }
    // Nếu không yêu cầu phê duyệt thì phương thức vào là bắt buộc
    if (!formData.YeuCauPheDuyetChu && !formData.PhuongThucVao.trim()) {
      setError('Vui lòng nhập phương thức vào dự án (mật khẩu cửa, vị trí chìa khóa...)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Build địa chỉ đầy đủ
      const tinhName = tinhs.find(t => t.KhuVucID === parseInt(selectedTinh))?.TenKhuVuc || '';
      const quanName = quans.find(q => q.KhuVucID === parseInt(selectedQuan))?.TenKhuVuc || '';
      const phuongName = phuongs.find(p => p.KhuVucID === parseInt(selectedPhuong))?.TenKhuVuc || '';
      
      const diaChiDayDu = [
        formData.DiaChiChiTiet,
        phuongName,
        quanName,
        tinhName
      ].filter(Boolean).join(', ');
      
      // Gọi API tạo dự án
      const response = await fetch('/api/chu-du-an/du-an/tao-nhanh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock-token-for-development'}`
        },
        body: JSON.stringify({
          TenDuAn: formData.TenDuAn.trim(),
          DiaChi: diaChiDayDu,
          ViDo: formData.ViDo,
          KinhDo: formData.KinhDo,
          YeuCauPheDuyetChu: formData.YeuCauPheDuyetChu ? 1 : 0,
          PhuongThucVao: formData.YeuCauPheDuyetChu ? null : formData.PhuongThucVao.trim(),
          TrangThai: 'HoatDong'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onSuccess(data.duAn);
        // Reset form
        setFormData({
          TenDuAn: '',
          DiaChiChiTiet: '',
          YeuCauPheDuyetChu: false,
          PhuongThucVao: '',
          ViDo: null,
          KinhDo: null
        });
        setSelectedTinh('');
        setSelectedQuan('');
        setSelectedPhuong('');
        setGeocodeResult(null);
        setGeocodeError('');
        onClose();
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Lỗi tạo dự án:', err);
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const xuLyDong = () => {
    // Reset khi đóng
    setFormData({
      TenDuAn: '',
      DiaChiChiTiet: '',
      YeuCauPheDuyetChu: false,
      PhuongThucVao: '',
      ViDo: null,
      KinhDo: null
    });
    setSelectedTinh('');
    setSelectedQuan('');
    setSelectedPhuong('');
    setError('');
    setGeocodeResult(null);
    setGeocodeError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
            ➕ Tạo dự án mới
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Nhập đầy đủ thông tin để tạo dự án
          </p>
        </div>

        <form onSubmit={xuLySubmit}>
          {/* Tên dự án */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Tên dự án <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="TenDuAn"
              value={formData.TenDuAn}
              onChange={xuLyThayDoi}
              className="cda-input"
              placeholder="VD: Nhà trọ Hoa Mai"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Địa chỉ cascade */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Địa chỉ <span style={{ color: '#dc2626' }}>*</span>
            </label>
            
            {/* Tỉnh/Quận/Phường */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <select
                  value={selectedTinh}
                  onChange={(e) => xuLyChonTinh(e.target.value)}
                  className="cda-select"
                  disabled={loading}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="">-- Tỉnh/TP --</option>
                  {tinhs.map(tinh => (
                    <option key={tinh.KhuVucID} value={tinh.KhuVucID}>
                      {tinh.TenKhuVuc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedQuan}
                  onChange={(e) => xuLyChonQuan(e.target.value)}
                  className="cda-select"
                  disabled={loading || !selectedTinh}
                  style={{ fontSize: '0.875rem', opacity: selectedTinh ? 1 : 0.6 }}
                >
                  <option value="">-- Quận/Huyện --</option>
                  {quans.map(quan => (
                    <option key={quan.KhuVucID} value={quan.KhuVucID}>
                      {quan.TenKhuVuc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedPhuong}
                  onChange={(e) => setSelectedPhuong(e.target.value)}
                  className="cda-select"
                  disabled={loading || !selectedQuan}
                  style={{ fontSize: '0.875rem', opacity: selectedQuan ? 1 : 0.6 }}
                >
                  <option value="">-- Phường/Xã --</option>
                  {phuongs.map(phuong => (
                    <option key={phuong.KhuVucID} value={phuong.KhuVucID}>
                      {phuong.TenKhuVuc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Địa chỉ chi tiết */}
            <input
              type="text"
              name="DiaChiChiTiet"
              value={formData.DiaChiChiTiet}
              onChange={xuLyThayDoi}
              className="cda-input"
              placeholder="Số nhà, tên đường (Ví dụ: 40/6 Lê Văn Thọ)"
              disabled={loading}
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          {/* Map Preview - Hiển thị vị trí tự động */}
          {(geocoding || geocodeResult || geocodeError) && (
            <div style={{ 
              marginBottom: '1rem',
              padding: '1rem',
              background: '#f0f9ff',
              borderRadius: '0.5rem',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.125rem' }}>🗺️</span>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0c4a6e', margin: 0 }}>
                  Vị trí trên bản đồ
                </h4>
                {geocoding && (
                  <span style={{ fontSize: '0.75rem', color: '#0369a1', marginLeft: 'auto' }}>
                    Đang tìm tọa độ...
                  </span>
                )}
              </div>

              {geocodeError && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: '#fef2f2', 
                  color: '#991b1b',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '0.5rem'
                }}>
                  <span>⚠️</span>
                  <div>
                    <strong>Không tìm thấy vị trí:</strong> {geocodeError}
                    <br />
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      💡 Thử nhập số nhà hoặc tên đường cụ thể hơn
                    </span>
                  </div>
                </div>
              )}

              {geocodeResult && (
                <>
                  <div style={{ 
                    padding: '0.5rem', 
                    background: 'white',
                    borderRadius: '0.375rem',
                    marginBottom: '0.75rem',
                    fontSize: '0.8125rem',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#64748b' }}>📍 Tọa độ:</span>
                      <span style={{ fontFamily: 'monospace', color: '#0c4a6e', fontWeight: 500 }}>
                        {geocodeResult.lat.toFixed(6)}, {geocodeResult.lng.toFixed(6)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>🌐 Nguồn:</span>
                      <span style={{ 
                        padding: '0.125rem 0.5rem',
                        background: geocodeResult.source === 'google' ? '#dcfce7' : '#fef3c7',
                        color: geocodeResult.source === 'google' ? '#166534' : '#92400e',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        {geocodeResult.source === 'google' ? '✓ Google Maps (Chính xác)' : '~ OpenStreetMap (Ước lượng)'}
                      </span>
                    </div>
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
                      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
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

          {/* Cài đặt nâng cao */}
          <div style={{ 
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.375rem'
          }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>
              ⚙️ Cài đặt nâng cao
            </h4>

            {/* Yêu cầu phê duyệt chủ */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer',
              marginBottom: '0.75rem'
            }}>
              <input
                type="checkbox"
                name="YeuCauPheDuyetChu"
                checked={formData.YeuCauPheDuyetChu}
                onChange={xuLyThayDoi}
                disabled={loading}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                Yêu cầu phê duyệt từ chủ dự án cho mỗi cuộc hẹn
              </span>
            </label>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem', marginLeft: '1.5rem' }}>
              {formData.YeuCauPheDuyetChu 
                ? '✓ Chủ dự án sẽ phê duyệt và cung cấp phương thức vào khi có cuộc hẹn'
                : '→ Nhân viên/khách hàng sẽ nhận phương thức vào ngay khi đặt hẹn'}
            </p>

            {/* Phương thức vào - chỉ hiện khi KHÔNG yêu cầu phê duyệt */}
            {!formData.YeuCauPheDuyetChu && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 500, 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Phương thức vào dự án <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  name="PhuongThucVao"
                  value={formData.PhuongThucVao}
                  onChange={xuLyThayDoi}
                  className="cda-textarea"
                  placeholder="VD: Mật khẩu cổng: 1234, Chìa khóa để tại hộp thư số 5, Liên hệ bảo vệ tầng 1..."
                  rows="3"
                  disabled={loading}
                  style={{ fontSize: '0.875rem' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  💡 Thông tin này sẽ được chia sẻ với nhân viên bán hàng và khách hàng sau khi đặt hẹn
                </p>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: '#fee2e2', 
              color: '#dc2626',
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={xuLyDong}
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
              {loading ? 'Đang tạo...' : '✓ Tạo dự án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalTaoNhanhDuAn;
