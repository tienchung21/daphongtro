import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Nếu backend có trả token, ta có thể thêm interceptor tại đây
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ghi log lỗi hoặc xử lý lỗi chung
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
