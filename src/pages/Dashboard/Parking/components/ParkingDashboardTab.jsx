import React from 'react';
import { 
  FaCar, 
  FaParking, 
  FaUserCheck, 
  FaExclamationTriangle, 
  FaWalking, 
  FaClock, 
  FaCheckCircle,
  FaPlus,
  FaFileAlt
} from 'react-icons/fa';

const TYPE_BAR_COLORS = {
  visitor: 'bg-purple-500',
  ev: 'bg-emerald-500',
  EV_CHARGING: 'bg-emerald-500',
  handicapped: 'bg-blue-500',
  DISABLED: 'bg-blue-500',
  covered: 'bg-orange-500',
  open: 'bg-sky-500',
  regular: 'bg-indigo-500',
  basement: 'bg-slate-500',
  TWO_WHEELER: 'bg-amber-500',
  FOUR_WHEELER: 'bg-orange-500',
};

const STATUS_BAR_COLORS = {
  available: 'bg-emerald-500',
  allocated: 'bg-amber-500',
  occupied: 'bg-orange-500',
  reserved: 'bg-blue-500',
  maintenance: 'bg-slate-500',
  inactive: 'bg-gray-400',
};

const ACTIVITY_ICONS = {
  assignment: FaUserCheck,
  visitor: FaWalking,
  violation: FaExclamationTriangle,
  request: FaClock,
};

const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const toCount = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 0;
};

const normalizeOverview = (stats) => {
  const overview = stats?.overview || {};
  return {
    totalSlots: toCount(overview.totalSlots, stats?.totalSlots),
    availableSlots: toCount(overview.availableSlots, stats?.available),
    allocatedSlots: toCount(overview.allocatedSlots, stats?.allocated),
    occupiedSlots: toCount(overview.occupiedSlots, stats?.occupied),
    reservedSlots: toCount(overview.reservedSlots, stats?.reserved),
    maintenanceSlots: toCount(overview.maintenanceSlots, stats?.maintenance),
    inactiveSlots: toCount(overview.inactiveSlots, stats?.inactive),
    activeAssignments: toCount(overview.activeAssignments, stats?.activeAssignments),
    activeVisitors: toCount(overview.activeVisitors, stats?.activeVisitorSessions),
    pendingRequests: toCount(overview.pendingRequests, stats?.pendingRequests),
    openViolations: toCount(overview.openViolations, stats?.openViolations),
  };
};

const buildStatusBreakdown = (overview, byStatus) => {
  const source = byStatus && typeof byStatus === 'object' ? byStatus : {};
  const rows = [
    { key: 'available', label: 'Available', count: toCount(source.available, overview.availableSlots) },
    { key: 'allocated', label: 'Allocated', count: toCount(source.allocated, overview.allocatedSlots) },
    { key: 'occupied', label: 'Occupied', count: toCount(source.occupied, overview.occupiedSlots) },
    { key: 'reserved', label: 'Reserved', count: toCount(source.reserved, overview.reservedSlots) },
    { key: 'maintenance', label: 'Maintenance', count: toCount(source.maintenance, overview.maintenanceSlots) },
    { key: 'inactive', label: 'Inactive', count: toCount(source.inactive, overview.inactiveSlots) },
  ];
  return rows.filter((row) => row.count > 0);
};

