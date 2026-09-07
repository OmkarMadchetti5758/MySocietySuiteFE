import React, { useState } from 'react';
import { FaCar, FaPlus, FaSearch, FaEdit, FaBan, FaCheckCircle, FaUser, FaBuilding } from 'react-icons/fa';

/**
 * Returns a formatted "Wing X - FlatNum" string.
 * Priority:
 *  1. Backend-injected wingName + flatNumberClean (most accurate)
 *  2. Explicit wing field on flatId (legacy)
 *  3. Parse wing prefix from flatNumber (e.g. "A-102" → Wing A - 102)
 *  4. Fallback to raw flatNumber
 */
const formatFlatWing = (vehicle) => {
  const flat = vehicle.flatId;

  // 1. Backend-enriched fields (preferred)
  if (flat?.wingName) {
    const wing = String(flat.wingName).trim();
    const wingLabel = wing.toLowerCase().startsWith('wing') ? wing : `Wing ${wing}`;
    const num = flat.flatNumberClean || flat.flatNumber || 'N/A';
    return `${wingLabel} - ${num}`;
  }

  // 2. Explicit wing field
  const explicitWing = flat?.wing || vehicle.wing;
  const flatNum = flat?.flatNumber || vehicle.flatNumber;
  if (explicitWing) {
    const w = String(explicitWing).trim();
    const wingLabel = w.toLowerCase().startsWith('wing') ? w : `Wing ${w}`;
    return `${wingLabel} - ${flatNum || 'N/A'}`;
  }

  // 3. Parse wing from flatNumber prefix (e.g. "A-102")
  if (flatNum) {
    const parts = String(flatNum).split('-');
    if (parts.length >= 2) {
      const wingPart = parts[0].trim();
      const numPart = parts.slice(1).join('-').trim();
      return `Wing ${wingPart} - ${numPart}`;
    }
    // No wing prefix — just show flat number
    return flatNum;
  }

  return 'N/A';
};

const VehiclesTab = ({ vehicles, loading, onAddVehicle, onEditVehicle, onDeactivateVehicle }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filtered = vehicles.filter((v) => {
    const reg = (v.regNumber || v.registrationNumber || '').toLowerCase();
    const owner = (v.userId?.name || v.ownerName || '').toLowerCase();
    const model = `${v.make || ''} ${v.model || v.vehicleModel || ''}`.toLowerCase();
    const matchSearch = reg.includes(search.toLowerCase()) || owner.includes(search.toLowerCase()) || model.includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || (v.type || v.vehicleType) === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaCar className="text-orange-500" /> Resident Vehicles
          </h2>
          <p className="text-xs text-gray-500">Manage registered resident vehicles in the society</p>
        </div>
        <button
          onClick={onAddVehicle}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm shrink-0"
        >
          <FaPlus /> Register Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search reg number, owner name, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="ALL">All Types</option>
            <option value="TWO_WHEELER">Two Wheeler</option>
            <option value="FOUR_WHEELER">Four Wheeler</option>
            <option value="EV_CHARGING">EV</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <FaCar className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Vehicles Found</h3>
          <p className="text-xs text-gray-400 mt-1">Register a resident vehicle to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Reg. Number</th>
                  <th className="p-4">Owner / Resident</th>
                  <th className="p-4">Flat / Wing</th>
                  <th className="p-4">Make / Model</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-900">{v.regNumber || v.registrationNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400 text-xs" />
                        <span>{v.userId?.name || v.ownerName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <FaBuilding className="text-gray-400 text-xs" />
                        <span>{formatFlatWing(v)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{`${v.make || ''} ${v.model || v.vehicleModel || ''}`.trim() || 'N/A'}</td>
                    <td className="p-4">
                      <span className="capitalize px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-[11px]">
                        {(v.type || v.vehicleType)?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      {v.isActive !== false ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <FaCheckCircle className="text-[9px]" /> Active
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditVehicle(v)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Vehicle"
                        >
                          <FaEdit />
                        </button>
                        {v.isActive !== false && (
                          <button
                            onClick={() => onDeactivateVehicle(v._id)}
                            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Deactivate Vehicle"
                          >
                            <FaBan />
                          </button>
                        )}
                      </div>
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

export default VehiclesTab;
