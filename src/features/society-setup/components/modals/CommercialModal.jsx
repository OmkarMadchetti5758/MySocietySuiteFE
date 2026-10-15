import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { COMMERCIAL_TYPES } from '../../constants/setupConstants';

const CommercialModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    block: 'Commercial Block',
    commercialType: 'Shop',
    unitSize: '',
    unitCount: '',
    parking: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        block: editData.block || 'Commercial Block',
        commercialType: editData.commercialType || 'Shop',
        unitSize: editData.unitSize || '',
        unitCount: editData.unitCount || '',
        parking: editData.parking || '',
      });
    } else {
      setFormData({
        block: 'Commercial Block',
        commercialType: 'Shop',
        unitSize: '',
        unitCount: '',
        parking: '',
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.block.trim()) newErrors.block = 'Block name is required';
    if (!formData.unitSize || Number(formData.unitSize) <= 0) newErrors.unitSize = 'Valid unit size required';
    if (!formData.unitCount || Number(formData.unitCount) <= 0) newErrors.unitCount = 'Valid unit count required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      unitSize: Number(formData.unitSize),
      unitCount: Number(formData.unitCount),
      parking: Number(formData.parking) || Number(formData.unitCount),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {editData ? 'Edit Commercial Unit' : 'Add Commercial Unit'}
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
              Block / Complex <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Commercial Block or Retail Plaza"
              value={formData.block}
              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
            />
            {errors.block && <p className="text-[11px] text-red-500 mt-1">{errors.block}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Commercial Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.commercialType}
              onChange={(e) => setFormData({ ...formData, commercialType: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
            >
              {COMMERCIAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Unit Size (sq.ft.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="50"
                placeholder="e.g. 250"
                value={formData.unitSize}
                onChange={(e) => setFormData({ ...formData, unitSize: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.unitSize && <p className="text-[11px] text-red-500 mt-1">{errors.unitSize}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Unit Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={formData.unitCount}
                onChange={(e) => setFormData({ ...formData, unitCount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.unitCount && <p className="text-[11px] text-red-500 mt-1">{errors.unitCount}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Parking Spaces Allocated
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 10"
              value={formData.parking}
              onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
            />
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
              <span>{editData ? 'Update Commercial' : 'Add Commercial'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommercialModal;
