import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUsers, FaBuilding, FaIdBadge, FaUserTie,
  FaExclamationCircle, FaRupeeSign, FaFileInvoiceDollar, FaCalendarAlt,
  FaShieldAlt, FaBroom, FaUsersCog, FaGift
} from 'react-icons/fa';
import StatCard from './components/StatCard';
import PriorityCard from './components/PriorityCard';
import OperationsSummary from './components/OperationsSummary';
import AlertList from './components/AlertList';
import EventList from './components/EventList';
import { dashboardApi } from '../../services/dashboardApi';

const AdminDashboard = ({ societyName: initialSocietyName }) => {
  const { societyId } = useParams();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const response = await dashboardApi.getAdminDashboardStats();
        if (isMounted && response?.data) {
          setDashboardData(response.data);
        }
      } catch (err) {
        console.warn("Failed to fetch dashboard stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { isMounted = false; };
  }, []);

  const societyName = dashboardData?.societyName || initialSocietyName || 'My Society';
  const topStats = dashboardData?.topStats;
  const priority = dashboardData?.priorityOverview;

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto overflow-x-hidden min-w-0">
      {/* Greeting Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full min-w-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            Welcome, Admin <span className="text-xl sm:text-2xl"></span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Here's what's happening in {societyName}.</p>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate(`/${societyId}/dashboard/visitors`)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <FaShieldAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Open Guard Portal</span>
          </button>
          <button 
            onClick={() => navigate(`/${societyId}/dashboard/settings`)}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <StatCard
          title="Total Residents"
          value={loading ? "..." : String(topStats?.totalResidents ?? 0)}
          subtitle={topStats ? topStats.residentSubtitle : "0 Occupied Units"}
          icon={FaUsers}
          colorClass="bg-orange-100 text-orange-500"
          onClick={() => navigate(`/${societyId}/dashboard/residents`)}
        />
        <StatCard
          title="Flats / Units"
          value={loading ? "..." : String(topStats?.totalFlats ?? 0)}
          subtitle={topStats ? `Occupied: ${topStats.occupiedFlats ?? 0}` : "Occupied: 0"}
          icon={FaBuilding}
          colorClass="bg-blue-100 text-blue-500"
          onClick={() => navigate(`/${societyId}/dashboard/setup`)}
        />
        <StatCard
          title="Visitors Today"
          value={loading ? "..." : String(topStats?.visitorsToday ?? 0)}
          subtitle={topStats ? `Vehicles: ${topStats.vehiclesToday ?? 0}` : "Vehicles: 0"}
          icon={FaIdBadge}
          colorClass="bg-green-100 text-green-500"
          onClick={() => navigate(`/${societyId}/dashboard/visitors`)}
        />
        <StatCard
          title="Staff Present"
          value={loading ? "..." : String(topStats?.staffPresent ?? 0)}
          highlightValue={loading ? "..." : String(topStats?.staffTotal ?? 0)}
          subtitle={topStats ? `${topStats.staffDutyPct ?? 0}% On Duty` : "0% On Duty"}
          icon={FaUserTie}
          colorClass="bg-purple-100 text-purple-500"
          onClick={() => navigate(`/${societyId}/dashboard/staff`)}
        />
        <StatCard
          title="Open Complaints"
          value={loading ? "..." : String(topStats?.openComplaints ?? 0)}
          subtitle={topStats ? `${topStats.inProgressComplaints ?? 0} In Progress` : "0 In Progress"}
          icon={FaExclamationCircle}
          colorClass="bg-red-100 text-red-500"
          onClick={() => navigate(`/${societyId}/dashboard/helpdesk`)}
        />
        <StatCard
          title="Collection (This Month)"
          value={loading ? "..." : (topStats?.collectionFormatted ?? "₹0")}
          subtitle="Collected"
          icon={FaRupeeSign}
          colorClass="bg-teal-100 text-teal-500"
          onClick={() => navigate(`/${societyId}/dashboard/billing`)}
        />
        <StatCard
          title="Pending Dues"
          value={loading ? "..." : (topStats?.pendingDuesFormatted ?? "₹0")}
          subtitle={topStats ? `From ${topStats.pendingUnitsCount ?? 0} Units` : "From 0 Units"}
          icon={FaFileInvoiceDollar}
          colorClass="bg-rose-100 text-rose-500"
          onClick={() => navigate(`/${societyId}/dashboard/billing`)}
        />
        <StatCard
          title="Upcoming Events"
          value={loading ? "..." : String(topStats?.upcomingEventsCount ?? 0)}
          subtitle="Active Events"
          icon={FaCalendarAlt}
          colorClass="bg-indigo-100 text-indigo-500"
          onClick={() => navigate(`/${societyId}/dashboard/festivals`)}
        />
      </div>

      {/* Priority Overview Section */}
      <div className="w-full min-w-0">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Priority Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
          <PriorityCard
            title="Security"
            statusText={priority?.security?.statusText || "Operational"}
            statusType={priority?.security?.statusType || "success"}
            icon={FaShieldAlt}
            mainText="All security gates status and visitor entries today."
            stats={[
              { label: 'Visitors Today', value: String(priority?.security?.visitorsToday ?? 0) },
              { label: 'Vehicles Today', value: String(priority?.security?.vehiclesToday ?? 0) },
              { label: 'Security Staff Present', value: priority?.security?.staffPresent || '0 / 0' }
            ]}
            actionText="View Security"
            onAction={() => navigate(`/${societyId}/dashboard/visitors`)}
          />
          <PriorityCard
            title="Cleaning"
            statusText={priority?.cleaning?.statusText || "On Track"}
            statusType={priority?.cleaning?.statusType || "success"}
            icon={FaBroom}
            mainText="Cleaning schedule and maintenance staff count."
            stats={[
              { label: 'Staff Assigned', value: priority?.cleaning?.completedAreas || '0 / 0' },
              { label: 'Pending Areas', value: String(priority?.cleaning?.pendingAreas ?? 0) },
              { label: 'Staff Present', value: priority?.cleaning?.staffPresent || '0 / 0' }
            ]}
            actionText="View Cleaning"
            onAction={() => navigate(`/${societyId}/dashboard/staff`)}
          />
          <PriorityCard
            title="Staff Attendance"
            statusText=""
            statusType="active"
            icon={FaUsersCog}
            mainText={`${priority?.staffAttendance?.percentage ?? 0}% staff present today.`}
            stats={[
              { label: 'Present', value: String(priority?.staffAttendance?.present ?? 0) },
              { label: 'Absent', value: String(priority?.staffAttendance?.absent ?? 0) },
              { label: 'On Leave', value: String(priority?.staffAttendance?.onLeave ?? 0) }
            ]}
            actionText="View Attendance"
            onAction={() => navigate(`/${societyId}/dashboard/staff`)}
          />
          <PriorityCard
            title="Festivals & Community"
            statusText={priority?.festivals?.title && priority?.festivals?.title !== "No Upcoming Events" ? "Active" : "Normal"}
            statusType="warning"
            icon={FaGift}
            mainText={
              priority?.festivals?.title && priority?.festivals?.title !== "No Upcoming Events"
                ? `${priority.festivals.title} on ${priority.festivals.date || '-'}.`
                : "No upcoming festival scheduled."
            }
            stats={[
              { label: 'Upcoming Events', value: String(priority?.festivals?.upcomingEventsCount ?? 0) },
              { label: 'Festival Collections', value: `${priority?.festivals?.activeCollectionsCount ?? 0} Active` },
              { label: 'New Announcements', value: String(priority?.festivals?.newAnnouncements ?? 0) }
            ]}
            actionText="View Collections"
            onAction={() => navigate(`/${societyId}/dashboard/festivals-collection`)}
          />
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
        <OperationsSummary data={dashboardData?.operationsSummary} />
        <div className="lg:col-span-1 min-w-0">
          <AlertList alerts={dashboardData?.alerts} onViewAll={() => navigate(`/${societyId}/dashboard/notices`)} />
        </div>
        <div className="lg:col-span-1 min-w-0">
          <EventList events={dashboardData?.events} onViewCalendar={() => navigate(`/${societyId}/dashboard/festivals`)} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
