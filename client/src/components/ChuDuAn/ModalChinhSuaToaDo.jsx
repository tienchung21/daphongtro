import React, { useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HiOutlineXMark } from 'react-icons/hi2';
import { kiemTraKhoangCachChoPhep } from '../../utils/geoUtils';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Component Marker kéo thả
 */
function DraggableMarker({ position, onPositionChange, tieuDe }) {
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
      <Popup>
        <strong>{tieuDe || 'Tin đăng mới'}</strong><br />
        📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}<br />
        🔄 <em>Kéo thả marker để điều chỉnh vị trí</em>
      </Popup>
    </Marker>
  );
}

/**
 * Modal chỉnh sửa tọa độ bằng map
 */
function ModalChinhSuaToaDo({ isOpen, onClose, initialPosition, onSave, tieuDe }) {
  const [currentPosition, setCurrentPosition] = React.useState(initialPosition);
  const [canhBaoKhoangCach, setCanhBaoKhoangCach] = React.useState('');

  React.useEffect(() => {
    setCurrentPosition(initialPosition);
    setCanhBaoKhoangCach(''); // Reset warning khi mở modal
  }, [initialPosition]);

  if (!isOpen) return null;

  const xuLyThayDoiViTri = (newPos) => {
    // Kiểm tra khoảng cách so với vị trí ban đầu
    const checkResult = kiemTraKhoangCachChoPhep(initialPosition, newPos, 1000); // 1km
    
    if (!checkResult.valid) {
      setCanhBaoKhoangCach(checkResult.message);
      // Không cho phép di chuyển, giữ nguyên vị trí hiện tại
      console.warn('⚠️ Vị trí quá xa, không cho phép di chuyển');
      return;
    } else {
      setCanhBaoKhoangCach(''); // Clear warning
      setCurrentPosition(newPos);
    }
  };

  const xuLyLuu = () => {
    // Kiểm tra lần cuối trước khi lưu
    const checkResult = kiemTraKhoangCachChoPhep(initialPosition, currentPosition, 1000);
    
    if (!checkResult.valid) {
      alert(`❌ ${checkResult.message}\n\nVui lòng chỉnh sửa trong phạm vi cho phép.`);
      return;
    }
    
    onSave(currentPosition);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#252834',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1a1d29 0%, #2d3142 100%)'
          }}
        >
          <h3 style={{ margin: 0, color: '#f9fafb', fontSize: '1.25rem', fontWeight: 600 }}>
            📍 Chỉnh sửa vị trí trên bản đồ
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '0.5rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#9ca3af';
            }}
          >
            <HiOutlineXMark size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Hướng dẫn */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              marginBottom: '1rem',
              color: '#93c5fd',
              fontSize: '0.875rem'
            }}
          >
            💡 <strong>Hướng dẫn:</strong> Kéo thả marker (📍) trên bản đồ để điều chỉnh vị trí chính xác.
          </div>

          {/* Tọa độ hiện tại */}
          <div
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Tọa độ hiện tại:
            </div>
            <div style={{ color: '#f9fafb', fontSize: '1rem', fontWeight: 500 }}>
              📍 Vĩ độ: <span style={{ color: '#8b5cf6' }}>{currentPosition.lat.toFixed(6)}</span>
              {' | '}
              Kinh độ: <span style={{ color: '#8b5cf6' }}>{currentPosition.lng.toFixed(6)}</span>
            </div>
          </div>

          {/* Map */}
          <div
            style={{
              height: '500px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              marginBottom: '1rem'
            }}
          >
            <MapContainer
              center={[currentPosition.lat, currentPosition.lng]}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <DraggableMarker
                position={currentPosition}
                onPositionChange={xuLyThayDoiViTri}
                tieuDe={tieuDe}
              />
            </MapContainer>
          </div>

          {/* Cảnh báo khoảng cách quá xa */}
          {canhBaoKhoangCach && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <div>
                <strong>Giới hạn di chuyển:</strong>
                <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem' }}>
                  {canhBaoKhoangCach}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#9ca3af';
              }}
            >
              Hủy
            </button>
            <button
              onClick={xuLyLuu}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }}
            >
              ✓ Lưu vị trí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalChinhSuaToaDo;
