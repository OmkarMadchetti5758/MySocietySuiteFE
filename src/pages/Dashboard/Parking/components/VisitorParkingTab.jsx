import React, { useState } from 'react';
import { FaWalking, FaPlus, FaSearch, FaSignOutAlt, FaClock, FaCheckCircle, FaBuilding, FaUser } from 'react-icons/fa';

const formatWing = (wing) => {
  if (!wing) return 'N/A';
  const s = String(wing).trim();
  return s.toLowerCase().startsWith('wing') ? s : `Wing ${s}`;
};

const VisitorParkingTab = ({ visitors, loading, onCheckInVisitor, onCheckOutVisitor }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const filtered = visitors.filter((v) => {
    const reg = (v.vehicleRegNumber || v.vehicleRegistrationNumber || '').toLowerCase();
    const name = (v.visitorName || '').toLowerCase();
    const host = (v.hostResidentId?.name || '').toLowerCase();
    const matchSearch = reg.includes(search.toLowerCase()) || name.includes(search.toLowerCase()) || host.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaWalking className="text-orange-500" /> Visitor Parking
          </h2>
          <p className="text-xs text-gray-500">Track and issue visitor parking pass entries</p>
        </div>
        <button
          onClick={onCheckInVisitor}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm shrink-0"
        >
          <FaPlus /> Visitor Check-In
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search visitor name, reg number, host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="active">Currently Parked (Active)</option>
            <option value="completed">Checked Out</option>
            <option value="ALL">All Entries</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <FaWalking className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Visitor Parkings</h3>
          <p className="text-xs text-gray-400 mt-1">Issue a visitor parking pass on entry.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Visitor & Phone</th>
                  <th className="p-4">Vehicle Reg</th>
                  <th className="p-4">Assigned Slot</th>
                  <th className="p-4">Host Resident / Flat</th>
                  <th className="p-4">Check-In Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-gray-900">{v.visitorName}</p>
                        <p className="text-[11px] text-gray-500">{v.visitorMobile || v.visitorPhone || 'No Phone'}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-800">{v.vehicleRegNumber || v.vehicleRegistrationNumber}</td>
                    <td className="p-4">
                      <span className="bg-purple-50 text-purple-700 font-mono font-bold px-2.5 py-1 rounded-lg">
                        {v.parkingSlotId?.slotNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-800 flex items-center gap-1 font-semibold">
                          <FaUser className="text-gray-400 text-xs" /> {v.hostResidentId?.name || 'N/A'}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                          <FaBuilding className="text-gray-400 text-[10px]" /> {formatWing(v.hostFlatId?.wing || v.flatId?.wing)} - Flat {v.hostFlatId?.flatNumber || v.flatId?.flatNumber || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-gray-400 text-xs" />
                        <span>{new Date(v.entryTime || v.checkInTime || v.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {v.status === 'active' ? (
                        <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <FaClock className="text-[9px]" /> Parked
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <FaCheckCircle className="text-[9px]" /> Checked Out
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {v.status === 'active' && (
                        <button
                          onClick={() => onCheckOutVisitor(v._id)}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold rounded-lg transition-colors flex items-center gap-1 ml-auto text-xs"
                        >
                          <FaSignOutAlt className="text-xs" /> Check-Out
                        </button>
                      )}
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

export default VisitorParkingTab;
