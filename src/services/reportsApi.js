import apiClient, { API_URL } from './apiClient';

// societyId is NOT in the URL — it comes from the JWT (set by injectSocietyId middleware on the BE).
// All report endpoints are under /api/v1/reports/...

export const getReportSettings = async () => {
  const { data } = await apiClient.get('/reports/settings');
  return data;
};

export const updateReportSettings = async (settings) => {
  const { data } = await apiClient.patch('/reports/settings', settings);
  return data;
};

export const getBalanceSheet = async (asOf) => {
  const params = new URLSearchParams();
  if (asOf) params.append('asOf', asOf);
  const { data } = await apiClient.get(`/reports/balance-sheet?${params.toString()}`);
  return data;
};

export const getProfitLoss = async (from, to) => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const { data } = await apiClient.get(`/reports/profit-loss?${params.toString()}`);
  return data;
};

export const getGSTReport = async (from, to) => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const { data } = await apiClient.get(`/reports/gst?${params.toString()}`);
  return data;
};

export const getTDSStatement = async (from, to, page = 1, pageSize = 50) => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  params.append('page', page);
  params.append('pageSize', pageSize);
  const { data } = await apiClient.get(`/reports/tds?${params.toString()}`);
  return data;
};

export const getDuesAgeing = async (asOf, filters = {}, page = 1, pageSize = 50) => {
  const params = new URLSearchParams();
  if (asOf) params.append('asOf', asOf);
  if (filters.flat) params.append('flat', filters.flat);
  if (filters.block) params.append('block', filters.block);
  if (filters.bucket) params.append('bucket', filters.bucket);
  if (filters.defaultersOnly) params.append('defaulters', 'true');
  params.append('page', page);
  params.append('pageSize', pageSize);
  const { data } = await apiClient.get(`/reports/dues-ageing?${params.toString()}`);
  return data;
};

export const getCollections = async (from, to, filters = {}, page = 1, pageSize = 50) => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (filters.flat) params.append('flat', filters.flat);
  if (filters.block) params.append('block', filters.block);
  if (filters.mode) params.append('mode', filters.mode);
  if (filters.account) params.append('account', filters.account);
  params.append('page', page);
  params.append('pageSize', pageSize);
  const { data } = await apiClient.get(`/reports/collections?${params.toString()}`);
  return data;
};

export const createExportJob = async (reportType, format, params = {}) => {
  const { data } = await apiClient.post('/reports/exports', { reportType, format, params });
  return data;
};

export const getExportJob = async (jobId) => {
  const { data } = await apiClient.get(`/reports/exports/${jobId}`);
  return data;
};

export const getExportDownloadUrl = async (jobId) => {
  const { data } = await apiClient.get(`/reports/exports/${jobId}/download`);
  return data;
};

/**
 * streamExportDownload — calls POST /reports/exports/stream and triggers
 * a direct browser download. No ExportJob, no S3, no polling needed.
 *
 * @param {string} reportType  e.g. "BALANCE_SHEET"
 * @param {string} format      "EXCEL" | "PDF" | "CSV"
 * @param {object} params      Report-specific params (asOf, from, to, etc.)
 * @param {string} filename    Suggested local filename e.g. "balance_sheet.xlsx"
 */
export const streamExportDownload = async (reportType, format, params = {}, filename) => {
  const token = localStorage.getItem('accessToken');
  const activeContext = localStorage.getItem('activeContext');

  const response = await fetch(
    `${API_URL}/reports/exports/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token        ? { Authorization: `Bearer ${token}` }   : {}),
        ...(activeContext ? { 'X-Active-Context': activeContext } : {}),
      },
      body: JSON.stringify({ reportType, format, params }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Export failed (${response.status})`);
  }

  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename || `report.${format.toLowerCase()}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
};
