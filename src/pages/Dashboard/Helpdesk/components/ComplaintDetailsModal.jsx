import React, { useState, useEffect } from 'react';
import { FaTimes, FaHistory, FaImage, FaUser, FaBuilding, FaUserEdit, FaCheckCircle } from 'react-icons/fa';
import complaintApi from '../../../../services/complaintApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const ComplaintDetailsModal = ({ complaintId, onClose }) => {
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'history'

  useEffect(() => {
    fetchData();
  }, [complaintId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, histRes] = await Promise.all([
        complaintApi.getComplaintById(complaintId),
        complaintApi.getComplaintHistory(complaintId).catch(() => ({ data: { data: [] } })) // History might fail for residents depending on RBAC, so catch it
      ]);
      setComplaint(compRes.data.data);
      setHistory(histRes.data.data);
    } catch (error) {
      toast.error('Failed to load complaint details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const styles = {
      open: 'text-blue-600 bg-blue-50 border-blue-200',
      in_progress: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      resolved: 'text-green-600 bg-green-50 border-green-200',
      closed: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return styles[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading || !complaint) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl flex items-center justify-center min-w-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-800">{complaint.ticketId}</h2>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(complaint.status)}`}>
                {complaint.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full border border-gray-200 bg-gray-50 text-gray-600">
                {complaint.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500">{complaint.category}</p>
          </div>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Details
          </button>
          {history.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaHistory /> Audit Trail
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'details' ? (
            <div className="space-y-6">

              {/* Live Tracking Status Stepper */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-6">Live Tracking Status</h3>

                {(() => {
                  const getStepStatus = () => {
                    const status = complaint.status;
                    const isAssigned = !!complaint.assignedStaffId || !!complaint.assignedVendorId;

                    if (status === 'closed') return 5;
                    if (status === 'resolved') return 4;
                    if (status === 'in_progress') return 3;
                    if (status === 'open' && isAssigned) return 2;
                    return 1; // open, unassigned
                  };

                  const currentStep = getStepStatus();
                  const steps = [
                    { label: 'Raised', icon: <FaUser /> },
                    { label: 'Assigned', icon: <FaUserEdit /> },
                    { label: 'In Progress', icon: <FaHistory /> },
                    { label: 'Resolved', icon: <FaCheckCircle /> },
                    { label: 'Closed', icon: <FaCheckCircle /> }
                  ];

                  return (
                    <div className="flex items-center w-full relative">
                      <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full" />
                      <div
                        className="absolute left-0 top-5 -translate-y-1/2 h-1 bg-blue-500 z-0 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                      />

                      <div className="w-full flex justify-between relative z-10">
                        {steps.map((step, index) => {
                          const isCompleted = index + 1 <= currentStep;
                          const isCurrent = index + 1 === currentStep;

                          return (
                            <div key={index} className="flex flex-col items-center gap-2">
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted
                                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                                  : 'bg-white border-2 border-gray-300 text-gray-400'
                                  } ${isCurrent ? 'ring-4 ring-blue-500/20' : ''}`}
                              >
                                <span className="text-sm sm:text-base">{step.icon}</span>
                              </div>
                              <span className={`text-[10px] sm:text-xs font-medium ${isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm whitespace-pre-wrap">
                  {complaint.description}
                </div>
              </div>

              {/* Attachments */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaImage className="text-gray-400" /> Attached Photos
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {complaint.attachments.map((url, idx) => (
                      <a key={idx} href={`http://localhost:5000${url}`} target="_blank" rel="noopener noreferrer" className="shrink-0 block rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors">
                        <img src={`http://localhost:5000${url}`} alt={`Attachment ${idx + 1}`} className="h-24 w-24 object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Raised By */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">Raised By</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <FaUser />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{complaint.raisedBy?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <FaBuilding className="text-gray-400" />
                        {complaint.flatId ? `${complaint.flatId.blockId?.name || ''} - ${complaint.flatId.flatNumber || ''}` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{dayjs(complaint.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned To */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-3">Assigned To</h3>
                  {complaint.assignedStaffId || complaint.assignedVendorId ? (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                        {complaint.assignedStaffId ? <FaUser /> : <FaBuilding />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {complaint.assignedStaffId ? complaint.assignedStaffId.name : complaint.assignedVendorId.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {complaint.assignedStaffId ? `Staff (${complaint.assignedStaffId.role})` : `Vendor (${complaint.assignedVendorId.serviceCategory})`}
                        </p>
                        {complaint.assignedAt && (
                          <p className="text-xs text-gray-400 mt-1">Assigned: {dayjs(complaint.assignedAt).format('DD MMM, hh:mm A')}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic py-2">Not assigned yet</div>
                  )}
                </div>
              </div>

              {/* Resolution Remarks */}
              {complaint.resolutionRemarks && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Resolution Remarks</h3>
                  <div className="bg-green-50 p-4 rounded-xl text-green-800 text-sm border border-green-100">
                    <p className="whitespace-pre-wrap">{complaint.resolutionRemarks}</p>
                    {complaint.resolvedBy && (
                      <p className="text-xs text-green-600 mt-2 pt-2 border-t border-green-200/50">
                        Resolved by: {complaint.resolvedBy.name || complaint.resolvedBy} on {dayjs(complaint.resolvedAt).format('DD MMM YYYY, hh:mm A')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Reopening Remarks */}
              {complaint.reopeningRemarks && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Reopening Details</h3>
                  <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm border border-orange-100">
                    <p className="whitespace-pre-wrap">{complaint.reopeningRemarks}</p>
                    <p className="text-xs text-orange-600 mt-2 pt-2 border-t border-orange-200/50">
                      Reopened on {dayjs(complaint.reopenedAt).format('DD MMM YYYY, hh:mm A')}
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {history.map((event, index) => (
                <div key={event._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <FaHistory className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-800 text-sm">{event.action.replace(/_/g, ' ')}</span>
                      <time className="text-xs font-medium text-gray-400">{dayjs(event.createdAt).format('DD MMM, HH:mm')}</time>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      by <span className="font-medium">{event.performedBy?.name || 'System'}</span> ({event.performedByRole})
                    </div>
                    {event.remarks && (
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                        "{event.remarks}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetailsModal;
