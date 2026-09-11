import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaPlus } from 'react-icons/fa';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const OneTimeChargeModal = ({ onClose, onSuccess, flats = [] }) => {
  const [form, setForm] = useState({
    flatId: '',
    description: '',
    amount: '',
    taxRate: '0',
    billingPeriod: currentPeriod(),
    effectiveDate: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.flatId) return toast.error('Select a flat');
    if (!form.description.trim()) return toast.error('Description is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await apiClient.post('/billing/one-time-charges', {
        ...form,
        amount: Number(form.amount),
        taxRate: Number(form.taxRate),
      });
      toast.success('One-time charge added successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add charge');
    } finally {
      setSaving(false);
    }
  };

  const taxAmt = form.amount && form.taxRate ? (Number(form.amount) * Number(form.taxRate) / 100) : 0;
  const total = Number(form.amount || 0) + taxAmt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Add One-Time Charge</h3>
          <button onClick={onClose}><FaTimes className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Flat *</label>
            <select
              value={form.flatId}
              onChange={e => setForm({ ...form, flatId: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              required
            >
              <option value="">Select flat...</option>
              {flats.length === 0 && (
                <option disabled>No flats available — check Society Configuration</option>
              )}
              {flats.map(f => (
                <option key={f._id} value={f._id}>
                  {f.flatNumber || f._id}
                  {f.ownerName ? ` — ${f.ownerName}` : ''}
                  {f.occupancyStatus ? ` (${f.occupancyStatus})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description *</label>
            <input
              type="text" required
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Special Repair Levy, NOC Charge..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (₹) *</label>
              <input
                type="number" min="0.01" step="0.01" required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tax Rate (%)</label>
              <input
                type="number" min="0" max="28" step="0.1"
                value={form.taxRate}
                onChange={e => setForm({ ...form, taxRate: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Billing Period</label>
              <input
                type="month"
                value={form.billingPeriod}
                onChange={e => setForm({ ...form, billingPeriod: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Effective Date</label>
              <input
                type="date"
                value={form.effectiveDate}
                onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {form.amount > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Base Amount</span><span>{fmt(Number(form.amount))}</span></div>
              {taxAmt > 0 && <div className="flex justify-between text-gray-600"><span>Tax ({form.taxRate}%)</span><span>{fmt(taxAmt)}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 border-t border-orange-200 pt-1 mt-1"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              {saving ? 'Adding...' : 'Add Charge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OneTimeChargeModal;
