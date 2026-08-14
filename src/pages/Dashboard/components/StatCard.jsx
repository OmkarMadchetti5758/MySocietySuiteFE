import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, highlightValue }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-w-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="text-xl" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {highlightValue && <span className="text-lg font-bold text-gray-500">/ {highlightValue}</span>}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatCard;
