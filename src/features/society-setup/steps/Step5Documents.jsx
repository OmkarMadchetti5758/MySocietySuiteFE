import React, { useState, useMemo } from 'react';
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiUploadCloud,
  FiSearch,
  FiFilter,
  FiEye,
  FiDownload,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiFolder,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useSetupWizard } from '../hooks/useSetupWizard';
import StepInfoCard from '../components/StepInfoCard';
import UploadDocumentModal from '../components/modals/UploadDocumentModal';

// Category color pills
const getCategoryBadgeClass = (cat = '') => {
  const c = cat.toLowerCase();
  if (c.includes('legal')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (c.includes('governance')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (c.includes('plan')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  if (c.includes('noc')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (c.includes('marketing')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const Step5Documents = () => {
  const {
    documents,
    addDocument,
    deleteDocument,
    documentStats,
    validationErrors,
  } = useSetupWizard();

  // State
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Recently Added');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Tab filter
      if (selectedTab === 'Mandatory' && !doc.isMandatory) return false;
      if (selectedTab === 'Optional' && doc.isMandatory) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (doc.documentName || '').toLowerCase().includes(q);
        const matchesCat = (doc.category || '').toLowerCase().includes(q);
        return matchesName || matchesCat;
      }

      return true;
    });
  }, [documents, selectedTab, searchQuery]);

  // Paginated documents
  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + pageSize);

  // Donut chart math
  const { compliantPct, pendingPct, nonCompliantPct, compliantCount, pendingCount, nonCompliantCount } =
    documentStats.compliance;
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89

  const greenStroke = (compliantPct / 100) * circumference;
  const orangeStroke = (pendingPct / 100) * circumference;
  const redStroke = (nonCompliantPct / 100) * circumference;

  const greenOffset = 0;
  const orangeOffset = -greenStroke;
  const redOffset = -(greenStroke + orangeStroke);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      addDocument({
        documentName: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Legal',
        isMandatory: true,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        fileType: 'pdf',
      });
      toast.success(`Uploaded: ${file.name}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register Society</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload and manage important documents and certificates of your society.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Column (3 Cols) */}
        <div className="xl:col-span-3 space-y-6">

          {/* Top Section: Stat Cards + Drag & Drop Upload Zone */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 4 Stat Cards in 2 Cols */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {/* Card 1: Total Documents */}
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FiFileText className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Total Documents</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{documentStats.total}</span>
                  <span className="text-[10px] text-gray-400">All Documents</span>
                </div>
              </div>

              {/* Card 2: Verified Documents */}
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Verified Documents</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{documentStats.verified}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Approved & Verified</span>
                </div>
              </div>

              {/* Card 3: Expiring Soon */}
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0">
                  <FiClock className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Expiring Soon</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{documentStats.expiringSoon}</span>
                  <span className="text-[10px] text-[#EA580C] font-medium">Within 60 Days</span>
                </div>
              </div>

              {/* Card 4: Expired Documents */}
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <FiAlertCircle className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Expired Documents</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{documentStats.expired}</span>
                  <span className="text-[10px] text-red-600 font-medium">Require Immediate Action</span>
                </div>
              </div>
            </div>

            {/* Drag & Drop Upload Zone (Matching Screenshot 4) */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all bg-white shadow-xs ${
                isDragging
                  ? 'border-[#EA580C] bg-orange-50/40'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/10'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                <FiUploadCloud className="text-xl" />
              </div>
              <p className="text-xs font-semibold text-gray-700">Drag & drop files here</p>
              <span className="text-[10px] text-gray-400 my-1">or</span>
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 text-[#EA580C] hover:bg-orange-50 text-xs font-bold transition-colors"
              >
                <span>+ Upload Documents</span>
              </button>
              <span className="text-[9px] text-gray-400 mt-2">
                Max file size: 25 MB | PDF, JPG, PNG
              </span>
            </div>
          </div>

          {/* Documents Table Section */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            {/* Filter Tabs + Search + Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 mb-2">
              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTab('All');
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedTab === 'All'
                      ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>All Documents</span>
                  <span className="text-[10px] opacity-80">{documents.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTab('Mandatory');
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedTab === 'Mandatory'
                      ? 'bg-orange-50 text-[#EA580C] border border-orange-200 font-bold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>Mandatory</span>
                  <span className="text-[10px] opacity-80">{documentStats.mandatoryTotal}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTab('Optional');
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedTab === 'Optional'
                      ? 'bg-orange-50 text-[#EA580C] border border-orange-200 font-bold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>Optional</span>
                  <span className="text-[10px] opacity-80">{documents.length - documentStats.mandatoryTotal}</span>
                </button>
              </div>

              {/* Search, Filter, Sort Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-52">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#EA580C]"
                  />
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold"
                >
                  <FiFilter className="text-xs" />
                  <span>Filters</span>
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 font-medium focus:outline-none"
                >
                  <option value="Recently Added">Recently Added</option>
                  <option value="Expiry Date">Expiry Date</option>
                  <option value="Category">Category</option>
                </select>
              </div>
            </div>

            {validationErrors.documents && (
              <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded-lg">
                {validationErrors.documents}
              </p>
            )}

            {/* Documents Table */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold bg-gray-50/50">
                    <th className="py-3 px-3">Document Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Uploaded By</th>
                    <th className="py-3 px-3">Upload Date</th>
                    <th className="py-3 px-3">Expiry Date</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedDocuments.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Name + Mandatory Subtitle Badge */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                            <FiFileText className="text-base" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{row.documentName}</span>
                            <span
                              className={`text-[10px] font-semibold ${
                                row.isMandatory ? 'text-gray-400' : 'text-gray-400'
                              }`}
                            >
                              {row.isMandatory ? 'Mandatory' : 'Optional'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] border ${getCategoryBadgeClass(
                            row.category
                          )}`}
                        >
                          {row.category}
                        </span>
                      </td>

                      {/* Uploaded By */}
                      <td className="py-3 px-3 text-gray-600 font-medium">{row.uploadedBy || 'Super Admin'}</td>

                      {/* Upload Date */}
                      <td className="py-3 px-3 text-gray-600">{row.uploadDate || '—'}</td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3">
                        {row.expiryDate ? (
                          <span className="font-semibold text-[#EA580C]">{row.expiryDate}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-block ${
                            row.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : row.status === 'Expiring Soon'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                          <button
                            type="button"
                            onClick={() => toast.success(`Viewing ${row.documentName}`)}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="View Document"
                          >
                            <FiEye className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toast.success(`Downloading ${row.documentName}`)}
                            className="p-1 hover:text-emerald-600 transition-colors"
                            title="Download Document"
                          >
                            <FiDownload className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteDocument(row.id);
                              toast.success('Document deleted');
                            }}
                            className="p-1 hover:text-red-500 transition-colors"
                            title="Delete Document"
                          >
                            <FiMoreVertical className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-4 text-xs text-gray-500">
              <div>
                Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} documents
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <FiChevronLeft className="text-sm" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'border border-[#EA580C] text-[#EA580C] bg-orange-50/50'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <FiChevronRight className="text-sm" />
                </button>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="ml-2 px-2.5 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                </select>
              </div>
            </div>

          </div>

        </div>

        {/* Right Info Column (1 Col) */}
        <div className="xl:col-span-1 space-y-5">
          {/* 1. Document Compliance Donut Chart Box */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Document Compliance</h3>

            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="10"
                  />
                  {/* Compliant Green Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeDasharray={`${greenStroke} ${circumference}`}
                    strokeDashoffset={greenOffset}
                  />
                  {/* Pending Orange Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#F97316"
                    strokeWidth="10"
                    strokeDasharray={`${orangeStroke} ${circumference}`}
                    strokeDashoffset={orangeOffset}
                  />
                  {/* Non-Compliant Red Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#EF4444"
                    strokeWidth="10"
                    strokeDasharray={`${redStroke} ${circumference}`}
                    strokeDashoffset={redOffset}
                  />
                </svg>

                {/* Inner Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-gray-900 leading-none">
                    {documentStats.total}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Total</span>
                </div>
              </div>
            </div>

            {/* Donut Legend with counts and percentages */}
            <div className="space-y-2 mt-4 pt-3 border-t border-gray-100 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-600">Compliant</span>
                </div>
                <span className="font-bold text-gray-800">
                  {compliantCount} ({compliantPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-gray-600">Pending</span>
                </div>
                <span className="font-bold text-gray-800">
                  {pendingCount} ({pendingPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-gray-600">Non-Compliant</span>
                </div>
                <span className="font-bold text-gray-800">
                  {nonCompliantCount} ({nonCompliantPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Mandatory Documents Progress Box */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-800">Mandatory Documents</span>
              <span className="text-xs font-extrabold text-emerald-600">
                {documentStats.mandatoryUploaded} / {documentStats.mandatoryTotal}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    documentStats.mandatoryTotal > 0
                      ? Math.round((documentStats.mandatoryUploaded / documentStats.mandatoryTotal) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              {documentStats.mandatoryUploaded >= documentStats.mandatoryTotal
                ? 'All mandatory documents uploaded'
                : `${documentStats.mandatoryTotal - documentStats.mandatoryUploaded} mandatory documents remaining`}
            </p>
          </div>

          {/* 3. Quick Tips Box */}
          <StepInfoCard
            title="Quick Tips"
            icon={FiCheckCircle}
            iconColor="text-emerald-600"
            tipsTitle="Document Guidelines"
            tips={[
              'Upload clear and valid documents for faster verification.',
              'Documents with expiry will be highlighted before the due date.',
              'You can update or replace documents anytime.',
              'Only verified documents will be visible to residents (if applicable).',
            ]}
            illustration="document"
          />
        </div>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={(docData) => {
          addDocument(docData);
          toast.success('Document uploaded successfully');
        }}
      />
    </div>
  );
};

export default Step5Documents;
