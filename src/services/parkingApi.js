import api from './apiClient';

const parkingApi = {
    // Dashboard Summary
    getDashboardStats: (params) => api.get('/parking/dashboard/stats', { params }),

    // Parking Slots
    getSlots: (params) => api.get('/parking/slots', { params }),
    createSlot: (data) => api.post('/parking/slots', data),
    updateSlot: (id, data) => api.patch(`/parking/slots/${id}`, data),
    deleteSlot: (id) => api.post(`/parking/slots/${id}/deactivate`),

    // Vehicles
    getVehicles: (params) => api.get('/parking/vehicles', { params }),
    createVehicle: (data) => api.post('/parking/vehicles', data),
    updateVehicle: (id, data) => api.patch(`/parking/vehicles/${id}`, data),
    deactivateVehicle: (id) => api.post(`/parking/vehicles/${id}/deactivate`),

    // Assignments
    getAssignments: (params) => api.get('/parking/assignments', { params }),
    assignSlot: (data) => api.post('/parking/assignments', data),
    unassignSlot: (id, data) => api.post(`/parking/assignments/${id}/release`, data),

    // Visitor Parking
    getVisitorParkings: (params) => api.get('/parking/visitor', { params }),
    checkInVisitor: (data) => api.post('/parking/visitor', data),
    checkOutVisitor: (id, data) => api.post(`/parking/visitor/${id}/exit`, data),

    // Parking Requests
    getRequests: (params) => api.get('/parking/requests', { params }),
    createRequest: (data) => api.post('/parking/requests', data),
    approveRequest: (id, data) => api.post(`/parking/requests/${id}/approve`, data),
    rejectRequest: (id, data) => api.post(`/parking/requests/${id}/reject`, data),

    // Violations
    getViolations: (params) => api.get('/parking/violations', { params }),
    reportViolation: (data) => api.post('/parking/violations', data),
    resolveViolation: (id, data) => api.patch(`/parking/violations/${id}/resolve`, data),
};

export default parkingApi;
