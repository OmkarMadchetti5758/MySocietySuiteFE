import apiClient from './apiClient';

export const blockApi = {
  getWings: async () => {
    const res = await apiClient.get('/blocks');
    return res.data;
  },

  saveWings: async (wings, commercialUnits) => {
    const res = await apiClient.put('/blocks', { wings, commercialUnits });
    return res.data;
  },

  getInventory: async () => {
    const res = await apiClient.get('/blocks/inventory');
    return res.data;
  },

  saveInventory: async (payload) => {
    const res = await apiClient.put('/blocks/inventory', payload);
    return res.data;
  },

  getStaffList: async () => {
    const res = await apiClient.get('/blocks/staff');
    return res.data;
  },
};
