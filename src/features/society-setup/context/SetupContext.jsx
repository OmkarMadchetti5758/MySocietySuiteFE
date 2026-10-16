import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { SETUP_STEPS, SETUP_STATUS } from '../constants/setupConstants';
import { setupStorageService } from '../services/setupStorageService';
import {
  calculateResidentialTotals,
  calculateCommercialTotals,
  calculateParkingTotals,
  calculateOverallInventory,
  calculateAmenityStats,
  calculateContactStats,
  calculateDocumentStats,
} from '../utils/calculations';

const SetupContext = createContext(null);

export const SetupProvider = ({ children, initialSocietyId }) => {
  const navigate = useNavigate();
  const routeParams = useParams();
  const societyId = initialSocietyId || routeParams.societyId || localStorage.getItem('societyDatabase') || 'default';

  // Load draft from service on initialization
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [setupStatus, setSetupStatusState] = useState(() => setupStorageService.getSetupStatus(societyId));
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([1]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Form Entities
  const [societyDetails, setSocietyDetails] = useState({});
  const [propertyInfo, setPropertyInfo] = useState({});
  const [residentialInventory, setResidentialInventory] = useState([]);
  const [commercialInventory, setCommercialInventory] = useState([]);
  const [parkingConfig, setParkingConfig] = useState({});
  const [amenities, setAmenities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Initialize draft from backend API & cache
  useEffect(() => {
    let isMounted = true;
    async function initDraft() {
      try {
        const draft = await setupStorageService.loadSetupDraft(societyId);
        if (isMounted && draft) {
          setCurrentStep(draft.currentStep || 1);
          setCompletedSteps(draft.completedSteps || []);
          setSocietyDetails(draft.societyDetails || {});
          setPropertyInfo(draft.propertyInfo || {});
          setResidentialInventory(draft.residentialInventory || []);
          setCommercialInventory(draft.commercialInventory || []);
          setParkingConfig(draft.parkingConfig || { fourWheeler: 0, twoWheeler: 0, visitor: 0, evCharging: 0, allocationMethod: 'By Society' });
          setAmenities(draft.amenities || []);
          setContacts(draft.contacts || []);
          setDocuments(draft.documents || []);
          if (draft.setupStatus) {
            setSetupStatusState(draft.setupStatus);
          }
        }
      } catch (err) {
        console.error('Error initializing draft:', err);
      } finally {
        if (isMounted) setDraftLoaded(true);
      }
    }
    initDraft();
    return () => {
      isMounted = false;
    };
  }, [societyId]);

  // Derived calculations (purely memoized, no calculations inside JSX)
  const residentialTotals = useMemo(
    () => calculateResidentialTotals(residentialInventory),
    [residentialInventory]
  );

  const commercialTotals = useMemo(
    () => calculateCommercialTotals(commercialInventory),
    [commercialInventory]
  );

  const parkingTotals = useMemo(
    () => calculateParkingTotals(parkingConfig),
    [parkingConfig]
  );

  const overallInventory = useMemo(
    () => calculateOverallInventory(propertyInfo, residentialTotals, commercialTotals, parkingTotals),
    [propertyInfo, residentialTotals, commercialTotals, parkingTotals]
  );

  const amenityStats = useMemo(
    () => calculateAmenityStats(amenities),
    [amenities]
  );

  const contactStats = useMemo(
    () => calculateContactStats(contacts),
    [contacts]
  );

  const documentStats = useMemo(
    () => calculateDocumentStats(documents),
    [documents]
  );

  // Auto-sync parking totals or wing counts when tables change
  useEffect(() => {
    if (!draftLoaded) return;
    if (residentialTotals.totalWings > 0 && propertyInfo.numberOfBuildings !== residentialTotals.totalWings) {
      setPropertyInfo((prev) => ({ ...prev, numberOfBuildings: residentialTotals.totalWings }));
    }
  }, [residentialTotals.totalWings, draftLoaded]);

  // Field updaters
  const updateSocietyDetails = useCallback((updates) => {
    setSocietyDetails((prev) => {
      const next = { ...prev, ...updates };
      setValidationErrors((errs) => ({ ...errs, societyDetails: undefined }));
      return next;
    });
  }, []);

  const updatePropertyInfo = useCallback((updates) => {
    setPropertyInfo((prev) => {
      const next = { ...prev, ...updates };
      setValidationErrors((errs) => ({ ...errs, propertyInfo: undefined }));
      return next;
    });
  }, []);

  const addResidentialRow = useCallback((row) => {
    const newRow = {
      ...row,
      id: row.id || `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setResidentialInventory((prev) => [...prev, newRow]);
  }, []);

  const updateResidentialRow = useCallback((id, updates) => {
    setResidentialInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteResidentialRow = useCallback((id) => {
    setResidentialInventory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addCommercialRow = useCallback((row) => {
    const newRow = {
      ...row,
      id: row.id || `com-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setCommercialInventory((prev) => [...prev, newRow]);
  }, []);

  const updateCommercialRow = useCallback((id, updates) => {
    setCommercialInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteCommercialRow = useCallback((id) => {
    setCommercialInventory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateParkingConfig = useCallback((updates) => {
    setParkingConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const addAmenity = useCallback((amenity) => {
    const newAmenity = {
      ...amenity,
      id: amenity.id || `am-${Date.now()}`,
    };
    setAmenities((prev) => [newAmenity, ...prev]);
  }, []);

  const updateAmenity = useCallback((id, updates) => {
    setAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteAmenity = useCallback((id) => {
    setAmenities((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addContact = useCallback((contact) => {
    const newContact = {
      ...contact,
      id: contact.id || `cnt-${Date.now()}`,
    };
    setContacts((prev) => [newContact, ...prev]);
  }, []);

  const updateContact = useCallback((id, updates) => {
    setContacts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteContact = useCallback((id) => {
    setContacts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addDocument = useCallback((doc) => {
    const newDoc = {
      ...doc,
      id: doc.id || `doc-${Date.now()}`,
      uploadDate: doc.uploadDate || 'Today',
      uploadedBy: doc.uploadedBy || 'Super Admin',
      status: doc.status || 'Verified',
    };
    setDocuments((prev) => [newDoc, ...prev]);
  }, []);

  const updateDocument = useCallback((id, updates) => {
    setDocuments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Step Validation Pure Logic
  const validateCurrentStep = useCallback(
    (stepNum) => {
      const errors = {};
      if (stepNum === 1) {
        if (!societyDetails.societyName?.trim()) errors.societyName = 'Society Name is required';
        if (!societyDetails.societyType?.trim()) errors.societyType = 'Society Type is required';
        if (!societyDetails.registrationNumber?.trim()) errors.registrationNumber = 'Registration Number is required';
      } else if (stepNum === 2) {
        if (!propertyInfo.projectName?.trim()) errors.projectName = 'Project/Property Name is required';
        if (!propertyInfo.developerName?.trim()) errors.developerName = 'Developer/Builder Name is required';
        if (!propertyInfo.totalProjectArea) errors.totalProjectArea = 'Total Project Area is required';
        if (!propertyInfo.numberOfBuildings) errors.numberOfBuildings = 'Number of Buildings is required';
        if (!propertyInfo.propertyType?.trim()) errors.propertyType = 'Property Type is required';
        if (residentialInventory.length === 0) {
          errors.residentialInventory = 'Please add at least one residential configuration row';
        }
      } else if (stepNum === 3) {
        if (amenities.length === 0) {
          errors.amenities = 'Please add at least one amenity for your society';
        }
      } else if (stepNum === 4) {
        if (contacts.length === 0) {
          errors.contacts = 'Please add at least one contact';
        }
      } else if (stepNum === 5) {
        if (documents.length === 0) {
          errors.documents = 'Please upload at least one document';
        }
      }
      return errors;
    },
    [societyDetails, propertyInfo, residentialInventory, amenities, contacts, documents]
  );

  // Navigation handlers
  const goToStep = useCallback(
    (targetStep) => {
      if (targetStep === currentStep) return;
      // Allow navigation to any completed step or the immediate next available step
      const canJump = completedSteps.includes(targetStep) || targetStep <= Math.max(...completedSteps, 1) + 1;
      if (canJump && targetStep >= 1 && targetStep <= 6) {
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error('Please complete earlier steps before skipping forward.');
      }
    },
    [currentStep, completedSteps]
  );

  const nextStep = useCallback(async () => {
    const errors = validateCurrentStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return false;
    }

    setValidationErrors({});
    const newCompleted = Array.from(new Set([...completedSteps, currentStep]));
    setCompletedSteps(newCompleted);

    // Persist current step directly to MongoDB via API
    try {
      if (currentStep === 1) {
        await setupStorageService.saveStep1(societyDetails);
      } else if (currentStep === 2) {
        await setupStorageService.saveStep2({ propertyInfo, residentialInventory, commercialInventory, parkingConfig });
      } else if (currentStep === 3) {
        await setupStorageService.saveStep3(amenities);
      } else if (currentStep === 4) {
        await setupStorageService.saveStep4(contacts);
      } else if (currentStep === 5) {
        await setupStorageService.saveStep5(documents);
      }
    } catch (saveErr) {
      console.warn('Step API save warning:', saveErr.message);
    }

    if (currentStep < 6) {
      const next = currentStep + 1;
      setCurrentStep(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
    return true;
  }, [
    currentStep,
    completedSteps,
    validateCurrentStep,
    societyDetails,
    propertyInfo,
    residentialInventory,
    commercialInventory,
    parkingConfig,
    amenities,
    contacts,
    documents,
  ]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const saveAsDraft = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      const payload = {
        currentStep,
        completedSteps,
        societyDetails,
        propertyInfo,
        residentialInventory,
        commercialInventory,
        parkingConfig,
        amenities,
        contacts,
        documents,
      };
      await setupStorageService.saveSetupDraft(societyId, payload);
      setupStorageService.setSetupStatus(societyId, SETUP_STATUS.IN_PROGRESS);
      setSetupStatusState(SETUP_STATUS.IN_PROGRESS);
      toast.success('Setup draft saved successfully!');
    } catch (err) {
      toast.error('Failed to save draft.');
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    societyId,
    currentStep,
    completedSteps,
    societyDetails,
    propertyInfo,
    residentialInventory,
    commercialInventory,
    parkingConfig,
    amenities,
    contacts,
    documents,
  ]);

  const activateSociety = useCallback(async () => {
    setIsActivating(true);
    try {
      const finalData = {
        societyDetails,
        propertyInfo,
        residentialInventory,
        commercialInventory,
        parkingConfig,
        amenities,
        contacts,
        documents,
      };

      const result = await setupStorageService.activateSociety(societyId, finalData);
      if (result.success) {
        setSetupStatusState(SETUP_STATUS.COMPLETED);
        toast.success('Society Activated Successfully! Welcome to MySocietySuite.');
        // Navigate to the dashboard
        setTimeout(() => {
          navigate(`/${societyId}/dashboard`, { replace: true });
        }, 1200);
      } else {
        toast.error(result.error || 'Failed to activate society.');
      }
    } catch (err) {
      console.error('Activation error:', err);
      toast.error('An unexpected error occurred during activation.');
    } finally {
      setIsActivating(false);
    }
  }, [
    societyId,
    societyDetails,
    propertyInfo,
    residentialInventory,
    commercialInventory,
    parkingConfig,
    amenities,
    contacts,
    documents,
    navigate,
  ]);

  const resetWizard = useCallback(() => {
    setupStorageService.resetSetup(societyId);
    setSetupStatusState(SETUP_STATUS.IN_PROGRESS);
    window.location.reload();
  }, [societyId]);

  const value = {
    societyId,
    currentStep,
    completedSteps,
    setupStatus,
    validationErrors,
    isSavingDraft,
    isActivating,
    isDraftLoading: !draftLoaded,
    steps: SETUP_STEPS,
    // Entities
    societyDetails,
    propertyInfo,
    residentialInventory,
    commercialInventory,
    parkingConfig,
    amenities,
    contacts,
    documents,
    // Pure Derived Totals
    residentialTotals,
    commercialTotals,
    parkingTotals,
    overallInventory,
    amenityStats,
    contactStats,
    documentStats,
    // Actions
    updateSocietyDetails,
    updatePropertyInfo,
    addResidentialRow,
    updateResidentialRow,
    deleteResidentialRow,
    addCommercialRow,
    updateCommercialRow,
    deleteCommercialRow,
    updateParkingConfig,
    addAmenity,
    updateAmenity,
    deleteAmenity,
    addContact,
    updateContact,
    deleteContact,
    addDocument,
    updateDocument,
    deleteDocument,
    goToStep,
    nextStep,
    prevStep,
    saveAsDraft,
    activateSociety,
    resetWizard,
  };

  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>;
};

export const useSetupWizard = () => {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error('useSetupWizard must be used within a SetupProvider');
  }
  return context;
};
