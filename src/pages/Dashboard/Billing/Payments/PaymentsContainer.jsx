import { useState, useEffect } from 'react';
import {
  FaChartLine, FaListAlt, FaExclamationTriangle, FaReceipt, FaChartBar,
  FaMoneyCheckAlt
} from 'react-icons/fa';
import PaymentsOverviewTab from './PaymentsOverviewTab';
import PaymentsListTab from './PaymentsListTab';
import PendingFailedTab from './PendingFailedTab';
import ReceiptsTab from './ReceiptsTab';
import CollectionsTab from './CollectionsTab';

const TABS = [
  { id: 'overview',  label: 'Overview',       icon: FaChartLine },
  { id: 'payments',  label: 'Payments',        icon: FaListAlt },
  { id: 'pending',   label: 'Pending / Failed', icon: FaExclamationTriangle },
  { id: 'receipts',  label: 'Receipts',        icon: FaReceipt },
  { id: 'collections', label: 'Collections',  icon: FaChartBar },
];

export default function PaymentsContainer() {
  const [activeTab, setActiveTab] = useState('overview');

  // Get role from localStorage
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const roleKeys = currentUser.roleKeys || [];
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin' || roleKeys.includes('admin');
  const isAccountant = roleKeys.includes('accountant');
  const isResident = currentUser.role === 'resident_owner' || currentUser.role === 'resident_tenant' || roleKeys.includes('resident_owner') || roleKeys.includes('resident_tenant');

  // Residents only see overview, payments, receipts
  const visibleTabs = isResident && !isAdmin && !isAccountant
    ? TABS.filter(t => ['overview', 'payments', 'receipts'].includes(t.id))
    : TABS;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':     return <PaymentsOverviewTab isAdmin={isAdmin} isAccountant={isAccountant} />;
      case 'payments':     return <PaymentsListTab isAdmin={isAdmin} isAccountant={isAccountant} />;
      case 'pending':      return <PendingFailedTab isAdmin={isAdmin} isAccountant={isAccountant} />;
      case 'receipts':     return <ReceiptsTab />;
      case 'collections':  return <CollectionsTab />;
      default:             return <PaymentsOverviewTab isAdmin={isAdmin} isAccountant={isAccountant} />;
    }
  };

  return (
    <div className="space-y-0">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  isActive
                    ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className={`text-xs ${isActive ? 'text-orange-500' : ''}`} />
                {tab.label}
                {tab.id === 'pending' && (
                  <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">!</span>
                )}
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
