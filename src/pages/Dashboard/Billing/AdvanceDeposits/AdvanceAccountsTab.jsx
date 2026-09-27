import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaExchangeAlt, FaHistory } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';
import AddAdvanceModal from './AddAdvanceModal';

export default function AdvanceAccountsTab({ isAdmin, isAccountant, isResidentView }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Action Modals State
  const [statementAccount, setStatementAccount] = useState(null);
  const [statementData, setStatementData] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);

  const [allocateAccount, setAllocateAccount] = useState(null);
  const [allocateInvoices, setAllocateInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [allocateAmount, setAllocateAmount] = useState('');
  const [allocateSubmitting, setAllocateSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [isResidentView]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/advance-deposits/advance-accounts');
      if (res.data?.status === 'success') {
        setAccounts(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load advance accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatement = async (acc) => {
    try {
      setStatementAccount(acc);
      setStatementLoading(true);
      const res = await apiClient.get(`/advance-deposits/advance-accounts/${acc._id}/statement`);
      if (res.data?.status === 'success') {
        setStatementData(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load statement');
    } finally {
      setStatementLoading(false);
    }
  };

  const handleOpenAllocate = async (acc) => {
    try {
      setAllocateAccount(acc);
      setAllocateAmount('');
      setSelectedInvoiceId('');
      // Fetch unpaid invoices specifically for this flat
      const flatId = String(acc.flatId?._id || acc.flatId || '');
      const res = await apiClient.get(`/billing/invoices?flatId=${flatId}&limit=100`);
      const invs = res.data?.data?.invoices || res.data?.invoices || res.data?.data || res.data || [];
      const pendingInvoices = (Array.isArray(invs) ? invs : []).filter(inv => {
        const invFlatId = String(inv.flatId?._id || inv.flatId || '');
        const statusUpper = String(inv.status || inv.paymentStatus || '').toUpperCase();
        const isPaid = statusUpper === 'PAID';
        const isCancelled = statusUpper === 'CANCELLED' || statusUpper === 'DRAFT';
        const isTargetFlat = !flatId || invFlatId === flatId || String(inv.flatNumber || '') === String(acc.flatId?.flatNumber || '');
        return isTargetFlat && !isPaid && !isCancelled;
      });
      setAllocateInvoices(pendingInvoices);
    } catch (err) {
      toast.error('Failed to load pending invoices for allocation');
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocateAccount || !selectedInvoiceId) return;
    try {
      setAllocateSubmitting(true);
      await apiClient.post(`/advance-deposits/advance-accounts/${allocateAccount._id}/allocate`, {
        invoiceId: selectedInvoiceId,
        amount: Number(allocateAmount),
      });
      toast.success('Advance allocated to invoice successfully!');
      setAllocateAccount(null);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate advance');
    } finally {
      setAllocateSubmitting(false);
    }
  };

  const formatINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

  const filteredAccounts = accounts.filter(acc => {
    if (statusFilter !== 'ALL' && acc.status !== statusFilter) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const nameMatch = acc.residentId?.name?.toLowerCase().includes(query);
      const accMatch = acc.accountNumber?.toLowerCase().includes(query);
      const flatMatch = acc.flatId?.flatNumber?.toLowerCase().includes(query);
      if (!nameMatch && !accMatch && !flatMatch) return false;
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'ZERO_BALANCE': return 'bg-gray-50 text-gray-600 border-gray-100';
      case 'BLOCKED': return 'bg-red-50 text-red-600 border-red-100';
      case 'CLOSED': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{isResidentView ? 'My Advance Account' : 'Advance Accounts'}</h2>
          <p className="text-xs text-gray-500">
            {isResidentView ? 'Your active advance balance available for upcoming dues.' : 'Manage resident advance balances for future maintenance deductions.'}
          </p>
        </div>
        {!isResidentView ? (
          (isAdmin || isAccountant) && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 w-fit cursor-pointer"
            >
              <FaPlus /> Add Advance
            </button>
          )
        ) : (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 w-fit cursor-pointer"
          >
            <FaPlus /> Add Advance
          </button>
        )}
      </div>

      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ZERO_BALANCE">Zero Balance</option>
          <option value="BLOCKED">Blocked</option>
          <option value="CLOSED">Closed</option>
        </select>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search by flat, resident, account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
              <th className="py-4 px-6">Account & Flat</th>
              <th className="py-4 px-6">Resident</th>
              <th className="py-4 px-6">Balance</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-indigo-500" />
                  Loading accounts...
                </td>
              </tr>
            ) : filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                  No advance accounts found.
                </td>
              </tr>
            ) : (
              filteredAccounts.map((acc) => (
                <tr key={acc._id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors text-sm">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{acc.accountNumber}</div>
                    <div className="text-xs text-gray-500">Flat: {acc.flatId?.flatNumber}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    <div className="font-semibold text-gray-900">{acc.residentId?.name}</div>
                    <div className="text-xs text-gray-500">{acc.residentId?.phone || acc.residentId?.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-gray-900">{formatINR(acc.currentBalance)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getStatusColor(acc.status)}`}>
                      {acc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenStatement(acc)}
                        title="View Statement"
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FaHistory />
                      </button>
                      {!isResidentView && (isAdmin || isAccountant) && acc.currentBalance > 0 && (
                        <button
                          onClick={() => handleOpenAllocate(acc)}
                          title="Allocate to Invoice"
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaExchangeAlt />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddAdvanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAccounts}
        isResidentView={isResidentView}
      />

      {/* Statement Modal */}
      {statementAccount && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Account Statement</h3>
                <p className="text-xs text-gray-500">
                  {statementAccount.accountNumber} ({statementAccount.residentId?.name} - Flat {statementAccount.flatId?.flatNumber})
                </p>
              </div>
              <button onClick={() => setStatementAccount(null)} className="text-gray-400 hover:text-gray-700 font-bold text-lg">✕</button>
            </div>

            {statementLoading ? (
              <div className="py-12 text-center"><FaSpinner className="animate-spin text-2xl mx-auto text-indigo-600" /></div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Total Credits</span>
                    <p className="text-base font-black text-emerald-600">{formatINR(statementData?.summary?.totalCredits)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Total Debits</span>
                    <p className="text-base font-black text-red-600">{formatINR(statementData?.summary?.totalDebits)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Current Balance</span>
                    <p className="text-base font-black text-indigo-900">{formatINR(statementData?.summary?.currentBalance)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Transaction History</h4>
                  {statementData?.transactions?.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No transactions recorded yet.</p>
                  ) : (
                    <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                      {statementData?.transactions?.map((t) => (
                        <div key={t._id} className="p-3 text-xs flex justify-between items-center hover:bg-gray-50">
                          <div>
                            <span className="font-bold text-gray-900">{t.transactionType?.replace(/_/g, ' ')}</span>
                            <p className="text-gray-500 text-[11px]">{t.description}</p>
                            <span className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleString()}</span>
                          </div>
                          <span className={`font-bold ${t.direction === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {t.direction === 'CREDIT' ? '+' : '-'}{formatINR(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Allocate Advance Modal */}
      {allocateAccount && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Allocate Advance to Invoice</h3>
            <p className="text-xs text-gray-500">
              Account: {allocateAccount.accountNumber} | Available Balance: <span className="font-bold text-emerald-600">{formatINR(allocateAccount.currentBalance)}</span>
            </p>

            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Pending Invoice</label>
                {allocateInvoices.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                    No pending unpaid invoices found for flat {allocateAccount.flatId?.flatNumber}.
                  </p>
                ) : (
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => {
                      setSelectedInvoiceId(e.target.value);
                      const inv = allocateInvoices.find(i => i._id === e.target.value);
                      if (inv) {
                        const outstanding = inv.totalAmount - (inv.paidAmount || 0);
                        setAllocateAmount(Math.min(allocateAccount.currentBalance, outstanding));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  >
                    <option value="">-- Choose Invoice --</option>
                    {allocateInvoices.map(inv => (
                      <option key={inv._id} value={inv._id}>
                        Inv #{inv.invoiceNumber} - Due: ₹{inv.totalAmount - (inv.paidAmount || 0)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Allocation Amount (₹)</label>
                <input
                  type="number"
                  max={allocateAccount.currentBalance}
                  min={1}
                  value={allocateAmount}
                  onChange={(e) => setAllocateAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocateAccount(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocateSubmitting || !selectedInvoiceId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {allocateSubmitting ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
