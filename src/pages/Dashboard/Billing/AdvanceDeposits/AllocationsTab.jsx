import { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaUndo, FaFileInvoiceDollar } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function AllocationsTab({ isAdmin, isAccountant, isResidentView }) {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Reversal Modal State
  const [reversalAlloc, setReversalAlloc] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversalSubmitting, setReversalSubmitting] = useState(false);

  useEffect(() => {
    fetchAllocations();
  }, [isResidentView]);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/advance-deposits/advance-allocations');
      if (res.data?.status === 'success') {
        setAllocations(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleReverseSubmit = async (e) => {
    e.preventDefault();
    if (!reversalAlloc) return;
    try {
      setReversalSubmitting(true);
      await apiClient.post(`/advance-deposits/advance-allocations/${reversalAlloc._id}/reverse`, {
        reason: reversalReason,
      });
      toast.success('Allocation reversed successfully');
      setReversalAlloc(null);
      setReversalReason('');
      fetchAllocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reverse allocation');
    } finally {
      setReversalSubmitting(false);
    }
  };

  const formatINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

  const filteredAllocations = allocations.filter(alloc => {
    if (statusFilter !== 'ALL' && alloc.status !== statusFilter) return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const flatMatch = alloc.flatId?.flatNumber?.toLowerCase().includes(query);
      const resMatch = alloc.residentId?.name?.toLowerCase().includes(query);
      const invMatch = alloc.invoiceId?.invoiceNumber?.toLowerCase().includes(query);
      if (!flatMatch && !resMatch && !invMatch) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Advance Allocations</h2>
          <p className="text-xs text-gray-500">History of advance balances applied to invoices.</p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="REVERSED">Reversed</option>
        </select>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search allocations..."
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
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Flat & Resident</th>
              <th className="py-4 px-6">Invoice Reference</th>
              <th className="py-4 px-6">Amount</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-indigo-500" />
                  Loading allocations...
                </td>
              </tr>
            ) : filteredAllocations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                  No allocations found.
                </td>
              </tr>
            ) : (
              filteredAllocations.map((alloc) => (
                <tr key={alloc._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{new Date(alloc.allocationDate).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{alloc.flatId?.flatNumber}</div>
                    <div className="text-xs text-gray-500">{alloc.residentId?.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-800 flex items-center gap-1">
                      <FaFileInvoiceDollar className="text-gray-400" /> {alloc.invoiceId?.invoiceNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">
                    {formatINR(alloc.amount)}
                  </td>
                  <td className="py-4 px-6">
                    {alloc.status === 'ACTIVE' ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">ACTIVE</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-50 text-red-600 border border-red-100">REVERSED</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {!isResidentView && (isAdmin || isAccountant) && alloc.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          setReversalAlloc(alloc);
                          setReversalReason('');
                        }}
                        title="Reverse Allocation"
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-block cursor-pointer"
                      >
                        <FaUndo />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reverse Allocation Modal */}
      {reversalAlloc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Reverse Advance Allocation</h3>
            <p className="text-xs text-gray-500">
              Allocation of <span className="font-bold text-gray-900">{formatINR(reversalAlloc.amount)}</span> for Invoice #{reversalAlloc.invoiceId?.invoiceNumber} (Flat {reversalAlloc.flatId?.flatNumber}).
            </p>

            <form onSubmit={handleReverseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Reversal</label>
                <textarea
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Allocation error, invoice revision, resident request..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReversalAlloc(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversalSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {reversalSubmitting ? 'Reversing...' : 'Confirm Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
