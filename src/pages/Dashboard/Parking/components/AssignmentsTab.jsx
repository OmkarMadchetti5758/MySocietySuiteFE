import React, { useState } from 'react';
import { FaUserCheck, FaPlus, FaSearch, FaTimesCircle, FaBuilding, FaCar, FaCalendarAlt } from 'react-icons/fa';

const formatWing = (wing) => {
  if (!wing) return 'N/A';
  const s = String(wing).trim();
  return s.toLowerCase().startsWith('wing') ? s : `Wing ${s}`;
};

const AssignmentsTab = ({ assignments, loading, onAssignSlot, onUnassignSlot }) => {
  const [search, setSearch] = useState('');

  const filtered = assignments.filter((a) => {
    const slot = (a.parkingSlotId?.slotNumber || '').toLowerCase();
    const resident = (a.userId?.name || a.residentId?.name || '').toLowerCase();
    const vehicle = (a.vehicleId?.regNumber || a.vehicleId?.registrationNumber || '').toLowerCase();
    const flat = (a.flatId?.flatNumber || '').toLowerCase();
    return slot.includes(search.toLowerCase()) || resident.includes(search.toLowerCase()) || vehicle.includes(search.toLowerCase()) || flat.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaUserCheck className="text-orange-500" /> Slot Assignments
          </h2>
          <p className="text-xs text-gray-500">Allocate and manage resident parking slot assignments</p>
        </div>
        <button
          onClick={onAssignSlot}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm shrink-0"
        >
          <FaPlus /> Allocate Slot
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search by slot, resident, flat, vehicle reg..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <FaUserCheck className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Active Slot Assignments</h3>
          <p className="text-xs text-gray-400 mt-1">Allocate a parking slot to a resident vehicle.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Slot Number</th>
                  <th className="p-4">Resident</th>
                  <th className="p-4">Flat / Wing</th>
                  <th className="p-4">Assigned Vehicle</th>
                  <th className="p-4">Assigned On</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-black text-gray-900 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg">
                        {a.parkingSlotId?.slotNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">{a.userId?.name || a.residentId?.name || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaBuilding className="text-gray-400 text-xs" />
                        <span>{formatWing(a.parkingSlotId?.wing || a.flatId?.wing)} - {a.flatId?.flatNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-mono">
                        <FaCar className="text-gray-400 text-xs" />
                        <span>{a.vehicleId?.regNumber || a.vehicleId?.registrationNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        <span>{a.assignedDate || a.createdAt ? new Date(a.assignedDate || a.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        a.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        a.status === 'released' ? 'bg-gray-100 text-gray-600' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {a.status === 'active' ? 'Active' : a.status === 'released' ? 'Released' : a.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onUnassignSlot(a._id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg transition-colors flex items-center gap-1 ml-auto text-xs"
                      >
                        <FaTimesCircle className="text-xs" /> Unassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;
