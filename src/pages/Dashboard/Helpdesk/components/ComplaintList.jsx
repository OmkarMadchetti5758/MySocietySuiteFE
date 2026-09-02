import React from 'react';
import { FaEye, FaUserEdit, FaCheckCircle, FaRedo } from 'react-icons/fa';
import dayjs from 'dayjs';

const getStatusBadge = (status) => {
  const styles = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700'
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
};

const getPriorityBadge = (priority) => {
  const styles = {
    low: 'text-gray-500 bg-gray-50',
    medium: 'text-blue-500 bg-blue-50',
    high: 'text-orange-500 bg-orange-50',
    urgent: 'text-red-500 bg-red-50'
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[priority] || 'border-gray-200'}`}>{priority.toUpperCase()}</span>;
};

const ComplaintList = ({ complaints, loading, isAdmin, onAction, onConfirmResolution }) => {
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading complaints...</div>;
  }

  if (complaints.length === 0) {
    return <div className="p-8 text-center text-gray-500">No complaints found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-sm font-medium border-b border-gray-100">
            <th className="p-4 py-3">Ticket ID</th>
            <th className="p-4 py-3">Flat / Wing</th>
            <th className="p-4 py-3">Category</th>
            <th className="p-4 py-3">Description</th>
            <th className="p-4 py-3">Status</th>
            <th className="p-4 py-3">Priority</th>
            <th className="p-4 py-3">Created At</th>
            {isAdmin && <th className="p-4 py-3">Assignee</th>}
            <th className="p-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-50">
          {complaints.map((c) => (
            <tr key={c._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => onAction('details', c)}>
              <td className="p-4 font-medium text-gray-800">{c.ticketId}</td>
              <td className="p-4">
                {c.flatId ? `${c.flatId.blockId?.name || ''} - ${c.flatId.flatNumber || ''}` : 'N/A'}
              </td>
              <td className="p-4">{c.category}</td>
              <td className="p-4 text-gray-500 truncate max-w-[200px]">{c.description}</td>
              <td className="p-4">{getStatusBadge(c.status)}</td>
              <td className="p-4">{getPriorityBadge(c.priority)}</td>
              <td className="p-4 text-gray-500">{dayjs(c.createdAt).format('DD MMM, h:mm A')}</td>
              
              {isAdmin && (
                <td className="p-4 text-gray-500">
                  {c.assignedStaffId ? c.assignedStaffId.name : c.assignedVendorId ? c.assignedVendorId.name : <span className="text-gray-400 italic">Unassigned</span>}
                </td>
              )}
              
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAction('details', c); }}
                    className="p-1.5 text-gray-400 hover:text-blue-500 bg-white hover:bg-blue-50 rounded shadow-sm border border-gray-100 transition-colors"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  
                  {isAdmin && c.status !== 'closed' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAction('assign', c); }}
                      className="p-1.5 text-gray-400 hover:text-purple-500 bg-white hover:bg-purple-50 rounded shadow-sm border border-gray-100 transition-colors"
                      title="Assign / Reassign"
                    >
                      <FaUserEdit />
                    </button>
                  )}

                  {!isAdmin && c.status === 'resolved' && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onConfirmResolution(c._id); }}
                        className="p-1.5 text-gray-400 hover:text-green-500 bg-white hover:bg-green-50 rounded shadow-sm border border-gray-100 transition-colors"
                        title="Confirm Resolution (Close Ticket)"
                      >
                        <FaCheckCircle />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAction('reopen', c); }}
                        className="p-1.5 text-gray-400 hover:text-orange-500 bg-white hover:bg-orange-50 rounded shadow-sm border border-gray-100 transition-colors"
                        title="Unsatisfied? Reopen Ticket"
                      >
                        <FaRedo />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintList;
