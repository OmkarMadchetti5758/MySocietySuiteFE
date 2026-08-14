import React from 'react';
import { FaHeadset, FaTools, FaSwimmer, FaCar, FaStore } from 'react-icons/fa';

const OperationsSummary = () => {
  const operations = [
    {
      title: 'Complaints',
      icon: FaHeadset,
      color: 'blue',
      mainStat: '14',
      mainLabel: 'Total',
      subStats: [
        { label: 'New', value: '4' },
        { label: 'In Progress', value: '8' },
        { label: 'Escalated', value: '2' }
      ]
    },
    {
      title: 'Maintenance',
      icon: FaTools,
      color: 'orange',
      mainStat: '22',
      mainLabel: 'Open Requests',
      subStats: [
        { label: 'Pending', value: '12' },
        { label: 'In Progress', value: '8' },
        { label: 'On Hold', value: '2' }
      ]
    },
    {
      title: 'Amenities',
      icon: FaSwimmer,
      color: 'green',
      mainStat: '6',
      mainLabel: 'Bookings Today',
      subStats: [
        { label: 'Upcoming', value: '4' },
        { label: 'In Progress', value: '2' }
      ]
    },
    {
      title: 'Parking',
      icon: FaCar,
      color: 'blue',
      mainStat: '86%',
      mainLabel: 'Occupied',
      subStats: [
        { label: 'Cars', value: '120' },
        { label: 'Two Wheelers', value: '48' }
      ]
    },
    {
      title: 'Vendors',
      icon: FaStore,
      color: 'purple',
      mainStat: '18',
      mainLabel: 'Active Vendors',
      subStats: [
        { label: 'Expiring Soon', value: '3' },
        { label: 'Pending Payments', value: '2' }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full lg:col-span-2">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">Operations Summary</h3>
      </div>
      <div className="p-5 grid grid-cols-2 md:grid-cols-5 gap-6 flex-1">
        {operations.map((op, idx) => (
          <div key={idx} className="flex flex-col">
            <div className={`flex items-center gap-2 mb-3 text-${op.color}-500`}>
              <op.icon />
              <span className={`text-xs font-semibold text-${op.color}-600`}>{op.title}</span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-800 block">{op.mainStat}</span>
              <span className="text-xs text-gray-500">{op.mainLabel}</span>
            </div>
            <div className="flex gap-3 text-center mt-auto">
              {op.subStats.map((sub, i) => (
                <div key={i} className="flex-1">
                  <span className="text-sm font-bold text-gray-700 block">{sub.value}</span>
                  <span className="text-[10px] text-gray-400 block leading-tight">{sub.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
          View All Operations
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default OperationsSummary;
