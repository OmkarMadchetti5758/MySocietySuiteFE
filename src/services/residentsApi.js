import apiClient from './apiClient';

export const residentsApi = {
  getResidents: async ({ page = 1, limit = 10, search } = {}) => {
    const res = await apiClient.get('/residents', {
      params: { page, limit, search },
    });
    return res.data;
  },

  inviteResident: async (payload) => {
    const res = await apiClient.post('/residents', payload);
    return res.data;
  },
};
