import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaRupeeSign, FaWallet, FaLock, FaCreditCard, FaUniversity } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const OFFLINE_PAYMENT_MODES = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer / NEFT / RTGS' },
  // { value: 'UPI', label: 'UPI / GPay / PhonePe' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CASH', label: 'Cash' },
];

export default function AddAdvanceModal({ isOpen, onClose, onSuccess, isResidentView }) {
  const [flats, setFlats] = useState([]);
  const [loadingFlats, setLoadingFlats] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const makeDefault = () => ({
    flatId: '',
    residentId: '',
    amount: '',
    paymentMode: isResidentView ? 'ONLINE_GATEWAY' : 'BANK_TRANSFER',
    referenceNumber: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [formData, setFormData] = useState(makeDefault);
  const [selectedFlat, setSelectedFlat] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(makeDefault());
      setSelectedFlat(null);
      fetchFlats();
      if (isResidentView) loadRazorpayScript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isResidentView]);

  const selectFlat = (flat) => {
    if (!flat) return;
    setSelectedFlat(flat);
    let resId = isResidentView
      ? (currentUser.id || currentUser._id)
      : (flat?.activeTenant?._id || flat?.activeTenant || flat?.primaryOwner?._id || flat?.primaryOwner || '');
    if (!resId && flat?.residents?.length > 0) {
      resId = flat.residents[0]?.userId?._id || flat.residents[0]?.userId || flat.residents[0] || '';
    } else if (!resId && (flat?.ownerId?._id || flat?.ownerId)) {
      resId = flat.ownerId._id || flat.ownerId;
    }
    if (!resId || isResidentView) resId = currentUser.id || currentUser._id;
    setFormData(prev => ({ ...prev, flatId: flat._id, residentId: resId }));
  };

  const fetchFlats = async () => {
    try {
      setLoadingFlats(true);
      const res = await apiClient.get('/flats');
      let data = res.data?.data?.flats || res.data?.data || res.data?.flats || [];
      if (!Array.isArray(data)) data = [];
      if (isResidentView) {
        const uid = String(currentUser.id || currentUser._id || '');
        const mine = data.filter(f => {
          const own = String(f?.ownerId?._id || f?.ownerId || '');
          const ten = String(f?.activeTenant?._id || f?.activeTenant || '');
          const res = (f?.residents || []).map(r => String(r?.userId?._id || r?.userId || r || ''));
          return own === uid || ten === uid || res.includes(uid);
        });
        const list = mine.length > 0 ? mine : data;
        setFlats(list);
        if (list.length > 0) selectFlat(list[0]);
      } else {
        setFlats(data);
      }
    } catch {
      toast.error('Failed to load flats.');
    } finally {
      setLoadingFlats(false);
    }
  };

  const handleFlatChange = (e) => {
    const flat = flats.find(f => f._id === e.target.value);
    selectFlat(flat);
  };

  const getOrCreateAccount = async () => {
    const r = await apiClient.post('/advance-deposits/advance-accounts/get-or-create', {
      flatId: formData.flatId,
      residentId: formData.residentId || undefined,
    });
    const acc = r.data?.data;
    if (!acc?._id) throw new Error('Failed to obtain advance account.');
    return acc;
  };

  // Admin/Accountant: direct offline credit
  const handleOfflineCredit = async () => {
    if (!formData.flatId) return toast.error('Please select a flat.');
    if (!formData.amount || Number(formData.amount) <= 0) return toast.error('Please enter a valid amount.');
    try {
      setSubmitting(true);
      const acc = await getOrCreateAccount();
      await apiClient.post(`/advance-deposits/advance-accounts/${acc._id}/credit`, {
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        referenceNumber: formData.referenceNumber,
        transactionDate: formData.transactionDate,
        notes: formData.notes,
      });
      toast.success('Advance credited successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to credit advance balance.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resident: Razorpay online flow
  const handleOnlinePayment = async () => {
    if (!formData.flatId) return toast.error('Flat not selected.');
    if (!formData.amount || Number(formData.amount) <= 0) return toast.error('Please enter a valid amount.');
    try {
      setSubmitting(true);
      if (!window.Razorpay) {
        const ok = await loadRazorpayScript();
        if (!ok) throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }
      const acc = await getOrCreateAccount();
      const orderRes = await apiClient.post(
        `/advance-deposits/advance-accounts/${acc._id}/initiate-online-payment`,
        { accountId: acc._id, amount: Number(formData.amount) }
      );
      const od = orderRes.data?.data;
      if (!od?.orderId) throw new Error('Failed to create payment order.');
      setSubmitting(false);

      const rzp = new window.Razorpay({
        key: od.keyId,
        amount: od.amount * 100,
        currency: 'INR',
        name: 'Society Suite',
        description: 'Advance Account Top-up',
        order_id: od.orderId,
        prefill: {
          name: currentUser.name || currentUser.fullName || '',
          email: currentUser.email || '',
          contact: currentUser.phone || '',
        },
        theme: { color: '#4F46E5' },
        handler: async (response) => {
          try {
            setSubmitting(true);
            await apiClient.post(
              `/advance-deposits/advance-accounts/${acc._id}/verify-online-payment`,
              {
                accountId: acc._id,
                orderId: od.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: od.amount,
                notes: formData.notes,
              }
            );
            toast.success('Payment successful! Advance balance has been credited.');
            onSuccess?.();
            onClose();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed. Please contact support.');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment was cancelled.', { icon: '⚠️' });
            setSubmitting(false);
          },
        },
      });
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error?.description || 'Unknown error'}`);
        setSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      setSubmitting(false);
      toast.error(err.response?.data?.message || err.message || 'Failed to initiate payment.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isResidentView) handleOnlinePayment();
    else handleOfflineCredit();
  };

  if (!isOpen) return null;

  const showRefField = !isResidentView && ['BANK_TRANSFER', 'UPI', 'CHEQUE'].includes(formData.paymentMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className={`p-6 border-b border-gray-100 flex items-center justify-between text-white ${isResidentView ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-gradient-to-r from-indigo-700 to-blue-600'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              {isResidentView ? <FaCreditCard className="text-xl text-white" /> : <FaWallet className="text-xl text-white" />}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {isResidentView ? 'Top Up Advance Balance' : 'Credit Advance Account'}
              </h3>
              <p className="text-xs text-indigo-100 font-medium">
                {isResidentView ? 'Pay securely via Razorpay gateway' : 'Record offline payment to advance account'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Flat selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Flat *</label>
            {loadingFlats ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <FaSpinner className="animate-spin text-indigo-600" /> Loading flats...
              </div>
            ) : isResidentView && selectedFlat ? (
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs font-bold text-indigo-900 flex justify-between items-center">
                <span>Flat {selectedFlat.flatNumber} {selectedFlat.wing ? `(Wing ${selectedFlat.wing})` : ''}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">Your Registered Flat</span>
              </div>
            ) : (
              <select value={formData.flatId} onChange={handleFlatChange} required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-gray-900">
                <option value="">-- Choose Flat --</option>
                {flats.map(f => (
                  <option key={f._id} value={f._id}>
                    Flat {f.flatNumber} {f.wing ? `(Wing ${f.wing})` : ''} - {f.ownerName || 'Resident Account'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Account holder info */}
          {selectedFlat && (
            <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-1">
              <div className="font-bold text-indigo-900">
                Flat: {selectedFlat.flatNumber} {selectedFlat.wing ? `(Wing ${selectedFlat.wing})` : ''}
              </div>
              <div className="text-gray-600">
                {isResidentView ? 'Account Holder:' : 'Primary Contact:'}{' '}
                <span className="font-semibold text-gray-800">
                  {isResidentView
                    ? (currentUser.name || currentUser.fullName || currentUser.email || 'You')
                    : (selectedFlat.ownerName || selectedFlat.occupantName || 'N/A')}
                </span>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Advance Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                <FaRupeeSign className="text-sm" />
              </span>
              <input
                type="number" min="1" step="any" placeholder="e.g. 5000"
                value={formData.amount}
                onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-gray-900"
              />
            </div>
          </div>

          {/* Payment Mode */}
          {isResidentView ? (
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-xl">
                <FaLock className="text-violet-600 text-sm" />
              </div>
              <div>
                <div className="text-xs font-bold text-violet-900">Online Payment via Razorpay</div>
                <div className="text-[10px] text-violet-600 mt-0.5">Secure · UPI · Cards · Net Banking · Wallets</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Payment Mode *</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData(p => ({ ...p, paymentMode: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-gray-900"
                >
                  {OFFLINE_PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Transaction Date *</label>
                <input
                  type="date" value={formData.transactionDate}
                  onChange={(e) => setFormData(p => ({ ...p, transactionDate: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Reference / UTR — only for applicable offline modes */}
          {showRefField && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {formData.paymentMode === 'CHEQUE' ? 'Cheque Number' : 'Reference / UTR Number'}
              </label>
              <input
                type="text"
                placeholder={formData.paymentMode === 'CHEQUE' ? 'e.g. 001234' : 'e.g. UTR1234567890'}
                value={formData.referenceNumber}
                onChange={(e) => setFormData(p => ({ ...p, referenceNumber: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-gray-900"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Remarks / Notes</label>
            <textarea
              rows="2"
              placeholder="e.g. Advance for quarterly maintenance"
              value={formData.notes}
              onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-gray-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-2xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 ${isResidentView
                  ? 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 shadow-violet-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20'
                }`}
            >
              {submitting ? (
                <><FaSpinner className="animate-spin text-sm" /> Processing...</>
              ) : isResidentView ? (
                <><FaCreditCard className="text-sm" /> Proceed Payment</>
              ) : (
                <><FaUniversity className="text-sm" /> Credit Advance</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
