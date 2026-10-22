import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, UserPlus, Search, Check, Copy } from 'lucide-react';
import ResidentSearchInput from './ResidentSearchInput';

const CreateManagerModal = ({ isOpen, onClose, onSubmit, role }) => {
  const [step, setStep] = useState(1); // 1: Select Path, 2: Details/Search, 3: Confirm
  const [path, setPath] = useState(''); // 'existing' or 'new'
  const [formData, setFormData] = useState({
    userId: null,
    name: '',
    email: '',
    phone: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !role) return null;

  const handleReset = () => {
    setStep(1);
    setPath('');
    setFormData({
      userId: null,
      name: '',
      email: '',
      phone: '',
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setInviteLink('');
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleResidentSelect = (resident) => {
    setFormData({
      ...formData,
      userId: resident._id,
      name: resident.name,
      email: resident.email,
      phone: resident.mobile
    });
    setStep(3);
  };

  const handleNewUserSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    const payload = {
      roleKey: role.roleKey,
      roleName: role.roleName,
      department: role.department,
      joiningDate: formData.joiningDate
    };

    if (path === 'existing') {
      payload.userId = formData.userId;
      await onSubmit('existing', payload);
    } else {
      payload.name = formData.name;
      payload.email = formData.email;
      payload.phone = formData.phone;
      const link = await onSubmit('new', payload);
      if (link && typeof link === 'string') {
        setInviteLink(link);
        setStep(4);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50/60 to-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
                {role.department}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Department Head</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Assign {role.roleName}</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper (Only show up to step 3) */}
        {step < 4 && (
          <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            {[
              { num: 1, label: 'Method' },
              { num: 2, label: 'Details' },
              { num: 3, label: 'Confirm' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className={`flex items-center gap-2 text-xs font-semibold ${step >= s.num ? 'text-orange-600' : 'text-slate-400'}`}>
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step > s.num
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : step === s.num
                        ? 'bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </div>
                {idx < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto">

          {/* Step 1: Select Path */}
          {step === 1 && (
            <div className="space-y-3.5">
              <button
                onClick={() => { setPath('existing'); setStep(2); }}
                className="w-full text-left p-4 rounded-xl border-1.5 border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-all group flex items-start gap-4 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#ea580c] group-hover:to-[#f97316] group-hover:text-white transition-all shadow-xs">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5 group-hover:text-orange-950">Promote Existing Resident</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Search from verified residents in the society and delegate this managerial responsibility.</p>
                </div>
              </button>

              <button
                onClick={() => { setPath('new'); setStep(2); }}
                className="w-full text-left p-4 rounded-xl border-1.5 border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-all group flex items-start gap-4 cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-amber-600 group-hover:to-orange-500 group-hover:text-white transition-all shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5 group-hover:text-amber-950">Invite New Manager</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Send an email/SMS onboarding invitation link for a new external department head.</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && path === 'existing' && (
            <div className="space-y-4 min-h-[240px]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Search Resident</label>
                <ResidentSearchInput
                  societyId={JSON.parse(localStorage.getItem('user'))?.societyId}
                  onSelect={handleResidentSelect}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Tip: Search by resident's full name, flat number, or registered email.
              </p>
            </div>
          )}

          {step === 2 && path === 'new' && (
            <form id="new-user-form" onSubmit={handleNewUserSubmit} className="space-y-4 min-h-[240px]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] outline-none text-sm text-slate-800 transition-all"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] outline-none text-sm text-slate-800 transition-all"
                  placeholder="rahul.sharma@example.com (Required if phone empty)"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] outline-none text-sm text-slate-800 transition-all"
                  placeholder="+91 98765 43210 (Required if email empty)"
                />
              </div>
            </form>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50/50 border border-orange-200/80 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-orange-950 text-sm">Confirm Role Assignment</h4>
                  <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                    You are assigning <span className="font-bold text-orange-950">{formData.name}</span> as the <span className="font-bold text-orange-950">{role.roleName}</span> for the <span className="font-semibold">{role.department}</span> department.
                  </p>
                  {path === 'new' && (
                    <span className="inline-block mt-2 text-[11px] font-semibold text-orange-700 bg-white/80 border border-orange-200 px-2 py-0.5 rounded-md">
                      Onboarding invitation will be sent immediately
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Email</span>
                    <span className="font-medium text-slate-800">{formData.email || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-1">Phone</span>
                    <span className="font-medium text-slate-800">{formData.phone || '—'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Assignment Joining Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full max-w-[220px] px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] outline-none text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success (Invite Link) */}
          {step === 4 && (
            <div className="p-3 text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Manager Invited Successfully</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  The manager record was created. They can activate their account using the invite sent to their contact details.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Development Invite Link
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-mono focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-amber-700 mt-2 font-medium bg-amber-50/80 border border-amber-200/60 p-2 rounded-md">
                  Note: This link is provided for convenience during development mode.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/60">
          {step < 4 ? (
            <>
              <button
                onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {step > 1 ? 'Back' : 'Cancel'}
              </button>

              {step === 2 && path === 'new' ? (
                <button
                  type="submit"
                  form="new-user-form"
                  disabled={!formData.name || (!formData.email && !formData.phone) || loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:opacity-95 shadow-md shadow-orange-500/20 rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  Continue
                </button>
              ) : step === 3 ? (
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:opacity-95 shadow-md shadow-orange-500/20 rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Confirm & Assign'}
                </button>
              ) : null}
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={handleClose}
                className="px-8 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors w-full cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateManagerModal;
