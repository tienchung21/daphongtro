import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HiOutlineMapPin } from 'react-icons/hi2';
import 'leaflet/dist/leaflet.css';
import './MapViTriPhong.css';

// Fix Leaflet default marker icon paths (Vite/Webpack issue)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Purple Marker Icon (Gradient - Đồng bộ với Light Glass Morphism Theme)
const purpleMarkerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <defs>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path 
        fill="url(#purpleGrad)" 
        stroke="#ffffff" 
        stroke-width="2" 
        filter="url(#shadow)"
        d="M12 0C7.029 0 3 4.029 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.971-4.029-9-9-9z"
      />
      <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -50],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
});

/**
 * Helper Component: Tự động center map về marker position khi mount
 */
function MapCenterHelper({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom(), {
        animate: true,
        duration: 0.5
      });
    }
  }, [map, position]);
  
  return null;
}

/**
 * Component: Hiển thị bản đồ vị trí phòng trọ/dự án
 * 
 * Design: Light Glass Morphism Theme - Đồng bộ với ChiTietTinDang
 * 
 * Features:
 * - OpenStreetMap tiles (CartoDB Positron - Light theme)
 * - Custom purple gradient marker
 * - Glass morphism popup styling
 * - Responsive height (desktop/tablet/mobile)
 * - Link to Google Maps cho navigation
 * - Error state khi thiếu tọa độ
 * 
 * @param {Object} props
 * @param {number} props.lat - Vĩ độ (Latitude) - Required
 * @param {number} props.lng - Kinh độ (Longitude) - Required
 * @param {string} props.tenDuAn - Tên dự án/phòng trọ
 * @param {string} props.diaChi - Địa chỉ đầy đủ
 * @param {number} [props.zoom=15] - Zoom level (10=city, 15=street, 18=building)
 * @param {number} [props.height=400] - Chiều cao map (px) - Responsive via CSS
 */
const MapViTriPhong = ({ 
  lat, 
  lng, 
  tenDuAn = 'Phòng trọ', 
  diaChi = '', 
  zoom = 15,
  height = 400 
}) => {

  // Validate coordinates
  const isValidCoordinates = 
    lat && lng && 
    !isNaN(parseFloat(lat)) && 
    !isNaN(parseFloat(lng)) &&
    parseFloat(lat) >= -90 && parseFloat(lat) <= 90 &&
    parseFloat(lng) >= -180 && parseFloat(lng) <= 180;

  // Error State: Tọa độ không hợp lệ hoặc thiếu
  if (!isValidCoordinates) {
    return (
      <div className="map-vi-tri-container">
        <div className="map-vi-tri-header">
          <h3>
            <HiOutlineMapPin />
            <span>Vị trí</span>
          </h3>
          {diaChi && (
            <p className="map-vi-tri-address">
              <HiOutlineMapPin style={{ flexShrink: 0 }} />
              <span>{diaChi}</span>
            </p>
          )}
        </div>
        <div className="map-vi-tri-error">
          <HiOutlineMapPin className="map-error-icon" />
          <p className="map-error-text">Thông tin vị trí chưa có sẵn</p>
          <p className="map-error-subtext">Chủ dự án chưa cập nhật tọa độ cho địa điểm này</p>
        </div>
      </div>
    );
  }

  const position = [parseFloat(lat), parseFloat(lng)];

  return (
    <div className="map-vi-tri-container">
      {/* Header Section */}
      <div className="map-vi-tri-header">
        <h3>
          <HiOutlineMapPin />
          <span>Vị trí</span>
        </h3>
        {diaChi && (
          <p className="map-vi-tri-address">
            <HiOutlineMapPin style={{ flexShrink: 0 }} />
            <span>{diaChi}</span>
          </p>
        )}
      </div>

      {/* Map Container */}
      <div className="map-vi-tri-map" style={{ height: `${height}px` }}>
        <MapContainer
          center={position}
          zoom={zoom}
          scrollWheelZoom={false}  // UX: Tắt zoom khi scroll để tránh interfere với page scroll
          dragging={true}           // Cho phép drag map
          zoomControl={true}        // Hiển thị zoom buttons (+/-)
          doubleClickZoom={true}    // Double click để zoom in
          style={{ width: '100%', height: '100%' }}
        >
          {/* Tile Layer - CartoDB Positron (Light theme, phù hợp Light Glass Morphism) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
            minZoom={10}
          />

          {/* Marker với Custom Purple Icon */}
          <Marker position={position} icon={purpleMarkerIcon}>
            <Popup className="map-custom-popup">
              <div className="map-popup-content">
                <h4 className="map-popup-title">{tenDuAn}</h4>
                {diaChi && <p className="map-popup-address">{diaChi}</p>}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-popup-link"
                >
                  <HiOutlineMapPin style={{ width: 16, height: 16 }} />
                  <span>Xem trên Google Maps</span>
                </a>
              </div>
            </Popup>
          </Marker>

          {/* Helper: Auto center map to marker */}
          <MapCenterHelper position={position} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapViTriPhong;
