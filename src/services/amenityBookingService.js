import apiClient from './apiClient';

const BASE_URL = '/amenities';
const BOOKING_URL = '/amenity-bookings';

/** Normalise the backend envelope { status, message, data } → { success, message, data } */
const normalize = (res) => ({
  success: res.data?.status === 'success',
  message: res.data?.message,
  data:    res.data?.data,
});

export const amenityService = {
  getAmenities: async (params) => {
    const res = await apiClient.get(BASE_URL, { params });
    return normalize(res);
  },

  getAmenityById: async (id) => {
    const res = await apiClient.get(`${BASE_URL}/${id}`);
    return normalize(res);
  },

  createAmenity: async (data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await apiClient.post(BASE_URL, data, { headers });
    return normalize(res);
  },

  updateAmenity: async (id, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await apiClient.patch(`${BASE_URL}/${id}`, data, { headers });
    return normalize(res);
  },

  getAmenitySlots: async (id) => {
    const res = await apiClient.get(`${BASE_URL}/${id}/slots`);
    return normalize(res);
  },

  createAmenitySlot: async (id, data) => {
    const res = await apiClient.post(`${BASE_URL}/${id}/slots`, data);
    return normalize(res);
  },

  updateAmenitySlot: async (amenityId, slotId, data) => {
    const res = await apiClient.patch(`${BASE_URL}/${amenityId}/slots/${slotId}`, data);
    return normalize(res);
  },

  checkAvailability: async (amenityId, date) => {
    const res = await apiClient.get(`${BASE_URL}/${amenityId}/availability`, { params: { date } });
    return normalize(res);
  },
};

export const bookingService = {
  createBooking: async (data, idempotencyKey) => {
    const headers = idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {};
    const res = await apiClient.post(BOOKING_URL, data, { headers });
    return normalize(res);
  },

  getBookings: async (params) => {
    const res = await apiClient.get(BOOKING_URL, { params });
    return normalize(res);
  },

  cancelBooking: async (id, cancellationReason) => {
    const res = await apiClient.post(`${BOOKING_URL}/${id}/cancel`, { cancellationReason });
    return normalize(res);
  },

  approveBooking: async (id) => {
    const res = await apiClient.post(`${BOOKING_URL}/${id}/approve`);
    return normalize(res);
  },

  rejectBooking: async (id, rejectionReason) => {
    const res = await apiClient.post(`${BOOKING_URL}/${id}/reject`, { rejectionReason });
    return normalize(res);
  },
};
