import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaChartLine, FaExclamationTriangle, FaIdBadge, FaWrench, FaSwimmer, FaUserClock, FaTools, FaLaptopCode, FaGift, FaArrowLeft, FaFileExcel, FaFilePdf, FaFileCsv, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// ── Reusable UI Components ──────────────────────────────────────────────────

const SummaryCard = ({ title, value, colorClass, subtitle }) => (
  <div className={`p-6 rounded-2xl border bg-white shadow-sm flex flex-col ${colorClass} transition-all hover:shadow-md`}>
    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
    <div className="text-3xl font-extrabold text-gray-900 mb-1">{value}</div>
    {subtitle && <div className="text-xs text-gray-400 font-medium">{subtitle}</div>}
  </div>
);

const FilterSection = ({ filters, onApply, onReset }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
    {filters.map((f, i) => (
      <div key={i} className="flex flex-col min-w-[150px] flex-1">
        <label className="text-xs font-bold text-gray-600 uppercase mb-1">{f.label}</label>
        {f.type === 'select' ? (
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          >
            {f.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={f.type || 'text'}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder}
            className="p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
        )}
      </div>
    ))}
    <div className="flex gap-2 flex-1 min-w-[200px] justify-end">
      <button onClick={onReset} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors">
        Reset
      </button>
      <button onClick={onApply} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2">
        <FaFilter /> Apply Filters
      </button>
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
    <span className="text-sm text-gray-600">
      Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
    </span>
    <div className="flex gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
      >
        <FaChevronRight />
      </button>
    </div>
  </div>
);

// ── Mock Reports Data Configurations ──────────────────────────────────────────

const REPORTS_CONFIG = [
  {
    id: 'collection', title: 'Collection Report', desc: 'Maintenance collected vs outstanding by flat', icon: FaFileInvoiceDollar, colorClass: 'text-emerald-600 bg-emerald-100',
    allowedRoles: ['committee', 'accountant']
  },
  {
    id: 'income_expense', title: 'Income & Expense Statement', desc: 'Society-wide financial statement', icon: FaChartLine, colorClass: 'text-blue-600 bg-blue-100',
    allowedRoles: ['committee', 'accountant']
  },
  {
    id: 'defaulter', title: 'Defaulter List', desc: 'Flats with overdue payments beyond set cycles', icon: FaExclamationTriangle, colorClass: 'text-red-600 bg-red-100',
    allowedRoles: ['committee', 'accountant']
  },
  {
    id: 'visitor', title: 'Visitor Log Report', desc: 'Searchable visitor entry and exit history', icon: FaIdBadge, colorClass: 'text-purple-600 bg-purple-100',
    allowedRoles: ['committee', 'security_guard']
  },
  {
    id: 'complaint', title: 'Complaint Summary Report', desc: 'Overview of open, resolved, and SLA times', icon: FaWrench, colorClass: 'text-orange-600 bg-orange-100',
    allowedRoles: ['committee', 'facility_manager']
  },
  {
    id: 'amenity', title: 'Amenity Utilization Report', desc: 'Booking trends and utilization rates', icon: FaSwimmer, colorClass: 'text-cyan-600 bg-cyan-100',
    allowedRoles: ['committee']
  },
  {
    id: 'attendance', title: 'Staff Attendance Summary', desc: 'Monthly attendance summary for staff', icon: FaUserClock, colorClass: 'text-teal-600 bg-teal-100',
    allowedRoles: ['facility_manager', 'committee']
  },
  {
    id: 'vendor', title: 'Vendor Performance Report', desc: 'Work orders assigned and completed', icon: FaTools, colorClass: 'text-indigo-600 bg-indigo-100',
    allowedRoles: ['committee']
  },
  {
    id: 'platform', title: 'Platform Usage Report', desc: 'System-wide activity and user engagement', icon: FaLaptopCode, colorClass: 'text-gray-700 bg-gray-200',
    allowedRoles: ['super_admin']
  },
  {
    id: 'festival', title: 'Festival/Event Collection Report', desc: 'Specific collections for events/festivals', icon: FaGift, colorClass: 'text-pink-600 bg-pink-100',
    allowedRoles: ['committee', 'accountant']
  }
];


// ── Individual Report Views (Mocked for UI/UX) ──────────────────────────────

