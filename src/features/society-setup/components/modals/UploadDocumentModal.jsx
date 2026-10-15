import React, { useState } from 'react';
import { FiX, FiUploadCloud, FiCheck, FiFileText } from 'react-icons/fi';
import { DOCUMENT_CATEGORIES } from '../../constants/setupConstants';
import { formatDisplayDate } from '../../utils/calculations';

const UploadDocumentModal = ({ isOpen, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    documentName: '',
    category: 'Legal',
    isMandatory: true,
    expiryDate: '',
    fileName: '',
    fileSize: '2.4 MB',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setFormData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: sizeMB,
        documentName: prev.documentName || file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.documentName.trim()) newErrors.documentName = 'Document name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpload({
      documentName: formData.documentName.trim(),
      category: formData.category,
      isMandatory: formData.isMandatory,
      expiryDate: formData.expiryDate ? formatDisplayDate(formData.expiryDate) : null,
      fileSize: formData.fileSize || '2.5 MB',
      fileType: 'pdf',
      status: 'Verified',
      uploadedBy: 'Super Admin',
      uploadDate: formatDisplayDate(new Date().toISOString()),
    });

    setFormData({
      documentName: '',
      category: 'Legal',
      isMandatory: true,
      expiryDate: '',
      fileName: '',
      fileSize: '2.4 MB',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Upload New Document</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-orange-200 bg-orange-50/20 hover:bg-orange-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center mb-3">
                <FiUploadCloud className="text-2xl" />
              </div>
              {formData.fileName ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                  <FiFileText className="text-[#EA580C]" />
                  <span>{formData.fileName}</span>
                  <span className="text-gray-400">({formData.fileSize})</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-gray-800">
                    Click to select file or drag & drop here
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Max file size: 25 MB | PDF, JPG, PNG
                  </p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Document Name / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Registration Certificate or Fire NOC"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
            />
            {errors.documentName && <p className="text-[11px] text-red-500 mt-1">{errors.documentName}</p>}
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
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Expiry Date (if applicable)
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-gray-800">Mandatory Document?</span>
              <span className="text-[10px] text-gray-500">Required for official society compliance</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMandatory}
                onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#EA580C]"></div>
            </label>
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
              <span>Upload Document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
