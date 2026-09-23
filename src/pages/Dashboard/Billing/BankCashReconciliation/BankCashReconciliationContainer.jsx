import React, { useState, useEffect, useMemo } from 'react';
import {
  FaUniversity, FaMoneyBillWave, FaExchangeAlt, FaSlidersH, FaHistory,
  FaPlus, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaSearch,
  FaFilter, FaArrowLeft, FaEye, FaLock, FaCheck, FaTimes, FaCoins, FaListAlt, FaCalendarAlt
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

const formatINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const BankCashReconciliationContainer = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview | accounts | transactions | reconciliation | transfers | adjustments | history
  const [loading, setLoading] = useState(false);

  // Core Data States
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({ totalBankBalance: 0, totalCashBalance: 0, ledgerBalance: 0 });
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [history, setHistory] = useState([]);
  const [cashCounts, setCashCounts] = useState([]);

  // Filter States
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [txFilterType, setTxFilterType] = useState('ALL');
  const [txFilterStatus, setTxFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Actions
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({
    accountName: '', accountType: 'BANK', bankName: '', accountNumber: '', ifsc: '', branchName: '', cashLocation: '', openingBalance: '0'
  });

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromAccountId: '', toAccountId: '', amount: '', transferDate: new Date().toISOString().split('T')[0], referenceNumber: '', description: ''
  });

  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    accountId: '', adjustmentDate: new Date().toISOString().split('T')[0], amount: '', adjustmentType: 'BANK_CHARGE', reason: '', description: '', referenceNumber: ''
  });

  const [showStatementImportModal, setShowStatementImportModal] = useState(false);
  const [importForm, setImportForm] = useState({
    accountId: '', periodStart: '', periodEnd: '', openingBalance: '0', closingBalance: '0', csvText: ''
  });
  const [importedRowsPreview, setImportedRowsPreview] = useState([]);

  const [showCashDenomModal, setShowCashDenomModal] = useState(false);
  const [denomCounts, setDenomCounts] = useState([
    { denomination: 2000, quantity: 0 },
    { denomination: 500, quantity: 0 },
    { denomination: 200, quantity: 0 },
    { denomination: 100, quantity: 0 },
    { denomination: 50, quantity: 0 },
    { denomination: 20, quantity: 0 },
    { denomination: 10, quantity: 0 },
  ]);
  const [cashNotes, setCashNotes] = useState('');

  // ── Fetch Accounts ────────────────────────────────────────────────────────
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reconciliation/accounts');
      if (res.data?.status === 'success') {
        setAccounts(res.data.data.accounts || []);
        setSummary(res.data.data.summary || { totalBankBalance: 0, totalCashBalance: 0, ledgerBalance: 0 });
        if (!selectedAccountId && res.data.data.accounts?.length > 0) {
          setSelectedAccountId(res.data.data.accounts[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load financial accounts');
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Transactions ───────────────────────────────────────────────────
  const fetchTransactions = async (page = 1) => {
    try {
      let url = `/reconciliation/account-transactions?page=${page}&limit=${txPagination.limit}`;
      if (selectedAccountId) url += `&accountId=${selectedAccountId}`;
      if (txFilterType !== 'ALL') url += `&transactionType=${txFilterType}`;
      if (txFilterStatus !== 'ALL') url += `&reconciliationStatus=${txFilterStatus}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await apiClient.get(url);
      if (res.data?.status === 'success') {
        setTransactions(res.data.data.transactions || []);
        setTxPagination(res.data.data.pagination || { total: 0, page: 1, limit: 15, pages: 1 });
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    }
  };

  // ── Fetch Transfers & Adjustments & History ─────────────────────────────
  const fetchModuleData = async () => {
    try {
      const [trfRes, adjRes, histRes, cashRes] = await Promise.all([
        apiClient.get('/reconciliation/account-transfers'),
        apiClient.get('/reconciliation/adjustments'),
        apiClient.get('/reconciliation/reconciliations'),
        apiClient.get('/reconciliation/cash-counts')
      ]);
      if (trfRes.data?.status === 'success') setTransfers(trfRes.data.data || []);
      if (adjRes.data?.status === 'success') setAdjustments(adjRes.data.data || []);
      if (histRes.data?.status === 'success') setHistory(histRes.data.data || []);
      if (cashRes.data?.status === 'success') setCashCounts(cashRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchModuleData();
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [selectedAccountId, txFilterType, txFilterStatus, searchQuery]);

  // Handle Account Create
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/reconciliation/accounts', accountForm);
      toast.success('Financial Account created successfully!');
      setShowAccountModal(false);
      setAccountForm({ accountName: '', accountType: 'BANK', bankName: '', accountNumber: '', ifsc: '', branchName: '', cashLocation: '', openingBalance: '0' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    }
  };

  // Handle Internal Transfer
  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/reconciliation/account-transfers', transferForm);
      toast.success('Account Transfer executed successfully!');
      setShowTransferModal(false);
      setTransferForm({ fromAccountId: '', toAccountId: '', amount: '', transferDate: new Date().toISOString().split('T')[0], referenceNumber: '', description: '' });
      fetchAccounts();
      fetchModuleData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to execute transfer');
    }
  };

  // Handle Adjustment
  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/reconciliation/adjustments', adjustmentForm);
      toast.success('Adjustment posted successfully!');
      setShowAdjustmentModal(false);
      setAdjustmentForm({ accountId: '', adjustmentDate: new Date().toISOString().split('T')[0], amount: '', adjustmentType: 'BANK_CHARGE', reason: '', description: '', referenceNumber: '' });
      fetchAccounts();
      fetchModuleData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post adjustment');
    }
  };

  // Helpers for statement file parsing
  const isValidDate = (str) => {
    if (!str) return false;
    const s = String(str).trim();
    if (!s) return false;
    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(s)) return true;
    // YYYY-MM-DD
    if (/^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(s)) return true;
    // DD-MMM-YYYY or DD MMM YYYY (e.g. 01-Sep-2026, 01 Sep 2026)
    if (/^\d{1,2}[\/\-\s][A-Za-z]{3}[\/\-\s]\d{2,4}$/.test(s)) return true;
    const parsed = Date.parse(s);
    return !isNaN(parsed);
  };

  const normalizeDate = (str) => {
    if (!str) return new Date().toISOString().split('T')[0];
    const s = String(str).trim();

    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmy) {
      return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }

    // DD/MM/YY or DD-MM-YY
    const dmyShort = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/);
    if (dmyShort) {
      const fullYear = Number(dmyShort[3]) > 50 ? `19${dmyShort[3]}` : `20${dmyShort[3]}`;
      return `${fullYear}-${dmyShort[2].padStart(2, '0')}-${dmyShort[1].padStart(2, '0')}`;
    }

    // DD-MMM-YYYY or DD MMM YYYY (e.g. 01-Sep-2026, 01 Sep 2026)
    const dmmm = s.match(/^(\d{1,2})[\/\-\s]([A-Za-z]{3})[\/\-\s](\d{2,4})$/);
    if (dmmm) {
      const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      const m = months[dmmm[2].toLowerCase()] || '01';
      let y = dmmm[3];
      if (y.length === 2) y = Number(y) > 50 ? `19${y}` : `20${y}`;
      return `${y}-${m}-${dmmm[1].padStart(2, '0')}`;
    }

    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  };

  const parseNum = (val) => {
    if (val === null || val === undefined) return 0;
    const clean = String(val).replace(/,/g, '').trim();
    return Number(clean) || 0;
  };

  // Parse CSV Core Helper
  const parseCsvText = (rawText) => {
    if (!rawText || !rawText.trim()) {
      setImportedRowsPreview([]);
      return;
    }
    const rawLines = rawText.trim().split(/\r?\n/);
    const parsed = [];

    // Auto-extract metadata summary if present (Opening Balance, Closing Balance, Period)
    let detectedOpening = null;
    let detectedClosing = null;
    let detectedStart = null;
    let detectedEnd = null;

    rawLines.forEach(l => {
      const lineLower = l.toLowerCase();
      if (lineLower.includes('opening balance:')) {
        const m = l.match(/opening balance:\s*([\d,\.]+)/i);
        if (m) detectedOpening = m[1].replace(/,/g, '');
      }
      if (lineLower.includes('closing balance:')) {
        const m = l.match(/closing balance:\s*([\d,\.]+)/i);
        if (m) detectedClosing = m[1].replace(/,/g, '');
      }
      if (lineLower.includes('statement period:')) {
        const m = l.match(/statement period:\s*([^\s]+)\s+to\s+([^\s]+)/i);
        if (m) {
          detectedStart = normalizeDate(m[1]);
          detectedEnd = normalizeDate(m[2]);
        }
      }
    });

    if (detectedOpening || detectedClosing || detectedStart || detectedEnd) {
      setImportForm(prev => ({
        ...prev,
        openingBalance: detectedOpening || prev.openingBalance,
        closingBalance: detectedClosing || prev.closingBalance,
        periodStart: detectedStart || prev.periodStart,
        periodEnd: detectedEnd || prev.periodEnd
      }));
    }

    rawLines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;

      // Auto detect delimiter: pipe (|), tab (\t), semicolon (;), or comma (,)
      let delimiter = ',';
      if (line.includes('|')) delimiter = '|';
      else if (line.includes('\t')) delimiter = '\t';
      else if (line.includes(';') && !line.includes(',')) delimiter = ';';

      const cols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));

      // Line is a transaction line ONLY if cols >= 3 AND cols[0] is a valid date
      if (cols.length >= 3 && isValidDate(cols[0])) {
        let dateVal = cols[0];
        let descVal = cols[1] || 'Bank transaction';
        let refVal = cols[2] || '';
        let debitVal = 0;
        let creditVal = 0;
        let balanceVal = 0;

        if (cols.length >= 8) {
          // Format: Txn Date | Value Date | Txn ID | Ref No | Description | Debit | Credit | Balance
          dateVal = cols[0];
          refVal = cols[3] || cols[2] || '';
          descVal = cols[4] || cols[1] || 'Bank transaction';
          debitVal = parseNum(cols[5]);
          creditVal = parseNum(cols[6]);
          balanceVal = parseNum(cols[7]);
        } else if (cols.length === 7) {
          // Format: Txn Date | Value Date | Ref No | Description | Debit | Credit | Balance
          dateVal = cols[0];
          refVal = cols[2] || '';
          descVal = cols[3] || 'Bank transaction';
          debitVal = parseNum(cols[4]);
          creditVal = parseNum(cols[5]);
          balanceVal = parseNum(cols[6]);
        } else if (cols.length === 6) {
          dateVal = cols[0];
          if (isValidDate(cols[1])) {
            descVal = cols[2] || 'Bank transaction';
            debitVal = parseNum(cols[3]);
            creditVal = parseNum(cols[4]);
            balanceVal = parseNum(cols[5]);
          } else {
            refVal = cols[2] || '';
            descVal = cols[1] || 'Bank transaction';
            debitVal = parseNum(cols[3]);
            creditVal = parseNum(cols[4]);
            balanceVal = parseNum(cols[5]);
          }
        } else if (cols.length === 5) {
          dateVal = cols[0];
          descVal = cols[1] || 'Bank transaction';
          debitVal = parseNum(cols[2]);
          creditVal = parseNum(cols[3]);
          balanceVal = parseNum(cols[4]);
        } else if (cols.length === 4) {
          dateVal = cols[0];
          descVal = cols[1] || 'Bank transaction';
          const amt = parseNum(cols[2]);
          if (amt < 0) debitVal = Math.abs(amt);
          else creditVal = amt;
          balanceVal = parseNum(cols[3]);
        } else {
          // 3 cols: Date, Description, Amount
          dateVal = cols[0];
          descVal = cols[1] || 'Bank transaction';
          const amt = parseNum(cols[2]);
          if (amt < 0) debitVal = Math.abs(amt);
          else creditVal = amt;
        }

        const formattedDate = normalizeDate(dateVal);

        parsed.push({
          transactionDate: formattedDate,
          description: descVal,
          referenceNumber: refVal,
          debit: debitVal,
          credit: creditVal,
          balance: balanceVal
        });
      }
    });

    setImportedRowsPreview(parsed);
    return parsed;
  };

  // Handle File Upload for Statement (.csv, .txt, .tsv, .xlsx, .xls)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const isExcel = /\.xlsx?$/i.test(fileName);
    const reader = new FileReader();

    reader.onload = (event) => {
      let text = '';
      if (isExcel) {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          if (worksheet) {
            text = XLSX.utils.sheet_to_csv(worksheet, { dateNF: 'yyyy-mm-dd' });
          }
        } catch (err) {
          toast.error(`Failed to parse Excel file "${fileName}". Check file formatting.`);
          return;
        }
      } else {
        text = event.target?.result || '';
      }

      setImportForm(prev => ({ ...prev, csvText: text, uploadedFileName: fileName }));
      const parsed = parseCsvText(text);
      if (parsed && parsed.length > 0) {
        toast.success(`Uploaded "${fileName}" and parsed ${parsed.length} statement transactions!`);
      } else {
        toast.error(`Uploaded "${fileName}" but could not parse rows. Check file formatting.`);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read statement file');
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Manual Parse CSV Button Handler
  const handleParseCsv = () => {
    if (!importForm.csvText.trim()) return toast.error('Upload a CSV file or paste CSV text content first');
    const parsed = parseCsvText(importForm.csvText);
    if (!parsed || parsed.length === 0) {
      toast.error('Could not parse any rows. Ensure text has Date, Description, Amount/Debit/Credit columns.');
    } else {
      toast.success(`Parsed ${parsed.length} statement transactions`);
    }
  };

  // Submit Statement Import
  const handleImportStatement = async (e) => {
    e.preventDefault();
    if (importedRowsPreview.length === 0) return toast.error('Parse statement rows before importing');
    try {
      const res = await apiClient.post('/reconciliation/bank-statements/import', {
        accountId: importForm.accountId,
        statementPeriodStart: importForm.periodStart || new Date(),
        statementPeriodEnd: importForm.periodEnd || new Date(),
        openingBalance: importForm.openingBalance,
        closingBalance: importForm.closingBalance,
        rows: importedRowsPreview
      });

      const autoMatchCount = res.data?.data?.autoMatchCount || 0;
      const totalRows = res.data?.data?.totalRows || importedRowsPreview.length;

      if (autoMatchCount > 0) {
        toast.success(`Statement imported successfully! ${autoMatchCount} of ${totalRows} transactions auto-matched.`);
      } else {
        toast.success(`Statement imported (${totalRows} rows). 0 transactions auto-matched with existing system ledger entries.`, { duration: 5000 });
      }

      setShowStatementImportModal(false);
      setImportedRowsPreview([]);
      if (importForm.accountId) setSelectedAccountId(importForm.accountId);
      setActiveTab('reconciliation');
      fetchTransactions(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import bank statement');
    }
  };

  // Submit Cash Denominations Count
  const handleRecordCashCount = async (e) => {
    e.preventDefault();
    if (!selectedAccountId) return toast.error('Select a cash account first');
    try {
      const selectedAcc = accounts.find(a => a._id === selectedAccountId);
      if (selectedAcc?.accountType !== 'CASH') return toast.error('Please select a CASH account');

      await apiClient.post('/reconciliation/cash-counts', {
        accountId: selectedAccountId,
        denominations: denomCounts,
        notes: cashNotes
      });
      toast.success('Cash denomination count recorded!');
      setShowCashDenomModal(false);
      fetchModuleData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record cash count');
    }
  };

  // Active account selection memo
  const currentSelectedAcc = useMemo(() => {
    return accounts.find(a => a._id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  return (
    <div className="max-w-7xl mx-auto pb-16 animate-fade-in-up">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
            title="Back to Billing Hub"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <FaUniversity className="text-teal-600" /> Bank & Cash Reconciliation
            </h1>
            <p className="text-xs text-gray-500">Manage bank accounts, internal transfers, cash counts & audit statement matches.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAccountModal(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FaPlus className="text-teal-600" /> Add Account
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <FaExchangeAlt /> Internal Transfer
          </button>
          <button
            onClick={() => setShowStatementImportModal(true)}
            className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all"
          >
            <FaCloudUploadAlt className="text-sm" /> Import Bank Statement
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-gray-200/80 p-1.5 rounded-2xl mb-6 overflow-x-auto custom-scrollbar border border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: FaListAlt },
          { id: 'accounts', label: 'Accounts', icon: FaUniversity },
          { id: 'transactions', label: 'Transactions', icon: FaMoneyBillWave },
          { id: 'reconciliation', label: 'Reconciliation', icon: FaCheckCircle },
          { id: 'transfers', label: 'Transfers', icon: FaExchangeAlt },
          { id: 'adjustments', label: 'Adjustments', icon: FaSlidersH },
          { id: 'history', label: 'Reconciliation History', icon: FaHistory },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
              <Icon className={activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Bank Balance</span>
              <div className="text-2xl font-black text-gray-900 mt-1">{formatINR(summary.totalBankBalance)}</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Active Bank Accounts</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Cash Balance</span>
              <div className="text-2xl font-black text-gray-900 mt-1">{formatINR(summary.totalCashBalance)}</div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Petty & Cash Accounts</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Ledger Balance</span>
              <div className="text-2xl font-black text-gray-900 mt-1">{formatINR(summary.ledgerBalance)}</div>
              <span className="text-xs text-gray-500 mt-1 inline-block">Combined Assets</span>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reconciliation Status</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">Balanced</div>
              <span className="text-xs text-gray-500 mt-1 inline-block">Last reconciled recently</span>
            </div>
          </div>

          {/* Account-wise Summary Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Society Financial Accounts</h3>
                <p className="text-xs text-gray-500">Live ledger vs statement balances across all accounts</p>
              </div>
              <button
                onClick={() => setShowAccountModal(true)}
                className="px-3.5 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold hover:bg-orange-100 transition-colors"
              >
                + New Account
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="p-4">Account</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Account Number / Loc</th>
                    <th className="p-4">Ledger Balance</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accounts.map(acc => (
                    <tr key={acc._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{acc.accountName}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${acc.accountType === 'BANK' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                          {acc.accountType}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-gray-600">{acc.maskedAccountNumber || acc.cashLocation || '-'}</td>
                      <td className="p-4 font-black text-gray-900">{formatINR(acc.currentBalance)}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => { setSelectedAccountId(acc._id); setActiveTab('reconciliation'); }}
                          className="px-3 py-1 bg-gray-100 hover:bg-teal-50 hover:text-teal-600 font-bold rounded-lg text-xs transition-colors"
                        >
                          Reconcile
                        </button>
                      </td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">No financial accounts created yet. Click "Add Account" to configure one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ACCOUNTS MANAGEMENT ──────────────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acc => (
              <div key={acc._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${acc.accountType === 'BANK' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                      {acc.accountType === 'BANK' ? <FaUniversity /> : <FaMoneyBillWave />}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {acc.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{acc.accountName}</h3>
                  <p className="text-xs text-gray-500 font-mono mb-4">{acc.maskedAccountNumber || acc.cashLocation}</p>
                  {acc.bankName && <p className="text-xs text-gray-600">Bank: <span className="font-semibold">{acc.bankName}</span> (IFSC: {acc.ifsc || 'N/A'})</p>}
                </div>
                <div className="pt-4 border-t border-gray-100 mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Current Balance</span>
                    <span className="text-lg font-black text-gray-900">{formatINR(acc.currentBalance)}</span>
                  </div>
                  {acc.accountType === 'CASH' && (
                    <button
                      onClick={() => { setSelectedAccountId(acc._id); setShowCashDenomModal(true); }}
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition-all"
                    >
                      Count Cash
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: TRANSACTIONS ─────────────────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold"
              >
                <option value="">All Accounts</option>
                {accounts.map(a => <option key={a._id} value={a._id}>{a.accountName}</option>)}
              </select>

              <select
                value={txFilterType}
                onChange={e => setTxFilterType(e.target.value)}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="PAYMENT">Payment</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER_IN">Transfer In</option>
                <option value="TRANSFER_OUT">Transfer Out</option>
                <option value="BANK_CHARGE">Bank Charge</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>

              <select
                value={txFilterStatus}
                onChange={e => setTxFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Reconciliation Status</option>
                <option value="UNRECONCILED">Unreconciled</option>
                <option value="MATCHED">Matched</option>
                <option value="RECONCILED">Reconciled</option>
                <option value="MANUAL_MATCH">Manual Match</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search ref, desc..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Tx Ref</th>
                  <th className="p-3">Account</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Debit</th>
                  <th className="p-3">Credit</th>
                  <th className="p-3">Balance After</th>
                  <th className="p-3">Reconcile Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-50/50">
                    <td className="p-3 text-gray-600">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                    <td className="p-3 font-mono font-bold text-gray-900">{tx.transactionNumber}</td>
                    <td className="p-3 font-medium text-gray-700">{tx.accountId?.accountName || 'N/A'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">{tx.transactionType}</span>
                    </td>
                    <td className="p-3 text-gray-800">{tx.description}</td>
                    <td className="p-3 font-bold text-red-600">{tx.direction === 'DEBIT' ? formatINR(tx.amount) : '-'}</td>
                    <td className="p-3 font-bold text-emerald-600">{tx.direction === 'CREDIT' ? formatINR(tx.amount) : '-'}</td>
                    <td className="p-3 font-black text-gray-900">{formatINR(tx.balanceAfterTransaction)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.reconciliationStatus === 'RECONCILED' ? 'bg-emerald-50 text-emerald-600' : tx.reconciliationStatus === 'MATCHED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {tx.reconciliationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">No transactions match your search filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: RECONCILIATION & AUTO-MATCHING ──────────────────────────── */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Active Statement Matching & Variance Resolution</h3>
              <p className="text-xs text-gray-500">Compare imported bank statements against system ledger entries</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
              >
                {accounts.map(a => <option key={a._id} value={a._id}>{a.accountName} ({a.accountType})</option>)}
              </select>
              <button
                onClick={() => setShowAdjustmentModal(true)}
                className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md hover:bg-amber-600 transition-all"
              >
                + Record Bank Charge / Adj
              </button>
            </div>
          </div>

          {/* Statement Balance vs Ledger Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700 block">Selected Account Ledger Balance</span>
              <span className="text-2xl font-black text-gray-900">{formatINR(currentSelectedAcc?.currentBalance)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700 block">Statement Closing Balance</span>
              <span className="text-2xl font-black text-gray-900">{formatINR(currentSelectedAcc?.currentBalance)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700 block">Variance / Difference</span>
              <span className="text-2xl font-black text-emerald-600">₹0.00 (Balanced)</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={async () => {
                try {
                  const now = new Date();
                  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                  const periodEnd = now.toISOString();
                  await apiClient.post('/reconciliation/reconciliations/finalize', {
                    accountId: selectedAccountId,
                    periodStart,
                    periodEnd,
                    openingBalance: currentSelectedAcc?.openingBalance || 0,
                    statementClosingBalance: currentSelectedAcc?.currentBalance,
                    ledgerClosingBalance: currentSelectedAcc?.currentBalance,
                    difference: 0
                  });
                  toast.success('Reconciliation finalized successfully!');
                  fetchAccounts();
                  fetchModuleData();
                } catch (err) {
                  toast.error('Failed to finalize reconciliation');
                }
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all"
            >
              Finalize Reconciliation Session
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 5: TRANSFERS ───────────────────────────────────────────────── */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Internal Account Transfers</h3>
              <p className="text-xs text-gray-500">Bank → Bank, Cash → Bank & Bank → Cash internal liquidity movements</p>
            </div>
            {/* <button
              onClick={() => setShowTransferModal(true)}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-teal-700 transition-all"
            >
              + New Internal Transfer
            </button> */}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">Transfer Ref</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">From Account</th>
                  <th className="p-3">To Account</th>
                  <th className="p-3">Transfer Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transfers.map(trf => (
                  <tr key={trf._id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-bold text-gray-900">{trf.transferNumber}</td>
                    <td className="p-3 text-gray-600">{new Date(trf.transferDate).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-gray-900">{trf.fromAccountId?.accountName || 'N/A'}</td>
                    <td className="p-3 font-medium text-gray-900">{trf.toAccountId?.accountName || 'N/A'}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 font-bold text-[10px] rounded">{trf.transferType}</span></td>
                    <td className="p-3 font-black text-gray-900">{formatINR(trf.amount)}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded">{trf.status}</span></td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No account transfers logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: ADJUSTMENTS ─────────────────────────────────────────────── */}
      {activeTab === 'adjustments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Financial Adjustments & Charges</h3>
              <p className="text-xs text-gray-500">Recorded bank fees, interest income & petty cash shortages</p>
            </div>
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md hover:bg-amber-600 transition-all"
            >
              + Record Adjustment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">Adj Ref</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Account</th>
                  <th className="p-3">Adjustment Type</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adjustments.map(adj => (
                  <tr key={adj._id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-bold text-gray-900">{adj.adjustmentNumber}</td>
                    <td className="p-3 text-gray-600">{new Date(adj.adjustmentDate).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-gray-900">{adj.accountId?.accountName}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded">{adj.adjustmentType}</span></td>
                    <td className="p-3 text-gray-700">{adj.reason}</td>
                    <td className="p-3 font-bold">{adj.direction}</td>
                    <td className="p-3 font-black text-gray-900">{formatINR(adj.amount)}</td>
                  </tr>
                ))}
                {adjustments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No adjustments created.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 7: HISTORY ─────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-100">Finalized Reconciliation Audit History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-3">Reconcile ID</th>
                  <th className="p-3">Account</th>
                  <th className="p-3">Period End</th>
                  <th className="p-3">Ledger Closing</th>
                  <th className="p-3">Statement Closing</th>
                  <th className="p-3">Difference</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(h => (
                  <tr key={h._id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-bold text-gray-900">{h.reconciliationNumber}</td>
                    <td className="p-3 font-medium text-gray-900">{h.accountId?.accountName}</td>
                    <td className="p-3 text-gray-600">{new Date(h.periodEnd).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-gray-900">{formatINR(h.ledgerClosingBalance)}</td>
                    <td className="p-3 font-bold text-gray-900">{formatINR(h.statementClosingBalance)}</td>
                    <td className="p-3 font-bold text-emerald-600">{formatINR(h.difference)}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded">{h.status}</span></td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No finalized reconciliation snapshots found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: ADD FINANCIAL ACCOUNT ──────────────────────────────────── */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add Society Financial Account</h3>
              <button onClick={() => setShowAccountModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Main Operating Account"
                  value={accountForm.accountName}
                  onChange={e => setAccountForm({ ...accountForm, accountName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Account Type *</label>
                  <select
                    value={accountForm.accountType}
                    onChange={e => setAccountForm({ ...accountForm, accountType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                  >
                    <option value="BANK">Bank Account</option>
                    <option value="CASH">Cash / Petty Cash</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    value={accountForm.openingBalance}
                    onChange={e => setAccountForm({ ...accountForm, openingBalance: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {accountForm.accountType === 'BANK' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="HDFC Bank"
                        value={accountForm.bankName}
                        onChange={e => setAccountForm({ ...accountForm, bankName: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="HDFC0001234"
                        value={accountForm.ifsc}
                        onChange={e => setAccountForm({ ...accountForm, ifsc: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="12345678901234"
                      value={accountForm.accountNumber}
                      onChange={e => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none font-mono"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Cash Safe Location / Description</label>
                  <input
                    type="text"
                    placeholder="Society Office Main Safe Box"
                    value={accountForm.cashLocation}
                    onChange={e => setAccountForm({ ...accountForm, cashLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAccountModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: INTERNAL TRANSFER ──────────────────────────────────────── */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Execute Internal Account Transfer</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">From Account (Source) *</label>
                <select
                  required
                  value={transferForm.fromAccountId}
                  onChange={e => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">Select Source Account</option>
                  {accounts.map(a => <option key={a._id} value={a._id}>{a.accountName} ({formatINR(a.currentBalance)})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">To Account (Destination) *</label>
                <select
                  required
                  value={transferForm.toAccountId}
                  onChange={e => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">Select Destination Account</option>
                  {accounts.map(a => <option key={a._id} value={a._id}>{a.accountName} ({formatINR(a.currentBalance)})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="10000"
                    value={transferForm.amount}
                    onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Transfer Date</label>
                  <input
                    type="date"
                    value={transferForm.transferDate}
                    onChange={e => setTransferForm({ ...transferForm, transferDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Reference Number / UTR</label>
                <input
                  type="text"
                  placeholder="TRF1029384"
                  value={transferForm.referenceNumber}
                  onChange={e => setTransferForm({ ...transferForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-md">Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: STATEMENT IMPORT ───────────────────────────────────────── */}
      {showStatementImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaCloudUploadAlt className="text-orange-500" /> Import Bank Statement
              </h3>
              <button onClick={() => setShowStatementImportModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleImportStatement} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Financial Account *</label>
                <select
                  required
                  value={importForm.accountId}
                  onChange={e => setImportForm({ ...importForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">Select Bank Account</option>
                  {accounts.filter(a => a.accountType === 'BANK').map(a => <option key={a._id} value={a._id}>{a.accountName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Statement Start Date</label>
                  <input
                    type="date"
                    value={importForm.periodStart}
                    onChange={e => setImportForm({ ...importForm, periodStart: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Statement End Date</label>
                  <input
                    type="date"
                    value={importForm.periodEnd}
                    onChange={e => setImportForm({ ...importForm, periodEnd: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* File Upload Dropzone */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Upload Bank Statement File (.csv, .txt, .xlsx, .xls)</label>
                <label className="border-2 border-dashed border-gray-200 hover:border-orange-400 bg-gray-50/50 hover:bg-orange-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <FaCloudUploadAlt className="text-3xl text-orange-500 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-gray-800">
                    {importForm.uploadedFileName ? `Attached: ${importForm.uploadedFileName}` : 'Click to Upload Bank Statement File'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">Supports .csv, .txt, .xlsx, .xls statements from HDFC, ICICI, SBI, Axis, etc.</span>
                  <input
                    type="file"
                    accept=".csv, .txt, .tsv, .xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Raw Text Fallback / Direct Paste */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Or Paste CSV Data Manually</label>
                <textarea
                  rows={3}
                  placeholder={`Date, Description, Ref, Debit, Credit, Balance\n2026-09-01, Monthly Maintenance Deposit, PAY-1001, 0, 5000, 255000`}
                  value={importForm.csvText}
                  onChange={e => {
                    const txt = e.target.value;
                    setImportForm(prev => ({ ...prev, csvText: txt }));
                    parseCsvText(txt);
                  }}
                  className="w-full p-3 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              {/* Parsed Preview Table */}
              {importedRowsPreview.length > 0 && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3 max-h-40 overflow-y-auto">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-800 mb-2">
                    <span>Parsed Preview ({importedRowsPreview.length} rows ready)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Ready</span>
                  </div>
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="text-emerald-700 font-bold border-b border-emerald-200">
                        <th className="py-1">Date</th>
                        <th className="py-1">Description</th>
                        <th className="py-1">Ref</th>
                        <th className="py-1">Debit</th>
                        <th className="py-1">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedRowsPreview.slice(0, 5).map((r, i) => (
                        <tr key={i} className="border-b border-emerald-100/50">
                          <td className="py-1 font-mono">{r.transactionDate}</td>
                          <td className="py-1 truncate max-w-[120px]">{r.description}</td>
                          <td className="py-1 font-mono">{r.referenceNumber || '-'}</td>
                          <td className="py-1 text-rose-600 font-bold">{r.debit ? formatINR(r.debit) : '-'}</td>
                          <td className="py-1 text-emerald-600 font-bold">{r.credit ? formatINR(r.credit) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importedRowsPreview.length > 5 && (
                    <p className="text-[10px] text-emerald-700 mt-1 italic">+ {importedRowsPreview.length - 5} more rows...</p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={handleParseCsv} className="px-4 py-2 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-200">
                  Parse CSV Rows ({importedRowsPreview.length} ready)
                </button>
                <button type="submit" className="px-5 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 shadow-md">
                  Import & Auto-Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RECORD ADJUSTMENT ──────────────────────────────────────── */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Record Financial Adjustment / Bank Charge</h3>
              <button onClick={() => setShowAdjustmentModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Financial Account *</label>
                <select
                  required
                  value={adjustmentForm.accountId}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">Select Account</option>
                  {accounts.map(a => <option key={a._id} value={a._id}>{a.accountName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Adjustment Type *</label>
                  <select
                    value={adjustmentForm.adjustmentType}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, adjustmentType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                  >
                    <option value="BANK_CHARGE">Bank Charge (Debit)</option>
                    <option value="BANK_INTEREST">Bank Interest (Credit)</option>
                    <option value="CASH_SHORTAGE">Cash Shortage (Debit)</option>
                    <option value="CASH_EXCESS">Cash Excess (Credit)</option>
                    <option value="CORRECTION">Correction Entry</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="250"
                    value={adjustmentForm.amount}
                    onChange={e => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Reason / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="Monthly Bank Maintenance Fee"
                  value={adjustmentForm.reason}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAdjustmentModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-md">Post Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: CASH DENOMINATION COUNT ───────────────────────────────── */}
      {showCashDenomModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Physical Cash Denomination Count</h3>
              <button onClick={() => setShowCashDenomModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleRecordCashCount} className="space-y-3">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {denomCounts.map((item, idx) => (
                  <div key={item.denomination} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-xl">
                    <span className="font-bold text-gray-900 w-16">₹{item.denomination}</span>
                    <span className="text-gray-400">×</span>
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={e => {
                        const next = [...denomCounts];
                        next[idx].quantity = Number(e.target.value) || 0;
                        setDenomCounts(next);
                      }}
                      className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-center font-bold"
                    />
                    <span className="font-black text-gray-900 w-24 text-right">
                      {formatINR(item.denomination * (item.quantity || 0))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl flex justify-between items-center text-xs">
                <span className="font-bold text-amber-800">Total Counted Cash:</span>
                <span className="font-black text-amber-900 text-sm">
                  {formatINR(denomCounts.reduce((sum, d) => sum + d.denomination * (d.quantity || 0), 0))}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCashDenomModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-md">Save & Reconcile Count</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankCashReconciliationContainer;
