import React from 'react';
import { FaExclamationCircle, FaExclamationTriangle, FaFileContract, FaCalendarCheck } from 'react-icons/fa';

const AlertList = () => {
  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Security staff absent at Gate 2',
      subtext: 'Immediate Action Required',
      time: '10 min ago',
      icon: FaExclamationCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Cleaning incomplete in Parking Area',
      subtext: '',
      time: '30 min ago',
      icon: FaExclamationTriangle,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      id: 3,
      type: 'warning',
      message: '3 complaints awaiting response',
      subtext: '',
      time: '1 hr ago',
      icon: FaExclamationTriangle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 4,
      type: 'info',
      message: 'Vendor contract expiring in 7 days',
      subtext: '',
      time: '2 hr ago',
      icon: FaFileContract,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 5,
      type: 'info',
      message: 'Ganesh Chaturthi event planning',
      subtext: 'Action items pending',
      time: '3 hr ago',
      icon: FaCalendarCheck,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Needs Your Attention</h3>
        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</a>
      </div>
      <div className="p-2 flex-1 overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
            <div className={`mt-0.5 p-2 rounded-full h-fit ${alert.bgColor} ${alert.iconColor}`}>
              <alert.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{alert.message}</p>
              {alert.subtext && <p className="text-xs text-gray-500 mt-0.5">{alert.subtext}</p>}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{alert.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertList;
