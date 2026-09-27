import { useState, useEffect } from 'react';
import { FaWallet, FaShieldAlt, FaSpinner, FaArrowUp, FaArrowDown, FaExclamationCircle } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';

export default function OverviewTab({ isResidentView }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [isResidentView]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/advance-deposits/overview-stats');
      if (res.data?.status === 'success') {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Overview stats fetch error:', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isResidentView && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-emerald-950">My Financial Accounts</h3>
            <p className="text-xs text-emerald-700">Strictly personal view of your advance balance and security deposit accounts.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-lg shadow-sm">
            Personal Scope
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advance Accounts Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-50 rounded-full opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl shadow-sm">
              <FaWallet />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isResidentView ? 'My Advance Account' : 'Advance Accounts'}</h2>
              <p className="text-sm text-gray-500">
                {isResidentView ? 'Available for eligible future maintenance invoices.' : 'Total balance available for future allocations.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {isResidentView ? 'Current Advance Balance' : 'Total Balance'}
              </p>
              <p className="text-3xl font-black text-gray-900">{formatINR(stats?.advance?.totalBalance)}</p>
            </div>
            {!isResidentView && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Accounts w/ Balance</p>
                <p className="text-3xl font-black text-gray-900">{stats?.advance?.residentsWithAdvance}</p>
              </div>
            )}
            {isResidentView && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Account Status</p>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block">
                  ACTIVE
                </span>
              </div>
            )}
          </div>

          {!isResidentView && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600"><FaArrowUp className="text-xs" /></span>
                <span className="font-semibold text-gray-700">{formatINR(stats?.advance?.advanceReceivedThisPeriod)}</span>
                <span className="text-gray-500">received this month</span>
              </div>
              <div className="flex items-center gap-2 text-sm ml-auto">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600"><FaArrowDown className="text-xs" /></span>
                <span className="font-semibold text-gray-700">{formatINR(stats?.advance?.advanceUsedThisPeriod)}</span>
                <span className="text-gray-500">allocated this month</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Deposits Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-teal-50 rounded-full opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-2xl shadow-sm">
              <FaShieldAlt />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isResidentView ? 'My Security Deposits' : 'Security Deposits'}</h2>
              <p className="text-sm text-gray-500">
                {isResidentView ? 'Deposits held for specific purposes (Parking, Amenity, Move-in).' : 'Total security deposits held by society.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {isResidentView ? 'Total Deposit Amount' : 'Total Held'}
              </p>
              <p className="text-3xl font-black text-gray-900">{formatINR(stats?.securityDeposit?.totalHeld)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Refundable Balance</p>
              <p className="text-3xl font-black text-gray-900">{formatINR(stats?.securityDeposit?.refundableBalance)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700">{stats?.securityDeposit?.activeDeposits}</span>
              <span className="text-gray-500">{isResidentView ? 'active deposits held' : 'active deposits'}</span>
            </div>
            {stats?.securityDeposit?.refundsPending > 0 && (
              <div className="flex items-center gap-2 text-sm ml-auto text-amber-600 bg-amber-50 px-3 py-1 rounded-lg font-medium">
                <FaExclamationCircle />
                {stats?.securityDeposit?.refundsPending} {isResidentView ? 'Refund Request Pending' : 'Refunds Pending Review'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
