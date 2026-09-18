import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaRupeeSign, FaReceipt } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function RecordOfflinePaymentModal({ isOpen, onClose, onSuccess }) {
  const [flats, setFlats] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loadingFlats, setLoadingFlats] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    flatId: '',
    userId: '',
    invoiceId: '',
    amount: '',
    paymentMode: 'CASH',
    paymentAccountId: 'HDFC_COLLECTION_ACC',
    paymentAccountName: 'HDFC Bank - Collection Account',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    chequeNumber: '',
    chequeBankName: '',
    chequeDate: '',
    bankTransferBankName: '',
  });

  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);

  // Accounts options
  const PAYMENT_ACCOUNTS = [
    { id: 'HDFC_COLLECTION_ACC', name: 'HDFC Bank - Collection Account' },
    { id: 'SBI_SINKING_ACC', name: 'SBI Bank - Sinking Fund Account' },
    { id: 'PRIMARY_CASH_ACC', name: 'Society Cash Account (Petty Cash)' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchFlats();
    }
  }, [isOpen]);

  const fetchFlats = async () => {
    try {
      setLoadingFlats(true);
      const res = await apiClient.get('/flats');
      const data = res.data?.data?.flats || res.data?.data || res.data?.flats || [];
      setFlats(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load flats.');
    } finally {
      setLoadingFlats(false);
    }
  };

  const handleFlatChange = async (e) => {
    const flatId = e.target.value;
    const selectedFlat = flats.find(f => f._id === flatId);
    setFormData(prev => ({
      ...prev,
      flatId,
      userId: selectedFlat?.activeTenant || selectedFlat?.primaryOwner || '',
      invoiceId: '',
      amount: '',
    }));
    setSelectedInvoiceDetails(null);

    if (flatId) {
      fetchUnpaidInvoices(flatId);
    }
  };

  const fetchUnpaidInvoices = async (flatId) => {
    try {
      setLoadingInvoices(true);
      const res = await apiClient.get(`/billing/invoices?flatId=${flatId}&status=GENERATED,PARTIALLY_PAID,OVERDUE`);
      const data = res.data?.data;
      setInvoices(data?.invoices || (Array.isArray(data) ? data : []));
    } catch {
      toast.error('Failed to load pending invoices for selected flat.');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleInvoiceChange = (e) => {
    const invoiceId = e.target.value;
    const inv = invoices.find(i => i._id === invoiceId);
    setSelectedInvoiceDetails(inv || null);

    if (inv) {
      const remaining = Math.max(0, (inv.totalAmount + (inv.fineAmount || 0)) - (inv.paidAmount || 0));
      setFormData(prev => ({
        ...prev,
        invoiceId,
        amount: remaining > 0 ? remaining : '',
      }));
    } else {
      setFormData(prev => ({ ...prev, invoiceId: '', amount: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.flatId) {
      toast.error('Please select a flat.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }
    if (formData.paymentMode === 'CHEQUE' && (!formData.chequeNumber || !formData.chequeBankName)) {
      toast.error('Cheque number and bank name are required.');
      return;
    }
    if (formData.paymentMode === 'BANK_TRANSFER' && !formData.referenceNumber) {
      toast.error('Transaction reference number is required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        flatId: formData.flatId,
        userId: formData.userId,
        invoiceId: formData.invoiceId || null,
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        paymentAccountId: formData.paymentAccountId,
        paymentAccountName: PAYMENT_ACCOUNTS.find(a => a.id === formData.paymentAccountId)?.name || formData.paymentAccountName,
        referenceNumber: formData.referenceNumber,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
        chequeDetails: formData.paymentMode === 'CHEQUE' ? {
          chequeNumber: formData.chequeNumber,
          bankName: formData.chequeBankName,
          chequeDate: formData.chequeDate,
        } : undefined,
        bankTransferDetails: formData.paymentMode === 'BANK_TRANSFER' ? {
          bankName: formData.bankTransferBankName,
        } : undefined,
      };

      const res = await apiClient.post('/payments/offline', payload);
      toast.success(res.data?.message || 'Offline payment recorded successfully!');
      if (onSuccess) onSuccess(res.data?.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold">
            <FaReceipt />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Record Offline Payment</h2>
            <p className="text-xs text-gray-500">Record cash, cheque, or bank transfer payment against invoice.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Flat */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Flat <span className="text-red-500">*</span>
            </label>
            {loadingFlats ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 p-2 border rounded-xl">
                <FaSpinner className="animate-spin text-emerald-500" /> Loading flats...
              </div>
            ) : (
              <select
                value={formData.flatId}
                onChange={handleFlatChange}
                required
                className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Select Flat --</option>
                {flats.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.blockName || f.wingName} - {f.flatNumber} ({f.ownerName || 'Resident'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Select Invoice */}
          {formData.flatId && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Invoice <span className="text-gray-400 font-normal">(Optional for direct advance)</span>
              </label>
              {loadingInvoices ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 p-2 border rounded-xl">
                  <FaSpinner className="animate-spin text-emerald-500" /> Loading invoices...
                </div>
              ) : (
                <select
                  value={formData.invoiceId}
                  onChange={handleInvoiceChange}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Direct Advance / General Collection --</option>
                  {invoices.map(inv => {
                    const totalWithFine = (inv.totalAmount || 0) + (inv.fineAmount || 0);
                    const rem = Math.max(0, totalWithFine - (inv.paidAmount || 0));
                    return (
                      <option key={inv._id} value={inv._id}>
                        {inv.invoiceNumber} | Total: ₹{totalWithFine.toLocaleString()} | Due: ₹{rem.toLocaleString()}
                      </option>
                    );
                  })}
                </select>
              )}

              {selectedInvoiceDetails && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs flex justify-between items-center text-emerald-800">
                  <div>
                    <span className="font-semibold">Current Due:</span> ₹
                    {Math.max(0, (selectedInvoiceDetails.totalAmount + (selectedInvoiceDetails.fineAmount || 0)) - (selectedInvoiceDetails.paidAmount || 0)).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">Billing Period:</span> {selectedInvoiceDetails.billingPeriod}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Amount & Payment Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Payment Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full text-sm pl-8 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Payment Mode <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentMode}
                onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
              </select>
            </div>
          </div>

          {/* Mode specific fields */}
          {formData.paymentMode === 'CHEQUE' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 mb-1">Cheque Number *</label>
                  <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={e => setFormData({ ...formData, chequeNumber: e.target.value })}
                    placeholder="e.g. 401928"
                    className="w-full text-xs border border-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-900 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={formData.chequeBankName}
                    onChange={e => setFormData({ ...formData, chequeBankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full text-xs border border-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.paymentMode === 'BANK_TRANSFER' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-blue-900 mb-1">Transaction Ref / UTR Number *</label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="e.g. UTR192039485"
                  className="w-full text-xs border border-blue-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Receiving Payment Account */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Receiving Account <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.paymentAccountId}
              onChange={e => setFormData({ ...formData, paymentAccountId: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {PAYMENT_ACCOUNTS.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Date & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reference No / Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
                className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
