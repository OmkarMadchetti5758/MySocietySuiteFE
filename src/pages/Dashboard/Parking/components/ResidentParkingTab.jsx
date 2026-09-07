import React from 'react';
import { 
  FaCar, 
  FaParking, 
  FaPlus, 
  FaBuilding, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaEdit, 
  FaBan, 
  FaTag 
} from 'react-icons/fa';

const formatWing = (wing) => {
  if (!wing) return 'N/A';
  const s = String(wing).trim();
  return s.toLowerCase().startsWith('wing') ? s : `Wing ${s}`;
};

const formatFlatWing = (vehicle) => {
  const flat = vehicle.flatId;
  if (flat?.wingName) {
    const wing = String(flat.wingName).trim();
    const wingLabel = wing.toLowerCase().startsWith('wing') ? wing : `Wing ${wing}`;
    const num = flat.flatNumberClean || flat.flatNumber || 'N/A';
    return `${wingLabel} - ${num}`;
  }
  const explicitWing = flat?.wing || vehicle.wing;
  const flatNum = flat?.flatNumber || vehicle.flatNumber;
  if (explicitWing) {
    const w = String(explicitWing).trim();
    const wingLabel = w.toLowerCase().startsWith('wing') ? w : `Wing ${w}`;
    return `${wingLabel} - ${flatNum || 'N/A'}`;
  }
  if (flatNum) {
    const parts = String(flatNum).split('-');
    if (parts.length >= 2) {
      return `Wing ${parts[0].trim()} - ${parts.slice(1).join('-').trim()}`;
    }
    return flatNum;
  }
  return 'N/A';
};

const ResidentParkingTab = ({
  assignments = [],
  vehicles = [],
  loading = false,
  onAddVehicle,
  onEditVehicle,
  onDeactivateVehicle,
  onRequestSlot
}) => {
  const activeAssignments = assignments.filter(a => a.status === 'active' || !a.status);
  const activeVehicles = vehicles.filter(v => v.isActive !== false);

  return (
    <div className="space-y-8">
      {/* Overview Banner for Resident */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider backdrop-blur-md">
              Resident Dashboard
            </span>
            <h2 className="text-2xl font-black mt-2 tracking-tight">My Vehicles & Allotted Slots</h2>
            <p className="text-orange-100 text-xs mt-1 max-w-xl">
              View your allotted society parking slots and manage your registered vehicles.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onAddVehicle}
              className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-4 py-2.5 rounded-2xl shadow-md transition-all text-xs cursor-pointer"
            >
              <FaPlus /> Register Vehicle
            </button>
            <button
              onClick={onRequestSlot}
              className="flex items-center gap-2 bg-orange-700/60 hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-2xl border border-white/20 transition-all text-xs cursor-pointer"
            >
              <FaPlus /> Request Slot
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <p className="text-orange-100 text-[11px] font-semibold">Allotted Slots</p>
            <p className="text-2xl font-black mt-0.5">{activeAssignments.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <p className="text-orange-100 text-[11px] font-semibold">Registered Vehicles</p>
            <p className="text-2xl font-black mt-0.5">{activeVehicles.length}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <p className="text-orange-100 text-[11px] font-semibold">Parking Status</p>
            <p className="text-sm font-bold mt-1 text-emerald-200 flex items-center gap-1.5">
              <FaCheckCircle /> {activeAssignments.length > 0 ? 'Slot Allocated' : 'No Slot Allocated'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Allotted Parking Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FaParking className="text-orange-500" /> My Allotted Parking Slots
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {activeAssignments.length} slot{activeAssignments.length !== 1 ? 's' : ''} assigned
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 bg-white rounded-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : activeAssignments.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto text-xl">
              <FaParking />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">No Parking Slot Allotted</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                You do not have any active parking slot assigned to your unit. Submit a request to the society management to get a slot allocated.
              </p>
            </div>
            <button
              onClick={onRequestSlot}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <FaPlus /> Request Parking Slot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAssignments.map((a) => {
              const slot = a.parkingSlotId;
              const vehicle = a.vehicleId;
              return (
                <div key={a._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                        {a.assignmentType || 'Permanent'} Assignment
                      </span>
                      <h4 className="text-xl font-black text-gray-900 mt-1 font-mono">
                        Slot {slot?.slotNumber || 'N/A'}
                      </h4>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <FaCheckCircle className="text-[9px]" /> Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 font-medium block text-[10px]">WING & FLOOR</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                        <FaBuilding className="text-gray-400 text-[10px]" />
                        {formatWing(slot?.wing || a.flatId?.wing)} • Floor {slot?.floor ?? '0'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block text-[10px]">SLOT TYPE</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5 uppercase">
                        <FaTag className="text-gray-400 text-[10px]" />
                        {(slot?.type || 'Standard').replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {vehicle && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                          <FaCar />
                        </div>
                        <div>
                          <p className="font-bold font-mono text-gray-900">{vehicle.regNumber || vehicle.registrationNumber}</p>
                          <p className="text-gray-500 text-[11px]">{`${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Assigned Vehicle'}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <FaCalendarAlt /> {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Registered Vehicles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FaCar className="text-orange-500" /> My Registered Vehicles
            </h3>
            <p className="text-xs text-gray-500">Vehicles registered under your flat account</p>
          </div>
          <button
            onClick={onAddVehicle}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <FaPlus /> Register Vehicle
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 bg-white rounded-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mx-auto text-xl">
              <FaCar />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">No Vehicles Registered</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Add your vehicle details so security and management can verify your parking authorization.
              </p>
            </div>
            <button
              onClick={onAddVehicle}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <FaPlus /> Register Vehicle
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Reg. Number</th>
                    <th className="p-4">Make / Model</th>
                    <th className="p-4">Color</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Flat / Wing</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {vehicles.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-900">{v.regNumber || v.registrationNumber}</td>
                      <td className="p-4 text-gray-800 font-semibold">{`${v.make || ''} ${v.model || v.vehicleModel || ''}`.trim() || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{v.color || 'N/A'}</td>
                      <td className="p-4">
                        <span className="capitalize px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-[11px]">
                          {(v.type || v.vehicleType)?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{formatFlatWing(v)}</td>
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
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Vehicle"
                          >
                            <FaEdit />
                          </button>
                          {v.isActive !== false && (
                            <button
                              onClick={() => onDeactivateVehicle(v._id)}
                              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
    </div>
  );
};

export default ResidentParkingTab;
