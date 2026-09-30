import React, { useState, useEffect } from "react";
import {
  FaTimes, FaPlus, FaTrash, FaSpinner, FaBalanceScale,
  FaFileAlt, FaLink, FaPaperPlane, FaSave,
} from "react-icons/fa";
import toast from "react-hot-toast";
import ledgerService from "../../../../services/ledger.service";
import apiClient from "../../../../services/apiClient";

const REFERENCE_TYPES = [
  { value: "MANUAL", label: "Manual Entry" },
  { value: "EXPENSE", label: "Expense / Vendor Bill" },
  { value: "ADJUSTMENT", label: "Adjustment / Correction" },
  { value: "CREDIT_NOTE", label: "Credit Note" },
  { value: "DEBIT_NOTE", label: "Debit Note" },
  { value: "FINE", label: "Fine / Penalty" },
  { value: "INTEREST", label: "Interest Accrual" },
  { value: "TRANSFER", label: "Fund Transfer" },
];

const MEMBER_KEYWORDS = ["member", "receivable", "resident", "flat", "dues"];
const VENDOR_KEYWORDS = ["payable", "vendor", "supplier", "creditor"];

const needsFlat = (n = "") => MEMBER_KEYWORDS.some(k => n.toLowerCase().includes(k));
const needsVendor = (n = "") => VENDOR_KEYWORDS.some(k => n.toLowerCase().includes(k));
const emptyLine = () => ({ accountId: "", debit: "", credit: "", description: "", flatId: "", vendorId: "" });

