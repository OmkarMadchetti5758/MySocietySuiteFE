import React, { useState } from 'react';
import { FaExclamationTriangle, FaPlus, FaSearch, FaCheckCircle, FaCar, FaClock, FaShieldAlt, FaUser } from 'react-icons/fa';

const STATUS_STYLES = {
  open:      'bg-rose-100 text-rose-700 border-rose-200',
  reported:  'bg-rose-100 text-rose-700 border-rose-200',
  resolved:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  dismissed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const formatLabel = (str) =>
  (str || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

const ViolationsTab = ({ violations, loading, onReportViolation, onResolveViolation, isResident }) => {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = violations.filter((v) => {
    const reg  = (v.vehicleRegistrationNumber || v.unregisteredVehicleNumber || '').toLowerCase();
    const type = (v.violationType || '').toLowerCase();
    const desc = (v.description || '').toLowerCase();
    const matchSearch = reg.includes(search.toLowerCase()) ||
                        type.includes(search.toLowerCase()) ||
                        desc.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
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
              <FaExclamationTriangle className="text-rose-500" /> Parking Violations
            </h2>
            <p className="text-xs text-gray-500">Report unauthorized parking or rule infractions in your society</p>
          </div>
          <button
            onClick={onReportViolation}
            className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm shrink-0"
          >
            <FaPlus /> Report Violation
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search vehicle reg, violation type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="open">Open</option>
            <option value="reported">Reported</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
            <FaExclamationTriangle className="text-4xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No Violations Found</h3>
            <p className="text-xs text-gray-400 mt-1">You haven't reported any violations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v) => (
              <div key={v._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                    {v.vehicleRegistrationNumber || v.unregisteredVehicleNumber || 'N/A'}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[v.status] || STATUS_STYLES.open}`}>
                    {formatLabel(v.status)}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">{formatLabel(v.violationType)}</p>
                  {v.parkingSlotId?.slotNumber && (
                    <p className="text-gray-500 flex items-center gap-1">
                      <FaCar className="text-gray-400" /> Slot:&nbsp;<span className="font-bold text-gray-700">{v.parkingSlotId.slotNumber}</span>
                    </p>
                  )}
                  <p className="text-gray-400 flex items-center gap-1">
                    <FaClock className="text-gray-300" /> {new Date(v.reportedAt || v.createdAt).toLocaleString()}
                  </p>
                  {v.description && (
                    <p className="text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 mt-1">{v.description}</p>
                  )}
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
            <FaShieldAlt className="text-rose-500" /> Parking Violations
          </h2>
          <p className="text-xs text-gray-500">Review and resolve society parking violations reported by residents</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg font-semibold">
            {filtered.length} violation{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search vehicle reg, violation type, description…"
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
          <option value="open">Open</option>
          <option value="reported">Reported</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <FaExclamationTriangle className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Violations Found</h3>
          <p className="text-xs text-gray-400 mt-1">No violations match the current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Reg</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Violation Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Reported By</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Slot</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg text-xs">
                        {v.vehicleRegistrationNumber || v.unregisteredVehicleNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-gray-700">{formatLabel(v.violationType)}</span>
                      {v.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 max-w-[200px] truncate">{v.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                          <FaUser className="text-orange-500 text-[10px]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {v.reportedByUserId?.name || v.reportedBy?.name || 'Resident'}
                          </p>
                          {v.reportedByUserId?.email && (
                            <p className="text-[11px] text-gray-400">{v.reportedByUserId.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {v.parkingSlotId?.slotNumber ? (
                        <span className="font-semibold text-gray-700">
                          {v.parkingSlotId.slotNumber}
                          {v.parkingSlotId.wing && <span className="text-gray-400"> · Wing {v.parkingSlotId.wing}</span>}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(v.reportedAt || v.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[v.status] || STATUS_STYLES.open}`}>
                        {formatLabel(v.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {(v.status === 'open' || v.status === 'reported') && (
                        <button
                          onClick={() => onResolveViolation(v._id)}
                          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors border border-emerald-200 whitespace-nowrap"
                        >
                          <FaCheckCircle className="text-xs" /> Resolve
                        </button>
                      )}
                      {(v.status !== 'open' && v.status !== 'reported') && (
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

export default ViolationsTab;
