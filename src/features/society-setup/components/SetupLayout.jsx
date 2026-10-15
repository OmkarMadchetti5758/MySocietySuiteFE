import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiBell,
  FiChevronDown,
  FiMenu,
  FiX,
  FiHeadphones,
  FiLock,
} from 'react-icons/fi';
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaIdBadge,
  FaShieldAlt,
  FaCalendarAlt,
  FaCar,
  FaWrench,
  FaBroom,
  FaClipboardList,
  FaComments,
  FaExclamationCircle,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaReceipt,
  FaChartBar,
  FaCog,
  FaUserShield,
  FaHistory,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import logoImg from '../../../assets/images/webp/MySocietySuite_FinalLogo.webp';
import { useSetupWizard } from '../hooks/useSetupWizard';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: FaHome, path: 'dashboard', isTop: true },
  {
    group: 'SOCIETY',
    items: [
      { label: 'Residents & Units', icon: FaUsers },
      { label: 'Members', icon: FaUsers },
      { label: 'Towers / Buildings', icon: FaBuilding },
    ],
  },
  {
    group: 'OPERATIONS',
    items: [
      { label: 'Gate Operations', icon: FaIdBadge },
      { label: 'Visitors', icon: FaIdBadge },
      { label: 'Security Monitoring', icon: FaShieldAlt },
      { label: 'Amenities', icon: FaCalendarAlt, stepHighlight: 3 },
      { label: 'Parking', icon: FaCar },
      { label: 'Maintenance', icon: FaWrench },
      { label: 'Cleaning & Housekeeping', icon: FaBroom },
    ],
  },
  {
    group: 'COMMUNICATION',
    items: [
      { label: 'Notice Board', icon: FaClipboardList },
      { label: 'Chat / Broadcast', icon: FaComments },
      { label: 'Complaints', icon: FaExclamationCircle },
    ],
  },
  {
    group: 'FINANCE',
    items: [
      { label: 'Accounts & Billing', icon: FaFileInvoiceDollar },
      { label: 'Payments', icon: FaCreditCard },
      { label: 'Expenses', icon: FaReceipt },
    ],
  },
  {
    group: 'REPORTS',
    items: [{ label: 'Reports & Analytics', icon: FaChartBar }],
  },
  {
    group: 'ADMINISTRATION',
    items: [
      { label: 'Society Settings', icon: FaCog },
      { label: 'Users & Roles', icon: FaUserShield },
      { label: 'Audit Log', icon: FaHistory },
    ],
  },
];

const SetupLayout = ({ children }) => {
  const { currentStep, steps } = useSetupWizard();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeStepMeta = steps.find((s) => s.step === currentStep) || steps[0];

  const handleDisabledNavClick = (e, label) => {
    e.preventDefault();
    toast('Complete society setup to unlock ' + label, {
      icon: '🔒',
      style: {
        borderRadius: '10px',
        background: '#1f2937',
        color: '#fff',
      },
    });
  };

  return (
    <div className="h-screen bg-[#F8F9FA] flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (Locked during setup) */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 flex flex-col shrink-0 h-screen fixed inset-y-0 left-0 w-64 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-18 flex items-center px-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="MySocietySuite" className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight">
                MySocietySuite
              </span>
              <span className="text-[8px] font-bold text-gray-400 tracking-wider uppercase">
                Simplifying Society Living
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
          {/* Top Dashboard item */}
          <button
            type="button"
            onClick={(e) => handleDisabledNavClick(e, 'Dashboard')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors opacity-70 group"
          >
            <div className="flex items-center gap-3">
              <FaHome className="text-base text-gray-400 group-hover:text-gray-600" />
              <span>Dashboard</span>
            </div>
            <FiLock className="text-gray-300 text-xs" />
          </button>

          {/* Grouped Items */}
          {SIDEBAR_ITEMS.filter((g) => g.group).map((group) => (
            <div key={group.group}>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isHighlighted = item.stepHighlight === currentStep;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={(e) => handleDisabledNavClick(e, item.label)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isHighlighted
                          ? 'bg-orange-50 text-[#EA580C] font-semibold'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <item.icon
                          className={`text-sm shrink-0 ${
                            isHighlighted ? 'text-[#EA580C]' : 'text-gray-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <FiLock className="text-gray-300 text-[10px] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Need Help Box at bottom of sidebar */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/70 shrink-0">
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <FiHeadphones className="text-[#EA580C] text-base" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-gray-800 leading-tight">Need Help?</span>
              <span className="text-[10px] text-gray-500">Contact Support</span>
              <a
                href="tel:+919226605656"
                className="text-[11px] font-bold text-[#EA580C] hover:underline truncate mt-0.5"
              >
                +91 9226605656
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <FiMenu className="text-xl" />
            </button>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600">
              <span className="text-gray-900 font-bold">Register Society</span>
              <span className="text-gray-300">›</span>
              <span className="text-[#EA580C] font-semibold">{activeStepMeta.breadcrumb}</span>
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-50 transition-colors">
              <FiBell className="text-gray-600 text-lg" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                12
              </span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 text-[#EA580C] font-bold text-xs flex items-center justify-center">
                SA
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-gray-900">Super Admin</span>
                <span className="text-[10px] text-gray-400">Administrator</span>
              </div>
              <FiChevronDown className="text-gray-400 text-xs hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SetupLayout;
