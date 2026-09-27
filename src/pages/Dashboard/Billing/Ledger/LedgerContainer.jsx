import React, { useState } from 'react';
import { FaArrowLeft, FaBook, FaListAlt, FaFileSignature, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import LedgerOverviewTab from './LedgerOverviewTab';
import GeneralLedgerTab from './GeneralLedgerTab';
import ChartOfAccountsTab from './ChartOfAccountsTab';
import JournalEntriesTab from './JournalEntriesTab';
import AccountingPeriodsTab from './AccountingPeriodsTab';

const LedgerContainer = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'general_ledger', label: 'General Ledger', icon: FaBook },
    { id: 'chart_of_accounts', label: 'Chart of Accounts', icon: FaListAlt },
    { id: 'journal_entries', label: 'Journal Entries', icon: FaFileSignature },
    { id: 'accounting_periods', label: 'Periods', icon: FaCalendarAlt },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <LedgerOverviewTab />;
      case 'general_ledger': return <GeneralLedgerTab />;
      case 'chart_of_accounts': return <ChartOfAccountsTab />;
      case 'journal_entries': return <JournalEntriesTab />;
      case 'accounting_periods': return <AccountingPeriodsTab />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ledger Management</h1>
            <p className="text-sm text-gray-500">Double-entry accounting, journals, and balances</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white text-cyan-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={activeTab === tab.id ? 'text-cyan-600' : 'text-gray-400'} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default LedgerContainer;
