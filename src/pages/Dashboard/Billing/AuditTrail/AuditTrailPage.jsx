import React, { useEffect, useMemo, useRef, useState } from "react";
import apiClient from '../../../../services/apiClient';

/* BRD 6.12: FR-B12.1 user + timestamp + before/after, FR-B12.2 read-only, FR-B12.3 filter by user/date/type.
   No edit/delete actions by design. Enforce read-only in the database too. */

export const TYPES = {
  invoice: { label: "Invoice", h: "265" }, payment: { label: "Payment", h: "190" }, credit: { label: "Credit note / discount", h: "330" },
  waiver: { label: "Fine waiver", h: "35" }, voucher: { label: "Journal voucher", h: "215" }, vendor: { label: "Vendor payment", h: "12" },
  recon: { label: "Reconciliation", h: "160" }, deposit: { label: "Advance / deposit", h: "95" }, budget: { label: "Budget", h: "55" },
  config: { label: "Configuration", h: "225" }, approval: { label: "Approval", h: "140" }, other: { label: "Other", h: "220" },
};
const TYPE_RULES = [["invoice", "invoice"], ["payment", "payment"], ["credit", "credit"], ["discount", "credit"], ["waiver", "waiver"], ["fine", "waiver"],
["voucher", "voucher"], ["journal", "voucher"], ["vendor", "vendor"], ["recon", "recon"], ["deposit", "deposit"], ["advance", "deposit"],
["budget", "budget"], ["approv", "approval"], ["charge", "config"], ["config", "config"]];
export const typeKey = (raw = "") => { const s = String(raw).toLowerCase(); return (TYPE_RULES.find(([k]) => s.includes(k)) || [0, "other"])[1]; };

// Backend action codes → readable text. Add yours here; unknown codes are humanised.
const ACTIONS = {
  "BILLING.INVOICE.GENERATE": "Invoice generated", "BILLING.INVOICE.FINALIZE": "Invoice finalized", "BILLING.INVOICE.EDIT": "Invoice edited",
  "BILLING.PAYMENT.RECORD": "Payment recorded", "BILLING.FINE.WAIVE": "Fine waived", "BILLING.CREDITNOTE.ISSUE": "Credit note issued",
  "BILLING.CREDITNOTE.APPROVE": "Credit note approved", "LEDGER.VOUCHER.CANCEL": "Journal voucher cancelled", "VENDOR.PAYMENT.APPROVE": "Vendor payment approved",
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const actionLabel = (code = "") => {
  if (ACTIONS[code]) return ACTIONS[code];
  const p = String(code).split(/[._]/).filter(Boolean).slice(-2).map((x) => x.toLowerCase());
  return cap(p.join(" ")) || "Event";
};

const short = (s) => (typeof s === "string" && s.length > 14 && !s.includes(" ") && !s.includes("/") ? "…" + s.slice(-8) : s);
const parse = (d) => { if (typeof d === "string") { try { return JSON.parse(d); } catch { return { note: d }; } } return d || {}; };
const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const human = (k) => cap(k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_.]/g, " ").toLowerCase());
const fmtTs = (v) => {
  if (!v) return "";
  if (/^\d{4}-\d\d-\d\d \d\d:\d\d/.test(v)) return v.slice(0, 16);
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(v)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
};
const diff = (b = {}, a = {}) => [...new Set([...Object.keys(b), ...Object.keys(a)])].filter((k) => JSON.stringify(b[k]) !== JSON.stringify(a[k])).map((k) => [human(k), String(b[k] ?? "—"), String(a[k] ?? "—")]);

