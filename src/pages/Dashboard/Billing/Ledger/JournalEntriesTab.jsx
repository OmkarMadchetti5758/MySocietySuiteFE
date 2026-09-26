import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaFileInvoiceDollar, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ledgerService from '../../../../services/ledger.service';
import NewJournalEntryModal from './NewJournalEntryModal';

const JournalEntriesTab = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await ledgerService.listJournalEntries({ 
        status: statusFilter,
        search: search || undefined
      });
      if (res.data?.data) {
        setEntries(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [statusFilter]); // trigger on status change

  const handleAction = async (id, actionStr, apiCall, reason = '') => {
    setActionLoading(id);
    try {
      await apiCall(id, reason);
      toast.success(`Journal entry ${actionStr} successfully`);
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${actionStr} entry`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'POSTED': return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold">POSTED</span>;
      case 'PENDING_APPROVAL': return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-md text-[11px] font-bold">PENDING APPROVAL</span>;
      case 'APPROVED': return <span className="bg-cyan-50 text-cyan-600 border border-cyan-200 px-2.5 py-1 rounded-md text-[11px] font-bold">APPROVED</span>;
      case 'DRAFT': return <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md text-[11px] font-bold">DRAFT</span>;
      case 'REVERSED': return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-1 rounded-md text-[11px] font-bold">REVERSED</span>;
      case 'REJECTED': return <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md text-[11px] font-bold">REJECTED</span>;
      default: return <span>{status}</span>;
    }
  };

  // Filter client side as well for search
  const filteredEntries = entries.filter(je => 
    !search || 
    je.journalNumber.toLowerCase().includes(search.toLowerCase()) || 
    je.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-1 w-full gap-4">
          <div className="relative flex-1 max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by journal # or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEntries()}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="POSTED">Posted</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors shadow-sm"
        >
          <FaPlus /> New Manual Entry
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-500"><FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-cyan-600" />Loading journals...</div>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map(je => (
            <div key={je._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gray-50/50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">{je.journalNumber}</span>
                    {getStatusBadge(je.status)}
                    {je.isAutomatic && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">AUTO</span>}
                    {je.isReversal && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold">REVERSAL</span>}
                  </div>
                  <div className="text-sm text-gray-800 font-medium">{je.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Date: {new Date(je.transactionDate).toLocaleDateString()} • Ref: {je.referenceType} {je.referenceNumber ? `(${je.referenceNumber})` : ''}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {je.status === 'DRAFT' && !je.isAutomatic && (
                    <button 
                      onClick={() => handleAction(je._id, 'submitted', ledgerService.submitJournalEntry)}
                      disabled={actionLoading === je._id}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold"
                    >
                      Submit for Approval
                    </button>
                  )}
                  {je.status === 'PENDING_APPROVAL' && (
                    <>
                      <button 
                        onClick={() => handleAction(je._id, 'approved', ledgerService.approveJournalEntry)}
                        disabled={actionLoading === je._id}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button 
                        onClick={() => {
                          const reason = window.prompt("Enter rejection reason:");
                          if (reason) handleAction(je._id, 'rejected', ledgerService.rejectJournalEntry, reason);
                        }}
                        disabled={actionLoading === je._id}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <FaTimes /> Reject
                      </button>
                    </>
                  )}
                  {(je.status === 'APPROVED' || je.status === 'DRAFT') && !je.isAutomatic && (
                    <button 
                      onClick={() => handleAction(je._id, 'posted', ledgerService.postJournalEntry)}
                      disabled={actionLoading === je._id}
                      className="px-3 py-1.5 bg-cyan-600 text-white hover:bg-cyan-700 rounded-lg text-xs font-bold"
                    >
                      Post to Ledger
                    </button>
                  )}
                  {je.status === 'POSTED' && !je.reversedByJournalId && (
                    <button 
                      onClick={() => {
                        const reason = window.prompt("Enter reversal reason:");
                        if (reason) handleAction(je._id, 'reversed', ledgerService.reverseJournalEntry, reason);
                      }}
                      disabled={actionLoading === je._id}
                      className="px-3 py-1.5 border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <FaUndo /> Reverse
                    </button>
                  )}
                </div>
              </div>

              {/* Journal Lines */}
              <div className="px-6 py-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-2 font-semibold">Account</th>
                      <th className="pb-2 font-semibold">Description</th>
                      <th className="pb-2 font-semibold text-right">Debit (₹)</th>
                      <th className="pb-2 font-semibold text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {je.lines?.map((line, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="py-2.5 font-medium text-gray-800">
                          {line.accountId?.accountCode} - {line.accountId?.accountName}
                        </td>
                        <td className="py-2.5 text-gray-500 text-xs">{line.description}</td>
                        <td className="py-2.5 text-right font-medium text-gray-900">{line.debit > 0 ? line.debit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : ''}</td>
                        <td className="py-2.5 text-right font-medium text-gray-900">{line.credit > 0 ? line.credit.toLocaleString('en-IN', {minimumFractionDigits: 2}) : ''}</td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="border-t border-gray-100 font-bold bg-gray-50/50">
                      <td colSpan="2" className="py-2.5 text-right text-gray-600 text-xs">TOTALS</td>
                      <td className="py-2.5 text-right text-gray-900 text-sm">{je.totalDebit?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="py-2.5 text-right text-gray-900 text-sm">{je.totalCredit?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
            No journal entries found matching criteria.
          </div>
        )}
      </div>

      {showCreateModal && (
        <NewJournalEntryModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEntries();
          }}
        />
      )}
    </div>
  );
};

export default JournalEntriesTab;
