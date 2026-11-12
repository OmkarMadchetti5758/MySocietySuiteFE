import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  MoreVertical,
  PauseCircle,
  Pencil,
  Plus,
  Search,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  buildTenantDetailSections,
  formatDocumentFileSize,
  getAvatarTone,
  getInitials,
  getMockTenants,
  getRoleScopedTenants,
  resolveTenantViewContext,
  updateMockTenantStatus,
} from './tenantMockData';

const PAGE_SIZE = 5;

const TABS = [
  { id: 'registration', label: 'Tenant Registration', icon: UserPlus },
  { id: 'history', label: 'Tenant History', icon: CalendarClock },
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

/**
 * Shared modal shell for View Details and Edit Tenant placeholder interactions.
 */
const TenantActionModal = ({ mode, tenant, onClose }) => {
  const [previewDoc, setPreviewDoc] = useState(null);
  const ownedPreviewUrlRef = useRef('');

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isView ? 'Tenant Details' : 'Edit Tenant'}
    >
      <div
        className={`bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-h-[90vh] flex flex-col overflow-hidden ${
          isView ? 'max-w-2xl' : 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-bold text-[#0F172A]">
            {isView ? 'Tenant Details' : 'Edit Tenant'}
          </h3>
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
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getAvatarTone(tenant.id)}`}
            >
              {getInitials(tenant.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900 truncate">{tenant.name}</p>
              <p className="text-xs text-gray-500">
                {tenant.wing} / {tenant.flatNumber}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                STATUS_BADGE_CLASSES[tenant.status] || STATUS_BADGE_CLASSES.Vacated
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
                                    className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center shrink-0 ${
                                      fileTypeLabel === 'PDF'
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
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                                  STATUS_BADGE_CLASSES[item.value] || STATUS_BADGE_CLASSES.Vacated
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
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 text-center space-y-2">
              <p className="text-sm font-semibold text-gray-800">
                Edit Tenant Form Placeholder
              </p>
              <p className="text-xs text-gray-500">
                Editing details for <span className="font-semibold text-gray-700">{tenant.name}</span> will be available here once backend integration is connected.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </button>
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
 * Tenant Management module page displaying summary KPIs, registration/history tabs,
 * search and filter bar, paginated tenant listing table, and row UI actions.
 */
const TenantPage = () => {
  const navigate = useNavigate();
  const { societyId } = useParams();

  const [tenants, setTenants] = useState(() => getMockTenants());
  const [activeTab, setActiveTab] = useState('registration');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [wingFilter, setWingFilter] = useState('All Wings / Blocks');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalState, setModalState] = useState({ mode: null, tenant: null });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuContainerRef = useRef(null);

  const viewContext = useMemo(() => resolveTenantViewContext(), []);

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

  const scopedTenants = useMemo(
    () => getRoleScopedTenants(tenants, viewContext),
    [tenants, viewContext]
  );

  const summaryStats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let vacated = 0;

    for (const tenant of scopedTenants) {
      if (tenant.status === 'Active') active += 1;
      else if (tenant.status === 'Inactive') inactive += 1;
      else if (tenant.status === 'Vacated') vacated += 1;
    }

    return [
      {
        title: 'Total Tenants',
        value: scopedTenants.length,
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
  }, [scopedTenants]);

  const wingOptions = useMemo(() => {
    const wings = Array.from(new Set(scopedTenants.map((tenant) => tenant.wing).filter(Boolean))).sort();
    return ['All Wings / Blocks', ...wings];
  }, [scopedTenants]);

  const filteredTenants = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return scopedTenants.filter((tenant) => {
      if (statusFilter !== 'All Status' && tenant.status !== statusFilter) {
        return false;
      }

      if (wingFilter !== 'All Wings / Blocks' && tenant.wing !== wingFilter) {
        return false;
      }

      if (!normalizedQuery) return true;

      const flatCombined = `${tenant.wing} / ${tenant.flatNumber}`.toLowerCase();
      return (
        tenant.name.toLowerCase().includes(normalizedQuery) ||
        tenant.contactNumber.toLowerCase().includes(normalizedQuery) ||
        (tenant.email || '').toLowerCase().includes(normalizedQuery) ||
        tenant.flatNumber.toLowerCase().includes(normalizedQuery) ||
        flatCombined.includes(normalizedQuery)
      );
    });
  }, [scopedTenants, searchQuery, statusFilter, wingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = filteredTenants.length === 0 ? 0 : startIndex + 1;
  const showingTo = startIndex + paginatedTenants.length;

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleStatusChange = (tenantId, nextStatus) => {
    setTenants(updateMockTenantStatus(tenantId, nextStatus));
    setOpenMenuId(null);
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
              ? 'View tenants residing in flats owned by you.'
              : 'Manage tenant profiles, flat allocations, and status across your society.'}
          </p>
        </div>
        {viewContext.isOwner && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#EA580C] border border-orange-100 w-fit">
            Owner Flat View
          </span>
        )}
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

      {/* Folder-Style Tabs + Connected Table Container */}
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
                className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer border ${
                  isActive
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
          className={`bg-white border border-gray-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.04)] rounded-b-2xl rounded-tr-2xl ${
            activeTab === 'registration' ? 'rounded-tl-none' : 'rounded-tl-2xl'
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
                    placeholder="Search by name, mobile, email or flat number..."
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
                      onChange={(e) => {
                        setWingFilter(e.target.value);
                        setCurrentPage(1);
                      }}
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
              <div className="overflow-x-auto min-h-[260px]" ref={menuContainerRef}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-y border-gray-100 text-xs font-semibold text-gray-800">
                      <th className="pl-5 pr-3 py-3.5 w-12">#</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Tenant Name</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Contact Number</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Email</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Flat / Wing</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Owner Name</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Allotted Month</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                      <th className="pl-4 pr-5 py-3.5 text-center whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {paginatedTenants.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                          No tenants found matching your search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedTenants.map((tenant, index) => {
                        const rowNumber = startIndex + index + 1;
                        const isMenuOpen = openMenuId === tenant.id;
                        const openUpwards =
                          paginatedTenants.length > 2 && index >= paginatedTenants.length - 2;

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
                                  {getInitials(tenant.name)}
                                </div>
                                <span className="font-semibold text-gray-900">{tenant.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap tabular-nums">
                              {tenant.contactNumber}
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                              {tenant.email || '-'}
                            </td>
                            <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                              {tenant.wing} / {tenant.flatNumber}
                            </td>
                            <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                              {tenant.ownerName}
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                              {tenant.allottedMonth}
                            </td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                                  STATUS_BADGE_CLASSES[tenant.status] || STATUS_BADGE_CLASSES.Vacated
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
                                  title="Edit Tenant"
                                  aria-label={`Edit ${tenant.name}`}
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
                                    className={`absolute right-0 z-30 w-44 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 ${
                                      openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                    }`}
                                    role="menu"
                                  >
                                    <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
                                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-[#EA580C] flex items-center justify-between transition-colors cursor-pointer"
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
                                    <div className="my-1 border-t border-gray-100" />
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setModalState({ mode: 'view', tenant });
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                                      View Details
                                    </button>
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
                  {filteredTenants.length === 0
                    ? 'Showing 0 tenants'
                    : `Showing ${showingFrom} to ${showingTo} of ${filteredTenants.length} tenants`}
                </p>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {pageNumbers.map((pageNum) => {
                    const isCurrent = pageNum === safePage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        aria-current={isCurrent ? 'page' : undefined}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#EA580C] border-[#EA580C] text-white shadow-xs'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 sm:p-12 min-h-[340px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#FFF3E8] text-[#EA580C] rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CalendarClock className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] mb-1.5">
                Tenant History
              </h2>
              <p className="text-sm text-[#475569] max-w-md">
                Past tenant records, lease timelines, and move-out history will be available here.
              </p>
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
      />
    </div>
  );
};

export default TenantPage;
