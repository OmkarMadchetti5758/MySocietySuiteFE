import { useState, useEffect } from 'react';
import {
  FaChartBar, FaRupeeSign, FaWifi, FaMoneyBillWave, FaUniversity,
  FaSpinner, FaDownload, FaCalendarAlt, FaFilter
} from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const QUICK_RANGES = [
  { label: 'This Month', fn: () => { const now = new Date(); return { start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`, end: now.toISOString().split('T')[0] }; } },
  { label: 'Previous Month', fn: () => { const now = new Date(); now.setMonth(now.getMonth() - 1); const y = now.getFullYear(); const m = String(now.getMonth() + 1).padStart(2, '0'); const last = new Date(y, now.getMonth() + 1, 0).getDate(); return { start: `${y}-${m}-01`, end: `${y}-${m}-${last}` }; } },
];

const MODE_ICONS = {
  UPI: FaWifi,
  CARD: FaMoneyBillWave,
  NET_BANKING: FaUniversity,
  CASH: FaRupeeSign,
  CHEQUE: FaMoneyBillWave,
  BANK_TRANSFER: FaUniversity,
  ONLINE: FaWifi,
};

const MODE_COLORS = {
  UPI: 'from-blue-500 to-blue-600',
  CARD: 'from-purple-500 to-purple-600',
  NET_BANKING: 'from-teal-500 to-teal-600',
  CASH: 'from-emerald-500 to-emerald-600',
  CHEQUE: 'from-amber-500 to-amber-600',
  BANK_TRANSFER: 'from-cyan-500 to-cyan-600',
  ONLINE: 'from-indigo-500 to-indigo-600',
  OFFLINE: 'from-orange-500 to-orange-600',
};

export default function CollectionsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeRange, setActiveRange] = useState('This Month');

  useEffect(() => {
    const r = QUICK_RANGES[0].fn();
    setStartDate(r.start);
    setEndDate(r.end);
    fetchAnalytics(r.start, r.end);
  }, []);

  const fetchAnalytics = async (sd, ed) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sd) params.append('startDate', sd);
      if (ed) params.append('endDate', ed);
      const res = await apiClient.get(`/payments/collections-analytics?${params.toString()}`);
      setAnalytics(res.data?.data || null);
    } catch {
      toast.error('Failed to load collection analytics.');
    } finally {
      setLoading(false);
    }
  };

  const applyRange = (range) => {
    const { start, end } = range.fn();
    setStartDate(start);
    setEndDate(end);
    setActiveRange(range.label);
    fetchAnalytics(start, end);
  };

  const applyCustom = () => {
    setActiveRange('Custom');
    fetchAnalytics(startDate, endDate);
  };

  const totalByMode = analytics?.byMode?.reduce((acc, m) => acc + m.total, 0) || 0;
  const totalBySource = analytics?.bySource?.reduce((acc, s) => acc + s.total, 0) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <FaSpinner className="animate-spin text-orange-400 text-2xl mr-3" />
        <span className="text-gray-500">Loading collection analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <FaCalendarAlt className="text-orange-500" />
          <h3 className="font-semibold text-gray-700 text-sm">Collection Period</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => applyRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${activeRange === r.label ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
          <span className="text-gray-400">→</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
          <button onClick={applyCustom} className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm">Apply</button>
        </div>
      </div>

      {/* Collection by Mode */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Collection by Payment Mode</h3>
          <span className="text-sm font-bold text-orange-600">{formatINR(totalByMode)}</span>
        </div>
        {!analytics?.byMode || analytics.byMode.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No collection data available for the selected period.</p>
        ) : (
          <div className="space-y-3">
            {analytics.byMode.sort((a, b) => b.total - a.total).map(item => {
              const pct = totalByMode > 0 ? Math.round((item.total / totalByMode) * 100) : 0;
              const IconComp = MODE_ICONS[item._id] || FaRupeeSign;
              const grad = MODE_COLORS[item._id] || 'from-gray-400 to-gray-500';
              return (
                <div key={item._id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <IconComp className="text-white text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-700">{item._id}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{item.count} txn{item.count !== 1 ? 's' : ''}</span>
                        <span className="text-sm font-bold text-gray-900">{formatINR(item.total)}</span>
                        <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collection by Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analytics?.bySource?.map(item => (
          <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`flex items-center gap-3 mb-3`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${MODE_COLORS[item._id] || 'from-gray-400 to-gray-500'} shadow-sm`}>
                {item._id === 'ONLINE' ? <FaWifi className="text-white text-sm" /> : <FaMoneyBillWave className="text-white text-sm" />}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item._id} Collection</div>
                <div className="text-xl font-black text-gray-900">{formatINR(item.total)}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">{item.count} transaction{item.count !== 1 ? 's' : ''}</div>
          </div>
        ))}
        {(!analytics?.bySource || analytics.bySource.length === 0) && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm">No collection data available.</div>
        )}
      </div>

      {/* Collection by Account */}
      {analytics?.byAccount && analytics.byAccount.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">Collection by Payment Account</h3>
          <div className="divide-y divide-gray-50">
            {analytics.byAccount.sort((a, b) => b.total - a.total).map(item => (
              <div key={item._id} className="flex justify-between items-center py-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{item._id || 'Unknown Account'}</div>
                  <div className="text-xs text-gray-400">{item.count} transaction{item.count !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-base font-bold text-orange-600">{formatINR(item.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
