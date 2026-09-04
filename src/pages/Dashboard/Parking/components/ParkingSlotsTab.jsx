import React, { useState } from 'react';
import { FaParking, FaPlus, FaSearch, FaFilter, FaCar, FaTrash, FaEdit, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const formatWing = (wing) => {
  if (!wing) return 'N/A';
  const s = String(wing).trim();
  return s.toLowerCase().startsWith('wing') ? s : `Wing ${s}`;
};

const ParkingSlotsTab = ({ slots, loading, wings, onAddSlot, onEditSlot, onDeleteSlot }) => {
  const [search, setSearch] = useState('');
  const [selectedWing, setSelectedWing] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredSlots = slots.filter((slot) => {
    const matchSearch = slot.slotNumber.toLowerCase().includes(search.toLowerCase()) ||
                        (slot.location || '').toLowerCase().includes(search.toLowerCase());
    const matchWing = selectedWing === 'ALL' || slot.wing === selectedWing;
    const matchType = selectedType === 'ALL' || slot.type === selectedType;
    const matchStatus = selectedStatus === 'ALL' || slot.status === selectedStatus;
    return matchSearch && matchWing && matchType && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><FaCheckCircle className="text-[10px]" /> Available</span>;
      case 'allocated':
      case 'occupied':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><FaCar className="text-[10px]" /> Occupied</span>;
      case 'reserved':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">Reserved</span>;
      case 'maintenance':
        return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><FaExclamationCircle className="text-[10px]" /> Maintenance</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full capitalize">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaParking className="text-orange-500" /> Parking Slots
          </h2>
          <p className="text-xs text-gray-500">View, create, and manage society parking slots per wing</p>
        </div>
        <button
          onClick={onAddSlot}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm shrink-0"
        >
          <FaPlus /> Add Parking Slot
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search slot number / location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Wing Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Wing:</span>
          <select
            value={selectedWing}
            onChange={(e) => setSelectedWing(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="ALL">All Wings</option>
            {wings.map((w) => (
              <option key={w} value={w}>
                {String(w).toLowerCase().startsWith('wing') ? w : `Wing ${w}`}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="ALL">All Types</option>
            <option value="TWO_WHEELER">Two Wheeler</option>
            <option value="FOUR_WHEELER">Four Wheeler</option>
            <option value="EV_CHARGING">EV Charging</option>
            <option value="VISITOR">Visitor</option>
            <option value="DISABLED">Disabled / Accessible</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="available">Available</option>
            <option value="allocated">Occupied / Allocated</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <FaParking className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No Parking Slots Found</h3>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or add a new parking slot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSlots.map((slot) => (
            <div
              key={slot._id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-base font-black text-gray-800 bg-gray-100 px-3 py-1 rounded-xl">
                    {slot.slotNumber}
                  </span>
                  {getStatusBadge(slot.status)}
                </div>

                <div className="space-y-1 text-xs text-gray-600 mb-4">
                  <p><span className="font-semibold text-gray-700">Wing:</span> {formatWing(slot.wing)}</p>
                  <p><span className="font-semibold text-gray-700">Type:</span> <span className="capitalize">{(slot.type || slot.parkingType || '').replace(/_/g, ' ')}</span></p>
                  {slot.location && <p><span className="font-semibold text-gray-700">Location:</span> {slot.location}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEditSlot(slot)}
                  className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Edit Slot"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDeleteSlot(slot._id)}
                  className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Slot"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParkingSlotsTab;
