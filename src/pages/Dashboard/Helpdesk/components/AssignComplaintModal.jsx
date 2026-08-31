import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserTie, FaStore } from 'react-icons/fa';
import complaintApi from '../../../../services/complaintApi';
import api from '../../../../services/apiClient'; // for fetching staff/vendors
import { toast } from 'react-toastify';

const AssignComplaintModal = ({ complaint, onClose }) => {
  const [assigneeType, setAssigneeType] = useState('internal_staff'); // 'internal_staff' | 'vendor'
  const [assigneeId, setAssigneeId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [staffList, setStaffList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [loadingAssignees, setLoadingAssignees] = useState(true);

  useEffect(() => {
    fetchAssignees();
  }, []);

  const fetchAssignees = async () => {
    try {
      setLoadingAssignees(true);
      const [staffRes, vendorRes] = await Promise.all([
        api.get('/staff'),
        api.get('/vendors')
      ]);
      // Only show active assignees
      setStaffList(staffRes.data.data.filter(s => s.status === 'active' || s.isActive));
      setVendorList(vendorRes.data.data.filter(v => v.status === 'ACTIVE'));
    } catch (error) {
      toast.error('Failed to load assignees');
    } finally {
      setLoadingAssignees(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assigneeId) {
      toast.error("Please select an assignee");
      return;
    }

    setIsSubmitting(true);
    try {
      await complaintApi.assignComplaint(complaint._id, {
        assignedToType: assigneeType,
        assigneeId,
        remarks
      });
      toast.success("Complaint assigned successfully");
      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReassignment = !!complaint.assignedStaffId || !!complaint.assignedVendorId;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{isReassignment ? 'Reassign' : 'Assign'} Ticket</h2>
            <p className="text-sm text-gray-500 mt-1">{complaint.ticketId} - {complaint.category}</p>
          </div>
          <button 
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="assign-complaint-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Assignee Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign to <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setAssigneeType('internal_staff'); setAssigneeId(''); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    assigneeType === 'internal_staff' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <FaUserTie className="text-2xl mb-2" />
                  <span className="font-medium text-sm">Internal Staff</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAssigneeType('vendor'); setAssigneeId(''); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    assigneeType === 'vendor' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <FaStore className="text-2xl mb-2" />
                  <span className="font-medium text-sm">Vendor</span>
                </button>
              </div>
            </div>

            {/* Assignee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select {assigneeType === 'internal_staff' ? 'Staff Member' : 'Vendor'} <span className="text-red-500">*</span>
              </label>
              
              {loadingAssignees ? (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center animate-pulse">Loading...</div>
              ) : (
                <select
                  required
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="" disabled>Choose {assigneeType === 'internal_staff' ? 'staff' : 'vendor'}</option>
                  
                  {assigneeType === 'internal_staff' && staffList.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                  ))}
                  
                  {assigneeType === 'vendor' && vendorList.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.serviceCategory})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Remarks (Optional)</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="E.g., Please fix this before evening."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
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
            form="assign-complaint-form"
            disabled={isSubmitting || loadingAssignees}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Assigning...' : (isReassignment ? 'Reassign' : 'Assign')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssignComplaintModal;
