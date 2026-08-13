import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const residentsApi = {
  getResidents: async (params = {}) => {
    const res = await axios.get(`${API_URL}/residents`, {
      ...getAuthHeaders(),
      params
    });
    return res.data;
  },

  inviteResident: async (payload) => {
    const res = await axios.post(`${API_URL}/residents`, payload, getAuthHeaders());
    return res.data;
  }
};
