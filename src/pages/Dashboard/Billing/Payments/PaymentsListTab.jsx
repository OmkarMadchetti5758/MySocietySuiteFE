import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch, FaFilter, FaEye, FaDownload, FaSpinner, FaPlus,
  FaTimes, FaReceipt, FaCheckCircle, FaTimesCircle, FaClock,
  FaRupeeSign, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';
import RecordOfflinePaymentModal from './RecordOfflinePaymentModal';
import PaymentDetailDrawer from './PaymentDetailDrawer';

const STATUS_COLORS = {
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INITIATED: 'bg-blue-50 text-blue-700 border-blue-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const RECON_COLORS = {
  RECONCILED: 'bg-emerald-50 text-emerald-600',
  UNRECONCILED: 'bg-gray-100 text-gray-500',
  MATCH_FAILED: 'bg-red-50 text-red-600',
  MANUAL_REVIEW: 'bg-amber-50 text-amber-600',
};

const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function PaymentsListTab({ isAdmin, isAccountant }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: LIMIT });
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (statusFilter) params.append('paymentStatus', statusFilter);
      if (sourceFilter) params.append('paymentSource', sourceFilter);
      if (modeFilter) params.append('paymentMode', modeFilter);

      const res = await apiClient.get(`/payments/list?${params.toString()}`);
      setPayments(res.data?.data || []);
      const meta = res.data?.meta || {};
      setTotalPages(meta.totalPages || 1);
      setTotal(meta.total || 0);
    } catch (err) {
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, statusFilter, sourceFilter, modeFilter]);

  useEffect(() => {
    fetchPayments(page);
  }, [fetchPayments, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setSourceFilter('');
    setModeFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-0 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Payment ID, Invoice, Resident, Transaction…"
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors">
            Search
          </button>
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${showFilters ? 'bg-orange-50 border-orange-300 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
        >
          <FaFilter className="text-xs" /> Filters
        </button>

        {(isAdmin || isAccountant) && (
          <button
            onClick={() => setShowOfflineModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            <FaPlus className="text-xs" /> Record Payment
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">From Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">To Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Payment Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="INITIATED">Initiated</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Payment Source</label>
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
                <option value="">All Sources</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Payment Mode</label>
              <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
                <option value="">All Modes</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { setPage(1); fetchPayments(1); }} className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors">Apply Filters</button>
            <button onClick={handleClearFilters} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Clear</button>
          </div>
        </div>
      )}

      {/* Total count */}
      <div className="text-sm text-gray-500">
        {loading ? 'Loading...' : `${total.toLocaleString('en-IN')} payment${total !== 1 ? 's' : ''} found`}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <FaSpinner className="animate-spin text-orange-400 text-2xl mr-3" />
            <span className="text-gray-500">Loading payments...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center p-16 text-gray-400">
            <FaRupeeSign className="text-5xl mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-gray-500 mb-1">No payments found</h3>
            <p className="text-sm">Try adjusting your filters or date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Payment ID', 'Date', 'Flat', 'Resident', 'Invoice', 'Amount', 'Mode', 'Source', 'Status', 'Reconciliation', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-blue-600">{p.paymentNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">
                      {p.flatId?.flatNumber || '—'}
                      {p.flatId?.blockName && <span className="text-gray-400 ml-1">({p.flatId.blockName})</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                      {p.userId?.name || 
                       (p.userId?.firstName ? `${p.userId.firstName} ${p.userId.lastName || ''}`.trim() : null) || 
                       p.invoiceId?.residentName || 
                       p.flatId?.tenantName || 
                       p.flatId?.ownerName || 
                       '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-indigo-600">
                        {p.invoiceId?.invoiceNumber || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-sm text-gray-900">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">{p.paymentMode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold border ${p.paymentSource === 'ONLINE' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                        {p.paymentSource}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold border ${STATUS_COLORS[p.paymentStatus] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-1 rounded-lg font-semibold ${RECON_COLORS[p.reconciliationStatus] || 'bg-gray-100 text-gray-500'}`}>
                        {p.reconciliationStatus?.replace('_', ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <FaEye className="text-[10px]" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Offline Payment Modal */}
      <RecordOfflinePaymentModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        onSuccess={() => { fetchPayments(1); setPage(1); }}
      />

      {/* Payment Detail Drawer */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
}
