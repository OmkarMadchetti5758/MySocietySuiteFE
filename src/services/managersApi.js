import apiClient from './apiClient';

export const managersApi = {
  /**
   * Fetch all department-head roles with their current assignment status.
   * @param {string} societyId
   * @param {{ department?: string, status?: string, search?: string }} params
   */
  getManagers: async (societyId, params = {}) => {
    const res = await apiClient.get(`/societies/${societyId}/managers`, { params });
    return res.data;
  },

  /**
   * Search residents in the society (for Path A — assign existing resident).
   * @param {string} societyId
   * @param {string} query
   */
  searchResidents: async (societyId, query) => {
    const res = await apiClient.get(`/societies/${societyId}/managers/residents-search`, {
      params: { q: query },
    });
    return res.data;
  },

  /**
   * Path A — Assign an existing resident to a manager role.
   * @param {string} societyId
   * @param {{ userId, roleKey, roleName, department, joiningDate }} payload
   */
  assignExistingResident: async (societyId, payload) => {
    const res = await apiClient.post(`/societies/${societyId}/managers/assign`, payload);
    return res.data;
  },

  /**
   * Path B — Invite a brand-new user as a manager.
   * @param {string} societyId
   * @param {{ name, email, phone, roleKey, roleName, department, joiningDate }} payload
   */
  inviteNewManager: async (societyId, payload) => {
    const res = await apiClient.post(`/societies/${societyId}/managers/invite`, payload);
    return res.data;
  },

  /**
   * Deactivate a manager assignment.
   * @param {string} societyId
   * @param {string} assignmentId
   */
  deactivateManager: async (societyId, assignmentId) => {
    const res = await apiClient.patch(
      `/societies/${societyId}/managers/${assignmentId}/deactivate`
    );
    return res.data;
  },

  /**
   * Resend the invite link for a pending/expired manager invite.
   * @param {string} societyId
   * @param {string} assignmentId
   */
  resendInvite: async (societyId, assignmentId) => {
    const res = await apiClient.post(
      `/societies/${societyId}/managers/${assignmentId}/resend-invite`
    );
    return res.data;
  },
};
