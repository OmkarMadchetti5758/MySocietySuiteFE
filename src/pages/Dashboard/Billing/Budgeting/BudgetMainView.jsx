import { useState } from 'react';
import {
  FaArrowLeft,
  FaCalculator,
  FaChevronDown,
  FaPlus,
  FaCheckCircle,
} from 'react-icons/fa';
import { AVAILABLE_FINANCIAL_YEARS, formatINR } from './mockBudgetData';

export default function BudgetMainView({
  budgetData,
  onBackToHub,
  onCreateBudgetClick,
  onApproveBudgetClick,
  onFinancialYearChange,
  canCreateBudget = false,
  canApproveBudget = false,
}) {
  const [isFyDropdownOpen, setIsFyDropdownOpen] = useState(false);

  // Compute totals
  const totalBudgeted = budgetData.categories.reduce(
    (sum, c) => sum + (Number(c.budgetedAmount) || 0),
    0
  );
  const totalActual = budgetData.categories.reduce(
    (sum, c) => sum + (Number(c.actualAmount) || 0),
    0
  );
  const totalVariance = budgetData.categories.reduce(
    (sum, c) => sum + (Number(c.variance) || 0),
    0
  );

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-3 py-0.5 rounded-full">
            Approved
          </span>
        );
      case 'draft':
        return (
          <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-3 py-0.5 rounded-full">
            Draft
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-0.5 rounded-full">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-gray-50 text-gray-600 border border-gray-200 text-xs font-bold px-3 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToHub}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors w-fit cursor-pointer"
        >
          <FaArrowLeft className="text-xs" /> Back to Billing Hub
        </button>

        {/* Action Button Allowed for Logged-In Role Only */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Accountant-only action */}
          {canCreateBudget && (
            <button
              onClick={onCreateBudgetClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#18191b] hover:bg-black text-white shadow-xs transition-all cursor-pointer"
            >
              <FaPlus className="text-[10px] text-orange-400" />
              Create Budget Draft
            </button>
          )}

          {/* Committee Admin-only action */}
          {canApproveBudget && (
            <button
              onClick={onApproveBudgetClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#18191b] hover:bg-black text-white shadow-xs transition-all cursor-pointer"
            >
              <FaCheckCircle className="text-[10px] text-emerald-400" />
              Approve Budget
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-gradient-to-r from-[#fff3f0] to-[#fff8f6] border border-[#fddcd5] rounded-2xl p-6 sm:p-7 shadow-xs relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left Title & Description */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/90 border border-[#fcd3ca] flex items-center justify-center text-[#e04f36] shadow-2xs shrink-0">
              <FaCalculator className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                Budgeting
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Draft, approve, and track the annual budget against actuals.
              </p>
            </div>
          </div>

          {/* Right Controls: Financial Year & Status */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Financial Year Selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                FINANCIAL YEAR
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFyDropdownOpen(!isFyDropdownOpen)}
                  className="bg-[#18191b] hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <span>{budgetData.financialYear}</span>
                  <FaChevronDown className="text-[10px] opacity-70" />
                </button>

                {isFyDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    {AVAILABLE_FINANCIAL_YEARS.map((fy) => (
                      <button
                        key={fy}
                        type="button"
                        onClick={() => {
                          onFinancialYearChange?.(fy);
                          setIsFyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          fy === budgetData.financialYear
                            ? 'bg-orange-50 text-orange-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {fy}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Budget Status Badge */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                BUDGET STATUS
              </label>
              <div className="bg-white rounded-xl border border-gray-100/90 shadow-2xs px-3 py-1 flex items-center justify-center min-h-[30px]">
                {getStatusBadge(budgetData.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Total Budget Metric Card */}
        <div className="mt-6 pt-2">
          <div className="bg-white rounded-xl border border-gray-100/90 shadow-2xs px-5 py-2.5 inline-block">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              TOTAL BUDGET
            </span>
            <span className="text-xl font-black text-gray-900 block mt-0.5">
              {formatINR(totalBudgeted)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Budget vs Actuals Table */}
      <div className="bg-white rounded-2xl border border-gray-100/90 shadow-2xs overflow-hidden mt-6">
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
                  BUDGETED AMOUNT
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                  ACTUAL AMOUNT
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                  VARIANCE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {budgetData.categories.map((row) => {
                const isNegative = Number(row.variance) < 0;
                return (
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
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
                      {formatINR(row.actualAmount)}
                    </td>
                    <td
                      className={`py-4 px-6 text-sm font-semibold text-right ${
                        isNegative ? 'text-red-500 font-bold' : 'text-gray-900'
                      }`}
                    >
                      {formatINR(row.variance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Total Row */}
            <tfoot>
              <tr className="border-t border-gray-100 bg-white font-bold">
                <td className="py-4 px-6 text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="py-4 px-6"></td>
                <td className="py-4 px-6 text-sm font-black text-gray-900 text-right">
                  {formatINR(totalBudgeted)}
                </td>
                <td className="py-4 px-6 text-sm font-black text-gray-900 text-right">
                  {formatINR(totalActual)}
                </td>
                <td className="py-4 px-6 text-sm font-black text-gray-900 text-right">
                  {formatINR(totalVariance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
