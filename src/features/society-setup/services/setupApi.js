import apiClient from '../../../services/apiClient';

export const setupApi = {
  /**
   * Get setup status from backend
   */
  getStatus: async () => {
    const res = await apiClient.get('/societies/setup/status');
    return res.data?.data || res.data;
  },

  /**
   * Load setup draft from backend
   */
  getDraft: async () => {
    const res = await apiClient.get('/societies/setup/draft');
    return res.data?.data || res.data;
  },

  /**
   * Save whole setup draft
   */
  saveDraft: async (draftData) => {
    const res = await apiClient.put('/societies/setup/draft', draftData);
    return res.data?.data || res.data;
  },

  /**
   * Save Step 1: Society Details
   */
  saveStep1: async (societyDetails) => {
    const res = await apiClient.put('/societies/setup/step/1', societyDetails);
    return res.data?.data || res.data;
  },

  /**
   * Save Step 2: Property Inventory
   */
  saveStep2: async ({ propertyInfo, residentialInventory, commercialInventory, parkingConfig }) => {
    const res = await apiClient.put('/societies/setup/step/2', {
      propertyInfo,
      residentialInventory,
      commercialInventory,
      parkingConfig,
    });
    return res.data?.data || res.data;
  },

  /**
   * Save Step 3: Amenities
   */
  saveStep3: async (amenities) => {
    const res = await apiClient.put('/societies/setup/step/3', { amenities });
    return res.data?.data || res.data;
  },

  /**
   * Save Step 4: Contacts
   */
  saveStep4: async (contacts) => {
    const res = await apiClient.put('/societies/setup/step/4', { contacts });
    return res.data?.data || res.data;
  },

  /**
   * Save Step 5: Documents
   */
  saveStep5: async (documents) => {
    const res = await apiClient.put('/societies/setup/step/5', { documents });
    return res.data?.data || res.data;
  },

  /**
   * Step 6: Activate Society
   */
  activateSociety: async (finalData) => {
    const res = await apiClient.post('/societies/setup/activate', finalData);
    return res.data?.data || res.data;
  },

  /**
   * Upload Document File helper
   */
  uploadDocumentFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/societies/setup/upload-doc', formData);
    return res.data?.data || res.data;
  },
};
