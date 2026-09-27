import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCalendarAlt, FaLock, FaLockOpen, FaUndo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ledgerService from '../../../../services/ledger.service';

const AccountingPeriodsTab = () => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await ledgerService.getAccountingPeriods();
      if (res.data?.data?.periods) {
        setPeriods(res.data.data.periods);
      }
    } catch (err) {
      toast.error('Failed to load accounting periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleAction = async (id, actionStr, apiCall, reason = '') => {
    setActionLoading(id);
    try {
      await apiCall(id, reason);
      toast.success(`Period ${actionStr} successfully`);
      fetchPeriods();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionStr} period`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
        <FaCalendarAlt className="text-blue-500 text-3xl shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-1">Accounting Periods</h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            Manage your financial periods here. Closing a period prevents any new journal entries from being posted in that date range, securing your historical financial data. 
            Periods are automatically generated when entries are posted into a new month.
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-xs text-gray-500 uppercase tracking-wider font-bold">
              <th className="py-4 px-6">Period Name</th>
              <th className="py-4 px-6">Date Range</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-16 text-center text-gray-500">
                  <FaSpinner className="animate-spin text-3xl mx-auto mb-3 text-cyan-600" />
                  Loading periods...
                </td>
              </tr>
            ) : periods.length > 0 ? (
              periods.map((period) => (
                <tr key={period._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 text-sm">{period.periodName}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {period._id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {formatDate(period.startDate)} — {formatDate(period.endDate)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {period.status === 'OPEN' ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                        <FaLockOpen /> OPEN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                        <FaLock /> CLOSED
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {period.status === 'OPEN' ? (
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to close the period: ${period.periodName}?`)) {
                            handleAction(period._id, 'closed', ledgerService.closePeriod);
                          }
                        }}
                        disabled={actionLoading === period._id}
                        className="px-4 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-2 border border-gray-200 hover:border-red-200"
                      >
                        <FaLock /> Close Period
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          const reason = window.prompt("Enter reason for reopening period:");
                          if (reason) handleAction(period._id, 'reopened', ledgerService.reopenPeriod, reason);
                        }}
                        disabled={actionLoading === period._id}
                        className="px-4 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-2 border border-purple-100"
                      >
                        <FaUndo /> Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-20 text-center text-gray-500">
                  <FaCalendarAlt className="text-4xl text-gray-200 mx-auto mb-3" />
                  No accounting periods generated yet.
                  <p className="text-xs mt-2 max-w-sm mx-auto text-gray-400">Periods are automatically created when the first journal entry of a month is posted.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountingPeriodsTab;
