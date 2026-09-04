import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaImage, FaUpload } from 'react-icons/fa';
import { festivalApi } from '../../../services/festivalApi';

const FestivalModal = ({ festivalToEdit, onClose, onSuccess }) => {
  const isEditing = !!festivalToEdit;

  const [formData, setFormData] = useState({
    title: festivalToEdit?.title || '',
    description: festivalToEdit?.description || '',
    date: festivalToEdit?.date ? new Date(festivalToEdit.date).toISOString().split('T')[0] : '',
    startTime: festivalToEdit?.startTime || '',
    endTime: festivalToEdit?.endTime || '',
    venue: festivalToEdit?.venue || '',
    image: festivalToEdit?.image || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required.';
    else if (formData.title.trim().length < 3) errs.title = 'Title must be at least 3 characters.';
    else if (formData.title.trim().length > 100) errs.title = 'Title cannot exceed 100 characters.';

    if (!formData.date) errs.date = 'Date is required.';
    else {
      const selected = new Date(formData.date);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (!isEditing && selected < today) errs.date = 'Event date cannot be in the past.';
    }

    if (!formData.startTime) errs.startTime = 'Start time is required.';
    if (!formData.endTime)   errs.endTime = 'End time is required.';

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errs.endTime = 'End time must be after start time.';
    }

    if (!formData.venue.trim()) errs.venue = 'Venue is required.';

    if (formData.description && formData.description.length > 2000) {
      errs.description = 'Description cannot exceed 2000 characters.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        venue: formData.venue.trim(),
        image: formData.image?.trim() || undefined,
      };

      if (isEditing) {
        await festivalApi.updateFestival(festivalToEdit._id, payload);
      } else {
        await festivalApi.createFestival(payload);
      }
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors)) {
        const mapped = {};
        apiErrors.forEach(e => { const key = Object.keys(e)[0]; mapped[key] = e[key]; });
        setErrors(mapped);
      } else {
        setErrors({ _form: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD for min attribute
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <FaCalendarAlt className="text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 hover:bg-gray-100 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="festivalForm" onSubmit={handleSubmit} className="flex flex-col gap-4">

            {errors._form && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {errors._form}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Diwali Celebration 2026"
                maxLength={100}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  errors.title ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the event for your residents..."
                maxLength={2000}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${
                  errors.description ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.description
                  ? <p className="text-xs text-red-500">{errors.description}</p>
                  : <span />}
                <span className="text-xs text-gray-400">{formData.description.length}/2000</span>
              </div>
            </div>

            {/* Date & Venue Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <FaCalendarAlt className="inline mr-1 text-orange-400" />
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={!isEditing ? todayStr : undefined}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    errors.date ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <FaMapMarkerAlt className="inline mr-1 text-orange-400" />
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., Community Hall"
                  maxLength={200}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    errors.venue ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {errors.venue && <p className="mt-1 text-xs text-red-500">{errors.venue}</p>}
              </div>
            </div>

            {/* Start & End Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <FaClock className="inline mr-1 text-orange-400" />
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    errors.startTime ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <FaClock className="inline mr-1 text-orange-400" />
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    errors.endTime ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <FaImage className="inline mr-1 text-orange-400" />
                Banner Image <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                <FaUpload className="text-2xl mb-2 text-gray-400" />
                <span className="text-sm">Click to select image file</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFormData({ ...formData, image: URL.createObjectURL(e.target.files[0]) });
                    }
                  }}
                />
              </label>
              {formData.image && (
                <div className="mt-3 rounded-xl overflow-hidden h-32 bg-gray-50 border border-gray-100 relative">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, image: '' });
                    }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="festivalForm"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Create Event'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FestivalModal;
