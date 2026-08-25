import React, { useState, useEffect, useCallback } from 'react';
import { amenityService } from '../../../services/amenityBookingService';
import { FaPlus, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'];

const SlotManagerModal = ({ amenity, onClose }) => {
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ dayOfWeek: 'All', startTime: '', endTime: '' });
  const [formError, setFormError] = useState('');

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const res = await amenityService.getAmenitySlots(amenity._id);
      if (res.success) setSlots(res.data);
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [amenity._id]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleChange = (e) => {
    setFormError('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.startTime || !form.endTime) {
      setFormError('Start and end time are required');
      return;
    }
    if (form.startTime >= form.endTime) {
      setFormError('Start time must be before end time');
      return;
    }
    setSaving(true);
    try {
      await amenityService.createAmenitySlot(amenity._id, form);
      toast.success('Slot added successfully');
      setForm({ dayOfWeek: 'All', startTime: '', endTime: '' });
      fetchSlots();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add slot';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSlot = async (slot) => {
    try {
      const newStatus = slot.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await amenityService.updateAmenitySlot(amenity._id, slot._id, { status: newStatus });
      toast.success(`Slot ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update slot');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Manage Slots</h2>
            <p className="text-sm text-gray-500 mt-0.5">{amenity.name}</p>
          </div>
          <button onClick={onClose} id="btn-close-slot-manager" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Add Slot Form */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add New Slot</p>
          <form onSubmit={handleAddSlot} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                <select
                  name="dayOfWeek"
                  value={form.dayOfWeek}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <button
              id="btn-add-slot"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              <FaPlus className="text-xs" />
              {saving ? 'Adding...' : 'Add Slot'}
            </button>
          </form>
        </div>

        {/* Slot List */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Configured Slots</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No slots configured yet.</div>
          ) : (
            <div className="space-y-2">
              {slots.map(slot => (
                <div key={slot._id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${slot.status === 'ACTIVE' ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${slot.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{slot.startTime} – {slot.endTime}</p>
                      <p className="text-xs text-gray-400">{slot.dayOfWeek}</p>
                    </div>
                  </div>
                  <button
                    id={`btn-toggle-slot-${slot._id}`}
                    onClick={() => handleToggleSlot(slot)}
                    title={slot.status === 'ACTIVE' ? 'Deactivate slot' : 'Activate slot'}
                    className={`text-xl transition-colors ${slot.status === 'ACTIVE' ? 'text-green-500 hover:text-red-400' : 'text-gray-400 hover:text-green-500'}`}
                  >
                    {slot.status === 'ACTIVE' ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotManagerModal;
