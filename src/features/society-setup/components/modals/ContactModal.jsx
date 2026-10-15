import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { CONTACT_CATEGORIES } from '../../constants/setupConstants';

const ContactModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    contactType: '',
    category: 'Essential',
    nameCompany: '',
    contactPerson: '',
    mobileNumber: '',
    emailId: '',
    roleDesignation: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        contactType: editData.contactType || '',
        category: editData.category || 'Essential',
        nameCompany: editData.nameCompany || '',
        contactPerson: editData.contactPerson || '',
        mobileNumber: editData.mobileNumber || '',
        emailId: editData.emailId || '',
        roleDesignation: editData.roleDesignation || '',
        status: editData.status || 'Active',
      });
    } else {
      setFormData({
        contactType: '',
        category: 'Essential',
        nameCompany: '',
        contactPerson: '',
        mobileNumber: '',
        emailId: '',
        roleDesignation: '',
        status: 'Active',
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.contactType.trim()) newErrors.contactType = 'Contact Type is required';
    if (!formData.nameCompany.trim()) newErrors.nameCompany = 'Name or Company name is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      contactType: formData.contactType.trim(),
      nameCompany: formData.nameCompany.trim(),
      contactPerson: formData.contactPerson.trim() || '—',
      emailId: formData.emailId.trim() || '—',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {editData ? 'Edit Contact' : 'Add New Contact'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Society Office, Electrician"
                value={formData.contactType}
                onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.contactType && <p className="text-[11px] text-red-500 mt-1">{errors.contactType}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              >
                {CONTACT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Name / Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Green Valley Society Office or TechServe Solutions"
              value={formData.nameCompany}
              onChange={(e) => setFormData({ ...formData, nameCompany: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
            />
            {errors.nameCompany && <p className="text-[11px] text-red-500 mt-1">{errors.nameCompany}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mr. Ramesh Sharma"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Role / Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Society Secretary, Doctor"
                value={formData.roleDesignation}
                onChange={(e) => setFormData({ ...formData, roleDesignation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mobile / Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.mobileNumber && <p className="text-[11px] text-red-500 mt-1">{errors.mobileNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. contact@domain.com"
                value={formData.emailId}
                onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
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
              <span>{editData ? 'Update Contact' : 'Save Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
