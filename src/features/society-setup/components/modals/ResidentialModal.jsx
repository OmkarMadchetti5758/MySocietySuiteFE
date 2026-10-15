import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import {
  RESIDENTIAL_PROPERTY_TYPES,
  RESIDENTIAL_CONFIGURATIONS,
} from '../../constants/setupConstants';

const ResidentialModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    wing: '',
    propertyType: 'Flat / Apartment',
    configuration: '2 BHK',
    unitCount: '',
    carpetArea: '',
    builtUpArea: '',
    parking4W: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        wing: editData.wing || '',
        propertyType: editData.propertyType || 'Flat / Apartment',
        configuration: editData.configuration || '2 BHK',
        unitCount: editData.unitCount || '',
        carpetArea: editData.carpetArea || '',
        builtUpArea: editData.builtUpArea || '',
        parking4W: editData.parking4W || '',
      });
    } else {
      setFormData({
        wing: '',
        propertyType: 'Flat / Apartment',
        configuration: '2 BHK',
        unitCount: '',
        carpetArea: '',
        builtUpArea: '',
        parking4W: '',
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.wing.trim()) newErrors.wing = 'Wing/Block is required';
    if (!formData.unitCount || Number(formData.unitCount) <= 0) newErrors.unitCount = 'Valid unit count required';
    if (!formData.carpetArea || Number(formData.carpetArea) <= 0) newErrors.carpetArea = 'Carpet area required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      unitCount: Number(formData.unitCount),
      carpetArea: Number(formData.carpetArea),
      builtUpArea: Number(formData.builtUpArea) || Math.round(Number(formData.carpetArea) * 1.35),
      parking4W: Number(formData.parking4W) || Number(formData.unitCount),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {editData ? 'Edit Residential Configuration' : 'Add Residential Configuration'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Wing / Block <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. A Wing or Tower 1"
                value={formData.wing}
                onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.wing && <p className="text-[11px] text-red-500 mt-1">{errors.wing}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              >
                {RESIDENTIAL_PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Configuration <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.configuration}
                onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              >
                {RESIDENTIAL_CONFIGURATIONS.map((cfg) => (
                  <option key={cfg} value={cfg}>
                    {cfg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Unit Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={formData.unitCount}
                onChange={(e) => setFormData({ ...formData, unitCount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.unitCount && <p className="text-[11px] text-red-500 mt-1">{errors.unitCount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Carpet Area (sq.ft.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="100"
                placeholder="e.g. 550"
                value={formData.carpetArea}
                onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.carpetArea && <p className="text-[11px] text-red-500 mt-1">{errors.carpetArea}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Built-up Area (sq.ft.)
              </label>
              <input
                type="number"
                min="100"
                placeholder="e.g. 750"
                value={formData.builtUpArea}
                onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Parking (4W)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 30"
                value={formData.parking4W}
                onChange={(e) => setFormData({ ...formData, parking4W: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
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
              <span>{editData ? 'Update Configuration' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentialModal;
