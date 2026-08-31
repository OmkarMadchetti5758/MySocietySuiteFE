import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import complaintApi from '../../../../services/complaintApi';
import { toast } from 'react-toastify';

const CreateComplaintModal = ({ categories, onClose }) => {
  const [formData, setFormData] = useState({
    category: '',
    priority: 'medium',
    description: '',
    attachments: [] // Files
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flatNumber, setFlatNumber] = useState('');

  useEffect(() => {
    const fetchResidentInfo = async () => {
      try {
        const res = await complaintApi.getResidentInfo();
        setFlatNumber(res.data.data?.flatNumber || '');
      } catch (error) {
        console.error("Failed to fetch resident info", error);
      }
    };
    fetchResidentInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description) {
      toast.error("Category and description are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('description', formData.description);
      
      formData.attachments.forEach(file => {
        data.append('attachments', file);
      });

      await complaintApi.createComplaint(data);
      toast.success("Complaint raised successfully");
      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to raise complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Raise Ticket</h2>
          <button 
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="create-complaint-form" onSubmit={handleSubmit} className="space-y-5">
            
            {flatNumber && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-1">Your Flat</label>
                <input
                  type="text"
                  value={flatNumber}
                  disabled
                  className="w-full px-3 py-1.5 bg-gray-100 border-none rounded text-gray-700 text-sm cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Optional, max 3)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors bg-gray-50">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1 shadow-sm border border-gray-200">
                      <span>Upload files</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files).slice(0, 3);
                          setFormData({...formData, attachments: files});
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {formData.attachments.length} file(s) selected
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={() => onClose()}
            className="px-5 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-complaint-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Raising...' : 'Raise Ticket'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateComplaintModal;
