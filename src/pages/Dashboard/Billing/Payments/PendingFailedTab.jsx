import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch, FaSpinner, FaExclamationTriangle, FaLink, FaCheckCircle,
  FaTimesCircle, FaClock, FaChevronLeft, FaChevronRight, FaTimes
} from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  INITIATED: 'bg-blue-50 text-blue-700 border-blue-200',
};

const RECON_COLORS = {
  MATCH_FAILED: 'bg-red-50 text-red-600',
  UNRECONCILED: 'bg-gray-100 text-gray-500',
  MANUAL_REVIEW: 'bg-amber-50 text-amber-600',
};

const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

// Manual Reconcile Modal
function ManualReconcileModal({ payment, onClose, onSuccess }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ status: 'GENERATED,PARTIALLY_PAID,OVERDUE', limit: 50 });
        if (payment.flatId?._id) params.append('flatId', payment.flatId._id);
        const res = await apiClient.get(`/billing/invoices?${params.toString()}`);
        const data = res.data?.data;
        setInvoices(data?.invoices || (Array.isArray(data) ? data : []));
      } catch {
        toast.error('Failed to load possible invoices.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [payment]);

  const handleMatch = async () => {
    if (!selectedInvoice) {
      toast.error('Please select an invoice to match.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiClient.post('/payments/manual-reconcile', {
        paymentId: payment._id,
        invoiceId: selectedInvoice,
      });
      toast.success(res.data?.message || 'Payment reconciled successfully.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reconciliation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Match Payment to Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <FaTimes />
          </button>
        </div>

        {/* Payment Summary */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-gray-500">Payment</span>
              <div className="font-bold text-orange-700">{payment.paymentNumber}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Amount</span>
              <div className="font-bold text-orange-700">{formatINR(payment.amount)}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Resident / Flat</span>
              <div className="font-semibold text-gray-800 text-xs">
                {payment.userId?.name || '—'} — {payment.flatId?.flatNumber || '—'}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Gateway Txn</span>
              <div className="font-mono text-xs text-gray-600 truncate">{payment.gatewayTransactionId || '—'}</div>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Select Matching Invoice</label>
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 p-4">
              <FaSpinner className="animate-spin text-orange-400" /> Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-xs text-gray-400 p-4 bg-gray-50 rounded-xl text-center">No pending invoices found for this flat.</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {invoices.map(inv => {
                const totalPayable = (inv.totalAmount || 0) + (inv.fineAmount || 0);
                const remaining = Math.max(0, totalPayable - (inv.paidAmount || 0));
                const isSelected = selectedInvoice === inv._id;
                return (
                  <label
                    key={inv._id}
                    className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="invoice"
                      value={inv._id}
                      checked={isSelected}
                      onChange={() => setSelectedInvoice(inv._id)}
                      className="accent-orange-500 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-bold text-indigo-700">{inv.invoiceNumber}</span>
                        <span className="text-xs font-bold text-orange-600">{formatINR(remaining)} due</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Period: {inv.billingPeriod} · Total: {formatINR(inv.totalAmount)} · Paid: {formatINR(inv.paidAmount || 0)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600">Cancel</button>
          <button
            onClick={handleMatch}
            disabled={!selectedInvoice || submitting}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaLink />}
            {submitting ? 'Matching...' : 'Match Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PendingFailedTab({ isAdmin, isAccountant }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [reconcileTarget, setReconcileTarget] = useState(null);
  const LIMIT = 15;

  const fetchItems = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: LIMIT });
      if (search) params.append('search', search);
      const res = await apiClient.get(`/payments/pending-failed?${params.toString()}`);
      setItems(res.data?.data || []);
      const meta = res.data?.meta || {};
      setTotalPages(meta.totalPages || 1);
      setTotal(meta.total || 0);
    } catch {
      toast.error('Failed to load pending/failed payments.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchItems(page);
  }, [fetchItems, page]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
        <FaExclamationTriangle className="text-red-400 text-lg flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-800 text-sm">Pending, Failed & Unmatched Payments</h3>
          <p className="text-xs text-red-600 mt-0.5">
            Review failed payments, pending transactions, and successful online payments that could not be automatically matched to an invoice.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Payment ID, Gateway Txn…"
            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>
        <button
          onClick={() => { setPage(1); fetchItems(1); }}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
        >
          Search
        </button>
      </div>

      <div className="text-xs text-gray-500">{loading ? 'Loading...' : `${total.toLocaleString()} item${total !== 1 ? 's' : ''}`}</div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <FaSpinner className="animate-spin text-red-400 text-2xl mr-3" />
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-16">
            <FaCheckCircle className="text-5xl text-emerald-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">No unmatched payments</h3>
            <p className="text-sm text-gray-400">All payments are either reconciled or there are no exceptions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Payment ID', 'Date', 'Amount', 'Resident', 'Flat', 'Gateway Ref', 'Status', 'Reconciliation', 'Failure Reason', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(p => (
                  <tr key={p._id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{p.paymentNumber}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-sm">{formatINR(p.amount)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{p.userId?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">{p.flatId?.flatNumber || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-xs truncate">{p.gatewayTransactionId || p.transactionReference || '—'}</td>
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
                    <td className="px-4 py-3 text-xs text-red-600 max-w-xs truncate">{p.failureReason || '—'}</td>
                    <td className="px-4 py-3">
                      {(isAdmin || isAccountant) && p.paymentStatus === 'SUCCESS' && p.reconciliationStatus !== 'RECONCILED' && (
                        <button
                          onClick={() => setReconcileTarget(p)}
                          className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-800 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
                        >
                          <FaLink className="text-[10px]" /> Match Invoice
                        </button>
                      )}
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors">
                <FaChevronLeft className="text-xs" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors">
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Reconcile Modal */}
      {reconcileTarget && (
        <ManualReconcileModal
          payment={reconcileTarget}
          onClose={() => setReconcileTarget(null)}
          onSuccess={() => { fetchItems(1); setPage(1); setReconcileTarget(null); }}
        />
      )}
    </div>
  );
}
