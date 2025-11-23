import axios from 'axios';

const API_URL = import.meta.env.VITE_KYC_API_URL || 'http://localhost:5000/api/kyc';

const KYCService = {
  xacThuc: async (formData) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.post(`${API_URL}/xac-thuc`, formData, config);
    return response.data;
  },

  getLichSu: async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${API_URL}/lich-su`, config);
    return response.data;
  }
};

export default KYCService;
