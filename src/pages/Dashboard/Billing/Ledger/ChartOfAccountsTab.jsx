import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSeedling, FaSpinner, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ledgerService from '../../../../services/ledger.service';

/* ─── Group metadata ──────────────────────────────────────────────────────── */
const GROUPS = {
  ASSET: { name: 'Assets', side: 'Debit', desc: 'What the society owns or is owed', ex: 'Bank, cash, dues from flats', hint: 'Assets increase on the debit side.', dotColor: 'bg-cyan-600', tabBorder: 'border-t-cyan-600', tabRing: 'ring-cyan-500', typeAccent: 'border-l-cyan-600', typeBg: 'has-checked:bg-cyan-50 has-checked:ring-2 has-checked:ring-cyan-500' },
  LIABILITY: { name: 'Liabilities', side: 'Credit', desc: 'What the society holds for others', ex: 'Advances, deposits, GST', hint: 'Liabilities increase on the credit side.', dotColor: 'bg-amber-600', tabBorder: 'border-t-amber-600', tabRing: 'ring-amber-500', typeAccent: 'border-l-amber-600', typeBg: 'has-checked:bg-amber-50 has-checked:ring-2 has-checked:ring-amber-500' },
  EQUITY: { name: 'Equity', side: 'Credit', desc: 'Reserves & surplus', ex: 'Reserve fund, sinking fund', hint: 'Equity increases on the credit side.', dotColor: 'bg-violet-600', tabBorder: 'border-t-violet-600', tabRing: 'ring-violet-500', typeAccent: 'border-l-violet-600', typeBg: 'has-checked:bg-violet-50 has-checked:ring-2 has-checked:ring-violet-500' },
  INCOME: { name: 'Income', side: 'Credit', desc: 'Money earned', ex: 'Maintenance, parking, fines', hint: 'Income accounts increase on the credit side.', dotColor: 'bg-emerald-600', tabBorder: 'border-t-emerald-600', tabRing: 'ring-emerald-500', typeAccent: 'border-l-emerald-600', typeBg: 'has-checked:bg-emerald-50 has-checked:ring-2 has-checked:ring-emerald-500' },
  EXPENSE: { name: 'Expenses', side: 'Debit', desc: 'Money spent', ex: 'Salary, repairs, electricity', hint: 'Expense accounts increase on the debit side.', dotColor: 'bg-rose-500', tabBorder: 'border-t-rose-500', tabRing: 'ring-rose-500', typeAccent: 'border-l-rose-500', typeBg: 'has-checked:bg-rose-50 has-checked:ring-2 has-checked:ring-rose-500' },
};

const inr = (n) => '₹' + Math.abs(n).toLocaleString('en-IN');

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function buildKids(list) {
  const m = {};
  list.forEach((a) => {
    const pk = a.parentAccountId?._id || a.parentAccountId || 'root';
    (m[pk] ||= []).push(a);
  });
  return m;
}

function rollup(acc, kids) {
  return (acc.currentBalance || 0) + (kids[acc._id] || []).reduce((s, c) => s + rollup(c, kids), 0);
}

