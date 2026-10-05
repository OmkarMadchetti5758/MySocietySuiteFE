import React, { useState } from 'react';
import { FaArrowLeft, FaFileInvoiceDollar, FaChartLine, FaFileAlt, FaBalanceScale, FaMoneyCheckAlt, FaBookOpen } from 'react-icons/fa';

import DuesReportPage from './DuesReportPage';
import CollectionsReportPage from './CollectionsReportPage';
import BalanceSheetPage from './BalanceSheetPage';
import ProfitLossPage from './ProfitLossPage';
import GstReportPage from './GstReportPage';
import TdsStatementPage from './TdsStatementPage';

const ReportCard = ({ title, description, icon: Icon, colorClass, onClick }) => (
  <div 
    onClick={onClick}
    className="block transition-transform transform hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full"
  >
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full flex flex-col items-start relative overflow-hidden group">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-inner mb-4 transition-transform group-hover:scale-110 ${colorClass}`}>
        <Icon className="text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed flex-grow">
        {description}
      </p>
      <div className="mt-4 text-sm font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
        View Report
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
);

const ReportsDashboard = ({ onNavigate }) => {
  return (
    <div className="p-2 max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Compliance</h1>
        <p className="text-gray-500 mt-2 text-sm">View real-time financial statements and export data for your society.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Dues & Ageing"
          description="View outstanding member dues categorized by ageing buckets. Reconciles with the Accounts Receivable ledger."
          icon={FaFileInvoiceDollar}
          colorClass="bg-gradient-to-br from-red-500 to-rose-600"
          onClick={() => onNavigate('DUES')}
        />
        <ReportCard
          title="Collections"
          description="Track member payments, receipts, and advance deposits. Reconciles with Bank & Cash ledgers."
          icon={FaMoneyCheckAlt}
          colorClass="bg-gradient-to-br from-emerald-500 to-green-600"
          onClick={() => onNavigate('COLLECTIONS')}
        />
        <ReportCard
          title="Balance Sheet"
          description="Real-time statement of assets, liabilities, and equity. Ensure your society's books are balanced."
          icon={FaBalanceScale}
          colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
          onClick={() => onNavigate('BALANCE_SHEET')}
        />
        <ReportCard
          title="Income & Expense"
          description="Profit & Loss statement showing income, expenses, and surplus/deficit for a selected period."
          icon={FaChartLine}
          colorClass="bg-gradient-to-br from-purple-500 to-fuchsia-600"
          onClick={() => onNavigate('PROFIT_LOSS')}
        />
        <ReportCard
          title="GST Report"
          description="Detailed breakdown of taxable value and GST collected/paid, split by CGST/SGST or IGST."
          icon={FaFileAlt}
          colorClass="bg-gradient-to-br from-orange-500 to-amber-600"
          onClick={() => onNavigate('GST')}
        />
        <ReportCard
          title="TDS Statement"
          description="View TDS deducted on vendor payments with masked PANs. Export for filing returns."
          icon={FaBookOpen}
          colorClass="bg-gradient-to-br from-cyan-500 to-teal-600"
          onClick={() => onNavigate('TDS')}
        />
      </div>
    </div>
  );
};

const ReportsComplianceContainer = ({ onBack }) => {
  const [activeReport, setActiveReport] = useState(null); // null means dashboard

  const renderContent = () => {
    switch (activeReport) {
      case 'DUES': return <DuesReportPage />;
      case 'COLLECTIONS': return <CollectionsReportPage />;
      case 'BALANCE_SHEET': return <BalanceSheetPage />;
      case 'PROFIT_LOSS': return <ProfitLossPage />;
      case 'GST': return <GstReportPage />;
      case 'TDS': return <TdsStatementPage />;
      default: return <ReportsDashboard onNavigate={setActiveReport} />;
    }
  };

  return (
    <div className="pb-12">
      <div className="flex items-center px-4 sm:px-6 pt-4 mb-2">
        <button
          onClick={() => activeReport ? setActiveReport(null) : onBack()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
        >
          <FaArrowLeft /> {activeReport ? 'Back to Reports Hub' : 'Back to Billing Hub'}
        </button>
      </div>
      <div className="px-4 sm:px-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsComplianceContainer;
