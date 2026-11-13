import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  LogOut,
  Mail,
  MoreVertical,
  PauseCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { tenantApi } from '../../services/tenantApi';
import {
  buildTenantDetailSections,
  formatDocumentFileSize,
  getAvatarTone,
  getInitials,
  resolveTenantViewContext,
} from './tenantMockData';

const PAGE_SIZE = 10;

const TABS = [
  { id: 'registration', label: 'Tenant Registrations', icon: UserPlus },
  { id: 'history', label: 'Tenancy History', icon: CalendarClock },
];

const STATUS_OPTIONS = ['Active', 'Inactive', 'Vacated'];

const STATUS_BADGE_CLASSES = {
  Active: 'bg-[#DCFCE7] text-[#15803D]',
  Inactive: 'bg-[#FEF3C7] text-[#B45309]',
  Vacated: 'bg-[#F1F5F9] text-[#475569]',
};

const STATUS_DOT_CLASSES = {
  Active: 'bg-[#16A34A]',
  Inactive: 'bg-[#D97706]',
  Vacated: 'bg-[#64748B]',
};

const SummaryCard = ({ title, value, icon: Icon, iconBgClass }) => (
  <div className="bg-white rounded-2xl border border-gray-200/75 px-5 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex items-center gap-4 min-w-0">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight mt-0.5">{value}</p>
    </div>
  </div>
);

const SECTION_ICONS = {
  personal: User,
  professional: Briefcase,
  tenancy: Building2,
  reference: Users,
  documents: FileText,
};

const hasAccessibleDocumentFile = (doc) =>
  Boolean(
    (typeof Blob !== 'undefined' && doc?.file instanceof Blob) ||
    doc?.fileUrl ||
    doc?.previewUrl
  );

const resolveDocumentObjectUrl = (doc) => {
  if (
    doc?.file &&
    typeof Blob !== 'undefined' &&
    doc.file instanceof Blob &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  ) {
    return { url: URL.createObjectURL(doc.file), isOwnedObjectUrl: true };
  }
  const existingUrl = doc?.fileUrl || doc?.previewUrl || '';
  return { url: existingUrl, isOwnedObjectUrl: false };
};

