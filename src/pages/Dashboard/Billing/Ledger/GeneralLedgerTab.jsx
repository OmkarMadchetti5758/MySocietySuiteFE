import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaBookOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ledgerService from '../../../../services/ledger.service';

const GeneralLedgerTab = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState(null);

  const fetchGL = async () => {
    setLoading(true);
    try {
      const res = await ledgerService.getGeneralLedger({ search, limit: 100 }); // Getting up to 100 recent lines
      if (res.data?.data) {
        setEntries(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err) {
      toast.error('Failed to load general ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGL();
  }, []);

  const formatINR = (amount) => amount ? '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search account code, name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchGL()}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          onClick={fetchGL}
          className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors w-full sm:w-auto"
        >
          Refresh Data
        </button>
      </div>

      <div className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
              <tr className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Journal #</th>
                <th className="py-4 px-6">Account</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Debit</th>
                <th className="py-4 px-6 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-500">
                    <FaSpinner className="animate-spin text-3xl mx-auto mb-3 text-cyan-600" />
                    Loading General Ledger...
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map((line) => (
                  <tr key={line._id} className="hover:bg-cyan-50/30 transition-colors text-sm group">
                    <td className="py-3 px-6 whitespace-nowrap text-gray-500 text-xs font-medium">
                      {new Date(line.postedAt || line.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">
                      <div className="font-mono text-xs font-bold text-gray-900">{line.journalId?.journalNumber}</div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="font-semibold text-gray-800">{line.accountId?.accountName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{line.accountId?.accountCode}</div>
                    </td>
                    <td className="py-3 px-6 text-gray-600">
                      {line.description}
                      {line.journalId?.isReversal && <span className="ml-2 bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-bold">REVERSAL</span>}
                    </td>
                    <td className="py-3 px-6 text-right font-medium text-gray-900">{formatINR(line.debit)}</td>
                    <td className="py-3 px-6 text-right font-medium text-gray-900">{formatINR(line.credit)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-gray-500">
                    <FaBookOpen className="text-4xl text-gray-200 mx-auto mb-3" />
                    No entries found in General Ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralLedgerTab;
