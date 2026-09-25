import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaRupeeSign, FaShieldAlt } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function CollectDepositModal({ isOpen, onClose, onSuccess }) {
  const [flats, setFlats] = useState([]);
  const [depositTypes, setDepositTypes] = useState([]);
  const [loadingFlats, setLoadingFlats] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    flatId: '',
    residentId: '',
    depositTypeId: '',
    depositTypeName: 'Move-in Security Deposit',
    amount: '',
    paymentMode: 'BANK_TRANSFER',
    referenceNumber: '',
    receivedDate: new Date().toISOString().split('T')[0],
    termsAndConditions: '',
    notes: '',
  });

  const [selectedFlat, setSelectedFlat] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchFlats();
      fetchDepositTypes();
      setFormData({
        flatId: '',
        residentId: '',
        depositTypeId: '',
        depositTypeName: 'Move-in Security Deposit',
        amount: '',
        paymentMode: 'BANK_TRANSFER',
        referenceNumber: '',
        receivedDate: new Date().toISOString().split('T')[0],
        termsAndConditions: '',
        notes: '',
      });
      setSelectedFlat(null);
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

  const fetchDepositTypes = async () => {
    try {
      setLoadingTypes(true);
      const res = await apiClient.get('/advance-deposits/security-deposit-types');
      if (res.data?.status === 'success') {
        const types = Array.isArray(res.data.data) ? res.data.data : [];
        setDepositTypes(types);
        if (types.length > 0) {
          setFormData(prev => ({
            ...prev,
            depositTypeId: types[0]._id,
            depositTypeName: types[0].name,
            amount: types[0].defaultAmount || prev.amount,
          }));
        }
      }
    } catch {
      // Ignore if deposit types optional
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleFlatChange = (e) => {
    const flatId = e.target.value;
    const flat = flats.find(f => f._id === flatId);
    setSelectedFlat(flat);

    let resId = flat?.activeTenant?._id || flat?.activeTenant || flat?.primaryOwner?._id || flat?.primaryOwner || '';
    if (!resId && flat?.residents?.length > 0) {
      resId = flat.residents[0]?.userId?._id || flat.residents[0]?.userId || flat.residents[0] || '';
    } else if (!resId && (flat?.ownerId?._id || flat?.ownerId)) {
      resId = flat.ownerId._id || flat.ownerId;
    }

    setFormData(prev => ({
      ...prev,
      flatId,
      residentId: resId,
    }));
  };

  const handleTypeChange = (e) => {
    const typeId = e.target.value;
    const selected = depositTypes.find(t => t._id === typeId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        depositTypeId: selected._id,
        depositTypeName: selected.name,
        amount: selected.defaultAmount || prev.amount,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        depositTypeId: '',
        depositTypeName: e.target.value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.flatId) {
      return toast.error('Please select a flat');
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      return toast.error('Please enter a valid amount');
    }

    try {
      setSubmitting(true);

      const payload = {
        flatId: formData.flatId,
        residentId: formData.residentId || undefined,
        depositTypeId: formData.depositTypeId || undefined,
        depositTypeName: formData.depositTypeName,
        amount: Number(formData.amount),
        paymentMode: formData.paymentMode,
        referenceNumber: formData.referenceNumber,
        receivedDate: formData.receivedDate,
        termsAndConditions: formData.termsAndConditions,
        notes: formData.notes,
      };

      const res = await apiClient.post('/advance-deposits/security-deposits', payload);
      if (res.data?.status === 'success') {
        toast.success('Security deposit collected successfully!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to collect security deposit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <FaShieldAlt className="text-xl text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Collect Security Deposit</h3>
              <p className="text-xs text-teal-100 font-medium">Record new refundable resident deposit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Select Flat */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Flat *
            </label>
            {loadingFlats ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <FaSpinner className="animate-spin text-teal-600" /> Loading flats...
              </div>
            ) : (
              <select
                value={formData.flatId}
                onChange={handleFlatChange}
                required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-medium text-gray-900"
              >
                <option value="">-- Choose Flat --</option>
                {flats.map(flat => (
                  <option key={flat._id} value={flat._id}>
                    Flat {flat.flatNumber} {flat.wing ? `(Wing ${flat.wing})` : ''} - {flat.ownerName || 'Resident Account'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Flat Info */}
          {selectedFlat && (
            <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs space-y-1">
              <div className="font-bold text-teal-900">
                Flat: {selectedFlat.flatNumber} {selectedFlat.wing ? `(Wing ${selectedFlat.wing})` : ''}
              </div>
              <div className="text-gray-600">
                Primary Contact: <span className="font-semibold text-gray-800">{selectedFlat.ownerName || selectedFlat.occupantName || 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Deposit Type */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Deposit Type *
            </label>
            {depositTypes.length > 0 ? (
              <select
                value={formData.depositTypeId}
                onChange={handleTypeChange}
                required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-medium text-gray-900"
              >
                {depositTypes.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} (Default: ₹{t.defaultAmount || 0})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.depositTypeName}
                onChange={(e) => setFormData(prev => ({ ...prev, depositTypeName: e.target.value }))}
                placeholder="e.g. Move-in Security Deposit"
                required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-medium text-gray-900"
              />
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Deposit Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                <FaRupeeSign className="text-sm" />
              </span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 10000"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-bold text-gray-900"
              />
            </div>
          </div>

          {/* Payment Mode & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Payment Mode *
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMode: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-medium text-gray-900"
              >
                <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
                {/* <option value="UPI">UPI / GPay / PhonePe</option> */}
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
                <option value="ONLINE_GATEWAY">Online Gateway</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Received Date *
              </label>
              <input
                type="date"
                value={formData.receivedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, receivedDate: e.target.value }))}
                required
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-medium text-gray-900"
              />
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Reference / UTR / Cheque Number
            </label>
            <input
              type="text"
              placeholder="e.g. UTR9876543210"
              value={formData.referenceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-medium text-gray-900"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Remarks / Terms & Conditions
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Move-in refundable deposit held until flat vacation"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-medium text-gray-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-2xl transition-all shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" /> Collecting...
                </>
              ) : (
                'Collect Deposit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
