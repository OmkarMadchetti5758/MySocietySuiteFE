import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useParams, NavLink } from 'react-router-dom';
import {
  FaBuilding,
  FaMoneyBillWave,
  FaIdBadge,
  FaExclamationCircle,
  FaClipboardList,
  FaCalendarAlt,
  FaCar,
  FaStore,
  FaUserTie,
  FaFolderOpen,
  FaChartBar,
  FaRobot,
  FaGift,
  FaSignOutAlt,
  FaBars,
  FaUserCircle,
  FaCog,
  FaUsers,
  FaSearch,
  FaBell,
  FaHome,
  FaChevronDown
} from 'react-icons/fa';

import logoImg from '../../assets/images/webp/MySocietySuite_FinalLogo.webp';
import SettingsPage from './Settings/SettingsPage';
import ResidentsPage from './Residents/ResidentsPage';
import AdminDashboard from './AdminDashboard';
import ProfilePage from './ProfilePage';
import StaffPage from './Staff/StaffPage';
import { usePermissions } from '../../context/PermissionsContext';
import { clearAuthSession, redirectToLogin } from '../../utils/authSession';

import NoticeBoard from './NoticeBoard/NoticeBoard';
import PollsList from './Polls/PollsList';

const MODULE_DEF = [
  { id: 'society_flat_setup', label: 'Society & Flats', icon: FaBuilding, path: 'setup', group: 'SOCIETY' },
  { id: 'society_flat_setup', label: 'Residents', icon: FaUsers, path: 'residents', routeKey: 'residents', group: 'SOCIETY' },
  { id: 'billing_accounts', label: 'Billing & Accounts', icon: FaMoneyBillWave, path: 'billing', group: 'FINANCE' },
  { id: 'visitor_management', label: 'Visitors', icon: FaIdBadge, path: 'visitors', group: 'SECURITY' },
  { id: 'complaints_helpdesk', label: 'Helpdesk', icon: FaExclamationCircle, path: 'helpdesk', group: 'OPERATIONS' },
  { id: 'notice_board_polls', label: 'Notices', icon: FaClipboardList, path: 'notices', group: 'COMMUNITY' },
  { id: 'notice_board_polls', label: 'Polls', icon: FaChartBar, path: 'polls', group: 'COMMUNITY' },
  { id: 'amenity_booking', label: 'Amenities', icon: FaCalendarAlt, path: 'amenities', group: 'OPERATIONS' },
  { id: 'parking_management', label: 'Parking', icon: FaCar, path: 'parking', group: 'OPERATIONS' },
  { id: 'vendor_management', label: 'Vendors', icon: FaStore, path: 'vendors', group: 'OPERATIONS' },
  { id: 'staff_management', label: 'Staff', icon: FaUserTie, path: 'staff', group: 'STAFF' },
  { id: 'documents_manager', label: 'Documents', icon: FaFolderOpen, path: 'documents', group: 'ADMINISTRATION' },
  { id: 'reports_dashboard', label: 'Reports', icon: FaChartBar, path: 'reports', group: 'REPORTS' },
  { id: 'ai_assistant', label: 'AI Assistant', icon: FaRobot, path: 'ai', group: 'AI ASSISTANT' },
  { id: 'festival_collection', label: 'Festivals', icon: FaGift, path: 'festivals', group: 'COMMUNITY' },
  { id: 'settings', label: 'Settings', icon: FaCog, path: 'settings', group: 'ADMINISTRATION' }
];

