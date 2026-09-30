import { useState, useEffect, useCallback } from 'react';
import {
  FaArrowLeft, FaPlus, FaSearch, FaFilter, FaSpinner, FaEye,
  FaCheck, FaTimes, FaMoneyCheckAlt, FaChevronLeft, FaChevronRight,
  FaStore, FaClock, FaCheckCircle, FaTimesCircle, FaFileInvoiceDollar
} from 'react-icons/fa';
import vendorPaymentApi from '../../../../services/vendorPaymentApi';
import { usePermissions } from '../../../../context/PermissionsContext';
import toast from 'react-hot-toast';
import CreateVendorPaymentModal from './CreateVendorPaymentModal';
import ApproveRejectModal from './ApproveRejectModal';
import MarkPaidModal from './MarkPaidModal';
import VendorPaymentDetailModal from './VendorPaymentDetailModal';

const STATUS_BADGES = {
  pending_approval: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Pending Approval',
    icon: FaClock,
  },
  approved: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Approved',
    icon: FaCheckCircle,
  },
  paid: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Paid',
    icon: FaCheckCircle,
  },
  rejected: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    label: 'Rejected',
    icon: FaTimesCircle,
  },
};

const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export default function VendorPaymentsPage({ onBack }) {
  const { permissions } = usePermissions();

  // Role resolution
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

  // Permission checks
  const canCreate = isAdmin || isAccountant || Boolean(permissions?.['billing.vendorPayment.create']?.enabled);
  const canApprove = isAdmin || Boolean(permissions?.['billing.vendorPayment.approve']?.enabled);
  const canMarkPaid = isAdmin || isAccountant || Boolean(permissions?.['billing.vendorPayment.markPaid']?.enabled);

  // Data state
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 10;

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Summary Metrics
  const [summary, setSummary] = useState({
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    paidCount: 0,
    totalDisbursed: 0,
  });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailPaymentId, setDetailPaymentId] = useState(null);
  const [actionPayment, setActionPayment] = useState(null);
  const [actionType, setActionType] = useState('approve'); // 'approve' | 'reject'
  const [isApproveRejectOpen, setIsApproveRejectOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);

  // Fetch payments list
  const fetchPayments = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: LIMIT,
        };
        if (search.trim()) params.search = search.trim();
        if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await vendorPaymentApi.getVendorPayments(params);
        const data = res.data?.data;
        const list = data?.payments || [];
        setPayments(list);

        const pag = data?.pagination || {};
        setTotalPages(pag.pages || 1);
        setTotalCount(pag.total || 0);

        // Calculate summary from current list / overview
        const pending = list.filter((p) => String(p.status).toLowerCase() === 'pending_approval').length;
        const approved = list.filter((p) => String(p.status).toLowerCase() === 'approved').length;
        const paidList = list.filter((p) => String(p.status).toLowerCase() === 'paid');
        const totalPaidAmount = paidList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        setSummary({
          totalCount: pag.total || list.length,
          pendingCount: pending,
          approvedCount: approved,
          paidCount: paidList.length,
          totalDisbursed: totalPaidAmount,
        });
      } catch {
        toast.error('Failed to load vendor payments.');
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, startDate, endDate]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments(page);
  }, [fetchPayments, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const openApproveModal = (p) => {
    setActionPayment(p);
    setActionType('approve');
    setIsApproveRejectOpen(true);
  };

  const openRejectModal = (p) => {
    setActionPayment(p);
    setActionType('reject');
    setIsApproveRejectOpen(true);
  };

  const openMarkPaidModal = (p) => {
    setActionPayment(p);
    setIsMarkPaidOpen(true);
  };

  return (
    <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto space-y-6">
      {/* Top Bar / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors w-fit"
        >
          <FaArrowLeft /> Back to Billing Hub
        </button>

        {canCreate && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-lg shadow-orange-600/20 transition-all active:scale-95 w-fit"
          >
            <FaPlus /> New Vendor Payment
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent rounded-3xl border border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl shadow-sm shrink-0">
            <FaStore />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Vendor Payments & Disbursals
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create, approve, and disburse vendor invoices with automatic ledger & bank account posting.
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Payments</span>
            <span className="text-lg font-black text-gray-900">{summary.totalCount}</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Pending Approval</span>
            <span className="text-lg font-black text-amber-600">{summary.pendingCount}</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Paid Disbursals</span>
            <span className="text-lg font-black text-emerald-600">{summary.paidCount}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Payment #, Vendor, or Bill Ref..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </form>

          {/* Quick Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'pending_approval', 'approved', 'paid', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${statusFilter === st
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {st === 'ALL' ? 'All Payments' : st.replace('_', ' ')}
              </button>
            ))}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border text-sm transition-colors ${showFilters || startDate || endDate
                  ? 'bg-orange-50 border-orange-200 text-orange-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              title="More Filters"
            >
              <FaFilter />
            </button>
          </div>
        </div>

        {/* Collapsible Date Range Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs text-orange-600 font-bold hover:underline ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="py-4 px-6">Payment #</th>
                <th className="py-4 px-6">Vendor</th>
                <th className="py-4 px-6">Bill Ref</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Mode</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Requested</th>
                <th className="py-4 px-6">Paid On</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <FaSpinner className="animate-spin text-2xl text-orange-500 mx-auto mb-2" />
                    Loading vendor payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400">
                    <FaFileInvoiceDollar className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">No vendor payments found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const statusKey = String(p.status || '').toLowerCase();
                  const badge = STATUS_BADGES[statusKey] || {
                    bg: 'bg-gray-100 text-gray-600 border-gray-200',
                    label: p.status,
                    icon: FaClock,
                  };
                  const BadgeIcon = badge.icon;

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-orange-50/20 transition-colors group cursor-pointer"
                      onClick={() => setDetailPaymentId(p._id)}
                    >
                      {/* Payment Number */}
                      <td className="py-4 px-6 font-mono font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {p.paymentNumber}
                      </td>

                      {/* Vendor */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{p.vendorName || '-'}</div>
                      </td>

                      {/* Bill Reference */}
                      <td className="py-4 px-6 text-gray-600 font-mono text-xs">
                        {p.billReference || '-'}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 font-black text-gray-900">
                        {formatINR(p.amount)}
                      </td>

                      {/* Payment Mode */}
                      <td className="py-4 px-6">
                        <span className="text-xs text-gray-600 font-medium capitalize bg-gray-100 px-2.5 py-1 rounded-lg">
                          {p.paymentMode?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          <BadgeIcon className="text-[10px]" />
                          {badge.label}
                        </span>
                      </td>

                      {/* Requested Date */}
                      <td className="py-4 px-6 text-xs text-gray-500">
                        {formatDate(p.createdAt)}
                      </td>

                      {/* Paid Date */}
                      <td className="py-4 px-6 text-xs text-gray-500">
                        {formatDate(p.paidAt)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-6 text-right"
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => setDetailPaymentId(p._id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>

                          {/* Committee Admin Approve/Reject for pending_approval */}
                          {statusKey === 'pending_approval' && canApprove && (
                            <>
                              <button
                                onClick={() => openApproveModal(p)}
                                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Approve Payment"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => openRejectModal(p)}
                                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                                title="Reject Payment"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}

                          {/* Mark Paid action for approved */}
                          {statusKey === 'approved' && canMarkPaid && (
                            <button
                              onClick={() => openMarkPaidModal(p)}
                              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 transition-all flex items-center gap-1"
                              title="Mark as Paid"
                            >
                              <FaMoneyCheckAlt className="text-xs" /> Disburse
                            </button>
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

        {/* Pagination Toolbar */}
        {!loading && totalCount > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              Showing <span className="font-bold text-gray-800">{(page - 1) * LIMIT + 1}</span> to{' '}
              <span className="font-bold text-gray-800">{Math.min(page * LIMIT, totalCount)}</span> of{' '}
              <span className="font-bold text-gray-800">{totalCount}</span> payments
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <FaChevronLeft />
              </button>

              <span className="px-3 py-1 font-bold text-gray-800">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateVendorPaymentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchPayments(1)}
      />

      <ApproveRejectModal
        isOpen={isApproveRejectOpen}
        onClose={() => setIsApproveRejectOpen(false)}
        payment={actionPayment}
        actionType={actionType}
        onSuccess={() => fetchPayments(page)}
      />

      <MarkPaidModal
        isOpen={isMarkPaidOpen}
        onClose={() => setIsMarkPaidOpen(false)}
        payment={actionPayment}
        onSuccess={() => fetchPayments(page)}
      />

      <VendorPaymentDetailModal
        isOpen={Boolean(detailPaymentId)}
        onClose={() => setDetailPaymentId(null)}
        paymentId={detailPaymentId}
        canApprove={canApprove}
        canMarkPaid={canMarkPaid}
        onApproveClick={openApproveModal}
        onRejectClick={openRejectModal}
        onMarkPaidClick={openMarkPaidModal}
      />
    </div>
  );
}