// Maps YOUR API event → UI event.
export const normalize = (e) => {
  let uName = "System";
  if (e.userId && typeof e.userId === 'object') {
    uName = `${e.userId.firstName || ''} ${e.userId.lastName || ''}`.trim() || e.userId.name;
  } else if (e.user && typeof e.user === 'object') {
    uName = `${e.user.firstName || ''} ${e.user.lastName || ''}`.trim() || e.user.name;
  } else if (e.userName) {
    uName = e.userName;
  } else if (typeof e.user === 'string') {
    uName = e.user;
  }

  const rawDetails = parse(e.details ?? e.meta ?? e.metadata ?? e.description);
  const statusStr = e.status || rawDetails.status;

  return {
    id: String(e.id ?? e._id ?? ""), ts: fmtTs(e.ts ?? e.timestamp ?? e.createdAt ?? new Date()),
    user: uName || "Unknown", role: e.role ?? e.userRole ?? e.userId?.role ?? e.user?.role ?? "",
    type: typeKey(e.type ?? e.entityType ?? e.module ?? e.transactionType ?? e.resource ?? e.action),
    code: e.action ?? e.resource ?? "", action: actionLabel(e.action ?? e.resource),
    target: String(e.target ?? e.targetId ?? e.entityId ?? e.resourceId ?? ""),
    details: {
      ...rawDetails,
      ...(statusStr ? { status: statusStr } : {}),
      ...(e.amount ? { amount: e.amount } : {})
    },
    reason: e.reason ?? (typeof e.description === 'string' ? e.description : null),
    changes: e.changes ?? (e.beforeValue && e.afterValue ? diff(parse(e.beforeValue), parse(e.afterValue)) : (e.before && e.after ? diff(e.before, e.after) : [])),
  };
};

const friendlyMessage = (msg) => {
  if (typeof msg !== 'string') return msg;
  if (msg.includes("Missing required billing permission")) {
    const perm = msg.split(':').pop().trim();
    if (perm === "BILLING.CHARGE_HEAD.VIEW") return "Permission denied to view charge heads";
    const parts = perm.split('.');
    const entity = parts[1]?.replace(/_/g, ' ').toLowerCase() || 'resource';
    const action = parts[2]?.toLowerCase() || 'access';
    return `Permission denied to ${action} ${entity}`;
  }
  return msg;
};

