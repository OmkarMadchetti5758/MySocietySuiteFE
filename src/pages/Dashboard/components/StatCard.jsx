import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, highlightValue }) => {
  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow w-full min-w-0 overflow-hidden">
      <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <div className={`p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="text-lg sm:text-xl" />
        </div>
        <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{value}</h3>
          {highlightValue && <span className="text-sm sm:text-lg font-bold text-gray-500 truncate">/ {highlightValue}</span>}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{title}</p>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatCard;
