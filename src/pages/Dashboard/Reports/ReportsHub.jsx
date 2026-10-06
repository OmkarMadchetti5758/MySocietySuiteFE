import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { FaFileInvoiceDollar, FaChartLine, FaFileAlt, FaBalanceScale, FaMoneyCheckAlt, FaBookOpen } from 'react-icons/fa';

import DuesReportPage from './DuesReportPage';
import CollectionsReportPage from './CollectionsReportPage';
import BalanceSheetPage from './BalanceSheetPage';
import ProfitLossPage from './ProfitLossPage';
import GstReportPage from './GstReportPage';
import TdsStatementPage from './TdsStatementPage';

const ReportCard = ({ title, description, icon: Icon, path, colorClass }) => (
  <Link to={path} className="block transition-transform transform hover:-translate-y-1 hover:shadow-lg">
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
  </Link>
);

const ReportsDashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Reports</h1>
        <p className="text-gray-500 mt-2">View real-time financial statements and export data for your society.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Dues & Ageing"
          description="View outstanding member dues categorized by ageing buckets. Reconciles with the Accounts Receivable ledger."
          icon={FaFileInvoiceDollar}
          path="dues"
          colorClass="bg-gradient-to-br from-red-500 to-rose-600"
        />
        <ReportCard
          title="Collections"
          description="Track member payments, receipts, and advance deposits. Reconciles with Bank & Cash ledgers."
          icon={FaMoneyCheckAlt}
          path="collections"
          colorClass="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <ReportCard
          title="Balance Sheet"
          description="Real-time statement of assets, liabilities, and equity. Ensure your society's books are balanced."
          icon={FaBalanceScale}
          path="balance-sheet"
          colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <ReportCard
          title="Income & Expense"
          description="Profit & Loss statement showing income, expenses, and surplus/deficit for a selected period."
          icon={FaChartLine}
          path="profit-loss"
          colorClass="bg-gradient-to-br from-purple-500 to-fuchsia-600"
        />
        <ReportCard
          title="GST Report"
          description="Detailed breakdown of taxable value and GST collected/paid, split by CGST/SGST or IGST."
          icon={FaFileAlt}
          path="gst"
          colorClass="bg-gradient-to-br from-orange-500 to-amber-600"
        />
        <ReportCard
          title="TDS Statement"
          description="View TDS deducted on vendor payments with masked PANs. Export for filing returns."
          icon={FaBookOpen}
          path="tds"
          colorClass="bg-gradient-to-br from-cyan-500 to-teal-600"
        />
      </div>
    </div>
  );
};

const ReportsHub = () => {
  return (
    <Routes>
      <Route path="/" element={<ReportsDashboard />} />
      <Route path="dues" element={<DuesReportPage />} />
      <Route path="collections" element={<CollectionsReportPage />} />
      <Route path="balance-sheet" element={<BalanceSheetPage />} />
      <Route path="profit-loss" element={<ProfitLossPage />} />
      <Route path="gst" element={<GstReportPage />} />
      <Route path="tds" element={<TdsStatementPage />} />
    </Routes>
  );
};

export default ReportsHub;
