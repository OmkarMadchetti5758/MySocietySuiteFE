import { useState } from 'react';
import {
  FaArrowLeft,
  FaCalculator,
  FaTrash,
  FaChevronDown,
} from 'react-icons/fa';
import {
  AVAILABLE_FINANCIAL_YEARS,
  AVAILABLE_CHARGE_HEADS,
  formatINR,
} from './mockBudgetData';

export default function CreateBudgetView({
  budgetData,
  onBackToBudgeting,
  onSaveDraft,
  canCreateBudget = true,
}) {
  const [financialYear, setFinancialYear] = useState(budgetData.financialYear || '2026-27');
  const [selectedCategory, setSelectedCategory] = useState('Cleaning');
  const [selectedType, setSelectedType] = useState('Expense');
  const [allocatedAmount, setAllocatedAmount] = useState('150000');
  const [categories, setCategories] = useState(
    budgetData.categories.map((c) => ({
      id: c.id || `cat-${Date.now()}-${Math.random()}`,
      name: c.name,
      type: c.type || 'Expense',
      allocatedAmount: c.budgetedAmount || c.allocatedAmount || 0,
    }))
  );

  // Calculate dynamic total
  const totalBudget = categories.reduce(
    (sum, c) => sum + (Number(c.allocatedAmount) || 0),
    0
  );

  // Add category to list
  const handleAddCategory = (e) => {
    e.preventDefault();
    const amount = Number(allocatedAmount);
    if (!selectedCategory || !amount || amount <= 0) return;

    // Check if category already exists; if so, update amount
    const existingIndex = categories.findIndex((c) => c.name === selectedCategory);
    if (existingIndex >= 0) {
      const updated = [...categories];
      updated[existingIndex].allocatedAmount = amount;
      updated[existingIndex].type = selectedType;
      setCategories(updated);
    } else {
      setCategories([
        ...categories,
        {
          id: `cat-${Date.now()}`,
          name: selectedCategory,
          type: selectedType,
          allocatedAmount: amount,
        },
      ]);
    }
  };

  // Remove category
  const handleRemoveCategory = (id) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    onSaveDraft({
      financialYear,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        budgetedAmount: c.allocatedAmount,
        actualAmount: Math.round(c.allocatedAmount * 0.7), // realistic mock actuals
        variance: Math.round(c.allocatedAmount * 0.3),
      })),
      totalBudget,
      status: 'Draft',
    });
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/90 border border-[#fcd3ca] flex items-center justify-center text-[#e04f36] shadow-2xs shrink-0">
              <FaCalculator className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                Create Budget
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Allocate an amount to each charge head or expense category.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0 self-start sm:self-auto">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              STATUS
            </label>
            <div className="bg-white rounded-xl border border-gray-100/90 shadow-2xs px-3.5 py-1.5 flex items-center justify-center">
              <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-3 py-0.5 rounded-full">
                Draft
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100/90 p-5 sm:p-6 shadow-2xs mb-6">
        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Financial Year */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              FINANCIAL YEAR
            </label>
            <div className="relative">
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full bg-[#18191b] text-white text-xs font-semibold px-4 py-2.5 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer pr-8"
              >
                {AVAILABLE_FINANCIAL_YEARS.map((fy) => (
                  <option key={fy} value={fy} className="bg-[#18191b] text-white">
                    {fy}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
            </div>
          </div>

          {/* Category / Charge Head */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              CATEGORY / CHARGE HEAD
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  const matched = AVAILABLE_CHARGE_HEADS.find((h) => h.name === e.target.value);
                  if (matched) setSelectedType(matched.type);
                }}
                className="w-full bg-[#18191b] text-white text-xs font-semibold px-4 py-2.5 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer pr-8"
              >
                {AVAILABLE_CHARGE_HEADS.map((head) => (
                  <option key={head.name} value={head.name} className="bg-[#18191b] text-white">
                    {head.name}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              TYPE
            </label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#18191b] text-white text-xs font-semibold px-4 py-2.5 rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer pr-8"
              >
                <option value="Expense" className="bg-[#18191b] text-white">Expense</option>
                <option value="Income" className="bg-[#18191b] text-white">Income</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
            </div>
          </div>

          {/* Allocated Amount (₹) */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              ALLOCATED AMOUNT (₹)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={allocatedAmount}
              onChange={(e) => setAllocatedAmount(e.target.value)}
              placeholder="e.g. 150000"
              className="w-full bg-[#18191b] text-white text-xs font-semibold px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-gray-500"
            />
          </div>

          {/* Add Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-[#18191b] hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </form>
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
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center w-16">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((row) => (
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
                    {formatINR(row.allocatedAmount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(row.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer p-1"
                      title="Remove category"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-xs text-gray-400">
                    No categories allocated yet. Add one above.
                  </td>
                </tr>
              )}
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
              onClick={onBackToBudgeting}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-[#18191b] hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
