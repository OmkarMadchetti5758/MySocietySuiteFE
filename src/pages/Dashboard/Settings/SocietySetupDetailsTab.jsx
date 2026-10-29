import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiCheck,
  FiCheckCircle,
  FiInfo,
  FiArrowLeft,
  FiArrowRight,
  FiPhone,
  FiMail,
  FiExternalLink,
  FiSearch,
  FiClock,
  FiFileText,
  FiFolder,
  FiShield,
  FiEye,
  FiEdit2,
  FiX,
  FiSave,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import {
  FaBuilding,
  FaLayerGroup,
  FaCar,
  FaStore,
  FaClipboardCheck,
  FaSyncAlt,
  FaExclamationTriangle,
  FaSwimmer,
  FaDumbbell,
  FaTableTennis,
  FaSpa,
  FaMedkit,
  FaRunning,
  FaHospital,
  FaTools,
  FaBolt,
  FaTint,
  FaRecycle,
  FaUserTie,
  FaShieldAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { MdOutlineSportsTennis, MdOutlineSportsBasketball } from 'react-icons/md';

import { setupApi } from '../../../features/society-setup/services/setupApi';
import {
  formatIndianNumber,
  formatDisplayDate,
  calculateResidentialTotals,
  calculateCommercialTotals,
  calculateParkingTotals,
  calculateAmenityStats,
  calculateContactStats,
  calculateDocumentStats,
} from '../../../features/society-setup/utils/calculations';
import {
  SOCIETY_TYPES,
  PARKING_ALLOCATION_METHODS,
  RESIDENTIAL_PROPERTY_TYPES,
} from '../../../features/society-setup/constants/setupConstants';

// Step Modals for array item additions & edits
import ResidentialModal from '../../../features/society-setup/components/modals/ResidentialModal';
import CommercialModal from '../../../features/society-setup/components/modals/CommercialModal';
import AmenityModal from '../../../features/society-setup/components/modals/AmenityModal';
import ContactModal from '../../../features/society-setup/components/modals/ContactModal';
import UploadDocumentModal from '../../../features/society-setup/components/modals/UploadDocumentModal';

/* ─── Wizard Step Metadata ─── */
const WIZARD_STEPS = Object.freeze([
  {
    step: 1,
    id: 'society_details',
    title: 'Society Details',
    shortTitle: 'Society Details',
    subtitle: 'Legal, registration, official address and primary contact information',
    editable: true,
  },
  {
    step: 2,
    id: 'property_inventory',
    title: 'Property Inventory & Parking',
    shortTitle: 'Inventory & Parking',
    subtitle: 'Project specifications, residential wings, commercial blocks and parking allocation',
    editable: true,
  },
  {
    step: 3,
    id: 'amenities',
    title: 'Amenities',
    shortTitle: 'Amenities',
    subtitle: 'Configured society facilities, clubhouses, sports amenities and booking rules',
    editable: true,
  },
  {
    step: 4,
    id: 'contacts',
    title: 'Society Contacts',
    shortTitle: 'Society Contacts',
    subtitle: 'Management committee members, facility team, emergency and vendor contacts',
    editable: true,
  },
  {
    step: 5,
    id: 'documents',
    title: 'Documents',
    shortTitle: 'Documents',
    subtitle: 'Uploaded compliance certificates, approvals, NOCs and structural plans',
    editable: true,
  },
  {
    step: 6,
    id: 'activation_summary',
    title: 'Activation & Setup Summary',
    shortTitle: 'Setup Summary',
    subtitle: 'Comprehensive audit overview, database records and activation metadata (Read-Only)',
    editable: false,
  },
]);

/* ─── Amenity Icon Helper matching Wizard ─── */
const renderAmenityIcon = (name = '', category = '') => {
  const n = (name + ' ' + category).toLowerCase();
  if (n.includes('pool') || n.includes('swim')) return <FaSwimmer className="text-blue-500" />;
  if (n.includes('gym') || n.includes('fitness')) return <FaDumbbell className="text-purple-500" />;
  if (n.includes('tennis')) return <MdOutlineSportsTennis className="text-emerald-500" />;
  if (n.includes('badminton')) return <MdOutlineSportsTennis className="text-purple-500" />;
  if (n.includes('basketball')) return <MdOutlineSportsBasketball className="text-orange-500" />;
  if (n.includes('yoga') || n.includes('meditation') || n.includes('spa')) return <FaSpa className="text-amber-500" />;
  if (n.includes('mart') || n.includes('store') || n.includes('shop')) return <FaStore className="text-teal-500" />;
  if (n.includes('first aid') || n.includes('medical') || n.includes('clinic')) return <FaMedkit className="text-rose-500" />;
  if (n.includes('track') || n.includes('jogging')) return <FaRunning className="text-emerald-500" />;
  return <FaTableTennis className="text-blue-500" />;
};

/* ─── Contact Icon Helper matching Wizard ─── */
const renderContactIcon = (contactType = '', category = '') => {
  const t = (contactType + ' ' + category).toLowerCase();
  if (t.includes('office') || t.includes('society')) return <FaBuilding className="text-blue-500" />;
  if (t.includes('facility') || t.includes('manager') || t.includes('admin')) return <FaUserTie className="text-emerald-500" />;
  if (t.includes('security') || t.includes('guard')) return <FaShieldAlt className="text-purple-500" />;
  if (t.includes('maintenance') || t.includes('plumb') || t.includes('repair')) return <FaTools className="text-orange-500" />;
  if (t.includes('hospital') || t.includes('doctor') || t.includes('emergency')) return <FaHospital className="text-rose-500" />;
  if (t.includes('electric') || t.includes('power')) return <FaBolt className="text-amber-500" />;
  if (t.includes('water') || t.includes('tanker')) return <FaTint className="text-cyan-500" />;
  if (t.includes('waste') || t.includes('clean') || t.includes('housekeeping')) return <FaRecycle className="text-emerald-500" />;
  return <FaUserTie className="text-gray-500" />;
};

/* ─── Read-Only Information Field Component ─── */
const ReadOnlyField = ({ label, value, icon: Icon, isLink, linkHref }) => {
  const displayVal =
    value !== null && value !== undefined && String(value).trim() !== ''
      ? String(value)
      : '—';

  return (
    <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3.5">
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
        {label}
      </span>
      {isLink && displayVal !== '—' ? (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-bold text-[#EA580C] hover:underline inline-flex items-center gap-1.5 break-all cursor-pointer"
        >
          {Icon && <Icon className="text-xs shrink-0" />}
          <span>{displayVal}</span>
          <FiExternalLink className="text-[10px] shrink-0 opacity-70" />
        </a>
      ) : (
        <div className="text-xs sm:text-sm font-bold text-gray-900 break-words flex items-center gap-1.5">
          {Icon && <Icon className="text-gray-400 text-xs shrink-0" />}
          <span>{displayVal}</span>
        </div>
      )}
    </div>
  );
};

/* ─── Form Input Field Component ─── */
const FormInputField = ({
  label,
  required,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  options = [],
}) => (
  <div>
    <label className="block text-xs font-bold text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 text-rose-900'
            : 'border-gray-200 focus:border-[#EA580C] focus:ring-[#EA580C]'
        }`}
      />
    )}
    {error && <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>}
  </div>
);

/* ─── Section Card Component ─── */
const StepSectionCard = ({ icon: Icon, title, subtitle, countBadge, action, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden mb-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-orange-50/40 via-white to-white border-b border-gray-100">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-[#EA580C] text-white flex items-center justify-center text-sm shadow-xs shadow-orange-500/20 shrink-0">
            <Icon />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-center">
        {countBadge && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#EA580C]">
            {countBadge}
          </span>
        )}
        {action}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ─── Side Overview Card matching StepInfoCard ─── */
const StepSidebarOverview = ({ title, description, stats = [], quickNotes = [] }) => (
  <div className="space-y-5">
    {/* Step Stats Card */}
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0">
          <FiInfo className="text-sm" />
        </div>
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
      </div>

      {description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-4">{description}</p>
      )}

      {stats.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          {stats.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">{s.label}</span>
              <span className="font-bold text-gray-900">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Verification Badge Box */}
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
        <h4 className="font-bold text-gray-900 text-sm">Verified Configuration</h4>
      </div>
      <p className="text-xs text-emerald-800/80 leading-relaxed mb-3">
        Stored in system database as verified society onboarding configuration.
      </p>
      {quickNotes.length > 0 && (
        <ul className="space-y-1.5 pt-2 border-t border-emerald-100">
          {quickNotes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-emerald-900">
              <FiCheck className="text-emerald-600 text-xs mt-0.5 shrink-0 stroke-[3]" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default function SocietySetupDetailsTab() {
  const { societyId: routeSocietyId } = useParams();
  const effectiveSocietyId = routeSocietyId || localStorage.getItem('societyDatabase') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [statusMeta, setStatusMeta] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Phase 2: Edit Mode State
  const [editingStep, setEditingStep] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Local Form Working State for currently edited section
  const [editFormState, setEditFormState] = useState({
    societyDetails: {},
    propertyInfo: {},
    residentialInventory: [],
    commercialInventory: [],
    parkingConfig: {},
    amenities: [],
    contacts: [],
    documents: [],
  });

  // Modal states for Step 2, Step 3, Step 4, Step 5
  const [residentialModalOpen, setResidentialModalOpen] = useState(false);
  const [editingResidential, setEditingResidential] = useState(null);

  const [commercialModalOpen, setCommercialModalOpen] = useState(false);
  const [editingCommercial, setEditingCommercial] = useState(null);

  const [amenityModalOpen, setAmenityModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);

  // View Filter states for Steps 3, 4, 5
  const [amenityFilter, setAmenityFilter] = useState('All');
  const [contactFilter, setContactFilter] = useState('All');
  const [contactSearch, setContactSearch] = useState('');
  const [docFilter, setDocFilter] = useState('All');
  const [docSearch, setDocSearch] = useState('');

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [draftResult, statusResult] = await Promise.allSettled([
          setupApi.getDraft(),
          setupApi.getStatus(),
        ]);

        if (!isMounted) return;

        if (draftResult.status === 'fulfilled' && draftResult.value) {
          setDraftData(draftResult.value);
          // Initialize working form state from draft
          setEditFormState({
            societyDetails: draftResult.value.societyDetails || {},
            propertyInfo: draftResult.value.propertyInfo || {},
            residentialInventory: draftResult.value.residentialInventory || [],
            commercialInventory: draftResult.value.commercialInventory || [],
            parkingConfig: draftResult.value.parkingConfig || {},
            amenities: draftResult.value.amenities || [],
            contacts: draftResult.value.contacts || [],
            documents: draftResult.value.documents || [],
          });
        } else if (draftResult.status === 'rejected') {
          throw draftResult.reason;
        }

        if (statusResult.status === 'fulfilled' && statusResult.value) {
          setStatusMeta(statusResult.value);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load society setup details:', err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to retrieve setup details from backend.';
        setError(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [effectiveSocietyId, refreshKey]);

  /* ─── Derived Calculations (using current active values) ─── */
  const activeData = editingStep !== null ? editFormState : (draftData || {});

  const residentialTotals = useMemo(
    () => calculateResidentialTotals(activeData.residentialInventory || []),
    [activeData.residentialInventory]
  );

  const commercialTotals = useMemo(
    () => calculateCommercialTotals(activeData.commercialInventory || []),
    [activeData.commercialInventory]
  );

  const parkingTotals = useMemo(
    () => calculateParkingTotals(activeData.parkingConfig || {}),
    [activeData.parkingConfig]
  );

  const amenityStats = useMemo(
    () => calculateAmenityStats(activeData.amenities || []),
    [activeData.amenities]
  );

  const contactStats = useMemo(
    () => calculateContactStats(activeData.contacts || []),
    [activeData.contacts]
  );

  const documentStats = useMemo(
    () => calculateDocumentStats(activeData.documents || []),
    [activeData.documents]
  );

  /* ─── Edit Mode Handlers ─── */
  const handleStartEditing = (stepNum) => {
    if (!draftData) return;
    // Populate form state with fresh copy of draft
    setEditFormState({
      societyDetails: { ...(draftData.societyDetails || {}) },
      propertyInfo: { ...(draftData.propertyInfo || {}) },
      residentialInventory: [...(draftData.residentialInventory || [])],
      commercialInventory: [...(draftData.commercialInventory || [])],
      parkingConfig: { ...(draftData.parkingConfig || {}) },
      amenities: [...(draftData.amenities || [])],
      contacts: [...(draftData.contacts || [])],
      documents: [...(draftData.documents || [])],
    });
    setValidationErrors({});
    setEditingStep(stepNum);
  };

  const handleCancelEditing = () => {
    // Revert form state back to persisted draftData
    if (draftData) {
      setEditFormState({
        societyDetails: { ...(draftData.societyDetails || {}) },
        propertyInfo: { ...(draftData.propertyInfo || {}) },
        residentialInventory: [...(draftData.residentialInventory || [])],
        commercialInventory: [...(draftData.commercialInventory || [])],
        parkingConfig: { ...(draftData.parkingConfig || {}) },
        amenities: [...(draftData.amenities || [])],
        contacts: [...(draftData.contacts || [])],
        documents: [...(draftData.documents || [])],
      });
    }
    setValidationErrors({});
    setEditingStep(null);
  };

  const handleStepNavigation = (targetStep) => {
    if (editingStep !== null && editingStep !== targetStep) {
      const confirmDiscard = window.confirm(
        `You have unsaved edits in Step ${editingStep}. Discard changes and proceed to Step ${targetStep}?`
      );
      if (!confirmDiscard) return;
      handleCancelEditing();
    }
    setCurrentStep(targetStep);
  };

  /* ─── Section Save Validation & Execution ─── */
  const handleSaveSection = async (stepNum) => {
    const errors = {};

    if (stepNum === 1) {
      const { societyDetails } = editFormState;
      if (!societyDetails.societyName?.trim()) errors.societyName = 'Society Name is required';
      if (!societyDetails.societyType?.trim()) errors.societyType = 'Society Type is required';
      if (!societyDetails.registrationNumber?.trim()) errors.registrationNumber = 'Registration Number is required';

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Please resolve validation errors before saving.');
        return;
      }

      setIsSaving(true);
      try {
        await setupApi.saveStep1(societyDetails);
        toast.success('Society Details updated successfully!');
        setEditingStep(null);
        handleRefresh();
      } catch (err) {
        console.error('Failed to update Step 1:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to save Society Details.';
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    } else if (stepNum === 2) {
      const { propertyInfo, residentialInventory, commercialInventory, parkingConfig } = editFormState;
      if (!propertyInfo.projectName?.trim()) errors.projectName = 'Project / Property Name is required';
      if (!propertyInfo.developerName?.trim()) errors.developerName = 'Developer / Builder Name is required';
      if (!propertyInfo.totalProjectArea || Number(propertyInfo.totalProjectArea) <= 0) {
        errors.totalProjectArea = 'Valid Total Project Area is required';
      }
      if (residentialInventory.length === 0) {
        errors.residentialInventory = 'At least one residential wing configuration row is required';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Please resolve validation errors before saving.');
        return;
      }

      setIsSaving(true);
      try {
        await setupApi.saveStep2({
          propertyInfo,
          residentialInventory,
          commercialInventory,
          parkingConfig,
        });
        toast.success('Property Inventory & Parking updated successfully!');
        setEditingStep(null);
        handleRefresh();
      } catch (err) {
        console.error('Failed to update Step 2:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to save Property Inventory.';
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    } else if (stepNum === 3) {
      const { amenities } = editFormState;
      setIsSaving(true);
      try {
        await setupApi.saveStep3(amenities);
        toast.success('Amenities updated successfully!');
        setEditingStep(null);
        handleRefresh();
      } catch (err) {
        console.error('Failed to update Step 3:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to save Amenities.';
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    } else if (stepNum === 4) {
      const { contacts } = editFormState;
      setIsSaving(true);
      try {
        await setupApi.saveStep4(contacts);
        toast.success('Society Contacts updated successfully!');
        setEditingStep(null);
        handleRefresh();
      } catch (err) {
        console.error('Failed to update Step 4:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to save Contacts.';
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    } else if (stepNum === 5) {
      const { documents } = editFormState;
      setIsSaving(true);
      try {
        await setupApi.saveStep5(documents);
        toast.success('Compliance Documents updated successfully!');
        setEditingStep(null);
        handleRefresh();
      } catch (err) {
        console.error('Failed to update Step 5:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to save Documents.';
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    }
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-[#EA580C] rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-gray-900">Loading Society Setup Details...</h3>
        <p className="text-xs text-gray-400 mt-1">Retrieving verified setup configuration from database</p>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error || !draftData) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
          <FaExclamationTriangle className="text-xl" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Unable to Load Setup Details</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md">{error || 'No setup data could be retrieved.'}</p>
        <button
          type="button"
          onClick={handleRefresh}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#EA580C] hover:bg-[#d94f09] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <FaSyncAlt className="text-xs" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const {
    societyDetails = {},
    propertyInfo = {},
    residentialInventory = [],
    commercialInventory = [],
    parkingConfig = {},
    amenities = [],
    contacts = [],
    documents = [],
  } = draftData;

  const isCompleted = statusMeta?.isCompleted ?? true;
  const currentStepObj = WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];
  const isEditingCurrentSection = editingStep === currentStep;

  /* ─── Filtered lists for view mode ─── */
  const displayedAmenities = isEditingCurrentSection ? editFormState.amenities : amenities;
  const filteredAmenities = displayedAmenities.filter((a) => {
    if (amenityFilter === 'All') return true;
    return (a.category || '').toLowerCase() === amenityFilter.toLowerCase();
  });
  const amenityCategories = ['All', ...new Set(displayedAmenities.map((a) => a.category).filter(Boolean))];

  const displayedContacts = isEditingCurrentSection ? editFormState.contacts : contacts;
  const filteredContacts = displayedContacts.filter((c) => {
    if (contactFilter !== 'All') {
      const cat = (c.category || '').toLowerCase();
      if (contactFilter === 'Essential' && !cat.includes('essential')) return false;
      if (contactFilter === 'Emergency' && !cat.includes('emergency') && !c.isEmergency) return false;
      if (contactFilter === 'Service' && !cat.includes('service')) return false;
    }
    if (contactSearch.trim()) {
      const q = contactSearch.toLowerCase();
      const name = (c.name || c.nameCompany || '').toLowerCase();
      const desig = (c.designation || c.roleDesignation || '').toLowerCase();
      const phone = (c.phone || c.mobileNumber || '').toLowerCase();
      if (!name.includes(q) && !desig.includes(q) && !phone.includes(q)) return false;
    }
    return true;
  });

  const displayedDocuments = isEditingCurrentSection ? editFormState.documents : documents;
  const filteredDocuments = displayedDocuments.filter((doc) => {
    if (docFilter === 'Mandatory' && !doc.isMandatory) return false;
    if (docFilter === 'Optional' && doc.isMandatory) return false;
    if (docSearch.trim()) {
      const q = docSearch.toLowerCase();
      const title = (doc.documentName || doc.title || '').toLowerCase();
      const desc = (doc.description || '').toLowerCase();
      if (!title.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                editingStep !== null
                  ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {editingStep !== null ? (
                <>
                  <FiEdit2 className="text-xs" />
                  <span>Edit Mode (Step {editingStep})</span>
                </>
              ) : (
                <>
                  <FiEye className="text-xs" />
                  <span>View Mode</span>
                </>
              )}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <FiCheckCircle className="text-xs text-emerald-600" />
              <span>{isCompleted ? 'Setup Completed' : 'Draft Saved'}</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Society Setup Details
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View and manage the verified configuration saved through the 6-step Society Setup Wizard.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {editingStep === null && currentStepObj.editable && (
            <button
              type="button"
              onClick={() => handleStartEditing(currentStep)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#EA580C] hover:bg-[#d94f09] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-[0.98]"
            >
              <FiEdit2 className="text-xs" />
              <span>Edit Step {currentStep}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={editingStep !== null || isSaving}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Refresh setup details"
          >
            <FaSyncAlt className="text-xs text-gray-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Active Editing Notice & Save/Cancel Action Bar ─── */}
      {isEditingCurrentSection && (
        <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0">
              <FiEdit2 className="text-base" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Editing: Step {currentStep} ({currentStepObj.title})
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Make your changes below. Click <strong>Save Changes</strong> to commit updates directly to the database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancelEditing}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <FiX className="text-xs" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveSection(currentStep)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EA580C] hover:bg-[#d94f09] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="text-xs" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Informational Banner when in View Mode ─── */}
      {!isEditingCurrentSection && (
        <div className="p-3.5 sm:p-4 bg-orange-50/60 border border-orange-200/70 rounded-2xl flex items-center justify-between gap-3 text-orange-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
              <FiShield className="text-base" />
            </div>
            <p className="text-xs leading-relaxed font-medium">
              <strong className="font-semibold text-orange-900">Configuration Details:</strong> Review onboarding records or click <strong>Edit</strong> on any section (Steps 1–5) to modify setup parameters.
            </p>
          </div>
          {currentStepObj.editable && (
            <button
              type="button"
              onClick={() => handleStartEditing(currentStep)}
              className="shrink-0 text-xs font-bold text-[#EA580C] hover:underline cursor-pointer flex items-center gap-1"
            >
              <FiEdit2 className="text-xs" />
              <span>Edit this step</span>
            </button>
          )}
        </div>
      )}

      {/* ─── Multi-step Stepper Navigation matching SetupStepper ─── */}
      <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs overflow-x-auto">
        <div className="min-w-[760px] flex items-center justify-between">
          {WIZARD_STEPS.map((s, index) => {
            const isCurrent = s.step === currentStep;
            return (
              <div key={s.step} className="contents">
                {/* Step Item */}
                <button
                  type="button"
                  onClick={() => handleStepNavigation(s.step)}
                  className="flex items-center gap-3 text-left transition-all cursor-pointer hover:opacity-90 group focus:outline-none"
                  title={`View Step ${s.step}: ${s.title}`}
                >
                  {/* Circle Icon / Number */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-[#EA580C] text-white shadow-xs shadow-orange-500/30 ring-2 ring-orange-200'
                        : 'bg-emerald-600 text-white shadow-xs group-hover:bg-emerald-700'
                    }`}
                  >
                    {isCurrent ? s.step : <FiCheck className="text-base stroke-[3]" />}
                  </div>

                  {/* Step Labels */}
                  <div className="flex flex-col">
                    <span
                      className={`text-xs sm:text-sm font-semibold truncate max-w-[130px] ${
                        isCurrent
                          ? 'text-[#EA580C] font-bold'
                          : 'text-gray-900'
                      }`}
                    >
                      {s.shortTitle}
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        isCurrent
                          ? 'text-[#EA580C]'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isCurrent ? (editingStep === s.step ? 'Editing' : 'Viewing') : 'Saved'}
                    </span>
                  </div>
                </button>

                {/* Connecting Line between steps */}
                {index < WIZARD_STEPS.length - 1 && (
                  <div className="flex-1 mx-3 h-[2px] bg-emerald-200 min-w-[20px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Step Navigation Quick Actions ─── */}
      <div className="flex items-center justify-between gap-4">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => handleStepNavigation(currentStep - 1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <FiArrowLeft className="text-gray-500 text-sm" />
            <span>Back to Step {currentStep - 1}</span>
          </button>
        ) : (
          <div />
        )}

        <div className="text-xs text-gray-500 font-medium">
          Step <span className="font-bold text-gray-800">{currentStep}</span> of 6:{' '}
          <span className="font-semibold text-[#EA580C]">{currentStepObj.title}</span>
        </div>

        {currentStep < 6 && (
          <button
            type="button"
            onClick={() => handleStepNavigation(currentStep + 1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-orange-200 bg-orange-50 text-[#EA580C] font-semibold text-xs sm:text-sm hover:bg-orange-100 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <span>Next: Step {currentStep + 1}</span>
            <FiArrowRight className="text-sm" />
          </button>
        )}
      </div>

      {/* ─── Step Title & Description ─── */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Step {currentStep}: {currentStepObj.title}</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{currentStepObj.subtitle}</p>
        </div>

        {currentStepObj.editable && !isEditingCurrentSection && (
          <button
            type="button"
            onClick={() => handleStartEditing(currentStep)}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-[#EA580C] border border-orange-200 font-bold text-xs hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <FiEdit2 className="text-xs" />
            <span>Edit Section</span>
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 1: SOCIETY DETAILS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3 space-y-6">
            {isEditingCurrentSection ? (
              /* ── Step 1: Edit Form ── */
              <div className="space-y-6">
                <StepSectionCard
                  icon={FaBuilding}
                  title="1. Society Legal Information (Editing)"
                  subtitle="Official registered identity and government records"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInputField
                      label="Society Name"
                      required
                      value={editFormState.societyDetails.societyName}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, societyName: v },
                        }))
                      }
                      placeholder="e.g. Green Valley Residency"
                      error={validationErrors.societyName}
                    />

                    <FormInputField
                      label="Society Type"
                      required
                      type="select"
                      value={editFormState.societyDetails.societyType}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, societyType: v },
                        }))
                      }
                      options={SOCIETY_TYPES}
                      error={validationErrors.societyType}
                    />

                    <FormInputField
                      label="Registration Number"
                      required
                      value={editFormState.societyDetails.registrationNumber}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, registrationNumber: v },
                        }))
                      }
                      placeholder="e.g. GVR/2025/001"
                      error={validationErrors.registrationNumber}
                    />

                    <FormInputField
                      label="Registration Date"
                      type="date"
                      value={editFormState.societyDetails.registrationDate || ''}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, registrationDate: v },
                        }))
                      }
                    />

                    <FormInputField
                      label="Society Code / ID"
                      value={editFormState.societyDetails.societyCode}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, societyCode: v },
                        }))
                      }
                      placeholder="e.g. GVR-01"
                    />
                  </div>
                </StepSectionCard>

                <StepSectionCard
                  icon={FaMapMarkerAlt}
                  title="2. Society Physical Address (Editing)"
                  subtitle="Official postal location and communication address"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 lg:col-span-3">
                      <FormInputField
                        label="Street Address / Premises"
                        value={editFormState.societyDetails.streetAddress}
                        onChange={(v) =>
                          setEditFormState((prev) => ({
                            ...prev,
                            societyDetails: { ...prev.societyDetails, streetAddress: v },
                          }))
                        }
                        placeholder="e.g. 124 Main Residency Road"
                      />
                    </div>
                    <FormInputField
                      label="City"
                      value={editFormState.societyDetails.city}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, city: v },
                        }))
                      }
                      placeholder="e.g. Mumbai"
                    />
                    <FormInputField
                      label="State"
                      value={editFormState.societyDetails.state}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, state: v },
                        }))
                      }
                      placeholder="e.g. Maharashtra"
                    />
                    <FormInputField
                      label="Postal / Pincode"
                      value={editFormState.societyDetails.pincode}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, pincode: v },
                        }))
                      }
                      placeholder="e.g. 400001"
                    />
                  </div>
                </StepSectionCard>

                <StepSectionCard
                  icon={FiPhone}
                  title="3. Official Society Contact Details (Editing)"
                  subtitle="Primary administrative email and telephone communication channels"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInputField
                      label="Official Email Address"
                      type="email"
                      value={editFormState.societyDetails.contactEmail}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, contactEmail: v },
                        }))
                      }
                      placeholder="e.g. contact@greenvalley.com"
                    />
                    <FormInputField
                      label="Official Contact Phone"
                      type="tel"
                      value={editFormState.societyDetails.contactPhone}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, contactPhone: v },
                        }))
                      }
                      placeholder="e.g. +91 9876543210"
                    />
                    <FormInputField
                      label="Alternate Contact Phone"
                      type="tel"
                      value={editFormState.societyDetails.alternatePhone}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          societyDetails: { ...prev.societyDetails, alternatePhone: v },
                        }))
                      }
                      placeholder="e.g. +91 9876543211"
                    />
                  </div>
                </StepSectionCard>
              </div>
            ) : (
              /* ── Step 1: View Mode ── */
              <div className="space-y-6">
                <StepSectionCard
                  icon={FaBuilding}
                  title="1. Society Legal Information"
                  subtitle="Official registered identity and government records"
                  countBadge={societyDetails.status || 'Active'}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <ReadOnlyField label="Society Name" value={societyDetails.societyName} />
                    <ReadOnlyField label="Society Type" value={societyDetails.societyType} />
                    <ReadOnlyField label="Registration Number" value={societyDetails.registrationNumber} />
                    <ReadOnlyField label="Registration Date" value={formatDisplayDate(societyDetails.registrationDate)} />
                    <ReadOnlyField label="Society Code / ID" value={societyDetails.societyCode} />
                    <ReadOnlyField label="Registration Status" value={societyDetails.status || 'Active'} />
                  </div>
                </StepSectionCard>

                <StepSectionCard
                  icon={FaMapMarkerAlt}
                  title="2. Society Physical Address"
                  subtitle="Official postal location and communication address"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2 lg:col-span-3">
                      <ReadOnlyField
                        label="Street Address / Premises"
                        value={societyDetails.streetAddress}
                        icon={FaMapMarkerAlt}
                      />
                    </div>
                    <ReadOnlyField label="City" value={societyDetails.city} />
                    <ReadOnlyField label="State" value={societyDetails.state} />
                    <ReadOnlyField label="Postal / Pincode" value={societyDetails.pincode} />
                    <ReadOnlyField label="Country" value={societyDetails.country || 'India'} />
                  </div>
                </StepSectionCard>

                <StepSectionCard
                  icon={FiPhone}
                  title="3. Official Society Contact Details"
                  subtitle="Primary email and telephone channels for administrative communication"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <ReadOnlyField
                      label="Official Email Address"
                      value={societyDetails.contactEmail}
                      icon={FiMail}
                      isLink={Boolean(societyDetails.contactEmail)}
                      linkHref={`mailto:${societyDetails.contactEmail}`}
                    />
                    <ReadOnlyField
                      label="Official Contact Phone"
                      value={societyDetails.contactPhone}
                      icon={FiPhone}
                      isLink={Boolean(societyDetails.contactPhone)}
                      linkHref={`tel:${societyDetails.contactPhone}`}
                    />
                    <ReadOnlyField
                      label="Alternate Contact Phone"
                      value={societyDetails.alternatePhone}
                      icon={FiPhone}
                      isLink={Boolean(societyDetails.alternatePhone)}
                      linkHref={`tel:${societyDetails.alternatePhone}`}
                    />
                  </div>
                </StepSectionCard>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <StepSidebarOverview
              title="About Society Details"
              description="Legal registration records and physical premises verified during society onboarding."
              stats={[
                { label: 'Society Type', value: activeData.societyDetails?.societyType || '—' },
                { label: 'State / Region', value: activeData.societyDetails?.state || '—' },
                { label: 'Postal Code', value: activeData.societyDetails?.pincode || '—' },
                { label: 'Status', value: activeData.societyDetails?.status || 'Active' },
              ]}
              quickNotes={[
                'Government registration number recorded',
                'Official administrative email verified',
                'Postal address configured',
              ]}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 2: PROPERTY INVENTORY & PARKING */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3 space-y-6">
            {isEditingCurrentSection ? (
              /* ── Step 2: Edit Form ── */
              <div className="space-y-6">
                {/* 1. Property Specifications */}
                <StepSectionCard
                  icon={FaBuilding}
                  title="1. Project & Property Specifications (Editing)"
                  subtitle="Developer credentials, project timelines, and total plot area"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInputField
                      label="Project / Property Name"
                      required
                      value={editFormState.propertyInfo.projectName}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, projectName: v },
                        }))
                      }
                      placeholder="e.g. Green Valley Residency"
                      error={validationErrors.projectName}
                    />

                    <FormInputField
                      label="Developer / Builder Name"
                      required
                      value={editFormState.propertyInfo.developerName}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, developerName: v },
                        }))
                      }
                      placeholder="e.g. Green Valley Developers Pvt. Ltd."
                      error={validationErrors.developerName}
                    />

                    <FormInputField
                      label="Property Type"
                      type="select"
                      value={editFormState.propertyInfo.propertyType}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, propertyType: v },
                        }))
                      }
                      options={RESIDENTIAL_PROPERTY_TYPES}
                    />

                    <FormInputField
                      label="Total Project Area (sq ft)"
                      required
                      type="number"
                      value={editFormState.propertyInfo.totalProjectArea}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, totalProjectArea: v },
                        }))
                      }
                      placeholder="e.g. 1350000"
                      error={validationErrors.totalProjectArea}
                    />

                    <FormInputField
                      label="Total Developed Area (sq ft)"
                      type="number"
                      value={editFormState.propertyInfo.totalDevelopedArea}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, totalDevelopedArea: v },
                        }))
                      }
                      placeholder="e.g. 1000000"
                    />

                    <FormInputField
                      label="Number of Wings / Buildings"
                      type="number"
                      value={editFormState.propertyInfo.numberOfBuildings}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, numberOfBuildings: v },
                        }))
                      }
                    />

                    <FormInputField
                      label="Project Start Date"
                      type="date"
                      value={editFormState.propertyInfo.projectStartDate || ''}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, projectStartDate: v },
                        }))
                      }
                    />

                    <FormInputField
                      label="Expected Completion Date"
                      type="date"
                      value={editFormState.propertyInfo.expectedCompletionDate || ''}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, expectedCompletionDate: v },
                        }))
                      }
                    />

                    <FormInputField
                      label="Possession Start Date"
                      type="date"
                      value={editFormState.propertyInfo.possessionStartDate || ''}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          propertyInfo: { ...prev.propertyInfo, possessionStartDate: v },
                        }))
                      }
                    />
                  </div>
                </StepSectionCard>

                {/* 2. Residential Inventory Rows with Add/Edit/Delete */}
                <StepSectionCard
                  icon={FaLayerGroup}
                  title="2. Residential Inventory (Editing)"
                  subtitle="Configured residential wings, unit counts, and carpet areas"
                  countBadge={`${editFormState.residentialInventory.length} Wings`}
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setEditingResidential(null);
                        setResidentialModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#d94f09] transition-all cursor-pointer"
                    >
                      <FiPlus className="text-xs" />
                      <span>Add Wing</span>
                    </button>
                  }
                >
                  {validationErrors.residentialInventory && (
                    <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
                      {validationErrors.residentialInventory}
                    </div>
                  )}

                  {editFormState.residentialInventory.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No residential inventory configured. Click <strong>Add Wing</strong> to create a wing.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-3">Wing</th>
                            <th className="py-3 px-3 text-center">Floors</th>
                            <th className="py-3 px-3 text-center">Flats / Floor</th>
                            <th className="py-3 px-3 text-center">Total Units</th>
                            <th className="py-3 px-3">Configuration</th>
                            <th className="py-3 px-3 text-right">Carpet Area</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                          {editFormState.residentialInventory.map((row, idx) => (
                            <tr key={row.id || idx} className="hover:bg-orange-50/20 transition-colors">
                              <td className="py-3 px-3 font-bold text-gray-900">Wing {row.wing}</td>
                              <td className="py-3 px-3 text-center">{row.totalFloors || '—'}</td>
                              <td className="py-3 px-3 text-center">{row.unitsPerFloor || '—'}</td>
                              <td className="py-3 px-3 text-center font-bold text-gray-900">{row.unitCount}</td>
                              <td className="py-3 px-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#EA580C] border border-orange-200">
                                  {row.configuration}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">{formatIndianNumber(row.carpetArea)} sq ft</td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingResidential(row);
                                      setResidentialModalOpen(true);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Wing"
                                  >
                                    <FiEdit2 className="text-xs" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditFormState((prev) => ({
                                        ...prev,
                                        residentialInventory: prev.residentialInventory.filter((_, i) => i !== idx),
                                      }));
                                    }}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Wing"
                                  >
                                    <FiTrash2 className="text-xs" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </StepSectionCard>

                {/* 3. Commercial Inventory Rows with Add/Edit/Delete */}
                <StepSectionCard
                  icon={FaStore}
                  title="3. Commercial Inventory (Editing)"
                  subtitle="Configured retail shops, corporate offices, and commercial spaces"
                  countBadge={`${editFormState.commercialInventory.length} Units`}
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommercial(null);
                        setCommercialModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#d94f09] transition-all cursor-pointer"
                    >
                      <FiPlus className="text-xs" />
                      <span>Add Commercial Unit</span>
                    </button>
                  }
                >
                  {editFormState.commercialInventory.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No commercial inventory. Click <strong>Add Commercial Unit</strong> if applicable.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-3">Block</th>
                            <th className="py-3 px-3">Type</th>
                            <th className="py-3 px-3 text-center">Unit Count</th>
                            <th className="py-3 px-3 text-right">Avg Unit Size</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                          {editFormState.commercialInventory.map((row, idx) => (
                            <tr key={row.id || idx} className="hover:bg-orange-50/20 transition-colors">
                              <td className="py-3 px-3 font-bold text-gray-900">{row.block}</td>
                              <td className="py-3 px-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  {row.commercialType || row.unitType}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-gray-900">{row.unitCount}</td>
                              <td className="py-3 px-3 text-right">{formatIndianNumber(row.unitSize)} sq ft</td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCommercial(row);
                                      setCommercialModalOpen(true);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Commercial Row"
                                  >
                                    <FiEdit2 className="text-xs" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditFormState((prev) => ({
                                        ...prev,
                                        commercialInventory: prev.commercialInventory.filter((_, i) => i !== idx),
                                      }));
                                    }}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Commercial Row"
                                  >
                                    <FiTrash2 className="text-xs" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </StepSectionCard>

                {/* 4. Parking Configuration */}
                <StepSectionCard
                  icon={FaCar}
                  title="4. Parking Capacity & Allocation (Editing)"
                  subtitle="Vehicle parking inventory, visitor parking, and EV charging provisions"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInputField
                      label="Allocation Method"
                      type="select"
                      value={editFormState.parkingConfig.allocationMethod}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          parkingConfig: { ...prev.parkingConfig, allocationMethod: v },
                        }))
                      }
                      options={PARKING_ALLOCATION_METHODS}
                    />

                    <FormInputField
                      label="4-Wheeler Slots"
                      type="number"
                      value={editFormState.parkingConfig.fourWheeler}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          parkingConfig: { ...prev.parkingConfig, fourWheeler: Number(v) || 0 },
                        }))
                      }
                    />

                    <FormInputField
                      label="2-Wheeler Slots"
                      type="number"
                      value={editFormState.parkingConfig.twoWheeler}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          parkingConfig: { ...prev.parkingConfig, twoWheeler: Number(v) || 0 },
                        }))
                      }
                    />

                    <FormInputField
                      label="Visitor Parking Slots"
                      type="number"
                      value={editFormState.parkingConfig.visitor}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          parkingConfig: { ...prev.parkingConfig, visitor: Number(v) || 0 },
                        }))
                      }
                    />

                    <FormInputField
                      label="EV Charging Slots"
                      type="number"
                      value={editFormState.parkingConfig.evCharging}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          parkingConfig: { ...prev.parkingConfig, evCharging: Number(v) || 0 },
                        }))
                      }
                    />

                    <FormInputField
                      label="Basement Levels"
                      value={editFormState.parkingConfig.basementLevels}
                      onChange={(v) =>
                        setEditFormState((prev) => ({
                          ...prev,
                          parkingConfig: { ...prev.parkingConfig, basementLevels: v },
                        }))
                      }
                      placeholder="e.g. 2 Levels (B1, B2)"
                    />
                  </div>
                </StepSectionCard>
              </div>
            ) : (
              /* ── Step 2: View Mode ── */
              <div className="space-y-6">
                <StepSectionCard
                  icon={FaBuilding}
                  title="1. Project & Property Information"
                  subtitle="Developer credentials, project timelines, and total plot area"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <ReadOnlyField label="Project / Property Name" value={propertyInfo.projectName} />
                    <ReadOnlyField label="Developer / Builder Name" value={propertyInfo.developerName} />
                    <ReadOnlyField label="Property Type" value={propertyInfo.propertyType} />
                    <ReadOnlyField label="Number of Buildings / Wings" value={propertyInfo.numberOfBuildings} />
                    <ReadOnlyField
                      label="Total Project Area"
                      value={propertyInfo.totalProjectArea ? `${formatIndianNumber(propertyInfo.totalProjectArea)} sq ft` : '—'}
                    />
                    <ReadOnlyField
                      label="Total Developed Area"
                      value={propertyInfo.totalDevelopedArea ? `${formatIndianNumber(propertyInfo.totalDevelopedArea)} sq ft` : '—'}
                    />
                    <ReadOnlyField label="Project Start Date" value={formatDisplayDate(propertyInfo.projectStartDate)} />
                    <ReadOnlyField label="Expected Completion Date" value={formatDisplayDate(propertyInfo.expectedCompletionDate)} />
                    <ReadOnlyField label="Actual Completion Date" value={formatDisplayDate(propertyInfo.actualCompletionDate)} />
                    <ReadOnlyField label="Possession Start Date" value={formatDisplayDate(propertyInfo.possessionStartDate)} />
                  </div>
                </StepSectionCard>

                <StepSectionCard
                  icon={FaLayerGroup}
                  title="2. Residential Inventory"
                  subtitle="Configured residential wings, floor counts, flat numbering, and BHK distribution"
                  countBadge={`${residentialTotals.totalUnits} Units in ${residentialTotals.totalWings} Wings`}
                >
                  {residentialInventory.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No residential inventory configured.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-3">Wing</th>
                            <th className="py-3 px-3 text-center">Floors</th>
                            <th className="py-3 px-3 text-center">Units / Floor</th>
                            <th className="py-3 px-3 text-center">Total Units</th>
                            <th className="py-3 px-3">BHK Configurations</th>
                            <th className="py-3 px-3 text-right">Carpet Area</th>
                            <th className="py-3 px-3 text-right">Built-Up Area</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                          {residentialInventory.map((row, idx) => (
                            <tr key={idx} className="hover:bg-orange-50/20 transition-colors">
                              <td className="py-3 px-3 font-bold text-gray-900 flex items-center gap-1.5">
                                <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#EA580C] text-[11px] font-extrabold flex items-center justify-center">
                                  {row.wing || `W${idx + 1}`}
                                </span>
                                <span>Wing {row.wing || idx + 1}</span>
                              </td>
                              <td className="py-3 px-3 text-center font-semibold text-gray-700">{row.totalFloors || '—'}</td>
                              <td className="py-3 px-3 text-center text-gray-600">{row.unitsPerFloor || '—'}</td>
                              <td className="py-3 px-3 text-center font-bold text-gray-900">{row.unitCount || '—'}</td>
                              <td className="py-3 px-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#EA580C] border border-orange-200">
                                  {row.configuration || 'Residential Unit'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right text-gray-600">
                                {row.carpetArea ? `${formatIndianNumber(row.carpetArea)} sq ft` : '—'}
                              </td>
                              <td className="py-3 px-3 text-right text-gray-600">
                                {row.builtUpArea ? `${formatIndianNumber(row.builtUpArea)} sq ft` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </StepSectionCard>

                <StepSectionCard
                  icon={FaStore}
                  title="3. Commercial Inventory"
                  subtitle="Configured retail shops, corporate offices, and commercial spaces"
                  countBadge={`${commercialTotals.totalCommercialUnits} Commercial Units`}
                >
                  {commercialInventory.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No commercial inventory configured for this society.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-3">Block / Complex</th>
                            <th className="py-3 px-3">Commercial Unit Type</th>
                            <th className="py-3 px-3 text-center">Number of Units</th>
                            <th className="py-3 px-3 text-right">Avg Unit Size</th>
                            <th className="py-3 px-3 text-right">Total Built-Up Area</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                          {commercialInventory.map((row, idx) => (
                            <tr key={idx} className="hover:bg-orange-50/20 transition-colors">
                              <td className="py-3 px-3 font-bold text-gray-900">
                                Block {row.block || row.wing || idx + 1}
                              </td>
                              <td className="py-3 px-3">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  {row.commercialType || row.unitType || 'Commercial'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-gray-900">
                                {row.unitCount || '—'}
                              </td>
                              <td className="py-3 px-3 text-right text-gray-600">
                                {row.unitSize ? `${formatIndianNumber(row.unitSize)} sq ft` : '—'}
                              </td>
                              <td className="py-3 px-3 text-right font-semibold text-gray-900">
                                {row.unitCount && row.unitSize
                                  ? `${formatIndianNumber(Number(row.unitCount) * Number(row.unitSize))} sq ft`
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </StepSectionCard>

                <StepSectionCard
                  icon={FaCar}
                  title="4. Parking Capacity & Allocation"
                  subtitle="Vehicle parking inventory, visitor parking, and EV charging provisions"
                  countBadge={`${parkingTotals.totalCapacity} Total Spaces`}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                    <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-center">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase block mb-1">4-Wheeler Slots</span>
                      <span className="text-lg font-extrabold text-gray-900">{parkingTotals.fourWheeler}</span>
                    </div>
                    <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-center">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase block mb-1">2-Wheeler Slots</span>
                      <span className="text-lg font-extrabold text-gray-900">{parkingTotals.twoWheeler}</span>
                    </div>
                    <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-center">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase block mb-1">Visitor Parking</span>
                      <span className="text-lg font-extrabold text-gray-900">{parkingTotals.visitor}</span>
                    </div>
                    <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-center">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase block mb-1">EV Charging Slots</span>
                      <span className="text-lg font-extrabold text-gray-900">{parkingTotals.evCharging}</span>
                    </div>
                    <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl p-3 text-center">
                      <span className="text-[11px] font-semibold text-orange-900 uppercase block mb-1">Total Capacity</span>
                      <span className="text-lg font-extrabold text-[#EA580C]">{parkingTotals.totalCapacity}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                    <ReadOnlyField label="Allocation Method" value={parkingConfig.allocationMethod || 'By Society'} />
                    <ReadOnlyField label="Stilt Parking Available" value={parkingConfig.stiltAvailable ? 'Yes' : 'No'} />
                    <ReadOnlyField label="Open Parking Available" value={parkingConfig.openAvailable ? 'Yes' : 'No'} />
                    <ReadOnlyField label="Basement Levels" value={parkingConfig.basementLevels || 'None'} />
                  </div>
                </StepSectionCard>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <StepSidebarOverview
              title="Inventory Overview"
              description="Real estate inventory, residential wing configurations and dedicated vehicle parking."
              stats={[
                { label: 'Residential Flats', value: formatIndianNumber(residentialTotals.totalUnits) },
                { label: 'Residential Wings', value: residentialTotals.totalWings },
                { label: 'Commercial Units', value: formatIndianNumber(commercialTotals.totalCommercialUnits) },
                { label: 'Parking Capacity', value: formatIndianNumber(parkingTotals.totalCapacity) },
                {
                  label: 'Total Developed Area',
                  value: activeData.propertyInfo?.totalDevelopedArea
                    ? `${formatIndianNumber(activeData.propertyInfo.totalDevelopedArea)} sq ft`
                    : '—',
                },
              ]}
              quickNotes={[
                'Flat counts mapped to physical wings',
                'Parking allocations configured',
                'Commercial zones registered',
              ]}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 3: AMENITIES */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3 space-y-6">
            <StepSectionCard
              icon={FaSwimmer}
              title={isEditingCurrentSection ? 'Configured Amenities (Editing)' : 'Configured Society Amenities'}
              subtitle="Recreational spaces, sporting facilities, clubhouses and booking rules"
              countBadge={`${displayedAmenities.length} Total Amenities`}
              action={
                isEditingCurrentSection && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAmenity(null);
                      setAmenityModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#d94f09] transition-all cursor-pointer"
                  >
                    <FiPlus className="text-xs" />
                    <span>Add Amenity</span>
                  </button>
                )
              }
            >
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                {amenityCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAmenityFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      amenityFilter.toLowerCase() === cat.toLowerCase()
                        ? 'bg-[#EA580C] text-white shadow-xs font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredAmenities.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No amenities found. Click <strong>Add Amenity</strong> to add facilities.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAmenities.map((amenity, idx) => (
                    <div
                      key={amenity.id || idx}
                      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs hover:border-orange-200 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg shrink-0">
                            {renderAmenityIcon(amenity.name, amenity.category)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                (amenity.status || 'Active').toLowerCase() === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {amenity.status || 'Active'}
                            </span>
                            {isEditingCurrentSection && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditFormState((prev) => ({
                                    ...prev,
                                    amenities: prev.amenities.filter((_, i) => i !== idx),
                                  }));
                                }}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Delete Amenity"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 mb-1">{amenity.name}</h4>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600 mb-3">
                          {amenity.category || 'General'}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-gray-100 space-y-1 text-[11px] text-gray-500">
                        <div className="flex justify-between">
                          <span>Booking Mode:</span>
                          <span className="font-semibold text-gray-800">
                            {amenity.bookable ? 'Slot Booking Required' : 'Open Access'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Usage Charges:</span>
                          <span className="font-semibold text-gray-800">
                            {amenity.chargesApplicable ? 'Paid Facility' : 'Complimentary'}
                          </span>
                        </div>
                        {isEditingCurrentSection && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAmenity(amenity);
                                setAmenityModalOpen(true);
                              }}
                              className="w-full py-1 text-center text-xs font-semibold text-blue-600 bg-blue-50/60 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            >
                              Edit Amenity Details
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </StepSectionCard>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <StepSidebarOverview
              title="Amenity Statistics"
              description="Facilities available for residents, maintenance tracking and clubhouse bookings."
              stats={[
                { label: 'Total Configured', value: amenityStats.total },
                { label: 'Active Facilities', value: amenityStats.active },
                { label: 'Bookable Slots', value: amenityStats.bookable },
                { label: 'Chargeable', value: amenityStats.chargeable },
              ]}
              quickNotes={[
                'Amenity master list stored',
                'Booking policies recorded',
                'Complimentary access defined',
              ]}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 4: SOCIETY CONTACTS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3 space-y-6">
            <StepSectionCard
              icon={FaUserTie}
              title={isEditingCurrentSection ? 'Society Directory & Contacts (Editing)' : 'Society Directory & Emergency Contacts'}
              subtitle="Society management committee members, administrative staff, and emergency service providers"
              countBadge={`${displayedContacts.length} Contacts`}
              action={
                isEditingCurrentSection && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingContact(null);
                      setContactModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#d94f09] transition-all cursor-pointer"
                  >
                    <FiPlus className="text-xs" />
                    <span>Add Contact</span>
                  </button>
                )
              }
            >
              {/* Filter Tabs and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {['All', 'Essential', 'Emergency', 'Service'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setContactFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        contactFilter.toLowerCase() === cat.toLowerCase()
                          ? 'bg-[#EA580C] text-white shadow-xs font-bold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search by name, role or phone..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all w-full sm:w-64"
                  />
                </div>
              </div>

              {filteredContacts.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No contacts found. Click <strong>Add Contact</strong> to record society officials.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map((contact, idx) => {
                    const phone = contact.phone || contact.mobileNumber || contact.contactNumber || '';
                    const email = contact.email || contact.emailId || '';
                    const contactName = contact.name || contact.nameCompany || 'Unnamed Official';
                    const designation = contact.designation || contact.roleDesignation || contact.contactType || 'Society Representative';

                    return (
                      <div
                        key={contact.id || idx}
                        className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs hover:border-orange-200 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center text-sm font-bold shrink-0">
                              {renderContactIcon(designation, contact.category)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  (contact.category || '').toLowerCase().includes('emergency') || contact.isEmergency
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {contact.category || 'Essential'}
                              </span>
                              {isEditingCurrentSection && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditFormState((prev) => ({
                                      ...prev,
                                      contacts: prev.contacts.filter((_, i) => i !== idx),
                                    }));
                                  }}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                  title="Delete Contact"
                                >
                                  <FiTrash2 className="text-xs" />
                                </button>
                              )}
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900">{contactName}</h4>
                          <p className="text-xs text-gray-500 font-medium mb-3">{designation}</p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                          {phone ? (
                            <a
                              href={`tel:${phone}`}
                              className="flex items-center gap-2 text-gray-700 hover:text-[#EA580C] font-semibold transition-colors"
                            >
                              <FiPhone className="text-gray-400 text-xs shrink-0" />
                              <span>{phone}</span>
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <FiPhone className="text-gray-300 text-xs shrink-0" />
                              <span>No phone listed</span>
                            </div>
                          )}

                          {email ? (
                            <a
                              href={`mailto:${email}`}
                              className="flex items-center gap-2 text-gray-600 hover:text-[#EA580C] transition-colors truncate"
                            >
                              <FiMail className="text-gray-400 text-xs shrink-0" />
                              <span className="truncate">{email}</span>
                            </a>
                          ) : null}

                          {isEditingCurrentSection && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingContact(contact);
                                  setContactModalOpen(true);
                                }}
                                className="w-full py-1 text-center text-xs font-semibold text-blue-600 bg-blue-50/60 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              >
                                Edit Contact Info
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </StepSectionCard>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <StepSidebarOverview
              title="Contacts Summary"
              description="Key management committee, building maintenance personnel, and emergency helplines."
              stats={[
                { label: 'Total Contacts', value: contactStats.total },
                { label: 'Essential Officers', value: contactStats.essential },
                { label: 'Emergency Hotlines', value: contactStats.emergency },
                { label: 'Service Providers', value: contactStats.serviceProviders },
              ]}
              quickNotes={[
                'Committee members registered',
                'Emergency dispatch numbers saved',
                'Direct call and mail actions available',
              ]}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 5: DOCUMENTS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3 space-y-6">
            <StepSectionCard
              icon={FiFileText}
              title={isEditingCurrentSection ? 'Compliance Documents (Editing)' : 'Compliance Documents & Certificates'}
              subtitle="Official certificates, architectural plans, fire NOC, and legal conveyance papers"
              countBadge={`${displayedDocuments.length} Documents`}
              action={
                isEditingCurrentSection && (
                  <button
                    type="button"
                    onClick={() => setUploadDocModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#d94f09] transition-all cursor-pointer"
                  >
                    <FiPlus className="text-xs" />
                    <span>Upload Document</span>
                  </button>
                )
              }
            >
              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {['All', 'Mandatory', 'Optional'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDocFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        docFilter.toLowerCase() === cat.toLowerCase()
                          ? 'bg-[#EA580C] text-white shadow-xs font-bold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search documents by title..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all w-full sm:w-64"
                  />
                </div>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No documents found matching the filter.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredDocuments.map((doc, idx) => {
                    const isUploaded = Boolean(doc.uploadedBy || doc.fileUrl || doc.fileName || doc.status === 'Verified');
                    const fileUrl = doc.fileUrl || doc.url || null;

                    return (
                      <div
                        key={doc.id || idx}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 p-3 rounded-xl transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EA580C] flex items-center justify-center text-base shrink-0 mt-0.5">
                            <FiFolder />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-gray-900">
                                {doc.documentName || doc.title || `Document ${idx + 1}`}
                              </h4>
                              {doc.isMandatory && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  Mandatory
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isUploaded
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {isUploaded ? 'Uploaded & Verified' : 'Pending Upload'}
                              </span>
                            </div>

                            {doc.description && (
                              <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                            )}

                            {doc.fileName && (
                              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-mono">
                                <span>File: {doc.fileName}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* File Action */}
                        <div className="self-start sm:self-center shrink-0 flex items-center gap-2">
                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-[#EA580C] hover:bg-orange-100 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-orange-200"
                            >
                              <FiExternalLink className="text-xs" />
                              <span>View Document</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">No file attached</span>
                          )}

                          {isEditingCurrentSection && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormState((prev) => ({
                                  ...prev,
                                  documents: prev.documents.filter((_, i) => i !== idx),
                                }));
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Document"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </StepSectionCard>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <StepSidebarOverview
              title="Document Compliance"
              description="Legal audit trail, government certifications and municipal approvals."
              stats={[
                { label: 'Total Records', value: documentStats.total },
                { label: 'Verified Files', value: documentStats.verified },
                { label: 'Mandatory Complete', value: `${documentStats.mandatoryUploaded} / ${documentStats.mandatoryTotal}` },
              ]}
              quickNotes={[
                'Legal documentation audit compliant',
                'Government NOC registrations recorded',
                'Direct read-only file links verified',
              ]}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 6: ACTIVATION & SETUP SUMMARY (Strictly Read-Only) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {currentStep === 6 && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="xl:col-span-3 space-y-6">
            {/* Completion Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <FiCheckCircle className="text-emerald-600 text-xl stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Society Setup Fully Verified & Completed</h4>
                <p className="text-xs text-emerald-800/80 mt-0.5">
                  All onboarding records are active and maintained in the system. This summary is strictly read-only to preserve setup audit integrity.
                </p>
              </div>
            </div>

            {/* Quick KPI Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Flats / Units
                </span>
                <span className="text-base font-extrabold text-gray-900">
                  {formatIndianNumber(residentialTotals.totalUnits)}
                </span>
                <span className="text-[11px] text-gray-400 block">{residentialTotals.totalWings} Wings</span>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Commercial
                </span>
                <span className="text-base font-extrabold text-gray-900">
                  {formatIndianNumber(commercialTotals.totalCommercialUnits)}
                </span>
                <span className="text-[11px] text-gray-400 block">{commercialInventory.length} Blocks</span>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Parking
                </span>
                <span className="text-base font-extrabold text-gray-900">
                  {formatIndianNumber(parkingTotals.totalCapacity)}
                </span>
                <span className="text-[11px] text-gray-400 block">Slots Total</span>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Amenities
                </span>
                <span className="text-base font-extrabold text-gray-900">{amenityStats.total}</span>
                <span className="text-[11px] text-gray-400 block">{amenityStats.active} Active</span>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Contacts
                </span>
                <span className="text-base font-extrabold text-gray-900">{contactStats.total}</span>
                <span className="text-[11px] text-gray-400 block">Listed</span>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                  Documents
                </span>
                <span className="text-base font-extrabold text-gray-900">{documentStats.total}</span>
                <span className="text-[11px] text-gray-400 block">Verified</span>
              </div>
            </div>

            {/* Step Summary Cards with Jump Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 Review */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FaBuilding className="text-[#EA580C]" />
                      <span>1. Society Details</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepNavigation(1)}
                      className="text-xs font-semibold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View / Edit Step 1
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Name:</strong> {societyDetails.societyName || '—'}</div>
                    <div><strong>Type:</strong> {societyDetails.societyType || '—'}</div>
                    <div><strong>Reg No:</strong> {societyDetails.registrationNumber || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Step 2 Review */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FaLayerGroup className="text-[#EA580C]" />
                      <span>2. Inventory & Parking</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepNavigation(2)}
                      className="text-xs font-semibold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View / Edit Step 2
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Residential:</strong> {residentialTotals.totalUnits} Units in {residentialTotals.totalWings} Wings</div>
                    <div><strong>Commercial:</strong> {commercialTotals.totalCommercialUnits} Units</div>
                    <div><strong>Parking:</strong> {parkingTotals.totalCapacity} Total Spaces</div>
                  </div>
                </div>
              </div>

              {/* Step 3 Review */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FaSwimmer className="text-[#EA580C]" />
                      <span>3. Amenities</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepNavigation(3)}
                      className="text-xs font-semibold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View / Edit Step 3
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Total:</strong> {amenityStats.total} Configured Amenities</div>
                    <div><strong>Active:</strong> {amenityStats.active} Operational Facilities</div>
                    <div><strong>Bookable:</strong> {amenityStats.bookable} Facilities</div>
                  </div>
                </div>
              </div>

              {/* Step 4 Review */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FaUserTie className="text-[#EA580C]" />
                      <span>4. Society Contacts</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepNavigation(4)}
                      className="text-xs font-semibold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View / Edit Step 4
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Officials & Staff:</strong> {contactStats.essential} Members</div>
                    <div><strong>Emergency Hotlines:</strong> {contactStats.emergency} Numbers</div>
                    <div><strong>Service Vendors:</strong> {contactStats.serviceProviders} Providers</div>
                  </div>
                </div>
              </div>

              {/* Step 5 Review */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between md:col-span-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FiFileText className="text-[#EA580C]" />
                      <span>5. Compliance Documents</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepNavigation(5)}
                      className="text-xs font-semibold text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View / Edit Step 5
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Mandatory Documents:</strong> {documentStats.mandatoryUploaded} of {documentStats.mandatoryTotal} Uploaded</div>
                    <div><strong>Total Archived:</strong> {documentStats.total} Documents</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Database & Audit Records Card */}
            <StepSectionCard
              icon={FiClock}
              title="System Metadata & Database Verification"
              subtitle="Internal operational database parameters and completion timestamps"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <ReadOnlyField label="Setup Status" value={isCompleted ? 'Completed' : 'Draft In Progress'} />
                <ReadOnlyField label="Current Step Progress" value={statusMeta?.step ? `Step ${statusMeta.step} of 6` : 'Step 6 of 6'} />
                <ReadOnlyField label="Last Saved / Updated" value={formatDisplayDate(statusMeta?.lastSavedAt || draftData?.updatedAt)} />
                <ReadOnlyField label="Target Database ID" value={effectiveSocietyId || 'mysociety_operations'} />
              </div>
            </StepSectionCard>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <StepSidebarOverview
              title="Audit Verification"
              description="Master system audit record. All units and property structures have been initialized."
              stats={[
                { label: 'Setup Status', value: isCompleted ? 'Completed' : 'Draft' },
                { label: 'Total Units', value: formatIndianNumber(residentialTotals.totalUnits + commercialTotals.totalCommercialUnits) },
                { label: 'Parking Slots', value: formatIndianNumber(parkingTotals.totalCapacity) },
                { label: 'Database Sync', value: 'Active' },
              ]}
              quickNotes={[
                'Permanent setup record preserved',
                'Operational database active',
                'View-only protection active',
              ]}
            />
          </div>
        </div>
      )}

      {/* ─── Stepper Footer matching SetupFooter ─── */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => handleStepNavigation(currentStep - 1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <FiArrowLeft className="text-gray-500 text-sm" />
            <span>Previous: Step {currentStep - 1}</span>
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <FaClipboardCheck className="text-[#EA580C] text-sm" />
          <span>Society Setup Details • Step {currentStep} of 6</span>
        </div>

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={() => handleStepNavigation(currentStep + 1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <span>Next: Step {currentStep + 1}</span>
            <FiArrowRight className="text-sm" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleStepNavigation(1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <span>Return to Step 1 (Society Details)</span>
          </button>
        )}
      </div>

      {/* ─── Integrated Sub-modals for editing arrays ─── */}
      <ResidentialModal
        isOpen={residentialModalOpen}
        onClose={() => {
          setResidentialModalOpen(false);
          setEditingResidential(null);
        }}
        editData={editingResidential}
        onSave={(savedRow) => {
          setEditFormState((prev) => {
            let updatedList;
            if (editingResidential) {
              updatedList = prev.residentialInventory.map((item) =>
                (item.id && item.id === editingResidential.id) || item.wing === editingResidential.wing
                  ? savedRow
                  : item
              );
            } else {
              updatedList = [...prev.residentialInventory, savedRow];
            }
            return { ...prev, residentialInventory: updatedList };
          });
          setResidentialModalOpen(false);
          setEditingResidential(null);
        }}
      />

      <CommercialModal
        isOpen={commercialModalOpen}
        onClose={() => {
          setCommercialModalOpen(false);
          setEditingCommercial(null);
        }}
        editData={editingCommercial}
        onSave={(savedRow) => {
          setEditFormState((prev) => {
            let updatedList;
            if (editingCommercial) {
              updatedList = prev.commercialInventory.map((item) =>
                (item.id && item.id === editingCommercial.id) || item.block === editingCommercial.block
                  ? savedRow
                  : item
              );
            } else {
              updatedList = [...prev.commercialInventory, savedRow];
            }
            return { ...prev, commercialInventory: updatedList };
          });
          setCommercialModalOpen(false);
          setEditingCommercial(null);
        }}
      />

      <AmenityModal
        isOpen={amenityModalOpen}
        onClose={() => {
          setAmenityModalOpen(false);
          setEditingAmenity(null);
        }}
        editData={editingAmenity}
        onSave={(savedAmenity) => {
          setEditFormState((prev) => {
            let updatedList;
            if (editingAmenity) {
              updatedList = prev.amenities.map((item) =>
                (item.id && item.id === editingAmenity.id) || item.name === editingAmenity.name
                  ? savedAmenity
                  : item
              );
            } else {
              updatedList = [...prev.amenities, savedAmenity];
            }
            return { ...prev, amenities: updatedList };
          });
          setAmenityModalOpen(false);
          setEditingAmenity(null);
        }}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setEditingContact(null);
        }}
        editData={editingContact}
        onSave={(savedContact) => {
          setEditFormState((prev) => {
            let updatedList;
            if (editingContact) {
              updatedList = prev.contacts.map((item) =>
                (item.id && item.id === editingContact.id) || item.mobileNumber === editingContact.mobileNumber
                  ? savedContact
                  : item
              );
            } else {
              updatedList = [...prev.contacts, savedContact];
            }
            return { ...prev, contacts: updatedList };
          });
          setContactModalOpen(false);
          setEditingContact(null);
        }}
      />

      <UploadDocumentModal
        isOpen={uploadDocModalOpen}
        onClose={() => setUploadDocModalOpen(false)}
        onUpload={(uploadedDoc) => {
          setEditFormState((prev) => ({
            ...prev,
            documents: [uploadedDoc, ...prev.documents],
          }));
          setUploadDocModalOpen(false);
        }}
      />
    </div>
  );
}
