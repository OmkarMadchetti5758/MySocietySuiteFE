import React, { useState } from 'react';
import { MoreVertical, Plus } from 'lucide-react';
import AddStaffModal from './AddStaffModal';

const StaffDirectoryTab = ({ staffData, refresh, loading }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All roles');

  const filteredData = roleFilter === 'All roles' 
    ? staffData 
    : staffData.filter(s => s.designation.toLowerCase().replace('_', ' ') === roleFilter.toLowerCase());

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-base font-semibold text-gray-900">All staff</h2>
          <p className="text-xs text-gray-500 mt-1">{staffData.length} members across all roles</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option>All roles</option>
            <option>Housekeeping</option>
            <option>Security guard</option>
            <option>Gardener</option>
            <option>Electrician</option>
            <option>Plumber</option>
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add staff
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Staff</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Role</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Shift</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Gate / area</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Contact</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
              <th className="px-5 py-3 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No staff found.</td></tr>
            ) : (
              filteredData.map(staff => (
                <tr key={staff._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(staff.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{staff.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{staff.designation?.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 capitalize">{staff.designation?.replace('_', ' ')}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{staff.shift}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">
                      {staff.gateOrArea || 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{staff.phone}</td>
                  <td className="px-5 py-4">
                    {staff.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                      </span>
                    ) : staff.status === 'invited' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddStaffModal 
          onClose={() => setShowAddModal(false)} 
          onAdded={() => {
            refresh();
          }} 
        />
      )}
    </div>
  );
};

export default StaffDirectoryTab;
