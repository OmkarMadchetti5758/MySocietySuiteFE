import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaMoneyCheckAlt, FaFileInvoiceDollar, FaRegCreditCard,
  FaGift, FaTools, FaCalendarCheck, FaUsers, FaStore, FaUserTie,
  FaArrowRight, FaChartLine, FaExclamationCircle, FaArrowLeft, FaSearch, FaFilter,
  FaCog, FaShieldAlt, FaPercent, FaUniversity, FaBook, FaCalculator, FaFileAlt, FaHistory,
  FaPlus, FaCheck, FaTimes, FaEdit, FaTrash, FaSpinner
} from 'react-icons/fa';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import InvoicesPage from './InvoicesPage';

const SUBMODULE_CONFIG = [
  {
    id: 'invoice_billing_generation',
    slug: 'invoice-billing-generation',
    title: 'Invoice/billing generation',
    desc: 'Generate, issue and manage monthly society invoices and maintenance bills.',
    icon: FaFileInvoiceDollar,
    colorClass: 'bg-blue-100 text-blue-600',
    stats: { label: 'Invoices Issued', value: '412', trend: '+5%' },
    columns: ['Invoice ID', 'Flat / Member', 'Billing Cycle', 'Amount', 'Status'],
    sampleRows: [
      { id: 'INV-2026-001', col1: 'Flat A-101 (R. Sharma)', col2: 'Sept 2026', col3: '₹4,500', status: 'Paid' },
      { id: 'INV-2026-002', col1: 'Flat A-102 (A. Verma)', col2: 'Sept 2026', col3: '₹4,500', status: 'Pending' },
      { id: 'INV-2026-003', col1: 'Flat B-204 (S. Patel)', col2: 'Sept 2026', col3: '₹5,200', status: 'Paid' },
      { id: 'INV-2026-004', col1: 'Flat C-301 (M. Gupta)', col2: 'Sept 2026', col3: '₹4,800', status: 'Overdue' },
    ]
  },
  {
    id: 'billing_config_charge_head',
    slug: 'billing-config-charge-head',
    title: 'Billing config and charge head',
    desc: 'Setup and manage charge heads, per-sq-ft calculations, taxes and fixed fees.',
    icon: FaCog,
    colorClass: 'bg-purple-100 text-purple-600',
    stats: { label: 'Active Charge Heads', value: '8' },
    columns: ['Charge Head ID', 'Head Name', 'Calculation Type', 'Rate / Amount', 'Status'],
    sampleRows: []
  },
  {
    id: 'fines_interests_arrears',
    slug: 'fines-interests-arrears',
    title: 'Fines, Interests, Arrears',
    desc: 'Configure late payment interest rules, penalty charges, and outstanding dues.',
    icon: FaExclamationCircle,
    colorClass: 'bg-red-100 text-red-600',
    stats: { label: 'Total Arrears', value: '₹1,12,000', trend: '-8%' },
    columns: ['Record ID', 'Member / Flat', 'Overdue Period', 'Interest / Fine', 'Total Arrears', 'Status'],
    sampleRows: [
      { id: 'ARR-101', col1: 'Flat B-402 (K. Mehta)', col2: '60+ Days', col3: '₹450 (18% p.a.)', col4: '₹14,450', status: 'Overdue' },
      { id: 'ARR-102', col1: 'Flat A-203 (V. Singh)', col2: '30 Days', col3: '₹150 (Late Fee)', col4: '₹5,150', status: 'Pending' },
      { id: 'ARR-103', col1: 'Flat D-104 (P. Nair)', col2: '90+ Days', col3: '₹1,200 (Legal Notice)', col4: '₹28,200', status: 'Escalated' },
    ]
  },
  {
    id: 'payments_collection',
    slug: 'payments-collection',
    title: 'Payments and collection',
    desc: 'Monitor incoming payments, UPI transactions, cheques, and payment receipts.',
    icon: FaMoneyCheckAlt,
    colorClass: 'bg-emerald-100 text-emerald-600',
    stats: { label: 'Collected This Month', value: '₹4,52,000', trend: '+14%' },
    columns: ['Payment Ref', 'Payer / Flat', 'Payment Mode', 'Date Received', 'Amount', 'Status'],
    sampleRows: [
      { id: 'PAY-8821', col1: 'Flat A-101 (R. Sharma)', col2: 'UPI (Razorpay)', col3: '2026-09-02', col4: '₹4,500', status: 'Successful' },
      { id: 'PAY-8822', col1: 'Flat B-204 (S. Patel)', col2: 'Net Banking', col3: '2026-09-03', col4: '₹5,200', status: 'Successful' },
      { id: 'PAY-8823', col1: 'Flat C-102 (D. Shah)', col2: 'Cheque (#40192)', col3: '2026-09-04', col4: '₹4,500', status: 'Pending Clearance' },
    ]
  },
  {
    id: 'advance_accounts_deposits',
    slug: 'advance-accounts-deposits',
    title: 'Advance accounts and security deposists',
    desc: 'Manage resident advance payment accounts, tenant deposits, and security funds.',
    icon: FaShieldAlt,
    colorClass: 'bg-indigo-100 text-indigo-600',
    stats: { label: 'Total Held Deposits', value: '₹6,40,000' },
    columns: ['Deposit ID', 'Resident / Flat', 'Deposit Category', 'Amount Held', 'Date Received', 'Status'],
    sampleRows: [
      { id: 'DEP-041', col1: 'Flat A-302 (Tenant - K. Sen)', col2: 'Move-in Security', col3: '₹25,000', col4: '2026-01-15', status: 'Held' },
      { id: 'DEP-042', col1: 'Flat B-101 (Owner - R. Rao)', col2: 'Maintenance Advance', col3: '₹12,000', col4: '2026-04-01', status: 'Active' },
      { id: 'DEP-043', col1: 'Flat C-504 (Vendor - Security)', col2: 'EMD Security Deposit', col3: '₹50,000', col4: '2025-11-20', status: 'Held' },
    ]
  },
  {
    id: 'credit_notes_discount',
    slug: 'credit-notes-discount',
    title: 'Credit notes and discount',
    desc: 'Process bill adjustments, early payment discounts, waivers, and credit notes.',
    icon: FaPercent,
    colorClass: 'bg-amber-100 text-amber-600',
    stats: { label: 'Discounts Issued', value: '₹18,500' },
    columns: ['Note ID', 'Recipient / Flat', 'Adjustment Reason', 'Discount / Credit Amount', 'Approved By', 'Status'],
    sampleRows: [
      { id: 'CN-109', col1: 'Flat B-301 (A. Deshmukh)', col2: 'Early Payment Discount (5%)', col3: '₹225', col4: 'Admin (System)', status: 'Applied' },
      { id: 'CN-110', col1: 'Flat A-404 (G. Joshi)', col2: 'Water Charge Waiver (Meter Issue)', col3: '₹1,500', col4: 'Treasurer', status: 'Approved' },
    ]
  },
  {
    id: 'bank_cash_reconciliation',
    slug: 'bank-cash-reconciliation',
    title: 'Bank and cash reconciliation',
    desc: 'Reconcile bank statements, cash in hand, bank charges, and uncleared instruments.',
    icon: FaUniversity,
    colorClass: 'bg-teal-100 text-teal-600',
    stats: { label: 'Reconciled Balance', value: '₹18,45,200', trend: 'Balanced' },
    columns: ['Reconcile ID', 'Bank Account / Book', 'Statement Date', 'Closing Balance', 'Variance', 'Status'],
    sampleRows: [
      { id: 'REC-09', col1: 'HDFC Main Operating A/c', col2: '2026-08-31', col3: '₹14,20,500', col4: '₹0.00', status: 'Reconciled' },
      { id: 'REC-10', col1: 'SBI Sinking Fund A/c', col2: '2026-08-31', col3: '₹4,12,000', col4: '₹0.00', status: 'Reconciled' },
      { id: 'REC-11', col1: 'Petty Cash Book', col2: '2026-09-05', col3: '₹12,700', col4: '₹0.00', status: 'Reconciled' },
    ]
  },
  {
    id: 'ledger_management',
    slug: 'ledger-management',
    title: 'Ledger management',
    desc: 'Double-entry general ledger, chart of accounts, journal entries, and account balances.',
    icon: FaBook,
    colorClass: 'bg-cyan-100 text-cyan-600',
    stats: { label: 'Active Ledger Accounts', value: '34' },
    columns: ['Account Code', 'Account Title', 'Type', 'Debit (YTD)', 'Credit (YTD)', 'Net Balance'],
    sampleRows: [
      { id: 'ACC-1001', col1: 'Society Maintenance Revenue', col2: 'Income', col3: '₹0.00', col4: '₹38,40,000', status: 'Cr ₹38,40,000' },
      { id: 'ACC-2001', col1: 'Electricity & Water Expense', col2: 'Expense', col3: '₹8,20,000', col4: '₹0.00', status: 'Dr ₹8,20,000' },
      { id: 'ACC-3001', col1: 'HDFC Operating Bank Account', col2: 'Asset', col3: '₹22,10,000', col4: '₹7,89,500', status: 'Dr ₹14,20,500' },
    ]
  },
  {
    id: 'vendor_payments',
    slug: 'vendor-payments',
    title: 'Vendor payments',
    desc: 'Manage vendor invoices, purchase orders, contractor payments, and TDS deductions.',
    icon: FaStore,
    colorClass: 'bg-orange-100 text-orange-600',
    stats: { label: 'Paid This Month', value: '₹1,85,000' },
    columns: ['Voucher ID', 'Vendor Name', 'Service Description', 'Bill Amount', 'TDS Deduction', 'Payment Status'],
    sampleRows: [
      { id: 'VNP-301', col1: 'Apex Security Services', col2: 'Aug 2026 Security Guards Payout', col3: '₹85,000', col4: '₹1,700 (2%)', status: 'Paid' },
      { id: 'VNP-302', col1: 'CleanTech Facility Mgt', col2: 'Aug 2026 Housekeeping Staff', col3: '₹45,000', col4: '₹900 (2%)', status: 'Paid' },
      { id: 'VNP-303', col1: 'KONE Elevator Maintenance', col2: 'Q3 AMC Charges', col3: '₹35,000', col4: '₹700 (2%)', status: 'Pending Approval' },
    ]
  },
  {
    id: 'budgeting',
    slug: 'budgeting',
    title: 'Budgeting',
    desc: 'Annual financial budget allocation, department expense limits, and variance analysis.',
    icon: FaCalculator,
    colorClass: 'bg-lime-100 text-lime-600',
    stats: { label: 'FY 2026-27 Budget', value: '₹45,00,000' },
    columns: ['Budget Head', 'Annual Allocation', 'Spent (YTD)', 'Remaining', 'Utilization %'],
    sampleRows: [
      { id: 'BUD-01', col1: 'Security & Housekeeping', col2: '₹18,00,000', col3: '₹7,80,000', col4: '₹10,20,000', status: '43.3%' },
      { id: 'BUD-02', col1: 'Repairs & Capital Works', col2: '₹12,00,000', col3: '₹4,50,000', col4: '₹7,50,000', status: '37.5%' },
      { id: 'BUD-03', col1: 'Utilities (Power/Water)', col2: '₹10,00,000', col3: '₹4,90,000', col4: '₹5,10,000', status: '49.0%' },
    ]
  },
  {
    id: 'reports_compliance',
    slug: 'reports-compliance',
    title: 'Reports and compliance',
    desc: 'Audit reports, GST returns, income-expenditure statements, and balance sheets.',
    icon: FaFileAlt,
    colorClass: 'bg-violet-100 text-violet-600',
    stats: { label: 'Compliances Filed', value: '100% Compliant' },
    columns: ['Report Code', 'Report Name', 'Period', 'Filing Type', 'Generated Date', 'Status'],
    sampleRows: [
      { id: 'REP-GST3B', col1: 'GST 3B Monthly Return', col2: 'Aug 2026', col3: 'Statutory Filing', col4: '2026-09-05', status: 'Filed' },
      { id: 'REP-BS2026', col1: 'Audited Balance Sheet', col2: 'FY 2025-26', col3: 'Statutory Audit', col4: '2026-07-30', status: 'Approved' },
      { id: 'REP-IE2026', col1: 'Income & Expenditure Stmt', col2: 'Aug 2026', col3: 'Internal Audit', col4: '2026-09-01', status: 'Ready' },
    ]
  },
  {
    id: 'audit_trail',
    slug: 'audit-trail',
    title: 'Audit trail',
    desc: 'Detailed log of all financial modifications, rate edits, waivers, and system actions.',
    icon: FaHistory,
    colorClass: 'bg-rose-100 text-rose-600',
    stats: { label: 'Logged Audit Events', value: '1,420 events' },
    columns: ['Event ID', 'Timestamp', 'User Name', 'Action Executed', 'Module / Target', 'Details / Status'],
    sampleRows: [
      { id: 'LOG-9941', col1: '2026-09-09 14:22', col2: 'Rahul (Admin)', col3: 'Modified Charge Head Rate', col4: 'Billing Config', status: 'Maint rate updated to 3.50/sqft' },
      { id: 'LOG-9942', col1: '2026-09-09 11:15', col2: 'Sunil (Treasurer)', col3: 'Approved Credit Note', col4: 'Credit Notes', status: 'CN-110 approved for Flat A-404' },
      { id: 'LOG-9943', col1: '2026-09-08 16:40', col2: 'System Bot', col3: 'Auto-generated Monthly Bills', col4: 'Invoice Gen', status: '412 invoices created for Sept 2026' },
    ]
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED':
    case 'Paid':
    case 'Successful':
    case 'Active':
    case 'Reconciled':
    case 'Filed':
    case 'Approved':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'PENDING_APPROVAL':
    case 'Pending':
    case 'Pending Clearance':
    case 'Pending Approval':
    case 'DRAFT':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'REJECTED':
    case 'Overdue':
    case 'Failed':
      return 'bg-red-50 text-red-600 border-red-100';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const SectionCard = ({ title, icon: IconComponent, colorClass, desc, stats, onClick }) => (
  <div
    onClick={onClick}
    className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col justify-between"
  >
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5 ${colorClass.split(' ')[0]} transition-transform group-hover:scale-150 duration-500`}></div>
    <div>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${colorClass}`}>
          <IconComponent />
        </div>
        <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors">
          <FaArrowRight className="transform -rotate-45 group-hover:rotate-0 transition-all duration-300" />
        </button>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors leading-snug">{title}</h3>
      <p className="text-xs text-gray-500 mb-6 line-clamp-2">{desc}</p>
    </div>
    {stats && (
      <div className="pt-4 border-t border-gray-100/60 flex justify-between items-end mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{stats.label}</span>
          <span className="text-lg font-black text-gray-900">{stats.value}</span>
        </div>
      </div>
    )}
  </div>
);

const BillingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubmoduleSlug = searchParams.get('submodule');

  // ── Role-based visibility ────────────────────────────────────────────────────
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const roleKeys = currentUser.roleKeys || [];
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin' || roleKeys.includes('admin');
  const isAccountant = roleKeys.includes('accountant');
  const isResident = currentUser.role === 'resident_owner' || roleKeys.includes('resident_owner') || (!isAdmin && !isAccountant);

  const RESIDENT_ALLOWED_IDS = ['invoice_billing_generation', 'fines_interests_arrears', 'payments_collection', 'advance_accounts_deposits'];
  const visibleSubmodules = isResident
    ? SUBMODULE_CONFIG.filter(mod => RESIDENT_ALLOWED_IDS.includes(mod.id))
    : SUBMODULE_CONFIG;

  const [selectedModule, setSelectedModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Charge Head & Billing Config State ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState('charge_heads'); // 'charge_heads' | 'society_config'
  const [chargeHeads, setChargeHeads] = useState([]);
  const [loadingHeads, setLoadingHeads] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Billing Config Form State
  const [billingConfig, setBillingConfig] = useState({
    billingFrequency: 'MONTHLY',
    billingDay: 1,
    dueDays: 10,
    arrearsDisplayMode: 'SINGLE_TOTAL',
    defaultTaxSettings: { taxName: 'GST', taxRate: 18 }
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Charge Head Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'INCOME',
    calculationType: 'FIXED',
    defaultAmount: '',
    ratePerSqFt: '',
    gstApplicable: false,
    gstRate: '18',
    residentTypesOwner: true,
    residentTypesTenant: true,
    allBlocks: true,
    ledgerAccountId: ''
  });
  const [submittingForm, setSubmittingForm] = useState(false);

  // Reject Modal State
  const [rejectingHeadId, setRejectingHeadId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    if (activeSubmoduleSlug) {
      const matched = SUBMODULE_CONFIG.find(m => m.slug === activeSubmoduleSlug);
      if (matched) {
        if (isResident && !RESIDENT_ALLOWED_IDS.includes(matched.id)) {
          setSelectedModule(null);
          setSearchParams({});
        } else {
          setSelectedModule(matched);
        }
      }
    } else {
      setSelectedModule(null);
    }
  }, [activeSubmoduleSlug, isResident, setSearchParams]);

  const handleSelectModule = (slug) => {
    setSearchParams({ submodule: slug });
  };

  const handleBackToHub = () => {
    setSearchParams({});
    setSearchTerm('');
  };

  // Fetch Charge Heads
  const fetchChargeHeads = async () => {
    setLoadingHeads(true);
    try {
      const res = await apiClient.get('/billing/charge-heads');
      if (res.data?.status === 'success') {
        setChargeHeads(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch charge heads:', err);
      toast.error(err.response?.data?.message || 'Failed to load charge heads');
    } finally {
      setLoadingHeads(false);
    }
  };

  // Fetch Billing Configuration
  const fetchBillingConfig = async () => {
    try {
      const res = await apiClient.get('/billing/billing-config');
      if (res.data?.status === 'success' && res.data.data) {
        setBillingConfig(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch billing config:', err);
    }
  };

  useEffect(() => {
    if (selectedModule?.id === 'billing_config_charge_head') {
      fetchChargeHeads();
      fetchBillingConfig();
    }
  }, [selectedModule]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingHead(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'INCOME',
      calculationType: 'FIXED',
      defaultAmount: '',
      ratePerSqFt: '',
      gstApplicable: false,
      gstRate: '18',
      residentTypesOwner: true,
      residentTypesTenant: true,
      allBlocks: true,
      ledgerAccountId: ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (head) => {
    setEditingHead(head);
    setFormData({
      name: head.name || head.title || '',
      code: head.code || '',
      description: head.description || '',
      category: head.category || 'INCOME',
      calculationType: head.calculationType || 'FIXED',
      defaultAmount: head.defaultAmount || (head.calculationType === 'FIXED' ? head.rate : '') || '',
      ratePerSqFt: head.ratePerSqFt || (head.calculationType === 'PER_SQ_FT' ? head.rate : '') || '',
      gstApplicable: Boolean(head.gstApplicable),
      gstRate: head.gstRate ? String(head.gstRate) : '18',
      residentTypesOwner: head.applicability?.residentTypes ? head.applicability.residentTypes.includes('OWNER') : true,
      residentTypesTenant: head.applicability?.residentTypes ? head.applicability.residentTypes.includes('TENANT') : true,
      allBlocks: head.applicability?.allBlocks !== undefined ? Boolean(head.applicability.allBlocks) : true,
      ledgerAccountId: head.ledgerAccountId || ''
    });
    setIsModalOpen(true);
  };

  // Submit Form (Create / Edit)
  const handleSubmitChargeHead = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Charge head name is required');

    setSubmittingForm(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description,
        category: formData.category,
        calculationType: formData.calculationType,
        defaultAmount: formData.calculationType === 'FIXED' ? Number(formData.defaultAmount) : undefined,
        ratePerSqFt: formData.calculationType === 'PER_SQ_FT' ? Number(formData.ratePerSqFt) : undefined,
        gstApplicable: formData.gstApplicable,
        gstRate: formData.gstApplicable ? Number(formData.gstRate) : null,
        applicability: {
          residentTypes: [
            ...(formData.residentTypesOwner ? ['OWNER'] : []),
            ...(formData.residentTypesTenant ? ['TENANT'] : []),
          ],
          allBlocks: formData.allBlocks,
        },
        ledgerAccountId: formData.ledgerAccountId || null,
      };

      if (editingHead) {
        await apiClient.patch(`/billing/charge-heads/${editingHead._id}`, payload);
        toast.success('Charge head updated successfully (Pending Approval)');
      } else {
        await apiClient.post('/billing/charge-heads', payload);
        toast.success('Charge head created successfully (Pending Approval)');
      }

      setIsModalOpen(false);
      fetchChargeHeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save charge head');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Approve Charge Head
  const handleApprove = async (id) => {
    try {
      await apiClient.post(`/billing/charge-heads/${id}/approve`, { action: 'approve' });
      toast.success('Charge head approved successfully!');
      fetchChargeHeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve charge head');
    }
  };

  // Reject Charge Head
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return toast.error('Rejection reason is required');

    setSubmittingReject(true);
    try {
      await apiClient.post(`/billing/charge-heads/${rejectingHeadId}/reject`, { rejectionReason: rejectionReason.trim() });
      toast.success('Charge head rejected');
      setRejectingHeadId(null);
      setRejectionReason('');
      fetchChargeHeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject charge head');
    } finally {
      setSubmittingReject(false);
    }
  };

  // Delete / Archive Charge Head
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this charge head?')) return;
    try {
      const res = await apiClient.delete(`/billing/charge-heads/${id}`);
      toast.success(res.data?.message || 'Deleted successfully');
      fetchChargeHeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete charge head');
    }
  };

  // Save Billing Configuration
  const handleSaveBillingConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await apiClient.post('/billing/billing-config', billingConfig);
      toast.success('Society Billing Configuration saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save billing configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  // Filter Charge Heads for display
  const filteredChargeHeads = chargeHeads.filter(ch => {
    if (categoryFilter !== 'ALL' && (ch.category || 'INCOME') !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && ch.status !== statusFilter) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const nameMatch = (ch.name || ch.title || '').toLowerCase().includes(query);
      const codeMatch = (ch.code || '').toLowerCase().includes(query);
      if (!nameMatch && !codeMatch) return false;
    }
    return true;
  });

  // Render Submodule Content
  if (selectedModule) {
    const Icon = selectedModule.icon;

    // ── Invoice / Bill Generation ────────────────────────────────────────────
    if (selectedModule.id === 'invoice_billing_generation') {
      return (
        <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToHub}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
            >
              <FaArrowLeft /> Back to Billing Hub
            </button>
          </div>
          <InvoicesPage />
        </div>
      );
    }

    if (selectedModule.id === 'billing_config_charge_head') {
      return (
        <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto">
          {/* Top Bar Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={handleBackToHub}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors w-fit"
            >
              <FaArrowLeft /> Back to Billing Hub
            </button>
            <div className="flex bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200">
              <button
                onClick={() => setActiveTab('charge_heads')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'charge_heads' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Charge Heads Management
              </button>
              <button
                onClick={() => setActiveTab('society_config')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'society_config' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Society Billing Configuration
              </button>
            </div>
          </div>

          {/* TAB 1: CHARGE HEADS MANAGEMENT */}
          {activeTab === 'charge_heads' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 bg-purple-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-purple-100 text-purple-600 shrink-0">
                    <FaCog />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Charge Head Management</h2>
                    <p className="text-xs text-gray-600">Configure Income & Expense billable heads, GST rates, per sq.ft vs fixed amounts.</p>
                  </div>
                </div>
                {!isAdmin && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
                  >
                    <FaPlus /> Create Charge Head
                  </button>
                )}
              </div>

              {/* Filters & Search Bar */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search charge head..."
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                      <th className="py-4 px-6">Code & Name</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Calculation & Rate</th>
                      <th className="py-4 px-6">GST</th>
                      <th className="py-4 px-6">Applicability</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHeads ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-orange-500" />
                          Loading charge heads...
                        </td>
                      </tr>
                    ) : filteredChargeHeads.length > 0 ? (
                      filteredChargeHeads.map((head) => (
                        <tr key={head._id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors text-sm">
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">{head.name || head.title}</div>
                            <div className="text-xs font-mono text-gray-400">{head.code || 'CH-AUTO'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${head.category === 'EXPENSE' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {head.category || 'INCOME'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-700 font-medium">
                            {head.calculationType === 'PER_SQ_FT' ? (
                              <span>₹{head.ratePerSqFt || head.rate || 0} / sq.ft</span>
                            ) : (
                              <span>₹{head.defaultAmount || head.rate || 0} / flat</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {head.gstApplicable ? (
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">GST {head.gstRate}%</span>
                            ) : (
                              <span className="text-xs text-gray-400">Exempt</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-600">
                            {head.applicability?.allBlocks ? 'All Blocks' : 'Selected Blocks'}
                            <span className="text-gray-400 font-normal"> ({head.applicability?.residentTypes?.join(', ') || 'Owner, Tenant'})</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(head.status)}`}>
                              {head.status}
                            </span>
                            {head.rejectionReason && (
                              <div className="text-[10px] text-red-500 mt-1 max-w-xs truncate" title={head.rejectionReason}>
                                Reason: {head.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {head.status === 'PENDING_APPROVAL' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(head._id)}
                                    title="Approve"
                                    className="p-1.5 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-bold flex items-center gap-1"
                                  >
                                    <FaCheck /> Approve
                                  </button>
                                  <button
                                    onClick={() => setRejectingHeadId(head._id)}
                                    title="Reject"
                                    className="p-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold flex items-center gap-1"
                                  >
                                    <FaTimes /> Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleOpenEditModal(head)}
                                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(head._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                          No charge heads found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIETY BILLING CONFIGURATION */}
          {activeTab === 'society_config' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-4xl mx-auto">
              <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Society Billing & Invoicing Rules</h2>
                  <p className="text-xs text-gray-500">Configure global billing cycle frequency, due date calculation, and invoice display format.</p>
                </div>
              </div>

              <form onSubmit={handleSaveBillingConfig} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Billing Frequency */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Billing Cycle Frequency</label>
                    <select
                      value={billingConfig.billingFrequency}
                      onChange={e => setBillingConfig({ ...billingConfig, billingFrequency: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                    >
                      <option value="MONTHLY">Monthly Billing Cycle</option>
                      <option value="QUARTERLY">Quarterly Billing Cycle</option>
                    </select>
                  </div>

                  {/* Billing Generation Day */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Invoice Generation Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      value={billingConfig.billingDay}
                      onChange={e => setBillingConfig({ ...billingConfig, billingDay: Number(e.target.value) })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                    />
                    <span className="text-[11px] text-gray-400">Day of the month when recurring invoices are issued (1 - 28)</span>
                  </div>

                  {/* Payment Due Days */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Payment Grace Days (Due Date)</label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={billingConfig.dueDays}
                      onChange={e => setBillingConfig({ ...billingConfig, dueDays: Number(e.target.value) })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                    />
                    <span className="text-[11px] text-gray-400">Number of days after invoice issue date before bill becomes overdue</span>
                  </div>

                  {/* Default GST Rate */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Default GST Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="28"
                      value={billingConfig.defaultTaxSettings?.taxRate || 18}
                      onChange={e => setBillingConfig({
                        ...billingConfig,
                        defaultTaxSettings: { ...billingConfig.defaultTaxSettings, taxRate: Number(e.target.value) }
                      })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                    />
                    <span className="text-[11px] text-gray-400">Default GST rate applied to taxable charge heads</span>
                  </div>
                </div>

                {/* Arrears Display Preference */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Arrears Display Mode on Resident Invoice</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${billingConfig.arrearsDisplayMode === 'SINGLE_TOTAL' ? 'border-orange-500 bg-orange-50/20 shadow-sm' : 'border-gray-200 bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="arrearsDisplayMode"
                        value="SINGLE_TOTAL"
                        checked={billingConfig.arrearsDisplayMode === 'SINGLE_TOTAL'}
                        onChange={e => setBillingConfig({ ...billingConfig, arrearsDisplayMode: e.target.value })}
                        className="mt-1 accent-orange-500"
                      />
                      <div>
                        <div className="font-bold text-sm text-gray-900">Single Carried-Forward Total</div>
                        <div className="text-xs text-gray-500 mt-1">Displays past outstanding balance as a single total line item on invoice.</div>
                      </div>
                    </label>

                    <label className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${billingConfig.arrearsDisplayMode === 'LINE_BY_LINE' ? 'border-orange-500 bg-orange-50/20 shadow-sm' : 'border-gray-200 bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="arrearsDisplayMode"
                        value="LINE_BY_LINE"
                        checked={billingConfig.arrearsDisplayMode === 'LINE_BY_LINE'}
                        onChange={e => setBillingConfig({ ...billingConfig, arrearsDisplayMode: e.target.value })}
                        className="mt-1 accent-orange-500"
                      />
                      <div>
                        <div className="font-bold text-sm text-gray-900">Line-by-Line Itemized Arrears</div>
                        <div className="text-xs text-gray-500 mt-1">Displays individual itemized unpaid charges per historical month.</div>
                      </div>
                    </label>
                  </div>
                </div>

                {!isAdmin && (
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
                    >
                      {savingConfig ? 'Saving Settings...' : 'Save Billing Configuration'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* CREATE / EDIT CHARGE HEAD MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-gray-100 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingHead ? 'Edit Charge Head' : 'Create New Charge Head'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmitChargeHead} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Head Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Maintenance Charge"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Code (Unique)</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. MAINT"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category *</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
                      >
                        <option value="INCOME">Income (Billable)</option>
                        <option value="EXPENSE">Expense (Payable)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Calculation Type *</label>
                      <select
                        value={formData.calculationType}
                        onChange={e => setFormData({ ...formData, calculationType: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
                      >
                        <option value="FIXED">FIXED (Flat Amount)</option>
                        <option value="PER_SQ_FT">PER_SQ_FT (Area Rate)</option>
                      </select>
                    </div>
                  </div>

                  {formData.calculationType === 'FIXED' ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fixed Amount (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.defaultAmount}
                        onChange={e => setFormData({ ...formData, defaultAmount: e.target.value })}
                        placeholder="e.g. 2500"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rate Per Sq. Ft. (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.ratePerSqFt}
                        onChange={e => setFormData({ ...formData, ratePerSqFt: e.target.value })}
                        placeholder="e.g. 3.50"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}

                  {/* GST Options */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-900">GST Applicable</div>
                      <div className="text-[11px] text-gray-500">Calculate GST on this charge item</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.gstApplicable}
                      onChange={e => setFormData({ ...formData, gstApplicable: e.target.checked })}
                      className="w-5 h-5 accent-orange-500 cursor-pointer"
                    />
                  </div>

                  {formData.gstApplicable && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">GST Rate (%) *</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        required
                        value={formData.gstRate}
                        onChange={e => setFormData({ ...formData, gstRate: e.target.value })}
                        placeholder="18"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}

                  <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingForm}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {submittingForm ? 'Saving...' : 'Submit for Approval'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* REJECT REASON MODAL */}
          {rejectingHeadId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fade-in-up">
                <h3 className="text-base font-bold text-gray-900 mb-2">Reject Charge Head Configuration</h3>
                <p className="text-xs text-gray-500 mb-4">Please specify a mandatory reason for rejecting this charge head submission.</p>

                <form onSubmit={handleRejectSubmit}>
                  <textarea
                    required
                    rows="3"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setRejectingHeadId(null); setRejectionReason(''); }}
                      className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReject}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                    >
                      {submittingReject ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default Generic View for other submodules
    const sampleRows = selectedModule.sampleRows || [];
    const filteredRows = sampleRows.filter(row => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        row.id.toLowerCase().includes(query) ||
        row.col1.toLowerCase().includes(query) ||
        row.col2.toLowerCase().includes(query) ||
        (row.col3 && row.col3.toLowerCase().includes(query))
      );
    });

    return (
      <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={handleBackToHub}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
          >
            <FaArrowLeft /> Back to Billing Hub
          </button>

          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${selectedModule.title}...`}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 ${selectedModule.colorClass.split(' ')[0]} bg-opacity-20`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${selectedModule.colorClass} shrink-0`}>
                <Icon />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedModule.title}</h2>
                <p className="text-sm text-gray-600">{selectedModule.desc}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                  {selectedModule.columns.map((col, idx) => (
                    <th key={idx} className="py-4 px-6 font-semibold text-xs uppercase tracking-wider">{col}</th>
                  ))}
                  <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors group">
                      <td className="py-4 px-6 text-sm font-bold text-gray-900">{row.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{row.col1}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{row.col2}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{row.col3 || row.status}</td>
                      {row.col4 && <td className="py-4 px-6 text-sm text-gray-600">{row.col4}</td>}
                      <td className="py-4 px-6 text-sm">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-orange-500 text-xs font-semibold hover:underline">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedModule.columns.length + 1} className="py-8 text-center text-gray-500 text-sm">
                      No records found for "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-8 max-w-7xl mx-auto">
      <div className="flex items-center text-sm mb-4">
        <span className="text-gray-500 font-medium">Billing & Accounts</span>
      </div>

      <div className="mb-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Billing & Accounts Hub
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl">
              Comprehensive financial management module for society billing, collections, ledgers, reconciliations, vendor payouts, and compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Billing &amp; Accounting Sub-Modules ({visibleSubmodules.length})</h2>
          <span className="text-xs text-gray-500">Select any sub-module to manage records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleSubmodules.map((mod) => (
            <SectionCard
              key={mod.id}
              title={mod.title}
              icon={mod.icon}
              colorClass={mod.colorClass}
              desc={mod.desc}
              stats={mod.stats}
              onClick={() => handleSelectModule(mod.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
