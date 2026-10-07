// Static Mock Data for Budgeting Module (FR-B10.1, FR-B10.2, FR-B10.3)

export const INITIAL_BUDGET_DATA = {
  financialYear: '2026-27',
  preparedBy: 'Accountant',
  status: 'Approved', // 'Draft' | 'Approved' | 'Rejected'
  rejectionReason: 'Repairs allocation looks too low for this year',
  categories: [
    {
      id: 'cat-1',
      name: 'Security',
      type: 'Expense',
      budgetedAmount: 300000,
      actualAmount: 180000,
      variance: 120000,
    },
    {
      id: 'cat-2',
      name: 'Electricity',
      type: 'Expense',
      budgetedAmount: 200000,
      actualAmount: 120000,
      variance: 80000,
    },
    {
      id: 'cat-3',
      name: 'Cleaning',
      type: 'Expense',
      budgetedAmount: 150000,
      actualAmount: 90000,
      variance: 60000,
    },
    {
      id: 'cat-4',
      name: 'Maintenance',
      type: 'Expense',
      budgetedAmount: 500000,
      actualAmount: 350000,
      variance: 150000,
    },
    {
      id: 'cat-5',
      name: 'Repairs',
      type: 'Expense',
      budgetedAmount: 100000,
      actualAmount: 110000,
      variance: -10000,
    },
  ],
};

export const AVAILABLE_FINANCIAL_YEARS = ['2026-27', '2025-26', '2024-25'];

export const AVAILABLE_CHARGE_HEADS = [
  { name: 'Security', type: 'Expense' },
  { name: 'Electricity', type: 'Expense' },
  { name: 'Cleaning', type: 'Expense' },
  { name: 'Maintenance', type: 'Expense' },
  { name: 'Repairs', type: 'Expense' },
  { name: 'Water Charges', type: 'Expense' },
  { name: 'Elevator AMC', type: 'Expense' },
  { name: 'Gardening & Landscaping', type: 'Expense' },
];

export const formatINR = (val) => {
  const num = Number(val) || 0;
  if (num < 0) {
    return `-₹${Math.abs(num).toLocaleString('en-IN')}`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};
