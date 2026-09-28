import { useState, useEffect, useCallback } from 'react';
import {
  FaArrowLeft, FaPlus, FaSearch, FaFilter, FaSpinner, FaEye,
  FaCheck, FaTimes, FaPercent, FaFileInvoice, FaShieldAlt,
  FaClock, FaCheckCircle, FaTimesCircle, FaHistory, FaBuilding,
  FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';
import CreateCreditNoteModal from './CreateCreditNoteModal';
import ApplyDiscountModal from './ApplyDiscountModal';
import ApproveRejectModal from './ApproveRejectModal';
import FlatBillingHistoryModal from './FlatBillingHistoryModal';

const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CreditNotesDiscountsContainer({ onBack }) {
  // Current user & role resolution
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  const roleKeys = currentUser.roleKeys || [];
  const isAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'super_admin' ||
    roleKeys.includes('admin') ||
    roleKeys.includes('super_admin');
  const isAccountant = roleKeys.includes('accountant') || currentUser.role === 'accountant';

  // Navigation tab: 'credit_notes' | 'discounts' | 'history'
  const [activeTab, setActiveTab] = useState('credit_notes');

  // Billing Config & Approval Threshold (Section 5.1)
  const [threshold, setThreshold] = useState(5000);

  // Data states
  const [creditNotes, setCreditNotes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedFlatFilter, setSelectedFlatFilter] = useState('');

  // Modals state
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [approvalModalItem, setApprovalModalItem] = useState(null);
  const [approvalModalType, setApprovalModalType] = useState('credit-note');
  const [historyFlat, setHistoryFlat] = useState(null); // { id, name }

  // Load Billing Config for threshold
  const fetchConfig = useCallback(async () => {
    try {
      const res = await apiClient.get('/billing/billing-config');
      if (res.data?.status === 'success' && res.data.data) {
        setThreshold(res.data.data.accountantApprovalThreshold ?? 5000);
      }
    } catch (err) {
      console.error('Failed to load billing config threshold:', err);
    }
  }, []);

  // Load flats list for filter dropdown
  const fetchFlats = useCallback(async () => {
    try {
      const res = await apiClient.get('/flats');
      const list = res.data?.data?.flats || res.data?.flats || (Array.isArray(res.data?.data) ? res.data?.data : []);
      setFlats(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load flats:', err);
    }
  }, []);

  // Fetch Credit Notes
  const fetchCreditNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      if (selectedFlatFilter) params.append('flatId', selectedFlatFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('limit', '50');

      const res = await apiClient.get(`/billing/credit-notes?${params.toString()}`);
      if (res.data?.status === 'success') {
        setCreditNotes(res.data.data?.creditNotes || []);
      }
    } catch (err) {
      console.error('Failed to fetch credit notes:', err);
      toast.error('Failed to load credit notes');
    }
  }, [statusFilter, selectedFlatFilter, search]);

  // Fetch Discounts
  const fetchDiscounts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      if (selectedFlatFilter) params.append('flatId', selectedFlatFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('limit', '50');

      const res = await apiClient.get(`/billing/discounts?${params.toString()}`);
      if (res.data?.status === 'success') {
        setDiscounts(res.data.data?.discounts || []);
      }
    } catch (err) {
      console.error('Failed to fetch discounts:', err);
      toast.error('Failed to load discounts');
    }
  }, [statusFilter, selectedFlatFilter, search]);

  // Combined fetch
  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCreditNotes(), fetchDiscounts()]);
    setLoading(false);
  }, [fetchCreditNotes, fetchDiscounts]);

  useEffect(() => {
    fetchConfig();
    fetchFlats();
  }, [fetchConfig, fetchFlats]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Summary statistics
  const totalCNAmount = creditNotes
    .filter(cn => cn.status === 'approved')
    .reduce((sum, cn) => sum + (cn.amount || 0), 0);

  const totalDiscountAmount = discounts
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const pendingApprovalsCount =
    creditNotes.filter(cn => cn.status === 'pending_approval').length +
    discounts.filter(d => d.status === 'pending_approval').length;

  return (
    <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors w-fit"
        >
          <FaArrowLeft /> Back to Billing Hub
        </button>

        <div className="flex items-center gap-3">
          {(isAdmin || isAccountant) && (
            <>
              <button
                onClick={() => setIsCreditNoteModalOpen(true)}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center gap-2"
              >
                <FaPlus /> Issue Credit Note
              </button>
              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <FaPlus /> Apply Discount
              </button>
            </>
          )}
        </div>
      </div>

      {/* Module Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm border border-gray-200">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Credit Notes & Discounts Management
          </h1>

          <p className="text-sm sm:text-base text-slate-500">
            Manage credit notes for past invoices and apply discounts to upcoming invoices.
          </p>
        </div>
      </div>
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Credit Notes Issued */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <FaFileInvoice />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Credit Notes Approved</div>
            <div className="text-xl font-extrabold text-gray-900">{formatINR(totalCNAmount)}</div>
            <div className="text-[11px] text-gray-500">{creditNotes.filter(c => c.status === 'approved').length} past invoices adjusted</div>
          </div>
        </div>

        {/* Stat 2: Discounts Applied */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            <FaPercent />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Discounts Active</div>
            <div className="text-xl font-extrabold text-gray-900">{formatINR(totalDiscountAmount)}</div>
            <div className="text-[11px] text-gray-500">{discounts.filter(d => d.status === 'approved').length} upcoming discounts</div>
          </div>
        </div>

        {/* Stat 3: Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
            <FaShieldAlt />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Approvals</div>
            <div className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              {pendingApprovalsCount}
              {pendingApprovalsCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse">
                  Action Required
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-500">Requires Committee Admin sign-off</div>
          </div>
        </div>

        {/* Stat 4: Approval Threshold */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
            <FaClock />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Approval Threshold</div>
            <div className="text-xl font-extrabold text-gray-900">{formatINR(threshold)}</div>
            <div className="text-[11px] text-gray-500">Accountant Limit</div>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex bg-gray-200/80 p-1 rounded-2xl w-fit border border-gray-200">
            <button
              onClick={() => setActiveTab('credit_notes')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'credit_notes'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <FaFileInvoice className="text-amber-500" />
              Credit Notes (Past Invoices)
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {creditNotes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('discounts')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'discounts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <FaPercent className="text-blue-500" />
              Discounts (Upcoming Invoices)
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {discounts.length}
              </span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Flat selector */}
            <select
              value={selectedFlatFilter}
              onChange={(e) => setSelectedFlatFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
            >
              <option value="">All Flats</option>
              {flats.map((flat) => {
                const flatNo = flat.flatNumber || flat.flatId;
                const owner = flat.ownerName || flat.primaryOwner?.name || flat.primaryOwner?.fullName || '';
                return (
                  <option key={flat._id} value={flat._id}>
                    Flat {flatNo}{owner ? ` (${owner})` : ''}
                  </option>
                );
              })}
            </select>

            {/* Status selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Search */}
            <div className="relative w-48 sm:w-60">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, Reason..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: CREDIT NOTES TABLE (FR-B6.1) */}
        {activeTab === 'credit_notes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/30 text-gray-500 border-b border-gray-100 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Credit Note ID</th>
                  <th className="py-3.5 px-6">Flat & Resident</th>
                  <th className="py-3.5 px-6">Target Past Invoice</th>
                  <th className="py-3.5 px-6">Credit Amount</th>
                  <th className="py-3.5 px-6">Mandatory Reason (FR-B6.1)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                      <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-amber-500" />
                      Loading credit notes...
                    </td>
                  </tr>
                ) : creditNotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                      No credit notes found matching criteria.
                    </td>
                  </tr>
                ) : (
                  creditNotes.map((cn) => {
                    const flatNum = cn.flatId?.flatNumber || '—';
                    const wing = cn.flatId?.wing || cn.flatId?.blockName || '';
                    const isPending = cn.status === 'pending_approval';

                    return (
                      <tr key={cn._id} className="border-b border-gray-50 hover:bg-amber-50/20 transition-colors text-xs">
                        <td className="py-4 px-6 font-mono font-bold text-gray-900">
                          {cn.noteNumber}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setHistoryFlat({ id: cn.flatId?._id || cn.flatId, name: `Flat ${flatNum}` })}
                            className="font-bold text-gray-900 hover:text-orange-600 transition-colors flex items-center gap-1.5"
                          >
                            <FaBuilding className="text-gray-400 text-xs" />
                            Flat {flatNum} {wing ? `(${wing})` : ''}
                          </button>
                          <div className="text-[11px] text-gray-400">{cn.createdBy?.name ? `Created by ${cn.createdBy.name}` : ''}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-800">
                            {cn.invoiceId?.invoiceNumber || 'Prior Bill Adjustment'}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {cn.invoiceId?.billingPeriod ? `Period: ${cn.invoiceId.billingPeriod}` : 'Direct Account Credit'}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-amber-700 text-sm">
                          -{formatINR(cn.amount)}
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-xs line-clamp-2" title={cn.reason}>
                            "{cn.reason}"
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${cn.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            cn.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {cn.status === 'approved' && <FaCheckCircle className="text-emerald-500" />}
                            {cn.status === 'rejected' && <FaTimesCircle className="text-red-500" />}
                            {cn.status === 'pending_approval' && <FaClock className="text-amber-500" />}
                            {cn.status?.toUpperCase()}
                          </span>
                          {cn.rejectionReason && (
                            <div className="text-[10px] text-red-500 mt-1" title={cn.rejectionReason}>
                              Rejection: {cn.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Committee Admin Approval Action (FR-B6.3) */}
                            {isPending && isAdmin && (
                              <button
                                onClick={() => {
                                  setApprovalModalItem(cn);
                                  setApprovalModalType('credit-note');
                                }}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                Review
                              </button>
                            )}

                            {/* View Flat History (FR-B6.4) */}
                            <button
                              onClick={() => setHistoryFlat({ id: cn.flatId?._id || cn.flatId, name: `Flat ${flatNum}` })}
                              title="View flat billing history with attached reason"
                              className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-xs transition-colors"
                            >
                              <FaHistory />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: DISCOUNTS TABLE (FR-B6.2) */}
        {activeTab === 'discounts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/30 text-gray-500 border-b border-gray-100 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Discount Code</th>
                  <th className="py-3.5 px-6">Flat & Resident</th>
                  <th className="py-3.5 px-6">Target Charge Head</th>
                  <th className="py-3.5 px-6">Discount Amount</th>
                  <th className="py-3.5 px-6">Mandatory Reason (FR-B6.2)</th>
                  <th className="py-3.5 px-6">Upcoming Application</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                      <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-blue-500" />
                      Loading discounts...
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                      No discounts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  discounts.map((disc) => {
                    const flatNum = disc.flatId?.flatNumber || '—';
                    const wing = disc.flatId?.wing || disc.flatId?.blockName || '';
                    const isPending = disc.status === 'pending_approval';

                    return (
                      <tr key={disc._id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors text-xs">
                        <td className="py-4 px-6 font-mono font-bold text-gray-900">
                          {disc.discountCode}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setHistoryFlat({ id: disc.flatId?._id || disc.flatId, name: `Flat ${flatNum}` })}
                            className="font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                          >
                            <FaBuilding className="text-gray-400 text-xs" />
                            Flat {flatNum} {wing ? `(${wing})` : ''}
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          {disc.chargeHeadId ? (
                            <span className="font-semibold text-gray-800">
                              {disc.chargeHeadId.name} <span className="font-mono text-gray-400 text-[10px]">({disc.chargeHeadId.code})</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Entire Upcoming Bill</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-blue-700 text-sm">
                          -{formatINR(disc.amount)}
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-xs line-clamp-2" title={disc.reason}>
                            "{disc.reason}"
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {disc.isApplied ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Applied to {disc.appliedInvoiceId?.invoiceNumber || 'Invoice'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              Queued for Next Bill
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${disc.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            disc.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {disc.status === 'approved' && <FaCheckCircle className="text-emerald-500" />}
                            {disc.status === 'rejected' && <FaTimesCircle className="text-red-500" />}
                            {disc.status === 'pending_approval' && <FaClock className="text-amber-500" />}
                            {disc.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Committee Admin Approval Action (FR-B6.3) */}
                            {isPending && isAdmin && (
                              <button
                                onClick={() => {
                                  setApprovalModalItem(disc);
                                  setApprovalModalType('discount');
                                }}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                Review
                              </button>
                            )}

                            {/* View Flat History (FR-B6.4) */}
                            <button
                              onClick={() => setHistoryFlat({ id: disc.flatId?._id || disc.flatId, name: `Flat ${flatNum}` })}
                              title="View flat billing history with attached reason"
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs transition-colors"
                            >
                              <FaHistory />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCreditNoteModal
        isOpen={isCreditNoteModalOpen}
        onClose={() => setIsCreditNoteModalOpen(false)}
        onSuccess={refreshData}
        threshold={threshold}
        isAdmin={isAdmin}
      />

      <ApplyDiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onSuccess={refreshData}
        threshold={threshold}
        isAdmin={isAdmin}
      />

      <ApproveRejectModal
        isOpen={Boolean(approvalModalItem)}
        onClose={() => setApprovalModalItem(null)}
        item={approvalModalItem}
        type={approvalModalType}
        onSuccess={refreshData}
      />

      <FlatBillingHistoryModal
        isOpen={Boolean(historyFlat)}
        onClose={() => setHistoryFlat(null)}
        flatId={historyFlat?.id}
        flatName={historyFlat?.name}
      />
    </div>
  );
}
