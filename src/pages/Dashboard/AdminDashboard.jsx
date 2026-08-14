import React, { useState } from 'react';
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

const AdminDashboard = ({ societyName }) => {
  const [date, setDate] = useState('14 May 2024, Tuesday');

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Greeting Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Good Morning, Admin <span className="text-2xl">👋</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening in {societyName}.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium w-full shadow-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            >
              <option value="14 May 2024, Tuesday">14 May 2024, Tuesday</option>
              <option value="15 May 2024, Wednesday">15 May 2024, Wednesday</option>
            </select>
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm whitespace-nowrap flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            Customize Dashboard
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <StatCard title="Total Residents" value="512" subtitle="248 Families" icon={FaUsers} colorClass="bg-orange-100 text-orange-500" />
        <StatCard title="Flats / Units" value="428" subtitle="Occupied: 398" icon={FaBuilding} colorClass="bg-blue-100 text-blue-500" />
        <StatCard title="Visitors Today" value="36" subtitle="Vehicles: 18" icon={FaIdBadge} colorClass="bg-green-100 text-green-500" />
        <StatCard title="Staff Present" value="58" highlightValue="72" subtitle="81% On Duty" icon={FaUserTie} colorClass="bg-purple-100 text-purple-500" />
        <StatCard title="Open Complaints" value="12" subtitle="8 In Progress" icon={FaExclamationCircle} colorClass="bg-red-100 text-red-500" />
        <StatCard title="Collection (This Month)" value="₹2,45,300" subtitle="78% Collected" icon={FaRupeeSign} colorClass="bg-teal-100 text-teal-500" />
        <StatCard title="Pending Dues" value="₹3,12,500" subtitle="From 34 Units" icon={FaFileInvoiceDollar} colorClass="bg-rose-100 text-rose-500" />
        <StatCard title="Upcoming Events" value="2" subtitle="This Week" icon={FaCalendarAlt} colorClass="bg-indigo-100 text-indigo-500" />
      </div>

      {/* Priority Overview Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Priority Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PriorityCard
            title="Security"
            statusText="All Good"
            statusType="success"
            icon={FaShieldAlt}
            mainText="All gates operational and no critical alerts."
            stats={[
              { label: 'Visitors Today', value: '36' },
              { label: 'Vehicles Today', value: '18' },
              { label: 'Security Staff Present', value: '16 / 18' }
            ]}
            actionText="View Security"
          />
          <PriorityCard
            title="Cleaning"
            statusText="On Track"
            statusType="success"
            icon={FaBroom}
            mainText="Today's cleaning is 87% completed."
            stats={[
              { label: 'Completed Areas', value: '12 / 14' },
              { label: 'Pending Areas', value: '2' },
              { label: 'Staff Present', value: '22 / 28' }
            ]}
            actionText="View Cleaning"
          />
          <PriorityCard
            title="Staff Attendance"
            statusText=""
            statusType="active" // Not showing a badge here in the image, but component expects one. Let's modify PriorityCard or pass empty. Actually image doesn't show badge for Staff Attendance.
            icon={FaUsersCog}
            mainText="81% staff present today."
            stats={[
              { label: 'Present', value: '58' },
              { label: 'Absent', value: '7' },
              { label: 'On Leave', value: '4' }
            ]}
            actionText="View Attendance"
          />
          <PriorityCard
            title="Festivals & Community"
            statusText="Active"
            statusType="warning"
            icon={FaGift}
            mainText="Ganesh Chaturthi on 15 Sept 2024."
            stats={[
              { label: 'Upcoming Events', value: '2' },
              { label: 'Community Polls', value: '1' },
              { label: 'New Announcements', value: '3' }
            ]}
            actionText="View Community"
          />
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <OperationsSummary />
        <div className="lg:col-span-1">
          <AlertList />
        </div>
        <div className="lg:col-span-1">
          <EventList />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