const val = (k, v) => {
  if (k === "billingPeriod" && /^\d{4}-\d\d$/.test(v)) return `${MN[+v.slice(5) - 1]} ${v.slice(0, 4)}`;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? "" : "s"}`;
  if (v && typeof v === "object") return JSON.stringify(v).slice(0, 40);
  if (typeof v === "number") return v.toLocaleString("en-IN");
  return short(friendlyMessage(String(v)));
};

const tone = (k, v) => {
  if (k === "failed" && v > 0) return "bad";
  if (k === "skipped" && v > 0) return "warn";
  if (k === "successful" && v > 0) return "ok";
  if (k === "status") {
    const s = String(v).toLowerCase();
    if (s === "denied" || s === "failed" || s === "error" || s === "unauthorized" || s === "rejected") return "bad";
    if (s === "success" || s === "approved" || s === "completed") return "ok";
    if (s === "pending" || s === "processing") return "warn";
  }
  return "";
};

const HIDE = new Set(["bulkJobId", "flatId", "invoiceNumber", "isBulk", "errors", "note", "params"]);
const rowFacts = (d) => {
  const f = Object.entries(d).filter(([k, v]) => !HIDE.has(k) && v !== null && v !== "").map(([k, v]) => [human(k), val(k, v), tone(k, v)]);
  if (d.isBulk) f.push(["", "Bulk", "tag"]);
  if (Array.isArray(d.errors) && d.errors.length) f.push(["Errors", String(d.errors.length), "bad"]);
  if (d.note) f.push(["", friendlyMessage(d.note), ""]);
  return f.slice(0, 6);
};

const targetOf = (e) => {
  const d = e.details;
  if (d.invoiceNumber) return [d.invoiceNumber, short(e.target)];
  if (d.bulkJobId || /^BULK-/.test(e.target)) return [`Bulk job${d.total != null ? ` · ${d.total} invoice${d.total === 1 ? "" : "s"}` : ""}`, short(d.bulkJobId || e.target)];
  return [short(e.target) || "—", ""];
};

function useDebounced(v, ms = 300) { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; }

function Copy({ text, label = "Copy ID" }) {
  const [ok, setOk] = useState(false);
  return <button className="bg-transparent border-0 text-slate-400 hover:text-orange-600 transition-colors ml-1 px-1 font-mono text-sm" title={label} aria-label={label} onClick={() => navigator.clipboard?.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1200); })}>{ok ? "✓" : "⧉"}</button>;
}

export default function AuditTrailPage({ onBack }) {
  const [f, setF] = useState({ q: "", user: "", type: "", from: "", to: "", quick: null });
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ items: [], total: 0 });
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sel, setSel] = useState(null);

  const [usersList, setUsersList] = useState([]);

  const dlg = useRef(null);
  const pageSize = 10;
  const q = useDebounced(f.q);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await apiClient.get('/users?limit=500');
        if (usersRes.data?.data) {
          const uList = Array.isArray(usersRes.data.data) ? usersRes.data.data : usersRes.data.data.users || [];
          setUsersList(uList);
        }
      } catch (err) {
        console.error('Could not fetch users filters', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      try {
        const endpoints = [
          apiClient.get('/billing/audit-logs?limit=1'),
          apiClient.get('/billing/audit-logs?transactionType=config&limit=1'),
          apiClient.get('/billing/audit-logs?transactionType=approval&limit=1'),
          apiClient.get('/billing/audit-logs?transactionType=waiver&limit=1'),
          apiClient.get('/billing/audit-logs?search=cancel&limit=1'),
        ];
        const res = await Promise.all(endpoints);
        if (active) {
          setCounts({
            all: res[0].data?.data?.pagination?.total ?? res[0].data?.pagination?.total ?? 0,
            config: res[1].data?.data?.pagination?.total ?? res[1].data?.pagination?.total ?? 0,
            approval: res[2].data?.data?.pagination?.total ?? res[2].data?.pagination?.total ?? 0,
            waiver: res[3].data?.data?.pagination?.total ?? res[3].data?.pagination?.total ?? 0,
            cancelled: res[4].data?.data?.pagination?.total ?? res[4].data?.pagination?.total ?? 0,
          });
        }
      } catch (e) {
        console.error("Could not fetch tile counts", e);
      }
    };
    fetchCounts();
    return () => { active = false; };
  }, []);

  const fetchAuditLogsWithParams = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append('page', page + 1);
      params.append('limit', pageSize);
      if (f.user) params.append('userId', f.user);

      if (f.quick === 'cancelled') {
        params.append('search', 'cancel');
      } else if (f.type || f.quick) {
        params.append('transactionType', f.type || f.quick);
      }

      if (f.from) params.append('fromDate', f.from);
      if (f.to) params.append('toDate', f.to);
      if (q) params.append('search', q);

      const res = await apiClient.get(`/billing/audit-logs?${params.toString()}`);
      const rawData = res.data?.data?.data || res.data?.data || [];
      const pagination = res.data?.data?.pagination || res.data?.pagination;

      const items = rawData.map(normalize);

      setData({
        items,
        total: pagination?.total ?? pagination?.totalItems ?? items.length,
      });
    } catch (err) {
      setError(err?.message || "Could not load audit trail. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogsWithParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, f.user, f.type, f.from, f.to, f.quick, q]);

  useEffect(() => { const d = dlg.current; if (!d) return; sel && !d.open ? d.showModal() : !sel && d.open && d.close(); }, [sel]);

  const set = (p) => { setPage(0); setF((x) => ({ ...x, ...p })); };
  const pages = Math.max(1, Math.ceil(data.total / pageSize));
  const last7 = () => { const d = new Date(); d.setDate(d.getDate() - 6); set({ from: d.toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }); };
  const tiles = [["All events", null, "all"], ["Config changes", "config", "config"], ["Approvals", "approval", "approval"], ["Fine waivers", "waiver", "waiver"], ["Cancelled vouchers", "cancelled", "cancelled"]];

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-5 pb-16 bg-slate-50 text-slate-900 font-sans min-h-screen">
      {onBack && <button className="bg-transparent border-0 font-semibold py-1 mb-3 text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-2" onClick={onBack}>← Back to Billing Hub</button>}

      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex gap-4 items-center flex-wrap mb-4">
        <div><h1 className="m-0 text-2xl font-bold">Audit trail</h1><p className="m-0 mt-1 text-slate-500 max-w-[560px]">Every financial action, rate edit, approval and waiver, with who did it and when.</p></div>
        <div className="ml-auto text-[13px] font-semibold border border-slate-200 bg-white rounded-full px-3 py-1.5 shadow-sm text-slate-700">🔒 Read-only · cannot be edited or deleted</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-4">
        {tiles.map(([label, key, ck]) => (
          <button key={label} className={`bg-white border rounded-xl p-2.5 text-left transition-colors ${f.quick === key ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200 hover:border-orange-300'}`} onClick={() => set({ quick: key })}>
            <small className="block text-slate-500 text-xs mb-1">{label}</small><b className="text-[20px] font-bold tabular-nums">{counts ? counts[ck] : "–"}</b>
          </button>))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,2.2fr)_repeat(4,minmax(130px,1fr))] gap-3 p-3 border-b border-slate-200">
          <input type="search" placeholder="Search event ID, user, flat, details" aria-label="Search" value={f.q} onChange={(e) => set({ q: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
          <select aria-label="User" value={f.user} onChange={(e) => set({ user: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
            <option value="">All users</option>
            {usersList.map((u) => {
              const id = u._id || u.id;
              const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown User';
              return <option key={id} value={id}>{name}</option>;
            })}
          </select>
          <select aria-label="Transaction type" value={f.type} onChange={(e) => set({ type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"><option value="">All types</option>{Object.entries(TYPES).filter(([k]) => k !== "other").map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}</select>
          <input type="date" aria-label="From date" value={f.from} onChange={(e) => set({ from: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
          <input type="date" aria-label="To date" value={f.to} onChange={(e) => set({ to: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
        </div>
        <div className="flex flex-wrap gap-2 justify-between items-center px-4 py-2 text-slate-500 text-[13px] border-b border-slate-200 bg-slate-50/50">
          <span className="font-medium">{loading ? "Loading…" : `${data.total} event${data.total === 1 ? "" : "s"}, newest first`}</span>
          <span className="flex gap-3"><button className="text-orange-600 font-semibold hover:text-orange-700 transition-colors" onClick={last7}>Last 7 days</button><button className="font-semibold hover:text-slate-700 transition-colors" onClick={() => { setPage(0); setF({ q: "", user: "", type: "", from: "", to: "", quick: null }); }}>Clear filters</button></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse table-fixed text-left text-sm">
            <colgroup><col className="w-[130px]" /><col className="w-[118px]" /><col className="w-[150px]" /><col className="w-[210px]" /><col className="w-[210px]" /><col /><col className="w-[110px]" /></colgroup>
            <thead><tr className="border-b border-slate-200 bg-slate-50/50"><th className="text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold px-3 py-2.5">Event</th><th className="text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold px-3 py-2.5">When</th><th className="text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold px-3 py-2.5">User</th><th className="text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold px-3 py-2.5">Action</th><th className="text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold px-3 py-2.5">Target</th><th className="text-[11.5px] uppercase tracking-wider text-slate-500 font-semibold px-3 py-2.5">Details</th><th className="bg-slate-50/50 sticky right-0 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)]" /></tr></thead>
            <tbody>
              {error && <tr><td colSpan={7} className="p-10 text-center text-red-500 font-medium">{error}</td></tr>}
              {!error && !loading && !data.items.length && <tr><td colSpan={7} className="p-10 text-center text-slate-500">No events match these filters.</td></tr>}
              {data.items.map((e) => {
                const [d, t] = e.ts.split(" "), ty = TYPES[e.type] || TYPES.other, [tl, ts] = targetOf(e), facts = rowFacts(e.details);
                return (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 group transition-colors">
                    <td className="px-3 py-3 align-top break-all"><span className="font-mono font-bold text-[12.5px]" title={e.id}>{short(e.id)}</span><Copy text={e.id} /></td>
                    <td className="px-3 py-3 align-top whitespace-nowrap"><b className="block font-medium">{d}</b><small className="text-slate-500 text-xs">{t}</small></td>
                    <td className="px-3 py-3 align-top"><div className="flex gap-2 items-center"><span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">{(e.user || "?")[0]?.toUpperCase()}</span><div><div className="font-medium">{e.user}</div><small className="block text-slate-500 text-xs mt-0.5 capitalize">{e.role}</small></div></div></td>
                    <td className="px-3 py-3 align-top"><span className="inline-flex items-center gap-1.5 font-semibold text-[12px] px-2.5 py-0.5 rounded-full border border-slate-200" style={{ color: `hsl(${ty.h} 55% 45%)` }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(${ty.h} 55% 45%)` }}></span>{ty.label}</span><div className="mt-1 font-semibold text-[13.5px]" title={e.code}>{e.action}</div></td>
                    <td className="px-3 py-3 align-top"><div className="font-semibold">{tl}</div>{ts && <small className="block font-mono text-slate-500 text-[12.5px] mt-0.5" title={e.target}>{ts}</small>}</td>
                    <td className="px-3 py-3 align-top"><div className="flex flex-wrap gap-1.5">{facts.length ? facts.map(([k, v, tn], i) => {
                      const c = tn === 'ok' ? 'text-green-700' : tn === 'warn' ? 'text-amber-700' : tn === 'bad' ? 'text-red-700 border-red-200' : tn === 'tag' ? 'bg-slate-100 text-orange-600 border-transparent' : '';
                      return <span key={i} className={`inline-flex items-baseline gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 font-semibold text-[13px] ${c}`}>{k && <i className="not-italic font-medium text-slate-500 text-[12px]">{k}</i>}{v}</span>
                    }) : <span className="text-slate-500">—</span>}</div></td>
                    <td className="px-3 py-3 align-top text-right sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.1)] transition-colors"><button className="text-orange-600 font-semibold hover:text-orange-700 transition-colors whitespace-nowrap" onClick={() => setSel(e)}>View details</button></td>
                  </tr>);
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-4 py-3 text-slate-500 text-[13px] bg-slate-50/50 border-t border-slate-200">
          <span className="font-medium">{data.total ? `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, data.total)} of ${data.total}` : ""}</span>
          <span className="flex gap-1.5"><button className="border border-slate-200 bg-white font-medium text-slate-900 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button><button className="border border-slate-200 bg-white font-medium text-slate-900 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</button></span>
        </div>
      </div>

      <dialog ref={dlg} onClose={() => setSel(null)} onClick={(e) => e.target === dlg.current && setSel(null)} className="m-0 ml-auto h-full max-h-full w-full max-w-[520px] border-0 p-0 bg-white text-slate-900 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:animate-slide-in-right">
        {sel && (<>
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between gap-3 items-start">
            <div><h2 className="m-0 text-lg font-bold">{sel.action}</h2><div className="text-slate-500 font-mono text-[12.5px] mt-1">{sel.code}</div></div>
            <button className="bg-transparent border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg w-8 h-8 flex items-center justify-center shrink-0 transition-colors" aria-label="Close" onClick={() => setSel(null)}>✕</button>
          </div>
          <div className="p-5 grid gap-5 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
            <dl className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-2 m-0 text-sm">
              <dt className="text-slate-500 font-medium">Type</dt><dd className="m-0 font-medium min-w-0"><span className="inline-flex items-center gap-1.5 font-semibold text-[12px] px-2.5 py-0.5 rounded-full border border-slate-200" style={{ color: `hsl(${(TYPES[sel.type] || TYPES.other).h} 55% 45%)` }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(${(TYPES[sel.type] || TYPES.other).h} 55% 45%)` }}></span>{(TYPES[sel.type] || TYPES.other).label}</span></dd>
              <dt className="text-slate-500 font-medium">Event ID</dt><dd className="m-0 font-medium min-w-0 font-mono text-[12.5px] break-all">{sel.id} <Copy text={sel.id} /></dd>
              <dt className="text-slate-500 font-medium">When</dt><dd className="m-0 font-medium min-w-0">{sel.ts} <span className="text-slate-400">IST</span></dd>
              <dt className="text-slate-500 font-medium">Done by</dt><dd className="m-0 font-medium min-w-0">{sel.user}{sel.role ? ` (${sel.role})` : ""}</dd>
              <dt className="text-slate-500 font-medium">Target</dt><dd className="m-0 font-medium min-w-0 font-mono text-[12.5px] break-all">{sel.target || "—"} {sel.target && <Copy text={sel.target} label="Copy target" />}</dd>
              {sel.reason && (<><dt className="text-slate-500 font-medium">Reason</dt><dd className="m-0 font-medium min-w-0 italic text-slate-700">{sel.reason}</dd></>)}
            </dl>
            <div>
              <h3 className="m-0 mb-2 text-[13px] text-slate-500 uppercase tracking-wider font-semibold">Details</h3>
              {Object.keys(sel.details).length ? (
                <table className="w-full text-left text-sm border border-slate-200 rounded-xl overflow-hidden table-auto">
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(sel.details).map(([k, v]) => (
                      <tr key={k} className="bg-white">
                        <td className="px-3 py-2 text-slate-500 w-[38%]">{human(k)}</td>
                        <td className={`px-3 py-2 font-medium ${typeof v === "string" && v.length > 14 && !v.includes(" ") ? "font-mono text-[12.5px] break-all" : ""}`}>{k === "billingPeriod" ? val(k, v) : typeof v === "object" ? JSON.stringify(v) : String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-500 text-[13px] italic text-center">No extra details recorded.</div>}
            </div>
            {sel.changes?.length > 0 && <div>
              <h3 className="m-0 mb-2 text-[13px] text-slate-500 uppercase tracking-wider font-semibold">What changed</h3>
              <table className="w-full text-left text-sm border border-slate-200 rounded-xl overflow-hidden table-auto">
                <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="px-3 py-2 font-semibold">Field</th><th className="px-3 py-2 font-semibold">Before</th><th className="px-3 py-2 font-semibold">After</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {sel.changes.map(([k, b, a]) => (
                    <tr key={k} className="bg-white">
                      <td className="px-3 py-2 font-medium">{k}</td>
                      <td className="px-3 py-2 bg-red-50 text-red-700 line-through decoration-red-300 break-words whitespace-pre-wrap font-mono text-xs">{b}</td>
                      <td className="px-3 py-2 bg-green-50 text-green-700 font-semibold break-words whitespace-pre-wrap font-mono text-xs">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
            {/* <details className="group">
              <summary className="cursor-pointer text-slate-500 font-semibold text-sm">Raw record</summary>
              <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl overflow-auto text-[11.5px] font-mono max-h-[240px] text-slate-700">
                {JSON.stringify({ id: sel.id, action: sel.code, target: sel.target, details: sel.details }, null, 2)}
              </pre>
            </details> */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 text-orange-800 text-[13px] flex gap-2 mt-auto leading-relaxed">
              <span className="text-base">🔒</span>
              This record is read-only. Corrections are made through new entries such as a credit note or journal voucher, never by editing history.
            </div>
          </div>
        </>)}
      </dialog>
      <style dangerouslySetInnerHTML={{
        __html: `
        dialog::backdrop { background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px); }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .open\\:animate-slide-in-right[open] { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
    </div>
  );
}
