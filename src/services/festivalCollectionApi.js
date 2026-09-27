import apiClient from './apiClient';

export const festivalCollectionApi = {
  getCollections: async (params = {}) => {
    const res = await apiClient.get('/festival-collections', { params });
    return res.data;
  },

  getCollectionById: async (id) => {
    const res = await apiClient.get(`/festival-collections/${id}`);
    return res.data;
  },

  createCollection: async (data) => {
    const res = await apiClient.post('/festival-collections', data);
    return res.data;
  },

  updateCollection: async (id, data) => {
    const res = await apiClient.patch(`/festival-collections/${id}`, data);
    return res.data;
  },

  initiateOnlinePayment: async (id, data) => {
    const res = await apiClient.post(`/festival-collections/${id}/pay/online/initiate`, data);
    return res.data;
  },

  verifyOnlinePayment: async (id, data) => {
    const res = await apiClient.post(`/festival-collections/${id}/pay/online/verify`, data);
    return res.data;
  },

  recordOfflineContribution: async (id, data) => {
    const res = await apiClient.post(`/festival-collections/${id}/pay/offline`, data);
    return res.data;
  },

  getContributions: async (id, params = {}) => {
    const res = await apiClient.get(`/festival-collections/${id}/contributions`, { params });
    return res.data;
  },

  getResidentStatus: async (id) => {
    const res = await apiClient.get(`/festival-collections/${id}/resident-status`);
    return res.data;
  },

  getCollectionReport: async (id) => {
    const res = await apiClient.get(`/festival-collections/${id}/report`);
    return res.data;
  },

  downloadContributionReceipt: async (collectionId, contributionId) => {
    const res = await apiClient.get(
      `/festival-collections/${collectionId}/contributions/${contributionId}/receipt`,
      { responseType: 'blob' }
    );
    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt-${contributionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
