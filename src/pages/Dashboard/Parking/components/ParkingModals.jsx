import React, { useState } from 'react';
import { FaTimes, FaParking, FaCar, FaUserCheck, FaWalking, FaClock, FaExclamationTriangle } from 'react-icons/fa';

export const ParkingModals = ({
  activeModal,
  onClose,
  modalData,
  wings,
  residents,
  flats,
  slots,
  vehicles,
  onSubmitSlot,
  onSubmitVehicle,
  onSubmitAssign,
  onSubmitVisitor,
  onSubmitRequest,
  onSubmitViolation
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FaTimes className="text-lg" />
        </button>

        {activeModal === 'addSlot' || activeModal === 'editSlot' ? (
          <SlotModal
            isEdit={activeModal === 'editSlot'}
            initialData={modalData}
            wings={wings}
            onSubmit={onSubmitSlot}
            onClose={onClose}
          />
        ) : activeModal === 'addVehicle' || activeModal === 'editVehicle' ? (
          <VehicleModal
            isEdit={activeModal === 'editVehicle'}
            initialData={modalData}
            wings={wings}
            residents={residents}
            flats={flats}
            onSubmit={onSubmitVehicle}
            onClose={onClose}
          />
        ) : activeModal === 'assignSlot' ? (
          <AssignModal
            slots={slots}
            residents={residents}
            vehicles={vehicles}
            flats={flats}
            initialData={modalData}
            onSubmit={onSubmitAssign}
            onClose={onClose}
          />
        ) : activeModal === 'checkInVisitor' ? (
          <VisitorModal
            slots={slots}
            residents={residents}
            flats={flats}
            onSubmit={onSubmitVisitor}
            onClose={onClose}
          />
        ) : activeModal === 'requestSlot' ? (
          <RequestModal
            residents={residents}
            flats={flats}
            initialData={modalData}
            onSubmit={onSubmitRequest}
            onClose={onClose}
          />
        ) : activeModal === 'reportViolation' ? (
          <ViolationModal
            slots={slots}
            onSubmit={onSubmitViolation}
            onClose={onClose}
          />
        ) : null}
      </div>
    </div>
  );
};

