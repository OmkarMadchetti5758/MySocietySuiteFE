import apiClient from './apiClient';

export const noticeApi = {
  getNotices: async (params = {}) => {
    const res = await apiClient.get('/notices', { params });
    return res.data;
  },

  getNoticeById: async (id) => {
    const res = await apiClient.get(`/notices/${id}`);
    return res.data;
  },

  createNotice: async (data) => {
    const res = await apiClient.post('/notices', data);
    return res.data;
  },

  updateNotice: async (id, data) => {
    const res = await apiClient.put(`/notices/${id}`, data);
    return res.data;
  },

  deleteNotice: async (id) => {
    const res = await apiClient.delete(`/notices/${id}`);
    return res.data;
  },
};
