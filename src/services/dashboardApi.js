import apiClient from './apiClient';

export const dashboardApi = {
  getAdminDashboardStats: async () => {
    const res = await apiClient.get('/dashboard/admin');
    return res.data;
  },
  getResidentDashboardStats: async () => {
    const res = await apiClient.get('/dashboard/resident');
    return res.data;
  },
};

