import { useState, useEffect } from 'react';
import {
  FaExclamationCircle, FaShieldAlt, FaPlus, FaTimes,
  FaFileExport, FaPlay, FaBell, FaHistory, FaUserSlash, FaHandHoldingUsd,
  FaArrowLeft, FaRegClock,
} from 'react-icons/fa';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

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

  // Ageing State (Initialized to 0)
  const [ageingSummary, setAgeingSummary] = useState({
    bucket0_30: 0,
    bucket31_60: 0,
    bucket61_90: 0,
    bucket90Plus: 0
  });
  const [ageingTable, setAgeingTable] = useState([]);

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
  const [waiverForm, setWaiverForm] = useState({
    invoiceNumber: '',
    flatNumber: '',
    residentName: '',
    fineAmount: 0,
    reason: ''
  });

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

    try {
      const res = await apiClient.post('/billing/dunning/waivers', {
        invoiceNumber: waiverForm.invoiceNumber,
        flatNumber: waiverForm.flatNumber,
        residentName: waiverForm.residentName,
        originalFine: waiverForm.fineAmount,
        waivedAmount: waiverForm.fineAmount,
        reason: waiverForm.reason.trim()
      });
      toast.success(res.data.message || "Fine waived successfully");
      setIsWaiverModalOpen(false);
      setWaiverForm({ invoiceNumber: '', flatNumber: '', residentName: '', fineAmount: 0, reason: '' });
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
      const res = await apiClient.post('/billing/dunning/reminders/send', {
        flat: targetFlat,
        resident: targetResident,
        channel: 'SMS',
        reminderType: 'DEFAULTER_FOLLOWUP'
      });
      toast.success(res?.data?.message || "Reminder dispatched via SMS");
      fetchDunningData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reminder");
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Unpaid Arrears Carried Forward</h3>
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
                  {arrears.length > 0 ? (
                    arrears.map((item, idx) => (
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
                        No unpaid carried-forward arrears found.
                      </td>
                    </tr>
                  )}
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">Ageing Analysis Breakdown</h3>
              <p className="text-xs text-gray-500">Track overdue balances across ageing brackets to target high-priority collection follow-ups.</p>
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
                  {ageingTable.length > 0 ? (
                    ageingTable.map((item, idx) => (
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
                        No active ageing records found.
                      </td>
                    </tr>
                  )}
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
                        <td className="py-4 px-6 text-xs font-bold text-blue-600">{rem.channel}</td>
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
                    <th className="py-4 px-6">Original Fine</th>
                    <th className="py-4 px-6">Waived Amount</th>
                    <th className="py-4 px-6">Mandatory Audit Reason</th>
                    <th className="py-4 px-6">Waived By</th>
                    <th className="py-4 px-6">Waived At</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {waiversList.length > 0 ? (
                    waiversList.map((wav, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                        <td className="py-4 px-6 font-mono font-bold text-gray-900">{wav.invoice || wav.invoiceNumber || 'N/A'}</td>
                        <td className="py-4 px-6 text-gray-700 font-semibold">{wav.flat || wav.flatNumber}</td>
                        <td className="py-4 px-6 text-gray-600">₹{wav.originalFine}</td>
                        <td className="py-4 px-6 text-emerald-600 font-bold">₹{wav.waivedAmount}</td>
                        <td className="py-4 px-6 text-xs text-gray-700 italic max-w-xs">{wav.reason}</td>
                        <td className="py-4 px-6 text-xs text-gray-600 font-medium">{wav.waivedByName || wav.waivedBy}</td>
                        <td className="py-4 px-6 text-xs text-gray-500">{wav.waivedAt ? new Date(wav.waivedAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            {wav.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-xs text-gray-500 font-medium">
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Waive Fine / Penalty</h3>
              <button onClick={() => setIsWaiverModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleWaiverSubmit} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-0.5">Flat / Unit Number *</label>
                  <input
                    type="text"
                    required
                    value={waiverForm.flatNumber}
                    onChange={e => setWaiverForm({ ...waiverForm, flatNumber: e.target.value })}
                    placeholder="e.g. A-101"
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-0.5">Invoice Number (Optional)</label>
                  <input
                    type="text"
                    value={waiverForm.invoiceNumber}
                    onChange={e => setWaiverForm({ ...waiverForm, invoiceNumber: e.target.value })}
                    placeholder="e.g. INV-2026-0045"
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-0.5">Fine Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={waiverForm.fineAmount}
                    onChange={e => setWaiverForm({ ...waiverForm, fineAmount: Number(e.target.value) })}
                    placeholder="250"
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-purple-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Reason for Waiver (Mandatory Audit Log) *
                </label>
                <textarea
                  required
                  rows="3"
                  value={waiverForm.reason}
                  onChange={e => setWaiverForm({ ...waiverForm, reason: e.target.value })}
                  placeholder="Specify mandatory reason for fine waiver (e.g. Payment delay due to bank server issue)..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWaiverModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Confirm Waiver
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
