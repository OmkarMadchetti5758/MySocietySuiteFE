import apiClient from './apiClient';

export const authApi = {
  login: async (identifier, password) => {
    const res = await apiClient.post('/auth/login', { identifier, password });
    return res.data;
  },

  refreshPermissions: async () => {
    const res = await apiClient.get('/auth/permissions');
    return res.data;
  },
};
