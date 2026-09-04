import React, { useState } from 'react';
import { 
  FaMoneyCheckAlt, FaFileInvoiceDollar, FaRegCreditCard, 
  FaGift, FaTools, FaCalendarCheck, FaUsers, FaStore, FaUserTie,
  FaArrowRight, FaChartLine, FaExclamationCircle, FaArrowLeft, FaSearch, FaFilter
} from 'react-icons/fa';

const SectionCard = ({ title, icon, colorClass, desc, stats, highlight, onClick }) => (
  <div 
    onClick={onClick}
    className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden"
  >
    {/* Decorative background circle */}
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5 ${colorClass.split(' ')[0]} transition-transform group-hover:scale-150 duration-500`}></div>
    
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${colorClass}`}>
        {icon}
      </div>
      <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors">
        <FaArrowRight className="transform -rotate-45 group-hover:rotate-0 transition-all duration-300" />
      </button>
    </div>
    
    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">{title}</h3>
    <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{desc}</p>
    
    {stats && (
      <div className="pt-5 border-t border-gray-100/60 flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{stats.label}</span>
          <span className={`text-xl font-black ${highlight ? 'text-red-500' : 'text-gray-900'}`}>{stats.value}</span>
        </div>
        {stats.trend && (
          <div className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
            <FaChartLine className="mr-1.5" />
            {stats.trend}
          </div>
        )}
      </div>
    )}
  </div>
);

