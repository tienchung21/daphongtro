import axiosClient from "./axiosClient";

const tinDangPublicApi = {
  // GET /api/public/tin-dang
  getAll: (params) => axiosClient.get("/public/tin-dang", { params }),

  // PUT /api/public/tin-dang/:id
  update: (id, data) => axiosClient.put(`/public/tin-dang/${id}`, data),

  // DELETE /api/public/tin-dang/:id
  remove: (id, data) => axiosClient.delete(`/public/tin-dang/${id}`, { data }),
};

export default tinDangPublicApi;
