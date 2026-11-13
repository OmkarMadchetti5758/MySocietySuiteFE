import apiClient from './apiClient';

export const tenantApi = {
  // GET list of tenant registrations (paginated)
  getTenants: async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
    const res = await apiClient.get('/tenant-registrations', {
      params: { page, limit, search, status },
    });
    return res.data;
  },

  // GET eligible (vacant + owner-assigned) flats for the dropdown
  getEligibleFlats: async () => {
    const res = await apiClient.get('/tenant-registrations/eligible-flats');
    return res.data;
  },

  // GET all owned flats (for history selector and flat lookup)
  getOwnerFlats: async () => {
    const res = await apiClient.get('/tenant-registrations/flats');
    return res.data;
  },

  // POST — multipart/form-data with files
  registerTenant: async (formData) => {
    const res = await apiClient.post('/tenant-registrations', formData);
    return res.data;
  },

  // GET single tenant registration detail
  getTenantById: async (id) => {
    const res = await apiClient.get(`/tenant-registrations/${id}`);
    return res.data;
  },

  // PUT status change
  updateTenantStatus: async (id, status) => {
    const res = await apiClient.put(`/tenant-registrations/${id}/status`, { status });
    return res.data;
  },

  // PUT update registration details
  updateTenantRegistration: async (id, payload) => {
    const res = await apiClient.put(`/tenant-registrations/${id}`, payload);
    return res.data;
  },

  // GET all tenants for a specific flat (history tab)
  getTenantHistory: async (flatId) => {
    const res = await apiClient.get(`/tenant-registrations/history/${flatId}`);
    return res.data;
  },

  // POST resend invite email to tenant
  resendInvite: async (id) => {
    const res = await apiClient.post(`/tenant-registrations/${id}/resend-invite`);
    return res.data;
  },
};
