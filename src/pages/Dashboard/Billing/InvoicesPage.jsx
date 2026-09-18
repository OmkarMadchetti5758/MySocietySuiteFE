import React, { useState, useEffect, useCallback } from 'react';
import {
  FaFileInvoiceDollar, FaPlus, FaSearch, FaChevronLeft, FaChevronRight,
  FaExclamationTriangle, FaMoneyBillWave, FaEye, FaCheckCircle,
  FaRegClock, FaBan, FaSpinner, FaBolt
} from 'react-icons/fa';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

import GenerateInvoiceModal from './GenerateInvoiceModal';
import OneTimeChargeModal from './OneTimeChargeModal';
import { InvoiceDetailModal, RecordPaymentModal } from './InvoiceModals';
import ResidentPayNowModal from './Payments/ResidentPayNowModal';

// ── Helpers & Constants ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  GENERATED: { label: 'Generated', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  PAID: { label: 'Paid', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  PARTIALLY_PAID: { label: 'Partial', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  partially_paid: { label: 'Partial', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  OVERDUE: { label: 'Overdue', color: 'bg-red-50 text-red-600 border-red-100' },
  overdue: { label: 'Overdue', color: 'bg-red-50 text-red-600 border-red-100' },
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  unpaid: { label: 'Unpaid', color: 'bg-orange-50 text-orange-600 border-orange-100' },
};

