import { useState } from 'react';
import { FaTimes, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import vendorPaymentApi from '../../../../services/vendorPaymentApi';
import toast from 'react-hot-toast';

export default function ApproveRejectModal({ isOpen, onClose, payment, actionType = 'approve', onSuccess }) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !payment) return null;

  const isApprove = actionType === 'approve';
  const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isApprove && !comment.trim()) {
      toast.error('Rejection reason/comment is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = isApprove
        ? await vendorPaymentApi.approveVendorPayment(payment._id, comment.trim())
        : await vendorPaymentApi.rejectVendorPayment(payment._id, comment.trim());

      const updated = res.data?.data;
      toast.success(
        isApprove
          ? `Payment ${payment.paymentNumber} approved successfully!`
          : `Payment ${payment.paymentNumber} rejected.`
      );
      if (onSuccess) onSuccess(updated);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${isApprove ? 'approve' : 'reject'} payment.`;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${isApprove ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}
            >
              {isApprove ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isApprove ? 'Approve Payment Request' : 'Reject Payment Request'}
              </h3>
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
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Vendor</span>
              <span className="text-xs font-bold text-gray-900">{payment.vendorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Bill Reference</span>
              <span className="text-xs font-semibold text-gray-700">{payment.billReference || '-'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
              <span className="text-xs text-gray-500 font-medium">Amount</span>
              <span className="text-base font-black text-gray-900">{formatINR(payment.amount)}</span>
            </div>
          </div>

          {/* Comment Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {isApprove ? 'Approval Comments (Optional)' : 'Rejection Reason'} {!isApprove && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={
                isApprove
                  ? 'e.g. Work verified, approved for disbursal.'
                  : 'e.g. Invoice details incomplete, bill mismatch with purchase order.'
              }
              disabled={submitting}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Warning / Disclaimers */}
          <div
            className={`p-3 rounded-2xl text-xs border ${isApprove
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                : 'bg-red-50/70 border-red-200 text-red-800'
              }`}
          >
            {isApprove
              ? 'Once approved, the payment will be eligible for disbursal by the society accountant or committee admin.'
              : 'Rejecting this payment will stop the workflow. A new payment request must be raised if needed.'}
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
              disabled={submitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  {isApprove ? 'Approving...' : 'Rejecting...'}
                </>
              ) : isApprove ? (
                'Confirm Approval'
              ) : (
                'Confirm Rejection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
