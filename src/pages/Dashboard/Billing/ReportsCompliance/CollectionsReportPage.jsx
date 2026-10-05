import React, { useState, useEffect } from 'react';
import { getCollections, streamExportDownload } from '../../../../services/reportsApi';
import toast from 'react-hot-toast';
import { FaDownload, FaSpinner } from 'react-icons/fa';

const paymentModeLabel = (mode) => {
  const map = { CASH: 'Cash', CHEQUE: 'Cheque', BANK_TRANSFER: 'Bank Transfer', UPI: 'UPI', ONLINE: 'Online', OTHER: 'Other' };
  return map[mode?.toUpperCase?.()] ?? (mode || 'Other');
};

const ModeTag = ({ mode }) => {
  const colors = {
    UPI:           'bg-purple-50 text-purple-700',
    ONLINE:        'bg-blue-50 text-blue-700',
    BANK_TRANSFER: 'bg-blue-50 text-blue-700',
    CHEQUE:        'bg-amber-50 text-amber-700',
    CASH:          'bg-green-50 text-green-700',
    OTHER:         'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[mode?.toUpperCase()] ?? colors.OTHER}`}>
      {paymentModeLabel(mode)}
    </span>
  );
};

const CollectionsReportPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [from, setFrom] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const [to, setTo] = useState(now.toISOString().split('T')[0]);
  const [modeFilter, setModeFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => { setPage(1); }, [from, to, modeFilter]);
  useEffect(() => { fetchData(); }, [from, to, modeFilter, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // API response: { status, data: rows[], meta: { totals, period, reconciliation, hasMore, totalCount } }
      const res = await getCollections(from, to, { mode: modeFilter || undefined }, page, PAGE_SIZE);
      setData({
        rows:           res.data          || [],
        totals:         res.meta?.totals,
        reconciliation: res.meta?.reconciliation,
        period:         res.meta?.period,
        generatedAt:    res.meta?.generatedAt,
        meta: {
          totalCount: res.meta?.totalCount ?? 0,
          hasMore:    res.meta?.hasMore    ?? false,
        },
      });
    } catch (err) {
      console.error('Failed to load collections report', err);
      toast.error('Failed to load collections report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await streamExportDownload(
        'COLLECTIONS',
        format,
        { from, to },
        `collections.${format.toLowerCase()}`
      );
      toast.success(`${format} downloaded!`);
    } catch (err) {
      console.error('Export failed', err);
      toast.error(err.message || 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Collection Report</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.period ? `${data.period.from} to ${data.period.to}` : 'Loading...'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Modes</option>
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="ONLINE">Online</option>
          </select>
          <button onClick={() => handleExport('EXCEL')} disabled={exporting}
            className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
            {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />} Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Collected', value: data.totals.totalCollected, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Advance / Excess', value: data.totals.totalAdvance, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
            { label: 'Receipts', value: data.totals.count, color: 'text-gray-900', bg: 'bg-gray-50 border-gray-100', plain: true },
            { label: 'Recon Delta', value: data.reconciliation?.delta, color: data.reconciliation?.delta === '0.00' ? 'text-green-700' : 'text-red-600', bg: data.reconciliation?.delta === '0.00' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100' },
          ].map(card => (
            <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{card.label}</p>
              <p className={`text-lg font-black ${card.color}`}>{card.plain ? card.value.toLocaleString('en-IN') : card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-4xl text-emerald-500" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Flat</th>
                <th className="px-4 py-3">Resident</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 text-right text-emerald-700">Amount Paid</th>
                <th className="px-4 py-3 text-right text-indigo-600">Excess/Advance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.rows?.length === 0 && (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">No collections found for this period.</td></tr>
              )}
              {data?.rows?.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-700">{row.paymentDate}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.receiptNumber || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.flatNumber} {row.blockName ? `(${row.blockName})` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.residentName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{row.invoiceNumber || '—'}</td>
                  <td className="px-4 py-3"><ModeTag mode={row.mode} /></td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">₹{row.amountPaid}</td>
                  <td className="px-4 py-3 text-right text-indigo-600">
                    {parseFloat(row.excessAmount) > 0 ? `₹${row.excessAmount}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.meta && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>Showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + (data.rows?.length || 0)} of {data.meta.totalCount}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">← Prev</button>
            <button disabled={!data.meta.hasMore} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">Next →</button>
          </div>
        </div>
      )}

      {/* By-mode breakdown */}
      {data?.totals?.byMode && Object.keys(data.totals.byMode).length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Collections by Payment Mode</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.totals.byMode).map(([mode, amt]) => (
              <div key={mode} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex flex-col">
                <span className="text-xs text-gray-500">{paymentModeLabel(mode)}</span>
                <span className="font-bold text-gray-900">₹{amt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reconciliation */}
      {data?.reconciliation && (
        <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold text-blue-800">Ledger Reconciliation: </span>
            <span className="text-blue-600">Bank / Cash GL Debits = {data.reconciliation.ledgerBankCashReceipts}</span>
          </div>
          <div>
            <span className="text-gray-500 mr-2">Delta:</span>
            <span className={`font-bold ${data.reconciliation.delta === '0.00' ? 'text-green-600' : 'text-red-600'}`}>
              {data.reconciliation.delta}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsReportPage;
