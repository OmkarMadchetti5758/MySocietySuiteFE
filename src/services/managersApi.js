import apiClient from './apiClient';

export const managersApi = {
  
  getManagers: async (societyId, params = {}) => {
    const res = await apiClient.get(`/societies/${societyId}/managers`, { params });
    return res.data;
  },

  searchResidents: async (societyId, query) => {
    const res = await apiClient.get(`/societies/${societyId}/managers/residents-search`, {
      params: { q: query },
    });
    return res.data;
  },

  assignExistingResident: async (societyId, payload) => {
    const res = await apiClient.post(`/societies/${societyId}/managers/assign`, payload);
    return res.data;
  },

  inviteNewManager: async (societyId, payload) => {
    const res = await apiClient.post(`/societies/${societyId}/managers/invite`, payload);
    return res.data;
  },

  deactivateManager: async (societyId, assignmentId) => {
    const res = await apiClient.patch(
      `/societies/${societyId}/managers/${assignmentId}/deactivate`
    );
    return res.data;
  },

  resendInvite: async (societyId, assignmentId) => {
    const res = await apiClient.post(
      `/societies/${societyId}/managers/${assignmentId}/resend-invite`
    );
    return res.data;
  },
};