const Placeholder = ({ title }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-[60vh] flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title} Module</h2>
    <p className="text-gray-500 max-w-md">This module is currently under development. Soon you'll be able to manage your society's {title.toLowerCase()} from here.</p>
  </div>
);

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { societyId } = useParams();
  const { permissions } = usePermissions();
  const [user, setUser] = useState(null);
  const [societyName, setSocietyName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    const permsData = localStorage.getItem('permissions');
    const storedSocietyId = localStorage.getItem('societyDatabase');

    if (!token || !userData || !permsData) {
      navigate('/');
      return;
    }

    if (storedSocietyId !== societyId) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(userData));
    setSocietyName(localStorage.getItem('societyName') || societyId);
  }, [navigate, societyId]);

  const handleLogout = () => {
    clearAuthSession();
    redirectToLogin('/');
  };

  // Filter modules based on permissions
  // Level 0 = NO_ACCESS, 1 = VIEW, 2 = MANAGE, 3 = FULL
  const safePermissions = permissions || {};
  const allowedModules = MODULE_DEF.filter(mod => {
    const perm = safePermissions[mod.id];
    return perm && perm.level >= 1;
  });

  if (!user) return null;

  const roleKeys = user.roleKeys || JSON.parse(localStorage.getItem('roleKeys') || '[]');
  const roleLabel = roleKeys.length > 1
    ? `${roleKeys.length} roles`
    : (user.role || roleKeys[0] || '').replace(/_/g, ' ');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin' || roleKeys.includes('admin') || roleKeys.includes('super_admin');

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-20 flex flex-col shrink-0 h-screen overflow-hidden ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'
        } fixed inset-y-0 left-0 lg:relative`}
      >
        <div className="h-18 flex items-center px-6 border-b border-gray-100 bg-white shrink-0">
          <div className="w-35 h-35 mt-4 ml-8 rounded-full  flex items-center justify-center overflow-hidden mr-3">
            <img src={logoImg} alt="Logo" className="w-35 h-35 object-contain" />
          </div>
          {/* <span className="font-bold text-gray-900 truncate">MySocietySuite</span> */}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {isAdmin && (
            <NavLink
              to={`/${societyId}/dashboard`}
              end
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-4 ${isActive
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <FaHome className="mr-3 text-lg opacity-80" />
              Dashboard
            </NavLink>
          )}

          {allowedModules.length === 0 && (
            <div className="px-3 text-sm text-gray-500 italic">No access to any modules.</div>
          )}

          {Object.entries(allowedModules.reduce((acc, mod) => {
            const group = mod.group || 'GENERAL';
            if (!acc[group]) acc[group] = [];
            acc[group].push(mod);
            return acc;
          }, {})).map(([groupName, mods]) => (
            <div key={groupName} className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
                {groupName}
              </div>
              {mods.map(mod => (
                <NavLink
                  key={mod.routeKey || mod.path}
                  to={`/${societyId}/dashboard/${mod.path}`}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-orange-50 text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <mod.icon className="mr-3 text-lg opacity-80" />
                  {mod.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <FaSignOutAlt className="mr-3 text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-18 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-3"
            >
              <FaBars />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-800 truncate">
                Dashboard
              </h1>
              <p className="text-xs text-gray-500">Overview of {societyName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Search Bar */}
            <div className="hidden md:flex relative w-64 lg:w-80">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search (e.g. Residents, Complaints, Staff...)"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
              <FaBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* Profile */}
            <NavLink
              to={`/${societyId}/dashboard/profile`}
              className="flex items-center gap-3 border-l border-gray-200 pl-4 md:pl-6 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200 shadow-sm overflow-hidden shrink-0">
                <FaUserCircle className="text-2xl" />
              </div>
              <div className="hidden sm:flex flex-col items-start mr-2">
                <span className="text-sm font-bold text-gray-900">{user.name}</span>
                <span className="text-[10px] text-gray-500 capitalize">{roleLabel}</span>
              </div>
              <FaChevronDown className="text-gray-400 text-xs hidden sm:block" />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={
                isAdmin 
                  ? <AdminDashboard societyName={societyName} />
                  : <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-[60vh]">
                      <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <FaBuilding className="text-3xl" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to {societyName}</h2>
                      <p className="text-gray-500 max-w-md">Select a module from the sidebar to get started.</p>
                    </div>
              } />
              <Route path="profile" element={<ProfilePage />} />
              {allowedModules.map(mod => {
                if (mod.id === 'settings') {
                  return <Route key={mod.routeKey || mod.path} path={mod.path} element={<SettingsPage />} />;
                }
                if (mod.path === 'residents') {
                  return <Route key={mod.routeKey || mod.path} path={mod.path} element={<ResidentsPage />} />;
                }
                if (mod.path === 'staff') {
                  return <Route key={mod.routeKey || mod.path} path={mod.path} element={<StaffPage />} />;
                }
                if (mod.path === 'notices') {
                  return <Route key={mod.routeKey || mod.path} path={mod.path} element={<NoticeBoard />} />;
                }
                if (mod.path === 'polls') {
                  return <Route key={mod.routeKey || mod.path} path={mod.path} element={<PollsList />} />;
                }
                return <Route key={mod.routeKey || mod.path} path={mod.path} element={<Placeholder title={mod.label} />} />;
              })}
            </Routes>
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
