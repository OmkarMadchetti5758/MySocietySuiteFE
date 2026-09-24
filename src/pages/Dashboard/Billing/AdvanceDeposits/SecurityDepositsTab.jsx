import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaHistory, FaUndo, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';
import CollectDepositModal from './CollectDepositModal';

export default function SecurityDepositsTab({ isAdmin, isAccountant, isResidentView }) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedRefundDeposit, setSelectedRefundDeposit] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Statement Modal State
  const [statementDeposit, setStatementDeposit] = useState(null);
  const [statementData, setStatementData] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);

  // Adjust Deposit Modal State
  const [adjustDepositDoc, setAdjustDepositDoc] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, [isResidentView]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/advance-deposits/security-deposits');
      if (res.data?.status === 'success') {
        setDeposits(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load security deposits');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatement = async (dep) => {
    try {
      setStatementDeposit(dep);
      setStatementLoading(true);
      const res = await apiClient.get(`/advance-deposits/security-deposits/${dep._id}/statement`);
      if (res.data?.status === 'success') {
        setStatementData(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load statement');
    } finally {
      setStatementLoading(false);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustDepositDoc) return;
    try {
      setAdjustSubmitting(true);
      await apiClient.post(`/advance-deposits/security-deposits/${adjustDepositDoc._id}/adjustments`, {
        amount: Number(adjustAmount),
        reason: adjustReason,
      });
      toast.success('Deposit adjusted successfully');
      setAdjustDepositDoc(null);
      setAdjustAmount('');
      setAdjustReason('');
      fetchDeposits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust deposit');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const handleRequestRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRefundDeposit) return;
    try {
      setSubmittingRefund(true);
      await apiClient.post(`/advance-deposits/security-deposits/${selectedRefundDeposit._id}/refund-request`, {
        requestedAmount: Number(refundAmount) || selectedRefundDeposit.refundableBalance,
        reason: refundReason || 'Resident requested refund',
        paymentMethod: 'BANK_TRANSFER',
      });
      toast.success('Refund request submitted successfully');
      setSelectedRefundDeposit(null);
      setRefundReason('');
      setRefundAmount('');
      fetchDeposits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const formatINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

  const filteredDeposits = deposits.filter(dep => {
    if (statusFilter !== 'ALL' && dep.status !== statusFilter) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const nameMatch = dep.residentId?.name?.toLowerCase().includes(query);
      const typeMatch = dep.depositTypeName?.toLowerCase().includes(query);
      const flatMatch = dep.flatId?.flatNumber?.toLowerCase().includes(query);
      if (!nameMatch && !typeMatch && !flatMatch) return false;
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PARTIALLY_ADJUSTED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'REFUND_PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'REFUNDED': return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'CLOSED':
      case 'CANCELLED': return 'bg-gray-100 text-gray-400 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{isResidentView ? 'My Security Deposits' : 'Security Deposits'}</h2>
          <p className="text-xs text-gray-500">
            {isResidentView ? 'Security deposits held for your flat (Parking, Amenity, Move-in, Tenant).' : 'Manage refundable security deposits collected from residents.'}
          </p>
        </div>
        {!isResidentView ? (
          (isAdmin || isAccountant) && (
            <button
              onClick={() => setIsCollectModalOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 w-fit cursor-pointer"
            >
              <FaPlus /> Collect Deposit
            </button>
          )
        ) : (
          <button
            onClick={() => {
              const eligible = deposits.find(d => d.refundableBalance > 0 && d.status !== 'REFUND_PENDING');
              if (eligible) {
                setSelectedRefundDeposit(eligible);
                setRefundAmount(eligible.refundableBalance);
              } else {
                toast.error('No eligible deposit available for refund request.');
              }
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 w-fit cursor-pointer"
          >
            <FaUndo /> Request Refund
          </button>
        )}
      </div>

      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PARTIALLY_ADJUSTED">Partially Adjusted</option>
          <option value="REFUND_PENDING">Refund Pending</option>
          <option value="REFUNDED">Refunded</option>
          <option value="CLOSED">Closed</option>
        </select>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search by flat, resident, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
              <th className="py-4 px-6">Flat & Resident</th>
              <th className="py-4 px-6">Deposit Type</th>
              <th className="py-4 px-6">Original Amt</th>
              <th className="py-4 px-6">Refundable Bal</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-teal-500" />
                  Loading deposits...
                </td>
              </tr>
            ) : filteredDeposits.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                  No security deposits found.
                </td>
              </tr>
            ) : (
              filteredDeposits.map((dep) => (
                <tr key={dep._id} className="border-b border-gray-50 hover:bg-teal-50/20 transition-colors text-sm">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{dep.flatId?.flatNumber}</div>
                    <div className="text-xs text-gray-500">{dep.residentId?.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-800">{dep.depositTypeName}</div>
                    <div className="text-[10px] text-gray-400">{new Date(dep.receivedDate).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-600">
                    {formatINR(dep.originalAmount)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-gray-900">{formatINR(dep.refundableBalance)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getStatusColor(dep.status)}`}>
                      {dep.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenStatement(dep)}
                        title="View Statement"
                        className="p-2 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FaHistory />
                      </button>

                      {!isResidentView && (isAdmin || isAccountant) && dep.refundableBalance > 0 && !['REFUNDED', 'CLOSED', 'CANCELLED'].includes(dep.status) && (
                        <button
                          onClick={() => {
                            setAdjustDepositDoc(dep);
                            setAdjustAmount('');
                            setAdjustReason('');
                          }}
                          title="Adjust Deposit"
                          className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FaMoneyBillWave className="text-[10px]" /> Adjust
                        </button>
                      )}

                      {dep.refundableBalance > 0 && dep.status !== 'REFUND_PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedRefundDeposit(dep);
                            setRefundAmount(dep.refundableBalance);
                          }}
                          title="Request Refund"
                          className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FaUndo className="text-[10px]" /> Request Refund
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

      <CollectDepositModal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        onSuccess={fetchDeposits}
      />

      {/* Refund Request Modal */}
      {selectedRefundDeposit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Request Deposit Refund</h3>
            <p className="text-xs text-gray-500">
              Submit a refund request for <span className="font-semibold text-gray-700">{selectedRefundDeposit.depositTypeName}</span> ({selectedRefundDeposit.flatId?.flatNumber}).
            </p>

            <form onSubmit={handleRequestRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Eligible Refundable Balance</label>
                <div className="p-3 bg-teal-50/50 rounded-xl text-lg font-black text-teal-900 border border-teal-100">
                  {formatINR(selectedRefundDeposit.refundableBalance)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Refund Amount Requested (₹)</label>
                <input
                  type="number"
                  max={selectedRefundDeposit.refundableBalance}
                  min={1}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Refund Request</label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Move out complete, key returned, parking surrendered..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRefundDeposit(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingRefund ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Statement Modal */}
      {statementDeposit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Deposit Statement</h3>
                <p className="text-xs text-gray-500">
                  {statementDeposit.depositTypeName} ({statementDeposit.residentId?.name} - Flat {statementDeposit.flatId?.flatNumber})
                </p>
              </div>
              <button onClick={() => setStatementDeposit(null)} className="text-gray-400 hover:text-gray-700 font-bold text-lg">✕</button>
            </div>

            {statementLoading ? (
              <div className="py-12 text-center"><FaSpinner className="animate-spin text-2xl mx-auto text-teal-600" /></div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Original</span>
                    <p className="text-sm font-black text-gray-900">{formatINR(statementData?.calculation?.originalDeposit)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Adjusted</span>
                    <p className="text-sm font-black text-blue-600">{formatINR(statementData?.calculation?.totalAdjustments)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Refunded</span>
                    <p className="text-sm font-black text-red-600">{formatINR(statementData?.calculation?.totalRefunded)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500">Refundable</span>
                    <p className="text-sm font-black text-teal-900">{formatINR(statementData?.calculation?.refundableBalance)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Deposit Activity Ledger</h4>
                  {statementData?.transactions?.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No transactions recorded yet.</p>
                  ) : (
                    <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                      {statementData?.transactions?.map((t) => (
                        <div key={t._id} className="p-3 text-xs flex justify-between items-center hover:bg-gray-50">
                          <div>
                            <span className="font-bold text-gray-900">{t.transactionType?.replace(/_/g, ' ')}</span>
                            <p className="text-gray-500 text-[11px]">{t.notes || t.description || t.reason}</p>
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

      {/* Adjust Deposit Modal */}
      {adjustDepositDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Adjust Security Deposit</h3>
            <p className="text-xs text-gray-500">
              Deposit: {adjustDepositDoc.depositTypeName} | Refundable Balance: <span className="font-bold text-teal-600">{formatINR(adjustDepositDoc.refundableBalance)}</span>
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deduction / Adjustment Amount (₹)</label>
                <input
                  type="number"
                  max={adjustDepositDoc.refundableBalance}
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adjustment Reason</label>
                <textarea
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Penalty for amenity damage, outstanding maintenance adjustment..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustDepositDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {adjustSubmitting ? 'Adjusting...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
