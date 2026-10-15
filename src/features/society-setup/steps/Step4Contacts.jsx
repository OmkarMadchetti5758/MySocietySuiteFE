import React, { useState, useMemo } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiPhone,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiCheckCircle,
  FiMail,
} from 'react-icons/fi';
import {
  FaBuilding,
  FaShieldAlt,
  FaTools,
  FaHospital,
  FaBolt,
  FaTint,
  FaRecycle,
  FaUserTie,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSetupWizard } from '../hooks/useSetupWizard';
import StepInfoCard from '../components/StepInfoCard';
import ContactModal from '../components/modals/ContactModal';

// Helper for rendering contact type icons matching Screenshot 3
const renderContactIcon = (contactType = '', category = '') => {
  const t = contactType.toLowerCase();
  if (t.includes('office') || t.includes('society')) return <FaBuilding className="text-blue-500" />;
  if (t.includes('facility') || t.includes('manager')) return <FaUserTie className="text-emerald-500" />;
  if (t.includes('security') || t.includes('guard')) return <FaShieldAlt className="text-purple-500" />;
  if (t.includes('maintenance')) return <FaTools className="text-orange-500" />;
  if (t.includes('hospital') || t.includes('doctor') || t.includes('emergency')) return <FaHospital className="text-red-500" />;
  if (t.includes('electric') || t.includes('power')) return <FaBolt className="text-amber-500" />;
  if (t.includes('water')) return <FaTint className="text-blue-500" />;
  if (t.includes('waste') || t.includes('clean')) return <FaRecycle className="text-emerald-500" />;
  return <FiUsers className="text-gray-500" />;
};

const Step4Contacts = () => {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    contactStats,
    validationErrors,
  } = useSetupWizard();

  // State
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Tab filter
      if (selectedTab !== 'All') {
        const cat = (c.category || '').toLowerCase();
        if (selectedTab === 'Essential' && !cat.includes('essential')) return false;
        if (selectedTab === 'Emergency' && !cat.includes('emergency')) return false;
        if (selectedTab === 'Service Providers' && !cat.includes('service')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.nameCompany || '').toLowerCase().includes(q);
        const matchesType = (c.contactType || '').toLowerCase().includes(q);
        const matchesPerson = (c.contactPerson || '').toLowerCase().includes(q);
        const matchesPhone = (c.mobileNumber || '').toLowerCase().includes(q);
        return matchesName || matchesType || matchesPerson || matchesPhone;
      }

      return true;
    });
  }, [contacts, selectedTab, searchQuery]);

  // Paginated contacts
  const totalItems = filteredContacts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register Society</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add important contacts related to your society.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Column (3 Cols) */}
        <div className="xl:col-span-3 space-y-6">

          {/* Contact Summary Box */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-900">Contact Summary</h2>

              <button
                type="button"
                onClick={() => {
                  setEditingContact(null);
                  setContactModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <FiPlus className="text-sm stroke-[3]" />
                <span>Add New Contact</span>
              </button>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {/* Total Contacts */}
              <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FiUsers className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Total Contacts</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{contactStats.total}</span>
                  <span className="text-[10px] text-blue-600 font-medium">Active Contacts</span>
                </div>
              </div>

              {/* Essential Contacts */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiFileText className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Essential Contacts</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{contactStats.essential}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Required for Operations</span>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <FiPhone className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Emergency Contacts</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{contactStats.emergency}</span>
                  <span className="text-[10px] text-purple-600 font-medium">24 x 7 Contact Available</span>
                </div>
              </div>

              {/* Service Providers */}
              <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                  <FiUsers className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Service Providers</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{contactStats.serviceProviders}</span>
                  <span className="text-[10px] text-[#EA580C] font-medium">For Maintenance & Services</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs + Search + Filters Row */}
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
                  <span>All Contacts</span>
                  <span className="text-[10px] opacity-80">{contacts.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTab('Essential');
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedTab === 'Essential'
                      ? 'bg-orange-50 text-[#EA580C] border border-orange-200 font-bold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>Essential</span>
                  <span className="text-[10px] opacity-80">{contactStats.essential}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTab('Emergency');
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedTab === 'Emergency'
                      ? 'bg-orange-50 text-[#EA580C] border border-orange-200 font-bold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>Emergency</span>
                  <span className="text-[10px] opacity-80">{contactStats.emergency}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTab('Service Providers');
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedTab === 'Service Providers'
                      ? 'bg-orange-50 text-[#EA580C] border border-orange-200 font-bold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span>Service Providers</span>
                  <span className="text-[10px] opacity-80">{contactStats.serviceProviders}</span>
                </button>
              </div>

              {/* Search & Filters Button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
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
              </div>
            </div>

            {validationErrors.contacts && (
              <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded-lg">
                {validationErrors.contacts}
              </p>
            )}

            {/* Contacts Table */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold bg-gray-50/50">
                    <th className="py-3 px-3">Contact Type</th>
                    <th className="py-3 px-3">Name / Company</th>
                    <th className="py-3 px-3">Contact Person</th>
                    <th className="py-3 px-3">Mobile Number</th>
                    <th className="py-3 px-3">Email ID</th>
                    <th className="py-3 px-3">Role / Designation</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedContacts.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Contact Type + Category Badge */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            {renderContactIcon(row.contactType, row.category)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{row.contactType}</span>
                            <span className="text-[10px] text-gray-400 capitalize">{row.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Name / Company */}
                      <td className="py-3 px-3 font-semibold text-gray-800">{row.nameCompany}</td>

                      {/* Contact Person */}
                      <td className="py-3 px-3 text-gray-600">{row.contactPerson || '—'}</td>

                      {/* Mobile */}
                      <td className="py-3 px-3 font-medium text-gray-800">{row.mobileNumber}</td>

                      {/* Email */}
                      <td className="py-3 px-3 text-gray-500">{row.emailId || '—'}</td>

                      {/* Role / Designation */}
                      <td className="py-3 px-3 text-gray-600 font-medium">{row.roleDesignation || '—'}</td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {row.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingContact(row);
                              setContactModalOpen(true);
                            }}
                            className="p-1 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <FiEdit2 className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteContact(row.id);
                              toast.success('Contact deleted');
                            }}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-4 text-xs text-gray-500">
              <div>
                Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} contacts
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
        <div className="xl:col-span-1">
          <StepInfoCard
            title="Why Contact Details are Important?"
            description="These contacts are essential for day-to-day operations, emergency management, maintenance requests, and communication with residents."
            tipsTitle="Quick Tips"
            tips={[
              'Add essential contacts like Society Office, Security, Facility Manager and Maintenance.',
              'Maintain at least one Emergency Contact for 24x7 support.',
              'Keep contact details updated for smooth communication.',
              'You can edit or deactivate contacts anytime.',
            ]}
            illustration="contact"
          />
        </div>
      </div>

      {/* Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        editData={editingContact}
        onSave={(data) => {
          if (editingContact) {
            updateContact(editingContact.id, data);
            toast.success('Contact updated successfully');
          } else {
            addContact(data);
            toast.success('New contact added');
          }
        }}
      />
    </div>
  );
};

export default Step4Contacts;
