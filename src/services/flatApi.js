import api from './apiClient';

export const flatApi = {
  getFlats: (params) => api.get('/flats', { params }),
  getFlatById: (id) => api.get(`/flats/${id}`),
  createFlat: (data) => api.post('/flats', data),
  updateFlat: (id, data) => api.put(`/flats/${id}`, data),
  allocateResident: (id, data) => api.post(`/flats/${id}/allocate`, data),
};
