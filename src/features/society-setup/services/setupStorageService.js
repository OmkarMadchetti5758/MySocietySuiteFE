/**
 * Setup Storage Service
 * Fully dynamic — communicates directly with MongoDB via setupApi.
 * NO wizard data or drafts are saved to localStorage.
 */

import { SETUP_STATUS } from '../constants/setupConstants';
import { setupApi } from './setupApi';

// Automatically purge any stale setup drafts from localStorage from previous versions
const purgeLegacyStorage = (societyId) => {
  try {
    const keysToRemove = [
      'msquare_society_setup_draft',
      'msquare_society_setup_step',
      `msquare_society_setup_draft_${societyId}`,
      `msquare_society_setup_step_${societyId}`,
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    // ignore
  }
};

export const setupStorageService = {
  /**
   * Retrieves current setup status for the society synchronously from user profile session
   */
  getSetupStatus: (societyId = 'default') => {
    try {
      purgeLegacyStorage(societyId);
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const user = JSON.parse(rawUser);
        if (user.setupStatus) return user.setupStatus;
      }
      return SETUP_STATUS.IN_PROGRESS;
    } catch (err) {
      return SETUP_STATUS.IN_PROGRESS;
    }
  },

  /**
   * Fetches real-time status from backend MongoDB
   */
  fetchSetupStatus: async (societyId = 'default') => {
    try {
      purgeLegacyStorage(societyId);
      const res = await setupApi.getStatus();
      return res;
    } catch (err) {
      console.warn('Error fetching setup status from API:', err.message);
      return { setupStatus: setupStorageService.getSetupStatus(societyId) };
    }
  },

  /**
   * Updates the setup status in session user object
   */
  setSetupStatus: (societyId = 'default', status) => {
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const user = JSON.parse(rawUser);
        user.setupStatus = status;
        localStorage.setItem('user', JSON.stringify(user));
      }
      purgeLegacyStorage(societyId);
      return status;
    } catch (err) {
      return status;
    }
  },

  /**
   * Loads the current wizard draft exclusively from MongoDB via setupApi.
   * Does NOT read from or save to localStorage.
   */
  loadSetupDraft: async (societyId = 'default') => {
    purgeLegacyStorage(societyId);

    try {
      const apiDraft = await setupApi.getDraft();
      // console.log('[SetupDraft] API response:', JSON.stringify(apiDraft, null, 2));
      // Always return the API draft if it's a valid object (societyDetails is always present)
      if (apiDraft && typeof apiDraft === 'object') {
        return apiDraft;
      }
    } catch (err) {
      console.error('[SetupDraft] Could not load draft from API:', err?.response?.status, err?.response?.data, err.message);
    }

    // Default empty structure if no data in DB yet
    return {
      currentStep: 1,
      completedSteps: [],
      societyDetails: {},
      propertyInfo: {},
      residentialInventory: [],
      commercialInventory: [],
      parkingConfig: {
        fourWheeler: 0,
        twoWheeler: 0,
        visitor: 0,
        evCharging: 0,
        allocationMethod: 'By Society',
      },
      amenities: [],
      contacts: [],
      documents: [],
    };
  },

  /**
   * Persists wizard draft state directly to MongoDB via API.
   * Does NOT write to localStorage.
   */
  saveSetupDraft: async (societyId = 'default', draftData) => {
    purgeLegacyStorage(societyId);
    try {
      await setupApi.saveDraft(draftData);
      return true;
    } catch (err) {
      console.error('Error saving setup draft to API:', err.message);
      throw err;
    }
  },

  /**
   * Save Step 1 directly to MongoDB
   */
  saveStep1: async (societyDetails) => {
    return setupApi.saveStep1(societyDetails);
  },

  /**
   * Save Step 2 directly to MongoDB
   */
  saveStep2: async (data) => {
    return setupApi.saveStep2(data);
  },

  /**
   * Save Step 3 directly to MongoDB
   */
  saveStep3: async (amenities) => {
    return setupApi.saveStep3(amenities);
  },

  /**
   * Save Step 4 directly to MongoDB
   */
  saveStep4: async (contacts) => {
    return setupApi.saveStep4(contacts);
  },

  /**
   * Save Step 5 directly to MongoDB
   */
  saveStep5: async (documents) => {
    return setupApi.saveStep5(documents);
  },

  /**
   * Final activation step
   * Activates society in MongoDB and auto-generates flats in DB
   */
  activateSociety: async (societyId = 'default', finalizedData) => {
    purgeLegacyStorage(societyId);
    try {
      const res = await setupApi.activateSociety(finalizedData);
      setupStorageService.setSetupStatus(societyId, SETUP_STATUS.COMPLETED);
      return { success: true, data: res };
    } catch (err) {
      console.error('Error activating society:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  /**
   * Reset wizard draft (utility for testing)
   */
  resetSetup: (societyId = 'default') => {
    purgeLegacyStorage(societyId);
    return true;
  },
};
