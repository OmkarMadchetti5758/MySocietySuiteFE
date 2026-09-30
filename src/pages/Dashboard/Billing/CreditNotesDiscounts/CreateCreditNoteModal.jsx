import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaFileInvoice, FaExclamationTriangle, FaCheckCircle, FaBuilding, FaDoorOpen } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function CreateCreditNoteModal({ isOpen, onClose, onSuccess, threshold = 5000, isAdmin = false }) {
  const [loading, setLoading] = useState(false);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);
  const [wings, setWings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [selectedWingId, setSelectedWingId] = useState('');
  const [selectedFlatId, setSelectedFlatId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  // Fetch wings and flats on modal open
  useEffect(() => {
    if (!isOpen) return;

    // Reset form
    setSelectedWingId('');
    setSelectedFlatId('');
    setSelectedInvoiceId('');
    setAmount('');
    setReason('');
    setInvoices([]);

    // 1. Fetch Wings
    apiClient.get('/blocks')
      .then(res => {
        const wingsList = res.data?.data?.blockDoc?.wings || res.data?.blockDoc?.wings || [];
        setWings(Array.isArray(wingsList) ? wingsList : []);
      })
      .catch(err => {
        console.error('Failed to load wings:', err);
      });

    // 2. Fetch Flats
    apiClient.get('/flats')
      .then(res => {
        const flatsList = res.data?.data?.flats || res.data?.flats || (Array.isArray(res.data?.data) ? res.data?.data : []);
        setFlats(Array.isArray(flatsList) ? flatsList : []);
      })
      .catch(err => {
        console.error('Failed to load flats:', err);
      });
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

  // Fetch past invoices when flat is selected
  useEffect(() => {
    if (!selectedFlatId) {
      setInvoices([]);
      setSelectedInvoiceId('');
      return;
    }

    setFetchingInvoices(true);
    apiClient.get(`/billing/credit-notes/past-invoices?flatId=${selectedFlatId}`)
      .then(res => {
        const invList = res.data?.data || [];
        setInvoices(invList);
        if (invList.length > 0) {
          setSelectedInvoiceId(invList[0]._id);
        } else {
          // If no invoices exist in MSS yet, default to GENERAL (Prior / Legacy bill adjustment)
          setSelectedInvoiceId('GENERAL');
        }
      })
      .catch(err => {
        console.error('Failed to load invoices for flat:', err);
        setInvoices([]);
        setSelectedInvoiceId('GENERAL');
      })
      .finally(() => {
        setFetchingInvoices(false);
      });
  }, [selectedFlatId]);

  if (!isOpen) return null;

  const selectedInvoice = invoices.find(inv => String(inv._id) === String(selectedInvoiceId));
  const numAmount = Number(amount) || 0;
  const isAboveThreshold = !isAdmin && numAmount > threshold;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedWingId) {
      return toast.error('Please select a wing.');
    }

    if (!selectedFlatId) {
      return toast.error('Please select a flat.');
    }

    if (!selectedInvoiceId) {
      return toast.error('Please select a past invoice or Prior Bill Adjustment.');
    }

    if (!amount || numAmount <= 0) {
      return toast.error('Please enter a valid credit note amount.');
    }

    if (selectedInvoice && numAmount > (selectedInvoice.totalAmount || 0)) {
      return toast.error(`Amount cannot exceed the invoice total of ₹${selectedInvoice.totalAmount.toLocaleString('en-IN')}`);
    }

    if (!reason || !reason.trim()) {
      return toast.error('A mandatory reason must be provided (FR-B6.1).');
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/billing/credit-notes', {
        invoiceId: selectedInvoiceId === 'GENERAL' || !selectedInvoiceId ? null : selectedInvoiceId,
        flatId: selectedFlatId,
        amount: numAmount,
        reason: reason.trim(),
      });

      if (res.data?.status === 'success' || res.status === 201) {
        const createdCN = res.data?.data;
        if (createdCN?.status === 'pending_approval') {
          toast.success(`Credit Note created (${createdCN.noteNumber}). Exceeds threshold - Routed to Committee Admin for approval.`);
        } else {
          toast.success(`Credit Note ${createdCN?.noteNumber || ''} issued and applied successfully!`);
        }
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Failed to issue credit note:', err);
      toast.error(err.response?.data?.message || 'Failed to issue credit note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              <FaFileInvoice />
            </div>
            <div>
              <h3 className="text-lg font-bold">Issue Credit Note</h3>
              <p className="text-xs text-orange-100">Reduce liability on a past invoice</p>
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
                <FaBuilding className="text-orange-500 text-xs" />
                Select Wing *
              </label>
              <select
                value={selectedWingId}
                onChange={(e) => {
                  setSelectedWingId(e.target.value);
                  setSelectedFlatId('');
                }}
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
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
                <FaDoorOpen className="text-orange-500 text-xs" />
                Select Flat *
              </label>
              <select
                value={selectedFlatId}
                onChange={(e) => setSelectedFlatId(e.target.value)}
                disabled={!selectedWingId || availableFlats.length === 0}
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500 disabled:opacity-50"
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

          {/* Select Past Invoice */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
              <span>Target Past Invoice *</span>
              {fetchingInvoices && (
                <span className="text-[10px] text-orange-500 font-normal flex items-center gap-1">
                  <FaSpinner className="animate-spin" /> Loading past invoices...
                </span>
              )}
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              disabled={!selectedFlatId || fetchingInvoices}
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500 disabled:opacity-50"
            >
              {!selectedFlatId ? (
                <option value="">-- Select a flat first --</option>
              ) : invoices.length === 0 ? (
                <option value="GENERAL">Prior / Legacy Bill Adjustment (No digital invoices found)</option>
              ) : (
                <>
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} | Period: {inv.billingPeriod} | Total: ₹{(inv.totalAmount || 0).toLocaleString('en-IN')} | Status: {inv.status}
                    </option>
                  ))}
                  <option value="GENERAL">Prior / Offline Bill Adjustment (Flat Balance Credit)</option>
                </>
              )}
            </select>
            {selectedInvoice ? (
              <div className="mt-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 flex justify-between">
                <span>Invoice Total: <strong>₹{(selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}</strong></span>
                <span>Paid: <strong>₹{(selectedInvoice.paidAmount || 0).toLocaleString('en-IN')}</strong></span>
                <span>Existing CN: <strong>₹{(selectedInvoice.creditNoteAmount || 0).toLocaleString('en-IN')}</strong></span>
              </div>
            ) : selectedFlatId && selectedInvoiceId === 'GENERAL' ? (
              <div className="mt-2 p-2.5 bg-orange-50/80 rounded-xl border border-orange-200 text-xs text-orange-900 flex items-center gap-2">
                <span>📌</span>
                <span><strong>Prior Bill Adjustment:</strong> Credit Note will be credited directly to this flat's ledger and recorded in its billing history.</span>
              </div>
            ) : null}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Credit Note Amount (₹) *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500"
            />
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
                    <span className="font-bold">Threshold Alert (FR-B6.3):</span> Amount exceeds the configured approval threshold (₹{threshold.toLocaleString('en-IN')}). This credit note will be routed to the <strong>Committee Admin</strong> for review before it takes effect.
                  </div>
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-emerald-500 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Immediate Effect:</span> Amount is within the Accountant Approval Threshold (₹{threshold.toLocaleString('en-IN')}) and will be automatically approved and applied to the past invoice liability.
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mandatory Reason (FR-B6.1) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
              <span>Reason for Correction / Adjustment *</span>
              <span className="text-[10px] text-red-500 font-semibold">Mandatory</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Specify billing correction details, e.g. Mr. Salve has paid 500 extra in previous bill..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 resize-none"
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
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {isAboveThreshold ? 'Submit for Committee Approval' : 'Issue & Apply Credit Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
