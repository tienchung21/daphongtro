/**
 * Service API cho Chủ dự án
 * Xử lý tất cả các API calls liên quan đến nghiệp vụ chủ dự án
 */

// Base URL từ environment hoặc config
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_PREFIX = '/api/chu-du-an';

/**
 * Utility function để tạo headers với token
 */
const getAuthHeaders = () => {
  // Mock token cho development
  const token = localStorage.getItem('token') || 'mock-token-for-development';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Utility function để xử lý response
 */
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    // Nếu response không phải JSON (ví dụ: HTML error page)
    if (error.name === 'SyntaxError') {
      throw new Error(`Server trả về response không phải JSON. Status: ${response.status}`);
    }
    throw error;
  }
};

/**
 * Service cho Dashboard
 */
export const DashboardService = {
  /**
   * Lấy dữ liệu dashboard tổng quan
   */
  async layDashboard() {
    try {
      const url = `${API_BASE_URL}${API_PREFIX}/dashboard`;
      console.log('🔗 API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy dashboard:', error);
      throw error;
    }
  }
};

/**
 * Service cho Tin đăng (UC-PROJ-01)
 */
export const TinDangService = {
  /**
   * Lấy danh sách tin đăng
   */
  async layDanhSach(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-dang?${queryParams}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tin đăng:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết tin đăng
   */
  async layChiTiet(tinDangId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-dang/${tinDangId}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết tin đăng:', error);
      throw error;
    }
  },

  /**
   * Tạo tin đăng mới
   */
  async taoMoi(tinDangData) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/tin-dang`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tinDangData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi tạo tin đăng:', error);
      throw error;
    }
  },

  async tao(tinDangData) {
    return this.taoMoi(tinDangData);
  },

  /**
   * Cập nhật tin đăng
   */
  async capNhat(tinDangId, updateData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-dang/${tinDangId}`, 
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updateData)
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi cập nhật tin đăng:', error);
      throw error;
    }
  },

  /**
   * Gửi tin đăng để duyệt
   */
  async guiDuyet(tinDangId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-dang/${tinDangId}/gui-duyet`, 
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi gửi tin đăng để duyệt:', error);
      throw error;
    }
  },

  /**
   * Lưu tin đăng nhập
   */
  async luuNhap(data) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/tin-dang/nhap`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lưu tin đăng nhập:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng của tin đăng
   */
  async layDanhSachPhong(tinDangId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-dang/${tinDangId}/phong`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng:', error);
      throw error;
    }
  },

  /**
   * Lấy tin đăng để chỉnh sửa
   */
  async layTinDangDeChinhSua(tinDangId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-dang/${tinDangId}/chinh-sua`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy tin đăng để chỉnh sửa:', error);
      throw error;
    }
  },

  /**
   * Cập nhật tin đăng (PUT)
   */
  async capNhatTinDang(tinDangId, data) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-dang/${tinDangId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data)
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi cập nhật tin đăng:', error);
      throw error;
    }
  },

  /**
   * Xóa tin đăng (DELETE)
   * @param {number} tinDangId - ID tin đăng
   * @param {string} lyDoXoa - Lý do xóa (bắt buộc nếu tin đã duyệt/đang đăng)
   */
  async xoaTinDang(tinDangId, lyDoXoa = null) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-dang/${tinDangId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
          body: JSON.stringify({ lyDoXoa })
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi xóa tin đăng:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tin nháp
   */
  async layDanhSachTinNhap() {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/tin-nhap`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tin nháp:', error);
      throw error;
    }
  }
};

/**
 * Service cho Cuộc hẹn (UC-PROJ-02)
 */
export const CuocHenService = {
  /**
   * Lấy danh sách cuộc hẹn
   */
  async layDanhSach(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/cuoc-hen?${queryParams}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cuộc hẹn:', error);
      throw error;
    }
  },

  /**
   * Xác nhận cuộc hẹn
   */
  async xacNhan(cuocHenId, ghiChu = '') {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/cuoc-hen/${cuocHenId}/xac-nhan`, 
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ghiChu })
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi xác nhận cuộc hẹn:', error);
      throw error;
    }
  }
};

/**
 * Service cho Báo cáo (UC-PROJ-03)
 */
