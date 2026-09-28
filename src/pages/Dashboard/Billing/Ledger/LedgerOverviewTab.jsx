import React, { useState, useEffect } from 'react';
import { FaSpinner, FaWallet, FaRegCreditCard, FaChartPie, FaMoneyBillWave, FaArrowRight, FaUndo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ledgerService from '../../../../services/ledger.service';

const LedgerOverviewTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await ledgerService.getOverview();
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load ledger overview');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-gray-500"><FaSpinner className="animate-spin text-3xl mx-auto mb-3 text-cyan-600" />Loading ledger overview...</div>;
  }

  if (!data) return <div className="py-20 text-center text-gray-500">No data available</div>;

  const { summary, recentJournals, recentReversals } = data;

  const formatINR = (amount) => '₹' + (Number(amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <FaWallet className="absolute -right-4 -bottom-4 text-7xl opacity-10" />
          <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">Total Assets</div>
          <div className="text-3xl font-black">{formatINR(summary.totalAssets)}</div>
          <div className="mt-4 text-sm font-medium flex justify-between">
            <span>Bank: {formatINR(summary.bankBalance)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden">
          <FaRegCreditCard className="absolute -right-4 -bottom-4 text-7xl opacity-10" />
          <div className="text-rose-100 text-xs font-bold uppercase tracking-wider mb-2">Total Liabilities</div>
          <div className="text-3xl font-black">{formatINR(summary.totalLiabilities)}</div>
          <div className="mt-4 text-sm font-medium flex justify-between">
            <span>Payables: {formatINR(summary.payables)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
          <FaChartPie className="absolute -right-4 -bottom-4 text-7xl opacity-10" />
          <div className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2">Total Income (YTD)</div>
          <div className="text-3xl font-black">{formatINR(summary.totalIncome)}</div>
          <div className="mt-4 text-sm font-medium flex justify-between">
            <span>Receivables: {formatINR(summary.receivables)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
          <FaMoneyBillWave className="absolute -right-4 -bottom-4 text-7xl opacity-10" />
          <div className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-2">Total Expenses (YTD)</div>
          <div className="text-3xl font-black">{formatINR(summary.totalExpenses)}</div>
          <div className="mt-4 text-sm font-medium flex justify-between">
            <span>Net: {formatINR(summary.netBalance)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Journals */}
        <div className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Journal Postings</h3>
            {summary.pendingApprovals > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                {summary.pendingApprovals} Pending Approval
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {recentJournals?.length > 0 ? (
              recentJournals.map(je => (
                <div key={je._id} className="p-5 hover:bg-gray-50/50 transition-colors flex justify-between items-center group">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{je.journalNumber}</div>
                    <div className="text-xs text-gray-500 mt-1">{je.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-gray-900">{formatINR(je.totalDebit)}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(je.postedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No recent postings</div>
            )}
          </div>
        </div>

        {/* Recent Reversals */}
        <div className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 bg-purple-50 flex justify-between items-center">
            <h3 className="font-bold text-purple-900 flex items-center gap-2"><FaUndo className="text-purple-500"/> Recent Reversals</h3>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {recentReversals?.length > 0 ? (
              recentReversals.map(je => (
                <div key={je._id} className="p-5 hover:bg-purple-50/20 transition-colors flex justify-between items-center">
                  <div>
                    <div className="font-bold text-purple-900 text-sm">{je.journalNumber}</div>
                    <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{je.reversalReason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Reversed</div>
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(je.transactionDate).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm h-full flex items-center justify-center">No recent reversals</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LedgerOverviewTab;
