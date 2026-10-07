import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaChevronLeft, FaChevronDown, FaCheck, FaClock, FaLock,
  FaFileAlt, FaHistory, FaExclamationTriangle, FaInfoCircle,
  FaPlus, FaSync, FaTimes
} from 'react-icons/fa';
import * as budgetApi from '../../../../services/budgetApi';

// ── Money formatting (Indian grouping) ───────────────────────────────────────
const formatINR = (paise) => {
  if (paise === null || paise === undefined) return '—';
  const rupees = Math.abs(Math.round(Number(paise))) / 100;
  const [intPart, decPart] = rupees.toFixed(0).split('.');
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const formatted = rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
    : lastThree;
  const sign = Number(paise) < 0 ? '−' : '';
  return `${sign}₹${formatted}`;
};

const parsePaise = (v) => {
  const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
};

// ── Role helpers ──────────────────────────────────────────────────────────────
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch { return {}; }
}
function getRoleKeys() {
  try {
    return JSON.parse(localStorage.getItem('roleKeys') || '[]');
  } catch { return []; }
}
const isCommitteeAdmin = (rk) => rk.includes('admin') || rk.includes('committee_member');
const isAccountant = (rk) => rk.includes('accountant');
const isMember = (rk) => rk.includes('resident_owner') || rk.includes('resident_tenant');

// ── Status stepper ────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'DRAFT', label: 'Draft', icon: FaFileAlt },
  { key: 'PENDING_APPROVAL', label: 'Pending approval', icon: FaClock },
  { key: 'APPROVED', label: 'Approved & active', icon: FaCheck },
];

