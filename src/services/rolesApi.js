import axios from 'axios';

const API_BASE = '/api/v1/societies';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const rolesApi = {
  getRoles: async (societyId) => {
    const res = await axios.get(`${API_BASE}/${societyId}/roles`, getAuthHeaders());
    return res.data;
  },

  getRoleByKey: async (societyId, roleKey) => {
    const res = await axios.get(`${API_BASE}/${societyId}/roles/${roleKey}`, getAuthHeaders());
    return res.data;
  },

  patchRole: async (societyId, roleKey, permissions) => {
    const res = await axios.patch(`${API_BASE}/${societyId}/roles/${roleKey}`, { permissions }, getAuthHeaders());
    return res.data;
  },

  resetRole: async (societyId, roleKey) => {
    const res = await axios.post(`${API_BASE}/${societyId}/roles/${roleKey}/reset`, {}, getAuthHeaders());
    return res.data;
  }
};