const NewJournalEntryModal = ({ onClose, onSuccess }) => {
  const [accounts, setAccounts] = useState([]);
  const [flats, setFlats] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingAcc, setLoadingAcc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState("draft");

  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    description: "",
    referenceType: "MANUAL",
    referenceNumber: "",
    notes: "",
  });

  const [lines, setLines] = useState([emptyLine(), emptyLine()]);

  useEffect(() => {
    (async () => {
      const [aR, fR, vR] = await Promise.allSettled([
        ledgerService.getChartOfAccounts({ status: "ACTIVE", limit: 200 }),
        apiClient.get("/flats"),
        apiClient.get("/vendors"),
      ]);
      if (aR.status === "fulfilled") setAccounts(aR.value.data?.data?.accounts || []);
      if (fR.status === "fulfilled") {
        const d = fR.value.data?.data;
        setFlats(Array.isArray(d) ? d : d?.flats || []);
      }
      if (vR.status === "fulfilled") {
        const d = vR.value.data?.data;
        setVendors(Array.isArray(d) ? d : d?.vendors || []);
      }
      setLoadingAcc(false);
    })();
  }, []);

  const accountMap = Object.fromEntries(accounts.map(a => [a._id, a]));

  const changeLine = (idx, field, val) => {
    const ls = [...lines];
    if (field === "debit") { ls[idx].debit = val; if (val && +val > 0) ls[idx].credit = ""; }
    else if (field === "credit") { ls[idx].credit = val; if (val && +val > 0) ls[idx].debit = ""; }
    else if (field === "accountId") { ls[idx].accountId = val; ls[idx].flatId = ""; ls[idx].vendorId = ""; }
    else ls[idx][field] = val;
    setLines(ls);
  };

  const totalDebit = lines.reduce((s, l) => s + (+l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (+l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;
  const diff = Math.abs(totalDebit - totalCredit);

  const handleSubmit = async (mode) => {
    if (!formData.description.trim()) return toast.error("Narration is required");
    if (!isBalanced) return toast.error("Entry must be balanced");
    if (!lines.some(l => +l.debit > 0)) return toast.error("At least one Debit line required");
    if (!lines.some(l => +l.credit > 0)) return toast.error("At least one Credit line required");
    if (lines.some(l => !l.accountId)) return toast.error("Select account for every line");

    setSubmitting(true); setSubmitMode(mode);
    try {
      const payload = { ...formData, lines: lines.map(l => ({ accountId: l.accountId, debit: +l.debit || 0, credit: +l.credit || 0, description: l.description || formData.description, flatId: l.flatId || undefined, vendorId: l.vendorId || undefined })) };
      const res = await ledgerService.createJournalEntry(payload);
      const jeId = res.data?.data?.journalEntry?._id;
      if (mode === "submit" && jeId) { await ledgerService.submitJournalEntry(jeId); toast.success("JV submitted for approval!"); }
      else toast.success("Journal voucher saved as Draft");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save journal voucher");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[93vh] overflow-hidden">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-cyan-50/40 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-600 flex items-center justify-center shadow-md">
              <FaFileAlt className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Journal Voucher</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manual double-entry voucher (DRAFT → PENDING APPROVAL → POSTED)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Voucher No.</div>
              <div className="text-sm font-mono font-bold text-cyan-700">Auto-generated on save</div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full transition-colors">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">

            {/* 1. Header Details */}
            <div>
              <SectionLabel n="1" label="Voucher Header" />
              <div className="grid grid-cols-12 gap-5 mt-4">
                <div className="col-span-5">
                  <Label required>Narration / Description</Label>
                  <input type="text" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Being housekeeping charges booked for vendor invoice #458" className="input-field" />
                </div>
                <div className="col-span-3">
                  <Label required>Voucher Date</Label>
                  <input type="date" required value={formData.transactionDate} onChange={e => setFormData({ ...formData, transactionDate: e.target.value })} className="input-field" />
                </div>
                <div className="col-span-2">
                  <Label>Reference Type</Label>
                  <select value={formData.referenceType} onChange={e => setFormData({ ...formData, referenceType: e.target.value })} className="input-field">
                    {REFERENCE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label>Reference No.</Label>
                  <input type="text" value={formData.referenceNumber} onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })} placeholder="e.g. INV-458" className="input-field" />
                </div>
              </div>
            </div>

            {/* 2. Lines */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SectionLabel n="2" label="Journal Lines" />
                <span className="ml-auto text-xs text-gray-400">{lines.length} lines</span>
              </div>
              {loadingAcc ? (
                <div className="flex items-center justify-center gap-3 py-10 text-gray-500">
                  <FaSpinner className="animate-spin text-cyan-500 text-xl" />
                  <span className="text-sm">Loading chart of accounts…</span>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <colgroup>
                      <col style={{ width: "27%" }} />
                      <col style={{ width: "19%" }} />
                      <col style={{ width: "22%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "6%" }} />
                    </colgroup>
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        <th className="py-3 px-4">GL Account</th>
                        <th className="py-3 px-2">Sub-Ledger</th>
                        <th className="py-3 px-2">Line Description</th>
                        <th className="py-3 px-3 text-right">Debit (₹)</th>
                        <th className="py-3 px-3 text-right">Credit (₹)</th>
                        <th className="py-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lines.map((line, idx) => {
                        const acc = accountMap[line.accountId];
                        const showFlat = acc && needsFlat(acc.accountName);
                        const showVendor = acc && needsVendor(acc.accountName);
                        return (
                          <tr key={idx} className="group hover:bg-slate-50/70 transition-colors">
                            <td className="p-2 pl-4">
                              <select value={line.accountId} onChange={e => changeLine(idx, "accountId", e.target.value)} className="w-full text-sm font-medium text-gray-800 bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer">
                                <option value="" disabled>- Select Account -</option>
                                {["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"].map(type => {
                                  const grp = accounts.filter(a => a.accountType === type);
                                  return grp.length ? (
                                    <optgroup key={type} label={type}>
                                      {grp.map(a => <option key={a._id} value={a._id}>{a.accountCode} – {a.accountName}</option>)}
                                    </optgroup>
                                  ) : null;
                                })}
                              </select>
                            </td>
                            <td className="p-2">
                              {showFlat && (
                                <select value={line.flatId} onChange={e => changeLine(idx, "flatId", e.target.value)} className="w-full text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                                  <option value="">- Flat / Resident -</option>
                                  {flats.map(f => <option key={f._id} value={f._id}>{f.flatNumber} ({f.ownerName || f.wingName || ""})</option>)}
                                </select>
                              )}
                              {showVendor && (
                                <select value={line.vendorId} onChange={e => changeLine(idx, "vendorId", e.target.value)} className="w-full text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400">
                                  <option value="">- Vendor -</option>
                                  {vendors.map(v => <option key={v._id} value={v._id}>{v.name || v.vendorName}</option>)}
                                </select>
                              )}
                              {!showFlat && !showVendor && <span className="text-xs text-gray-300 pl-1">-</span>}
                            </td>
                            <td className="p-2">
                              <input type="text" value={line.description} onChange={e => changeLine(idx, "description", e.target.value)} placeholder="Narration…" className="w-full text-xs text-gray-600 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-300" />
                            </td>
                            <td className="p-2 border-l border-gray-100">
                              <input type="number" min="0" step="0.01" value={line.debit} onChange={e => changeLine(idx, "debit", e.target.value)} disabled={Boolean(line.credit && +line.credit > 0)} placeholder="0.00" className="w-full text-right text-sm font-semibold text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-300 disabled:opacity-25" />
                            </td>
                            <td className="p-2 border-l border-gray-100">
                              <input type="number" min="0" step="0.01" value={line.credit} onChange={e => changeLine(idx, "credit", e.target.value)} disabled={Boolean(line.debit && +line.debit > 0)} placeholder="0.00" className="w-full text-right text-sm font-semibold text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-300 disabled:opacity-25" />
                            </td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => { if (lines.length <= 2) return toast.error("Min 2 lines"); setLines(lines.filter((_, i) => i !== idx)); }} className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                <FaTrash size={11} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="bg-gray-50/60 px-4 py-2.5 border-t border-gray-200 flex items-center justify-between">
                    <button type="button" onClick={() => setLines([...lines, emptyLine()])} className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors">
                      <FaPlus size={10} /> Add Line
                    </button>
                    <span className="text-[10px] text-gray-400">Sub-ledger auto-shows for Member / Vendor accounts</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Balance Checker */}
            <div className={`rounded-2xl border px-6 py-4 flex items-center justify-between gap-6 transition-colors ${isBalanced ? "bg-emerald-50 border-emerald-200" : (totalDebit > 0 || totalCredit > 0) ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <FaBalanceScale className={`text-3xl ${isBalanced ? "text-emerald-500" : (totalDebit > 0 || totalCredit > 0) ? "text-red-400" : "text-gray-300"}`} />
                <div>
                  <div className={`text-sm font-bold ${isBalanced ? "text-emerald-800" : (totalDebit > 0 || totalCredit > 0) ? "text-red-800" : "text-gray-500"}`}>
                    {isBalanced ? "✓ Entry is Balanced - Ready to Save" : (totalDebit > 0 || totalCredit > 0) ? `Out of Balance - Difference: ₹${diff.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "Add amounts to validate balance"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Debit</div>
                  <div className="text-xl font-mono font-bold text-gray-900">₹{totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="text-gray-300 text-xl">=</div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Credit</div>
                  <div className="text-xl font-mono font-bold text-gray-900">₹{totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {/* 4. Notes */}
            <div>
              <SectionLabel n="3" label="Additional Notes" />
              <textarea rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional: remarks for reviewer, vendor invoice reference, committee resolution, etc." className="w-full mt-3 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none" />
            </div>

            {/* Workflow Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
              <FaLink className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Approval Workflow:</strong> <em>Save Draft</em> stores the JV with no ledger impact.
                <em> Save &amp; Submit</em> sends it to the Treasurer / Admin for review.
                The JV posts to the General Ledger only after <strong>Approve &amp; Post</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <div className="flex gap-3">
            <button type="button" onClick={() => handleSubmit("draft")} disabled={submitting || loadingAcc || !isBalanced} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting && submitMode === "draft" ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save Draft
            </button>
            <button type="button" onClick={() => handleSubmit("submit")} disabled={submitting || loadingAcc || !isBalanced} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting && submitMode === "submit" ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              Save &amp; Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionLabel = ({ n, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold">{n}</div>
    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">{label}</span>
  </div>
);

const Label = ({ children, required }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

// Inject a tiny CSS helper for input-field into the document if not already using tailwind directly
const style = document.createElement("style");
style.textContent = ".input-field { width:100%; border:1px solid #e5e7eb; border-radius:0.75rem; padding:0.625rem 1rem; font-size:0.875rem; outline:none; } .input-field:focus { ring: 2px; border-color:#06b6d4; }";
if (!document.head.querySelector("[data-jv-style]")) { style.setAttribute("data-jv-style", ""); document.head.appendChild(style); }

export default NewJournalEntryModal;
