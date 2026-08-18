import apiClient from './apiClient';

export const otpApi = {
  /**
   * Send an OTP to the given identifier.
   * @param {{ identifier: string, purpose: string, societyId: string }} payload
   */
  sendOtp: async (payload) => {
    // We don't want to use the global axios interceptor that adds the token
    // here because OTP happens before login. But apiClient allows it if there's no token.
    const res = await apiClient.post('/otp/send', payload);
    return res.data;
  },

  /**
   * Verify an OTP.
   * @param {{ identifier: string, code: string, purpose: string, societyId: string }} payload
   */
  verifyOtp: async (payload) => {
    const res = await apiClient.post('/otp/verify', payload);
    return res.data;
  },

  /**
   * Check if an identifier is already verified for a purpose (to resume flow).
   * @param {{ identifier: string, purpose: string, societyId: string }} params
   */
  getOtpStatus: async (params) => {
    const res = await apiClient.get('/otp/status', { params });
    return res.data;
  },
};
