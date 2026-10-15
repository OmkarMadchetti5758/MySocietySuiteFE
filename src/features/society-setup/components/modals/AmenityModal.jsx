import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { AMENITY_CATEGORIES, AMENITY_STATUS } from '../../constants/setupConstants';

const AmenityModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Recreation',
    location: 'Ground Floor',
    bookable: true,
    chargesApplicable: true,
    operatingHours: '06:00 AM - 10:00 PM',
    status: 'Active',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        category: editData.category || 'Recreation',
        location: editData.location || 'Ground Floor',
        bookable: editData.bookable !== undefined ? editData.bookable : true,
        chargesApplicable: editData.chargesApplicable !== undefined ? editData.chargesApplicable : true,
        operatingHours: editData.operatingHours || '06:00 AM - 10:00 PM',
        status: editData.status || 'Active',
        description: editData.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Recreation',
        location: 'Ground Floor',
        bookable: true,
        chargesApplicable: true,
        operatingHours: '06:00 AM - 10:00 PM',
        status: 'Active',
        description: '',
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Amenity name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {editData ? 'Edit Amenity' : 'Add New Amenity'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Amenity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Club House, Swimming Pool, Gym"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
            />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Short Description / Subtitle
            </label>
            <input
              type="text"
              placeholder="e.g. Temperature controlled pool, Community events"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              >
                {AMENITY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ground Floor, Podium Level"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.location && <p className="text-[11px] text-red-500 mt-1">{errors.location}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                placeholder="e.g. 06:00 AM - 10:00 PM or Open 24 Hours"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              >
                {Object.values(AMENITY_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bookable & Charges Toggles */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-800">Bookable?</span>
                <span className="text-[10px] text-gray-500">Requires advance slot booking</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bookable}
                  onChange={(e) => setFormData({ ...formData, bookable: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#EA580C]"></div>
              </label>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-gray-800">Charges Applicable?</span>
                <span className="text-[10px] text-gray-500">Hourly / session fee</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.chargesApplicable}
                  onChange={(e) => setFormData({ ...formData, chargesApplicable: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#EA580C]"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FiCheck className="text-base" />
              <span>{editData ? 'Update Amenity' : 'Save Amenity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmenityModal;
