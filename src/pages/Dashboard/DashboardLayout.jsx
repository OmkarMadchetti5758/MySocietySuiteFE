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
  FaUsers
} from 'react-icons/fa';

import logoImg from '../../assets/images/webp/MySocietySuite_FinalLogo.webp';
import SettingsPage from './Settings/SettingsPage';
import ResidentsPage from './Residents/ResidentsPage';

const MODULE_DEF = [
  { id: 'society_flat_setup', label: 'Society & Flats', icon: FaBuilding, path: 'setup' },
  { id: 'society_flat_setup', label: 'Residents', icon: FaUsers, path: 'residents', routeKey: 'residents' },
  { id: 'billing_accounts', label: 'Billing & Accounts', icon: FaMoneyBillWave, path: 'billing' },
  { id: 'visitor_management', label: 'Visitors', icon: FaIdBadge, path: 'visitors' },
  { id: 'complaints_helpdesk', label: 'Helpdesk', icon: FaExclamationCircle, path: 'helpdesk' },
  { id: 'notice_board_polls', label: 'Notices & Polls', icon: FaClipboardList, path: 'notices' },
  { id: 'amenity_booking', label: 'Amenities', icon: FaCalendarAlt, path: 'amenities' },
  { id: 'parking_management', label: 'Parking', icon: FaCar, path: 'parking' },
  { id: 'vendor_management', label: 'Vendors', icon: FaStore, path: 'vendors' },
  { id: 'staff_management', label: 'Staff', icon: FaUserTie, path: 'staff' },
  { id: 'documents_manager', label: 'Documents', icon: FaFolderOpen, path: 'documents' },
  { id: 'reports_dashboard', label: 'Reports', icon: FaChartBar, path: 'reports' },
  { id: 'ai_assistant', label: 'AI Assistant', icon: FaRobot, path: 'ai' },
  { id: 'festival_collection', label: 'Festivals', icon: FaGift, path: 'festivals' },
  { id: 'settings', label: 'Settings', icon: FaCog, path: 'settings' }
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
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [societyName, setSocietyName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    const permsData = localStorage.getItem('permissions');
    const storedSocietyId = localStorage.getItem('societyDatabase');

    if (!token || !userData || !permsData) {
      navigate('/');
      return;
    }

    // Verify society matches
    if (storedSocietyId !== societyId) {
      navigate('/');
      return;
    }

    setUser(JSON.parse(userData));
    setPermissions(JSON.parse(permsData));
    setSocietyName(localStorage.getItem('societyName') || societyId);

  }, [navigate, societyId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Filter modules based on permissions
  // Level 0 = NO_ACCESS, 1 = VIEW, 2 = MANAGE, 3 = FULL
  const allowedModules = MODULE_DEF.filter(mod => {
    const perm = permissions[mod.id];
    return perm && perm.level >= 1;
  });

  if (!user) return null; // loading

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 transform transition-transform duration-300 ease-in-out z-20 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-white shrink-0">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center overflow-hidden mr-3">
            <img src={logoImg} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <span className="font-bold text-gray-900 truncate">MySocietySuite</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </div>

          {allowedModules.length === 0 && (
            <div className="px-3 text-sm text-gray-500 italic">No access to any modules.</div>
          )}

          {allowedModules.map(mod => (
            <NavLink
              key={mod.routeKey || mod.path}
              to={`/${societyId}/dashboard/${mod.path}`}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <mod.icon className="mr-3 text-lg opacity-80" />
              {mod.label}
            </NavLink>
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-3"
            >
              <FaBars />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block truncate">
              {societyName}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-gray-900">{user.name}</span>
              <span className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
              <FaUserCircle className="text-2xl" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to {societyName}</h2>
                <p className="text-gray-600">Select a module from the sidebar to get started.</p>
              </div>} />
              {allowedModules.map(mod => {
                if (mod.id === 'settings') {
                  return <Route key={mod.routeKey || mod.path} path={mod.path} element={<SettingsPage />} />;
                }
                if (mod.path === 'residents') {
                  return <Route key={mod.routeKey || mod.path} path={mod.path} element={<ResidentsPage />} />;
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