const OTC_STATUS_CONFIG = {
  PENDING: { label: 'Pending Invoice', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  INCLUDED: { label: 'Invoiced', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const periodLabel = (p) => {
  if (!p) return '—';
  if (p.includes('-Q')) {
    const [y, q] = p.split('-');
    return `${q} ${y}`;
  }
  const [y, m] = p.split('-');
  return new Date(y, Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};
const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// ── Components ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-500 border-gray-200' };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const OtcStatusBadge = ({ status }) => {
  const cfg = OTC_STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-500 border-gray-200' };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const SummaryCard = ({ label, value, color, icon: Icon, onClick, active }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col gap-2 cursor-pointer transition-all duration-200 hover:shadow-md ${active ? 'border-orange-400 ring-2 ring-orange-400/20' : 'border-gray-100'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="text-lg" />
    </div>
    <div className="text-2xl font-black text-gray-900">{value ?? <FaSpinner className="animate-spin text-gray-400" />}</div>
    <div className="text-xs text-gray-500 font-medium">{label}</div>
  </div>
);

// ── Main InvoicesPage Component ───────────────────────────────────────────────

const InvoicesPage = () => {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const roleKeys = currentUser.roleKeys || [];
  const isAccountant = roleKeys.includes('accountant');
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin' || roleKeys.includes('admin');
  const isResident = currentUser.role === 'resident_owner' || roleKeys.includes('resident_owner') || (!isAdmin && !isAccountant);
  const canGenerate = (isAccountant || isAdmin) && !isResident;

  // Active Tab: 'invoices' | 'oneTimeCharges'
  const [activeTab, setActiveTab] = useState('invoices');

  // Invoices State
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [flats, setFlats] = useState([]);

  // Invoices Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState(currentPeriod());
  const [page, setPage] = useState(1);

  // One-Time Charges State
  const [oneTimeCharges, setOneTimeCharges] = useState([]);
  const [oneTimePagination, setOneTimePagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loadingOneTime, setLoadingOneTime] = useState(false);
  const [oneTimeSearch, setOneTimeSearch] = useState('');
  const [oneTimeStatusFilter, setOneTimeStatusFilter] = useState('ALL');
  const [oneTimePage, setOneTimePage] = useState(1);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showOneTimeModal, setShowOneTimeModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState(null);
  const [residentPaymentTarget, setResidentPaymentTarget] = useState(null);
  const [activeStatFilter, setActiveStatFilter] = useState(null);

  // Load stats
  const loadStats = useCallback(() => {
    const endpoint = isResident ? '/billing/my/invoices/stats' : '/billing/invoices/stats';
    apiClient.get(endpoint)
      .then(res => setStats(res.data?.data || null))
      .catch(() => { });
  }, [isResident]);

  // Load invoices
  const loadInvoices = useCallback(() => {
    setLoading(true);
    const endpoint = isResident ? '/billing/my/invoices' : '/billing/invoices';
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.set('search', search);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (periodFilter) params.set('billingPeriod', periodFilter);

    apiClient.get(`${endpoint}?${params}`)
      .then(res => {
        const data = res.data?.data;
        setInvoices(data?.invoices || (Array.isArray(data) ? data : []));
        if (data?.pagination) setPagination(data.pagination);
      })
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false));
  }, [search, statusFilter, periodFilter, page, isResident]);

  // Load One-Time Charges
  const loadOneTimeCharges = useCallback(() => {
    setLoadingOneTime(true);
    const params = new URLSearchParams({ page: oneTimePage, limit: 20 });
    if (oneTimeStatusFilter !== 'ALL') params.set('status', oneTimeStatusFilter);
    if (periodFilter) params.set('billingPeriod', periodFilter);

    apiClient.get(`/billing/one-time-charges?${params}`)
      .then(res => {
        const data = res.data?.data;
        setOneTimeCharges(data?.charges || (Array.isArray(data) ? data : []));
        if (data?.pagination) setOneTimePagination(data.pagination);
      })
      .catch(() => toast.error('Failed to load one-time charges'))
      .finally(() => setLoadingOneTime(false));
  }, [oneTimeStatusFilter, periodFilter, oneTimePage]);

  // Load flats for modals (admin/staff only)
  const loadFlats = useCallback(() => {
    if (!canGenerate) return;
    apiClient.get('/flats').then(res => {
      const data = res.data?.data?.flats || res.data?.data || res.data?.flats || [];
      setFlats(Array.isArray(data) ? data : []);
    }).catch(() => {
      toast.error('Could not load flat list');
    });
  }, [canGenerate]);

  useEffect(() => { loadStats(); loadFlats(); }, [loadStats, loadFlats]);
  useEffect(() => { loadInvoices(); }, [loadInvoices]);
  useEffect(() => { if (activeTab === 'oneTimeCharges') loadOneTimeCharges(); }, [activeTab, loadOneTimeCharges]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); loadInvoices(); }, 400);
    return () => clearTimeout(t);
  }, [search, loadInvoices]);

  const handleStatClick = (statusKey) => {
    const map = { paid: 'PAID', partiallyPaid: 'PARTIALLY_PAID', unpaid: 'UNPAID', overdue: 'OVERDUE' };
    const s = map[statusKey] || 'ALL';
    setStatusFilter(activeStatFilter === statusKey ? 'ALL' : s);
    setActiveStatFilter(activeStatFilter === statusKey ? null : statusKey);
    setPage(1);
  };

  const handleRefresh = () => {
    loadStats();
    loadInvoices();
    if (activeTab === 'oneTimeCharges') loadOneTimeCharges();
  };

  const STAT_CARDS = [
    { key: 'total', label: 'Total Invoices', color: 'bg-blue-100 text-blue-600', icon: FaFileInvoiceDollar },
    { key: 'paid', label: 'Paid', color: 'bg-emerald-100 text-emerald-600', icon: FaCheckCircle },
    { key: 'partiallyPaid', label: 'Partial', color: 'bg-amber-100 text-amber-600', icon: FaRegClock },
    { key: 'unpaid', label: 'Unpaid', color: 'bg-orange-100 text-orange-600', icon: FaExclamationTriangle },
    { key: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-600', icon: FaBan },
  ];

  const filteredOneTimeCharges = oneTimeCharges.filter(c => {
    if (!oneTimeSearch.trim()) return true;
    const q = oneTimeSearch.toLowerCase();
    return (
      (c.description || '').toLowerCase().includes(q) ||
      (c.flatNumber || '').toLowerCase().includes(q) ||
      (c.createdByName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            {isResident ? 'My Invoices & Bills' : 'Invoices & Charges'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isResident ? 'View your billing statement, outstanding dues, and pay online.' : 'Generate and manage society invoices, bills, and one-time charges.'}
          </p>
        </div>
        {canGenerate && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { loadFlats(); setShowOneTimeModal(true); }}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <FaPlus className="text-xs" /> One-Time Charge
            </button>
            <button
              onClick={() => { loadFlats(); setShowGenerateModal(true); }}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2"
            >
              <FaPlus className="text-xs" /> Generate Invoice
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards (for invoices) */}
      {activeTab === 'invoices' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {STAT_CARDS.map(card => (
            <SummaryCard
              key={card.key}
              label={card.label}
              value={stats?.[card.key]}
              color={card.color}
              icon={card.icon}
              active={activeStatFilter === card.key}
              onClick={() => card.key !== 'total' ? handleStatClick(card.key) : setStatusFilter('ALL')}
            />
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 font-semibold text-sm">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'invoices' ? 'border-orange-500 text-orange-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FaFileInvoiceDollar /> Invoices
        </button>
        <button
          onClick={() => setActiveTab('oneTimeCharges')}
          className={`py-3 px-6 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'oneTimeCharges' ? 'border-orange-500 text-orange-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <FaBolt /> One-Time Charges
        </button>
      </div>

      {/* TAB 1: INVOICES TABLE */}
      {activeTab === 'invoices' && (
        <>
          {/* Filters */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search by invoice #, flat, resident..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setActiveStatFilter(null); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Status</option>
              <option value="GENERATED">Generated</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <input
              type="month"
              value={periodFilter}
              onChange={e => { setPeriodFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />

            {(search || statusFilter !== 'ALL' || periodFilter !== currentPeriod()) && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('ALL'); setPeriodFilter(currentPeriod()); setActiveStatFilter(null); setPage(1); }}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-4 px-5">Invoice No.</th>
                    <th className="py-4 px-5">Flat</th>
                    <th className="py-4 px-5">Wing</th>
                    {!isResident && <th className="py-4 px-5">Resident</th>}

                    <th className="py-4 px-5">Due Date</th>
                    <th className="py-4 px-5 text-right">Amount</th>
                    <th className="py-4 px-5 text-right">Fine</th>
                    <th className="py-4 px-5 text-right">Paid</th>
                    <th className="py-4 px-5 text-right">Balance</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50 animate-pulse">
                        {Array.from({ length: isResident ? 10 : 11 }).map((_, j) => (
                          <td key={j} className="py-4 px-5"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                        ))}
                      </tr>
                    ))
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={isResident ? 10 : 11} className="py-16 text-center">
                        <FaFileInvoiceDollar className="text-4xl text-gray-200 mx-auto mb-3" />
                        <div className="text-gray-500 font-medium">No invoices found</div>
                        <div className="text-gray-400 text-sm mt-1">
                          {isResident ? 'You have no invoices for this period' : 'Try changing filters or generate invoices'}
                        </div>
                        {canGenerate && (
                          <button
                            onClick={() => setShowGenerateModal(true)}
                            className="mt-4 px-5 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all"
                          >
                            Generate First Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => {
                      const fine = inv.fineAmount || 0;
                      const totalPayable = (inv.totalAmount || 0) + fine;
                      const balance = Math.max(0, totalPayable - (inv.paidAmount || 0));
                      return (
                        <tr
                          key={inv._id}
                          className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors group text-sm"
                        >
                          <td className="py-3.5 px-5">
                            <div className="font-mono text-xs font-bold text-orange-600">{inv.invoiceNumber}</div>
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-gray-700">
                            {inv.flatNumber || '—'}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-gray-700">
                            {inv.wingName || inv.wing || inv.blockName || 'Wing A'}
                          </td>
                          {!isResident && (
                            <td className="py-3.5 px-5">
                              <div className="text-gray-700">{inv.residentName || '—'}</div>
                            </td>
                          )}

                          <td className="py-3.5 px-5 text-gray-600">{fmtDate(inv.dueDate)}</td>
                          <td className="py-3.5 px-5 text-right font-bold text-gray-900">{fmt(inv.totalAmount)}</td>
                          <td className="py-3.5 px-5 text-right font-semibold text-purple-600">{fine > 0 ? fmt(fine) : '—'}</td>
                          <td className="py-3.5 px-5 text-right text-emerald-600 font-semibold">{fmt(inv.paidAmount)}</td>
                          <td className={`py-3.5 px-5 text-right font-bold ${balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{fmt(balance)}</td>
                          <td className="py-3.5 px-5"><StatusBadge status={inv.status} /></td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-100">
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                title="View Details"
                                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <FaEye />
                              </button>
                              {canGenerate && !['PAID', 'paid', 'CANCELLED'].includes(inv.status) && balance > 0 && (
                                <button
                                  onClick={() => setPaymentTargetInvoice(inv)}
                                  title="Record Payment"
                                  className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <FaMoneyBillWave />
                                </button>
                              )}
                              {isResident && !['PAID', 'paid', 'CANCELLED'].includes(inv.status) && balance > 0 && (
                                <button
                                  onClick={() => setResidentPaymentTarget(inv)}
                                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm ml-2"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} invoices
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <span className="text-xs font-bold text-gray-700 px-2">{pagination.page} / {pagination.pages}</span>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: ONE-TIME CHARGES TABLE */}
      {activeTab === 'oneTimeCharges' && (
        <>
          {/* Filters */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search description, flat, created by..."
                value={oneTimeSearch}
                onChange={e => setOneTimeSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <select
              value={oneTimeStatusFilter}
              onChange={e => { setOneTimeStatusFilter(e.target.value); setOneTimePage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Invoice</option>
              <option value="INCLUDED">Invoiced</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <input
              type="month"
              value={periodFilter}
              onChange={e => { setPeriodFilter(e.target.value); setOneTimePage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />

            {(oneTimeSearch || oneTimeStatusFilter !== 'ALL' || periodFilter !== currentPeriod()) && (
              <button
                onClick={() => { setOneTimeSearch(''); setOneTimeStatusFilter('ALL'); setPeriodFilter(currentPeriod()); setOneTimePage(1); }}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-4 px-5">Description</th>
                    <th className="py-4 px-5">Flat</th>
                    <th className="py-4 px-5">Wing</th>
                    <th className="py-4 px-5">Effective Date</th>
                    <th className="py-4 px-5 text-right">Base Amount</th>
                    <th className="py-4 px-5 text-right">Tax (GST)</th>
                    <th className="py-4 px-5 text-right">Total Amount</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOneTime ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50 animate-pulse">
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j} className="py-4 px-5"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredOneTimeCharges.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <FaBolt className="text-4xl text-gray-200 mx-auto mb-3" />
                        <div className="text-gray-500 font-medium">No one-time charges found</div>
                        <div className="text-gray-400 text-sm mt-1">
                          Try changing filters or add a new one-time charge
                        </div>
                        {canGenerate && (
                          <button
                            onClick={() => { loadFlats(); setShowOneTimeModal(true); }}
                            className="mt-4 px-5 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all"
                          >
                            Add One-Time Charge
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredOneTimeCharges.map(charge => (
                      <tr
                        key={charge._id}
                        className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors text-sm"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-gray-900">{charge.description}</div>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-gray-900">
                          {charge.flatNumber || '—'}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-gray-700">
                          {charge.wingName || charge.wing || charge.blockName || 'Wing A'}
                        </td>
                        <td className="py-3.5 px-5 text-gray-600">{fmtDate(charge.effectiveDate)}</td>
                        <td className="py-3.5 px-5 text-right text-gray-700 font-medium">{fmt(charge.amount)}</td>
                        <td className="py-3.5 px-5 text-right text-gray-500 font-medium">
                          {charge.taxRate ? `${charge.taxRate}% (${fmt(charge.taxAmount)})` : 'Exempt'}
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-gray-900">{fmt(charge.totalAmount)}</td>
                        <td className="py-3.5 px-5"><OtcStatusBadge status={charge.status} /></td>
                        <td className="py-3.5 px-5 text-gray-600 text-xs">{charge.createdByName || 'Admin'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {oneTimePagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Showing {((oneTimePagination.page - 1) * oneTimePagination.limit) + 1}–{Math.min(oneTimePagination.page * oneTimePagination.limit, oneTimePagination.total)} of {oneTimePagination.total} charges
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={oneTimePage === 1}
                    onClick={() => setOneTimePage(p => p - 1)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <span className="text-xs font-bold text-gray-700 px-2">{oneTimePagination.page} / {oneTimePagination.pages}</span>
                  <button
                    disabled={oneTimePage === oneTimePagination.pages}
                    onClick={() => setOneTimePage(p => p + 1)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {showGenerateModal && (
        <GenerateInvoiceModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={handleRefresh}
          flats={flats}
        />
      )}

      {showOneTimeModal && (
        <OneTimeChargeModal
          onClose={() => setShowOneTimeModal(false)}
          onSuccess={handleRefresh}
          flats={flats}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onRecordPayment={setPaymentTargetInvoice}
          currentUser={currentUser}
        />
      )}

      {paymentTargetInvoice && (
        <RecordPaymentModal
          invoice={paymentTargetInvoice}
          onClose={() => setPaymentTargetInvoice(null)}
          onSuccess={handleRefresh}
        />
      )}

      {residentPaymentTarget && (
        <ResidentPayNowModal
          isOpen={true}
          invoice={residentPaymentTarget}
          onClose={() => setResidentPaymentTarget(null)}
          onSuccess={() => {
            setResidentPaymentTarget(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
};

export default InvoicesPage;
