import React, { useState } from 'react';
import { amenityService } from '../../../services/amenityBookingService';
import { FaTimes, FaImage, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AmenityModal = ({ amenity, onClose }) => {
  const isEdit = Boolean(amenity);

  const [form, setForm] = useState({
    name:                 amenity?.name                 ?? '',
    description:          amenity?.description           ?? '',
    capacity:             amenity?.capacity              ?? '',
    status:               amenity?.status                ?? 'ACTIVE',
    requiresApproval:     amenity?.requiresApproval      ?? false,
    advanceBookingLimit:  amenity?.advanceBookingLimit   ?? 30,
    maxBookingDuration:   amenity?.maxBookingDuration    ?? 180,
    cancellationWindow:   amenity?.cancellationWindow    ?? 24,
    bookingFee:           amenity?.bookingFee            ?? 0,
  });
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(amenity?.images || []);

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImageFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5)); // Limit to 5 images
    }
  };

  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors(prev => ({ ...prev, [name]: null }));
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                         errs.name = 'Name is required';
    if (form.capacity !== '' && Number(form.capacity) <= 0) errs.capacity = 'Capacity must be > 0';
    if (Number(form.advanceBookingLimit) < 0)      errs.advanceBookingLimit = 'Must be ≥ 0';
    if (Number(form.maxBookingDuration) < 1)        errs.maxBookingDuration = 'Must be ≥ 1 min';
    if (Number(form.cancellationWindow) < 0)        errs.cancellationWindow = 'Must be ≥ 0';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        capacity: form.capacity !== '' ? Number(form.capacity) : undefined,
        advanceBookingLimit: Number(form.advanceBookingLimit),
        maxBookingDuration:  Number(form.maxBookingDuration),
        cancellationWindow:  Number(form.cancellationWindow),
        bookingFee:          Number(form.bookingFee),
      };

      let finalPayload = payload;

      if (imageFiles.length > 0 || (isEdit && existingImages.length !== (amenity?.images || []).length)) {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
          if (payload[key] !== undefined) formData.append(key, payload[key]);
        });
        imageFiles.forEach(file => formData.append('images', file));
        if (isEdit) {
          formData.append('existingImages', JSON.stringify(existingImages));
        }
        finalPayload = formData;
      } else if (isEdit) {
        payload.existingImages = JSON.stringify(existingImages);
      }

      if (isEdit) {
        await amenityService.updateAmenity(amenity._id, finalPayload);
        toast.success('Amenity updated');
      } else {
        await amenityService.createAmenity(finalPayload);
        toast.success('Amenity created');
      }
      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save amenity');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, type = 'text', extra = {}) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        {...extra}
        className={`w-full p-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
          errors[name] ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? 'Edit Amenity' : 'Add New Amenity'}</h2>
          <button onClick={() => onClose()} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4 custom-scrollbar">
          {field('Name *', 'name')}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Capacity', 'capacity', 'number', { min: 1, placeholder: 'e.g. 50' })}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {field('Advance Booking Limit (days)', 'advanceBookingLimit', 'number', { min: 0 })}
            {field('Max Duration (mins)', 'maxBookingDuration', 'number', { min: 1 })}
            {field('Cancellation Window (hrs)', 'cancellationWindow', 'number', { min: 0 })}
          </div>

          {field('Booking Fee (₹)', 'bookingFee', 'number', { min: 0, step: '0.01' })}

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="requiresApproval"
              checked={form.requiresApproval}
              onChange={handleChange}
              className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">Requires Admin Approval</p>
              <p className="text-xs text-gray-400">Bookings will be PENDING until approved by admin</p>
            </div>
          </label>

          {/* Image Upload Section */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-600 mb-2">Images (Max 5)</label>
            
            {/* Previews */}
            {(existingImages.length > 0 || imageFiles.length > 0) && (
              <div className="flex flex-wrap gap-3 mb-3">
                {existingImages.map((url, idx) => (
                  <div key={`exist-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="Amenity" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-50 text-red-500 rounded-full transition-colors backdrop-blur-sm shadow-sm">
                      <FaTrash className="text-[10px]" />
                    </button>
                  </div>
                ))}
                {imageFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-orange-200">
                    <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImageFile(idx)} className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-50 text-red-500 rounded-full transition-colors backdrop-blur-sm shadow-sm">
                      <FaTrash className="text-[10px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {(existingImages.length + imageFiles.length) < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer group">
                <FaImage className="text-xl text-gray-300 group-hover:text-orange-400 mb-2 transition-colors" />
                <span className="text-xs text-gray-500 group-hover:text-orange-600 font-medium transition-colors">Click to upload images</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={() => onClose()} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            id="btn-save-amenity"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Amenity'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmenityModal;
