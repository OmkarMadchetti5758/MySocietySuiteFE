import { useState, useEffect } from 'react';
import {
  FaChartLine, FaCalendarAlt, FaFilter, FaSearch, FaTimes, FaSpinner,
  FaRupeeSign, FaWifi, FaExclamationTriangle, FaCheckCircle, FaUnlink,
  FaSync, FaArrowRight
} from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

const QUICK_RANGES = [
  { label: 'Today', fn: () => { const d = new Date().toISOString().split('T')[0]; return { start: d, end: d }; } },
  { label: 'Yesterday', fn: () => { const d = new Date(); d.setDate(d.getDate() - 1); const s = d.toISOString().split('T')[0]; return { start: s, end: s }; } },
  { label: 'This Week', fn: () => { const now = new Date(); const day = now.getDay(); const start = new Date(now); start.setDate(now.getDate() - day); return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] }; } },
  { label: 'This Month', fn: () => { const now = new Date(); return { start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`, end: now.toISOString().split('T')[0] }; } },
  { label: 'Previous Month', fn: () => { const now = new Date(); now.setMonth(now.getMonth() - 1); const y = now.getFullYear(); const m = String(now.getMonth() + 1).padStart(2, '0'); const last = new Date(y, now.getMonth() + 1, 0).getDate(); return { start: `${y}-${m}-01`, end: `${y}-${m}-${last}` }; } },
];

const formatINR = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const StatCard = ({ label, value, color = 'blue', icon: Icon, loading }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-500',
    violet: 'from-violet-500 to-purple-600',
    red: 'from-red-500 to-rose-600',
    amber: 'from-amber-400 to-yellow-500',
    slate: 'from-slate-500 to-gray-600',
    teal: 'from-teal-500 to-cyan-600',
  };
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${colorMap[color]} opacity-10`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          {loading ? (
            <div className="w-24 h-6 bg-gray-200 animate-pulse rounded-lg mt-1" />
          ) : (
            <p className="text-xl font-black text-gray-900">{value}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorMap[color]} shadow-md`}>
            <Icon className="text-white text-sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default function PaymentsOverviewTab({ isAdmin, isAccountant }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeRange, setActiveRange] = useState('This Month');

  useEffect(() => {
    const thisMonth = QUICK_RANGES[3].fn();
    setStartDate(thisMonth.start);
    setEndDate(thisMonth.end);
    fetchStats(thisMonth.start, thisMonth.end);
  }, []);

  const fetchStats = async (sd, ed) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sd) params.append('startDate', sd);
      if (ed) params.append('endDate', ed);
      const res = await apiClient.get(`/payments/overview?${params.toString()}`);
      setStats(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch payment stats', err);
      toast.error('Failed to load payment overview.');
    } finally {
      setLoading(false);
    }
  };

  const applyQuickRange = (rangeObj) => {
    const { start, end } = rangeObj.fn();
    setStartDate(start);
    setEndDate(end);
    setActiveRange(rangeObj.label);
    fetchStats(start, end);
  };

  const handleCustomApply = () => {
    setActiveRange('Custom');
    fetchStats(startDate, endDate);
  };

  const cards = [
    { key: 'totalCollected', label: 'Total Collected', color: 'emerald', icon: FaRupeeSign },
    { key: 'todayCollection', label: "Today's Collection", color: 'orange', icon: FaCalendarAlt },
    { key: 'onlineCollection', label: 'Online Collection', color: 'blue', icon: FaWifi },
    { key: 'offlineCollection', label: 'Offline Collection', color: 'violet', icon: FaRupeeSign },
    { key: 'pendingPaymentsCount', label: 'Pending Payments', color: 'amber', icon: FaSync, count: true },
    { key: 'failedPaymentsCount', label: 'Failed Payments', color: 'red', icon: FaTimes, count: true },
    { key: 'unmatchedPaymentsCount', label: 'Unmatched Payments', color: 'slate', icon: FaUnlink, count: true },
    { key: 'outstandingAmount', label: 'Outstanding Amount', color: 'teal', icon: FaExclamationTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-black mb-1">Payments & Collections</h1>
        <p className="text-orange-100 text-sm">Manage resident payments, collections, receipts and payment reconciliation.</p>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <FaCalendarAlt className="text-orange-500" />
          <h3 className="font-semibold text-gray-700 text-sm">Collection Period</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => applyQuickRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${activeRange === r.label ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
          <FaArrowRight className="text-gray-400 text-xs" />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
          <button
            onClick={handleCustomApply}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(card => (
          <StatCard
            key={card.key}
            label={card.label}
            value={
              stats
                ? card.count
                  ? (stats[card.key] || 0).toLocaleString('en-IN')
                  : formatINR(stats[card.key])
                : '—'
            }
            color={card.color}
            icon={card.icon}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
