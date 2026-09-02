import React, { useState, useEffect, useCallback } from 'react';
import complaintApi from '../../services/complaintApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const VendorTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Update state
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintApi.getVendorAssignedComplaints();
      setTasks(res.data.data.complaints);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      toast.error("Failed to load assigned tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    if (updateStatus === 'resolved' && !resolutionRemarks.trim()) {
      toast.error("Please provide resolution remarks");
      return;
    }

    try {
      setIsUpdating(true);
      await complaintApi.vendorUpdateStatus(selectedTask._id, {
        status: updateStatus,
        resolutionRemarks: updateStatus === 'resolved' ? resolutionRemarks : undefined
      });
      toast.success("Task status updated");
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    // Default to the most logical next status, never the current one
    // open → in_progress, in_progress → resolved
    const nextStatus = task.status === 'open' ? 'in_progress' : 'resolved';
    setUpdateStatus(nextStatus);
    setResolutionRemarks('');
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">My Assigned Tasks</h1>
        <p className="text-gray-500 mt-1">View and update complaints/work orders assigned to you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-gray-500 animate-pulse col-span-full">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-gray-500 bg-white p-8 text-center rounded-2xl border border-gray-100 col-span-full shadow-sm">
            No active tasks assigned to you right now.
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{task.ticketId}</span>
                  <span className="text-xs text-gray-400">{dayjs(task.assignedAt).format('MMM D, YYYY')}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                  task.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                  task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 
                  task.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{task.category}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  task.priority === 'high' || task.priority === 'urgent' ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600'
                }`}>{task.priority.toUpperCase()}</span>
              </div>

              <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl flex-1">
                {task.description}
              </div>
              
              <div className="text-xs text-gray-500 mb-4 flex justify-between">
                <span><strong>Raised By:</strong> {task.raisedBy?.name || 'Resident'}</span>
              </div>
              
              <button 
                onClick={() => openTaskModal(task)}
                disabled={task.status === 'closed'}
                className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {task.status === 'closed' ? 'Closed' : 'Update Status'}
              </button>
            </div>
          ))
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Update Task Status</h3>
                <p className="text-sm text-gray-500">{selectedTask.ticketId} - {selectedTask.category}</p>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleUpdate} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select 
                    value={updateStatus} 
                    onChange={e => setUpdateStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  >
                    {selectedTask.status === 'open' && <option value="in_progress">Mark as In Progress</option>}
                    <option value="resolved">Mark as Resolved</option>
                  </select>
                </div>

                {updateStatus === 'resolved' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Remarks <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      value={resolutionRemarks}
                      onChange={e => setResolutionRemarks(e.target.value)}
                      placeholder="What was done to resolve this issue?"
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[100px] resize-none"
                    />
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setSelectedTask(null)}
                    className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorTasksPage;
