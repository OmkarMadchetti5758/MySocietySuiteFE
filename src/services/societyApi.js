import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const societyApi = {
  getCurrentSociety: async () => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/societies/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateCurrentSociety: async (formData) => {
    const token = localStorage.getItem('accessToken');
    // Using multipart/form-data for file uploads
    const response = await axios.put(`${API_URL}/societies/current`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
