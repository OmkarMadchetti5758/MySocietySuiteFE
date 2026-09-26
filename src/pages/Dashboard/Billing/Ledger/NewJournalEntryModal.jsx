import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSpinner, FaBalanceScale } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ledgerService from '../../../../services/ledger.service';

const NewJournalEntryModal = ({ onClose, onSuccess }) => {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    referenceType: 'MANUAL',
    referenceNumber: '',
  });

  const [lines, setLines] = useState([
    { accountId: '', debit: '', credit: '', description: '' },
    { accountId: '', debit: '', credit: '', description: '' },
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await ledgerService.getChartOfAccounts({ status: 'ACTIVE' });
        if (res.data?.data?.accounts) {
          setAccounts(res.data.data.accounts);
        }
      } catch (err) {
        toast.error('Failed to load accounts');
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    if (field === 'debit') {
      newLines[index].debit = value;
      if (value && Number(value) > 0) newLines[index].credit = ''; // Clear credit if debit is entered
    } else if (field === 'credit') {
      newLines[index].credit = value;
      if (value && Number(value) > 0) newLines[index].debit = ''; // Clear debit if credit is entered
    } else {
      newLines[index][field] = value;
    }
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { accountId: '', debit: '', credit: '', description: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length <= 2) {
      toast.error('A journal entry must have at least 2 lines');
      return;
    }
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) return toast.error('Description is required');
    if (!isBalanced) return toast.error('Journal entry must be balanced');
    
    // Check if any line has no account
    if (lines.some(l => !l.accountId)) return toast.error('Please select an account for all lines');
    if (lines.some(l => (Number(l.debit)||0) === 0 && (Number(l.credit)||0) === 0)) {
      return toast.error('Every line must have a debit or credit amount');
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        lines: lines.map(l => ({
          accountId: l.accountId,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description || formData.description
        }))
      };
      await ledgerService.createJournalEntry(payload);
      toast.success('Journal entry created (Draft)');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create journal entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Journal Entry</h2>
            <p className="text-xs text-gray-500">Create a manual double-entry voucher</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 hover:text-gray-600 p-2 rounded-full transition-colors">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* Header Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Journal Description / Narration *</label>
                <input 
                  type="text" required 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" 
                  placeholder="e.g. Booking audit fees for FY25-26"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
                <input 
                  type="date" required 
                  value={formData.transactionDate}
                  onChange={e => setFormData({...formData, transactionDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" 
                />
              </div>
            </div>

            {/* Lines Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                  <tr className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 w-1/3">Account</th>
                    <th className="py-3 px-4">Line Description</th>
                    <th className="py-3 px-4 w-32 text-right">Debit (₹)</th>
                    <th className="py-3 px-4 w-32 text-right">Credit (₹)</th>
                    <th className="py-3 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {lines.map((line, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="p-2">
                        <select 
                          required
                          value={line.accountId}
                          onChange={e => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full border-none bg-transparent focus:ring-0 text-sm font-medium text-gray-800 cursor-pointer"
                        >
                          <option value="" disabled>Select Account</option>
                          {accounts.map(a => (
                            <option key={a._id} value={a._id}>{a.accountCode} - {a.accountName}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={line.description}
                          onChange={e => handleLineChange(idx, 'description', e.target.value)}
                          placeholder="Line narration (optional)"
                          className="w-full border-none bg-transparent focus:ring-0 text-sm text-gray-600 placeholder-gray-300"
                        />
                      </td>
                      <td className="p-2 border-l border-gray-100">
                        <input 
                          type="number" min="0" step="0.01"
                          value={line.debit}
                          onChange={e => handleLineChange(idx, 'debit', e.target.value)}
                          disabled={Boolean(line.credit && Number(line.credit) > 0)}
                          placeholder="0.00"
                          className="w-full border-none bg-transparent focus:ring-0 text-right text-sm font-medium text-gray-900 placeholder-gray-300 disabled:opacity-30"
                        />
                      </td>
                      <td className="p-2 border-l border-gray-100">
                        <input 
                          type="number" min="0" step="0.01"
                          value={line.credit}
                          onChange={e => handleLineChange(idx, 'credit', e.target.value)}
                          disabled={Boolean(line.debit && Number(line.debit) > 0)}
                          placeholder="0.00"
                          className="w-full border-none bg-transparent focus:ring-0 text-right text-sm font-medium text-gray-900 placeholder-gray-300 disabled:opacity-30"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          type="button" 
                          onClick={() => removeLine(idx)}
                          className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FaTrash size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50/50 p-2 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={addLine}
                  className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-cyan-50 transition-colors"
                >
                  <FaPlus size={10} /> Add Line
                </button>
              </div>
            </div>

            {/* Totals & Balance Checker */}
            <div className={`p-4 rounded-xl flex items-center justify-between border ${isBalanced ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-3">
                <FaBalanceScale className={`text-2xl ${isBalanced ? 'text-emerald-500' : 'text-red-400'}`} />
                <div>
                  <div className={`text-sm font-bold ${isBalanced ? 'text-emerald-800' : 'text-red-800'}`}>
                    {isBalanced ? 'Entry is Balanced' : 'Entry is Out of Balance'}
                  </div>
                  {!isBalanced && totalDebit > 0 && totalCredit > 0 && (
                    <div className="text-xs text-red-600 mt-0.5">
                      Difference: ₹{Math.abs(totalDebit - totalCredit).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Debit</div>
                  <div className="text-lg font-mono font-bold text-gray-900">₹{totalDebit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Credit</div>
                  <div className="text-lg font-mono font-bold text-gray-900">₹{totalCredit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                </div>
              </div>
            </div>

          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting || !isBalanced || loadingAccounts}
              className="px-6 py-2.5 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJournalEntryModal;
