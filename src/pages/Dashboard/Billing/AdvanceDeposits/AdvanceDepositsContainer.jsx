import { useState, useEffect } from 'react';
import {
  FaChartLine, FaWallet, FaShieldAlt, FaExchangeAlt,
  FaUndo, FaHistory, FaArrowLeft, FaUserTie, FaHome
} from 'react-icons/fa';
import OverviewTab from './OverviewTab';
import AdvanceAccountsTab from './AdvanceAccountsTab';
import SecurityDepositsTab from './SecurityDepositsTab';
import AllocationsTab from './AllocationsTab';
import RefundsTab from './RefundsTab';
import TransactionsTab from './TransactionsTab';

const ALL_TABS = [
  { id: 'overview', label: 'Overview', residentLabel: 'My Financial Summary', icon: FaChartLine },
  { id: 'advance', label: 'Advance Accounts', residentLabel: 'My Advance Account', icon: FaWallet },
  { id: 'deposits', label: 'Security Deposits', residentLabel: 'My Security Deposits', icon: FaShieldAlt },
  { id: 'allocations', label: 'Allocations', residentLabel: 'My Allocations', icon: FaExchangeAlt },
  { id: 'refunds', label: 'Refunds', residentLabel: 'My Refund Requests', icon: FaUndo },
  { id: 'transactions', label: 'Transactions', residentLabel: 'My Transactions', icon: FaHistory },
];

export default function AdvanceDepositsContainer({ onBack }) {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const rawRole = (currentUser.role || '').toLowerCase();
  const roleKeys = (currentUser.roleKeys || []).map(r => String(r).toLowerCase());

  const hasAdminRole = ['admin', 'super_admin', 'society_admin', 'committee_admin', 'committee_member'].includes(rawRole) ||
    roleKeys.some(r => ['admin', 'super_admin', 'society_admin', 'committee_admin', 'committee_member'].includes(r));

  const hasAccountantRole = rawRole === 'accountant' || roleKeys.includes('accountant');

  const hasStaffCapabilities = hasAdminRole || hasAccountantRole;

  const hasResidentRole = ['resident_owner', 'resident_tenant', 'resident'].includes(rawRole) ||
    roleKeys.some(r => ['resident_owner', 'resident_tenant', 'resident'].includes(r));

  const isDualRole = hasStaffCapabilities && hasResidentRole;

  const initialContext = (() => {
    const saved = localStorage.getItem('activeContext');
    if (saved && ['accountant', 'admin', 'resident'].includes(saved)) {
      if (saved === 'resident' && hasResidentRole) return 'resident';
      if ((saved === 'accountant' || saved === 'admin') && hasStaffCapabilities) return saved;
    }
    return hasStaffCapabilities ? (hasAdminRole ? 'admin' : 'accountant') : 'resident';
  })();

  const [activeContext, setActiveContext] = useState(initialContext);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    localStorage.setItem('activeContext', activeContext);
  }, [activeContext]);

  const handleContextChange = (newContext) => {
    setActiveContext(newContext);
    localStorage.setItem('activeContext', newContext);
    // Refresh current tab data
    setActiveTab('overview');
  };

  const isResidentView = activeContext === 'resident';
  const isAdmin = !isResidentView && (hasAdminRole || hasStaffCapabilities);
  const isAccountant = !isResidentView && (hasAccountantRole || hasStaffCapabilities);

  const visibleTabs = isResidentView
    ? ALL_TABS.filter(t => ['overview', 'advance', 'deposits', 'refunds', 'transactions'].includes(t.id))
    : ALL_TABS;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab isResidentView={isResidentView} />;
      case 'advance': return <AdvanceAccountsTab isAdmin={isAdmin} isAccountant={isAccountant} isResidentView={isResidentView} />;
      case 'deposits': return <SecurityDepositsTab isAdmin={isAdmin} isAccountant={isAccountant} isResidentView={isResidentView} />;
      case 'allocations': return <AllocationsTab isAdmin={isAdmin} isAccountant={isAccountant} isResidentView={isResidentView} />;
      case 'refunds': return <RefundsTab isAdmin={isAdmin} isAccountant={isAccountant} isResidentView={isResidentView} />;
      case 'transactions': return <TransactionsTab isAdmin={isAdmin} isAccountant={isAccountant} isResidentView={isResidentView} />;
      default: return <OverviewTab isResidentView={isResidentView} />;
    }
  };

  return (
    <div className="space-y-0 relative">
      {/* Top Header with Back Button */}
      <div className="px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
        >
          <FaArrowLeft /> Back to Billing Hub
        </button>

        {/* Role Badge */}
        <div className="text-xs font-semibold text-gray-500 flex items-center gap-2">
          <span>Active Context:</span>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider ${
            isResidentView ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
          }`}>
            {isResidentView ? 'Personal Resident' : activeContext.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Role / Context Switcher (Only for Dual Role users who are both Staff + Resident) */}
      {isDualRole && (
        <div className="mx-4 sm:mx-6 mb-3 p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-base">
              {isResidentView ? <FaHome /> : <FaUserTie />}
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-200">Switch Data Access Context</p>
              <p className="text-sm font-bold text-white">
                Viewing As: <span className="text-amber-400">
                  {isResidentView ? 'Resident (Personal Scope)' : (hasAdminRole ? 'Admin / Society Operations' : 'Accountant / Society Operations')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50 w-full sm:w-auto justify-center">
            {hasStaffCapabilities && (
              <button
                onClick={() => handleContextChange(hasAdminRole ? 'admin' : 'accountant')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isResidentView
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <FaUserTie className="text-[11px]" /> Operational Context
              </button>
            )}
            <button
              onClick={() => handleContextChange('resident')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isResidentView
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FaHome className="text-[11px]" /> Resident Context
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-1 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const labelText = isResidentView ? tab.residentLabel : tab.label;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className={`text-xs ${isActive ? 'text-indigo-500' : ''}`} />
                {labelText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {renderTab()}
      </div>
    </div>
  );
}