/* ─── Component ───────────────────────────────────────────────────────────── */
const ChartOfAccountsTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [openNodes, setOpenNodes] = useState(new Set());
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [localToast, setLocalToast] = useState('');

  /* local toast */
  useEffect(() => {
    if (!localToast) return;
    const t = setTimeout(() => setLocalToast(''), 2400);
    return () => clearTimeout(t);
  }, [localToast]);

  /* fetch */
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ledgerService.getChartOfAccounts();
      const list = res.data?.data?.accounts || [];
      setAccounts(list);
      setOpenNodes(new Set(list.filter((a) => !a.parentAccountId).map((a) => a._id)));
    } catch {
      toast.error('Failed to load chart of accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  /* derived */
  const kids = useMemo(() => buildKids(accounts), [accounts]);
  const roots = useMemo(
    () => accounts.filter((a) => !a.parentAccountId && !a.parentAccountId?._id && (tab === 'all' || a.accountType === tab)),
    [accounts, tab]
  );
  const q = search.trim().toLowerCase();
  const matches = useCallback((a) => {
    if (!q) return true;
    if ((a.accountCode + a.accountName).toLowerCase().includes(q)) return true;
    return (kids[a._id] || []).some((c) => matches(c));
  }, [q, kids]);

  const rows = useMemo(() => {
    const out = [];
    const walk = (a, depth) => {
      if (!showInactive && a.status === 'INACTIVE') return;
      if (!matches(a)) return;
      const children = kids[a._id] || [];
      const isOpen = !!(q || expandAll || openNodes.has(a._id));
      out.push({ a, depth, hasKids: children.length > 0, isOpen });
      if (children.length && isOpen) children.forEach((c) => walk(c, depth + 1));
    };
    roots.forEach((r) => walk(r, 0));
    return out;
  }, [roots, kids, openNodes, showInactive, expandAll, q, matches]);

  const tabTotals = useMemo(() => {
    const t = {};
    Object.keys(GROUPS).forEach((type) => {
      t[type] = accounts
        .filter((a) => a.accountType === type && !a.parentAccountId && !a.parentAccountId?._id)
        .reduce((s, r) => s + rollup(r, kids), 0);
    });
    return t;
  }, [accounts, kids]);

  const toggleNode = (id) =>
    setOpenNodes((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* handlers */
  const handleSeed = async () => {
    if (!window.confirm('Seed the default chart of accounts?')) return;
    try {
      await ledgerService.seedChartOfAccounts();
      toast.success('Default accounts seeded!');
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed accounts');
    }
  };

  const handleDeactivate = async (acc) => {
    if (!window.confirm(`Deactivate "${acc.accountName}"?`)) return;
    try {
      await ledgerService.deactivateAccount(acc._id);
      setLocalToast(`${acc.accountName} deactivated`);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    }
  };

  /* form helpers */
  const parentOptions = useCallback((type) => {
    const out = [];
    const go = (a, d) => {
      if (a.status === 'INACTIVE') return;
      if (a.financialAccountId) return;
      out.push({ ...a, d });
      (kids[a._id] || []).forEach((c) => go(c, d + 1));
    };
    // Use accounts directly to find roots – avoids kids.root key issues
    // when parentAccountId comes back as null/undefined from the API.
    accounts
      .filter((a) => a.accountType === type && !a.parentAccountId && !a.parentAccountId?._id)
      .forEach((r) => go(r, 0));
    return out;
  }, [accounts, kids]);

  const nextCode = useCallback((parentId) => {
    const sibs = (kids[parentId] || []).map((k) => Number(k.accountCode)).filter(Number.isFinite);
    const parent = accounts.find((a) => a._id === parentId);
    if (!parent) return '';
    return sibs.length ? String(Math.max(...sibs) + 1) : parent.accountCode + '1';
  }, [kids, accounts]);

  const openForm = (parentAcc = null) => {
    const type = parentAcc?.accountType || (tab !== 'all' ? tab : 'ASSET');
    const opts = parentOptions(type);
    const par = parentAcc?._id || opts[0]?._id || '';
    setForm({ type, parentId: par, name: '', code: nextCode(par), openingBalance: '', description: '', error: '' });
  };

  const changeType = (type) => {
    const opts = parentOptions(type);
    const par = opts[0]?._id || '';
    setForm((f) => ({ ...f, type, parentId: par, code: par ? nextCode(par) : '' }));
  };
  const changeParent = (par) => setForm((f) => ({ ...f, parentId: par, code: nextCode(par) }));

  const handleCreate = async (e) => {
    e.preventDefault();
    const code = form.code.trim();
    if (accounts.some((a) => a.accountCode === code))
      return setForm({ ...form, error: 'That code is already used. Choose another.' });
    setSubmitting(true);
    try {
      await ledgerService.createAccount({
        accountCode: code,
        accountName: form.name.trim(),
        accountType: form.type,
        normalBalanceType: GROUPS[form.type].side === 'Debit' ? 'DEBIT' : 'CREDIT',
        parentAccountId: form.parentId || undefined,
        openingBalance: Number(form.openingBalance) || 0,
        description: form.description,
      });
      setLocalToast('Account created');
      setForm(null);
      fetchAccounts();
    } catch (err) {
      setForm({ ...form, error: err.response?.data?.message || 'Could not create account' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 pt-5 font-sans text-sm text-gray-800">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Chart of Accounts</h1>
          <p className="text-gray-500 text-xs mt-1">Every rupee in your society is recorded under one of these groups.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {accounts.length === 0 && !loading && (
            <button
              onClick={handleSeed}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FaSeedling className="text-emerald-600" /> Seed Defaults
            </button>
          )}
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors shadow-sm"
          >
            + New account
          </button>
        </div>
      </div>

      {/* ── Type tabs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4" role="tablist">
        {/* All tab */}
        <button
          role="tab"
          aria-selected={tab === 'all'}
          onClick={() => setTab('all')}
          className={`text-left px-3 py-2.5 rounded-xl border border-gray-200 border-t-2 border-t-cyan-600 bg-white transition-all ${tab === 'all' ? 'ring-2 ring-cyan-500 bg-cyan-50' : 'hover:bg-gray-50'}`}
        >
          <small className="block text-gray-400 text-[11px] mb-1">All accounts</small>
          <b className="block text-sm font-bold tabular-nums text-gray-900">
            {accounts.filter((a) => a.status !== 'INACTIVE').length} accounts
          </b>
        </button>

        {Object.entries(GROUPS).map(([key, g]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`text-left px-3 py-2.5 rounded-xl border border-gray-200 border-t-2 ${g.tabBorder} bg-white transition-all ${tab === key ? `ring-2 ${g.tabRing} bg-gray-50` : 'hover:bg-gray-50'}`}
          >
            <small className="block text-gray-400 text-[11px] mb-1">{g.name}</small>
            <b className="block text-sm font-bold tabular-nums text-gray-900">{inr(tabTotals[key] || 0)}</b>
          </button>
        ))}
      </div>

      {/* ── Panel ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-44">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              type="search"
              placeholder="Search by code or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="accent-cyan-600"
            />
            Show inactive
          </label>
          <button
            onClick={() => setExpandAll((v) => !v)}
            className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {expandAll ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {/* Hint */}
        <div className="px-4 py-2 bg-cyan-50/60 text-cyan-800 text-xs border-b border-gray-100">
          {tab === 'all'
            ? '🔒 locked accounts are system-managed. Pick a tab to focus on a group.'
            : `${GROUPS[tab].desc} - ${GROUPS[tab].ex}. ${GROUPS[tab].hint}`}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-500 text-sm">
              <FaSpinner className="animate-spin text-cyan-600 text-xl" />
              Loading chart of accounts…
            </div>
          ) : (
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-gray-400 py-2.5 px-4 w-24">Code</th>
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-gray-400 py-2.5 px-4">Account</th>
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-gray-400 py-2.5 px-4 w-32 hidden sm:table-cell">Increases with</th>
                  <th className="text-right text-[11px] uppercase tracking-wider font-semibold text-gray-400 py-2.5 px-4 w-36">Balance</th>
                  <th className="py-2.5 px-4 w-44" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-gray-400 text-sm">
                      No accounts match. Try a different name or code.
                    </td>
                  </tr>
                )}
                {rows.map(({ a, depth, hasKids, isOpen }) => {
                  const g = GROUPS[a.accountType] || GROUPS.ASSET;
                  const bal = rollup(a, kids);
                  const neg = bal < 0;
                  const inactive = a.status === 'INACTIVE';

                  return (
                    <tr
                      key={a._id}
                      className={`border-b border-gray-100 hover:bg-gray-50/70 transition-colors ${inactive ? 'opacity-50' : ''}`}
                    >
                      {/* Code */}
                      <td className="py-2.5 px-4 font-mono text-xs text-gray-400 tabular-nums">{a.accountCode}</td>

                      {/* Name */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5" style={{ paddingLeft: depth * 20 }}>
                          {hasKids ? (
                            <button
                              onClick={() => toggleNode(a._id)}
                              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded text-xs flex-shrink-0 transition-colors"
                              aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${a.accountName}`}
                            >
                              {isOpen ? '▾' : '▸'}
                            </button>
                          ) : (
                            <span className="w-5 flex-shrink-0" />
                          )}

                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${g.dotColor}`} />

                          <span className={`${hasKids ? 'font-semibold text-gray-900' : 'text-gray-800'} leading-none`}>
                            {a.accountName}
                          </span>

                          {a.isSystemAccount && (
                            <span className="text-[11px]" title="System account">🔒</span>
                          )}

                          {neg && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                              Unusual balance
                            </span>
                          )}

                          {inactive && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                              Inactive
                            </span>
                          )}
                        </div>
                        {a.parentAccountId?.accountName && (
                          <div
                            className="text-[11px] text-gray-400 mt-0.5"
                            style={{ paddingLeft: depth * 20 + 28 }}
                          >
                            Sub-account of {a.parentAccountId.accountName}
                          </div>
                        )}
                      </td>

                      {/* Increases with */}
                      <td className="py-2.5 px-4 hidden sm:table-cell">
                        <span className="text-[11px] border border-gray-200 rounded-full px-2.5 py-0.5 text-gray-500">
                          {g.side}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className={`py-2.5 px-4 text-right tabular-nums font-medium text-sm ${neg ? 'text-rose-600' : 'text-gray-900'}`}>
                        {neg ? '−' : ''}{inr(bal)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {!a.financialAccountId && (
                            <button
                              onClick={() => openForm(a)}
                              className="text-xs font-semibold text-cyan-600 hover:bg-cyan-50 px-2 py-1 rounded-md transition-colors"
                            >
                              + Sub-account
                            </button>
                          )}
                          {!a.isSystemAccount && a.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleDeactivate(a)}
                              className="text-xs font-semibold text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create account modal (fixed overlay - always centered) ────────── */}
      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,20,30,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setForm(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <form onSubmit={handleCreate} className="p-6 grid gap-4">
              <h2 className="text-lg font-bold text-gray-900 m-0">New account</h2>

              {/* Type picker */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(GROUPS).map(([k, g]) => (
                  <label
                    key={k}
                    className={`relative border border-gray-200 border-l-4 ${g.typeAccent} rounded-xl p-2.5 cursor-pointer transition-all ${form.type === k ? 'bg-gray-50 ring-2 ' + g.tabRing : 'hover:bg-gray-50'}`}
                  >
                    <input
                      type="radio"
                      name="coa-type"
                      className="absolute opacity-0 w-0 h-0"
                      checked={form.type === k}
                      onChange={() => changeType(k)}
                    />
                    <span className="block font-semibold text-sm text-gray-800">{g.name}</span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">{g.ex}</span>
                  </label>
                ))}
              </div>

              {/* Parent */}
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-gray-700">Sits under</label>
                <select
                  required
                  value={form.parentId}
                  onChange={(e) => changeParent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
                >
                  {parentOptions(form.type).map((p) => (
                    <option key={p._id} value={p._id}>
                      {'- '.repeat(p.d)}{p.accountName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name + Code */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-gray-700">Account name</label>
                  <input
                    required
                    autoFocus
                    placeholder="e.g. Swimming pool fees"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-gray-700">Code</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Opening balance */}
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-gray-700">Opening balance (optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.openingBalance}
                  onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Description */}
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-gray-700">Description (optional)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Error / hint */}
              <p className={`text-xs m-0 ${form.error ? 'text-rose-600 font-semibold' : 'text-gray-400'}`}>
                {form.error || `Normal balance: ${GROUPS[form.type].side} - set automatically from the group.`}
              </p>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Local toast ─────────────────────────────────────────────────────── */}
      <div
        role="status"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-xl transition-all duration-200 pointer-events-none z-[9999] ${localToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        {localToast}
      </div>
    </div>
  );
};

export default ChartOfAccountsTab;
