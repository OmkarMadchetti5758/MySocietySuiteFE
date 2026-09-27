import api from './apiClient';

/**
 * Vendor Payment API Service
 * Wraps all Vendor Payment endpoints according to backend contract.
 */
const vendorPaymentApi = {
    /**
     * Get paginated vendor payments with optional filters
     * @param {Object} params - { status, vendorId, startDate, endDate, search, page, limit }
     */
    getVendorPayments: (params = {}) => api.get('/billing/vendor-payments', { params }),

    /**
     * Get vendor payment details by ID
     * @param {string} id - Vendor Payment ID
     */
    getVendorPaymentById: (id) => api.get(`/billing/vendor-payments/${id}`),

    /**
     * Create a new vendor payment request
     * @param {Object} data - { vendorId, vendorName, billReference, amount, paymentMode, financialAccountId, description, workOrderId, purchaseId }
     */
    createVendorPayment: (data) => api.post('/billing/vendor-payments', data),

    /**
     * Approve vendor payment request (Committee Admin)
     * @param {string} id - Vendor Payment ID
     * @param {string} comment - Approval comment
     */
    approveVendorPayment: (id, comment = '') => api.post(`/billing/vendor-payments/${id}/approve`, { action: 'approve', comment }),

    /**
     * Reject vendor payment request (Committee Admin)
     * @param {string} id - Vendor Payment ID
     * @param {string} comment - Rejection comment
     */
    rejectVendorPayment: (id, comment = '') => api.post(`/billing/vendor-payments/${id}/reject`, { comment }),

    /**
     * Mark an approved vendor payment as paid / disbursed
     * @param {string} id - Vendor Payment ID
     * @param {Object} data - Optional { financialAccountId }
     */
    markVendorPaymentPaid: (id, data = {}) => api.post(`/billing/vendor-payments/${id}/mark-paid`, data),
};

export default vendorPaymentApi;
