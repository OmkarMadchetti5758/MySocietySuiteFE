import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSpinner, FaMoneyCheckAlt, FaUniversity } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import vendorPaymentApi from '../../../../services/vendorPaymentApi';
import toast from 'react-hot-toast';

export default function MarkPaidModal({ isOpen, onClose, payment, onSuccess }) {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await apiClient.get('/reconciliation/accounts?status=ACTIVE');
      const data = res.data?.data?.accounts || res.data?.data || [];
      const list = Array.isArray(data) ? data : [];
      setAccounts(list);
      if (payment?.financialAccountId) {
        setSelectedAccountId(payment.financialAccountId);
      } else if (list.length === 1) {
        setSelectedAccountId(list[0]._id);
      }
    } catch {
      toast.error('Failed to load active bank/cash accounts.');
    } finally {
      setLoadingAccounts(false);
    }
  }, [payment]);

  useEffect(() => {
    if (isOpen && payment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedAccountId(payment.financialAccountId || '');
      fetchAccounts();
    }
  }, [isOpen, payment, fetchAccounts]);

  if (!isOpen || !payment) return null;

  const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accountToUse = payment.financialAccountId || selectedAccountId;
    if (!accountToUse) {
      toast.error('Please select a financial account for payment disbursal.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {};
      if (selectedAccountId && !payment.financialAccountId) {
        payload.financialAccountId = selectedAccountId;
      }

      const res = await vendorPaymentApi.markVendorPaymentPaid(payment._id, payload);
      const updated = res.data?.data;

      toast.success(`Payment ${payment.paymentNumber} marked as PAID! Ledger updated.`);
      if (onSuccess) onSuccess(updated);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark payment as paid.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAccountObj = accounts.find((a) => String(a._id) === String(selectedAccountId || payment.financialAccountId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
              <FaMoneyCheckAlt />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Mark Payment as Paid</h3>
              <p className="text-xs text-gray-500 font-mono">{payment.paymentNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Vendor</span>
              <span className="text-xs font-bold text-gray-900">{payment.vendorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Payment Mode</span>
              <span className="text-xs font-semibold uppercase text-gray-700">
                {payment.paymentMode?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-orange-200/50">
              <span className="text-xs text-gray-600 font-medium">Disbursal Amount</span>
              <span className="text-xl font-black text-orange-600">{formatINR(payment.amount)}</span>
            </div>
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Paying Financial Account <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaUniversity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                disabled={loadingAccounts || submitting || Boolean(payment.financialAccountId)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              >
                <option value="">{loadingAccounts ? 'Loading accounts...' : '-- Select Account --'}</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountName} ({acc.accountType}) - Bal: ₹{(acc.currentBalance || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
            {selectedAccountObj && (
              <p className="text-xs text-gray-500 mt-1">
                Current balance: <span className="font-semibold">{formatINR(selectedAccountObj.currentBalance)}</span>
                {' → '}
                Balance after payment:{' '}
                <span className="font-bold text-gray-900">
                  {formatINR((selectedAccountObj.currentBalance || 0) - payment.amount)}
                </span>
              </p>
            )}
          </div>

          {/* Accounting Integration Callout */}
          <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-3 text-xs text-blue-800 space-y-1">
            <p className="font-bold">Accounting Ledger Integration:</p>
            <p className="text-[11px] leading-relaxed">
              Confirming disbursal will automatically create an Account Transaction (DEBIT / EXPENSE) against this account and update its balance in real-time.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (!payment.financialAccountId && !selectedAccountId)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-md shadow-orange-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" /> Disbursing...
                </>
              ) : (
                'Confirm & Disburse'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
