import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSpinner, FaFileInvoice, FaRupeeSign, FaUniversity } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import vendorPaymentApi from '../../../../services/vendorPaymentApi';
import toast from 'react-hot-toast';

export default function CreateVendorPaymentModal({ isOpen, onClose, onSuccess }) {
  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    billReference: '',
    amount: '',
    paymentMode: 'bank_transfer',
    financialAccountId: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const fetchVendors = useCallback(async () => {
    setLoadingVendors(true);
    try {
      const res = await apiClient.get('/vendors');
      const data = res.data?.data?.vendors || res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setVendors(list);
    } catch {
      toast.error('Failed to load vendors.');
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  const fetchFinancialAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await apiClient.get('/reconciliation/accounts?status=ACTIVE');
      const data = res.data?.data?.accounts || res.data?.data || [];
      const list = Array.isArray(data) ? data : [];
      setAccounts(list);
    } catch {
      // Accounts are optional at creation
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchVendors();
      fetchFinancialAccounts();
      setFormData({
        vendorId: '',
        vendorName: '',
        billReference: '',
        amount: '',
        paymentMode: 'bank_transfer',
        financialAccountId: '',
        description: '',
      });
      setErrors({});
    }
  }, [isOpen, fetchVendors, fetchFinancialAccounts]);

  const handleVendorSelect = (e) => {
    const vId = e.target.value;
    const selected = vendors.find((v) => String(v._id) === String(vId));
    setFormData((prev) => ({
      ...prev,
      vendorId: vId,
      vendorName: selected ? (selected.name || selected.vendorName || '') : '',
    }));
    if (errors.vendorId) {
      setErrors((prev) => ({ ...prev, vendorId: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.vendorId) errs.vendorId = 'Please select a vendor';
    if (!formData.billReference.trim()) errs.billReference = 'Bill reference / invoice number is required';
    if (!formData.amount || Number(formData.amount) <= 0) errs.amount = 'Amount must be greater than 0';
    if (!formData.paymentMode) errs.paymentMode = 'Payment mode is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        vendorId: formData.vendorId,
        vendorName: formData.vendorName,
        billReference: formData.billReference.trim(),
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        description: formData.description.trim(),
      };
      if (formData.financialAccountId) {
        payload.financialAccountId = formData.financialAccountId;
      }

      const res = await vendorPaymentApi.createVendorPayment(payload);
      const created = res.data?.data;
      const isPending = created?.status === 'pending_approval';

      toast.success(
        isPending
          ? 'Payment request submitted! Routed to Committee Admin for approval.'
          : 'Payment approved automatically (within threshold)!'
      );
      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create vendor payment.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
              <FaFileInvoice />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Create Vendor Payment</h3>
              <p className="text-xs text-gray-500">Raise payment against work order or vendor bill</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Vendor Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Select Vendor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleVendorSelect}
                disabled={loadingVendors || submitting}
                className={`w-full px-4 py-2.5 bg-white border ${errors.vendorId ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-500/20'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-orange-500 transition-all`}
              >
                <option value="">{loadingVendors ? 'Loading vendors...' : '-- Select Vendor --'}</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name || v.vendorName} ({v.serviceCategory || v.category || 'Vendor'})
                  </option>
                ))}
              </select>
            </div>
            {errors.vendorId && <p className="text-xs text-red-500 mt-1">{errors.vendorId}</p>}
          </div>

          {/* Bill Reference */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Bill / Invoice Reference <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="billReference"
              value={formData.billReference}
              onChange={handleChange}
              placeholder="e.g. INV-2026-081 or WO-412"
              disabled={submitting}
              className={`w-full px-4 py-2.5 bg-white border ${errors.billReference ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-500/20'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-orange-500 transition-all`}
            />
            {errors.billReference && <p className="text-xs text-red-500 mt-1">{errors.billReference}</p>}
          </div>

          {/* Amount & Payment Mode Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  disabled={submitting}
                  className={`w-full pl-9 pr-4 py-2.5 bg-white border ${errors.amount ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-500/20'
                    } rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-orange-500 transition-all font-semibold`}
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Payment Mode <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
              </select>
            </div>
          </div>

          {/* Paying Financial Account */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Financial Account (Disbursal Source)
            </label>
            <div className="relative">
              <FaUniversity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <select
                name="financialAccountId"
                value={formData.financialAccountId}
                onChange={handleChange}
                disabled={loadingAccounts || submitting}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              >
                <option value="">-- Select Paying Bank / Cash Account (Optional) --</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountName} ({acc.accountType}) - Bal: ₹{(acc.currentBalance || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Can also be selected during payment disbursal.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Pipe repair work in Block B common line per work order #412."
              disabled={submitting}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Routing Information Callout */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3 text-xs text-amber-800">
            <span className="font-bold">Approval Notice: </span>
            Payments exceeding the society accountant approval threshold require Committee Admin approval before disbursal.
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-md shadow-orange-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" /> Submitting...
                </>
              ) : (
                'Submit Payment Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
