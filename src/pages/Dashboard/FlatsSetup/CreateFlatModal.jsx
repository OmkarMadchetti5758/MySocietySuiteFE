import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { flatApi } from '../../../services/flatApi';

const CreateFlatModal = ({ isOpen, onClose, wings, flats = [], onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentWingFlatCount, setCurrentWingFlatCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  
  const [formData, setFormData] = useState({
    blockId: '',
    floor: '',
    flatNumber: '',
    type: '2BHK',
    area: '',
    ownershipType: 'Freehold',
    occupancyStatus: 'Vacant',
    numberOfResidents: 0,
    parkingSlots: 0,
    status: 'vacant',
    possessionDate: ''
  });

  if (!isOpen) return null;

  const selectedWing = wings.find((w) => w._id === formData.blockId) || null;
  const limitReached = selectedWing && selectedWing.totalFlats && currentWingFlatCount >= selectedWing.totalFlats;

  useEffect(() => {
    if (!formData.blockId) {
      setCurrentWingFlatCount(0);
      return;
    }
    const fetchFlatCount = async () => {
      setLoadingCount(true);
      try {
        const response = await flatApi.getFlats({ blockId: formData.blockId });
        setCurrentWingFlatCount(response.data?.data?.flats?.length || 0);
      } catch (err) {
        console.error('Failed to fetch flat count for wing', err);
      } finally {
        setLoadingCount(false);
      }
    };
    fetchFlatCount();
  }, [formData.blockId]);

  const floorOptions = selectedWing
    ? Array.from({ length: selectedWing.totalFloors }, (_, i) => i + 1)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = { ...formData };
      if (payload.area) payload.area = Number(payload.area);
      if (payload.floor) payload.floor = Number(payload.floor);
      if (payload.numberOfResidents) payload.numberOfResidents = Number(payload.numberOfResidents);
      if (payload.parkingSlots) payload.parkingSlots = Number(payload.parkingSlots);
      
      await flatApi.createFlat(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create flat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // reset floor whenever wing changes
      ...(name === 'blockId' ? { floor: '' } : {}),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-gray-800">Add New Flat</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="create-flat-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wing / Block *</label>
                <select
                  required
                  name="blockId"
                  value={formData.blockId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Wing</option>
                  {wings.map((wing) => (
                    <option key={wing._id} value={wing._id}>
                      {wing.name}
                    </option>
                  ))}
                </select>
                {limitReached && !loadingCount && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 inline-block">
                    Wing limit reached ({selectedWing.totalFlats}/{selectedWing.totalFlats} flats).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Floor Number *</label>
                <select
                  required
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  disabled={!selectedWing}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">{selectedWing ? 'Select Floor' : 'Select Wing first'}</option>
                  {floorOptions.map((f) => (
                    <option key={f} value={f}>
                      Floor {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Flat Number *</label>
                <input
                  type="text"
                  required
                  name="flatNumber"
                  value={formData.flatNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Flat Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="4BHK">4BHK</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Area (sq ft) *</label>
                <input
                  type="number"
                  required
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 1200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ownership Type *</label>
                <select
                  required
                  name="ownershipType"
                  value={formData.ownershipType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Freehold">Freehold</option>
                  <option value="Leasehold">Leasehold</option>
                  <option value="Builder">Builder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Occupancy Status *</label>
                <select
                  required
                  name="occupancyStatus"
                  value={formData.occupancyStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Owner Occupied">Owner Occupied</option>
                  <option value="Tenant Occupied">Tenant Occupied</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">No. of Residents</label>
                <input
                  type="number"
                  name="numberOfResidents"
                  value={formData.numberOfResidents}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parking Slots</label>
                <input
                  type="number"
                  name="parkingSlots"
                  value={formData.parkingSlots}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Possession Date</label>
                <input
                  type="date"
                  name="possessionDate"
                  value={formData.possessionDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-flat-form"
            disabled={submitting || limitReached || loadingCount}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Flat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFlatModal;
