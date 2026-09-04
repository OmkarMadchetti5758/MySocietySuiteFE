import React, { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { flatApi } from '../../../services/flatApi';

const AllocateResidentModal = ({ flat, mode, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    residentType: 'owner',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Name and Phone are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await flatApi.allocateResident(flat._id, formData);
      const data = response.data?.data;
      if (data?.devInviteLink) {
        setDevLink(data.devInviteLink);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate resident. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Allocate Resident</h2>
              {mode && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    mode === 'existing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {mode === 'existing' ? 'Existing' : 'New'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">Flat {flat.flatNumber}</p>
          </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {devLink ? (
          <div className="px-6 py-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-emerald-700 font-semibold text-sm mb-2">✅ Resident allocated successfully!</p>
              <p className="text-xs text-emerald-600 mb-3">Share the invite link below with the resident to activate their account:</p>
              <a
                href={devLink}
                target="_blank"
                rel="noreferrer"
                className="block break-all text-xs text-blue-600 underline font-mono bg-white border border-blue-100 rounded-lg p-2"
              >
                {devLink}
              </a>
            </div>
            <button
              onClick={onSuccess}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-medium transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {mode === 'existing' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-xs leading-relaxed">
                Enter the details of the existing resident to link them to this flat.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resident Type *</label>
              <div className="flex gap-3">
                {[
                  { value: 'owner', label: 'Owner', desc: 'Primary property owner' },
                  { value: 'tenant', label: 'Tenant', desc: 'Renting the flat' }
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.residentType === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="residentType"
                      value={opt.value}
                      checked={formData.residentType === opt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-semibold text-gray-900 text-sm">{opt.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rahul@example.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-medium transition-colors text-sm disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {submitting ? 'Allocating...' : 'Allocate Resident'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AllocateResidentModal;
