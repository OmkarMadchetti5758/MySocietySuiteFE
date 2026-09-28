import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaPercent, FaExclamationTriangle, FaCheckCircle, FaTag, FaBuilding, FaDoorOpen } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function ApplyDiscountModal({ isOpen, onClose, onSuccess, threshold = 5000, isAdmin = false }) {
  const [loading, setLoading] = useState(false);
  const [wings, setWings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [chargeHeads, setChargeHeads] = useState([]);

  const [selectedWingId, setSelectedWingId] = useState('');
  const [selectedFlatId, setSelectedFlatId] = useState('');
  const [selectedChargeHeadId, setSelectedChargeHeadId] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Reset form
    setSelectedWingId('');
    setSelectedFlatId('');
    setSelectedChargeHeadId('');
    setDiscountCode('');
    setAmount('');
    setReason('');

    // 1. Fetch Wings
    apiClient.get('/blocks')
      .then(res => {
        const wingsList = res.data?.data?.blockDoc?.wings || res.data?.blockDoc?.wings || [];
        setWings(Array.isArray(wingsList) ? wingsList : []);
      })
      .catch(err => console.error('Failed to load wings:', err));

    // 2. Fetch Flats
    apiClient.get('/flats')
      .then(res => {
        const flatsList = res.data?.data?.flats || res.data?.flats || (Array.isArray(res.data?.data) ? res.data?.data : []);
        setFlats(Array.isArray(flatsList) ? flatsList : []);
      })
      .catch(err => console.error('Failed to load flats:', err));

    // 3. Fetch Charge Heads (FR-B6.2: specific flat or charge head)
    apiClient.get('/billing/charge-heads')
      .then(res => {
        const headsList = res.data?.data || res.data || [];
        setChargeHeads(Array.isArray(headsList) ? headsList : []);
      })
      .catch(err => console.error('Failed to load charge heads:', err));
  }, [isOpen]);

  // Fallback: If wings is empty but flats have block/wing info, extract wings from flats
  useEffect(() => {
    if (wings.length === 0 && flats.length > 0) {
      const derivedWings = [];
      const seen = new Set();
      flats.forEach(f => {
        const wId = f.blockId?._id ? String(f.blockId._id) : (typeof f.blockId === 'string' ? f.blockId : null);
        const wName = f.blockId?.name || f.wing || f.blockName || (wId ? `Wing ${wId}` : null);
        const key = wId || wName;
        if (key && !seen.has(key)) {
          seen.add(key);
          derivedWings.push({ _id: wId || key, name: wName });
        }
      });
      if (derivedWings.length > 0) {
        setWings(derivedWings);
      }
    }
  }, [wings, flats]);

  // Filter flats based on selected wing
  const availableFlats = flats.filter((flat) => {
    if (!selectedWingId) return false;
    const bId = flat.blockId?._id ? String(flat.blockId._id) : String(flat.blockId || '');
    const wingName = flat.wing || flat.blockName || flat.blockId?.name || '';
    const wingCode = flat.blockId?.code || '';
    return (
      bId === selectedWingId ||
      wingName === selectedWingId ||
      wingCode === selectedWingId
    );
  });

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const isAboveThreshold = !isAdmin && numAmount > threshold;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedWingId) {
      return toast.error('Please select a wing.');
    }

    if (!selectedFlatId) {
      return toast.error('Please select the target flat.');
    }

    if (!amount || numAmount <= 0) {
      return toast.error('Please enter a valid discount amount.');
    }

    if (!reason || !reason.trim()) {
      return toast.error('A mandatory reason must be provided (FR-B6.2).');
    }

    setLoading(true);
    try {
      const payload = {
        flatId: selectedFlatId,
        chargeHeadId: selectedChargeHeadId || null,
        discountCode: discountCode.trim() || undefined,
        amount: numAmount,
        reason: reason.trim(),
      };

      const res = await apiClient.post('/billing/discounts', payload);
      if (res.data?.status === 'success' || res.status === 201) {
        const createdDisc = res.data?.data;
        if (createdDisc?.status === 'pending_approval') {
          toast.success(`Discount registered (${createdDisc.discountCode}). Exceeds threshold — Routed to Committee Admin for approval.`);
        } else {
          toast.success(`Discount ${createdDisc?.discountCode || ''} applied for upcoming invoice!`);
        }
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Failed to apply discount:', err);
      toast.error(err.response?.data?.message || 'Failed to apply discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              <FaPercent />
            </div>
            <div>
              <h3 className="text-lg font-bold">Apply Upcoming Discount</h3>
              <p className="text-xs text-blue-100">Reduce upcoming invoice for specific flat or charge head</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* TWO DROPDOWNS: 1st Wing Selection, 2nd Flat Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1st Dropdown: Wing Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <FaBuilding className="text-blue-500 text-xs" />
                Select Wing *
              </label>
              <select
                value={selectedWingId}
                onChange={(e) => {
                  setSelectedWingId(e.target.value);
                  setSelectedFlatId('');
                }}
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Wing --</option>
                {wings.map((w) => {
                  const val = w._id || w.name;
                  const label = w.name?.toLowerCase().includes('wing') ? w.name : `Wing ${w.name}`;
                  return (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2nd Dropdown: Flat Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
                <FaDoorOpen className="text-blue-500 text-xs" />
                Select Flat *
              </label>
              <select
                value={selectedFlatId}
                onChange={(e) => setSelectedFlatId(e.target.value)}
                disabled={!selectedWingId || availableFlats.length === 0}
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">
                  {!selectedWingId
                    ? '-- Choose Wing first --'
                    : availableFlats.length === 0
                      ? '-- No flats in this wing --'
                      : '-- Choose Flat --'}
                </option>
                {availableFlats.map((flat) => {
                  const flatNo = flat.flatNumber || flat.flatId || flat._id;
                  const owner = flat.ownerName || flat.primaryOwner?.name || flat.primaryOwner?.fullName || '';
                  return (
                    <option key={flat._id} value={flat._id}>
                      Flat {flatNo}{owner ? ` (${owner})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Target Charge Head */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
              <span>Specific Charge Head (Optional)</span>
              <span className="text-[10px] text-gray-400 font-normal">Leave blank for overall bill discount</span>
            </label>
            <select
              value={selectedChargeHeadId}
              onChange={(e) => setSelectedChargeHeadId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- All Charge Heads / Entire Bill --</option>
              {chargeHeads.map((head) => (
                <option key={head._id} value={head._id}>
                  {head.name} ({head.code || 'CH'}) - {head.category || 'INCOME'}
                </option>
              ))}
            </select>
          </div>

          {/* Discount Code & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Discount Code
              </label>
              <div className="relative">
                <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EARLY-BIRD"
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Discount (₹) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Threshold alert */}
          {numAmount > 0 && (
            <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${isAboveThreshold
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
              {isAboveThreshold ? (
                <>
                  <FaExclamationTriangle className="text-amber-500 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Threshold Alert (FR-B6.3):</span> Amount exceeds the configured approval threshold (₹{threshold.toLocaleString('en-IN')}). Routed to <strong>Committee Admin</strong> for review before it can be applied to upcoming invoices.
                  </div>
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-emerald-500 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Immediate Effect:</span> Amount is within the Accountant Approval Threshold (₹{threshold.toLocaleString('en-IN')}) and will automatically be deducted during the next invoice generation.
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
              <span>Reason / Justification *</span>
              <span className="text-[10px] text-red-500 font-semibold">Mandatory</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Committee authorized prompt payment concession / AGM resolution benefit..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {isAboveThreshold ? 'Submit for Committee Approval' : 'Save Upcoming Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
