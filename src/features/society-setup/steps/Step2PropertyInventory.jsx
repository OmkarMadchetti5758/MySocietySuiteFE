import React, { useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiInfo,
  FiUser,
  FiZap,
} from 'react-icons/fi';
import {
  FaCar,
  FaMotorcycle,
  FaShieldAlt,
  FaBuilding,
  FaStore,
} from 'react-icons/fa';
import { MdOutlineDragIndicator } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import {
  SOCIETY_TYPES,
  PARKING_ALLOCATION_METHODS,
} from '../constants/setupConstants';
import { useSetupWizard } from '../hooks/useSetupWizard';
import { formatIndianNumber } from '../utils/calculations';
import StepInfoCard from '../components/StepInfoCard';
import ResidentialModal from '../components/modals/ResidentialModal';
import CommercialModal from '../components/modals/CommercialModal';

const Step2PropertyInventory = () => {
  const {
    propertyInfo,
    updatePropertyInfo,
    residentialInventory,
    addResidentialRow,
    updateResidentialRow,
    deleteResidentialRow,
    commercialInventory,
    addCommercialRow,
    updateCommercialRow,
    deleteCommercialRow,
    parkingConfig,
    updateParkingConfig,
    residentialTotals,
    commercialTotals,
    parkingTotals,
    overallInventory,
    validationErrors,
  } = useSetupWizard();

  // Modals state
  const [residentialModalOpen, setResidentialModalOpen] = useState(false);
  const [editingResidential, setEditingResidential] = useState(null);

  const [commercialModalOpen, setCommercialModalOpen] = useState(false);
  const [editingCommercial, setEditingCommercial] = useState(null);

  const handlePropertyChange = (field, value) => {
    updatePropertyInfo({ [field]: value });
  };

  const handleParkingChange = (field, value) => {
    updateParkingConfig({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register Society</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up your society, property inventory, amenities and important contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Content (3 Columns) */}
        <div className="xl:col-span-3 space-y-8">

          {/* 1. Project / Property Information Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Project / Property Information
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Project / Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Green Valley Residency"
                    value={propertyInfo.projectName || ''}
                    onChange={(e) => handlePropertyChange('projectName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                  {validationErrors.projectName && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.projectName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Developer / Builder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Green Valley Developers Pvt. Ltd."
                    value={propertyInfo.developerName || ''}
                    onChange={(e) => handlePropertyChange('developerName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                  {validationErrors.developerName && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.developerName}</p>
                  )}
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Project Start Date
                  </label>
                  <input
                    type="date"
                    value={propertyInfo.projectStartDate || ''}
                    onChange={(e) => handlePropertyChange('projectStartDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Expected Completion Date
                  </label>
                  <input
                    type="date"
                    value={propertyInfo.expectedCompletionDate || ''}
                    onChange={(e) => handlePropertyChange('expectedCompletionDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Actual Completion Date
                  </label>
                  <input
                    type="date"
                    value={propertyInfo.actualCompletionDate || ''}
                    onChange={(e) => handlePropertyChange('actualCompletionDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Possession Start Date
                  </label>
                  <input
                    type="date"
                    value={propertyInfo.possessionStartDate || ''}
                    onChange={(e) => handlePropertyChange('possessionStartDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>
              </div>

              {/* Area & Configuration row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Total Project Area (sq.ft.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1350000"
                    value={propertyInfo.totalProjectArea || ''}
                    onChange={(e) => handlePropertyChange('totalProjectArea', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                  {validationErrors.totalProjectArea && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.totalProjectArea}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Total Developed Area (sq.ft.)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 980000"
                    value={propertyInfo.totalDevelopedArea || ''}
                    onChange={(e) => handlePropertyChange('totalDevelopedArea', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    No. of Buildings / Wings / Blocks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={propertyInfo.numberOfBuildings || ''}
                    onChange={(e) => handlePropertyChange('numberOfBuildings', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                  {validationErrors.numberOfBuildings && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.numberOfBuildings}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={propertyInfo.propertyType || 'Mixed (Residential + Commercial)'}
                    onChange={(e) => handlePropertyChange('propertyType', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  >
                    {SOCIETY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Blue Info Notice */}
            <div className="mt-5 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2.5 text-xs text-blue-700">
              <FiInfo className="text-base text-blue-600 shrink-0" />
              <span>Configure your property inventory in the sections below. Units will be generated in the next step.</span>
            </div>
          </div>

          {/* Middle Row: Residential Inventory & Commercial Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 2. Residential Inventory */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      <span className="text-[#EA580C]">2.</span> Residential Inventory
                    </h2>
                    <p className="text-xs text-gray-500">Add wings/blocks and their unit configuration.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingResidential(null);
                      setResidentialModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 text-[#EA580C] hover:bg-orange-50 font-semibold text-xs transition-colors"
                  >
                    <FiPlus className="text-sm stroke-[3]" />
                    <span>Add Configuration</span>
                  </button>
                </div>

                {validationErrors.residentialInventory && (
                  <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded-lg">
                    {validationErrors.residentialInventory}
                  </p>
                )}

                {/* Residential Table */}
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500 font-bold bg-gray-50/50">
                        <th className="py-2.5 px-2 w-6"></th>
                        <th className="py-2.5 px-2">Wing / Block</th>
                        <th className="py-2.5 px-2">Property Type</th>
                        <th className="py-2.5 px-2">Configuration</th>
                        <th className="py-2.5 px-2 text-center">Unit Count</th>
                        <th className="py-2.5 px-2 text-right">Carpet Area / Unit (sq.ft.)</th>
                        <th className="py-2.5 px-2 text-right">Built-up Area / Unit (sq.ft.)</th>
                        <th className="py-2.5 px-2 text-center">Parking (4W)</th>
                        <th className="py-2.5 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {residentialInventory.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-1 text-gray-300 cursor-grab">
                            <MdOutlineDragIndicator className="text-base" />
                          </td>
                          <td className="py-2.5 px-2 font-semibold text-gray-800">{row.wing}</td>
                          <td className="py-2.5 px-2 text-gray-600">{row.propertyType}</td>
                          <td className="py-2.5 px-2">
                            <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                              {row.configuration}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-gray-900">{row.unitCount}</td>
                          <td className="py-2.5 px-2 text-right text-gray-700">{row.carpetArea}</td>
                          <td className="py-2.5 px-2 text-right text-gray-700">{row.builtUpArea}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-gray-800">{row.parking4W}</td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingResidential(row);
                                  setResidentialModalOpen(true);
                                }}
                                className="p-1 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <FiEdit2 className="text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (residentialInventory.length <= 1) {
                                    toast.error('At least one residential row is required');
                                    return;
                                  }
                                  deleteResidentialRow(row.id);
                                }}
                                className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Residential Summary Banner */}
              <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-bold">
                  <FaShieldAlt className="text-emerald-600 text-sm" />
                  <span>Residential Summary</span>
                </div>
                <div className="flex items-center gap-4 text-center">
                  <div>
                    <span className="block text-[10px] text-emerald-600 font-medium">Total Wings / Blocks</span>
                    <span className="font-extrabold text-sm text-gray-900">{residentialTotals.totalWings}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-600 font-medium">Total Units</span>
                    <span className="font-extrabold text-sm text-gray-900">{residentialTotals.totalUnits}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-600 font-medium">1 BHK Units</span>
                    <span className="font-extrabold text-sm text-gray-900">{residentialTotals.oneBhkUnits}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-600 font-medium">Other Units</span>
                    <span className="font-extrabold text-sm text-gray-900">{residentialTotals.otherUnits}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-600 font-medium">Total Parking (4W)</span>
                    <span className="font-extrabold text-sm text-gray-900">{residentialTotals.totalParking4W}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Commercial Inventory */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      <span className="text-[#EA580C]">3.</span> Commercial Inventory
                    </h2>
                    <p className="text-xs text-gray-500">Add commercial units configuration.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommercial(null);
                      setCommercialModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 text-[#EA580C] hover:bg-orange-50 font-semibold text-xs transition-colors"
                  >
                    <FiPlus className="text-sm stroke-[3]" />
                    <span>Add Commercial</span>
                  </button>
                </div>

                {/* Commercial Table */}
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-left text-xs border-collapse min-w-[420px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500 font-bold bg-gray-50/50">
                        <th className="py-2.5 px-2">Block</th>
                        <th className="py-2.5 px-2">Commercial Type</th>
                        <th className="py-2.5 px-2 text-right">Unit Size (sq.ft.)</th>
                        <th className="py-2.5 px-2 text-center">Unit Count</th>
                        <th className="py-2.5 px-2 text-center">Parking</th>
                        <th className="py-2.5 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {commercialInventory.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-2 font-semibold text-gray-800">{row.block}</td>
                          <td className="py-2.5 px-2">
                            <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                              {row.commercialType}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right text-gray-700">{formatIndianNumber(row.unitSize)}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-gray-900">{row.unitCount}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-gray-800">{row.parking}</td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommercial(row);
                                  setCommercialModalOpen(true);
                                }}
                                className="p-1 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <FiEdit2 className="text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteCommercialRow(row.id)}
                                className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commercial Summary Banner */}
              <div className="mt-4 p-3 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between text-xs text-purple-900">
                <div className="flex items-center gap-2 font-bold">
                  <FaStore className="text-purple-600 text-sm" />
                  <span>Commercial Summary</span>
                </div>
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <span className="block text-[10px] text-purple-600 font-medium">Total Commercial Units</span>
                    <span className="font-extrabold text-sm text-gray-900">{commercialTotals.totalCommercialUnits}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-purple-600 font-medium">Total Commercial Area (sq.ft.)</span>
                    <span className="font-extrabold text-sm text-gray-900">
                      {formatIndianNumber(commercialTotals.totalCommercialArea)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Parking Configuration & Inventory Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 4. Parking Configuration */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  <span className="text-[#EA580C]">4.</span> Parking Configuration
                </h2>
                <p className="text-xs text-gray-500 mb-5">Define overall parking capacity.</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Four-Wheeler Parking
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={parkingConfig.fourWheeler || ''}
                        onChange={(e) => handleParkingChange('fourWheeler', e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C]"
                      />
                      <FaCar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Two-Wheeler Parking
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={parkingConfig.twoWheeler || ''}
                        onChange={(e) => handleParkingChange('twoWheeler', e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C]"
                      />
                      <FaMotorcycle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Visitor Parking
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={parkingConfig.visitor || ''}
                        onChange={(e) => handleParkingChange('visitor', e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C]"
                      />
                      <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      EV Charging Spaces
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={parkingConfig.evCharging || ''}
                        onChange={(e) => handleParkingChange('evCharging', e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#EA580C]"
                      />
                      <FiZap className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Parking Allocation Method
                    </label>
                    <select
                      value={parkingConfig.allocationMethod || 'By Society'}
                      onChange={(e) => handleParkingChange('allocationMethod', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C]"
                    >
                      {PARKING_ALLOCATION_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Total Parking Banner */}
              <div className="mt-4 p-4 bg-orange-50/60 border border-orange-100 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                  <FaCar className="text-lg" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Total Parking Capacity</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-gray-900">{parkingTotals.totalCapacity}</span>
                    <span className="text-xs text-gray-500">(4W + 2W + Visitor + EV)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Inventory Summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  <span className="text-[#EA580C]">5.</span> Inventory Summary
                </h2>
                <p className="text-xs text-gray-500 mb-5">Overall summary of your property inventory.</p>

                {/* 4 Stat Cards Row 1 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FaBuilding className="text-emerald-600 text-xs" />
                      <span className="text-[10px] text-emerald-800 font-bold truncate">Residential Units</span>
                    </div>
                    <span className="text-lg font-black text-gray-900 block">{residentialTotals.totalUnits}</span>
                    <span className="text-[10px] text-gray-500">Across {residentialTotals.totalWings} Wings / Blocks</span>
                  </div>

                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FaStore className="text-purple-600 text-xs" />
                      <span className="text-[10px] text-purple-800 font-bold truncate">Commercial Units</span>
                    </div>
                    <span className="text-lg font-black text-gray-900 block">{commercialTotals.totalCommercialUnits}</span>
                    <span className="text-[10px] text-gray-500">Across 1 Block</span>
                  </div>

                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FaBuilding className="text-blue-600 text-xs" />
                      <span className="text-[10px] text-blue-800 font-bold truncate">Total Units</span>
                    </div>
                    <span className="text-lg font-black text-gray-900 block">{overallInventory.totalUnits}</span>
                    <span className="text-[10px] text-gray-500">Residential + Commercial</span>
                  </div>

                  <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FaCar className="text-[#EA580C] text-xs" />
                      <span className="text-[10px] text-orange-800 font-bold truncate">Total Parking</span>
                    </div>
                    <span className="text-lg font-black text-gray-900 block">{parkingTotals.totalCapacity}</span>
                    <span className="text-[10px] text-gray-500">(4W + 2W + Visitor + EV)</span>
                  </div>
                </div>

                {/* 4 Stat Cards Row 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl">
                    <span className="text-[10px] text-blue-700 font-semibold block">Total Residential Area</span>
                    <span className="text-xs font-bold text-gray-900 block">
                      {formatIndianNumber(residentialTotals.totalCarpetArea)} sq.ft.
                    </span>
                    <span className="text-[10px] text-gray-400">(Carpet Area)</span>
                  </div>

                  <div className="p-3 bg-purple-50/30 border border-purple-100 rounded-xl">
                    <span className="text-[10px] text-purple-700 font-semibold block">Total Commercial Area</span>
                    <span className="text-xs font-bold text-gray-900 block">
                      {formatIndianNumber(commercialTotals.totalCommercialArea)} sq.ft.
                    </span>
                    <span className="text-[10px] text-gray-400">(Total Area)</span>
                  </div>

                  <div className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] text-emerald-700 font-semibold block">Total Developed Area</span>
                    <span className="text-xs font-bold text-gray-900 block">
                      {formatIndianNumber(propertyInfo.totalDevelopedArea || 980000)} sq.ft.
                    </span>
                  </div>

                  <div className="p-3 bg-orange-50/30 border border-orange-100 rounded-xl">
                    <span className="text-[10px] text-orange-700 font-semibold block">Total Project Area</span>
                    <span className="text-xs font-bold text-gray-900 block">
                      {formatIndianNumber(propertyInfo.totalProjectArea || 1350000)} sq.ft.
                    </span>
                  </div>
                </div>
              </div>

              {/* Units notice */}
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2 text-[11px] text-gray-500">
                <FiInfo className="text-gray-400 shrink-0" />
                <span>Units will be generated from this configuration in the next step. You can review and edit the generated unit list before activation.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Info Column (1 Column) */}
        <div className="xl:col-span-1">
          <StepInfoCard
            title="About this step"
            description="Define the complete inventory of your society including residential, commercial, parking and other resources. Units will be generated from this configuration."
            items={[
              'Add all residential wings (e.g. A Wing, B Wing) and their unit distribution.',
              'Add commercial shops, offices, or showrooms.',
              'Define dedicated parking spaces for four-wheelers, two-wheelers, visitors, and EVs.',
            ]}
            tipsTitle="Inventory Tips"
            tips={[
              'Accurate carpet and built-up areas help calculate maintenance charges correctly.',
              'Parking slot allocations can be mapped to individual flats after activation.',
              'You can add more wings or units at any time from Society Settings.',
            ]}
            illustration="building"
          />
        </div>
      </div>

      {/* Modals */}
      <ResidentialModal
        isOpen={residentialModalOpen}
        onClose={() => setResidentialModalOpen(false)}
        editData={editingResidential}
        onSave={(data) => {
          if (editingResidential) {
            updateResidentialRow(editingResidential.id, data);
            toast.success('Residential configuration updated');
          } else {
            addResidentialRow(data);
            toast.success('Residential configuration added');
          }
        }}
      />

      <CommercialModal
        isOpen={commercialModalOpen}
        onClose={() => setCommercialModalOpen(false)}
        editData={editingCommercial}
        onSave={(data) => {
          if (editingCommercial) {
            updateCommercialRow(editingCommercial.id, data);
            toast.success('Commercial configuration updated');
          } else {
            addCommercialRow(data);
            toast.success('Commercial configuration added');
          }
        }}
      />
    </div>
  );
};

export default Step2PropertyInventory;
