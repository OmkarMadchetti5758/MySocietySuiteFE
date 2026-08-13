import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const blockApi = {
  getWings: async () => {
    const res = await axios.get(`${API_URL}/blocks`, getAuthHeaders());
    return res.data;
  },

  saveWings: async (wings) => {
    const res = await axios.put(`${API_URL}/blocks`, { wings }, getAuthHeaders());
    return res.data;
  },

  getStaffList: async () => {
    const res = await axios.get(`${API_URL}/blocks/staff`, getAuthHeaders());
    return res.data;
  }
};
