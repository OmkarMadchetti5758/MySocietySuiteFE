import { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaExchangeAlt, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function TransactionsTab({ isAdmin, isAccountant, isResidentView }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, isResidentView]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Pass type param; 'all' is handled by the backend
      const params = typeFilter !== 'all' ? `?type=${typeFilter}` : '';
      const res = await apiClient.get(`/advance-deposits/transactions${params}`);
      if (res.data?.status === 'success') {
        setTransactions(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

  const filteredTxns = transactions.filter(txn => {
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const flatMatch = txn.flatId?.flatNumber?.toLowerCase().includes(query);
      const resMatch = txn.residentId?.name?.toLowerCase().includes(query);
      const typeMatch = txn.transactionType?.toLowerCase().includes(query);
      const descMatch = txn.description?.toLowerCase().includes(query);
      if (!flatMatch && !resMatch && !typeMatch && !descMatch) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{isResidentView ? 'My Transaction History' : 'Transaction History'}</h2>
          <p className="text-xs text-gray-500">
            {isResidentView ? 'View your personal advance allocations, credits, and security deposit transactions.' : 'Unified view of all advance and security deposit transactions.'}
          </p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All Transactions</option>
          <option value="advance">Advance Account Txns</option>
          <option value="deposit">Security Deposit Txns</option>
        </select>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search transactions..."
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
              <th className="py-4 px-6">Date & Time</th>
              <th className="py-4 px-6">Flat & Resident</th>
              <th className="py-4 px-6">Source</th>
              <th className="py-4 px-6">Type & Description</th>
              <th className="py-4 px-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-indigo-500" />
                  Loading transactions...
                </td>
              </tr>
            ) : filteredTxns.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTxns.map((txn) => (
                <tr key={txn._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{new Date(txn.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{txn.flatId?.flatNumber}</div>
                    <div className="text-xs text-gray-500">{txn.residentId?.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    {txn._source === 'advance' ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded border bg-indigo-50 text-indigo-600 border-indigo-100">Advance</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 rounded border bg-teal-50 text-teal-600 border-teal-100">Deposit</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-800">{txn.transactionType.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{txn.description}</div>
                  </td>
                  <td className="py-4 px-6 text-right font-medium">
                    {txn.direction === 'CREDIT' ? (
                      <span className="text-emerald-600 flex items-center justify-end gap-1">
                        <FaArrowLeft className="text-[10px]" /> {formatINR(txn.amount)}
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center justify-end gap-1">
                        {formatINR(txn.amount)} <FaArrowRight className="text-[10px]" />
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
