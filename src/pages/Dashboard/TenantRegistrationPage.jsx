import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  FileCheck2,
  FileText,
  Plus,
  Trash2,
  UploadCloud,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { tenantApi } from '../../services/tenantApi';
import {
  TENANT_FORM_OPTIONS,
  formatDocumentFileSize,
  resolveTenantViewContext,
} from './tenantMockData';

const MAX_DOCUMENT_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const OPTIONAL_DOC_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Voter ID',
  'Driving Licence',
  'Address Proof',
  'Police Verification Certificate',
  'Owner NOC / Permission Letter',
  'Tenant Photograph',
  'Other Document',
];

const validateFile = (file) => {
  if (!file) return { valid: false, error: 'Please select a file.' };
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext) || (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()))) {
    return { valid: false, error: 'Only JPG, JPEG, PNG, and PDF files are allowed.' };
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    return { valid: false, error: 'File size exceeds maximum limit of 15 MB.' };
  }
  const isImage = ext !== 'pdf' && file.type !== 'application/pdf';
  return { valid: true, error: '', isImage, extension: ext };
};

const createEmptyRequiredDoc = (label) => ({
  label,
  file: null,
  fileName: '',
  fileSize: 0,
  isImage: false,
  extension: '',
  previewUrl: '',
  fileError: '',
});

const createEmptyOptionalDoc = (id) => ({
  id,
  documentType: '',
  otherDocumentName: '',
  file: null,
  fileName: '',
  fileSize: 0,
  isImage: false,
  extension: '',
  previewUrl: '',
  fileError: '',
});

const revokeUrl = (url) => {
  if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
};

const getControlClass = (hasError) =>
  `w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-200 focus:border-[#EA580C] focus:ring-orange-500/20'
  }`;

