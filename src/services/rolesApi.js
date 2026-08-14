import apiClient from './apiClient';

export const rolesApi = {
  getRoles: async (societyId) => {
    const res = await apiClient.get(`/societies/${societyId}/roles`);
    return res.data;
  },

  getRoleByKey: async (societyId, roleKey) => {
    const res = await apiClient.get(`/societies/${societyId}/roles/${roleKey}`);
    return res.data;
  },

  patchRole: async (societyId, roleKey, permissions) => {
    const res = await apiClient.patch(`/societies/${societyId}/roles/${roleKey}`, { permissions });
    return res.data;
  },

  resetRole: async (societyId, roleKey) => {
    const res = await apiClient.post(`/societies/${societyId}/roles/${roleKey}/reset`, {});
    return res.data;
  },
};
