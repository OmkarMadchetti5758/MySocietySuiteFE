import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHeadset, FaTools, FaSwimmer, FaCar, FaStore } from 'react-icons/fa';

const OperationsSummary = ({ data }) => {
  const { societyId } = useParams();
  const navigate = useNavigate();

  const comp = data?.complaints || { total: 0, newCount: 0, inProgressCount: 0, escalatedCount: 0 };
  const maint = data?.maintenance || { openRequests: 0, pendingCount: 0, inProgressCount: 0, onHoldCount: 0 };
  const amen = data?.amenities || { bookingsToday: 0, upcoming: 0, inProgress: 0 };
  const park = data?.parking || { occupiedPercentage: 0, carsCount: 0, twoWheelersCount: 0 };
  const vend = data?.vendors || { activeCount: 0, expiringSoon: 0, pendingPayments: 0 };

  const operations = [
    {
      title: 'Complaints',
      icon: FaHeadset,
      colorBg: 'bg-blue-50 text-blue-600',
      titleColor: 'text-blue-600',
      mainStat: String(comp.total),
      mainLabel: 'Total',
      route: 'helpdesk',
      subStats: [
        { label: 'New', value: String(comp.newCount) },
        { label: 'In Progress', value: String(comp.inProgressCount) },
        { label: 'Escalated', value: String(comp.escalatedCount) }
      ]
    },
    {
      title: 'Maintenance',
      icon: FaTools,
      colorBg: 'bg-orange-50 text-orange-600',
      titleColor: 'text-orange-600',
      mainStat: String(maint.openRequests),
      mainLabel: 'Open Requests',
      route: 'billing',
      subStats: [
        { label: 'Pending', value: String(maint.pendingCount) },
        { label: 'In Progress', value: String(maint.inProgressCount) },
        { label: 'On Hold', value: String(maint.onHoldCount) }
      ]
    },
    {
      title: 'Amenities',
      icon: FaSwimmer,
      colorBg: 'bg-emerald-50 text-emerald-600',
      titleColor: 'text-emerald-600',
      mainStat: String(amen.bookingsToday),
      mainLabel: 'Bookings Today',
      route: 'amenities',
      subStats: [
        { label: 'Upcoming', value: String(amen.upcoming) },
        { label: 'In Progress', value: String(amen.inProgress) }
      ]
    },
    {
      title: 'Parking',
      icon: FaCar,
      colorBg: 'bg-indigo-50 text-indigo-600',
      titleColor: 'text-indigo-600',
      mainStat: `${park.occupiedPercentage}%`,
      mainLabel: 'Occupied',
      route: 'parking',
      subStats: [
        { label: 'Cars', value: String(park.carsCount) },
        { label: 'Two Wheelers', value: String(park.twoWheelersCount) }
      ]
    },
    {
      title: 'Vendors',
      icon: FaStore,
      colorBg: 'bg-purple-50 text-purple-600',
      titleColor: 'text-purple-600',
      mainStat: String(vend.activeCount),
      mainLabel: 'Active Vendors',
      route: 'vendors',
      subStats: [
        { label: 'Expiring Soon', value: String(vend.expiringSoon) },
        { label: 'Pending', value: String(vend.pendingPayments) }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full lg:col-span-2 min-w-0">
      <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-sm sm:text-base">Operations Summary</h3>
        <span className="text-[10px] sm:text-xs font-semibold text-gray-400 bg-gray-50 px-2 sm:px-2.5 py-1 rounded-full border border-gray-100">Live Overview</span>
      </div>

      <div className="p-3.5 sm:p-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 flex-1 w-full min-w-0">
        {operations.map((op, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate(`/${societyId}/dashboard/${op.route}`)}
            className="flex flex-col justify-between p-3 sm:p-3.5 bg-gray-50/70 hover:bg-gray-100/70 rounded-xl border border-gray-100 transition-all cursor-pointer group min-w-0"
          >
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 min-w-0">
                <div className={`p-1.5 rounded-lg shrink-0 ${op.colorBg}`}>
                  <op.icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-bold ${op.titleColor} truncate`}>{op.title}</span>
              </div>

              <div className="my-1.5 sm:my-2">
                <span className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{op.mainStat}</span>
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 block mt-1 truncate">{op.mainLabel}</span>
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3 pt-2 border-t border-gray-200/60 grid grid-cols-2 gap-1 text-center">
              {op.subStats.map((sub, i) => (
                <div key={i} className="flex flex-col items-center bg-white py-1 px-0.5 rounded border border-gray-100 min-w-0">
                  <span className="text-xs font-bold text-gray-800 leading-none truncate w-full text-center">{sub.value}</span>
                  <span className="text-[8px] sm:text-[9px] font-semibold text-gray-400 truncate mt-0.5 w-full text-center">{sub.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
        <button 
          onClick={() => navigate(`/${societyId}/dashboard/helpdesk`)}
          className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors cursor-pointer"
        >
          View All Operations
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default OperationsSummary;
