import React from 'react';
import { FaExclamationCircle, FaExclamationTriangle, FaCalendarCheck, FaCheckCircle } from 'react-icons/fa';

const AlertList = ({ alerts = [], onViewAll }) => {
  const hasAlerts = Array.isArray(alerts) && alerts.length > 0;

  const displayAlerts = hasAlerts ? alerts.map((a, i) => ({
    id: a.id || i,
    type: a.type || 'info',
    message: a.message,
    subtext: a.subtext || '',
    time: a.time || 'Today',
    icon: a.type === 'critical' ? FaExclamationCircle : (a.type === 'warning' ? FaExclamationTriangle : FaCalendarCheck),
    iconColor: a.type === 'critical' ? 'text-red-500' : (a.type === 'warning' ? 'text-orange-500' : 'text-blue-500'),
    bgColor: a.type === 'critical' ? 'bg-red-50' : (a.type === 'warning' ? 'bg-orange-50' : 'bg-blue-50')
  })) : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Needs Your Attention</h3>
        <button 
          onClick={onViewAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          View All
        </button>
      </div>
      <div className="p-3 flex-1 overflow-y-auto min-h-[220px]">
        {!hasAlerts ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 my-auto">
            <FaCheckCircle className="text-3xl text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-medium text-gray-600">All clear!</p>
            <p className="text-xs text-gray-400 mt-1">No urgent alerts requiring attention right now.</p>
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <div key={alert.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer mb-1">
              <div className={`mt-0.5 p-2 rounded-full h-fit ${alert.bgColor} ${alert.iconColor}`}>
                <alert.icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{alert.message}</p>
                {alert.subtext && <p className="text-xs text-gray-500 mt-0.5">{alert.subtext}</p>}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{alert.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertList;
