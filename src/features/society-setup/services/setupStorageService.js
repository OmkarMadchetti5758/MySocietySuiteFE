/**
 * Setup Storage Service
 * Isolates local draft persistence, status retrieval, and activation.
 * Designed so that future REST API/DB calls can swap in cleanly without touching UI components.
 */

import { STORAGE_KEYS, SETUP_STATUS } from '../constants/setupConstants';
import {
  INITIAL_SOCIETY_DETAILS,
  INITIAL_PROPERTY_INFO,
  INITIAL_RESIDENTIAL_INVENTORY,
  INITIAL_COMMERCIAL_INVENTORY,
  INITIAL_PARKING_CONFIG,
  INITIAL_AMENITIES,
  INITIAL_CONTACTS,
  INITIAL_DOCUMENTS,
} from '../data/mockSetupData';

export const setupStorageService = {
  /**
   * Retrieves current setup status for the society
   * Returns: "not_started" | "in_progress" | "completed"
   */
  getSetupStatus: (societyId = 'default') => {
    try {
      // TODO: replace with GET /api/societies/:societyId/setup-status
      const stored = localStorage.getItem(`${STORAGE_KEYS.SETUP_STATUS}_${societyId}`);
      if (stored) return stored;

      // Check generic fallback
      const generic = localStorage.getItem(STORAGE_KEYS.SETUP_STATUS);
      if (generic) return generic;

      // Default for new societies
      return SETUP_STATUS.IN_PROGRESS;
    } catch (err) {
      console.warn('Error reading setup status from localStorage:', err);
      return SETUP_STATUS.IN_PROGRESS;
    }
  },

  /**
   * Updates the setup status
   */
  setSetupStatus: (societyId = 'default', status) => {
    try {
      // TODO: replace with PUT /api/societies/:societyId/setup-status
      localStorage.setItem(`${STORAGE_KEYS.SETUP_STATUS}_${societyId}`, status);
      localStorage.setItem(STORAGE_KEYS.SETUP_STATUS, status);
      return status;
    } catch (err) {
      console.error('Error saving setup status to localStorage:', err);
      return status;
    }
  },

  /**
   * Loads the current wizard draft.
   * If no draft is saved yet, returns the default seed data.
   */
  loadSetupDraft: (societyId = 'default') => {
    try {
      // TODO: replace with GET /api/societies/:societyId/setup-draft
      const key = `${STORAGE_KEYS.SETUP_DRAFT}_${societyId}`;
      const saved = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEYS.SETUP_DRAFT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Error reading setup draft from localStorage:', err);
    }

    // Default initial seed data matching the screenshots
    return {
      currentStep: 2, // Matches Screenshot 1 (Property Inventory & Create in progress)
      completedSteps: [1],
      societyDetails: { ...INITIAL_SOCIETY_DETAILS },
      propertyInfo: { ...INITIAL_PROPERTY_INFO },
      residentialInventory: [...INITIAL_RESIDENTIAL_INVENTORY],
      commercialInventory: [...INITIAL_COMMERCIAL_INVENTORY],
      parkingConfig: { ...INITIAL_PARKING_CONFIG },
      amenities: [...INITIAL_AMENITIES],
      contacts: [...INITIAL_CONTACTS],
      documents: [...INITIAL_DOCUMENTS],
    };
  },

  /**
   * Persists wizard draft state
   */
  saveSetupDraft: (societyId = 'default', draftData) => {
    try {
      // TODO: replace with PUT /api/societies/:societyId/setup-draft
      const payload = JSON.stringify(draftData);
      localStorage.setItem(`${STORAGE_KEYS.SETUP_DRAFT}_${societyId}`, payload);
      localStorage.setItem(STORAGE_KEYS.SETUP_DRAFT, payload);
      return true;
    } catch (err) {
      console.error('Error saving setup draft to localStorage:', err);
      return false;
    }
  },

  /**
   * Final activation step
   * Sets setupStatus to "completed" and saves finalized society config
   */
  activateSociety: async (societyId = 'default', finalizedData) => {
    try {
      // TODO: replace with POST /api/societies/:societyId/setup/activate
      setupStorageService.setSetupStatus(societyId, SETUP_STATUS.COMPLETED);

      // Save finalized snapshot
      setupStorageService.saveSetupDraft(societyId, {
        ...finalizedData,
        currentStep: 6,
        completedSteps: [1, 2, 3, 4, 5, 6],
        activatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (err) {
      console.error('Error activating society:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Reset wizard draft (utility for testing / re-running)
   */
  resetSetup: (societyId = 'default') => {
    try {
      localStorage.removeItem(`${STORAGE_KEYS.SETUP_DRAFT}_${societyId}`);
      localStorage.removeItem(`${STORAGE_KEYS.SETUP_STATUS}_${societyId}`);
      localStorage.removeItem(STORAGE_KEYS.SETUP_DRAFT);
      localStorage.removeItem(STORAGE_KEYS.SETUP_STATUS);
      return true;
    } catch (err) {
      console.error('Error resetting setup:', err);
      return false;
    }
  },
};
