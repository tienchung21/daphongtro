/**
 * 🌐 API Configuration - Dynamic Environment Detection
 * Tự động phát hiện môi trường (DevTunnel hoặc Localhost) và trả về URL phù hợp
 */

/**
 * Lấy Base URL cho API dựa trên môi trường hiện tại
 * @returns {string} Base URL của backend API
 */
export const getApiBaseUrl = () => {
  const currentHost = window.location.hostname;
  
  // 🔍 Detect DevTunnel environment
  if (currentHost.includes('devtunnels.ms')) {
    // Extract tunnel ID từ current URL (e.g., "mt5vhvtq-5173.asse.devtunnels.ms" → "mt5vhvtq")
    const tunnelMatch = currentHost.match(/^([^-]+)-/);
    const tunnelId = tunnelMatch ? tunnelMatch[1] : 'mt5vhvtq'; // fallback to default
    
    const backendUrl = `https://${tunnelId}-5000.asse.devtunnels.ms`;
    console.log('🌐 [API Config] DevTunnel mode:', backendUrl);
    return backendUrl;
  }
  
  // 🏠 Local development
  const localUrl = 'http://localhost:5000';
  console.log('🏠 [API Config] Localhost mode:', localUrl);
  return localUrl;
};

/**
 * Lấy WebSocket URL cho Socket.IO
 * @returns {string} WebSocket URL
 */
export const getSocketUrl = () => {
  return getApiBaseUrl(); // Socket.IO sử dụng cùng base URL
};

/**
 * Tạo full URL cho static files (uploads, images)
 * @param {string} path - Relative path (e.g., "/uploads/image.jpg")
 * @returns {string} Full URL
 */
export const getStaticUrl = (path) => {
  if (!path) return '';
  
  // Nếu đã là absolute URL (http/https), return nguyên
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${getApiBaseUrl()}${normalizedPath}`;
};

// Export constants
export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = getSocketUrl();

// 🐛 Debug: Log khi module được import
console.log('📡 [API Config] Initialized:', {
  API_BASE_URL,
  SOCKET_URL,
  hostname: window.location.hostname
});
