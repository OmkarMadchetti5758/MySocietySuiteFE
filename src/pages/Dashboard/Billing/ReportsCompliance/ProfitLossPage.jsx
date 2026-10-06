import React, { useState, useEffect, Fragment } from 'react';
import { getProfitLoss, streamExportDownload } from '../../../../services/reportsApi';
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

  const toggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!accounts || accounts.length === 0) return null;

  return (
    <div className={`w-full ${isRoot ? '' : 'pl-4 border-l border-gray-100'}`}>
      {accounts.map(acc => {
        const hasChildren = acc.children && acc.children.length > 0;
        const balanceNum = parseFloat(acc.balance?.toString().replace(/,/g, '') || 0);
        
        if (hideZero && !hasChildren && balanceNum === 0) return null;
        if (hideZero && balanceNum === 0) return null;

        const isExpanded = expanded[acc.accountId];
        
        const actuallyRoot = isRoot && hasChildren;
        const textStyle = actuallyRoot ? 'font-semibold text-gray-800' : (balanceNum === 0 ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm');

        return (
          <Fragment key={acc.accountId}>
            <div 
              className={`flex justify-between items-center py-2 ${textStyle} hover:bg-gray-50/50 cursor-pointer transition-colors`}
              onClick={() => hasChildren && toggle(acc.accountId)}
            >
              <div className="flex items-center gap-2">
                {hasChildren ? (
                  isExpanded ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronRight className="text-gray-400 text-xs" />
                ) : (
                  <span className="w-3"></span>
                )}
                <span>{acc.accountCode} - {acc.accountName}</span>
              </div>
              <span>{formatCurrency(acc.balance)}</span>
            </div>
            {hasChildren && isExpanded && (
              <AccountTree accounts={acc.children} isRoot={false} hideZero={hideZero} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

const ProfitLossPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const defaultFrom = new Date(currentMonth < 3 ? currentYear - 1 : currentYear, 3, 1).toISOString().split('T')[0];
  const defaultTo = new Date().toISOString().split('T')[0];
  
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [exporting, setExporting] = useState(false);
  const [hideZero, setHideZero] = useState(true);

  useEffect(() => {
    fetchData();
  }, [from, to]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProfitLoss(from, to);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load P&L report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await streamExportDownload(
        'PROFIT_LOSS',
        format,
        { from, to },
        `profit_loss.${format.toLowerCase()}`
      );
      toast.success(`${format} downloaded!`);
    } catch (err) {
      console.error('Export failed', err);
      toast.error(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-purple-500" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Income & Expenditure Statement</h2>
          <p className="text-sm text-gray-500 mt-1">Period: {data?.period?.from} to {data?.period?.to}</p>
        </div>
        <div className="flex gap-4 items-center">
          {/* <button onClick={() => setHideZero(!hideZero)}
            className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
            {hideZero ? <FaEyeSlash /> : <FaEye />} {hideZero ? 'Hidden' : 'Showing'} Zeros
          </button> */}
          <div className="flex items-center gap-2">
             <input 
                type="date" 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
          </div>
          <div className="flex gap-2">
             <button 
                onClick={() => handleExport('EXCEL')}
                disabled={exporting}
                className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
              >
                {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />} Excel
             </button>
             <button 
                onClick={() => handleExport('PDF')}
                disabled={exporting}
                className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />} PDF
             </button>
          </div>
        </div>
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* INCOME Column */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 flex flex-col h-full">
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">INCOME</h3>
              <AccountTree accounts={data.sections?.income?.accounts} hideZero={hideZero} />
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200 font-bold text-gray-900 text-lg">
              <span>Total Income</span>
              <span>{formatCurrency(data.sections?.income?.total)}</span>
            </div>
          </div>

          {/* EXPENSE Column */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 flex flex-col h-full">
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">EXPENDITURE</h3>
              <AccountTree accounts={data.sections?.expense?.accounts} hideZero={hideZero} />
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-gray-200 font-bold text-gray-900 text-lg">
              <span>Total Expenditure</span>
              <span>{formatCurrency(data.sections?.expense?.total)}</span>
            </div>
          </div>

        </div>
      )}

      {data?.surplus && (
        <div className={`mt-8 p-6 rounded-xl border flex items-center justify-between font-bold text-xl ${data.surplus.amount.includes('-') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
           <span>{data.surplus.label}</span>
           <span>{formatCurrency(data.surplus.amount)}</span>
        </div>
      )}

    </div>
  );
};

export default ProfitLossPage;