/* ── Add / Edit Slot Modal ── */
const SlotModal = ({ isEdit, initialData, wings, onSubmit, onClose }) => {
  const [slotNumber, setSlotNumber] = useState(initialData?.slotNumber || '');
  const [wing, setWing] = useState(initialData?.wing || wings?.[0] || '');
  const [customWing, setCustomWing] = useState('');
  const [isNewWing, setIsNewWing] = useState(false);
  const [parkingType, setParkingType] = useState(initialData?.parkingType || 'FOUR_WHEELER');
  const [location, setLocation] = useState(initialData?.location || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalWing = isNewWing ? customWing.trim().toUpperCase() : wing;
    // Strip display prefix so DB stores the raw identifier (e.g. "A" not "Wing A")
    const rawWing = finalWing.replace(/^wing\s*/i, '').trim();
    onSubmit({
      slotNumber,
      wing: rawWing,
      type: parkingType,   // backend model field is `type`, not `parkingType`
      location,
    }, initialData?._id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
          <FaParking className="text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{isEdit ? 'Edit Parking Slot' : 'Add New Parking Slot'}</h3>
          <p className="text-xs text-gray-500">Configure slot details and wing location</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Slot Number *</label>
        <input
          type="text"
          required
          placeholder="e.g. A-101 or P-04"
          value={slotNumber}
          onChange={(e) => setSlotNumber(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Wing *</label>
          {!isNewWing ? (
            <select
              value={wing}
              onChange={(e) => {
                if (e.target.value === '__NEW__') {
                  setIsNewWing(true);
                } else {
                  setWing(e.target.value);
                }
              }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {wings?.map(w => (
                <option key={w} value={w}>
                  {String(w).toLowerCase().startsWith('wing') ? w : `Wing ${w}`}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. C or 3"
                value={customWing}
                onChange={(e) => setCustomWing(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => setIsNewWing(false)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parking Type *</label>
          <select
            value={parkingType}
            onChange={(e) => setParkingType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="FOUR_WHEELER">Four Wheeler</option>
            <option value="TWO_WHEELER">Two Wheeler</option>
            <option value="EV_CHARGING">EV Charging</option>
            <option value="VISITOR">Visitor</option>
            <option value="DISABLED">Disabled / Accessible</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location / Basement Level</label>
        <input
          type="text"
          placeholder="e.g. Basement B1, Near Lift 2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors"
        >
          {isEdit ? 'Save Changes' : 'Create Slot'}
        </button>
      </div>
    </form>
  );
};

/* ── Register / Edit Vehicle Modal ── */
const VehicleModal = ({ isEdit, initialData, wings, residents, flats, onSubmit, onClose }) => {
  const [regNumber, setRegNumber] = useState(initialData?.regNumber || initialData?.registrationNumber || '');
  // Extract the userId string - userId may be a populated object in edit mode
  const resolvedUserId = initialData?.userId?._id
    ? String(initialData.userId._id)
    : initialData?.userId
      ? String(initialData.userId)
      : initialData?.residentId
        ? String(initialData.residentId)
        : '';
  const [residentId, setResidentId] = useState(resolvedUserId);
  const [type, setType] = useState(initialData?.type || initialData?.vehicleType || 'FOUR_WHEELER');
  const [make, setMake] = useState(initialData?.make || '');
  const [model, setModel] = useState(initialData?.model || initialData?.vehicleModel || '');
  const [color, setColor] = useState(initialData?.color || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      type,
      make,
      model,
      color,
    };
    // Only include regNumber and userId when registering a new vehicle
    if (!isEdit) {
      payload.regNumber = regNumber.toUpperCase().trim();
      payload.userId = residentId || undefined;
    }
    onSubmit(payload, initialData?._id);
  };

  // Display name of current owner in edit mode
  const ownerDisplayName = initialData?.userId?.name || residents.find(r => String(r.userId || r._id) === resolvedUserId)?.name || 'N/A';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
          <FaCar className="text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{isEdit ? 'Edit Vehicle Details' : 'Register Resident Vehicle'}</h3>
          <p className="text-xs text-gray-500">Record vehicle registration and owner info</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reg Number *</label>
          <input
            type="text"
            required={!isEdit}
            readOnly={isEdit}
            placeholder="e.g. MH-12-AB-1234"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
              isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50'
            }`}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vehicle Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="FOUR_WHEELER">Four Wheeler</option>
            <option value="TWO_WHEELER">Two Wheeler</option>
            <option value="EV_CHARGING">EV</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Resident Owner {isEdit ? '' : '*'}</label>
        {isEdit ? (
          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500">
            {ownerDisplayName}
          </div>
        ) : (
          <select
            required
            value={residentId}
            onChange={(e) => setResidentId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">Select Resident</option>
            {residents.map(r => (
              <option key={r._id || r.id} value={r.userId || r._id}>
                {r.name} ({r.email || r.mobile || 'Resident'})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Make</label>
          <input
            type="text"
            placeholder="e.g. Honda"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Model</label>
          <input
            type="text"
            placeholder="e.g. City"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Color</label>
          <input
            type="text"
            placeholder="e.g. White"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors"
        >
          {isEdit ? 'Save Changes' : 'Register Vehicle'}
        </button>
      </div>
    </form>
  );
};

/* ── Allocate Slot Modal ── */
const AssignModal = ({ slots, residents, vehicles, flats, initialData, onSubmit, onClose }) => {
  const [slotId, setSlotId] = useState('');
  const [userId, setUserId] = useState(initialData?.residentId?._id || initialData?.residentId?.userId || '');
  const [flatId, setFlatId] = useState(initialData?.flatId?._id || initialData?.flatId || '');
  const [vehicleId, setVehicleId] = useState('');
  const [assignmentType, setAssignmentType] = useState('permanent');
  const [notes, setNotes] = useState('');

  const availableSlots = slots.filter(s => s.status === 'available');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      slotId,
      userId,
      flatId: flatId || undefined,
      vehicleId,
      assignmentType,
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
          <FaUserCheck className="text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Allocate Parking Slot</h3>
          <p className="text-xs text-gray-500">Assign an available slot to a resident and vehicle</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Available Slot *</label>
        <select
          required
          value={slotId}
          onChange={(e) => setSlotId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Select Available Slot</option>
          {availableSlots.map(s => (
            <option key={s._id} value={s._id}>Slot {s.slotNumber} (Wing {s.wing} - {s.parkingType})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Resident *</label>
        <select
          required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Select Resident</option>
          {residents.map(r => (
            <option key={r._id || r.id} value={r.userId || r._id}>
              {r.name} {r.flatNumber ? `(Flat ${r.flatNumber})` : r.email || r.mobile ? `(${r.email || r.mobile})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Resident Vehicle *</label>
        <select
          required
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v._id} value={v._id}>{v.regNumber || v.registrationNumber} ({v.make || ''} {v.model || ''})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assignment Type</label>
        <select
          value={assignmentType}
          onChange={(e) => setAssignmentType(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="permanent">Permanent Allocation</option>
          <option value="temporary">Temporary Allocation</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Remarks / Notes</label>
        <input
          type="text"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors"
        >
          Confirm Allocation
        </button>
      </div>
    </form>
  );
};

/* ── Visitor Check-In Modal ── */
const VisitorModal = ({ slots, residents, flats, onSubmit, onClose }) => {
  const [visitorName, setVisitorName] = useState('');
  const [visitorMobile, setVisitorMobile] = useState('');
  const [vehicleRegNumber, setVehicleRegNumber] = useState('');
  const [hostResidentId, setHostResidentId] = useState('');
  const [parkingSlotId, setParkingSlotId] = useState('');

  const visitorSlots = slots.filter(s => s.parkingType === 'VISITOR' && s.status === 'AVAILABLE');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      visitorName,
      visitorMobile,
      vehicleRegNumber: vehicleRegNumber.toUpperCase().trim(),
      hostResidentId,
      parkingSlotId: parkingSlotId || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
          <FaWalking className="text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Visitor Parking Check-In</h3>
          <p className="text-xs text-gray-500">Issue visitor parking pass</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Visitor Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Alex Smith"
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vehicle Reg *</label>
          <input
            type="text"
            required
            placeholder="e.g. MH-12-XY-9999"
            value={vehicleRegNumber}
            onChange={(e) => setVehicleRegNumber(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
          <input
            type="text"
            placeholder="Visitor contact"
            value={visitorMobile}
            onChange={(e) => setVisitorMobile(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Host Resident *</label>
          <select
            required
            value={hostResidentId}
            onChange={(e) => setHostResidentId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">Select Host</option>
            {residents.map(r => (
              <option key={r._id || r.id} value={r.userId || r._id}>
                {r.name} {r.flatNumber ? `(Flat ${r.flatNumber})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assign Visitor Slot</label>
        <select
          value={parkingSlotId}
          onChange={(e) => setParkingSlotId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="">Auto / Unassigned Slot</option>
          {visitorSlots.map(s => (
            <option key={s._id} value={s._id}>Slot {s.slotNumber} (Wing {s.wing})</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm transition-colors"
        >
          Check-In Visitor
        </button>
      </div>
    </form>
  );
};

/* ── Submit Parking Request Modal ── */
const RequestModal = ({ residents, flats, initialData, onSubmit, onClose }) => {
  const [residentId, setResidentId] = useState(residents[0]?._id || '');
  const [requestType, setRequestType] = useState('NEW_SLOT');
  const [preferredSlotType, setPreferredSlotType] = useState('FOUR_WHEELER');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      residentId,
      requestType,
      requestedSlotType: preferredSlotType,
      notes: reason,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <FaClock className="text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Submit Parking Request</h3>
          <p className="text-xs text-gray-500">Request a slot or upgrade for resident</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Resident *</label>
        <select
          required
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">Select Resident</option>
          {residents.map(r => (
            <option key={r._id || r.id} value={r._id}>
              {r.name} {r.flatNumber ? `(Flat ${r.flatNumber})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Request Type *</label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="NEW_SLOT">New Slot</option>
            <option value="UPGRADE">Upgrade Slot</option>
            <option value="SECOND_VEHICLE">Second Vehicle</option>
            <option value="VISITOR_PASS">Visitor Pass</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Preferred Slot Type *</label>
          <select
            value={preferredSlotType}
            onChange={(e) => setPreferredSlotType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="FOUR_WHEELER">Four Wheeler</option>
            <option value="TWO_WHEELER">Two Wheeler</option>
            <option value="EV_CHARGING">EV Charging</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reason / Justification</label>
        <textarea
          rows={3}
          placeholder="Explain reason for parking request..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors"
        >
          Submit Request
        </button>
      </div>
    </form>
  );
};

/* ── Report Violation Modal ── */
const ViolationModal = ({ slots, onSubmit, onClose }) => {
  const [unregisteredVehicleNumber, setUnregisteredVehicleNumber] = useState('');
  const [parkingSlotId, setParkingSlotId] = useState('');
  const [violationType, setViolationType] = useState('unauthorized_parking');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      unregisteredVehicleNumber: unregisteredVehicleNumber.toUpperCase().trim(),
      parkingSlotId: parkingSlotId || undefined,
      violationType,
      description
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
          <FaExclamationTriangle className="text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Report Parking Violation</h3>
          <p className="text-xs text-gray-500">Log unauthorized parking or rule infractions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vehicle Reg *</label>
          <input
            type="text"
            required
            placeholder="e.g. MH-12-XX-0000"
            value={unregisteredVehicleNumber}
            onChange={(e) => setUnregisteredVehicleNumber(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Violation Type *</label>
          <select
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="unauthorized_parking">Unauthorized Vehicle</option>
            <option value="wrong_slot">Parked in Wrong Slot</option>
            <option value="blocking_entry">Blocking Entry / Exit</option>
            <option value="parking_in_visitor_slot">Parking in Visitor Slot</option>
            <option value="parking_in_reserved_slot">Parking in Reserved Slot</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Involved Slot</label>
        <select
          value={parkingSlotId}
          onChange={(e) => setParkingSlotId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        >
          <option value="">Select Slot (if applicable)</option>
          {slots.map(s => (
            <option key={s._id} value={s._id}>Slot {s.slotNumber} (Wing {s.wing})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description / Details</label>
        <textarea
          rows={3}
          placeholder="Describe the parking violation..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors"
        >
          Report Violation
        </button>
      </div>
    </form>
  );
};
