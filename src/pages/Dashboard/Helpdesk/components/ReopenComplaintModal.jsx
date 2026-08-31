import React, { useState } from 'react';
import { FaTimes, FaRedo } from 'react-icons/fa';
import complaintApi from '../../../../services/complaintApi';
import { toast } from 'react-toastify';

const ReopenComplaintModal = ({ complaint, onClose }) => {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      toast.error("Please provide a reason for reopening the ticket");
      return;
    }

    setIsSubmitting(true);
    try {
      await complaintApi.reopenComplaint(complaint._id, {
        reopeningRemarks: remarks
      });
      toast.success("Ticket reopened successfully");
      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reopen ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-orange-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <FaRedo />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Reopen Ticket</h2>
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
          <form id="reopen-complaint-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100 mb-2">
              You are about to reopen a resolved ticket. Please provide details on why the resolution was not satisfactory. A new SLA cycle will begin.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Reopening <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="E.g., The issue reoccurred, or the fix was incomplete..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors resize-none"
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
            form="reopen-complaint-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Reopening...' : 'Confirm Reopen'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReopenComplaintModal;
