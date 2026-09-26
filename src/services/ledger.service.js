import apiClient from './apiClient';

const ledgerService = {
  getOverview: (params) => apiClient.get('/ledger/overview', { params }),
  
  // General Ledger
  getGeneralLedger: (params) => apiClient.get('/ledger/general-ledger', { params }),
  getMyLedger: (params) => apiClient.get('/ledger/my', { params }),
  getAccountStatement: (accountId, params) => apiClient.get(`/ledger/accounts/${accountId}/statement`, { params }),

  // Chart of Accounts
  getChartOfAccounts: (params) => apiClient.get('/ledger/accounts', { params }),
  createAccount: (data) => apiClient.post('/ledger/accounts', data),
  deactivateAccount: (id) => apiClient.patch(`/ledger/accounts/${id}/deactivate`),
  seedChartOfAccounts: () => apiClient.post('/ledger/accounts/seed'),

  // Journal Entries
  listJournalEntries: (params) => apiClient.get('/ledger/journal-entries', { params }),
  getJournalEntry: (id) => apiClient.get(`/ledger/journal-entries/${id}`),
  createJournalEntry: (data) => apiClient.post('/ledger/journal-entries', data),
  submitJournalEntry: (id) => apiClient.post(`/ledger/journal-entries/${id}/submit`),
  approveJournalEntry: (id) => apiClient.post(`/ledger/journal-entries/${id}/approve`),
  postJournalEntry: (id) => apiClient.post(`/ledger/journal-entries/${id}/post`),
  rejectJournalEntry: (id, reason) => apiClient.post(`/ledger/journal-entries/${id}/reject`, { reason }),
  reverseJournalEntry: (id, reason) => apiClient.post(`/ledger/journal-entries/${id}/reverse`, { reason }),

  // Accounting Periods
  getAccountingPeriods: (params) => apiClient.get('/ledger/periods', { params }),
  closePeriod: (id) => apiClient.post(`/ledger/periods/${id}/close`),
  reopenPeriod: (id, reason) => apiClient.post(`/ledger/periods/${id}/reopen`, { reason }),

  // Audit Logs
  getAuditLogs: (params) => apiClient.get('/ledger/audit-logs', { params }),
};

export default ledgerService;