const ParkingDashboardTab = ({ stats, loading, onTabChange, onOpenModal }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const overview = normalizeOverview(stats);
  const byType = stats?.byType && typeof stats.byType === 'object' ? stats.byType : {};
  const typeEntries = Object.entries(byType).filter(([, count]) => Number(count) > 0);
  const statusEntries = buildStatusBreakdown(overview, stats?.byStatus);
  const breakdownRows = statusEntries.length > 0
    ? statusEntries.map((row) => ({
        key: row.key,
        label: row.label,
        count: row.count,
        color: STATUS_BAR_COLORS[row.key] || 'bg-orange-500',
      }))
    : typeEntries.map(([type, count]) => ({
        key: type,
        label: String(type).replace(/_/g, ' ').toLowerCase(),
        count: Number(count) || 0,
        color: TYPE_BAR_COLORS[type] || 'bg-orange-500',
      }));
  const recentActivities = Array.isArray(stats?.recentActivities) ? stats.recentActivities : [];

  const statCards = [
    {
      title: 'Total Slots',
      value: overview.totalSlots,
      icon: FaParking,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: `${overview.activeAssignments} Assigned`,
      badgeColor: 'bg-blue-100 text-blue-700',
      onClick: () => onTabChange('slots'),
    },
    {
      title: 'Occupied / Allocated',
      value: overview.occupiedSlots + overview.allocatedSlots,
      icon: FaCar,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: `${overview.availableSlots} Available`,
      badgeColor: 'bg-emerald-100 text-emerald-700',
      onClick: () => onTabChange('assignments'),
    },
    {
      title: 'Visitor Parked',
      value: overview.activeVisitors,
      icon: FaWalking,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'Active Now',
      badgeColor: 'bg-purple-100 text-purple-700',
      onClick: () => onTabChange('visitors'),
    },
    {
      title: 'Pending Requests',
      value: overview.pendingRequests,
      icon: FaClock,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'Action Needed',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      onClick: () => onTabChange('requests'),
    },
    {
      title: 'Open Violations',
      value: overview.openViolations,
      icon: FaExclamationTriangle,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: `${overview.openViolations} Unresolved`,
      badgeColor: 'bg-rose-100 text-rose-700',
      onClick: () => onTabChange('violations'),
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <button 
            type="button"
            key={card.title} 
            onClick={card.onClick}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="text-xl" />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
              <h3 className="text-2xl font-black text-gray-800">{card.value}</h3>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Management Portal
            </span>
            <h3 className="text-xl font-bold mt-4 mb-2">Parking Operations</h3>
            <p className="text-orange-100 text-sm mb-6">
              Manage slots, assign parking to residents, check-in visitors, and resolve parking violations efficiently.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onOpenModal('addSlot')}
              className="flex items-center justify-center gap-2 bg-white text-orange-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-sm text-sm"
            >
              <FaPlus className="text-xs" /> Add Slot
            </button>
            <button 
              onClick={() => onOpenModal('assignSlot')}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl backdrop-blur-sm transition-colors text-sm border border-white/20"
            >
              <FaUserCheck className="text-xs" /> Assign Slot
            </button>
            <button 
              onClick={() => onOpenModal('checkInVisitor')}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl backdrop-blur-sm transition-colors text-sm border border-white/20"
            >
              <FaWalking className="text-xs" /> Visitor Entry
            </button>
            <button 
              onClick={() => onOpenModal('reportViolation')}
              className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
            >
              <FaExclamationTriangle className="text-xs" /> Report Issue
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaParking className="text-orange-500" /> Slot Breakdown
          </h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {breakdownRows.length > 0 ? (
              breakdownRows.map((row) => {
                const total = overview.totalSlots || 1;
                const pct = Math.round((row.count / total) * 100);
                return (
                  <div key={row.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-gray-600">
                      <span className="capitalize">{row.label}</span>
                      <span>{row.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${row.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 italic">No slot breakdown data.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FaFileAlt className="text-orange-500" /> Recent Activity
            </h3>
            <button 
              onClick={() => onTabChange('assignments')}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => {
                const Icon = ACTIVITY_ICONS[act.kind] || FaCheckCircle;
                const title = act.title
                  || `Slot ${act.parkingSlotId?.slotNumber || 'N/A'} allocated to ${act.residentId?.name || 'Resident'}`;
                const subtitle = act.subtitle
                  || `Vehicle: ${act.vehicleId?.registrationNumber || act.vehicleId?.regNumber || 'N/A'} • Wing ${act.parkingSlotId?.wing || 'N/A'}`;
                return (
                  <div key={`${act.kind || 'activity'}-${act._id}`} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 text-xs border border-gray-100">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600 shrink-0 mt-0.5">
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{title}</p>
                      <p className="text-gray-500 text-[11px]">{subtitle}</p>
                      {act.createdAt && (
                        <p className="text-gray-400 text-[10px] mt-0.5">{formatRelativeTime(act.createdAt)}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 italic text-center py-8">No recent parking activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingDashboardTab;
