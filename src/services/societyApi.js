import apiClient from './apiClient';

export const societyApi = {
  getCurrentSociety: async () => {
    const res = await apiClient.get('/societies/current');
    return res.data;
  },

  updateCurrentSociety: async (formData) => {
    const res = await apiClient.put('/societies/current', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
