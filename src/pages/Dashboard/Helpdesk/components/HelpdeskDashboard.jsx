import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaTools, FaCheckCircle, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import complaintApi from '../../../../services/complaintApi';
import { toast } from 'react-toastify';

const HelpdeskDashboard = () => {
  const [summary, setSummary] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    totalResolved: 0,
    avgResolutionTimeHours: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await complaintApi.getComplaintSummary();
        setSummary(res.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Open Tickets', value: summary.open, icon: FaTicketAlt, color: 'blue' },
    { label: 'In Progress', value: summary.inProgress, icon: FaTools, color: 'yellow' },
    { label: 'Resolved', value: summary.resolved, icon: FaCheckCircle, color: 'green' },
    { label: 'Closed (Confirmed)', value: summary.closed, icon: FaLock, color: 'gray' },
  ];

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 rounded-full bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center text-2xl`}>
              <stat.icon />
            </div>
          </div>
        ))}
      </div>

      {/* Resolution SLA Performance */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-orange-500" />
          SLA Performance & Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Resolution Time</p>
              <h4 className="text-2xl font-bold text-gray-800">
                {summary.avgResolutionTimeHours !== null ? `${summary.avgResolutionTimeHours} Hrs` : 'N/A'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">Based on {summary.totalResolved} resolved tickets</p>
            </div>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
            <h4 className="font-semibold text-orange-800 mb-2">Automated SLA Tracking Active</h4>
            <p className="text-sm text-orange-700">
              Tickets not resolved within their Priority SLA (e.g., 24h for High, 48h for Medium) are automatically escalated by the system scheduler. Filter by "SLA Breached" in the Tickets view to identify urgent escalations.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HelpdeskDashboard;
