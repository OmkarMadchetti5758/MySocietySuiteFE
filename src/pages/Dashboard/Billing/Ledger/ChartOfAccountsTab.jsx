import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSpinner, FaLock, FaCheckCircle, FaBan, FaSeedling } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ledgerService from '../../../../services/ledger.service';

const ChartOfAccountsTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountCode: '',
    accountName: '',
    accountType: 'ASSET',
    normalBalanceType: 'DEBIT',
    description: '',
    openingBalance: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await ledgerService.getChartOfAccounts();
      if (res.data?.data?.accounts) {
        setAccounts(res.data.data.accounts);
      }
    } catch (err) {
      toast.error('Failed to load chart of accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSeed = async () => {
    if (!window.confirm('Are you sure you want to seed the default chart of accounts?')) return;
    try {
      await ledgerService.seedChartOfAccounts();
      toast.success('Chart of accounts seeded successfully');
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed accounts');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ledgerService.createAccount(newAccount);
      toast.success('Account created successfully');
      setShowAddModal(false);
      fetchAccounts();
      setNewAccount({ accountCode: '', accountName: '', accountType: 'ASSET', normalBalanceType: 'DEBIT', description: '', openingBalance: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this account?')) return;
    try {
      await ledgerService.deactivateAccount(id);
      toast.success('Account deactivated');
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate account');
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.accountName.toLowerCase().includes(search.toLowerCase()) || 
    acc.accountCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search account code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {accounts.length === 0 && !loading && (
            <button 
              onClick={handleSeed}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
            >
              <FaSeedling /> Seed Defaults
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors"
          >
            <FaPlus /> New Account
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold rounded-tl-xl">Code</th>
              <th className="py-3 px-4 font-semibold">Account Name</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Normal Bal</th>
              <th className="py-3 px-4 font-semibold text-right">Current Bal</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold rounded-tr-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="7" className="py-12 text-center text-gray-500"><FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-cyan-600" />Loading chart of accounts...</td></tr>
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map(acc => (
                <tr key={acc._id} className="hover:bg-cyan-50/30 transition-colors text-sm">
                  <td className="py-3 px-4 font-mono font-medium text-gray-900">{acc.accountCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {acc.accountName} {acc.isSystemAccount && <FaLock className="text-gray-400 text-xs" title="System Account" />}
                    </div>
                    {acc.parentAccountId && <div className="text-xs text-gray-500">Sub-account of {acc.parentAccountId.accountName}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-[11px] font-bold tracking-wide">
                      {acc.accountType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 font-medium">{acc.normalBalanceType}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    <span className={acc.currentBalance < 0 ? 'text-red-600' : 'text-gray-900'}>
                      ₹{Math.abs(acc.currentBalance || 0).toLocaleString('en-IN')} {acc.currentBalance !== 0 ? (acc.currentBalance > 0 === (acc.normalBalanceType === 'DEBIT') ? 'Dr' : 'Cr') : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {acc.status === 'ACTIVE' 
                      ? <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold"><FaCheckCircle /> Active</span>
                      : <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-bold"><FaBan /> Inactive</span>
                    }
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!acc.isSystemAccount && acc.status === 'ACTIVE' && (
                      <button onClick={() => handleDeactivate(acc._id)} className="text-xs text-red-600 font-semibold hover:bg-red-50 px-2 py-1 rounded">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="py-12 text-center text-gray-500">No accounts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 animate-scale-in shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Create New Account</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Account Code</label>
                  <input type="text" required value={newAccount.accountCode} onChange={e => setNewAccount({...newAccount, accountCode: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g. 5080" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Account Name</label>
                  <input type="text" required value={newAccount.accountName} onChange={e => setNewAccount({...newAccount, accountName: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g. Event Expenses" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Account Type</label>
                  <select value={newAccount.accountType} onChange={e => {
                    const type = e.target.value;
                    const normal = ['ASSET', 'EXPENSE'].includes(type) ? 'DEBIT' : 'CREDIT';
                    setNewAccount({...newAccount, accountType: type, normalBalanceType: normal});
                  }} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-cyan-500">
                    <option value="ASSET">Asset</option>
                    <option value="LIABILITY">Liability</option>
                    <option value="EQUITY">Equity</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Normal Balance</label>
                  <select value={newAccount.normalBalanceType} onChange={e => setNewAccount({...newAccount, normalBalanceType: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-cyan-500">
                    <option value="DEBIT">Debit (Dr)</option>
                    <option value="CREDIT">Credit (Cr)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Opening Balance (₹)</label>
                <input type="number" min="0" value={newAccount.openingBalance} onChange={e => setNewAccount({...newAccount, openingBalance: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description (Optional)</label>
                <textarea rows="2" value={newAccount.description} onChange={e => setNewAccount({...newAccount, description: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting ? <FaSpinner className="animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccountsTab;
