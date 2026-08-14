import React from 'react';

const PriorityCard = ({ title, statusText, statusType, icon: Icon, mainText, stats, actionText }) => {
  const statusStyles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    danger: 'bg-red-100 text-red-700',
    active: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Icon className="text-xl" />
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusStyles[statusType]}`}>
          {statusText}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-6 flex-1">{mainText}</p>
      
      <div className="space-y-3 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{stat.label}</span>
            <span className="font-semibold text-gray-800">{stat.value}</span>
          </div>
        ))}
      </div>
      
      <button className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
        {actionText}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
      </button>
    </div>
  );
};

export default PriorityCard;
