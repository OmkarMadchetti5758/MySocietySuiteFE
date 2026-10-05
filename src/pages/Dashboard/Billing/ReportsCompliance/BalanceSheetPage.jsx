import React, { useState, useEffect, Fragment } from 'react';
import { getBalanceSheet, streamExportDownload } from '../../../../services/reportsApi';
import toast from 'react-hot-toast';
import { FaDownload, FaSpinner, FaChevronRight, FaChevronDown, FaEye, FaEyeSlash } from 'react-icons/fa';

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '';
  const num = parseFloat(amount.toString().replace(/,/g, ''));
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const AccountTree = ({ accounts, isRoot = true, hideZero = false }) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className={`w-full ${isRoot ? '' : 'pl-4 border-l border-gray-100'}`}>
      {accounts.map(acc => {
        const hasChildren = acc.children && acc.children.length > 0;
        const balanceNum = parseFloat(acc.balance?.toString().replace(/,/g, '') || 0);

        // Hide if hideZero is true, balance is 0, AND it has no non-zero children
        // For simplicity, if hideZero is checked, we hide leaf nodes with 0 balance.
        if (hideZero && !hasChildren && balanceNum === 0) return null;
        // If it's a parent node and hideZero is true, we still want to show it if it has children that are shown.
        // A better approach is if balance is 0 and hideZero is true, we hide.
        if (hideZero && balanceNum === 0) return null;

        const isExpanded = expanded[acc.accountId];

        // Heuristic to fix broken root styling for stray leaf accounts:
        const actuallyRoot = isRoot && hasChildren;
        const textStyle = actuallyRoot ? 'font-semibold text-gray-800' : (balanceNum === 0 ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm');

        return (
          <Fragment key={acc.accountId}>
            <div
              className={`flex justify-between items-center py-2 ${textStyle} hover:bg-gray-50/50 cursor-pointer`}
              onClick={() => hasChildren && toggle(acc.accountId)}
            >
              <div className="flex items-center gap-2">
                {hasChildren
                  ? isExpanded ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronRight className="text-gray-400 text-xs" />
                  : <span className="w-3" />}
                <span>{acc.accountCode} - {acc.accountName}</span>
              </div>
              <span>{formatCurrency(acc.balance)}</span>
            </div>
            {hasChildren && isExpanded && <AccountTree accounts={acc.children} isRoot={false} hideZero={hideZero} />}
          </Fragment>
        );
      })}
    </div>
  );
};

const pollExport = async (jobId) => {
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const s = await getExportJob(jobId);
    if (s.data.job.status === 'DONE') return true;
    if (s.data.job.status === 'FAILED') throw new Error('Export failed');
  }
  throw new Error('Export timed out');
};

const BalanceSheetPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);
  const [hideZero, setHideZero] = useState(true);

  useEffect(() => { fetchData(); }, [asOf]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getBalanceSheet(asOf);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await streamExportDownload(
        'BALANCE_SHEET',
        format,
        { asOf },
        `balance_sheet.${format.toLowerCase()}`
      );
      toast.success(`${format} downloaded!`);
    } catch (err) {
      console.error('Export failed', err);
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Balance Sheet</h2>
          <p className="text-sm text-gray-500 mt-1">As of: {data?.asOf}</p>
        </div>
        <div className="flex gap-4 items-center">
          {/* <button onClick={() => setHideZero(!hideZero)}
            className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
            {hideZero ? <FaEyeSlash /> : <FaEye />} {hideZero ? 'Hidden' : 'Showing'} Zeros
          </button> */}
          <input type="date" value={asOf} onChange={e => setAsOf(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => handleExport('EXCEL')} disabled={exporting}
            className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
            {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />} Excel
          </button>
          <button onClick={() => handleExport('PDF')} disabled={exporting}
            className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
            {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />} PDF
          </button>
        </div>
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* ASSETS */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">ASSETS</h3>
            <AccountTree accounts={data.sections?.assets?.accounts} hideZero={hideZero} />
            <div className="flex justify-between mt-6 pt-4 border-t-2 border-gray-200 font-bold text-gray-900 text-lg">
              <span>Total Assets</span><span>{formatCurrency(data.totals?.totalAssets)}</span>
            </div>
          </div>

          {/* LIABILITIES + EQUITY */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 flex flex-col">
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">LIABILITIES</h3>
              <AccountTree accounts={data.sections?.liabilities?.accounts} hideZero={hideZero} />

              <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">EQUITY & FUNDS</h3>
              <AccountTree accounts={data.sections?.equity?.accounts} hideZero={hideZero} />

              <div className="flex justify-between mt-4 py-2 text-indigo-700 font-semibold">
                <span>{data.sections?.currentPeriodSurplus?.label}</span>
                <span>{formatCurrency(data.sections?.currentPeriodSurplus?.amount)}</span>
              </div>
            </div>
            <div className="flex justify-between mt-6 pt-4 border-t-2 border-gray-200 font-bold text-gray-900 text-lg">
              <span>Total Liab + Equity</span><span>{formatCurrency(data.totals?.totalLiabAndEquity)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Balance check invariant indicator */}
      {data?.totals && (
        <div className={`mt-8 p-4 rounded-xl border flex items-center justify-between font-semibold
          ${data.totals.isBalanced ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className="flex items-center gap-2">
            {data.totals.isBalanced
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            <span>Balance Check (Assets − Liab − Equity − Surplus)</span>
          </div>
          <span>{data.totals.balanceCheck}</span>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetPage;