export const BaoCaoService = {
  /**
   * Lấy báo cáo hiệu suất tổng quan (Dashboard)
   */
  async layBaoCaoHieuSuat(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/bao-cao-hieu-suat?${queryParams}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo hiệu suất:', error);
      throw error;
    }
  },

  /**
   * Lấy báo cáo chi tiết (Báo cáo page) - 🆕
   */
  async layBaoCaoChiTiet(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/bao-cao-chi-tiet?${queryParams}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo chi tiết:', error);
      throw error;
    }
  },

  /**
   * Lấy doanh thu theo tháng (6 tháng gần nhất) - 🆕
   */
  async layDoanhThuTheoThang() {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/bao-cao/doanh-thu-theo-thang`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy doanh thu theo tháng:', error);
      throw error;
    }
  },

  /**
   * Lấy Top 5 tin đăng hiệu quả nhất - 🆕
   */
  async layTopTinDang(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/bao-cao/top-tin-dang?${queryParams}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy top tin đăng:', error);
      throw error;
    }
  },

  /**
   * Lấy Conversion Rate - 🆕
   */
  async layConversionRate(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/bao-cao/conversion-rate?${queryParams}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy conversion rate:', error);
      throw error;
    }
  }
};

/**
 * Service cho Dự án
 */
export const DuAnService = {
  /**
   * Lấy danh sách dự án
   */
  async layDanhSach() {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/du-an`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dự án:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết dự án theo ID
   */
  async layChiTiet(duAnId) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/du-an/${duAnId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết dự án:', error);
      throw error;
    }
  }
  ,
  async taoNhanh(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/du-an/tao-nhanh`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi tạo dự án:', error);
      throw error;
    }
  },

  /**
   * Cập nhật dự án
   */
  async capNhat(duAnId, payload) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/du-an/${duAnId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi cập nhật dự án:', error);
      throw error;
    }
  },

  /**
   * Lưu trữ dự án (soft delete)
   */
  async luuTru(duAnId, payload = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/du-an/${duAnId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi lưu trữ dự án:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết chính sách cọc
   */
  async layChiTietChinhSachCoc(chinhSachId) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/chinh-sach-coc/${chinhSachId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết chính sách cọc:', error);
      throw error;
    }
  },

  /**
   * Cập nhật chính sách cọc
   */
  async capNhatChinhSachCoc(chinhSachId, payload) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/chinh-sach-coc/${chinhSachId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi cập nhật chính sách cọc:', error);
      throw error;
    }
  }
};

/**
 * Service cho Phòng (dự án)
 */
export const PhongService = {
  async layTheoDuAn(duAnId) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/du-an/${duAnId}/phong`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng dự án:', error);
      throw error;
    }
  }
};

/**
 * Service cho Hợp đồng (UC-PROJ-04)
 */
export const HopDongService = {
  /**
   * Báo cáo hợp đồng cho thuê
   */
  async baoCaoChoThue(hopdongData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/hop-dong/bao-cao`, 
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(hopdongData)
        }
      );
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi báo cáo hợp đồng:', error);
      throw error;
    }
  }
};

/**
 * Service cho Khu vực
 */
export const KhuVucService = {
  async layDanhSach(parentId = null) {
    try {
      const qs = parentId === null || parentId === undefined || parentId === '' ? '' : `?parentId=${parentId}`;
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/khu-vuc${qs}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await handleResponse(response);
      return data?.data ?? data ?? [];
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách khu vực: ${error.message}`);
    }
  }
};

/**
 * Service chung cho các utility functions
 */
export const ApiService = {
  /**
   * Test kết nối API
   */
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/dashboard`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return response.ok;
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
      return false;
    }
  },

  /**
   * Lấy thông tin người dùng hiện tại
   */
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      throw error;
    }
  },

  /**
   * Upload file
   */
  async uploadFile(file, path = 'general') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
          // Không set Content-Type khi upload file, để browser tự set
        },
        body: formData
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi khi upload file:', error);
      throw error;
    }
  }
};

/**
 * Constants cho các enum values
 */
export const CONSTANTS = {
  TRANG_THAI_TIN_DANG: {
    NHAP: 'Nhap',
    CHO_DUYET: 'ChoDuyet', 
    DA_DUYET: 'DaDuyet',
    DA_DANG: 'DaDang',
    TAM_NGUNG: 'TamNgung',
    TU_CHOI: 'TuChoi',
    LUU_TRU: 'LuuTru'
  },
  
  TRANG_THAI_CUOC_HEN: {
    DA_YEU_CAU: 'DaYeuCau',
    CHO_XAC_NHAN: 'ChoXacNhan',
    DA_XAC_NHAN: 'DaXacNhan',
    DA_DOI_LICH: 'DaDoiLich',
    HUY_BOI_KHACH: 'HuyBoiKhach',
    HUY_BOI_HE_THONG: 'HuyBoiHeThong',
    KHACH_KHONG_DEN: 'KhachKhongDen',
    HOAN_THANH: 'HoanThanh'
  },

  LOAI_COC: {
    COC_GIU_CHO: 'CocGiuCho',
    COC_AN_NINH: 'CocAnNinh'
  }
};

/**
 * Utility functions
 */
export const Utils = {
  /**
   * Format số tiền VND
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  /**
   * Format ngày tháng
   */
  formatDate(date, options = {}) {
    return new Date(date).toLocaleDateString('vi-VN', options);
  },

  /**
   * Format ngày giờ
   */
  formatDateTime(datetime) {
    return new Date(datetime).toLocaleString('vi-VN');
  },

  /**
   * Debounce function cho search
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// NOTE: Tất cả services đã được export trực tiếp (export const X = {...})
// Không cần named exports block để tránh duplicate exports

// Default export cho backward compatibility
export default {
  DashboardService,
  TinDangService,
  CuocHenService,
  BaoCaoService,
  DuAnService,
  PhongService,
  HopDongService,
  KhuVucService,
  ApiService,
  CONSTANTS,
  Utils
};
