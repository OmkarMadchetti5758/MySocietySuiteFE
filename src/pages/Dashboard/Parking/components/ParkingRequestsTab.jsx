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
  pending:  'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  cancelled:'bg-gray-100 text-gray-600 border-gray-200',
};

const ParkingRequestsTab = ({ requests, loading, onCreateRequest, onApproveRequest, onRejectRequest, isResident }) => {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = requests.filter((r) => {
    const res  = (r.residentId?.name || '').toLowerCase();
    const flat = (r.flatId?.flatNumber || '').toLowerCase();
    const type = (r.requestType || '').toLowerCase();
    const matchSearch = res.includes(search.toLowerCase()) ||
                        flat.includes(search.toLowerCase()) ||
                        type.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
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
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0"
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
            {filtered.map((req) => (
              <div key={req._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                    {formatLabel(req.requestType)}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${REQUEST_STATUS_STYLES[req.status] || REQUEST_STATUS_STYLES.pending}`}>
                    {formatLabel(req.status)}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-gray-500 flex items-center gap-1">
                    <FaCar className="text-gray-400" /> Preferred type:&nbsp;
                    <span className="font-semibold text-gray-700">{formatLabel(req.preferredType || req.preferredSlotType)}</span>
                  </p>
                  {req.reason && (
                    <p className="text-gray-600 italic bg-gray-50 p-2 rounded-xl border border-gray-100">"{req.reason}"</p>
                  )}
                  {req.reviewNotes && (
                    <p className="text-gray-500 bg-amber-50 border border-amber-100 p-2 rounded-xl">
                      <span className="font-semibold text-amber-700">Admin note:</span> {req.reviewNotes}
                    </p>
                  )}
                  <p className="text-gray-400">{new Date(req.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Admin View — full table ── */
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
                            {req.residentId?.name || req.userId?.name || '—'}
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
                          {req.flatId?.flatNumber || '—'}
                        </span>
                        {req.flatId?.wing && (
                          <span className="text-gray-400">({formatWing(req.flatId.wing)})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                        {formatLabel(req.requestType) || 'Parking Request'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <FaCar className="text-gray-400 text-[10px]" />
                        <span className="font-semibold capitalize">
                          {formatLabel(req.requestedSlotType || req.preferredSlotType || req.preferredType) || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {(req.notes || req.reason) ? (
                        <p className="text-xs text-gray-500 max-w-[180px] truncate italic" title={req.notes || req.reason}>
                          "{req.notes || req.reason}"
                        </p>
                      ) : <span className="text-gray-400 text-xs">—</span>}
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
                        <span className="text-xs text-gray-400">—</span>
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