function StatusStepper({ status }) {
  const cur = STEPS.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STEPS.map((step, idx) => {
        const done = idx < cur || status === 'APPROVED';
        const active = idx === cur && status !== 'APPROVED';
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 font-semibold text-sm transition-all ${done ? 'text-green-600 ' :
              active ? 'text-orange-500' :
                'text-gray-400 '
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs transition-all ${done ? 'bg-green-500 border-green-500 text-white' :
                active ? 'border-orange-500 text-orange-500' :
                  'border-gray-300 text-gray-400'
                }`}>
                {done ? <FaCheck size={10} /> : idx + 1}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 rounded transition-all ${done ? 'bg-green-400' : 'bg-gray-200 '}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Summary Tiles ─────────────────────────────────────────────────────────────
function SummaryTiles({ totals, showActuals, incomeLabel }) {
  if (!totals) return null;
  const surplus = totals.plannedSurplusPaise ?? 0;
  const tiles = [
    {
      label: 'Budgeted income',
      value: formatINR(totals.budgetedIncomePaise),
      sub: showActuals
        ? `${incomeLabel} ${formatINR(totals.actualIncomePaise ?? 0)} (${totals.budgetedIncomePaise > 0
          ? Math.round((totals.actualIncomePaise / totals.budgetedIncomePaise) * 100) : 0}%)`
        : 'For the year',
      color: 'text-blue-600 ',
      bg: 'bg-blue-50 ',
    },
    {
      label: 'Budgeted expenses',
      value: formatINR(totals.budgetedExpensePaise),
      sub: showActuals
        ? `Spent ${formatINR(totals.actualExpensePaise ?? 0)} (${totals.budgetedExpensePaise > 0
          ? Math.round((totals.actualExpensePaise / totals.budgetedExpensePaise) * 100) : 0}%)`
        : 'For the year',
      color: 'text-purple-600 ',
      bg: 'bg-purple-50 ',
    },
    {
      label: surplus >= 0 ? 'Planned surplus' : 'Planned deficit',
      value: formatINR(Math.abs(surplus)),
      sub: surplus < 0 ? 'Spending exceeds income' : 'Income minus expenses',
      color: surplus >= 0 ? 'text-green-600 ' : 'text-red-500',
      bg: surplus >= 0 ? 'bg-green-50 ' : 'bg-red-50 ',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {tiles.map((t) => (
        <div key={t.label} className={`rounded-2xl border border-gray-100 p-5 ${t.bg}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t.label}</p>
          <p className={`text-2xl font-bold tabular-nums ${t.color}`}>{t.value}</p>
          <p className="text-xs text-gray-500 mt-1">{t.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function UsageBar({ used, elapsed, color }) {
  const pct = Math.min(Math.round(used), 100);
  const elPct = Math.min(Math.round(elapsed), 100);
  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <div className="relative flex-1 h-2 rounded-full bg-gray-200 overflow-visible">
        <div
          className="absolute left-0 top-0 h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
        {elapsed !== null && (
          <div
            className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-full bg-gray-500 opacity-60"
            style={{ left: `${elPct}%` }}
            title={`Year elapsed: ${elPct}%`}
          />
        )}
      </div>
      <span className="text-xs font-semibold tabular-nums w-10 text-right text-gray-600 ">{pct}%</span>
    </div>
  );
}

function flagColor(flags) {
  if (!flags) return '#16803c';
  if (flags.overBudget) return '#c0262d';
  if (flags.aheadOfPace) return '#b45309';
  return '#16803c';
}

// ── Budget Line Table ─────────────────────────────────────────────────────────
function BudgetLineTable({
  title, lines, kind, editable, showActuals, yearElapsedPct,
  onLineChange, totals
}) {
  const totalBudgetPaise = lines.reduce((s, l) => s + (l.allocatedPaise || 0), 0);
  const totalActualPaise = showActuals ? lines.reduce((s, l) => s + (l.actualPaise || 0), 0) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100 ">
        <span className="font-bold text-gray-800 ">{title}</span>
        <span className="text-xs text-gray-400">{kind === 'EXPENSE' ? 'Expense categories' : 'Charge heads'}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 ">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Annual budget</th>
              {editable && (
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Per month</th>
              )}
              {showActuals && !editable && (
                <>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actual to date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {kind === 'EXPENSE' ? 'Left / over' : 'Still to collect'}
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Used</th>
                </>
              )}
              {!showActuals && !editable && (
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Per month</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 ">
            {lines.map((line, idx) => {
              const paise = line.allocatedPaise || 0;
              const actual = line.actualPaise ?? null;
              const remaining = actual !== null ? paise - actual : null;
              const usedPct = paise > 0 && actual !== null ? (actual / paise * 100) : 0;
              const flags = line.flags || {};
              const color = kind === 'EXPENSE' ? flagColor(flags) :
                (actual !== null ? '#2457c5' : '#2457c5');

              return (
                <tr key={line.ledgerAccountId || line.id || idx}
                  className="hover:bg-gray-50/50 :bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-700 ">
                    <span>{line.accountName}</span>
                    {flags.overBudget && (
                      <span className="ml-2 text-xs font-semibold text-red-600 border border-red-400 rounded-full px-2 py-0.5">Over budget</span>
                    )}
                    {flags.aheadOfPace && !flags.overBudget && (
                      <span className="ml-2 text-xs font-semibold text-amber-600 border border-amber-400 rounded-full px-2 py-0.5">Ahead of pace</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-gray-700 ">
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={paise ? paise / 100 : ''}
                        placeholder="0"
                        aria-label={`${line.accountName} annual budget in rupees`}
                        className="w-36 text-right border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 tabular-nums"
                        onChange={(e) => {
                          const val = e.target.value;
                          const rupees = val ? Number(val) : 0;
                          onLineChange(line.ledgerAccountId, Math.round(rupees * 100));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Tab') {
                            // Move focus to next input
                            const inputs = document.querySelectorAll('input[type="number"]');
                            const arr = Array.from(inputs);
                            const i = arr.indexOf(e.target);
                            if (e.key === 'Enter') { e.preventDefault(); arr[i + 1]?.focus(); }
                          }
                        }}
                      />
                    ) : (
                      formatINR(paise)
                    )}
                  </td>
                  {editable && (
                    <td className="px-5 py-3 text-right tabular-nums text-gray-400 text-xs">
                      {formatINR(Math.round(paise / 12))}
                    </td>
                  )}
                  {showActuals && !editable && actual !== null && (
                    <>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700 ">
                        {formatINR(actual)}
                      </td>
                      <td className={`px-5 py-3 text-right tabular-nums font-medium ${remaining < 0 ? 'text-red-500' : 'text-gray-700 '}`}>
                        {remaining < 0
                          ? `${kind === 'EXPENSE' ? 'Over by ' : 'Exceeded by '}${formatINR(-remaining)}`
                          : formatINR(remaining)
                        }
                      </td>
                      <td className="px-5 py-3">
                        <UsageBar used={usedPct} elapsed={yearElapsedPct} color={color} />
                      </td>
                    </>
                  )}
                  {!showActuals && !editable && (
                    <td className="px-5 py-3 text-right tabular-nums text-gray-400 text-xs">
                      {formatINR(Math.round(paise / 12))}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50/80 ">
              <td className="px-5 py-3 font-bold text-gray-700 ">Total {title.toLowerCase()}</td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-gray-700 ">
                {formatINR(totalBudgetPaise)}
              </td>
              {editable && (
                <td className="px-5 py-3 text-right tabular-nums text-gray-400 text-xs font-semibold">
                  {formatINR(Math.round(totalBudgetPaise / 12))}
                </td>
              )}
              {showActuals && !editable && (
                <>
                  <td className="px-5 py-3 text-right font-bold tabular-nums text-gray-700 ">
                    {formatINR(totalActualPaise)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums text-gray-700 ">
                    {formatINR(totalBudgetPaise - (totalActualPaise || 0))}
                  </td>
                  <td className="px-5 py-3" />
                </>
              )}
              {!showActuals && !editable && (
                <td className="px-5 py-3 text-right tabular-nums text-gray-400 text-xs font-semibold">
                  {formatINR(Math.round(totalBudgetPaise / 12))}
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── History Panel ─────────────────────────────────────────────────────────────
function HistoryPanel({ history, loading }) {
  const actionLabel = (a) => ({
    CREATED: 'Created draft',
    LINES_SAVED: 'Saved lines',
    SUBMITTED: 'Submitted for approval',
    APPROVED: 'Approved & activated',
    SENT_BACK: 'Sent back to draft',
    WITHDRAWN: 'Withdrawn to draft',
  }[a] || a);

  const actionColor = (a) => ({
    APPROVED: 'text-green-600 bg-green-50 ',
    SENT_BACK: 'text-amber-600 bg-amber-50 ',
    WITHDRAWN: 'text-gray-500 bg-gray-100 ',
    SUBMITTED: 'text-blue-600 bg-blue-50 ',
    CREATED: 'text-gray-500 bg-gray-100 ',
    LINES_SAVED: 'text-gray-500 bg-gray-100 ',
  }[a] || 'text-gray-500 bg-gray-100');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FaHistory className="text-gray-400" />
        <span className="font-bold text-gray-800 ">Activity history</span>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !history || history.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No activity recorded yet.</p>
      ) : (
        <ol className="space-y-3">
          {history.map((entry, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className={`shrink-0 text-xs font-semibold rounded-full px-2 py-1 mt-0.5 ${actionColor(entry.action)}`}>
                {actionLabel(entry.action)}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-700 font-medium">
                  {entry.userId?.name || 'Unknown'}
                  <span className="ml-1 text-xs text-gray-400 font-normal">({entry.userRole})</span>
                </p>
                {entry.comment && (
                  <p className="text-xs text-gray-500 mt-0.5">"{entry.comment}"</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="text-xs text-gray-400 mt-4">Every submission and approval is recorded in the audit trail.</p>
    </div>
  );
}

// ── FY Selector ───────────────────────────────────────────────────────────────
function FYSelector({ value, onChange, budgets }) {
  // Generate a list of FYs: current + next 2
  const now = new Date();
  const curYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fys = [];
  for (let y = curYear - 1; y <= curYear + 2; y++) {
    fys.push(`${y}-${String(y + 1).slice(-2)}`);
  }
  // Also include any FYs from existing budgets
  if (budgets) {
    budgets.forEach(b => { if (!fys.includes(b.financialYear)) fys.push(b.financialYear); });
    fys.sort().reverse();
  }

  return (
    <select
      id="fy-selector"
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label="Select financial year"
      className="border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      {fys.map(fy => (
        <option key={fy} value={fy}>FY {fy} (Apr–Mar)</option>
      ))}
    </select>
  );
}

// ── Main BudgetPage ───────────────────────────────────────────────────────────
export default function BudgetPage() {
  const navigate = useNavigate();

  // Role
  const user = getUser();
  const roleKeys = getRoleKeys();
  const canAdmin = isCommitteeAdmin(roleKeys);
  const canEdit = isAccountant(roleKeys);
  const memberOnly = isMember(roleKeys) && !canAdmin && !canEdit;

  // FY state
  const now = new Date();
  const defaultFY = (() => {
    const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${y}-${String(y + 1).slice(-2)}`;
  })();
  const [selectedFY, setSelectedFY] = useState(defaultFY);

  // Data state
  const [budgets, setBudgets] = useState([]);
  const [activeBudget, setActiveBudget] = useState(null);   // full budget object
  const [vsActual, setVsActual] = useState(null);       // vs-actual response
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(false);
  const [error, setError] = useState(null);

  // Draft editing state
  const [draftLines, setDraftLines] = useState([]);          // { ledgerAccountId, accountName, accountType, allocatedPaise }
  const [unsaved, setUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [showConflict, setShowConflict] = useState(false);

  // Eligible accounts (for when we have no lines yet)
  const [eligibleAccounts, setEligibleAccounts] = useState([]);

  // ── Load budgets for selected FY ──────────────────────────────────────────
  const loadBudgetForFY = useCallback(async (fy) => {
    setLoading(true);
    setError(null);
    setVsActual(null);
    setActiveBudget(null);
    setDraftLines([]);
    setUnsaved(false);
    try {
      const res = await budgetApi.getBudgets(fy);
      const all = res.data?.data?.budgets || [];
      setBudgets(all);

      // Pick the most relevant budget for this FY
      const priority = ['APPROVED', 'PENDING_APPROVAL', 'DRAFT'];
      let found = null;
      for (const s of priority) {
        found = all.find(b => b.financialYear === fy && b.status === s);
        if (found) break;
      }

      if (found) {
        await loadBudgetDetails(found._id, fy);
      } else {
        setLoading(false);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setError('access_denied');
      } else {
        setError('load_failed');
      }
      setLoading(false);
    }
  }, []);

  const loadBudgetDetails = async (budgetId, fy) => {
    try {
      const [detailsRes, vsActualRes, histRes] = await Promise.allSettled([
        budgetApi.getBudget(budgetId),
        budgetApi.getBudgetVsActual(budgetId),
        budgetApi.getBudgetHistory(budgetId),
      ]);

      const details = detailsRes.status === 'fulfilled' ? detailsRes.value.data?.data : null;
      const va = vsActualRes.status === 'fulfilled' ? vsActualRes.value.data?.data : null;
      const hist = histRes.status === 'fulfilled' ? histRes.value.data?.data?.history : [];

      if (details) {
        setActiveBudget(details.budget);
        // Populate draft lines from existing lines
        if (details.lines && details.lines.length > 0) {
          setDraftLines(details.lines.map(l => ({
            ledgerAccountId: l.ledgerAccountId,
            accountName: l.accountName,
            accountCode: l.accountCode,
            accountType: l.accountType,
            allocatedPaise: l.allocatedPaise,
          })));
        } else if (details.budget.status === 'DRAFT') {
          // If draft has no lines yet, initialize them with 0 from eligible accounts
          try {
            const accsRes = await budgetApi.getEligibleAccounts();
            const accs = accsRes.data?.data?.accounts || [];
            setDraftLines(accs.map(acc => ({
              ledgerAccountId: acc._id,
              accountName: acc.accountName,
              accountCode: acc.accountCode,
              accountType: acc.accountType,
              allocatedPaise: 0,
            })));
          } catch (e) {
            console.error('Failed to load eligible accounts', e);
          }
        }
      }

      if (va) setVsActual(va);
      setHistory(hist || []);
    } catch (err) {
      console.error('Error loading budget details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetForFY(selectedFY);
  }, [selectedFY, loadBudgetForFY]);

  // Load eligible accounts for Accountant
  useEffect(() => {
    if (canEdit) {
      budgetApi.getEligibleAccounts()
        .then(r => setEligibleAccounts(r.data?.data?.accounts || []))
        .catch(() => { });
    }
  }, [canEdit]);

  // ── Draft line editing ────────────────────────────────────────────────────
  const handleLineChange = (ledgerAccountId, newPaise) => {
    setDraftLines(prev =>
      prev.map(l => l.ledgerAccountId === ledgerAccountId ? { ...l, allocatedPaise: newPaise } : l)
    );
    setUnsaved(true);
  };

  // ── Create new DRAFT ──────────────────────────────────────────────────────
  const handleCreateDraft = async () => {
    if (!canEdit) return;
    setActionLoading(true);
    try {
      const res = await budgetApi.createBudget(selectedFY);
      const budget = res.data?.data?.budget;
      toast.success('Draft budget created!');
      await loadBudgetForFY(selectedFY);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create budget.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Save draft ────────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!activeBudget || !canEdit) return;
    setSaving(true);
    setShowConflict(false);
    try {
      await budgetApi.saveLines(activeBudget._id, {
        rowVersion: activeBudget.rowVersion,
        lines: draftLines.map(l => ({
          ledgerAccountId: l.ledgerAccountId,
          allocatedPaise: l.allocatedPaise,
        })),
      });
      toast.success('Draft saved!');
      setUnsaved(false);
      await loadBudgetForFY(selectedFY);
    } catch (err) {
      if (err?.response?.data?.errorCode === 'STALE_ROW_VERSION') {
        setShowConflict(true);
        toast.error('Version conflict! Someone else saved this budget. Please reload.');
      } else {
        toast.error(err?.response?.data?.message || 'Save failed.');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!activeBudget || !canEdit) return;
    if (unsaved) {
      toast.error('Please save the draft before submitting.');
      return;
    }
    setActionLoading(true);
    try {
      await budgetApi.submitBudget(activeBudget._id);
      toast.success('Budget submitted for Committee Admin approval!');
      await loadBudgetForFY(selectedFY);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Submit failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!activeBudget || !canAdmin) return;
    setActionLoading(true);
    try {
      await budgetApi.approveBudget(activeBudget._id, comment.trim() || undefined);
      toast.success('Budget approved and activated!');
      setComment('');
      await loadBudgetForFY(selectedFY);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Approve failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Send back ─────────────────────────────────────────────────────────────
  const handleSendBack = async () => {
    if (!activeBudget || !canAdmin) return;
    setActionLoading(true);
    try {
      await budgetApi.sendBackBudget(activeBudget._id, comment.trim() || undefined);
      toast.success('Budget sent back to the Accountant.');
      setComment('');
      await loadBudgetForFY(selectedFY);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Send back failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Withdraw ──────────────────────────────────────────────────────────────
  const handleWithdraw = async () => {
    if (!activeBudget || !canEdit) return;
    setActionLoading(true);
    try {
      await budgetApi.withdrawBudget(activeBudget._id);
      toast.success('Budget withdrawn. You can now edit the draft.');
      await loadBudgetForFY(selectedFY);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Withdraw failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Unsaved changes guard ─────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsaved]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const status = activeBudget?.status;
  const showActuals = vsActual?.showActuals || false;
  const yearElapsedPct = vsActual?.yearElapsedPct || null;
  const incomeLabel = activeBudget?.incomeActualsBasis === 'CASH' ? 'Collected' : 'Billed';

  // Use vsActual lines only when showing actuals, otherwise always use draftLines (which powers the editable UI)
  const incomeLines = showActuals ? (vsActual?.incomeLines || []) : draftLines.filter(l => l.accountType === 'INCOME');
  const expenseLines = showActuals ? (vsActual?.expenseLines || []) : draftLines.filter(l => l.accountType === 'EXPENSE');
  const totals = vsActual?.totals || (() => {
    const bi = draftLines.filter(l => l.accountType === 'INCOME').reduce((s, l) => s + l.allocatedPaise, 0);
    const be = draftLines.filter(l => l.accountType === 'EXPENSE').reduce((s, l) => s + l.allocatedPaise, 0);
    return {
      budgetedIncomePaise: bi, budgetedIncomeDisplay: bi / 100,
      budgetedExpensePaise: be, budgetedExpenseDisplay: be / 100,
      plannedSurplusPaise: bi - be,
    };
  })();

  const isDraft = status === 'DRAFT';
  const isPending = status === 'PENDING_APPROVAL';
  const isApproved = status === 'APPROVED';
  const editable = isDraft && canEdit;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Super admin / no-access
  if (error === 'access_denied') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
        <FaLock className="text-4xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Access restricted</h2>
        <p className="text-gray-400 text-sm">You do not have permission to view budgets.</p>
      </div>
    );
  }

  // Member sees "not published" when no APPROVED budget exists
  if (memberOnly && (!activeBudget || status !== 'APPROVED')) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 ">Budgeting</h1>
            <p className="text-sm text-gray-400 mt-0.5">Annual income and expense plan</p>
          </div>
          <FYSelector value={selectedFY} onChange={setSelectedFY} budgets={budgets} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <FaFileAlt className="text-4xl text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-600 mb-2">
            The FY {selectedFY} budget has not been published yet.
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Residents can view the budget once the Committee Admin approves it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 ">Budgeting</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Plan the year's income and spending, then track it against actuals.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <FYSelector value={selectedFY} onChange={setSelectedFY} budgets={budgets} />
          {canEdit && !activeBudget && (
            <button
              id="create-draft-btn"
              onClick={handleCreateDraft}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50 shadow-md shadow-orange-500/20"
            >
              <FaPlus />
              New draft budget
            </button>
          )}
        </div>
      </div>

      {/* ── Status card ── */}
      {activeBudget && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-2">
                Annual budget · FY {activeBudget.financialYear}
              </p>
              <StatusStepper status={status} />
            </div>

            {/* Action buttons per role + status */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Accountant: DRAFT actions */}
              {isDraft && canEdit && (
                <>
                  <button
                    id="save-draft-btn"
                    onClick={handleSaveDraft}
                    disabled={saving || !unsaved}
                    className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-gray-50 :bg-gray-700 transition-all disabled:opacity-40"
                  >
                    {saving ? <FaSync className="animate-spin" /> : null}
                    Save draft
                  </button>
                  <button
                    id="submit-btn"
                    onClick={handleSubmit}
                    disabled={actionLoading || unsaved}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50 shadow-md shadow-orange-500/20"
                  >
                    Submit for approval
                  </button>
                </>
              )}

              {/* Accountant: PENDING — can withdraw */}
              {isPending && canEdit && (
                <button
                  id="withdraw-btn"
                  onClick={handleWithdraw}
                  disabled={actionLoading}
                  className="border border-gray-200 bg-white text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-gray-50 :bg-gray-700 transition-all disabled:opacity-50"
                >
                  Withdraw to edit
                </button>
              )}

              {/* Committee Admin: PENDING — approve or send back */}
              {isPending && canAdmin && (
                <>
                  <textarea
                    id="admin-comment"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Comment (optional)"
                    aria-label="Approval comment"
                    rows={1}
                    maxLength={1000}
                    className="w-52 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                  <button
                    id="send-back-btn"
                    onClick={handleSendBack}
                    disabled={actionLoading}
                    className="border border-gray-200 bg-white text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Send back
                  </button>
                  <button
                    id="approve-btn"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50 shadow-md shadow-green-500/20"
                  >
                    Approve & activate
                  </button>
                </>
              )}

              {/* Approved: locked */}
              {isApproved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                  <FaLock size={12} /> Approved and locked
                </span>
              )}
            </div>
          </div>

          {/* Pending note */}
          {isPending && canEdit && !canAdmin && (
            <p className="text-sm text-gray-400 mt-3">
              Waiting for Committee Admin approval.
            </p>
          )}
          {isDraft && canAdmin && (
            <p className="text-sm text-gray-400 mt-3">
              The Accountant is still drafting this budget.
            </p>
          )}
        </div>
      )}

      {/* ── Conflict banner ── */}
      {showConflict && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 ">Version conflict</p>
            <p className="text-xs text-red-600 mt-0.5">
              Someone else saved this budget. Please reload to get the latest version before saving.
            </p>
          </div>
          <button
            onClick={() => { setShowConflict(false); loadBudgetForFY(selectedFY); }}
            className="text-xs text-red-600 font-semibold hover:underline shrink-0"
          >
            Reload
          </button>
        </div>
      )}

      {/* ── No budget exists yet ── */}
      {!activeBudget && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <FaFileAlt className="text-4xl text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-600 mb-2">
            No budget for FY {selectedFY}
          </h2>
          {canEdit ? (
            <>
              <p className="text-gray-400 text-sm mb-5">Create a draft budget to get started.</p>
              <button
                onClick={handleCreateDraft}
                disabled={actionLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 shadow-md shadow-orange-500/20"
              >
                <FaPlus className="inline mr-2" />Create draft
              </button>
            </>
          ) : (
            <p className="text-gray-400 text-sm">The Accountant has not created a budget for this year yet.</p>
          )}
        </div>
      )}

      {/* ── Summary tiles ── */}
      {activeBudget && (
        <SummaryTiles totals={totals} showActuals={showActuals} incomeLabel={incomeLabel} />
      )}

      {/* ── FY not started note ── */}
      {isApproved && !showActuals && activeBudget && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 ">
          <FaInfoCircle />
          Approved. Actual tracking will start when FY {activeBudget.financialYear} begins on 1 Apr {activeBudget.financialYear.split('-')[0].slice(-2) === '99' ? parseInt(activeBudget.financialYear.split('-')[0]) + 1 : parseInt(activeBudget.financialYear.split('-')[0]) + 1}.
        </div>
      )}

      {/* ── Income section ── */}
      {activeBudget && incomeLines.length > 0 && (
        <BudgetLineTable
          title="Income"
          lines={incomeLines}
          kind="INCOME"
          editable={editable}
          showActuals={showActuals}
          yearElapsedPct={yearElapsedPct}
          onLineChange={handleLineChange}
        />
      )}

      {/* ── Expense section ── */}
      {activeBudget && expenseLines.length > 0 && (
        <BudgetLineTable
          title="Expenses"
          lines={expenseLines}
          kind="EXPENSE"
          editable={editable}
          showActuals={showActuals}
          yearElapsedPct={yearElapsedPct}
          onLineChange={handleLineChange}
        />
      )}

      {/* ── Empty Accounts Warning ── */}
      {activeBudget && incomeLines.length === 0 && expenseLines.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center shadow-sm mb-6">
          <FaInfoCircle className="text-3xl text-orange-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-orange-800 mb-1">No Active Ledger Accounts Found</h3>
          <p className="text-orange-700 text-sm max-w-md mx-auto">
            To draft a budget, your society must first configure income and expense categories.
            Please configure your Charge Heads and Expense Ledgers in the Billing Hub, then return here.
          </p>
        </div>
      )}

      {/* ── Legend (approved + started) ── */}
      {showActuals && (
        <p className="text-xs text-gray-400 px-1">
          Dark marker on each bar = how much of the year has passed ({Math.round(yearElapsedPct || 0)}%).
          Spending past the marker means a category is running ahead of pace.
        </p>
      )}

      {/* ── History panel ── */}
      {activeBudget && (
        <HistoryPanel history={history} loading={histLoading} />
      )}
    </div>
  );
}
