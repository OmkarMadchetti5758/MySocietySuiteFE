import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch, FaSpinner, FaReceipt, FaDownload, FaPrint, FaEnvelope,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><FaReceipt /> Payment Receipt</h2>
            <p className="text-xs text-emerald-200 mt-0.5">{receipt.receiptNumber}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1">
              <FaPrint /> Print
            </button>
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              ✕ Close
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6" id="receipt-printable">
          <div className="text-center mb-5 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-black text-gray-900">{receipt.societyName || 'MySociety'}</h3>
            <p className="text-xs text-gray-400 mt-1">Payment Receipt</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-5">
            {[
              ['Receipt No.', receipt.receiptNumber],
              ['Payment Date', receipt.generatedAt ? new Date(receipt.generatedAt).toLocaleDateString('en-IN') : '—'],
              ['Resident Name', receipt.residentName],
              ['Flat', `${receipt.blockName || ''} - ${receipt.flatNumber || ''}`.trim()],
              ['Invoice No.', receipt.invoiceNumber || '—'],
              ['Payment Mode', receipt.paymentMode],
              ['Payment Account', receipt.paymentAccountName],
              ['Transaction Ref.', receipt.transactionRef || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[11px] text-gray-400 font-medium">{label}</div>
                <div className="font-semibold text-gray-800 text-xs mt-0.5">{value || '—'}</div>
              </div>
            ))}
          </div>

          {/* Amount breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invoice Total</span>
              <span className="font-semibold">{formatINR(receipt.invoiceTotalAmount)}</span>
            </div>
            {receipt.previousPaidAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Previously Paid</span>
                <span className="font-semibold text-emerald-600">{formatINR(receipt.previousPaidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
              <span className="font-bold text-gray-800">Current Payment</span>
              <span className="font-black text-emerald-700 text-base">{formatINR(receipt.currentPaidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining Balance</span>
              <span className={`font-bold ${receipt.remainingBalance > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                {formatINR(receipt.remainingBalance)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-center">
            <p className="text-xs text-emerald-700 font-semibold">{receipt.amountInWords || ''}</p>
          </div>

          <div className="mt-4 text-center text-[11px] text-gray-400">
            Generated on {receipt.generatedAt ? new Date(receipt.generatedAt).toLocaleString('en-IN') : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptsTab() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const LIMIT = 15;

  const fetchReceipts = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: LIMIT });
      if (search) params.append('search', search);
      // Receipts come from payments list filtered to those with receiptNumber
      const res = await apiClient.get(`/payments/list?${params.toString()}`);
      const allPayments = res.data?.data || [];
      // Show only payments that have a receipt
      const withReceipts = allPayments.filter(p => p.receiptNumber);
      setReceipts(withReceipts);
      const meta = res.data?.meta || {};
      setTotalPages(meta.totalPages || 1);
      setTotal(meta.total || 0);
    } catch {
      toast.error('Failed to load receipts.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchReceipts(page);
  }, [fetchReceipts, page]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <FaReceipt className="text-emerald-500 text-lg" />
          <h2 className="font-bold text-gray-800">Payment Receipts</h2>
        </div>
        <form onSubmit={e => { e.preventDefault(); setPage(1); fetchReceipts(1); }} className="flex gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search receipt no., payment ID, resident…"
              className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none w-64"
            />
          </div>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <FaSpinner className="animate-spin text-emerald-400 text-2xl mr-3" />
            <span className="text-gray-500">Loading receipts...</span>
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center p-16">
            <FaReceipt className="text-5xl text-emerald-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-1">No receipts found</h3>
            <p className="text-sm text-gray-400">Receipts are automatically generated when payments are recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Receipt No.', 'Payment ID', 'Date', 'Flat', 'Resident', 'Amount', 'Mode', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {receipts.map(p => (
                  <tr key={p._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-emerald-700">{p.receiptNumber}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{p.paymentNumber}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-800">{p.flatId?.flatNumber || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{p.userId?.name || '—'}</td>
                    <td className="px-4 py-3 font-bold text-sm text-emerald-700">{formatINR(p.amount)}</td>
                    <td className="px-4 py-3 text-xs"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium">{p.paymentMode}</span></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedReceipt({ ...p, receiptNumber: p.receiptNumber, paymentMode: p.paymentMode, residentName: p.userId?.name, flatNumber: p.flatId?.flatNumber, blockName: p.flatId?.blockName, currentPaidAmount: p.amount, invoiceTotalAmount: p.invoiceId?.totalAmount, previousPaidAmount: (p.invoiceId?.paidAmount || 0) - p.amount, remainingBalance: Math.max(0, (p.invoiceId?.totalAmount || 0) - (p.invoiceId?.paidAmount || 0)), invoiceNumber: p.invoiceId?.invoiceNumber, paymentAccountName: p.paymentAccountName, transactionRef: p.gatewayTransactionId || p.transactionReference, generatedAt: p.createdAt })}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <FaReceipt className="text-[10px]" /> View Receipt
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

      {selectedReceipt && (
        <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}
