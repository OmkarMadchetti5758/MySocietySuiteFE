import React, { useState } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import complaintApi from '../../../../services/complaintApi';
import { toast } from 'react-toastify';

const ResolveComplaintModal = ({ complaint, onClose }) => {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      toast.error("Please provide resolution remarks");
      return;
    }

    setIsSubmitting(true);
    try {
      // Assuming Admin is resolving directly here. 
      // Vendor/Staff will use the VendorPortal version of this.
      await complaintApi.updateComplaintStatus(complaint._id, {
        status: 'resolved',
        resolutionRemarks: remarks
      });
      toast.success("Ticket marked as resolved");
      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resolve ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-green-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <FaCheckCircle />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Resolve Ticket</h2>
              <p className="text-sm text-gray-500 mt-0.5">{complaint.ticketId}</p>
            </div>
          </div>
          <button 
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form id="resolve-complaint-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100 mb-2">
              Marking this ticket as resolved will notify the resident. The ticket will remain in "Resolved" state until the resident confirms closure or reopens it.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Remarks <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Describe what was done to resolve the issue..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors resize-none"
              />
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
            form="resolve-complaint-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Resolving...' : 'Submit Resolution'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResolveComplaintModal;