const normalizeTenantRecord = (item) => {
  const name = item.fullName || item.name || '';
  const contactNumber = item.mobileNumber || item.contactNumber || '';
  const moveInStr = item.moveInDate
    ? new Date(item.moveInDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : (item.allottedMonth || '-');
  const moveOutStr = item.moveOutDate
    ? new Date(item.moveOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

  return {
    ...item,
    id: item._id || item.id,
    name,
    fullName: name,
    contactNumber,
    mobileNumber: contactNumber,
    allottedMonth: moveInStr,
    moveOutDateFormatted: moveOutStr,
    wing: item.wing || item.wingName || (item.flatId?.wing) || 'Wing',
    flatNumber: item.flatNumber || item.flatId?.flatNumber || '',
    ownerName: item.ownerName || item.ownerId?.name || '',
    status: item.status || 'Active',
    documents: (item.documents || []).map((doc) => ({
      ...doc,
      id: doc._id || doc.id,
      fileName: doc.fileName || doc.label,
      documentType: doc.label || doc.documentType,
      displayDocumentType: doc.label || doc.documentType,
      fileSize: doc.fileSize,
      fileUrl: doc.fileUrl,
      previewUrl: doc.fileUrl,
      isImage: doc.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(doc.fileName || doc.fileUrl || ''),
    })),
  };
};

/**
 * Shared modal shell for View Details and Edit Tenant interactions.
 */
const TenantActionModal = ({ mode, tenant, onClose, onSuccess, onSwitchMode }) => {
  const [previewDoc, setPreviewDoc] = useState(null);
  const ownedPreviewUrlRef = useRef('');

  const [formData, setFormData] = useState({
    fullName: tenant?.fullName || tenant?.name || '',
    mobileNumber: tenant?.mobileNumber || tenant?.contactNumber || '',
    email: tenant?.email || '',
    dateOfBirth: tenant?.dateOfBirth ? String(tenant.dateOfBirth).split('T')[0] : '',
    gender: tenant?.gender || '',
    numberOfOccupants: tenant?.numberOfOccupants || '',
    completeAddress: tenant?.completeAddress || '',
    emergencyContactNumber: tenant?.emergencyContactNumber || '',
    moveInDate: tenant?.moveInDate ? String(tenant.moveInDate).split('T')[0] : '',
    monthlyRent: tenant?.monthlyRent ?? '',
    securityDeposit: tenant?.securityDeposit ?? '',
    rentDueDay: tenant?.rentDueDay ?? '',
    petAllowed: Boolean(tenant?.petAllowed),
    employmentType: tenant?.employmentType || '',
    companyName: tenant?.companyName || '',
    companyDescription: tenant?.companyDescription || '',
    organizationName: tenant?.organizationName || '',
    organizationAddress: tenant?.organizationAddress || '',
    yearOfIncorporation: tenant?.yearOfIncorporation || '',
    referenceName: tenant?.referenceName || '',
    referenceContactNumber: tenant?.referenceContactNumber || '',
    referenceRelation: tenant?.referenceRelation || '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (
        ownedPreviewUrlRef.current &&
        typeof URL !== 'undefined' &&
        typeof URL.revokeObjectURL === 'function'
      ) {
        URL.revokeObjectURL(ownedPreviewUrlRef.current);
        ownedPreviewUrlRef.current = '';
      }
    };
  }, []);

  if (!tenant || !mode) return null;

  const isView = mode === 'view';
  const detailSections = isView ? buildTenantDetailSections(tenant) : [];

  const closePreview = () => {
    if (
      ownedPreviewUrlRef.current &&
      typeof URL !== 'undefined' &&
      typeof URL.revokeObjectURL === 'function'
    ) {
      URL.revokeObjectURL(ownedPreviewUrlRef.current);
      ownedPreviewUrlRef.current = '';
    }
    setPreviewDoc(null);
  };

  const handlePreviewDocument = (doc) => {
    const { url, isOwnedObjectUrl } = resolveDocumentObjectUrl(doc);
    if (!url) return;

    if (
      ownedPreviewUrlRef.current &&
      typeof URL !== 'undefined' &&
      typeof URL.revokeObjectURL === 'function'
    ) {
      URL.revokeObjectURL(ownedPreviewUrlRef.current);
      ownedPreviewUrlRef.current = '';
    }
    if (isOwnedObjectUrl) {
      ownedPreviewUrlRef.current = url;
    }

    setPreviewDoc({ ...doc, previewObjectUrl: url });
  };

  const handleDownloadDocument = (doc) => {
    const { url, isOwnedObjectUrl } = resolveDocumentObjectUrl(doc);
    if (!url) return;

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = doc.fileName || 'document';
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    if (
      isOwnedObjectUrl &&
      typeof URL !== 'undefined' &&
      typeof URL.revokeObjectURL === 'function'
    ) {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    const cleanMobile = formData.mobileNumber.replace(/[\s-]/g, '').replace(/^\+91/, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    }
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (formData.rentDueDay) {
      const d = Number(formData.rentDueDay);
      if (isNaN(d) || d < 1 || d > 28) newErrors.rentDueDay = 'Must be between 1 and 28';
    }
    if (formData.emergencyContactNumber) {
      const em = formData.emergencyContactNumber.replace(/[\s-]/g, '').replace(/^\+91/, '');
      if (!/^[6-9]\d{9}$/.test(em)) newErrors.emergencyContactNumber = 'Enter a valid 10-digit number';
    }
    if (formData.referenceContactNumber) {
      const ref = formData.referenceContactNumber.replace(/[\s-]/g, '').replace(/^\+91/, '');
      if (!/^[6-9]\d{9}$/.test(ref)) newErrors.referenceContactNumber = 'Enter a valid 10-digit number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the validation errors.');
      return;
    }

    try {
      setSaving(true);
      await tenantApi.updateTenantRegistration(tenant.id, {
        ...formData,
        fullName: formData.fullName.trim(),
        mobileNumber: cleanMobile,
        email: cleanEmail,
      });
      toast.success('Tenant details updated successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update tenant:', err);
      toast.error(err?.response?.data?.message || 'Failed to update tenant details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isView ? 'Tenant Details' : 'Edit Tenant'}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#FFF3E8] text-[#EA580C] flex items-center justify-center shrink-0">
              {isView ? <User className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                {isView ? 'Tenant Details' : 'Edit Tenant Details'}
              </h3>
              <p className="text-xs text-gray-500">
                {tenant.flatNumber ? `Flat ${tenant.flatNumber}` : ''} {tenant.wing ? `• ${tenant.wing}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex items-center gap-3.5 pb-2 border-b border-gray-100">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarTone(tenant.id)}`}
            >
              {getInitials(formData.fullName || tenant.name || tenant.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900 truncate">
                {isView ? (tenant.name || tenant.fullName) : formData.fullName || 'Tenant Name'}
              </p>
              <p className="text-xs text-gray-500">
                {tenant.wing} / {tenant.flatNumber}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[tenant.status] || STATUS_BADGE_CLASSES.Vacated
                }`}
            >
              {tenant.status}
            </span>
          </div>

          {isView ? (
            <div className="space-y-4">
              {detailSections.map((section) => {
                const SectionIcon = SECTION_ICONS[section.id] || User;
                return (
                  <div
                    key={section.id}
                    className="bg-gray-50/75 rounded-xl p-4 border border-gray-100 space-y-3"
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200/70">
                      <span className="w-6 h-6 rounded-full bg-[#FFF3E8] text-[#EA580C] flex items-center justify-center shrink-0">
                        <SectionIcon className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        {section.title}
                      </h4>
                    </div>

                    {section.id === 'documents' ? (
                      section.documents && section.documents.length > 0 ? (
                        <div className="space-y-2.5">
                          {section.documents.map((doc, idx) => {
                            const docKey = doc.id || `${idx}-${doc.fileName || 'doc'}`;
                            const docTypeLabel =
                              doc.displayDocumentType ||
                              (doc.documentType === 'Other Document' && doc.otherDocumentName
                                ? `Other Document (${doc.otherDocumentName})`
                                : doc.documentType || 'Document');
                            const fileSizeLabel =
                              doc.formattedFileSize ||
                              (Number.isFinite(doc.fileSize)
                                ? formatDocumentFileSize(doc.fileSize)
                                : '');
                            const fileTypeLabel =
                              doc.fileType ||
                              (doc.extension ? doc.extension.toUpperCase() : '') ||
                              (doc.isImage ? 'IMAGE' : 'PDF');
                            const canOpenFile = hasAccessibleDocumentFile(doc);

                            return (
                              <div
                                key={docKey}
                                data-tenant-doc={docKey}
                                className="rounded-xl border border-gray-200/80 bg-white px-3.5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="flex items-start sm:items-center gap-3 min-w-0">
                                  <div
                                    className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center shrink-0 ${fileTypeLabel === 'PDF'
                                      ? 'bg-red-50 border-red-100 text-red-600'
                                      : 'bg-[#FFF3E8] border-orange-100 text-[#EA580C]'
                                      }`}
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase leading-none mt-0.5">
                                      {fileTypeLabel}
                                    </span>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#EA580C] truncate">
                                      {docTypeLabel}
                                    </p>
                                    <p
                                      title={doc.fileName}
                                      className="text-sm font-semibold text-gray-800 truncate"
                                    >
                                      {doc.fileName}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                                      {fileSizeLabel && <span>{fileSizeLabel}</span>}
                                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold uppercase text-[10px]">
                                        {fileTypeLabel}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    disabled={!canOpenFile}
                                    onClick={() => handlePreviewDocument(doc)}
                                    title={
                                      canOpenFile
                                        ? 'Preview document'
                                        : 'File preview unavailable'
                                    }
                                    aria-label={`Preview ${doc.fileName || docTypeLabel}`}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-[#EA580C] text-xs font-semibold text-gray-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Preview</span>
                                  </button>

                                  {canOpenFile && (
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadDocument(doc)}
                                      title="Download document"
                                      aria-label={`Download ${doc.fileName || docTypeLabel}`}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-[#EA580C] text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs italic text-gray-400">
                          {section.emptyMessage || 'No documents uploaded.'}
                        </p>
                      )
                    ) : section.fields.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                        {section.fields.map((item) => (
                          <div
                            key={item.label}
                            className={`min-w-0 ${item.fullWidth ? 'sm:col-span-2' : ''}`}
                          >
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                              {item.label}
                            </p>
                            {item.isStatus ? (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${STATUS_BADGE_CLASSES[item.value] || STATUS_BADGE_CLASSES.Vacated
                                  }`}
                              >
                                {item.value}
                              </span>
                            ) : (
                              <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words whitespace-pre-line">
                                {item.value}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-gray-400">
                        {section.emptyMessage || 'No details available.'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* --- EDIT FORM --- */
            <form onSubmit={handleSave} className="space-y-4">
              {/* Personal Details */}
              <div className="bg-gray-50/75 rounded-xl p-4 border border-gray-100 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/70">
                  <span className="w-6 h-6 rounded-full bg-[#FFF3E8] text-[#EA580C] flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Personal Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors.fullName
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-orange-500/20 focus:border-[#EA580C]'
                        }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={14}
                      value={formData.mobileNumber}
                      onChange={(e) => updateField('mobileNumber', e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors.mobileNumber
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-orange-500/20 focus:border-[#EA580C]'
                        }`}
                    />
                    {errors.mobileNumber && <p className="text-[11px] text-red-500 mt-1">{errors.mobileNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors.email
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-orange-500/20 focus:border-[#EA580C]'
                        }`}
                    />
                    {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Emergency Contact</label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => updateField('emergencyContactNumber', e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors.emergencyContactNumber
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-orange-500/20 focus:border-[#EA580C]'
                        }`}
                    />
                    {errors.emergencyContactNumber && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.emergencyContactNumber}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Permanent Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 302, Green Park, Pune"
                      value={formData.completeAddress}
                      onChange={(e) => updateField('completeAddress', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    />
                  </div>
                </div>
              </div>

              {/* Tenancy Details */}
              <div className="bg-gray-50/75 rounded-xl p-4 border border-gray-100 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/70">
                  <span className="w-6 h-6 rounded-full bg-[#FFF3E8] text-[#EA580C] flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Tenancy Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Move-in Date</label>
                    <input
                      type="date"
                      value={formData.moveInDate}
                      onChange={(e) => updateField('moveInDate', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Number of Occupants</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.numberOfOccupants}
                      onChange={(e) => updateField('numberOfOccupants', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Rent (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.monthlyRent}
                      onChange={(e) => updateField('monthlyRent', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.securityDeposit}
                      onChange={(e) => updateField('securityDeposit', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rent Due Day (1-28)</label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      value={formData.rentDueDay}
                      onChange={(e) => updateField('rentDueDay', e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors.rentDueDay
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-orange-500/20 focus:border-[#EA580C]'
                        }`}
                    />
                    {errors.rentDueDay && <p className="text-[11px] text-red-500 mt-1">{errors.rentDueDay}</p>}
                  </div>

                  <div className="flex items-center gap-2.5 pt-6">
                    <input
                      id="edit-pet-allowed"
                      type="checkbox"
                      checked={formData.petAllowed}
                      onChange={(e) => updateField('petAllowed', e.target.checked)}
                      className="w-4 h-4 text-[#EA580C] border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="edit-pet-allowed" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Pet Allowed
                    </label>
                  </div>
                </div>
              </div>

              {/* Professional & Reference Details */}
              <div className="bg-gray-50/75 rounded-xl p-4 border border-gray-100 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200/70">
                  <span className="w-6 h-6 rounded-full bg-[#FFF3E8] text-[#EA580C] flex items-center justify-center shrink-0">
                    <Briefcase className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Employment & Reference Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Employment Type</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => updateField('employmentType', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    >
                      <option value="">Select Employment Type</option>
                      <option value="Salaried">Salaried</option>
                      <option value="Self Employed">Self Employed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Infosys, TCS, etc."
                      value={formData.companyName || formData.organizationName}
                      onChange={(e) => {
                        updateField('companyName', e.target.value);
                        updateField('organizationName', e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Reference Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kulkarni"
                      value={formData.referenceName}
                      onChange={(e) => updateField('referenceName', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Reference Contact</label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={formData.referenceContactNumber}
                      onChange={(e) => updateField('referenceContactNumber', e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors.referenceContactNumber
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-orange-500/20 focus:border-[#EA580C]'
                        }`}
                    />
                    {errors.referenceContactNumber && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.referenceContactNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          {isView ? (
            <>
              <button
                type="button"
                onClick={() => onSwitchMode && onSwitchMode('edit')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-xs sm:text-sm font-semibold text-[#EA580C] hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Details
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => (onSwitchMode ? onSwitchMode('view') : onClose())}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#DC4E07] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {previewDoc && previewDoc.previewObjectUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${previewDoc.fileName}`}
          onClick={(e) => {
            e.stopPropagation();
            closePreview();
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#0F172A] truncate">
                  {previewDoc.fileName}
                </h4>
                <p className="text-xs text-gray-500">
                  {previewDoc.displayDocumentType || previewDoc.documentType || 'Tenant Document'}
                  {previewDoc.formattedFileSize ? ` • ${previewDoc.formattedFileSize}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(previewDoc)}
                  aria-label={`Download ${previewDoc.fileName}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-[#EA580C] text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={closePreview}
                  aria-label="Close document preview"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex items-center justify-center max-h-[75vh] overflow-auto">
              {previewDoc.isImage ? (
                <img
                  src={previewDoc.previewObjectUrl}
                  alt={previewDoc.fileName}
                  className="max-w-full max-h-[68vh] rounded-lg object-contain"
                />
              ) : (
                <iframe
                  title={previewDoc.fileName}
                  src={previewDoc.previewObjectUrl}
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

/**
 * Tenant Management page connecting to backend APIs.
 */
const TenantPage = () => {
  const navigate = useNavigate();
  const { societyId } = useParams();

  const [tenants, setTenants] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('registration');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [wingFilter, setWingFilter] = useState('All Wings / Blocks');
  const [currentPage, setCurrentPage] = useState(1);

  // History tab states
  const [ownerFlats, setOwnerFlats] = useState([]);
  const [selectedHistoryFlatId, setSelectedHistoryFlatId] = useState('');
  const [historyTenants, setHistoryTenants] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [modalState, setModalState] = useState({ mode: null, tenant: null });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuContainerRef = useRef(null);

  const viewContext = useMemo(() => resolveTenantViewContext(), []);

  // Fetch tenants from backend
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tenantApi.getTenants({
        page: currentPage,
        limit: PAGE_SIZE,
        search: searchQuery.trim(),
        status: statusFilter !== 'All Status' ? statusFilter : '',
      });

      const rawRecords = res?.data?.records || res?.records || [];
      const total = res?.data?.total ?? res?.total ?? 0;
      const pages = res?.data?.totalPages ?? res?.totalPages ?? 1;

      const normalized = rawRecords.map(normalizeTenantRecord);
      setTenants(normalized);
      setTotalCount(total);
      setTotalPages(pages);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      toast.error('Failed to load tenants from server');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // Load owner flats for history selector
  const fetchOwnerFlats = useCallback(async () => {
    try {
      const res = await tenantApi.getOwnerFlats();
      const flatsList = res?.data?.flats || res?.flats || [];
      setOwnerFlats(flatsList);
      if (flatsList.length > 0) {
        setSelectedHistoryFlatId((prev) => {
          const exists = flatsList.some((f) => (f._id || f.id) === prev);
          return exists ? prev : (flatsList[0]._id || flatsList[0].id);
        });
      }
    } catch (e) {
      console.error('Failed to fetch flats for history tab', e);
    }
  }, []);

  useEffect(() => {
    fetchOwnerFlats();
  }, [fetchOwnerFlats]);

  // Fetch history when flat is selected
  useEffect(() => {
    if (activeTab === 'history' && selectedHistoryFlatId) {
      const fetchHistory = async () => {
        try {
          setLoadingHistory(true);
          const res = await tenantApi.getTenantHistory(selectedHistoryFlatId);
          const list = res?.data?.history || res?.history || [];
          setHistoryTenants(list.map(normalizeTenantRecord));
        } catch (err) {
          console.error('Failed to fetch tenant history:', err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab, selectedHistoryFlatId]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
        setModalState({ mode: null, tenant: null });
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const summaryStats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let vacated = 0;

    for (const tenant of tenants) {
      if (tenant.status === 'Active') active += 1;
      else if (tenant.status === 'Inactive') inactive += 1;
      else if (tenant.status === 'Vacated') vacated += 1;
    }

    return [
      {
        title: 'Total Tenants',
        value: totalCount,
        icon: Users,
        iconBgClass: 'bg-[#FFF3E8] text-[#EA580C]',
      },
      {
        title: 'Active Tenants',
        value: active,
        icon: Users,
        iconBgClass: 'bg-[#EAF9EE] text-[#16A34A]',
      },
      {
        title: 'Inactive Tenants',
        value: inactive,
        icon: PauseCircle,
        iconBgClass: 'bg-[#FEF7DE] text-[#D97706]',
      },
      {
        title: 'Vacated Tenants',
        value: vacated,
        icon: LogOut,
        iconBgClass: 'bg-[#FEECEB] text-[#DC2626]',
      },
    ];
  }, [tenants, totalCount]);

  const wingOptions = useMemo(() => {
    const wings = Array.from(new Set(tenants.map((t) => t.wing).filter(Boolean))).sort();
    return ['All Wings / Blocks', ...wings];
  }, [tenants]);

  const filteredTenants = useMemo(() => {
    if (wingFilter === 'All Wings / Blocks') return tenants;
    return tenants.filter((t) => t.wing === wingFilter);
  }, [tenants, wingFilter]);

  const handleStatusChange = async (tenantId, nextStatus) => {
    try {
      await tenantApi.updateTenantStatus(tenantId, nextStatus);
      toast.success(`Tenant marked as ${nextStatus}`);
      fetchTenants();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update tenant status');
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleResendInvite = async (tenantId) => {
    setOpenMenuId(null);
    const toastId = toast.loading('Resending invitation...');
    try {
      await tenantApi.resendInvite(tenantId);
      toast.success('Invitation resent successfully! Check the tenant\'s email.', { id: toastId });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend invitation', { id: toastId });
    }
  };

  const handleNewTenantClick = () => {
    const targetSocietyId = societyId || localStorage.getItem('societyDatabase');
    const targetPath = targetSocietyId
      ? `/${targetSocietyId}/dashboard/tenant/new`
      : '/dashboard/tenant/new';
    navigate(targetPath);
  };

  if (!viewContext.hasAccess) {
    return null;
  }

  const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="w-full space-y-5">
      {/* Compact Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Tenant Management
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            {viewContext.isOwner
              ? 'View and manage tenants residing in your flats.'
              : 'Manage tenant profiles, flat allocations, and verification documents.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {viewContext.isOwner && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#EA580C] border border-orange-100 w-fit">
              Owner Flat View
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              fetchTenants();
              fetchOwnerFlats();
            }}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#EA580C]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconBgClass={card.iconBgClass}
          />
        ))}
      </div>

      {/* Folder-Style Tabs */}
      <div>
        <div
          className="flex flex-wrap items-end gap-1.5 sm:gap-2 relative z-10"
          role="tablist"
          aria-label="Tenant management sections"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer border ${isActive
                  ? 'bg-[#EA580C] text-white border-[#EA580C] font-semibold shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 border-b-0 font-medium hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          className={`bg-white border border-gray-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.04)] rounded-b-2xl rounded-tr-2xl ${activeTab === 'registration' ? 'rounded-tl-none' : 'rounded-tl-2xl'
            }`}
        >
          {activeTab === 'registration' ? (
            <>
              {/* Search, Filters & New Tenant CTA */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by tenant name, mobile, or email..."
                    aria-label="Search tenants"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 shrink-0">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      aria-label="Filter by status"
                      className="w-full sm:w-40 appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-9 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                      <option value="All Status">All Status</option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={wingFilter}
                      onChange={(e) => setWingFilter(e.target.value)}
                      aria-label="Filter by wing or block"
                      className="w-full sm:w-48 appearance-none bg-white border border-gray-200 rounded-xl pl-3.5 pr-9 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                      {wingOptions.map((wing) => (
                        <option key={wing} value={wing}>
                          {wing}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={handleNewTenantClick}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#DC4E07] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Tenant</span>
                  </button>
                </div>
              </div>

              {/* Tenant Listing Table */}
              <div className="overflow-x-auto min-h-[360px] pb-16" ref={menuContainerRef}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-y border-gray-100 text-xs font-semibold text-gray-800">
                      <th className="pl-5 pr-3 py-3.5 w-12">#</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Tenant Name</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Contact Number</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Email</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Flat / Wing</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Owner Name</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Move-in Date</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                      <th className="pl-4 pr-5 py-3.5 text-center whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {loading ? (
                      [1, 2, 3].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td colSpan="9" className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                          No tenant registrations found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((tenant, index) => {
                        const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
                        const isMenuOpen = openMenuId === tenant.id;
                        const openUpwards = index >= Math.max(1, filteredTenants.length - 2);

                        return (
                          <tr
                            key={tenant.id}
                            className="hover:bg-orange-50/25 transition-colors"
                          >
                            <td className="pl-5 pr-3 py-3.5 text-gray-500 font-medium">
                              {rowNumber}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarTone(tenant.id)}`}
                                >
                                  {getInitials(tenant.fullName || tenant.name)}
                                </div>
                                <span className="font-semibold text-gray-900">{tenant.fullName || tenant.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap tabular-nums">
                              {tenant.mobileNumber || tenant.contactNumber}
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                              {tenant.email || '-'}
                            </td>
                            <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap font-medium">
                              {tenant.flatNumber ? (
                                tenant.wing && !tenant.flatNumber.toLowerCase().includes(tenant.wing.toLowerCase())
                                  ? `${tenant.wing} / ${tenant.flatNumber}`
                                  : tenant.flatNumber
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                              {tenant.ownerName || '-'}
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                              {tenant.allottedMonth}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[tenant.status] || STATUS_BADGE_CLASSES.Vacated
                                  }`}
                              >
                                {tenant.status}
                              </span>
                            </td>
                            <td className="pl-4 pr-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5 relative">
                                <button
                                  type="button"
                                  title="View Details"
                                  aria-label={`View details for ${tenant.name}`}
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setModalState({ mode: 'view', tenant });
                                  }}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#EA580C] hover:bg-orange-50 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  title="Edit Tenant Details"
                                  aria-label={`Edit details for ${tenant.name}`}
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setModalState({ mode: 'edit', tenant });
                                  }}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#EA580C] hover:bg-orange-50 transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  title="More Actions"
                                  aria-label={`More actions for ${tenant.name}`}
                                  aria-expanded={isMenuOpen}
                                  onClick={() =>
                                    setOpenMenuId((prev) => (prev === tenant.id ? null : tenant.id))
                                  }
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {isMenuOpen && (
                                  <div
                                    className={`absolute right-0 z-40 w-48 bg-white rounded-2xl border border-gray-200/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] py-2 ${openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                      }`}
                                    role="menu"
                                  >
                                    <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                      Change Status
                                    </div>
                                    {STATUS_OPTIONS.map((statusOption) => {
                                      const isSelected = tenant.status === statusOption;
                                      return (
                                        <button
                                          key={statusOption}
                                          type="button"
                                          role="menuitem"
                                          onClick={() => handleStatusChange(tenant.id, statusOption)}
                                          className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-[#EA580C] flex items-center justify-between transition-colors cursor-pointer"
                                        >
                                          <span className="flex items-center gap-2">
                                            <span
                                              className={`w-2 h-2 rounded-full ${STATUS_DOT_CLASSES[statusOption]}`}
                                            />
                                            {statusOption}
                                          </span>
                                          {isSelected && <Check className="w-3.5 h-3.5 text-[#EA580C]" />}
                                        </button>
                                      );
                                    })}
                                    <div className="border-gray-100" />
                                    {/* <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setModalState({ mode: 'edit', tenant });
                                      }}
                                      className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-[#EA580C] flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                      Edit Details
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setModalState({ mode: 'view', tenant });
                                      }}
                                      className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                                      View Details
                                    </button> */}
                                    {tenant.status !== 'Active' && tenant.status !== 'Vacated' && (
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleResendInvite(tenant.id)}
                                        className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                                        Resend Invite
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-500">
                  {totalCount === 0
                    ? 'Showing 0 tenants'
                    : `Showing ${showingFrom} to ${showingTo} of ${totalCount} tenants`}
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      aria-label="Previous page"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-semibold px-2 text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      aria-label="Next page"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* --- TAB 2: TENANCY HISTORY --- */
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Past & Active Tenancy History</h3>
                  <p className="text-xs text-gray-500">
                    Restricted to flats owned by you. Select a flat to view its complete chronological lease records.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="history-flat-select" className="text-xs font-semibold text-gray-700">
                    Select Flat:
                  </label>
                  <select
                    id="history-flat-select"
                    value={selectedHistoryFlatId}
                    onChange={(e) => setSelectedHistoryFlatId(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                  >
                    {ownerFlats.length === 0 ? (
                      <option value="">No flats found</option>
                    ) : (
                      ownerFlats.map((flat) => (
                        <option key={flat._id || flat.id} value={flat._id || flat.id}>
                          {flat.flatNumber} — {flat.wing || flat.wingName || 'Wing'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[200px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-y border-gray-100 text-xs font-semibold text-gray-800">
                      <th className="pl-4 pr-3 py-3 w-12">#</th>
                      <th className="px-4 py-3 whitespace-nowrap">Tenant Name</th>
                      <th className="px-4 py-3 whitespace-nowrap">Contact Number</th>
                      <th className="px-4 py-3 whitespace-nowrap">Move-in Date</th>
                      <th className="px-4 py-3 whitespace-nowrap">Move-out Date</th>
                      <th className="px-4 py-3 whitespace-nowrap">Monthly Rent</th>
                      <th className="px-4 py-3 whitespace-nowrap">Status</th>
                      <th className="pl-4 pr-5 py-3 text-center whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {loadingHistory ? (
                      [1, 2].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td colSpan="8" className="px-4 py-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </td>
                        </tr>
                      ))
                    ) : historyTenants.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                          No tenant history records found for the selected flat.
                        </td>
                      </tr>
                    ) : (
                      historyTenants.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-orange-50/25 transition-colors">
                          <td className="pl-4 pr-3 py-3 text-gray-500 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">
                            {item.name || item.fullName}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums">
                            {item.contactNumber || item.mobileNumber}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {item.allottedMonth}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {item.moveOutDateFormatted || (item.status === 'Active' ? 'Present' : '-')}
                          </td>
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                            {item.monthlyRent ? `₹${item.monthlyRent.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASSES[item.status] || STATUS_BADGE_CLASSES.Vacated
                                }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="pl-4 pr-5 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setModalState({ mode: 'view', tenant: item })}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-[#EA580C] hover:bg-orange-50 transition-colors cursor-pointer"
                              title="View Record Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View / Edit Tenant Modal */}
      <TenantActionModal
        key={modalState.tenant ? `${modalState.mode}-${modalState.tenant.id}` : 'closed'}
        mode={modalState.mode}
        tenant={modalState.tenant}
        onClose={() => setModalState({ mode: null, tenant: null })}
        onSwitchMode={(newMode) => setModalState((prev) => ({ ...prev, mode: newMode }))}
        onSuccess={() => fetchTenants()}
      />
    </div>
  );
};

export { TenantActionModal };
export default TenantPage;
