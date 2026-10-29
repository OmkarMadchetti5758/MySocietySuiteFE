import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiInfo } from 'react-icons/fi';
import {
  RESIDENTIAL_PROPERTY_TYPES,
  RESIDENTIAL_CONFIGURATIONS,
} from '../../constants/setupConstants';

const ResidentialModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    wing: '',
    propertyType: 'Flat / Apartment',
    configuration: '2 BHK',
    totalFloors: '',
    unitsPerFloor: '',
    unitCount: '',
    carpetArea: '',
    builtUpArea: '',
    parking4W: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      const uCount = editData.unitCount ?? '';
      const tFloors = editData.totalFloors ?? (uCount ? Math.ceil(Number(uCount) / 4) : '');
      const uPerFloor = editData.unitsPerFloor ?? (tFloors && uCount ? Math.ceil(Number(uCount) / Number(tFloors)) : 4);

      setFormData({
        wing: editData.wing || '',
        propertyType: editData.propertyType || 'Flat / Apartment',
        configuration: editData.configuration || '2 BHK',
        totalFloors: tFloors,
        unitsPerFloor: uPerFloor,
        unitCount: uCount,
        carpetArea: editData.carpetArea || '',
        builtUpArea: editData.builtUpArea || '',
        parking4W: editData.parking4W || '',
      });
    } else {
      setFormData({
        wing: '',
        propertyType: 'Flat / Apartment',
        configuration: '2 BHK',
        totalFloors: '',
        unitsPerFloor: '',
        unitCount: '',
        carpetArea: '',
        builtUpArea: '',
        parking4W: '',
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  // Handle floor and flats per floor change with auto-sync of total units
  const handleFloorsOrFlatsChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const floorsNum = Number(field === 'totalFloors' ? value : prev.totalFloors);
      const unitsPerFloorNum = Number(field === 'unitsPerFloor' ? value : prev.unitsPerFloor);
      const currentUnitCount = Number(prev.unitCount);

      // Auto-suggest unitCount if empty or previously matched capacity
      if (
        floorsNum >= 1 &&
        unitsPerFloorNum >= 1 &&
        Number.isInteger(floorsNum) &&
        Number.isInteger(unitsPerFloorNum)
      ) {
        const capacity = floorsNum * unitsPerFloorNum;
        const prevFloors = Number(prev.totalFloors);
        const prevUnitsPerFloor = Number(prev.unitsPerFloor);
        const prevCapacity = prevFloors * prevUnitsPerFloor;

        if (!prev.unitCount || currentUnitCount === prevCapacity) {
          updated.unitCount = capacity;
        }
      }
      return updated;
    });
  };

  const totalFloorsNum = Number(formData.totalFloors);
  const unitsPerFloorNum = Number(formData.unitsPerFloor);
  const unitCountNum = Number(formData.unitCount);
  const capacity =
    totalFloorsNum >= 1 && unitsPerFloorNum >= 1
      ? totalFloorsNum * unitsPerFloorNum
      : null;
  const isPartiallyOccupied =
    capacity !== null &&
    unitCountNum >= 1 &&
    unitCountNum < capacity;
  const activeFloors =
    unitsPerFloorNum >= 1 && unitCountNum >= 1
      ? Math.ceil(unitCountNum / unitsPerFloorNum)
      : null;
  const finalFloorUnits =
    unitsPerFloorNum >= 1 && unitCountNum >= 1
      ? ((unitCountNum - 1) % unitsPerFloorNum) + 1
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.wing.trim()) newErrors.wing = 'Wing/Block is required';

    if (!formData.totalFloors || isNaN(totalFloorsNum) || totalFloorsNum < 1 || !Number.isInteger(totalFloorsNum)) {
      newErrors.totalFloors = 'Total floors must be a whole number (at least 1)';
    }

    if (!formData.unitsPerFloor || isNaN(unitsPerFloorNum) || unitsPerFloorNum < 1 || !Number.isInteger(unitsPerFloorNum)) {
      newErrors.unitsPerFloor = 'Flats per floor must be a whole number (at least 1)';
    }

    if (!formData.unitCount || isNaN(unitCountNum) || unitCountNum < 1 || !Number.isInteger(unitCountNum)) {
      newErrors.unitCount = 'Valid unit count required (at least 1)';
    } else if (
      totalFloorsNum >= 1 &&
      unitsPerFloorNum >= 1 &&
      unitCountNum > capacity
    ) {
      newErrors.unitCount = `Unit count (${unitCountNum}) cannot exceed wing capacity of ${capacity} (${totalFloorsNum} floors × ${unitsPerFloorNum} flats/floor)`;
    }

    if (!formData.carpetArea || Number(formData.carpetArea) <= 0) newErrors.carpetArea = 'Carpet area required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      totalFloors: totalFloorsNum,
      unitsPerFloor: unitsPerFloorNum,
      unitCount: unitCountNum,
      carpetArea: Number(formData.carpetArea),
      builtUpArea: Number(formData.builtUpArea) || Math.round(Number(formData.carpetArea) * 1.35),
      parking4W: Number(formData.parking4W) || unitCountNum,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {editData ? 'Edit Residential Configuration' : 'Add Residential Configuration'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Wing / Block <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. A Wing or Tower 1"
                value={formData.wing}
                onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.wing && <p className="text-[11px] text-red-500 mt-1">{errors.wing}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              >
                {RESIDENTIAL_PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Configuration <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.configuration}
                onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              >
                {RESIDENTIAL_CONFIGURATIONS.map((cfg) => (
                  <option key={cfg} value={cfg}>
                    {cfg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Floors <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={formData.totalFloors}
                onChange={(e) => handleFloorsOrFlatsChange('totalFloors', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.totalFloors && <p className="text-[11px] text-red-500 mt-1">{errors.totalFloors}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Flats per Floor <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 4"
                value={formData.unitsPerFloor}
                onChange={(e) => handleFloorsOrFlatsChange('unitsPerFloor', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.unitsPerFloor && <p className="text-[11px] text-red-500 mt-1">{errors.unitsPerFloor}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Units <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 40"
                value={formData.unitCount}
                onChange={(e) => setFormData({ ...formData, unitCount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.unitCount && <p className="text-[11px] text-red-500 mt-1">{errors.unitCount}</p>}
            </div>
          </div>

          {/* Dynamic Floor Capacity & Partial Floor Info Box */}
          {capacity !== null && (
            <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-gray-700 font-semibold">
                <span className="flex items-center gap-1.5 text-[#EA580C]">
                  <FiInfo className="text-sm shrink-0" />
                  <span>Wing Capacity:</span>
                </span>
                <span className="text-gray-900 font-bold">
                  {capacity} units ({totalFloorsNum} floors × {unitsPerFloorNum} flats/floor)
                </span>
              </div>
              {isPartiallyOccupied && activeFloors !== null && (
                <p className="text-[11px] text-gray-600 pl-5">
                  Partially occupied: {unitCountNum} units across {activeFloors} floor(s).{' '}
                  {finalFloorUnits < unitsPerFloorNum
                    ? `Top floor (${activeFloors}) has ${finalFloorUnits} of ${unitsPerFloorNum} units.`
                    : 'All active floors are fully occupied.'}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Carpet Area (sq.ft.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="100"
                placeholder="e.g. 550"
                value={formData.carpetArea}
                onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
              {errors.carpetArea && <p className="text-[11px] text-red-500 mt-1">{errors.carpetArea}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Built-up Area (sq.ft.)
              </label>
              <input
                type="number"
                min="100"
                placeholder="e.g. 750"
                value={formData.builtUpArea}
                onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Parking (4W)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 30"
                value={formData.parking4W}
                onChange={(e) => setFormData({ ...formData, parking4W: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FiCheck className="text-base" />
              <span>{editData ? 'Update Configuration' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentialModal;
