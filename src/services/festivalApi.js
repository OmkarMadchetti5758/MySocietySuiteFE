import apiClient from './apiClient';

export const festivalApi = {
  getFestivals: async (params = {}) => {
    const res = await apiClient.get('/festivals', { params });
    return res.data;
  },

  getFestivalById: async (id) => {
    const res = await apiClient.get(`/festivals/${id}`);
    return res.data;
  },

  createFestival: async (data) => {
    const res = await apiClient.post('/festivals', data);
    return res.data;
  },

  updateFestival: async (id, data) => {
    // Controller uses PATCH
    const res = await apiClient.patch(`/festivals/${id}`, data);
    return res.data;
  },

  publishFestival: async (id) => {
    const res = await apiClient.post(`/festivals/${id}/publish`);
    return res.data;
  },

  unpublishFestival: async (id) => {
    const res = await apiClient.post(`/festivals/${id}/unpublish`);
    return res.data;
  },

  cancelFestival: async (id) => {
    const res = await apiClient.post(`/festivals/${id}/cancel`);
    return res.data;
  },

  deleteFestival: async (id) => {
    const res = await apiClient.delete(`/festivals/${id}`);
    return res.data;
  },
};
