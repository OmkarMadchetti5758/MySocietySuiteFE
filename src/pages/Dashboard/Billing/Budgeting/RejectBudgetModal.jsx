import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function RejectBudgetModal({
  isOpen,
  onClose,
  onConfirmReject,
  financialYear = '2026-27',
  initialReason = 'Repairs allocation looks too low for this year',
}) {
  const [reason, setReason] = useState(initialReason);
  const [hasError, setHasError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setHasError(true);
      return;
    }
    onConfirmReject(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Reject budget</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              The FY {financialYear} budget goes back to the Accountant as a draft.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            REJECTION REASON
          </label>
          <textarea
            rows="3"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setHasError(false);
            }}
            placeholder="Specify reason for rejecting this budget..."
            className="w-full bg-[#18191b] text-white text-xs rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-red-500 border border-transparent font-normal leading-relaxed resize-none"
          />
          <span className="text-[11px] text-red-500 mt-1.5 block">
            Enter a reason to reject this budget.
          </span>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#18191b] hover:bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reject Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
