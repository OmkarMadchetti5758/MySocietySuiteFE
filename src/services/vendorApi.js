import api from './apiClient';

const vendorApi = {
    // Admin / Facility Manager
    getAllVendors: (params) => api.get('/vendors', { params }),
    getVendorById: (id) => api.get(`/vendors/${id}`),
    createVendor: (data) => api.post('/vendors', data),
    updateVendor: (id, data) => api.patch(`/vendors/${id}`, data),
    getVendorHistory: (id) => api.get(`/vendors/${id}/history`),

    // Task Assignment
    getAllTasks: () => api.get('/vendors/tasks'),
    assignTask: (taskId, vendorId) => api.post(`/vendors/tasks/${taskId}/assign-vendor`, { vendorId }),
    reassignTask: (taskId, vendorId) => api.patch(`/vendors/tasks/${taskId}/reassign-vendor`, { vendorId }),

    // Vendor Portal
    getVendorTasks: () => api.get('/vendors/me/tasks'),
    getVendorTaskById: (taskId) => api.get(`/vendors/me/tasks/${taskId}`),
    updateVendorTask: (taskId, data) => api.patch(`/vendors/me/tasks/${taskId}`, data),
};

export default vendorApi;
