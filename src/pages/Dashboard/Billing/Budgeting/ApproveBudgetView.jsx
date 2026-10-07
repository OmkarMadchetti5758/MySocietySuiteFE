import {
  FaArrowLeft,
  FaCalculator,
} from 'react-icons/fa';
import { formatINR } from './mockBudgetData';

export default function ApproveBudgetView({
  budgetData,
  onBackToBudgeting,
  onApproveClick,
  onRejectClick,
  canApproveBudget = true,
}) {
  const totalBudget = budgetData.categories.reduce(
    (sum, c) => sum + (Number(c.budgetedAmount) || 0),
    0
  );

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBackToBudgeting}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <FaArrowLeft className="text-xs" /> Back to Budgeting
        </button>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-gradient-to-r from-[#fff3f0] to-[#fff8f6] border border-[#fddcd5] rounded-2xl p-6 sm:p-7 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Title & Description */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/90 border border-[#fcd3ca] flex items-center justify-center text-[#e04f36] shadow-2xs shrink-0">
              <FaCalculator className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                Approve Budget
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Review the allocations before the budget becomes active.
              </p>
            </div>
          </div>

          {/* Right Header Badges: Financial Year, Prepared By, Status */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Financial Year Box */}
            <div className="bg-white rounded-xl border border-gray-100/90 shadow-2xs px-4 py-2 min-w-[110px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                FINANCIAL YEAR
              </span>
              <span className="text-xs font-bold text-gray-900 block mt-0.5">
                {budgetData.financialYear || '2026-27'}
              </span>
            </div>

            {/* Prepared By Box */}
            <div className="bg-white rounded-xl border border-gray-100/90 shadow-2xs px-4 py-2 min-w-[110px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                PREPARED BY
              </span>
              <span className="text-xs font-bold text-gray-900 block mt-0.5">
                {budgetData.preparedBy || 'Accountant'}
              </span>
            </div>

            {/* Status Box */}
            <div className="bg-white rounded-xl border border-gray-100/90 shadow-2xs px-4 py-2 min-w-[90px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                STATUS
              </span>
              <div className="mt-0.5">
                <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full inline-block">
                  Draft
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category-wise Allocation List Table */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100/80 bg-white">
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  CATEGORY / CHARGE HEAD
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-left">
                  TYPE
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                  ALLOCATED AMOUNT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {budgetData.categories.map((row) => (
                <tr
                  key={row.id || row.name}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6 text-sm font-semibold text-gray-800">
                    {row.name}
                  </td>
                  <td className="py-4 px-6 text-left">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff0ed] text-[#e04f36] border border-[#fdd5cc]">
                      {row.type || 'Expense'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
                    {formatINR(row.budgetedAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions Row */}
        <div className="border-t border-gray-100/90 p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Total Budget on the left */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              TOTAL BUDGET
            </span>
            <span className="text-xl font-black text-gray-900 block mt-0.5">
              {formatINR(totalBudget)}
            </span>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={onRejectClick}
              className="border border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-700 hover:text-red-600 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Reject Budget
            </button>
            <button
              type="button"
              onClick={onApproveClick}
              className="bg-[#18191b] hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Approve Budget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