const GenericReportView = ({ report, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const totalPages = 1;

  // Mock filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReportData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData([]); // Show empty state for now until API is integrated
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchReportData();
  }, [page]);

  const handleExport = (type) => {
    toast.success(`Exporting ${report.title} as ${type}...`);
  };

  const renderFilters = () => {
    const commonFilters = [
      { label: 'From Date', type: 'date', value: fromDate, onChange: setFromDate },
      { label: 'To Date', type: 'date', value: toDate, onChange: setToDate },
      { label: 'Search', type: 'text', value: searchTerm, onChange: setSearchTerm, placeholder: 'Search...' }
    ];
    return <FilterSection filters={commonFilters} onApply={fetchReportData} onReset={() => { setFromDate(''); setToDate(''); setSearchTerm(''); }} />;
  };

  const renderSummaryCards = () => {
    if (report.id === 'collection') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Total Maintenance" value="₹0" colorClass="border-blue-100" />
          <SummaryCard title="Total Collected" value="₹0" colorClass="border-emerald-100" />
          <SummaryCard title="Total Outstanding" value="₹0" colorClass="border-red-100" />
          <SummaryCard title="Collection %" value="0%" colorClass="border-purple-100" />
        </div>
      );
    }
    if (report.id === 'income_expense') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SummaryCard title="Total Income" value="₹0" colorClass="border-emerald-100" />
          <SummaryCard title="Total Expense" value="₹0" colorClass="border-red-100" />
          <SummaryCard title="Net Balance" value="₹0" colorClass="border-blue-100" />
        </div>
      );
    }
    // Add other report summary skeletons as needed
    return null;
  };

  const renderTableHeaders = () => {
    const colMap = {
      collection: ['Flat No.', 'Resident Name', 'Billing Period', 'Bill Amount', 'Paid Amount', 'Outstanding Amount', 'Status', 'Date', 'Actions'],
      income_expense: ['Date', 'Description', 'Category', 'Transaction ID', 'Amount', 'Type', 'Actions'],
      defaulter: ['Flat No.', 'Resident Name', 'Contact', 'Outstanding', 'Cycles Overdue', 'Oldest Pending', 'Due Date', 'Status', 'Actions'],
      visitor: ['Photo', 'Visitor Name', 'Purpose', 'Flat No.', 'Status', 'Entry Time', 'Exit Time', 'Guard', 'Actions'],
      complaint: ['Ticket ID', 'Category', 'Resident/Flat', 'Assigned To', 'Status', 'Resolution Time', 'SLA', 'Actions'],
      amenity: ['Amenity Name', 'Booking Date', 'Time Slot', 'Resident Name', 'Flat No.', 'Status', 'Actions'],
      attendance: ['Staff Name', 'Role', 'Month', 'Working Days', 'Present', 'Absent', 'Attendance %', 'Actions'],
      vendor: ['Vendor Name', 'Category', 'Total Assigned', 'Completed', 'Pending', 'Completion %', 'Actions'],
      platform: ['Society Name', 'Total Residents', 'Active Users', 'Login Count', 'Module Activity', 'Last Activity', 'Actions'],
      festival: ['Resident Name', 'Flat No.', 'Contribution Amount', 'Paid Amount', 'Status', 'Payment Date', 'Receipt', 'Actions']
    };
    const cols = colMap[report.id] || ['ID', 'Date', 'Details', 'Actions'];
    return (
      <tr className="bg-gray-50/90 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
        {cols.map((col, i) => <th key={i} className="py-4 px-6">{col}</th>)}
      </tr>
    );
  };

  const Icon = report.icon;

  return (
    <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FaArrowLeft /> Back to Reports Hub
        </button>

        <div className="flex gap-2">
          <button onClick={() => handleExport('CSV')} className="p-2 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-bold">
            <FaFileCsv className="text-lg text-emerald-600" /> Export CSV
          </button>
          <button onClick={() => handleExport('Excel')} className="p-2 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-bold">
            <FaFileExcel className="text-lg text-emerald-600" /> Export Excel
          </button>
          <button onClick={() => handleExport('PDF')} className="p-2 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-bold">
            <FaFilePdf className="text-lg text-red-500" /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className={`p-6 sm:p-8 flex items-center gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${report.colorClass}`}>
            <Icon />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
            <p className="text-sm text-gray-600">{report.desc}</p>
          </div>
        </div>
      </div>

      {renderFilters()}
      {renderSummaryCards()}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500 font-medium">Loading report data...</p>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td colSpan={10} className="py-4 px-6 text-sm text-gray-700">Row data goes here</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaChartLine className="text-3xl text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold mb-1">No Data Available</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters or date range.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && data.length === 0 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>
    </div>
  );
};

// ── Main Reports Hub Component ────────────────────────────────────────────────

const ReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeReportId = searchParams.get('report');
  
  // Note: Replace with actual auth context/hook in production
  const roleKeys = JSON.parse(localStorage.getItem('roleKeys') || '["admin"]');

  const visibleReports = REPORTS_CONFIG.filter(report => 
    report.allowedRoles.some(role => roleKeys.includes(role)) || 
    roleKeys.includes('super_admin') || 
    roleKeys.includes('admin')
  );

  const activeReport = visibleReports.find(r => r.id === activeReportId);

  if (activeReport) {
    return <GenericReportView report={activeReport} onBack={() => setSearchParams({})} />;
  }

  return (
    <div className="animate-fade-in-up pb-8 max-w-7xl mx-auto">
      <div className="flex items-center text-sm mb-4">
        <span className="text-gray-500 font-medium">Reporting Analytics</span>
      </div>

      <div className="mb-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Reports & Analytics
          </h1>
          <p className="text-blue-100 text-sm max-w-2xl font-medium">
            Centralized hub for all society insights, financial statements, and operational performance metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleReports.map(report => {
          const Icon = report.icon;
          return (
            <div 
              key={report.id}
              onClick={() => {
                const basePath = location.pathname.split('/reports')[0];
                if (report.id === 'defaulter') {
                  navigate(`${basePath}/billing?submodule=fines-interests-arrears`);
                } else if (report.id === 'attendance') {
                  navigate(`${basePath}/staff`);
                } else if (report.id === 'collection' || report.id === 'income_expense') {
                  navigate(`${basePath}/billing?submodule=reports-compliance`);
                } else {
                  setSearchParams({ report: report.id });
                }
              }}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${report.colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon />
                </div>
                <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  View Report
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-500 flex-1">{report.desc}</p>
            </div>
          );
        })}
      </div>
      
      {visibleReports.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-3xl text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold mb-1">No Reports Available</p>
          <p className="text-sm text-gray-400">You do not have permission to view any reports.</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
