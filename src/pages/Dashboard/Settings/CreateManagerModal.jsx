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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Assign {role.roleName}</h3>
            <p className="text-sm text-gray-500">{role.department} Department</p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper (Only show up to step 3) */}
        {step < 4 && (
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <div className={`flex items-center gap-2 text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</span>
              Method
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
            <div className={`flex items-center gap-2 text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</span>
              Details
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
            <div className={`flex items-center gap-2 text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</span>
              Confirm
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* Step 1: Select Path */}
          {step === 1 && (
            <div className="space-y-4">
              <button
                onClick={() => { setPath('existing'); setStep(2); }}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Promote Existing Resident</h4>
                  <p className="text-sm text-gray-500">Search from active residents in the society and assign them this role.</p>
                </div>
              </button>
              
              <button
                onClick={() => { setPath('new'); setStep(2); }}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Invite New User</h4>
                  <p className="text-sm text-gray-500">Send an onboarding invite to a brand-new manager (requires email/phone verification).</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && path === 'existing' && (
            <div className="space-y-6 min-h-[250px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Resident</label>
                <ResidentSearchInput 
                  societyId={JSON.parse(localStorage.getItem('user'))?.societyId} 
                  onSelect={handleResidentSelect} 
                />
              </div>
            </div>
          )}

          {step === 2 && path === 'new' && (
            <form id="new-user-form" onSubmit={handleNewUserSubmit} className="space-y-4 min-h-[250px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Required if phone is empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Required if email is empty"
                />
              </div>
            </form>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Confirm Assignment</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You are about to assign <span className="font-bold">{formData.name}</span> as the new <span className="font-bold">{role.roleName}</span>.
                  </p>
                  {path === 'new' && (
                    <p className="text-xs text-blue-600 mt-2 font-medium bg-blue-100 inline-block px-2 py-1 rounded">
                      An onboarding invite will be sent.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Email</span>
                  <span className="text-sm font-medium text-gray-900">{formData.email || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Phone</span>
                  <span className="text-sm font-medium text-gray-900">{formData.phone || '—'}</span>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full max-w-[200px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success (Invite Link) */}
          {step === 4 && (
            <div className="p-4 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Manager Invited Successfully</h4>
                <p className="text-gray-500 mt-2">
                  The manager account has been created. They must activate their account using the invite link.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Development Invite Link
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shrink-0 flex items-center gap-2 text-sm font-medium"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded inline-block">
                  Note: This link is only shown because the server is running in development mode.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between bg-gray-50/50">
          {step < 4 ? (
            <>
              <button
                onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                {step > 1 ? 'Back' : 'Cancel'}
              </button>
              
              {step === 2 && path === 'new' ? (
                <button
                  type="submit"
                  form="new-user-form"
                  disabled={!formData.name || (!formData.email && !formData.phone) || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  Continue
                </button>
              ) : step === 3 ? (
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Processing...' : 'Confirm & Assign'}
                </button>
              ) : null}
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={handleClose}
                className="px-8 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors w-full"
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