// Helper to generate dynamic mock data
const getMockData = (title, tab) => {
  const rows = [];
  let statuses = ['Paid', 'Pending', 'Failed'];
  if (tab === 'dues') statuses = ['Pending', 'Overdue'];
  if (tab === 'expense') statuses = ['Processed', 'Pending Approval'];

  for (let i = 1; i <= 8; i++) {
    rows.push({
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `2026-09-0${Math.floor(1 + Math.random() * 9)}`,
      description: `${title} - ${tab === 'expense' ? 'Payment out' : 'Received'} (Ref #${i})`,
      amount: `₹${(Math.random() * 10000 + 500).toFixed(0)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return rows;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Paid':
    case 'Processed':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'Pending':
    case 'Pending Approval':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'Overdue':
    case 'Failed':
      return 'bg-red-50 text-red-600 border-red-100';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const BillingPage = () => {
  const [activeTab, setActiveTab] = useState('collection');
  const [selectedModule, setSelectedModule] = useState(null);

  const tabs = [
    { id: 'collection', label: 'Collection', icon: <FaMoneyCheckAlt />, desc: 'Manage society incomings' },
    { id: 'expense', label: 'Expense', icon: <FaFileInvoiceDollar />, desc: 'Track society outgoings' },
    { id: 'dues', label: 'Dues', icon: <FaRegCreditCard />, desc: 'Monitor pending payments' }
  ];

  const handleModuleClick = (title, colorClass) => {
    setSelectedModule({
      title,
      colorClass,
      data: getMockData(title, activeTab)
    });
  };

  if (selectedModule) {
    const tabLabel = tabs.find(t => t.id === activeTab)?.label;
    
    return (
      <div className="animate-fade-in-up pb-8 max-w-7xl mx-auto">
        {/* Breadcrumb Mapping */}
        <div className="flex items-center text-sm mb-4">
          <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setSelectedModule(null)}>Billing & Accounts</span>
          <span className="mx-2 text-gray-400">&gt;&gt;</span>
          <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setSelectedModule(null)}>{tabLabel}</span>
          <span className="mx-2 text-gray-400">&gt;&gt;</span>
          <span className="text-gray-500">{selectedModule.title}</span>
        </div>

        {/* Back Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => setSelectedModule(null)} 
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-xl shadow-sm border border-gray-200 hover:text-orange-600 hover:border-orange-200 transition-all"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          
          <div className="flex gap-3">
            <button className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <FaFilter />
            </button>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={`Search ${selectedModule.title}...`} 
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className={`p-8 flex items-center justify-between border-b border-gray-100 ${selectedModule.colorClass.split(' ')[0]} bg-opacity-10`}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedModule.title} Records</h2>
              <p className="text-sm text-gray-600">Showing all transactions and static mock records for this module.</p>
            </div>
            <button className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
              Export CSV
            </button>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                  <th className="py-4 px-8 font-semibold text-sm">Transaction ID</th>
                  <th className="py-4 px-8 font-semibold text-sm">Date</th>
                  <th className="py-4 px-8 font-semibold text-sm">Description</th>
                  <th className="py-4 px-8 font-semibold text-sm">Amount</th>
                  <th className="py-4 px-8 font-semibold text-sm">Status</th>
                  <th className="py-4 px-8 font-semibold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedModule.data.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors group">
                    <td className="py-4 px-8 text-sm font-medium text-gray-900">{row.id}</td>
                    <td className="py-4 px-8 text-sm text-gray-600">{row.date}</td>
                    <td className="py-4 px-8 text-sm text-gray-600">{row.description}</td>
                    <td className="py-4 px-8 text-sm font-bold text-gray-900">{row.amount}</td>
                    <td className="py-4 px-8">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-right">
                      <button className="text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing 1 to 8 of 24 entries</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-100">Next</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-8 max-w-7xl mx-auto">
      {/* Breadcrumb Mapping */}
      <div className="flex items-center text-sm mb-4">
        <span className="text-gray-500 font-medium">Billing & Accounts</span>
      </div>

      {/* Header Section */}
      <div className="mb-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Billing & Accounts
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Manage your society's finances comprehensively. Track collections, monitor expenses, and keep an eye on pending dues across all modules.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium backdrop-blur-sm transition-colors text-sm flex items-center border border-white/10">
              Download Report
            </button>
            <button className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all text-sm flex items-center">
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center py-3.5 px-6 rounded-xl transition-all duration-300 whitespace-nowrap min-w-[200px]
              ${activeTab === tab.id 
                ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-500/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }
            `}
          >
            <span className={`text-lg mr-3 ${activeTab === tab.id ? 'text-orange-500' : 'opacity-70'}`}>
              {tab.icon}
            </span>
            <div className="text-left">
              <div className="font-bold text-sm">{tab.label}</div>
              <div className={`text-[10px] ${activeTab === tab.id ? 'text-orange-400' : 'text-gray-400'}`}>
                {tab.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-500 ease-in-out">
        {activeTab === 'collection' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Collection Modules</h2>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                Total Month: ₹4,52,000
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SectionCard 
                title="Festivals" 
                icon={<FaGift />} 
                colorClass="bg-purple-100 text-purple-600"
                desc="Manage collections for upcoming and past society festivals."
                stats={{ label: 'This Month', value: '₹45,000', trend: '+12%' }}
                onClick={() => handleModuleClick('Festivals', 'bg-purple-100 text-purple-600')}
              />
              <SectionCard 
                title="Maintenance" 
                icon={<FaTools />} 
                colorClass="bg-blue-100 text-blue-600"
                desc="Monthly and annual maintenance fee collections."
                stats={{ label: 'Collected (Aug)', value: '₹3,20,000', trend: '+2%' }}
                onClick={() => handleModuleClick('Maintenance', 'bg-blue-100 text-blue-600')}
              />
              <SectionCard 
                title="Amenity Booking" 
                icon={<FaCalendarCheck />} 
                colorClass="bg-teal-100 text-teal-600"
                desc="Revenue generated from clubhouse, pool, and hall bookings."
                stats={{ label: 'This Month', value: '₹12,500' }}
                onClick={() => handleModuleClick('Amenity Booking', 'bg-teal-100 text-teal-600')}
              />
              <SectionCard 
                title="Other Collections" 
                icon={<FaMoneyCheckAlt />} 
                colorClass="bg-indigo-100 text-indigo-600"
                desc="Move-in charges, penalties, and miscellaneous income."
                stats={{ label: 'This Month', value: '₹4,500' }}
                onClick={() => handleModuleClick('Other Collections', 'bg-indigo-100 text-indigo-600')}
              />
            </div>
          </div>
        )}

        {activeTab === 'expense' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Expense Modules</h2>
              <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                Total Month: ₹1,85,000
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SectionCard 
                title="Vendors" 
                icon={<FaStore />} 
                colorClass="bg-amber-100 text-amber-600"
                desc="Payments made to registered society vendors and contractors."
                stats={{ label: 'Paid this month', value: '₹85,000' }}
                onClick={() => handleModuleClick('Vendors', 'bg-amber-100 text-amber-600')}
              />
              <SectionCard 
                title="Festivals" 
                icon={<FaGift />} 
                colorClass="bg-purple-100 text-purple-600"
                desc="Expenses incurred for organizing society events and festivals."
                stats={{ label: 'Paid this month', value: '₹35,000' }}
                onClick={() => handleModuleClick('Festival Expenses', 'bg-purple-100 text-purple-600')}
              />
              <SectionCard 
                title="Maintenance" 
                icon={<FaTools />} 
                colorClass="bg-blue-100 text-blue-600"
                desc="Repair, servicing, and upkeep expenses for common areas."
                stats={{ label: 'Paid this month', value: '₹45,000' }}
                onClick={() => handleModuleClick('Maintenance Expenses', 'bg-blue-100 text-blue-600')}
              />
              <SectionCard 
                title="Staff Salary" 
                icon={<FaUserTie />} 
                colorClass="bg-pink-100 text-pink-600"
                desc="Monthly salary payouts for guards, cleaners, and managers."
                stats={{ label: 'Processed', value: '₹1,20,000' }}
                onClick={() => handleModuleClick('Staff Salary', 'bg-pink-100 text-pink-600')}
              />
            </div>
          </div>
        )}

        {activeTab === 'dues' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Pending Dues by Module</h2>
              <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-4 py-1.5 rounded-full border border-red-100 shadow-sm shadow-red-100/50">
                <FaExclamationCircle className="animate-pulse" />
                Total Deficit: ₹1,12,000
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SectionCard 
                title="Maintenance Dues" 
                icon={<FaTools />} 
                colorClass="bg-rose-100 text-rose-600"
                desc="Unpaid maintenance bills across all flats and blocks."
                stats={{ label: 'Total Pending', value: '₹85,000' }}
                highlight={true}
                onClick={() => handleModuleClick('Maintenance Dues', 'bg-rose-100 text-rose-600')}
              />
              <SectionCard 
                title="Festival Dues" 
                icon={<FaGift />} 
                colorClass="bg-orange-100 text-orange-600"
                desc="Pending contributions for upcoming or past festivals."
                stats={{ label: 'Total Pending', value: '₹15,000' }}
                highlight={true}
                onClick={() => handleModuleClick('Festival Dues', 'bg-orange-100 text-orange-600')}
              />
              <SectionCard 
                title="Amenity Dues" 
                icon={<FaCalendarCheck />} 
                colorClass="bg-red-100 text-red-600"
                desc="Unpaid charges for booked amenities that are pending."
                stats={{ label: 'Total Pending', value: '₹4,500' }}
                highlight={true}
                onClick={() => handleModuleClick('Amenity Dues', 'bg-red-100 text-red-600')}
              />
              <SectionCard 
                title="Penalty Dues" 
                icon={<FaExclamationCircle />} 
                colorClass="bg-fuchsia-100 text-fuchsia-600"
                desc="Unpaid rule violation penalties and late payment fees."
                stats={{ label: 'Total Pending', value: '₹7,500' }}
                highlight={true}
                onClick={() => handleModuleClick('Penalty Dues', 'bg-fuchsia-100 text-fuchsia-600')}
              />
            </div>
            
            {/* Actionable prompt area */}
            <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm shrink-0">
                  <FaExclamationCircle className="text-xl" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">High Priority Reminders</h4>
                  <p className="text-sm text-gray-600">There are 45 residents with dues pending for more than 60 days. Sending a bulk reminder is highly recommended.</p>
                </div>
              </div>
              <button className="whitespace-nowrap px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md shadow-red-500/20 transition-all">
                Send Bulk Reminders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
