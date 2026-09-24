import { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaCheck, FaTimes, FaCog } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function RefundsTab({ isAdmin, isAccountant, isResidentView }) {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals State
  const [rejectRefundDoc, setRejectRefundDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const [processRefundDoc, setProcessRefundDoc] = useState(null);
  const [processReference, setProcessReference] = useState('');
  const [processNotes, setProcessNotes] = useState('');
  const [processSubmitting, setProcessSubmitting] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, [isResidentView]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/advance-deposits/deposit-refunds');
      if (res.data?.status === 'success') {
        setRefunds(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (refDoc) => {
    try {
      await apiClient.post(`/advance-deposits/deposit-refunds/${refDoc._id}/approve`, {
        approvedAmount: refDoc.requestedAmount,
      });
      toast.success('Refund request approved!');
      fetchRefunds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve refund request');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRefundDoc) return;
    try {
      setRejectSubmitting(true);
      await apiClient.post(`/advance-deposits/deposit-refunds/${rejectRefundDoc._id}/reject`, {
        reason: rejectReason,
      });
      toast.success('Refund request rejected');
      setRejectRefundDoc(null);
      setRejectReason('');
      fetchRefunds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject refund request');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!processRefundDoc) return;
    try {
      setProcessSubmitting(true);
      await apiClient.post(`/advance-deposits/deposit-refunds/${processRefundDoc._id}/process`, {
        referenceNumber: processReference,
        notes: processNotes,
      });
      toast.success('Refund payment processed successfully!');
      setProcessRefundDoc(null);
      setProcessReference('');
      setProcessNotes('');
      fetchRefunds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessSubmitting(false);
    }
  };

  const formatINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

  const filteredRefunds = refunds.filter(ref => {
    if (statusFilter !== 'ALL' && ref.status !== statusFilter) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const flatMatch = ref.flatId?.flatNumber?.toLowerCase().includes(query);
      const resMatch = ref.residentId?.name?.toLowerCase().includes(query);
      if (!flatMatch && !resMatch) return false;
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED':
      case 'UNDER_REVIEW': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'APPROVED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'REJECTED':
      case 'FAILED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{isResidentView ? 'My Refund Requests' : 'Deposit Refunds'}</h2>
          <p className="text-xs text-gray-500">
            {isResidentView ? 'Track the status and details of your security deposit refund requests.' : 'Manage security deposit refund requests and processing.'}
          </p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="REQUESTED">Requested</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search refunds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
              <th className="py-4 px-6">Request Date</th>
              <th className="py-4 px-6">Flat & Resident</th>
              <th className="py-4 px-6">Amount Requested</th>
              <th className="py-4 px-6">Method</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-amber-500" />
                  Loading refunds...
                </td>
              </tr>
            ) : filteredRefunds.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                  No refund requests found.
                </td>
              </tr>
            ) : (
              filteredRefunds.map((ref) => (
                <tr key={ref._id} className="border-b border-gray-50 hover:bg-amber-50/20 transition-colors text-sm">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{new Date(ref.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{ref.flatId?.flatNumber}</div>
                    <div className="text-xs text-gray-500">{ref.residentId?.name}</div>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">
                    {formatINR(ref.requestedAmount)}
                  </td>
                  <td className="py-4 px-6 text-gray-700 text-xs font-medium">
                    {ref.paymentMethod?.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getStatusColor(ref.status)}`}>
                      {ref.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {!isResidentView && (isAdmin || isAccountant) && (
                      <div className="flex justify-end gap-2">
                        {ref.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => handleApproveRefund(ref)}
                              title="Approve"
                              className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => {
                                setRejectRefundDoc(ref);
                                setRejectReason('');
                              }}
                              title="Reject"
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {ref.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              setProcessRefundDoc(ref);
                              setProcessReference('');
                              setProcessNotes('');
                            }}
                            title="Process Refund"
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5"
                          >
                            <FaCog /> Process
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Refund Modal */}
      {rejectRefundDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Reject Refund Request</h3>
            <p className="text-xs text-gray-500">
              Request for {formatINR(rejectRefundDoc.requestedAmount)} (Flat {rejectRefundDoc.flatId?.flatNumber}).
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="State reason for rejecting refund..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectRefundDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {rejectSubmitting ? 'Rejecting...' : 'Reject Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {processRefundDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Process Refund Payment</h3>
            <p className="text-xs text-gray-500">
              Approved Amount: <span className="font-bold text-emerald-600">{formatINR(processRefundDoc.approvedAmount || processRefundDoc.requestedAmount)}</span> (Flat {processRefundDoc.flatId?.flatNumber})
            </p>

            <form onSubmit={handleProcessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bank / UTR Reference Number</label>
                <input
                  type="text"
                  value={processReference}
                  onChange={(e) => setProcessReference(e.target.value)}
                  placeholder="e.g. UTR-9847291038"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Processing Notes</label>
                <textarea
                  rows={2}
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  placeholder="Internal notes or payout account details..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProcessRefundDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {processSubmitting ? 'Processing...' : 'Complete Refund Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
