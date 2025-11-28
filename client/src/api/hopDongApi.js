import axiosClient from "./axiosClient";

const hopDongApi = {
  /**
   * Sinh snapshot hợp đồng từ server
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  generate(payload) {
    return axiosClient.post("/hop-dong/generate", payload);
  },

  /**
   * Ghi nhận xác nhận đặt cọc
   * @param {number} tinDangId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  confirmDeposit(tinDangId, data) {
    return axiosClient.post(`/hop-dong/${tinDangId}/confirm-deposit`, data);
  },
};

export default hopDongApi;

