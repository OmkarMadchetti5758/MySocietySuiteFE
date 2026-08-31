import api from './apiClient';

const complaintApi = {
    // ── Shared (Resident & Admin) ──
    getComplaints: (params) => api.get('/complaints', { params }),
    getComplaintById: (id) => api.get(`/complaints/${id}`),

    // ── Resident Only ──
    getResidentInfo: () => api.get('/complaints/resident-info'),
    createComplaint: (data) => {
        // If data contains File objects, we use FormData
        if (data instanceof FormData) {
            return api.post('/complaints', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/complaints', data);
    },
    confirmResolution: (id) => api.patch(`/complaints/${id}/confirm-resolution`),
    reopenComplaint: (id, data) => api.patch(`/complaints/${id}/reopen`, data),

    // ── Admin / Facility Manager Only ──
    assignComplaint: (id, data) => api.patch(`/complaints/${id}/assign`, data),
    updateComplaintStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
    getComplaintHistory: (id) => api.get(`/complaints/${id}/history`),
    getComplaintSummary: () => api.get('/complaints/summary'),

    // ── Utility ──
    getCategories: () => api.get('/complaints/categories'),

    // ── Vendor Only ──
    getVendorAssignedComplaints: (params) => api.get('/complaints/vendor/assigned', { params }),
    getVendorComplaintById: (id) => api.get(`/complaints/vendor/${id}`),
    vendorUpdateStatus: (id, data) => api.patch(`/complaints/vendor/${id}/status`, data),
};

export default complaintApi;
