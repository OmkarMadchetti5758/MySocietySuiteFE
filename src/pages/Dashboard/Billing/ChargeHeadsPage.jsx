import React, { useState, useEffect } from "react";
import {
  FaCog, FaSearch, FaPlus, FaCheck, FaTimes, FaEdit, FaTrash, FaSpinner,
  FaArrowLeft
} from "react-icons/fa";
import apiClient from "../../../services/apiClient";
import toast from "react-hot-toast";

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED": case "Paid": case "Successful": case "Active":
    case "Reconciled": case "Filed": case "Approved":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "PENDING_APPROVAL": case "Pending": case "Pending Clearance":
    case "Pending Approval": case "DRAFT":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "REJECTED": case "Overdue": case "Failed":
      return "bg-red-50 text-red-600 border-red-100";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-500 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
};

const ChargeHeadsPage = ({ onBack }) => {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const roleKeys = currentUser.roleKeys || [];
  const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin"
    || roleKeys.includes("admin") || roleKeys.includes("super_admin");
  const isAccountant = roleKeys.includes("accountant");
  const canManage = isAdmin || isAccountant;

  const [activeTab, setActiveTab] = useState("charge_heads");
  const [chargeHeads, setChargeHeads] = useState([]);
  const [loadingHeads, setLoadingHeads] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [billingConfig, setBillingConfig] = useState({
    billingFrequency: "MONTHLY", billingDay: 1, dueDays: 10,
    arrearsDisplayMode: "SINGLE_TOTAL",
    defaultTaxSettings: { taxName: "GST", taxRate: 18 }
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const emptyForm = { name: "", code: "", description: "", category: "INCOME",
    calculationType: "FIXED", defaultAmount: "", ratePerSqFt: "",
    gstApplicable: false, gstRate: "18", residentTypesOwner: true,
    residentTypesTenant: true, allBlocks: true, ledgerAccountId: "" };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [rejectingHeadId, setRejectingHeadId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchChargeHeads = async () => {
    setLoadingHeads(true);
    try {
      const res = await apiClient.get("/billing/charge-heads");
      if (res.data?.status === "success") setChargeHeads(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load charge heads");
    } finally { setLoadingHeads(false); }
  };

  const fetchBillingConfig = async () => {
    try {
      const res = await apiClient.get("/billing/billing-config");
      if (res.data?.status === "success" && res.data.data) setBillingConfig(res.data.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchChargeHeads(); fetchBillingConfig(); }, []);

  const handleOpenCreateModal = () => { setEditingHead(null); setFormData(emptyForm); setIsModalOpen(true); };

  const handleOpenEditModal = (head) => {
    setEditingHead(head);
    setFormData({
      name: head.name || head.title || "", code: head.code || "",
      description: head.description || "", category: head.category || "INCOME",
      calculationType: head.calculationType || "FIXED",
      defaultAmount: head.defaultAmount || (head.calculationType === "FIXED" ? head.rate : "") || "",
      ratePerSqFt: head.ratePerSqFt || (head.calculationType === "PER_SQ_FT" ? head.rate : "") || "",
      gstApplicable: Boolean(head.gstApplicable),
      gstRate: head.gstRate ? String(head.gstRate) : "18",
      residentTypesOwner: head.applicability?.residentTypes ? head.applicability.residentTypes.includes("OWNER") : true,
      residentTypesTenant: head.applicability?.residentTypes ? head.applicability.residentTypes.includes("TENANT") : true,
      allBlocks: head.applicability?.allBlocks !== undefined ? Boolean(head.applicability.allBlocks) : true,
      ledgerAccountId: head.ledgerAccountId || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmitChargeHead = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Charge head name is required");
    setSubmittingForm(true);
    try {
      const payload = {
        name: formData.name.trim(), code: formData.code.trim() || undefined,
        description: formData.description, category: formData.category,
        calculationType: formData.calculationType,
        defaultAmount: formData.calculationType === "FIXED" ? Number(formData.defaultAmount) : undefined,
        ratePerSqFt: formData.calculationType === "PER_SQ_FT" ? Number(formData.ratePerSqFt) : undefined,
        gstApplicable: formData.gstApplicable,
        gstRate: formData.gstApplicable ? Number(formData.gstRate) : null,
        applicability: {
          residentTypes: [
            ...(formData.residentTypesOwner ? ["OWNER"] : []),
            ...(formData.residentTypesTenant ? ["TENANT"] : []),
          ],
          allBlocks: formData.allBlocks,
        },
        ledgerAccountId: formData.ledgerAccountId || null,
      };
      if (editingHead) {
        await apiClient.patch(`/billing/charge-heads/${editingHead._id}`, payload);
        toast.success("Charge head updated (Pending Approval)");
      } else {
        await apiClient.post("/billing/charge-heads", payload);
        toast.success("Charge head created (Pending Approval)");
      }
      setIsModalOpen(false); fetchChargeHeads();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save"); }
    finally { setSubmittingForm(false); }
  };

  const handleApprove = async (id) => {
    try {
      await apiClient.post(`/billing/charge-heads/${id}/approve`, { action: "approve" });
      toast.success("Charge head approved!"); fetchChargeHeads();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to approve"); }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return toast.error("Rejection reason is required");
    setSubmittingReject(true);
    try {
      await apiClient.post(`/billing/charge-heads/${rejectingHeadId}/reject`, { rejectionReason: rejectionReason.trim() });
      toast.success("Charge head rejected"); setRejectingHeadId(null); setRejectionReason(""); fetchChargeHeads();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to reject"); }
    finally { setSubmittingReject(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this charge head?")) return;
    try {
      const res = await apiClient.delete(`/billing/charge-heads/${id}`);
      toast.success(res.data?.message || "Deleted"); fetchChargeHeads();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to delete"); }
  };

  const handleSaveBillingConfig = async (e) => {
    e.preventDefault(); setSavingConfig(true);
    try {
      await apiClient.post("/billing/billing-config", billingConfig);
      toast.success("Billing configuration saved!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save"); }
    finally { setSavingConfig(false); }
  };

  const filteredChargeHeads = chargeHeads.filter(ch => {
    if (categoryFilter !== "ALL" && (ch.category || "INCOME") !== categoryFilter) return false;
    if (statusFilter !== "ALL" && ch.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!(ch.name || ch.title || "").toLowerCase().includes(q) && !(ch.code || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in-up pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors w-fit">
          <FaArrowLeft /> Back to Billing Hub
        </button>
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200">
          <button onClick={() => setActiveTab("charge_heads")} className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "charge_heads" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
            Charge Heads Management
          </button>
          <button onClick={() => setActiveTab("society_config")} className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "society_config" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
            Society Billing Configuration
          </button>
        </div>
      </div>

      {activeTab === "charge_heads" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 bg-purple-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-purple-100 text-purple-600 shrink-0"><FaCog /></div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Charge Head Management</h2>
                <p className="text-xs text-gray-600">Configure Income & Expense billable heads, GST rates, per sq.ft vs fixed amounts.</p>
              </div>
            </div>
            {canManage && (
              <button onClick={handleOpenCreateModal} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2">
                <FaPlus /> Create Charge Head
              </button>
            )}
          </div>

          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none">
                <option value="ALL">All Categories</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none">
                <option value="ALL">All Statuses</option><option value="APPROVED">Approved</option>
                <option value="PENDING_APPROVAL">Pending Approval</option><option value="REJECTED">Rejected</option><option value="DRAFT">Draft</option>
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search charge head..."
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Code & Name</th><th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Calculation & Rate</th><th className="py-4 px-6">GST</th>
                  <th className="py-4 px-6">Applicability</th><th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingHeads ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-500">
                    <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-orange-500" />Loading charge heads...
                  </td></tr>
                ) : filteredChargeHeads.length > 0 ? filteredChargeHeads.map(head => (
                  <tr key={head._id} className="border-b border-gray-50 hover:bg-orange-50/20 transition-colors text-sm">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{head.name || head.title}</div>
                      <div className="text-xs font-mono text-gray-400">{head.code || "CH-AUTO"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${head.category === "EXPENSE" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {head.category || "INCOME"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      {head.calculationType === "PER_SQ_FT" ? <span>Rs.{head.ratePerSqFt || head.rate || 0} / sq.ft</span> : <span>Rs.{head.defaultAmount || head.rate || 0} / flat</span>}
                    </td>
                    <td className="py-4 px-6">
                      {head.gstApplicable ? <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">GST {head.gstRate}%</span> : <span className="text-xs text-gray-400">Exempt</span>}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600">
                      {head.applicability?.allBlocks ? "All Blocks" : "Selected Blocks"}
                      <span className="text-gray-400"> ({head.applicability?.residentTypes?.join(", ") || "Owner, Tenant"})</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(head.status)}`}>{head.status}</span>
                      {head.rejectionReason && <div className="text-[10px] text-red-500 mt-1 max-w-xs truncate">Reason: {head.rejectionReason}</div>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {head.status === "PENDING_APPROVAL" && isAdmin && (
                          <>
                            <button onClick={() => handleApprove(head._id)} className="p-1.5 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-bold flex items-center gap-1"><FaCheck /> Approve</button>
                            <button onClick={() => setRejectingHeadId(head._id)} className="p-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold flex items-center gap-1"><FaTimes /> Reject</button>
                          </>
                        )}
                        {canManage && (
                          <>
                            <button onClick={() => handleOpenEditModal(head)} className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-colors"><FaEdit /></button>
                            <button onClick={() => handleDelete(head._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-500 text-sm">No charge heads found matching criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "society_config" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Society Billing & Invoicing Rules</h2>
            <p className="text-xs text-gray-500">Configure global billing cycle frequency, due date calculation, and invoice display format.</p>
          </div>
          <form onSubmit={handleSaveBillingConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Billing Cycle Frequency</label>
                <select value={billingConfig.billingFrequency} onChange={e => setBillingConfig({ ...billingConfig, billingFrequency: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none">
                  <option value="MONTHLY">Monthly Billing Cycle</option><option value="QUARTERLY">Quarterly Billing Cycle</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Invoice Generation Day of Month</label>
                <input type="number" min="1" max="28" value={billingConfig.billingDay}
                  onChange={e => setBillingConfig({ ...billingConfig, billingDay: Number(e.target.value) })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                <span className="text-[11px] text-gray-400">Day of month when recurring invoices are issued (1-28)</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Payment Grace Days (Due Date)</label>
                <input type="number" min="1" max="90" value={billingConfig.dueDays}
                  onChange={e => setBillingConfig({ ...billingConfig, dueDays: Number(e.target.value) })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                <span className="text-[11px] text-gray-400">Days after invoice date before bill becomes overdue</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Default GST Rate (%)</label>
                <input type="number" min="0" max="28" value={billingConfig.defaultTaxSettings?.taxRate || 18}
                  onChange={e => setBillingConfig({ ...billingConfig, defaultTaxSettings: { ...billingConfig.defaultTaxSettings, taxRate: Number(e.target.value) } })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                <span className="text-[11px] text-gray-400">Default GST rate applied to taxable charge heads</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Arrears Display Mode on Resident Invoice</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { val: "SINGLE_TOTAL", label: "Single Carried-Forward Total", desc: "Displays past outstanding balance as a single total line item." },
                  { val: "LINE_BY_LINE", label: "Line-by-Line Itemized Arrears", desc: "Displays individual unpaid charges per historical month." }
                ].map(opt => (
                  <label key={opt.val} className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${billingConfig.arrearsDisplayMode === opt.val ? "border-orange-500 bg-orange-50/20 shadow-sm" : "border-gray-200 bg-gray-50"}`}>
                    <input type="radio" name="arrearsDisplayMode" value={opt.val}
                      checked={billingConfig.arrearsDisplayMode === opt.val}
                      onChange={e => setBillingConfig({ ...billingConfig, arrearsDisplayMode: e.target.value })}
                      className="mt-1 accent-orange-500" />
                    <div>
                      <div className="font-bold text-sm text-gray-900">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {canManage && (
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={savingConfig} className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-50">
                  {savingConfig ? "Saving..." : "Save Billing Configuration"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-gray-100 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingHead ? "Edit Charge Head" : "Create New Charge Head"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmitChargeHead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Head Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Maintenance Charge" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Code (Unique)</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MAINT" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase font-mono focus:outline-none focus:border-orange-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category *</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500">
                    <option value="INCOME">Income (Billable)</option><option value="EXPENSE">Expense (Payable)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Calculation Type *</label>
                  <select value={formData.calculationType} onChange={e => setFormData({ ...formData, calculationType: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500">
                    <option value="FIXED">FIXED (Flat Amount)</option><option value="PER_SQ_FT">PER_SQ_FT (Area Rate)</option>
                  </select>
                </div>
              </div>
              {formData.calculationType === "FIXED" ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fixed Amount (Rs.) *</label>
                  <input type="number" min="0" step="0.01" required value={formData.defaultAmount}
                    onChange={e => setFormData({ ...formData, defaultAmount: e.target.value })} placeholder="e.g. 2500"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rate Per Sq. Ft. (Rs.) *</label>
                  <input type="number" min="0" step="0.01" required value={formData.ratePerSqFt}
                    onChange={e => setFormData({ ...formData, ratePerSqFt: e.target.value })} placeholder="e.g. 3.50"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500" />
                </div>
              )}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">GST Applicable</div>
                  <div className="text-[11px] text-gray-500">Calculate GST on this charge item</div>
                </div>
                <input type="checkbox" checked={formData.gstApplicable} onChange={e => setFormData({ ...formData, gstApplicable: e.target.checked })} className="w-5 h-5 accent-orange-500 cursor-pointer" />
              </div>
              {formData.gstApplicable && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">GST Rate (%) *</label>
                  <input type="number" min="0.1" step="0.1" required value={formData.gstRate}
                    onChange={e => setFormData({ ...formData, gstRate: e.target.value })} placeholder="18"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500" />
                </div>
              )}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submittingForm} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50">
                  {submittingForm ? "Saving..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rejectingHeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fade-in-up">
            <h3 className="text-base font-bold text-gray-900 mb-2">Reject Charge Head Configuration</h3>
            <p className="text-xs text-gray-500 mb-4">Please specify a mandatory reason for rejecting this submission.</p>
            <form onSubmit={handleRejectSubmit}>
              <textarea required rows="3" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500 mb-4" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setRejectingHeadId(null); setRejectionReason(""); }} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submittingReject} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50">
                  {submittingReject ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargeHeadsPage;
