import { useState, useEffect, useRef } from 'react';
import {
  FaExclamationCircle, FaShieldAlt, FaPlus, FaTimes,
  FaFileExport, FaPlay, FaBell, FaHistory, FaUserSlash, FaHandHoldingUsd,
  FaArrowLeft, FaRegClock, FaSearch, FaRegCalendarAlt, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const MonthPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(2026);
  const dropdownRef = useRef(null);

  const MONTH_NAMES = [
    { short: 'Jan', full: 'January', val: '01' },
    { short: 'Feb', full: 'February', val: '02' },
    { short: 'Mar', full: 'March', val: '03' },
    { short: 'Apr', full: 'April', val: '04' },
    { short: 'May', full: 'May', val: '05' },
    { short: 'Jun', full: 'June', val: '06' },
    { short: 'Jul', full: 'July', val: '07' },
    { short: 'Aug', full: 'August', val: '08' },
    { short: 'Sep', full: 'September', val: '09' },
    { short: 'Oct', full: 'October', val: '10' },
    { short: 'Nov', full: 'November', val: '11' },
    { short: 'Dec', full: 'December', val: '12' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayText = () => {
    if (!value || value === 'ALL') return 'Select Month';
    const [y, m] = value.split('-');
    const mObj = MONTH_NAMES.find(item => item.val === m);
    return mObj ? `${mObj.full}, ${y}` : value;
  };

  const handleSelectMonth = (mVal) => {
    const selected = `${pickerYear}-${mVal}`;
    onChange(selected);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('ALL');
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    setPickerYear(y);
    onChange(`${y}-${m}`);
    setIsOpen(false);
  };

  const selectedYear = value && value !== 'ALL' ? parseInt(value.split('-')[0]) : null;
  const selectedMonthVal = value && value !== 'ALL' ? value.split('-')[1] : null;

  return (
    <div className="relative inline-block text-left z-30" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[170px] justify-between"
      >
        <span>{getDisplayText()}</span>
        <FaRegCalendarAlt className="text-gray-400 text-sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] p-3 animate-in fade-in zoom-in-95 duration-100">
          {/* Header Year selector */}
          <div className="flex items-center justify-between bg-gray-100/80 px-3 py-1.5 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setPickerYear(prev => prev - 1)}
              className="text-gray-500 hover:text-gray-800 p-1 text-xs"
            >
              <FaChevronLeft />
            </button>
            <span className="text-xs font-bold text-gray-800">{pickerYear}</span>
            <button
              type="button"
              onClick={() => setPickerYear(prev => prev + 1)}
              className="text-gray-500 hover:text-gray-800 p-1 text-xs"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {MONTH_NAMES.map((m) => {
              const isSelected = selectedYear === pickerYear && selectedMonthVal === m.val;
              return (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => handleSelectMonth(m.val)}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1 font-bold'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {m.short}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-blue-500 hover:text-blue-700 font-semibold px-1"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleThisMonth}
              className="text-blue-500 hover:text-blue-700 font-semibold px-1"
            >
              This month
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FinesInterestArrearsPage = ({ onBack, currentUserRole = 'ADMIN' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Overview Stats (Initialized to 0)
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    totalArrears: 0,
    overdueInvoices: 0,
    totalFines: 0,
    defaulters: 0,
    pendingReminders: 0
  });

  // Rules State (Dynamic from Backend)
  const [rules, setRules] = useState([]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    ruleName: '',
    calculationType: 'FLAT',
    flatAmount: 100,
    percentageRate: 1,
    startRule: 'DUE_DATE',
    slabs: [
      { fromDays: 0, toDays: 15, rate: 0 },
      { fromDays: 16, toDays: 30, rate: 1 },
      { fromDays: 31, toDays: 9999, rate: 2 }
    ]
  });

  // Arrears State (Dynamic from Backend)
  const [arrears, setArrears] = useState([]);
  const [selectedArrearsDetail, setSelectedArrearsDetail] = useState(null);
  const [selectedArrearsMonth, setSelectedArrearsMonth] = useState('ALL');

  // Ageing State (Initialized to 0)
  const [ageingSummary, setAgeingSummary] = useState({
    bucket0_30: 0,
    bucket31_60: 0,
    bucket61_90: 0,
    bucket90Plus: 0
  });
  const [ageingTable, setAgeingTable] = useState([]);
  const [selectedAgeingMonth, setSelectedAgeingMonth] = useState('ALL');

  // Defaulters State (Dynamic from Backend)
  const [defaulterCyclesThreshold, setDefaulterCyclesThreshold] = useState(2);
  const [defaultersList, setDefaultersList] = useState([]);

  // Reminders State (Dynamic from Backend)
  const [reminderConfig, setReminderConfig] = useState({
    beforeDueDays: 3,
    onDueDateEnabled: true,
    afterDueDays: 3,
    secondReminderDays: 7
  });
  const [reminderHistory, setReminderHistory] = useState([]);

  // Waivers State (Dynamic from Backend)
  const [waiversList, setWaiversList] = useState([]);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [searchInvoiceInput, setSearchInvoiceInput] = useState('');
  const [isInvoiceFound, setIsInvoiceFound] = useState(false);
  const [waiverForm, setWaiverForm] = useState({
    invoiceNumber: '',
    flatNumber: '',
    residentName: '',
    totalPendingAmount: 0,
    waivedAmount: '',
    reason: ''
  });

  // Handle Search Invoice for Waiver
  const handleSearchInvoiceForWaiver = (searchKey) => {
    const term = (searchKey || searchInvoiceInput).trim().toLowerCase();
    if (!term) {
      toast.error("Please enter an Invoice Number or Flat Number to search");
      return;
    }

    const matched = arrears.find(item =>
      String(item.previousInvoice || '').toLowerCase().includes(term) ||
      String(item.flat || '').toLowerCase() === term ||
      String(item.flat || '').toLowerCase().includes(term)
    );

    if (matched) {
      setIsInvoiceFound(true);
      setWaiverForm(prev => ({
        ...prev,
        invoiceId: matched.id || null,
        invoiceNumber: matched.previousInvoice || searchKey,
        flatNumber: String(matched.flat || '').replace(/^(Block|Flat)[-\s]*/i, ''),
        residentName: matched.resident || 'Resident',
        fineAmount: matched.fine || 0,
        totalPendingAmount: matched.totalDue || matched.outstanding || 0,
        waivedAmount: matched.fine || matched.totalDue || 0,
      }));
      toast.success(`Invoice details retrieved for Flat ${matched.flat}`);
    } else {
      setIsInvoiceFound(false);
      toast.error("No matching pending invoice found for this search");
    }
  };

  // Fetch backend data
  useEffect(() => {
    fetchDunningData();
  }, []);

  const fetchDunningData = async () => {
    setLoading(true);
    try {
      const [ovRes, rulesRes, arrearsRes, ageingRes, defRes, remRes, wavRes] = await Promise.allSettled([
        apiClient.get('/billing/dunning/overview'),
        apiClient.get('/billing/dunning/rules'),
        apiClient.get('/billing/dunning/arrears'),
        apiClient.get('/billing/dunning/ageing'),
        apiClient.get('/billing/dunning/defaulters'),
        apiClient.get('/billing/dunning/reminders'),
        apiClient.get('/billing/dunning/waivers')
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value?.data?.data) {
        setStats(ovRes.value.data.data);
      }
      if (rulesRes.status === 'fulfilled') {
        setRules(rulesRes.value?.data?.data || []);
      }
      if (arrearsRes.status === 'fulfilled') {
        setArrears(arrearsRes.value?.data?.data || []);
      }
      if (ageingRes.status === 'fulfilled' && ageingRes.value?.data?.data) {
        setAgeingSummary(ageingRes.value.data.data.summary || { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90Plus: 0 });
        setAgeingTable(ageingRes.value.data.data.table || []);
      }
      if (defRes.status === 'fulfilled') {
        setDefaultersList(defRes.value?.data?.data || []);
      }
      if (remRes.status === 'fulfilled' && remRes.value?.data?.data) {
        if (remRes.value.data.data.history) setReminderHistory(remRes.value.data.data.history);
      }
      if (wavRes.status === 'fulfilled') {
        setWaiversList(wavRes.value?.data?.data || []);
      }
    } catch (err) {
      console.error("Error loading dunning data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run Manual Dunning Engine
  const handleRunDunning = async () => {
    try {
      toast.loading("Running automated dunning engine...");
      const res = await apiClient.post('/billing/dunning/run');
      toast.dismiss();
      toast.success(res?.data?.data?.message || "Dunning calculation completed!");
      fetchDunningData();
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to run dunning engine");
    }
  };

  // Create Fine Rule Handler
  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!ruleForm.ruleName) {
      toast.error("Please enter a rule name");
      return;
    }
    if (!ruleForm.startRule) {
      toast.error("Calculation start reference (Invoice Date or Due Date) is mandatory");
      return;
    }

    try {
      const res = await apiClient.post('/billing/dunning/rules', ruleForm);
      toast.success(res.data.message || "Fine rule submitted for approval");
      setIsRuleModalOpen(false);
      setRuleForm({
        ruleName: '',
        calculationType: 'FLAT',
        flatAmount: 100,
        percentageRate: 1,
        startRule: 'DUE_DATE',
        slabs: [
          { fromDays: 0, toDays: 15, rate: 0 },
          { fromDays: 16, toDays: 30, rate: 1 },
          { fromDays: 31, toDays: 9999, rate: 2 }
        ]
      });
      fetchDunningData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving fine rule");
    }
  };

  // Approve Fine Rule Handler
  const handleApproveRule = async (ruleId) => {
    try {
      const res = await apiClient.post(`/billing/dunning/rules/${ruleId}/approve`);
      toast.success(res.data.message || "Rule approved and activated");
      fetchDunningData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve rule");
    }
  };

  // Submit Waiver Handler
  const handleWaiverSubmit = async (e) => {
    e.preventDefault();
    if (!waiverForm.reason || waiverForm.reason.trim() === '') {
      toast.error("Reason is mandatory for fine waiver");
      return;
    }
    if (!waiverForm.waivedAmount || Number(waiverForm.waivedAmount) <= 0) {
      toast.error("Please enter a valid deduction/waiver amount");
      return;
    }

    try {
      const res = await apiClient.post('/billing/dunning/waivers', {
        invoiceId: waiverForm.invoiceId || null,
        invoiceNumber: waiverForm.invoiceNumber,
        flatNumber: waiverForm.flatNumber,
        residentName: waiverForm.residentName,
        originalFine: waiverForm.fineAmount || 0,
        pendingAmount: waiverForm.totalPendingAmount || 0,
        waivedAmount: Number(waiverForm.waivedAmount),
        reason: waiverForm.reason.trim()
      });
      toast.success(res.data.message || "Fine/Deduction waived successfully");
      setIsWaiverModalOpen(false);
      setWaiverForm({ invoiceNumber: '', flatNumber: '', residentName: '', fineAmount: 0, waivedAmount: 0, totalPendingAmount: 0, reason: '' });
      fetchDunningData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process waiver");
    }
  };

  // Dispatch Reminder Handler
  const handleSendReminder = async (item) => {
    try {
      const targetFlat = item.flat || item.flatNumber || 'A-101';
      const targetResident = item.resident || item.residentName || 'Resident';
      const outstanding = item.totalOutstanding || item.outstanding || item.totalDue || 0;
      const fine = item.totalFineAmount || item.fine || 0;

      const res = await apiClient.post('/billing/dunning/reminders/send', {
        flat: targetFlat,
        resident: targetResident,
        invoiceId: item.id || item.invoiceId || null,
        invoiceNumber: item.previousInvoice || item.invoiceNumber || item.invoice || '',
        totalOutstanding: outstanding,
        fineAmount: fine,
        channel: 'EMAIL',
        reminderType: 'DEFAULTER_FOLLOWUP'
      });
      toast.success(res?.data?.message || "Reminder email sent to resident");
      fetchDunningData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reminder email");
    }
  };

  return (
    <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {onBack && (
              <button onClick={onBack} className="text-gray-500 hover:text-orange-600 transition-colors">
                <FaArrowLeft />
              </button>
            )}
            <h1 className="text-2xl font-extrabold text-gray-900">Fines, Interest & Arrears</h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage overdue dues, automatic fines, interest, arrears, reminders and defaulter follow-up.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('rules')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
          >
            <FaShieldAlt className="text-gray-600" /> Configure Rules
          </button>
          <button
            onClick={handleRunDunning}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <FaPlay /> Run Dunning Engine
          </button>
          <button
            onClick={() => toast.success("Dunning report exported to Excel")}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <FaFileExport /> Export
          </button>
        </div>
      </div>

      {/* 7 CONSOLIDATED TABS NAVIGATION */}
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl overflow-x-auto border border-gray-200 shadow-inner no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: FaExclamationCircle },
          { id: 'rules', label: 'Rules', icon: FaShieldAlt },
          { id: 'arrears', label: 'Arrears', icon: FaHistory },
          { id: 'ageing', label: 'Ageing', icon: FaRegClock },
          { id: 'defaulters', label: 'Defaulters', icon: FaUserSlash },
          { id: 'reminders', label: 'Reminders', icon: FaBell },
          { id: 'waivers', label: 'Waivers', icon: FaHandHoldingUsd }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-md border border-gray-200/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
              <TabIcon /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Outstanding</span>
              <span className="text-xl font-extrabold text-gray-900 mt-2">₹{(stats.totalOutstanding || 0).toLocaleString()}</span>
              <span className="text-[11px] text-gray-400 mt-1">Across all overdue invoices</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Arrears</span>
              <span className="text-xl font-extrabold text-red-600 mt-2">₹{(stats.totalArrears || 0).toLocaleString()}</span>
              <span className="text-[11px] text-gray-400 mt-1">Carried forward dues</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Overdue Invoices</span>
              <span className="text-xl font-extrabold text-amber-600 mt-2">{stats.overdueInvoices || 0}</span>
              <span className="text-[11px] text-gray-400 mt-1">Pending payment</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Fines / Interest</span>
              <span className="text-xl font-extrabold text-purple-600 mt-2">₹{(stats.totalFines || 0).toLocaleString()}</span>
              <span className="text-[11px] text-gray-400 mt-1">Auto-applied penalties</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Defaulters</span>
              <span className="text-xl font-extrabold text-red-700 mt-2">{stats.defaulters || 0}</span>
              <span className="text-[11px] text-gray-400 mt-1">2+ unpaid cycles</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Pending Reminders</span>
              <span className="text-xl font-extrabold text-blue-600 mt-2">{stats.pendingReminders || 0}</span>
              <span className="text-[11px] text-gray-400 mt-1">Automated dispatch</span>
            </div>
          </div>

          {/* Dunning Workflow Status Overview */}
          <div className="bg-gradient-to-r from-slate-900 to-gray-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-1">Automated Dunning & Fine Application Active</h3>
              <p className="text-xs text-gray-300 max-w-2xl">
                The dunning process automatically evaluates unpaid invoices daily, calculates late fees from configured reference dates (Due Date / Invoice Date), flags defaulters after 2 cycles, and posts ledger adjustments.
              </p>
            </div>
            <button
              onClick={handleRunDunning}
              className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shrink-0 transition-all"
            >
              Trigger Manual Dunning Audit
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: RULES ─────────────────────────────────────────────────────── */}
      {activeTab === 'rules' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-gray-900">Fine & Interest Rules</h2>
              <p className="text-xs text-gray-500">Configure late payment penalties (Flat, Percentage, Slab-Based) with explicit calculation start references.</p>
            </div>
            <button
              onClick={() => setIsRuleModalOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <FaPlus /> Create Fine / Interest Rule
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase border-b border-gray-100 whitespace-nowrap">
                    <th className="py-4 px-6">Rule Name</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Calculation</th>
                    <th className="py-4 px-6">Start Reference</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Effective From</th>
                    <th className="py-4 px-6">Created By</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.length > 0 ? (
                    rules.map((rule, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                        <td className="py-4 px-6 font-bold text-gray-900">{rule.ruleName}</td>
                        <td className="py-4 px-6 text-gray-700 font-semibold">{rule.calculationType}</td>
                        <td className="py-4 px-6 text-gray-600">
                          {rule.calculationType === 'FLAT' && `₹${rule.flatAmount}`}
                          {rule.calculationType === 'PERCENTAGE' && `${rule.percentageRate}%`}
                          {rule.calculationType === 'SLAB' && 'Slab-Based Penalty'}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-indigo-700 bg-indigo-50/50 w-fit px-2 py-1 rounded-lg">
                          {rule.startRule === 'DUE_DATE' ? 'Due Date' : 'Invoice Date'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${rule.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            rule.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                            {rule.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500">{rule.effectiveFrom ? new Date(rule.effectiveFrom).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-4 px-6 text-xs font-medium text-gray-700">
                          {typeof rule.createdBy === 'object' && rule.createdBy !== null
                            ? (rule.createdBy.name || `${rule.createdBy.firstName || ''} ${rule.createdBy.lastName || ''}`.trim() || rule.createdBy.email || 'Admin')
                            : (rule.createdBy || 'Admin')}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {rule.status === 'PENDING_APPROVAL' && currentUserRole === 'ADMIN' ? (
                            <button
                              onClick={() => handleApproveRule(rule._id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">{rule.status}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-xs text-gray-500 font-medium">
                        No fine/interest rules configured yet. Click "Create Fine / Interest Rule" to configure one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ARREARS ───────────────────────────────────────────────────── */}
      {activeTab === 'arrears' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Unpaid Arrears Carried Forward</h3>
                <p className="text-xs text-gray-500">Filter overdue carried-forward invoices by billing cycle month.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase">Filter Month:</span>
                <MonthPicker
                  value={selectedArrearsMonth}
                  onChange={(val) => setSelectedArrearsMonth(val)}
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase border-b border-gray-100 whitespace-nowrap">
                    <th className="py-4 px-6">Flat</th>
                    <th className="py-4 px-6">Wing</th>
                    <th className="py-4 px-6">Resident</th>
                    <th className="py-4 px-6">Previous Invoice</th>
                    <th className="py-4 px-6">Billing Cycle</th>
                    <th className="py-4 px-6">Original Amount</th>
                    <th className="py-4 px-6">Paid</th>
                    <th className="py-4 px-6">Outstanding</th>
                    <th className="py-4 px-6">Days Overdue</th>
                    <th className="py-4 px-6">Fine / Interest</th>
                    <th className="py-4 px-6">Total Due</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredArrears = arrears.filter(item => {
                      if (selectedArrearsMonth === 'ALL') return true;
                      const cycle = String(item.billingCycle || '').toLowerCase();
                      const dateStr = item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 7) : '';
                      return cycle.includes(selectedArrearsMonth.toLowerCase()) || dateStr === selectedArrearsMonth;
                    });

                    return filteredArrears.length > 0 ? (
                      filteredArrears.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm whitespace-nowrap">
                          <td className="py-4 px-6 font-bold text-gray-900">{String(item.flat || '').replace(/^(Block|Flat)[-\s]*/i, '')}</td>
                          <td className="py-4 px-6 text-gray-700 font-semibold">
                            {item.wing || (
                              String(item.flat || '').match(/^([A-Za-z]+)[-\s]?/)
                                ? `Wing ${String(item.flat || '').match(/^([A-Za-z]+)[-\s]?/)[1].toUpperCase()}`
                                : 'Wing A'
                            )}
                          </td>
                          <td className="py-4 px-6 text-gray-700">{item.resident}</td>
                          <td className="py-4 px-6 font-mono text-xs text-gray-600">{item.previousInvoice}</td>
                          <td className="py-4 px-6 text-xs text-gray-500">{item.billingCycle}</td>
                          <td className="py-4 px-6 text-gray-700">₹{(item.originalAmount || 0).toLocaleString()}</td>
                          <td className="py-4 px-6 text-emerald-600 font-semibold">₹{(item.paid || 0).toLocaleString()}</td>
                          <td className="py-4 px-6 text-red-600 font-bold">₹{(item.outstanding || 0).toLocaleString()}</td>
                          <td className="py-4 px-6 text-xs font-bold text-amber-600">{item.daysOverdue} Days</td>
                          <td className="py-4 px-6 text-purple-600 font-semibold">₹{item.fine || 0}</td>
                          <td className="py-4 px-6 text-gray-900 font-extrabold">₹{(item.totalDue || 0).toLocaleString()}</td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setSelectedArrearsDetail(item)}
                              className="text-xs font-bold text-orange-600 hover:underline"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="py-8 text-center text-xs text-gray-500 font-medium">
                          No unpaid carried-forward arrears found for month ({selectedArrearsMonth}).
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: AGEING ────────────────────────────────────────────────────── */}
      {activeTab === 'ageing' && (
        <div className="space-y-6 animate-fade-in">
          {/* Ageing Summary Buckets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-l-4 border-emerald-500 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase">0–30 Days Overdue</span>
              <div className="text-2xl font-extrabold text-gray-900 mt-2">₹{(ageingSummary.bucket0_30 || 0).toLocaleString()}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-l-4 border-amber-500 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase">31–60 Days Overdue</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-2">₹{(ageingSummary.bucket31_60 || 0).toLocaleString()}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase">61–90 Days Overdue</span>
              <div className="text-2xl font-extrabold text-orange-600 mt-2">₹{(ageingSummary.bucket61_90 || 0).toLocaleString()}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-l-4 border-red-600 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase">90+ Days Overdue</span>
              <div className="text-2xl font-extrabold text-red-600 mt-2">₹{(ageingSummary.bucket90Plus || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Ageing Analysis Breakdown</h3>
                <p className="text-xs text-gray-500">Track overdue balances across ageing brackets to target high-priority collection follow-ups.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase">Filter Month:</span>
                <MonthPicker
                  value={selectedAgeingMonth}
                  onChange={(val) => setSelectedAgeingMonth(val)}
                />
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase border-b border-gray-100 whitespace-nowrap">
                    <th className="py-4 px-6">Flat</th>
                    <th className="py-4 px-6">Wing</th>
                    <th className="py-4 px-6">Resident</th>
                    <th className="py-4 px-6">Invoice Ref</th>
                    <th className="py-4 px-6">Days Overdue</th>
                    <th className="py-4 px-6">Ageing Bucket</th>
                    <th className="py-4 px-6">Outstanding</th>
                    <th className="py-4 px-6">Fine / Interest</th>
                    <th className="py-4 px-6 text-right">Total Due</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredAgeing = ageingTable.filter(item => {
                      if (selectedAgeingMonth === 'ALL') return true;
                      const cycle = String(item.billingCycle || '').toLowerCase();
                      const dateStr = item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 7) : '';
                      return cycle.includes(selectedAgeingMonth.toLowerCase()) || dateStr === selectedAgeingMonth;
                    });

                    return filteredAgeing.length > 0 ? (
                      filteredAgeing.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm whitespace-nowrap">
                          <td className="py-4 px-6 font-bold text-gray-900">{String(item.flat || '').replace(/^(Block|Flat)[-\s]*/i, '')}</td>
                          <td className="py-4 px-6 text-gray-700 font-semibold">
                            {item.wing || (
                              String(item.flat || '').match(/^([A-Za-z]+)[-\s]?/)
                                ? `Wing ${String(item.flat || '').match(/^([A-Za-z]+)[-\s]?/)[1].toUpperCase()}`
                                : 'Wing A'
                            )}
                          </td>
                          <td className="py-4 px-6 text-gray-700">{item.resident}</td>
                          <td className="py-4 px-6 font-mono text-xs text-gray-600">{item.previousInvoice}</td>
                          <td className="py-4 px-6 text-xs font-bold text-amber-600">{item.daysOverdue} Days</td>
                          <td className="py-4 px-6">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${item.ageingBucket === '90+ Days' ? 'bg-red-50 text-red-600 border-red-200' :
                              item.ageingBucket === '61–90 Days' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                item.ageingBucket === '31–60 Days' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                              }`}>
                              {item.ageingBucket}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-red-600 font-bold">₹{(item.outstanding || 0).toLocaleString()}</td>
                          <td className="py-4 px-6 text-purple-600 font-semibold">₹{item.fine || 0}</td>
                          <td className="py-4 px-6 text-right text-gray-900 font-extrabold">₹{(item.totalDue || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-xs text-gray-500 font-medium">
                          No active ageing records found for month ({selectedAgeingMonth}).
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: DEFAULTERS ────────────────────────────────────────────────── */}
      {activeTab === 'defaulters' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Defaulter Threshold Rule</h3>
              <p className="text-xs text-gray-500">Flats automatically become defaulters after the configured number of unpaid cycles.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">Mark flat as defaulter after:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={defaulterCyclesThreshold}
                onChange={e => setDefaulterCyclesThreshold(Number(e.target.value))}
                className="w-16 p-2 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm font-bold"
              />
              <span className="text-xs text-gray-500 font-semibold">unpaid cycles</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase border-b border-gray-100 whitespace-nowrap">
                    <th className="py-4 px-6">Flat</th>
                    <th className="py-4 px-6">Wing</th>
                    <th className="py-4 px-6">Resident</th>
                    <th className="py-4 px-6">Unpaid Cycles</th>
                    <th className="py-4 px-6">Outstanding</th>
                    <th className="py-4 px-6">Oldest Due Date</th>
                    <th className="py-4 px-6">Days Overdue</th>
                    <th className="py-4 px-6">Fine / Interest</th>
                    <th className="py-4 px-6">Last Reminder</th>
                    <th className="py-4 px-6">Defaulter Since</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {defaultersList.length > 0 ? (
                    defaultersList.map((def, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm whitespace-nowrap">
                        <td className="py-4 px-6 font-bold text-gray-900">{String(def.flat || def.flatNumber || '').replace(/^(Block|Flat)[-\s]*/i, '')}</td>
                        <td className="py-4 px-6 text-gray-700 font-semibold">
                          {def.wingName || def.wing || (
                            String(def.flat || def.flatNumber || '').match(/^([A-Za-z]+)[-\s]?/)
                              ? `Wing ${String(def.flat || def.flatNumber || '').match(/^([A-Za-z]+)[-\s]?/)[1].toUpperCase()}`
                              : 'Wing A'
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-700">{def.resident || def.residentName}</td>
                        <td className="py-4 px-6 text-red-600 font-extrabold">{def.unpaidCyclesCount || def.unpaidCycles} Cycles</td>
                        <td className="py-4 px-6 text-gray-900 font-bold">₹{(def.totalOutstanding || def.outstanding || 0).toLocaleString()}</td>
                        <td className="py-4 px-6 text-xs text-gray-500">{def.oldestDueDate ? new Date(def.oldestDueDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-4 px-6 text-xs font-bold text-amber-600">{def.daysOverdue} Days</td>
                        <td className="py-4 px-6 text-purple-600 font-semibold">₹{def.totalFineAmount || def.fine || 0}</td>
                        <td className="py-4 px-6 text-xs text-gray-500">{def.lastReminderSentAt ? new Date(def.lastReminderSentAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-4 px-6 text-xs text-gray-500">{def.defaulterSince ? new Date(def.defaulterSince).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                            {def.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleSendReminder(def)}
                            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm"
                          >
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="py-8 text-center text-xs text-gray-500 font-medium">
                        No defaulters found for the current billing cycles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: REMINDERS ─────────────────────────────────────────────────── */}
      {activeTab === 'reminders' && (
        <div className="space-y-6 animate-fade-in">
          {/* Configuration Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">Automated Dunning Reminder Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700">Before Due Date</span>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={reminderConfig.beforeDueDays}
                    onChange={e => setReminderConfig({ ...reminderConfig, beforeDueDays: Number(e.target.value) })}
                    className="w-16 p-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-center"
                  />
                  <span className="text-xs text-gray-500">days before</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700">On Due Date</span>
                  <p className="text-[11px] text-gray-500">Send alert on due date</p>
                </div>
                <input
                  type="checkbox"
                  checked={reminderConfig.onDueDateEnabled}
                  onChange={e => setReminderConfig({ ...reminderConfig, onDueDateEnabled: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700">After Due Date</span>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={reminderConfig.afterDueDays}
                    onChange={e => setReminderConfig({ ...reminderConfig, afterDueDays: Number(e.target.value) })}
                    className="w-16 p-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-center"
                  />
                  <span className="text-xs text-gray-500">days after</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700">Second Reminder</span>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={reminderConfig.secondReminderDays}
                    onChange={e => setReminderConfig({ ...reminderConfig, secondReminderDays: Number(e.target.value) })}
                    className="w-16 p-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-center"
                  />
                  <span className="text-xs text-gray-500">days after</span>
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">Reminder Delivery History</h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase border-b border-gray-100 whitespace-nowrap">
                    <th className="py-4 px-6">Flat</th>
                    <th className="py-4 px-6">Resident</th>
                    <th className="py-4 px-6">Invoice</th>
                    <th className="py-4 px-6">Reminder Type</th>
                    <th className="py-4 px-6">Channel</th>
                    <th className="py-4 px-6">Sent At</th>
                    <th className="py-4 px-6">Delivery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reminderHistory.length > 0 ? (
                    reminderHistory.map((rem, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                        <td className="py-4 px-6 font-bold text-gray-900">{rem.flat || rem.flatNumber}</td>
                        <td className="py-4 px-6 text-gray-700">{rem.resident || rem.residentName}</td>
                        <td className="py-4 px-6 font-mono text-xs text-gray-600">{rem.invoice || 'N/A'}</td>
                        <td className="py-4 px-6 text-xs text-gray-700 font-semibold">{rem.reminderType}</td>
                        <td className="py-4 px-6 text-xs font-bold">
                          <span className={`px-2.5 py-1 rounded-lg ${rem.channel === 'EMAIL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {rem.channel || 'EMAIL'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500">{rem.sentAt ? new Date(rem.sentAt).toLocaleString() : 'N/A'}</td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            {rem.deliveryStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-xs text-gray-500 font-medium">
                        No dunning reminder dispatches logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: WAIVERS ───────────────────────────────────────────────────── */}
      {activeTab === 'waivers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-gray-900">Fine Waiver Log</h2>
              <p className="text-xs text-gray-500">Authorized Committee Admin can waive fines with mandatory audit reasons.</p>
            </div>
            <button
              onClick={() => setIsWaiverModalOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <FaHandHoldingUsd /> Waive Fine
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase border-b border-gray-100 whitespace-nowrap">
                    <th className="py-4 px-6">Invoice</th>
                    <th className="py-4 px-6">Flat</th>
                    <th className="py-4 px-6">Total Dues</th>
                    <th className="py-4 px-6">Original Fine</th>
                    <th className="py-4 px-6">Waived</th>
                    <th className="py-4 px-6">Remaining Balance</th>
                    <th className="py-4 px-6">Reason</th>
                    <th className="py-4 px-6">Waived By</th>
                    <th className="py-4 px-6">Waived At</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {waiversList.length > 0 ? (
                    waiversList.map((wav, idx) => {
                      const displayPending = wav.pendingAmount !== undefined && wav.pendingAmount !== null ? wav.pendingAmount : (wav.totalPendingAmount || 0);
                      const displayFine = wav.originalFine !== undefined && wav.originalFine !== null ? wav.originalFine : (wav.fine || 0);
                      const waived = wav.waivedAmount || 0;
                      const remainingBalance = Math.max(0, displayPending - waived);
                      return (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm whitespace-nowrap">
                          <td className="py-4 px-6 font-mono font-bold text-gray-900">{wav.invoice || wav.invoiceNumber || 'N/A'}</td>
                          <td className="py-4 px-6 text-gray-700 font-semibold">{wav.flat || wav.flatNumber}</td>
                          <td className="py-4 px-6 text-red-600 font-extrabold">₹{displayPending.toLocaleString()}</td>
                          <td className="py-4 px-6 text-purple-600 font-semibold">₹{displayFine.toLocaleString()}</td>
                          <td className="py-4 px-6 text-emerald-600 font-bold">₹{waived.toLocaleString()}</td>
                          <td className="py-4 px-6 text-amber-600 font-extrabold">₹{remainingBalance.toLocaleString()}</td>
                          <td className="py-4 px-6 text-xs text-gray-700 italic max-w-xs">{wav.reason}</td>
                          <td className="py-4 px-6 text-xs text-gray-600 font-medium">{wav.waivedByName || wav.waivedBy}</td>
                          <td className="py-4 px-6 text-xs text-gray-500">{wav.waivedAt ? new Date(wav.waivedAt).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-4 px-6">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                              {wav.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="py-8 text-center text-xs text-gray-500 font-medium">
                        No fine waivers recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── FINE RULE CREATION MODAL ────────────────────────────────────────── */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create Fine / Interest Rule</h3>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={ruleForm.ruleName}
                  onChange={e => setRuleForm({ ...ruleForm, ruleName: e.target.value })}
                  placeholder="e.g. Late Payment Fine"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Calculation Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['FLAT', 'PERCENTAGE', 'SLAB'].map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setRuleForm({ ...ruleForm, calculationType: type })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${ruleForm.calculationType === type
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      {type === 'FLAT' ? 'Flat Amount' : type === 'PERCENTAGE' ? 'Percentage' : 'Slab Based'}
                    </button>
                  ))}
                </div>
              </div>

              {ruleForm.calculationType === 'FLAT' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={ruleForm.flatAmount}
                    onChange={e => setRuleForm({ ...ruleForm, flatAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                  />
                </div>
              )}

              {ruleForm.calculationType === 'PERCENTAGE' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Percentage Rate (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={ruleForm.percentageRate}
                    onChange={e => setRuleForm({ ...ruleForm, percentageRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                  />
                </div>
              )}

              {/* MANDATORY EXPLICIT CALCULATION START REFERENCE */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-amber-900 uppercase">
                  Calculate Overdue From (Mandatory Explicit Selection) *
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="radio"
                      name="startRule"
                      value="DUE_DATE"
                      checked={ruleForm.startRule === 'DUE_DATE'}
                      onChange={e => setRuleForm({ ...ruleForm, startRule: e.target.value })}
                      className="accent-orange-500 w-4 h-4"
                    />
                    Due Date
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="radio"
                      name="startRule"
                      value="INVOICE_DATE"
                      checked={ruleForm.startRule === 'INVOICE_DATE'}
                      onChange={e => setRuleForm({ ...ruleForm, startRule: e.target.value })}
                      className="accent-orange-500 w-4 h-4"
                    />
                    Invoice Date
                  </label>
                </div>
                {/* <p className="text-[11px] text-amber-700 italic">
                  Fine/interest calculation begins strictly from the selected date reference according to BRD business rules.
                </p> */}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Submit for Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── WAIVE FINE MODAL (MANDATORY REASON PROMPT) ──────────────────────── */}
      {isWaiverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 animate-fade-in-up space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Waive Fine / Penalty</h3>
                <p className="text-xs text-gray-500">Search invoice to pull flat dues and deduct fine/penalty amounts.</p>
              </div>
              <button
                onClick={() => {
                  setIsWaiverModalOpen(false);
                  setIsInvoiceFound(false);
                  setSearchInvoiceInput('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {/* SEARCH BAR FOR INVOICE NUMBER */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">Search Invoice Number / Flat Number *</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={searchInvoiceInput}
                    onChange={e => setSearchInvoiceInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchInvoiceForWaiver();
                      }
                    }}
                    placeholder="Enter Invoice No (e.g. INV/2026-27/000001) or Flat..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchInvoiceForWaiver()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Search
                </button>
              </div>
            </div>

            <form onSubmit={handleWaiverSubmit} className="space-y-4 pt-1">
              {/* DETAILS CARD ON SUCCESSFUL SEARCH */}
              {isInvoiceFound ? (
                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-orange-200/50 pb-2">
                    <span className="text-xs font-extrabold text-orange-950 uppercase">Invoice Match Details</span>
                    <span className="text-xs font-mono font-bold text-orange-700">{waiverForm.invoiceNumber}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Flat / Unit</span>
                      <span className="font-extrabold text-gray-900">{waiverForm.flatNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Resident</span>
                      <span className="font-semibold text-gray-800">{waiverForm.residentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Pending</span>
                      <span className="font-extrabold text-red-600">₹{(waiverForm.totalPendingAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                  Search an invoice above or enter details manually below
                </div>
              )}

              {/* MANUAL INPUT FALLBACKS IF NOT SEARCHED */}
              {!isInvoiceFound && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-0.5">Flat / Unit Number *</label>
                    <input
                      type="text"
                      required
                      value={waiverForm.flatNumber}
                      onChange={e => setWaiverForm({ ...waiverForm, flatNumber: e.target.value })}
                      placeholder="e.g. 101"
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-0.5">Invoice Number</label>
                    <input
                      type="text"
                      value={waiverForm.invoiceNumber}
                      onChange={e => setWaiverForm({ ...waiverForm, invoiceNumber: e.target.value })}
                      placeholder="e.g. INV/2026-27/000001"
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* DEDUCTION AMOUNT INPUT */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Amount to be Deducted / Waived (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={waiverForm.totalPendingAmount > 0 ? waiverForm.totalPendingAmount : undefined}
                  required
                  value={waiverForm.waivedAmount}
                  onChange={e => setWaiverForm({ ...waiverForm, waivedAmount: e.target.value })}
                  placeholder="Enter amount to deduct from total pending dues"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-purple-700 focus:outline-none focus:border-orange-500"
                />
                {waiverForm.totalPendingAmount > 0 && Number(waiverForm.waivedAmount) > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    New Pending Dues After Deduction: ₹{Math.max(0, waiverForm.totalPendingAmount - Number(waiverForm.waivedAmount)).toLocaleString()}
                  </p>
                )}
              </div>

              {/* MANDATORY AUDIT REASON */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Reason for Waiver / Deduction (Mandatory Audit Log) *
                </label>
                <textarea
                  required
                  rows="3"
                  value={waiverForm.reason}
                  onChange={e => setWaiverForm({ ...waiverForm, reason: e.target.value })}
                  placeholder="Specify mandatory reason for fine waiver (e.g. Technical banking error resolution approved by Secretary)..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsWaiverModalOpen(false);
                    setIsInvoiceFound(false);
                    setSearchInvoiceInput('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Confirm Waiver / Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ARREARS DETAIL DRAWER/MODAL ─────────────────────────────────────── */}
      {selectedArrearsDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white h-full max-w-lg w-full p-6 shadow-2xl overflow-y-auto animate-fade-in-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Flat {String(selectedArrearsDetail.flat || '').replace(/^(Block|Flat)[-\s]*/i, '')} ({selectedArrearsDetail.wing || 'Wing A'}) — {selectedArrearsDetail.resident}</h3>
                <span className="text-xs font-mono text-gray-500">Invoice Ref: {selectedArrearsDetail.previousInvoice}</span>
              </div>
              <button onClick={() => setSelectedArrearsDetail(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Current Outstanding</span>
                <div className="text-lg font-bold text-gray-900">₹{(selectedArrearsDetail.totalDue || 0).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Original Invoice</span>
                <div className="text-lg font-bold text-gray-700">₹{(selectedArrearsDetail.originalAmount || 0).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Paid</span>
                <div className="text-lg font-bold text-emerald-600">₹{(selectedArrearsDetail.paid || 0).toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">Fine / Interest</span>
                <div className="text-lg font-bold text-purple-600">₹{selectedArrearsDetail.fine || 0}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedArrearsDetail(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default FinesInterestArrearsPage;
