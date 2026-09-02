import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSpinner, FaExchangeAlt, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import vendorApi from '../../../services/vendorApi';

const VendorTasksAdminTab = ({ vendors }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await vendorApi.getAllTasks();
      if (res.data?.status === 'success') {
        setTasks(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenAssignModal = (task) => {
    setSelectedTask(task);
    setSelectedVendorId(task.assignedVendorId?._id || '');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVendorId) return;

    try {
      setAssigning(true);
      const isReassign = !!selectedTask.assignedVendorId;
      if (isReassign) {
        await vendorApi.reassignTask(selectedTask._id, selectedVendorId);
      } else {
        await vendorApi.assignTask(selectedTask._id, selectedVendorId);
      }
      setShowAssignModal(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign vendor.');
    } finally {
      setAssigning(false);
    }
  };

  const activeVendors = vendors.filter(v => v.status === 'ACTIVE');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800">Task Assignments</h2>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="text-3xl text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-4">
              <FaExclamationCircle className="text-xl" />
            </div>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button onClick={fetchTasks} className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100">
              Try Again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <FaCheck className="text-2xl text-green-500" />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">No tasks found</h3>
            <p className="text-gray-500 text-sm">There are no open complaints or tasks currently.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Task / Complaint</th>
                  <th className="px-4 py-3 font-medium">Category & Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Assigned Vendor</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map(task => (
                  <tr key={task._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]" title={task.description}>
                        {task.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        {task.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                            {task.category}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                          task.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {task.priority || 'LOW'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                        task.status === 'OPEN' ? 'bg-blue-50 text-blue-600' :
                        task.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-600' :
                        task.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {task.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.assignedVendorId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <FaUserCircle />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-900">{task.assignedVendorId.name}</span>
                            <span className="text-[10px] text-gray-500">{task.assignedVendorId.serviceCategory}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {task.status !== 'CLOSED' && task.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleOpenAssignModal(task)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          {task.assignedVendorId ? <><FaExchangeAlt /> Reassign</> : 'Assign Vendor'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Vendor Modal */}
      {showAssignModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedTask.assignedVendorId ? 'Reassign Task' : 'Assign Task'}
              </h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Select a vendor for <span className="font-semibold text-gray-900">{selectedTask.title}</span>.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Vendors</label>
                <select
                  required
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="" disabled>-- Select Vendor --</option>
                  {activeVendors.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.serviceCategory})
                    </option>
                  ))}
                </select>
                {activeVendors.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No active vendors available.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || activeVendors.length === 0 || !selectedVendorId}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {assigning ? <FaSpinner className="animate-spin" /> : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorTasksAdminTab;
