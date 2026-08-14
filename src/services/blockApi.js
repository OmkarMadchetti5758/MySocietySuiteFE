import apiClient from './apiClient';

export const blockApi = {
  getWings: async () => {
    const res = await apiClient.get('/blocks');
    return res.data;
  },

  saveWings: async (wings) => {
    const res = await apiClient.put('/blocks', { wings });
    return res.data;
  },

  getStaffList: async () => {
    const res = await apiClient.get('/blocks/staff');
    return res.data;
  },
};
