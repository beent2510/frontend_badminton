import api from "./axiosConfig";

const casualMatchService = {
  getAll: (params) => api.get("/user/casual-matches", { params }),
  create: (data) => api.post("/user/casual-matches", data),
  join: (id) => api.post(`/user/casual-matches/${id}/join`),
  leave: (id) => api.post(`/user/casual-matches/${id}/leave`),
  approveParticipant: (id, participantId) => api.post(`/user/casual-matches/${id}/participants/${participantId}/approve`),
  rejectParticipant: (id, participantId) => api.post(`/user/casual-matches/${id}/participants/${participantId}/reject`),
  update: (id, data) => api.put(`/user/casual-matches/${id}`, data),
};

export default casualMatchService;