const FieldLabel = ({ htmlFor, label, required = false }) => (
  <label htmlFor={htmlFor} className="block text-xs font-bold text-gray-700 mb-1.5">
    {label}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const FieldError = ({ message }) =>
  message ? (
    <p role="alert" className="text-xs text-red-500 mt-1 font-medium">
      {message}
    </p>
  ) : null;

const SectionCard = ({ stepNumber, title, subtitle, optional = false, icon: Icon, children }) => (
  <section className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
    <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/40">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#FFF3E8] text-[#EA580C] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-[#0F172A]">
              {stepNumber}. {title}
            </h2>
            {optional && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>

    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

const INITIAL_FORM_DATA = {
  // Section 1: Personal Details
  fullName: '',
  mobileNumber: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  numberOfOccupants: '',
  completeAddress: '',
  emergencyContactNumber: '',

  // Section 2: Professional Details (Optional)
  employmentType: '',
  companyName: '',
  companyDescription: '',
  organizationName: '',
  organizationAddress: '',
  yearOfIncorporation: '',

  // Section 3: Tenancy Details
  flatId: '',
  moveInDate: '',
  monthlyRent: '',
  securityDeposit: '',
  rentDueDay: '',
  petAllowed: false,
  status: 'Active',

  // Section 4: Reference Details (Optional)
  referenceName: '',
  referenceContactNumber: '',
  referenceRelation: '',
};

const TenantRegistrationPage = () => {
  const navigate = useNavigate();
  const { societyId } = useParams();

  const viewContext = useMemo(() => resolveTenantViewContext(), []);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [eligibleFlats, setEligibleFlats] = useState([]);
  const [loadingFlats, setLoadingFlats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Documents state: 2 REQUIRED by default, plus dynamic optional
  const [requiredDocs, setRequiredDocs] = useState({
    identityProof: createEmptyRequiredDoc('Identity Proof'),
    rentalAgreement: createEmptyRequiredDoc('Rental Agreement'),
  });
  const [optionalDocs, setOptionalDocs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  const nextOptionalDocIdRef = useRef(1);
  const previewUrlsRef = useRef(new Set());

  // Clean up object URLs
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach(revokeUrl);
      urls.clear();
    };
  }, []);

  // Fetch eligible vacant flats owned by user
  useEffect(() => {
    let isMounted = true;
    const fetchFlats = async () => {
      try {
        setLoadingFlats(true);
        const res = await tenantApi.getEligibleFlats();
        if (isMounted) {
          const flatsList = res?.data?.flats || res?.flats || [];
          setEligibleFlats(flatsList);
        }
      } catch (err) {
        console.error('Failed to load eligible flats:', err);
        if (isMounted) {
          toast.error('Failed to load eligible flats. Please check your connection.');
        }
      } finally {
        if (isMounted) setLoadingFlats(false);
      }
    };

    fetchFlats();
    return () => {
      isMounted = false;
    };
  }, [societyId]);

  const targetSocietyId = societyId || localStorage.getItem('societyDatabase');
  const listingPath = targetSocietyId
    ? `/${targetSocietyId}/dashboard/tenant`
    : '/dashboard/tenant';

  if (!viewContext.hasAccess) {
    return null;
  }

  const selectedFlat = eligibleFlats.find(
    (flat) => flat._id === formData.flatId || flat.id === formData.flatId
  ) || null;

  const updateField = (field, value, errorKey = field) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleEmploymentTypeChange = (nextType) => {
    setFormData((prev) => ({
      ...prev,
      employmentType: nextType,
      companyName: nextType === 'Salaried' ? prev.companyName : '',
      companyDescription: nextType === 'Salaried' ? prev.companyDescription : '',
      organizationName: nextType === 'Self Employed' ? prev.organizationName : '',
      organizationAddress: nextType === 'Self Employed' ? prev.organizationAddress : '',
      yearOfIncorporation: nextType === 'Self Employed' ? prev.yearOfIncorporation : '',
    }));
  };

  // --- Required Docs Handling ---
  const handleRequiredFileSelection = (docKey, file) => {
    if (!file) return;
    const result = validateFile(file);
    if (!result.valid) {
      setRequiredDocs((prev) => ({
        ...prev,
        [docKey]: { ...prev[docKey], file: null, fileError: result.error },
      }));
      return;
    }

    const previewUrl =
      typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(file)
        : '';
    if (previewUrl) {
      previewUrlsRef.current.add(previewUrl);
    }

    setRequiredDocs((prev) => {
      if (prev[docKey]?.previewUrl) {
        revokeUrl(prev[docKey].previewUrl);
        previewUrlsRef.current.delete(prev[docKey].previewUrl);
      }
      return {
        ...prev,
        [docKey]: {
          ...prev[docKey],
          file,
          fileName: file.name,
          fileSize: file.size,
          isImage: result.isImage,
          extension: result.extension,
          previewUrl,
          fileError: '',
        },
      };
    });

    // Clear error
    if (errors[docKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[docKey];
        return next;
      });
    }
  };

  const handleRemoveRequiredFile = (docKey) => {
    setRequiredDocs((prev) => {
      const current = prev[docKey];
      if (current?.previewUrl) {
        revokeUrl(current.previewUrl);
        previewUrlsRef.current.delete(current.previewUrl);
      }
      return {
        ...prev,
        [docKey]: createEmptyRequiredDoc(current.label),
      };
    });
  };

  // --- Optional Docs Handling ---
  const handleAddOptionalDoc = () => {
    if (optionalDocs.length >= 5) return;
    const newId = `opt-${nextOptionalDocIdRef.current++}`;
    setOptionalDocs((prev) => [...prev, createEmptyOptionalDoc(newId)]);
  };

  const handleRemoveOptionalDoc = (id) => {
    setOptionalDocs((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target?.previewUrl) {
        revokeUrl(target.previewUrl);
        previewUrlsRef.current.delete(target.previewUrl);
      }
      return prev.filter((d) => d.id !== id);
    });
  };

  const handleOptionalDocTypeChange = (id, nextType) => {
    setOptionalDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              documentType: nextType,
              otherDocumentName: nextType === 'Other Document' ? d.otherDocumentName : '',
            }
          : d
      )
    );
  };

  const handleOptionalDocNameChange = (id, name) => {
    setOptionalDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, otherDocumentName: name } : d))
    );
  };

  const handleOptionalFileSelection = (id, file) => {
    if (!file) return;
    const result = validateFile(file);
    if (!result.valid) {
      setOptionalDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, file: null, fileError: result.error } : d))
      );
      return;
    }

    const previewUrl =
      typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(file)
        : '';
    if (previewUrl) {
      previewUrlsRef.current.add(previewUrl);
    }

    setOptionalDocs((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (d.previewUrl) {
          revokeUrl(d.previewUrl);
          previewUrlsRef.current.delete(d.previewUrl);
        }
        return {
          ...d,
          file,
          fileName: file.name,
          fileSize: file.size,
          isImage: result.isImage,
          extension: result.extension,
          previewUrl,
          fileError: '',
        };
      })
    );
  };

  const handleRemoveOptionalFile = (id) => {
    setOptionalDocs((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (d.previewUrl) {
          revokeUrl(d.previewUrl);
          previewUrlsRef.current.delete(d.previewUrl);
        }
        return {
          ...d,
          file: null,
          fileName: '',
          fileSize: 0,
          isImage: false,
          extension: '',
          previewUrl: '',
          fileError: '',
        };
      })
    );
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';

    const cleanMobile = formData.mobileNumber.replace(/[\s-]/g, '').replace(/^\+91/, '');
    if (!cleanMobile) newErrors.mobileNumber = 'Mobile Number is required';
    else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    }

    const cleanEmail = formData.email.trim();
    if (!cleanEmail) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.flatId) newErrors.flatId = 'Please select an eligible vacant flat';
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required';

    if (formData.emergencyContactNumber) {
      const cleanEm = formData.emergencyContactNumber.replace(/[\s-]/g, '').replace(/^\+91/, '');
      if (!/^[6-9]\d{9}$/.test(cleanEm)) {
        newErrors.emergencyContactNumber = 'Enter a valid 10-digit Indian mobile number';
      }
    }

    if (formData.referenceContactNumber) {
      const cleanRef = formData.referenceContactNumber.replace(/[\s-]/g, '').replace(/^\+91/, '');
      if (!/^[6-9]\d{9}$/.test(cleanRef)) {
        newErrors.referenceContactNumber = 'Enter a valid 10-digit Indian mobile number';
      }
    }

    if (formData.rentDueDay) {
      const day = Number(formData.rentDueDay);
      if (isNaN(day) || day < 1 || day > 28) {
        newErrors.rentDueDay = 'Rent due day must be between 1 and 28';
      }
    }

    // Required Documents Check
    if (!requiredDocs.identityProof.file) {
      newErrors.identityProof = 'Identity Proof document is required';
    }
    if (!requiredDocs.rentalAgreement.file) {
      newErrors.rentalAgreement = 'Rental Agreement document is required';
    }

    // Optional docs check
    const optionalErrors = {};
    optionalDocs.forEach((doc) => {
      const rowErr = {};
      if (!doc.documentType) rowErr.documentType = 'Select document type';
      if (doc.documentType === 'Other Document' && !doc.otherDocumentName?.trim()) {
        rowErr.otherDocumentName = 'Document name is required';
      }
      if (!doc.file) rowErr.file = 'Please upload a file';
      if (Object.keys(rowErr).length > 0) {
        optionalErrors[doc.id] = rowErr;
      }
    });

    if (Object.keys(optionalErrors).length > 0) {
      newErrors.optionalDocs = optionalErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted validation errors.');
      return;
    }

    // Prepare Multipart FormData
    const fd = new FormData();
    fd.append('fullName', formData.fullName.trim());
    fd.append('mobileNumber', cleanMobile);
    fd.append('email', cleanEmail);
    fd.append('flatId', formData.flatId);
    fd.append('moveInDate', formData.moveInDate);
    fd.append('status', formData.status || 'Active');

    if (formData.dateOfBirth) fd.append('dateOfBirth', formData.dateOfBirth);
    if (formData.gender) fd.append('gender', formData.gender);
    if (formData.numberOfOccupants) fd.append('numberOfOccupants', formData.numberOfOccupants);
    if (formData.completeAddress?.trim()) fd.append('completeAddress', formData.completeAddress.trim());
    if (formData.emergencyContactNumber?.trim()) {
      fd.append('emergencyContactNumber', formData.emergencyContactNumber.trim());
    }

    if (formData.employmentType) {
      fd.append('employmentType', formData.employmentType);
      if (formData.employmentType === 'Salaried') {
        if (formData.companyName?.trim()) fd.append('companyName', formData.companyName.trim());
        if (formData.companyDescription?.trim()) {
          fd.append('companyDescription', formData.companyDescription.trim());
        }
      } else if (formData.employmentType === 'Self Employed') {
        if (formData.organizationName?.trim()) {
          fd.append('organizationName', formData.organizationName.trim());
        }
        if (formData.organizationAddress?.trim()) {
          fd.append('organizationAddress', formData.organizationAddress.trim());
        }
        if (formData.yearOfIncorporation?.trim()) {
          fd.append('yearOfIncorporation', formData.yearOfIncorporation.trim());
        }
      }
    }

    if (formData.monthlyRent) fd.append('monthlyRent', formData.monthlyRent);
    if (formData.securityDeposit) fd.append('securityDeposit', formData.securityDeposit);
    if (formData.rentDueDay) fd.append('rentDueDay', formData.rentDueDay);
    fd.append('petAllowed', formData.petAllowed ? 'true' : 'false');

    if (formData.referenceName?.trim()) fd.append('referenceName', formData.referenceName.trim());
    if (formData.referenceContactNumber?.trim()) {
      fd.append('referenceContactNumber', formData.referenceContactNumber.trim());
    }
    if (formData.referenceRelation) fd.append('referenceRelation', formData.referenceRelation);

    // Append Required Files
    fd.append('identityProof', requiredDocs.identityProof.file);
    fd.append('rentalAgreement', requiredDocs.rentalAgreement.file);

    // Append Optional Files
    const optionalMeta = [];
    optionalDocs.forEach((doc) => {
      if (doc.file) {
        fd.append('optionalDocs', doc.file);
        optionalMeta.push({
          documentType: doc.documentType,
          otherDocumentName: doc.otherDocumentName || '',
        });
      }
    });
    if (optionalMeta.length > 0) {
      fd.append('optionalDocsMeta', JSON.stringify(optionalMeta));
    }

    try {
      setSubmitting(true);
      await tenantApi.registerTenant(fd);
      toast.success(`${formData.fullName} registered successfully! Activation link sent.`);
      navigate(listingPath);
    } catch (err) {
      console.error('Registration failed:', err);
      const msg = err?.response?.data?.message || err?.message || 'Tenant registration failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(listingPath)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#EA580C] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tenant Management
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            New Tenant Registration
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Register a new tenant for your flat, upload mandatory documents, and send account invitation.
          </p>
        </div>

        {viewContext.isOwner && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#EA580C] border border-orange-100 w-fit">
            Owner Flat View
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Section 1: Personal Details */}
        <SectionCard
          stepNumber={1}
          title="Personal Details"
          subtitle="Basic contact and demographic information of the tenant."
          icon={User}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <FieldLabel htmlFor="tenant-full-name" label="Full Name" required />
                <input
                  id="tenant-full-name"
                  type="text"
                  placeholder="e.g. Rahul Patil"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className={getControlClass(Boolean(errors.fullName))}
                />
                <FieldError message={errors.fullName} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-mobile" label="Mobile Number" required />
                <input
                  id="tenant-mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  maxLength={14}
                  value={formData.mobileNumber}
                  onChange={(e) => updateField('mobileNumber', e.target.value)}
                  className={getControlClass(Boolean(errors.mobileNumber))}
                />
                <FieldError message={errors.mobileNumber} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-email" label="Email" required />
                <input
                  id="tenant-email"
                  type="email"
                  placeholder="e.g. tenant@email.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={getControlClass(Boolean(errors.email))}
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-dob" label="Date of Birth" />
                <input
                  id="tenant-dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className={getControlClass(false)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-gender" label="Gender" />
                <select
                  id="tenant-gender"
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className={getControlClass(false)}
                >
                  <option value="">Select Gender</option>
                  {TENANT_FORM_OPTIONS.genders.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="tenant-occupants" label="Number of Occupants" />
                <input
                  id="tenant-occupants"
                  type="number"
                  min="1"
                  placeholder="e.g. 3"
                  value={formData.numberOfOccupants}
                  onChange={(e) => updateField('numberOfOccupants', e.target.value)}
                  className={getControlClass(false)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-emergency-contact" label="Emergency Contact Number" />
                <input
                  id="tenant-emergency-contact"
                  type="tel"
                  placeholder="e.g. 9823012345"
                  maxLength={14}
                  value={formData.emergencyContactNumber}
                  onChange={(e) => updateField('emergencyContactNumber', e.target.value)}
                  className={getControlClass(Boolean(errors.emergencyContactNumber))}
                />
                <FieldError message={errors.emergencyContactNumber} />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="tenant-address" label="Permanent / Previous Address" />
              <textarea
                id="tenant-address"
                rows={3}
                placeholder="Permanent address or previous residential address..."
                value={formData.completeAddress}
                onChange={(e) => updateField('completeAddress', e.target.value)}
                className={getControlClass(false)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Section 2: Professional Details (Optional) */}
        <SectionCard
          stepNumber={2}
          title="Professional Details"
          subtitle="Employment background for society verification records."
          optional
          icon={Briefcase}
        >
          <div className="space-y-5">
            <div className="max-w-sm">
              <FieldLabel htmlFor="tenant-employment-type" label="Employment Type" />
              <select
                id="tenant-employment-type"
                value={formData.employmentType}
                onChange={(e) => handleEmploymentTypeChange(e.target.value)}
                className={getControlClass(false)}
              >
                <option value="">Select Employment Type</option>
                {TENANT_FORM_OPTIONS.employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {formData.employmentType === 'Salaried' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                <div>
                  <FieldLabel htmlFor="tenant-company-name" label="Company Name" />
                  <input
                    id="tenant-company-name"
                    type="text"
                    placeholder="e.g. Infosys Ltd."
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="tenant-company-desc" label="Company Description / Designation" />
                  <input
                    id="tenant-company-desc"
                    type="text"
                    placeholder="e.g. Software Engineer, IT Services"
                    value={formData.companyDescription}
                    onChange={(e) => updateField('companyDescription', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
              </div>
            )}

            {formData.employmentType === 'Self Employed' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
                <div>
                  <FieldLabel htmlFor="tenant-org-name" label="Organization / Business Name" />
                  <input
                    id="tenant-org-name"
                    type="text"
                    placeholder="e.g. Patil Enterprises"
                    value={formData.organizationName}
                    onChange={(e) => updateField('organizationName', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="tenant-org-address" label="Organization Address" />
                  <input
                    id="tenant-org-address"
                    type="text"
                    placeholder="e.g. FC Road, Pune"
                    value={formData.organizationAddress}
                    onChange={(e) => updateField('organizationAddress', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="tenant-org-year" label="Year of Incorporation" />
                  <input
                    id="tenant-org-year"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="e.g. 2019"
                    value={formData.yearOfIncorporation}
                    onChange={(e) => updateField('yearOfIncorporation', e.target.value)}
                    className={getControlClass(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Section 3: Tenancy Details */}
        <SectionCard
          stepNumber={3}
          title="Tenancy Details"
          subtitle="Assign an owner-allocated vacant flat, move-in date, rent, and occupancy terms."
          icon={Building2}
        >
          <div className="space-y-5">
            {!loadingFlats && eligibleFlats.length === 0 && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-800"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">No eligible vacant flats found</p>
                  <p className="mt-0.5 text-amber-700">
                    Only flats owned by you with a "Vacant" status can be allocated to a new tenant.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <FieldLabel htmlFor="tenant-flat-select" label="Select Flat" required />
                <select
                  id="tenant-flat-select"
                  value={formData.flatId}
                  disabled={loadingFlats || eligibleFlats.length === 0}
                  onChange={(e) => updateField('flatId', e.target.value)}
                  className={`${getControlClass(Boolean(errors.flatId))} disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {loadingFlats
                      ? 'Loading eligible flats...'
                      : eligibleFlats.length === 0
                      ? 'No eligible vacant flats available'
                      : 'Select your vacant flat'}
                  </option>
                  {eligibleFlats.map((flat) => (
                    <option key={flat._id || flat.id} value={flat._id || flat.id}>
                      {flat.flatNumber} — {flat.wing || flat.wingName || 'Wing'} ({flat.occupancyStatus})
                    </option>
                  ))}
                </select>
                <FieldError message={errors.flatId} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-move-in-date" label="Move-in Date" required />
                <input
                  id="tenant-move-in-date"
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => updateField('moveInDate', e.target.value)}
                  className={getControlClass(Boolean(errors.moveInDate))}
                />
                <FieldError message={errors.moveInDate} />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-status" label="Tenancy Status" />
                <select
                  id="tenant-status"
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className={getControlClass(false)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="tenant-monthly-rent" label="Monthly Rent (₹)" />
                <input
                  id="tenant-monthly-rent"
                  type="number"
                  min="0"
                  placeholder="e.g. 20000"
                  value={formData.monthlyRent}
                  onChange={(e) => updateField('monthlyRent', e.target.value)}
                  className={getControlClass(false)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-security-deposit" label="Security Deposit (₹)" />
                <input
                  id="tenant-security-deposit"
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={formData.securityDeposit}
                  onChange={(e) => updateField('securityDeposit', e.target.value)}
                  className={getControlClass(false)}
                />
              </div>

              <div>
                <FieldLabel htmlFor="tenant-rent-due-day" label="Rent Due Day of Month (1–28)" />
                <input
                  id="tenant-rent-due-day"
                  type="number"
                  min="1"
                  max="28"
                  placeholder="e.g. 5"
                  value={formData.rentDueDay}
                  onChange={(e) => updateField('rentDueDay', e.target.value)}
                  className={getControlClass(Boolean(errors.rentDueDay))}
                />
                <FieldError message={errors.rentDueDay} />
              </div>
            </div>

            <div className="pt-1 flex items-center gap-3">
              <input
                id="tenant-pet-allowed"
                type="checkbox"
                checked={formData.petAllowed}
                onChange={(e) => updateField('petAllowed', e.target.checked)}
                className="w-4 h-4 text-[#EA580C] border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="tenant-pet-allowed" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Pet(s) allowed in the flat
              </label>
            </div>

            {selectedFlat && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-700">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
                  <UserCheck className="w-4 h-4 text-[#EA580C]" />
                  Owner: {selectedFlat.ownerName || viewContext.user?.name || 'You'}
                </span>
                <span>Wing: {selectedFlat.wing || selectedFlat.wingName || 'Wing'}</span>
                <span>Flat Number: {selectedFlat.flatNumber}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  Status: {selectedFlat.occupancyStatus}
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Section 4: Reference Details (Optional) */}
        <SectionCard
          stepNumber={4}
          title="Reference Details"
          subtitle="Optional local contact or guarantor reference for the tenant."
          optional
          icon={Users}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <FieldLabel htmlFor="tenant-reference-name" label="Reference Name" />
              <input
                id="tenant-reference-name"
                type="text"
                placeholder="e.g. Suresh Kulkarni"
                value={formData.referenceName}
                onChange={(e) => updateField('referenceName', e.target.value)}
                className={getControlClass(false)}
              />
            </div>

            <div>
              <FieldLabel htmlFor="tenant-reference-contact" label="Reference Contact Number" />
              <input
                id="tenant-reference-contact"
                type="tel"
                placeholder="e.g. 9823456789"
                maxLength={14}
                value={formData.referenceContactNumber}
                onChange={(e) => updateField('referenceContactNumber', e.target.value)}
                className={getControlClass(Boolean(errors.referenceContactNumber))}
              />
              <FieldError message={errors.referenceContactNumber} />
            </div>

            <div>
              <FieldLabel htmlFor="tenant-reference-relation" label="Reference Relation" />
              <select
                id="tenant-reference-relation"
                value={formData.referenceRelation}
                onChange={(e) => updateField('referenceRelation', e.target.value)}
                className={getControlClass(false)}
              >
                <option value="">Select Relation</option>
                {TENANT_FORM_OPTIONS.relations.map((relation) => (
                  <option key={relation} value={relation}>
                    {relation}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Section 5: Tenant Documents (2 Required by default + Optional extras) */}
        <SectionCard
          stepNumber={5}
          title="Tenant Documents"
          subtitle="Upload required verification documents and rental agreement (JPG, JPEG, PNG, PDF up to 15 MB each)."
          icon={FileText}
        >
          <div className="space-y-6">
            {/* --- ZONE A: 2 MANDATORY DOCUMENTS --- */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Required Documents (2 Required)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Identity Proof Slot */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800">
                      <FileCheck2 className="w-4 h-4 text-[#EA580C]" />
                      1. Identity Proof <span className="text-red-500">*</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-100">
                      Required
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Aadhaar, Passport, PAN Card, or Voter ID of the tenant.
                  </p>

                  {!requiredDocs.identityProof.file ? (
                    <div>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const f = e.dataTransfer?.files?.[0];
                          if (f) handleRequiredFileSelection('identityProof', f);
                        }}
                        className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center ${
                          errors.identityProof || requiredDocs.identityProof.fileError
                            ? 'border-red-300 bg-red-50/40'
                            : 'border-orange-200 bg-orange-50/20 hover:bg-orange-50/40'
                        }`}
                      >
                        <input
                          id="id-proof-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleRequiredFileSelection('identityProof', f);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        <label htmlFor="id-proof-upload" className="cursor-pointer block space-y-1">
                          <UploadCloud className="w-7 h-7 mx-auto text-[#EA580C]" />
                          <p className="text-xs font-semibold text-gray-800">
                            <span className="text-[#EA580C]">Click to upload</span> or drag & drop
                          </p>
                          <p className="text-[10px] text-gray-400">PDF, JPG, PNG up to 15 MB</p>
                        </label>
                      </div>
                      <FieldError message={requiredDocs.identityProof.fileError || errors.identityProof} />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {requiredDocs.identityProof.isImage && requiredDocs.identityProof.previewUrl ? (
                          <img
                            src={requiredDocs.identityProof.previewUrl}
                            alt="Identity Proof"
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex flex-col items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase leading-none mt-0.5">
                              {requiredDocs.identityProof.extension || 'PDF'}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p title={requiredDocs.identityProof.fileName} className="text-xs font-semibold text-gray-800 truncate">
                            {requiredDocs.identityProof.fileName}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {formatDocumentFileSize(requiredDocs.identityProof.fileSize)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {requiredDocs.identityProof.previewUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(requiredDocs.identityProof)}
                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#EA580C] cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveRequiredFile('identityProof')}
                          className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Rental Agreement Slot */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800">
                      <FileCheck2 className="w-4 h-4 text-[#EA580C]" />
                      2. Rental Agreement <span className="text-red-500">*</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-100">
                      Required
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Signed registered rent agreement or leave & license document.
                  </p>

                  {!requiredDocs.rentalAgreement.file ? (
                    <div>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const f = e.dataTransfer?.files?.[0];
                          if (f) handleRequiredFileSelection('rentalAgreement', f);
                        }}
                        className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center ${
                          errors.rentalAgreement || requiredDocs.rentalAgreement.fileError
                            ? 'border-red-300 bg-red-50/40'
                            : 'border-orange-200 bg-orange-50/20 hover:bg-orange-50/40'
                        }`}
                      >
                        <input
                          id="rental-agreement-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleRequiredFileSelection('rentalAgreement', f);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        <label htmlFor="rental-agreement-upload" className="cursor-pointer block space-y-1">
                          <UploadCloud className="w-7 h-7 mx-auto text-[#EA580C]" />
                          <p className="text-xs font-semibold text-gray-800">
                            <span className="text-[#EA580C]">Click to upload</span> or drag & drop
                          </p>
                          <p className="text-[10px] text-gray-400">PDF, JPG, PNG up to 15 MB</p>
                        </label>
                      </div>
                      <FieldError message={requiredDocs.rentalAgreement.fileError || errors.rentalAgreement} />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {requiredDocs.rentalAgreement.isImage && requiredDocs.rentalAgreement.previewUrl ? (
                          <img
                            src={requiredDocs.rentalAgreement.previewUrl}
                            alt="Rental Agreement"
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex flex-col items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase leading-none mt-0.5">
                              {requiredDocs.rentalAgreement.extension || 'PDF'}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p title={requiredDocs.rentalAgreement.fileName} className="text-xs font-semibold text-gray-800 truncate">
                            {requiredDocs.rentalAgreement.fileName}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {formatDocumentFileSize(requiredDocs.rentalAgreement.fileSize)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {requiredDocs.rentalAgreement.previewUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(requiredDocs.rentalAgreement)}
                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#EA580C] cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveRequiredFile('rentalAgreement')}
                          className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- ZONE B: OPTIONAL DOCUMENTS --- */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Additional Documents (Optional)
                  </h3>
                </div>
                <span className="text-xs text-gray-500">
                  {optionalDocs.length} of 5 added
                </span>
              </div>

              {optionalDocs.length > 0 && (
                <div className="space-y-4 mb-4">
                  {optionalDocs.map((doc, idx) => {
                    const rowErrors = errors.optionalDocs?.[doc.id] || {};
                    return (
                      <div
                        key={doc.id}
                        className="rounded-xl border border-gray-200/90 bg-gray-50/50 p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">
                            Optional Document {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionalDoc(doc.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          <div className="md:col-span-5 space-y-3">
                            <div>
                              <FieldLabel htmlFor={`opt-type-${doc.id}`} label="Document Type" required />
                              <select
                                id={`opt-type-${doc.id}`}
                                value={doc.documentType}
                                onChange={(e) => handleOptionalDocTypeChange(doc.id, e.target.value)}
                                className={getControlClass(Boolean(rowErrors.documentType))}
                              >
                                <option value="">Select Document Type</option>
                                {OPTIONAL_DOC_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                              <FieldError message={rowErrors.documentType} />
                            </div>

                            {doc.documentType === 'Other Document' && (
                              <div>
                                <FieldLabel htmlFor={`opt-name-${doc.id}`} label="Document Name" required />
                                <input
                                  id={`opt-name-${doc.id}`}
                                  type="text"
                                  placeholder="e.g. Police Verification, Electricity Bill"
                                  value={doc.otherDocumentName}
                                  onChange={(e) => handleOptionalDocNameChange(doc.id, e.target.value)}
                                  className={getControlClass(Boolean(rowErrors.otherDocumentName))}
                                />
                                <FieldError message={rowErrors.otherDocumentName} />
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-7">
                            <span className="block text-xs font-bold text-gray-700 mb-1.5">
                              Upload File <span className="font-normal text-gray-400">(Max 15 MB)</span>
                            </span>

                            {!doc.file ? (
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const f = e.dataTransfer?.files?.[0];
                                  if (f) handleOptionalFileSelection(doc.id, f);
                                }}
                                className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center ${
                                  rowErrors.file || doc.fileError
                                    ? 'border-red-300 bg-red-50/40'
                                    : 'border-orange-200 bg-white hover:bg-orange-50/30'
                                }`}
                              >
                                <input
                                  id={`opt-file-${doc.id}`}
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleOptionalFileSelection(doc.id, f);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                                <label htmlFor={`opt-file-${doc.id}`} className="cursor-pointer block space-y-1">
                                  <UploadCloud className="w-6 h-6 mx-auto text-[#EA580C]" />
                                  <p className="text-xs font-semibold text-gray-800">
                                    <span className="text-[#EA580C]">Click to upload</span> or drag & drop
                                  </p>
                                  <p className="text-[10px] text-gray-400">PDF, JPG, PNG</p>
                                </label>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-gray-200 bg-white p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {doc.isImage && doc.previewUrl ? (
                                    <img
                                      src={doc.previewUrl}
                                      alt={doc.fileName}
                                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex flex-col items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                      <span className="text-[8px] font-bold uppercase leading-none mt-0.5">
                                        {doc.extension || 'PDF'}
                                      </span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p title={doc.fileName} className="text-xs font-semibold text-gray-800 truncate">
                                      {doc.fileName}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                      {formatDocumentFileSize(doc.fileSize)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {doc.previewUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewDoc(doc)}
                                      className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#EA580C] cursor-pointer"
                                      title="Preview"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionalFile(doc.id)}
                                    className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 cursor-pointer"
                                    title="Remove"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <FieldError message={rowErrors.file || doc.fileError} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddOptionalDoc}
                disabled={optionalDocs.length >= 5}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-50 text-xs sm:text-sm font-semibold text-[#EA580C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Optional Document</span>
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Form Actions */}
        <div className="bg-white rounded-2xl border border-gray-200/80 px-5 sm:px-6 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(listingPath)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#DC4E07] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registering Tenant...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Tenant</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Document Preview Modal */}
      {previewDoc && previewDoc.previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${previewDoc.fileName}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#0F172A] truncate">
                  {previewDoc.fileName}
                </h3>
                <p className="text-xs text-gray-500">
                  {previewDoc.label || previewDoc.documentType || 'Document'} &bull;{' '}
                  {formatDocumentFileSize(previewDoc.fileSize)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                aria-label="Close document preview"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 flex items-center justify-center max-h-[75vh] overflow-auto">
              {previewDoc.isImage ? (
                <img
                  src={previewDoc.previewUrl}
                  alt={previewDoc.fileName}
                  className="max-w-full max-h-[68vh] rounded-lg object-contain"
                />
              ) : (
                <iframe
                  title={previewDoc.fileName}
                  src={previewDoc.previewUrl}
                  className="w-full h-[68vh] rounded-lg border border-gray-200 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantRegistrationPage;
