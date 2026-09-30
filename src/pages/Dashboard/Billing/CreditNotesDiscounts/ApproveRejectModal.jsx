import { useState } from 'react';
import { FaTimes, FaSpinner, FaCheck, FaBan, FaShieldAlt } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function ApproveRejectModal({ isOpen, onClose, item, type = 'credit-note', onSuccess }) {
  const [action, setAction] = useState('approve'); // 'approve' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const isCreditNote = type === 'credit-note';
  const title = isCreditNote ? 'Credit Note Approval' : 'Discount Approval';
  const identifier = isCreditNote ? (item.noteNumber || 'CN') : (item.discountCode || 'DISC');
  const amountStr = `₹${(Number(item.amount) || 0).toLocaleString('en-IN')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (action === 'reject' && !rejectionReason.trim()) {
      return toast.error('Please state a reason for rejecting this request.');
    }

    setLoading(true);
    try {
      const endpoint = isCreditNote
        ? `/billing/credit-notes/${item._id}/approve`
        : `/billing/discounts/${item._id}/approve`;

      const res = await apiClient.post(endpoint, {
        action,
        rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined,
      });

      if (res.data?.status === 'success' || res.status === 200) {
        toast.success(
          `${isCreditNote ? 'Credit Note' : 'Discount'} ${identifier} ${action === 'reject' ? 'rejected' : 'approved'} successfully!`
        );
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Approval/Rejection error:', err);
      toast.error(err.response?.data?.message || `Failed to ${action} item`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-gray-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-xl">
              <FaShieldAlt />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-xs text-gray-300">FR-B6.3: Committee Admin Approval Workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Details summary */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">{isCreditNote ? 'Credit Note ID' : 'Discount Code'}:</span>
              <span className="font-mono font-bold text-gray-900">{identifier}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Amount:</span>
              <span className="font-mono font-bold text-base text-gray-900">{amountStr}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Flat:</span>
              <span className="font-semibold text-gray-800">
                {item.flatId?.flatNumber ? `Flat ${item.flatId.flatNumber}` : '-'}
              </span>
            </div>
            {isCreditNote && item.invoiceId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Target Invoice:</span>
                <span className="font-semibold text-gray-800">{item.invoiceId.invoiceNumber || item.invoiceId}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200/60">
              <div className="text-gray-500 mb-1">Attached Reason:</div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-800 italic">
                "{item.reason || 'No reason provided'}"
              </div>
            </div>
          </div>

          {/* Action selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Select Decision *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${action === 'approve'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <FaCheck /> Approve
              </button>

              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${action === 'reject'
                    ? 'bg-red-50 text-red-700 border-red-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <FaBan /> Reject
              </button>
            </div>
          </div>

          {/* Rejection reason */}
          {action === 'reject' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Rejection Reason *
              </label>
              <textarea
                rows={2}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State clearly why this request cannot be approved..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
          )}

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
              disabled={loading || (action === 'reject' && !rejectionReason.trim())}
              className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${action === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
            >
              {loading && <FaSpinner className="animate-spin" />}
              Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
