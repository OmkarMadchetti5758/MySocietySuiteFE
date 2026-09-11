import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCheck, FaMoneyBillWave, FaCreditCard, FaDownload } from 'react-icons/fa';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  GENERATED: { label: 'Generated', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  PAID: { label: 'Paid', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  PARTIALLY_PAID: { label: 'Partial', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  partially_paid: { label: 'Partial', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  OVERDUE: { label: 'Overdue', color: 'bg-red-50 text-red-600 border-red-100' },
  overdue: { label: 'Overdue', color: 'bg-red-50 text-red-600 border-red-100' },
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  unpaid: { label: 'Unpaid', color: 'bg-orange-50 text-orange-600 border-orange-100' },
};

const PAYMENT_MODES = ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'OTHER'];

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const periodLabel = (p) => {
  if (!p) return '—';
  if (p.includes('-Q')) {
    const [y, q] = p.split('-');
    return `${q} ${y}`;
  }
  const [y, m] = p.split('-');
  return new Date(y, Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-500 border-gray-200' };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ── Invoice Detail Modal ──────────────────────────────────────────────────────
export const InvoiceDetailModal = ({ invoice, onClose, onRecordPayment, currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);

  const roleKeys = currentUser?.roleKeys || [];
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || roleKeys.includes('admin');
  const isAccountant = roleKeys.includes('accountant');
  const canRecordPayment = isAdmin || isAccountant;
  const isResident = currentUser?.role === 'resident_owner' || roleKeys.includes('resident_owner') || (!isAdmin && !isAccountant);

  const balance = (invoice.totalAmount || 0) - (invoice.paidAmount || 0);

  useEffect(() => {
    if (activeTab === 'payments') {
      setLoadingPayments(true);
      const url = isResident ? `/billing/my/invoices/${invoice._id}` : `/billing/invoices/${invoice._id}/payments`;
      apiClient.get(url)
        .then(res => {
          const list = res.data?.data?.payments || res.data?.data?.paymentHistory || [];
          setPayments(list);
        })
        .catch(() => { })
        .finally(() => setLoadingPayments(false));
    }
  }, [activeTab, invoice._id, isResident]);

  const handleOnlinePayment = async () => {
    setPayingOnline(true);
    try {
      await apiClient.post(`/billing/my/invoices/${invoice._id}/pay`, {
        amountPaid: balance,
        paymentMode: 'ONLINE',
      });
      toast.success('Online payment initiated successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPayingOnline(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white shrink-0">
          <div>
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">{invoice.invoiceNumber}</div>
            <h3 className="text-lg font-bold text-gray-900">{invoice.residentName || 'Resident'}</h3>
            <p className="text-sm text-gray-500">{invoice.flatNumber || invoice.flatId} • {periodLabel(invoice.billingPeriod)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={invoice.status} />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <FaTimes className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0 px-6">
          {['overview', 'charges', 'payments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold capitalize border-b-2 transition-all ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Invoice Date', value: fmtDate(invoice.invoiceDate || invoice.createdAt) },
                  { label: 'Due Date', value: fmtDate(invoice.dueDate) },
                  { label: 'Billing Period', value: periodLabel(invoice.billingPeriod) },
                  { label: 'Generated By', value: invoice.generatedBy || 'Society Admin' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-2xl p-4">
                    <div className="text-xs text-gray-500 mb-1">{label}</div>
                    <div className="font-bold text-gray-900 text-sm">{value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Amount Summary</div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">{fmt(invoice.subTotal)}</span></div>
                  {(invoice.totalGst > 0) && <div className="flex justify-between"><span className="text-gray-600">GST (CGST + SGST)</span><span className="font-semibold">{fmt(invoice.totalGst)}</span></div>}
                  {(invoice.arrearsAmount > 0) && <div className="flex justify-between"><span className="text-amber-700">Previous Arrears</span><span className="font-semibold text-amber-700">{fmt(invoice.arrearsAmount)}</span></div>}
                  {(invoice.fineAmount > 0) && <div className="flex justify-between"><span className="text-red-600">Fine</span><span className="font-semibold text-red-600">{fmt(invoice.fineAmount)}</span></div>}
                  {(invoice.discountAmount > 0) && <div className="flex justify-between"><span className="text-emerald-700">Discount</span><span className="font-semibold text-emerald-700">-{fmt(invoice.discountAmount)}</span></div>}
                  {(invoice.creditNoteAmount > 0) && <div className="flex justify-between"><span className="text-emerald-700">Credit Note</span><span className="font-semibold text-emerald-700">-{fmt(invoice.creditNoteAmount)}</span></div>}
                  <div className="border-t border-orange-200 pt-2.5 flex justify-between font-black text-gray-900 text-base">
                    <span>Total Payable</span><span>{fmt(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700"><span>Paid</span><span className="font-bold">{fmt(invoice.paidAmount)}</span></div>
                  <div className={`flex justify-between font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    <span>Balance</span><span>{fmt(balance)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'charges' && (
            <div className="space-y-3">
              {(invoice.lineItems || []).length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">No charge details available</div>
              ) : (
                invoice.lineItems.map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.chargeHeadName}</div>
                      <div className="text-xs text-gray-500">
                        {item.calculationType === 'PER_SQ_FT'
                          ? `₹${item.rate} × ${item.quantity} sq.ft`
                          : `Fixed`}
                        {item.gstApplicable && ` + GST ${item.gstRate}%`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{fmt(item.totalAmount)}</div>
                      {item.gstAmount > 0 && <div className="text-xs text-gray-400">incl. {fmt(item.gstAmount)} GST</div>}
                    </div>
                  </div>
                ))
              )}
              {(invoice.totalGst > 0) && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mt-4">
                  <div className="text-xs font-bold text-indigo-600 mb-2">GST Breakdown</div>
                  <div className="flex justify-between text-sm"><span>CGST</span><span>{fmt(invoice.cgst)}</span></div>
                  <div className="flex justify-between text-sm"><span>SGST</span><span>{fmt(invoice.sgst)}</span></div>
                  <div className="flex justify-between text-sm font-bold border-t border-indigo-200 pt-1 mt-1"><span>Total GST</span><span>{fmt(invoice.totalGst)}</span></div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              {loadingPayments ? (
                <div className="text-center py-8"><FaSpinner className="animate-spin text-orange-500 text-2xl mx-auto" /></div>
              ) : payments.length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">No payments recorded yet</div>
              ) : (
                payments.map((p, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{fmt(p.amountPaid)}</div>
                      <div className="text-xs text-gray-500">{p.paymentMode} • {fmtDate(p.paymentDate)}</div>
                      {p.referenceNumber && <div className="text-xs text-gray-400">Ref: {p.referenceNumber}</div>}
                      {p.receiptNumber && <div className="text-xs text-emerald-600 font-mono">{p.receiptNumber}</div>}
                    </div>
                    {p.paymentAccount && <div className="text-xs text-gray-500 text-right max-w-[120px]">{p.paymentAccount}</div>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <FaDownload className="text-xs" /> Print / PDF
          </button>

          {canRecordPayment && !['PAID', 'paid', 'CANCELLED'].includes(invoice.status) && balance > 0 && (
            <button
              onClick={() => { onClose(); onRecordPayment(invoice); }}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <FaMoneyBillWave /> Record Payment
            </button>
          )}

          {isResident && !['PAID', 'paid', 'CANCELLED'].includes(invoice.status) && balance > 0 && (
            <button
              onClick={handleOnlinePayment}
              disabled={payingOnline}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {payingOnline ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
              {payingOnline ? 'Processing...' : 'Pay Online'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Record Payment Modal ──────────────────────────────────────────────────────
export const RecordPaymentModal = ({ invoice, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    amountPaid: '',
    paymentMode: 'CASH',
    paymentAccount: '',
    referenceNumber: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const balance = (invoice.totalAmount || 0) - (invoice.paidAmount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amountPaid || Number(form.amountPaid) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await apiClient.post(`/billing/invoices/${invoice._id}/payments`, {
        ...form,
        amountPaid: Number(form.amountPaid),
      });
      toast.success('Payment recorded successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fade-in-up">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Record Payment</h3>
            <p className="text-xs text-gray-500 mt-0.5">{invoice.invoiceNumber} • Balance: {fmt(balance)}</p>
          </div>
          <button onClick={onClose}><FaTimes className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (₹) *</label>
            <input
              type="number" min="0.01" step="0.01" required
              value={form.amountPaid}
              onChange={e => setForm({ ...form, amountPaid: e.target.value })}
              placeholder={`Max: ₹${balance.toFixed(2)}`}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500"
            />
            {Number(form.amountPaid) > balance && (
              <p className="text-xs text-amber-600 mt-1">⚠ Amount exceeds balance. Excess will be noted.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Mode</label>
              <select
                value={form.paymentMode}
                onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              >
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Date</label>
              <input
                type="date"
                value={form.paymentDate}
                onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Account</label>
            <input
              type="text"
              value={form.paymentAccount}
              onChange={e => setForm({ ...form, paymentAccount: e.target.value })}
              placeholder="e.g. HDFC — Collection Account"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reference / Cheque No.</label>
            <input
              type="text"
              value={form.referenceNumber}
              onChange={e => setForm({ ...form, referenceNumber: e.target.value })}
              placeholder="Transaction ID / Cheque number"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              {saving ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
