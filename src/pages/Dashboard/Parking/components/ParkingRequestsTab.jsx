import React, { useState } from 'react';
import { FaClock, FaPlus, FaCheck, FaTimes, FaSearch, FaUser, FaBuilding, FaCar, FaListAlt } from 'react-icons/fa';

const formatWing = (wing) => {
  if (!wing) return 'N/A';
  const s = String(wing).trim();
  return s.toLowerCase().startsWith('wing') ? s : `Wing ${s}`;
};

const formatLabel = (str) =>
  (str || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

const REQUEST_STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const ParkingRequestsTab = ({ requests, loading, onCreateRequest, onApproveRequest, onRejectRequest, isResident }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = requests.filter((r) => {
    const res = (r.residentId?.name || r.userId?.name || '').toLowerCase();
    const flat = (r.flatId?.flatNumber || '').toLowerCase();
    const type = (r.requestType || 'NEW_SLOT').toLowerCase();
    const slot = (r.requestedSlotType || r.preferredSlotType || r.preferredType || '').toLowerCase();
    const reason = (r.notes || r.reason || '').toLowerCase();
    const searchLower = search.toLowerCase();
    const matchSearch = res.includes(searchLower) ||
      flat.includes(searchLower) ||
      type.includes(searchLower) ||
      slot.includes(searchLower) ||
      reason.includes(searchLower);
    const matchStatus = statusFilter === 'ALL' || String(r.status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  /* ── Resident View ── */
  if (isResident) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaClock className="text-orange-500" /> My Parking Requests
            </h2>
            <p className="text-xs text-gray-500">Submit a request for a new parking slot or an upgrade</p>
          </div>
          <button
            onClick={onCreateRequest}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0 cursor-pointer"
          >
            <FaPlus /> Submit Request
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search request type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
            <FaClock className="text-4xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No Requests Yet</h3>
            <p className="text-xs text-gray-400 mt-1">Submit a parking request to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((req) => {
              const statusKey = String(req.status || 'pending').toLowerCase();
              const reqType = req.requestType || 'NEW_SLOT';
              const slotType = req.requestedSlotType || req.preferredSlotType || req.preferredType || 'FOUR_WHEELER';
              const reasonText = req.notes || req.reason;
              const adminNoteText = req.rejectionReason || req.reviewNotes;

              return (
                <div key={req._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                        {formatLabel(reqType)}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${REQUEST_STATUS_STYLES[statusKey] || REQUEST_STATUS_STYLES.pending}`}>
                        {formatLabel(req.status || 'pending')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <FaCar className="text-orange-500 shrink-0" />
                        <span className="text-gray-400">Preferred:</span>
                        <span className="font-bold text-gray-800">
                          {formatLabel(slotType)}
                        </span>
                      </div>

                      {req.flatId?.flatNumber && (
                        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                          <FaBuilding className="text-orange-500 shrink-0" />
                          <span className="text-gray-400">Unit:</span>
                          <span className="font-bold text-gray-800">
                            Flat {req.flatId.flatNumber} {req.flatId?.wing ? `(${formatWing(req.flatId.wing)})` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {reasonText && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Reason / Justification</span>
                        <p className="italic text-gray-700">"{reasonText}"</p>
                      </div>
                    )}

                    {adminNoteText && (
                      <div className="text-xs text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                        <span className="text-[10px] uppercase font-bold text-amber-600 block mb-0.5">Admin Note</span>
                        <p>{adminNoteText}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[10px]" /> {new Date(req.createdAt).toLocaleString()}
                    </span>
                    {(req.residentId?.name || req.userId?.name) && (
                      <span className="font-medium text-gray-500">{req.residentId?.name || req.userId?.name}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── Admin View - full table ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaListAlt className="text-orange-500" /> Resident Parking Requests
          </h2>
          <p className="text-xs text-gray-500">Review and action requests for new slots or upgrades submitted by residents</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg font-semibold shrink-0">
          {filtered.length} request{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search resident, flat, request type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <FaClock className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Parking Requests</h3>
          <p className="text-xs text-gray-400 mt-1">No requests match your current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Resident</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Flat</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Request Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Slot</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                          <FaUser className="text-orange-500 text-[10px]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {req.residentId?.name || req.userId?.name || '-'}
                          </p>
                          {(req.residentId?.email || req.userId?.email) && (
                            <p className="text-[11px] text-gray-400">{req.residentId?.email || req.userId?.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <FaBuilding className="text-gray-400 text-[10px]" />
                        <span className="font-semibold">
                          {req.flatId?.flatNumber || '-'}
                        </span>
                        {req.flatId?.wing && (
                          <span className="text-gray-400">({formatWing(req.flatId.wing)})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                        {formatLabel(req.requestType || 'NEW_SLOT')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <FaCar className="text-gray-400 text-[10px]" />
                        <span className="font-semibold capitalize">
                          {formatLabel(req.requestedSlotType || req.preferredSlotType || req.preferredType || 'FOUR_WHEELER')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {(req.notes || req.reason) ? (
                        <p className="text-xs text-gray-500 max-w-[180px] truncate italic" title={req.notes || req.reason}>
                          "{req.notes || req.reason}"
                        </p>
                      ) : <span className="text-gray-400 text-xs">-</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${REQUEST_STATUS_STYLES[String(req.status).toLowerCase()] || REQUEST_STATUS_STYLES.pending}`}>
                        {formatLabel(req.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {String(req.status).toLowerCase() === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onApproveRequest(req)}
                            title="Approve & Assign"
                            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-sm whitespace-nowrap"
                          >
                            <FaCheck className="text-[10px]" /> Approve
                          </button>
                          <button
                            onClick={() => onRejectRequest(req._id)}
                            title="Reject"
                            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors border border-rose-200 whitespace-nowrap"
                          >
                            <FaTimes className="text-[10px]" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
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

export default ParkingRequestsTab;
