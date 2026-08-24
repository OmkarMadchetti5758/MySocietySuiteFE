import React, { useState } from 'react';
import { X, Info, Send, Check, Copy } from 'lucide-react';
import staffApi from '../../../services/staffApi';

const AddStaffModal = ({ onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    designation: '',
    shiftTiming: '',
    gateOrArea: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const designations = [
    { value: 'housekeeping', label: 'Housekeeping' },
    // { value: 'security', label: 'Security guard' },
    { value: 'gardener', label: 'Gardener' },
    { value: 'electrician', label: 'Electrician' },
    { value: 'plumber', label: 'Plumber' },
    // { value: 'watchman', label: 'Watchman' },
    { value: 'lift_operator', label: 'Lift operator' },
    { value: 'other', label: 'Other' }
  ];

  const shifts = [
    'Morning · 6:00–14:00',
    'Afternoon · 14:00–22:00',
    'Night · 22:00–6:00',
    'Custom'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.designation || !formData.shiftTiming) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await staffApi.addStaff(formData);
      const link = response.data?.data?.devInviteLink || response.data?.devInviteLink;
      if (link) {
        setInviteLink(link);
        onAdded();
      } else {
        onAdded();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Success state: Show invite link ──────────────────────────────────────────
  if (inviteLink) {
    return (
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <h3 className="text-lg font-bold text-gray-900">Add Staff Member</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 flex flex-col items-center text-center overflow-y-auto custom-scrollbar flex-1">
            <div className="w-16 h-16 bg-[#E0FBEB] rounded-full flex items-center justify-center mx-auto mb-5 shrink-0">
              <Check className="w-8 h-8 text-[#00A859]" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Staff Invited Successfully</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-md">
              The staff account has been created. They must activate their account using the invite link.
            </p>

            <div className="w-full border border-gray-200 bg-gray-50/30 rounded-xl p-5 text-left mb-6">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Development Invite Link</div>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2.5 truncate outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-[#FFF9EB] text-amber-600 text-xs font-semibold px-4 py-2.5 rounded-lg inline-block w-full">
                Note: This link is only shown because the server is running in development mode.
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#111827] hover:bg-gray-800 text-white py-3.5 rounded-xl font-semibold transition-colors mt-2"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Add staff form ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add staff member</h3>
            <p className="text-sm text-gray-500 mt-1">They'll receive an invite link to set up their account</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}

          <form id="add-staff-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Full name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Phone number <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Role <span className="text-red-500">*</span></label>
              <select
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
              >
                <option value="">Select role</option>
                {designations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Shift timing <span className="text-red-500">*</span></label>
              <select
                value={formData.shiftTiming}
                onChange={e => setFormData({ ...formData, shiftTiming: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
              >
                <option value="">Select shift</option>
                {shifts.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Gate / area assigned</label>
              <input
                type="text"
                placeholder="e.g. Tower A, Main gate"
                value={formData.gateOrArea}
                onChange={e => setFormData({ ...formData, gateOrArea: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Email (optional)</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Address (optional)</label>
              <input
                type="text"
                placeholder="Staff residential address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </form>

          <div className="flex gap-3 bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-6">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900/80 leading-relaxed">
              An invite link will be generated for this staff member to set their password and complete registration.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            form="add-staff-form"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send invite</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;
