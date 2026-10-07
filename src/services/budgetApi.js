import apiClient from './apiClient';

/**
 * Budget API Service
 * All calls include the Bearer token via the apiClient interceptor.
 * societyId is enforced server-side from the JWT.
 */

/** List budgets, optionally filtered by FY */
export const getBudgets = (financialYear) => {
  const params = financialYear ? { financialYear } : {};
  return apiClient.get('/budgets', { params });
};

/** Create a new DRAFT budget for the given FY */
export const createBudget = (financialYear) =>
  apiClient.post('/budgets', { financialYear });

/** Get a single budget with its lines */
export const getBudget = (id) => apiClient.get(`/budgets/${id}`);

/** Get budget vs actuals (for APPROVED budgets with active FY) */
export const getBudgetVsActual = (id) => apiClient.get(`/budgets/${id}/vs-actual`);

/** Save draft lines. body: { rowVersion, lines: [{ ledgerAccountId, allocatedPaise }] } */
export const saveLines = (id, body) => apiClient.put(`/budgets/${id}/lines`, body);

/** Submit the draft for approval */
export const submitBudget = (id) => apiClient.post(`/budgets/${id}/submit`);

/** Approve the budget (Committee Admin) */
export const approveBudget = (id, comment) =>
  apiClient.post(`/budgets/${id}/approve`, { comment });

/** Send back to draft (Committee Admin) */
export const sendBackBudget = (id, comment) =>
  apiClient.post(`/budgets/${id}/send-back`, { comment });

/** Withdraw from pending (Accountant) */
export const withdrawBudget = (id) => apiClient.post(`/budgets/${id}/withdraw`);

/** Get audit history for a budget */
export const getBudgetHistory = (id) => apiClient.get(`/budgets/${id}/history`);

/** Get eligible ledger accounts for the line picker */
export const getEligibleAccounts = () => apiClient.get('/budgets/eligible-accounts');
