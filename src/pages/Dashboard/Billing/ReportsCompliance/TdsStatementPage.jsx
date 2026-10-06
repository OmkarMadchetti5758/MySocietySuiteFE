import React, { useState, useEffect } from 'react';
import { getTDSStatement, streamExportDownload } from '../../../../services/reportsApi';
import toast from 'react-hot-toast';
import { FaDownload, FaSpinner, FaLock } from 'react-icons/fa';

const TdsStatementPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const defaultFrom = new Date(currentMonth < 3 ? currentYear - 1 : currentYear, 3, 1).toISOString().split('T')[0];
  const defaultTo = new Date().toISOString().split('T')[0];

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => { setPage(1); }, [from, to]);
  useEffect(() => { fetchData(); }, [from, to, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // API response: { status, data: rows[], meta: { totals, vendorSummary, period, hasMore, totalCount } }
      const res = await getTDSStatement(from, to, page, PAGE_SIZE);
      setData({
        rows:          res.data            || [],
        totals:        res.meta?.totals,
        vendorSummary: res.meta?.vendorSummary || [],
        period:        res.meta?.period,
        generatedAt:   res.meta?.generatedAt,
        meta: {
          totalCount: res.meta?.totalCount ?? 0,
          hasMore:    res.meta?.hasMore    ?? false,
        },
      });
    } catch (err) {
      console.error('Failed to load TDS statement', err);
      toast.error('Failed to load TDS statement');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await streamExportDownload(
        'TDS',
        format,
        { from, to, fullPAN: false },
        `tds_statement.${format.toLowerCase()}`
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
          <h2 className="text-xl font-bold text-gray-900">TDS Statement</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.period ? `${data.period.from} to ${data.period.to}` : 'Loading...'}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-medium">
            <FaLock className="text-xs" />
            <span>PANs are masked for security (ABCDE****F)</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <button onClick={() => handleExport('EXCEL')} disabled={exporting}
            className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
            {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />} Excel
          </button>
        </div>
      </div>

      {/* Vendor Summary Cards */}
      {data?.totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Gross Payments', value: data.totals.grossPayment, color: 'text-gray-900', bg: 'bg-gray-50 border-gray-100' },
            { label: 'TDS Deducted', value: data.totals.tdsDeducted, color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
            { label: 'Net Paid', value: data.totals.netPaid, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Vendors', value: data.totals.vendorCount, color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-100', plain: true },
          ].map(card => (
            <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{card.label}</p>
              <p className={`text-lg font-black ${card.color}`}>{card.plain ? card.value : `₹${card.value}`}</p>
            </div>
          ))}
        </div>
      )}

      {/* Per-vendor Summary */}
      {data?.vendorSummary?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Vendor Summary</h4>
          <div className="grid gap-3">
            {data.vendorSummary.map(v => (
              <div key={v.vendorId} className="flex flex-wrap justify-between items-center bg-gray-50/60 border border-gray-100 rounded-xl px-4 py-3 gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{v.vendorName}</p>
                  <p className="text-xs text-gray-500">
                    PAN: <span className="font-mono">{v.pan || 'Not Provided'}</span>
                    {v.tdsSection && <> · Section: {v.tdsSection}</>}
                    {v.tdsRate && <> · {v.tdsRate}%</>}
                  </p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Gross</p>
                    <p className="font-bold text-gray-800">₹{v.grossPayment}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-500">TDS</p>
                    <p className="font-bold text-red-600">₹{v.tdsDeducted}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600">Net Paid</p>
                    <p className="font-bold text-emerald-700">₹{v.netPaid}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Payments Table */}
      <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Individual Payments</h4>
      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-4xl text-cyan-500" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Payment #</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">PAN (Masked)</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3 text-center">Rate</th>
                <th className="px-4 py-3 text-right">Gross</th>
                <th className="px-4 py-3 text-right text-red-600">TDS</th>
                <th className="px-4 py-3 text-right text-emerald-700">Net Paid</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Challan Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.rows?.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-400">
                    No TDS-applicable payments found for this period.
                  </td>
                </tr>
              )}
              {data?.rows?.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.paymentNumber || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.vendorName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    <FaLock className="inline-block mr-1 text-amber-400" />
                    {row.pan || <span className="italic">Not provided</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.tdsSection || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {row.tdsRate ? `${row.tdsRate}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">₹{row.grossAmount}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">₹{row.tdsDeducted}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">₹{row.netPaid}</td>
                  <td className="px-4 py-3 text-gray-600">{row.paymentDate}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{row.challanRef || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.meta && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + (data.rows?.length || 0)} of {data.meta.totalCount}
          </span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">← Prev</button>
            <button disabled={!data.meta.hasMore} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">Next →</button>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400 italic">
        Note: Filing TDS returns with the government is out of scope. This statement is for internal record-keeping only.
      </p>
    </div>
  );
};

export default TdsStatementPage;
