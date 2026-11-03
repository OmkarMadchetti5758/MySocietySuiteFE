import React from 'react';
import {
  FiCheckCircle,
  FiEdit2,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiClock,
  FiAlertCircle,
  FiAlertTriangle,
  FiPhone,
} from 'react-icons/fi';
import {
  FaBuilding,
  FaStore,
  FaCar,
  FaMotorcycle,
  FaShieldAlt,
  FaCheck,
} from 'react-icons/fa';
import { useSetupWizard } from '../hooks/useSetupWizard';
import { formatIndianNumber, formatDisplayDate } from '../utils/calculations';
import { BuildingIllustration } from '../components/SetupIllustrations';

const Step6ReviewActivate = () => {
  const {
    societyDetails,
    propertyInfo,
    residentialInventory,
    commercialInventory,
    parkingConfig,
    amenities,
    contacts,
    documents,
    residentialTotals,
    commercialTotals,
    parkingTotals,
    overallInventory,
    amenityStats,
    contactStats,
    documentStats,
    goToStep,
  } = useSetupWizard();

  const keyAmenities = amenities.slice(0, 5);
  const remainingAmenitiesCount = Math.max(0, amenities.length - 5);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register Society</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review all the information you've added. Once you activate, units will be generated from this configuration.
        </p>
      </div>

      {/* Top Green Completion Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <FiCheckCircle className="text-emerald-600 text-lg stroke-[2.5]" />
        </div>
        <p className="text-xs sm:text-sm font-semibold">
          Great! You have completed all the required steps. Please review the details below before activating your society.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Column (3 Cols) */}
        <div className="xl:col-span-3 space-y-6">

          {/* 1. Society Details Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-gray-900">1. Society Details</h2>
              </div>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Society Name</span>
                <span className="font-bold text-gray-900">{societyDetails.societyName || 'Green Valley Residency'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Society Type</span>
                <span className="font-semibold text-gray-800">{societyDetails.societyType || 'Mixed (Residential + Commercial)'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Registration No.</span>
                <span className="font-semibold text-gray-800">{societyDetails.registrationNumber || 'GVR/2025/001'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Society Registration Date</span>
                <span className="font-semibold text-gray-800">{formatDisplayDate(societyDetails.registrationDate || '2025-04-01')}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Society Code / ID</span>
                <span className="font-semibold text-gray-800">{societyDetails.societyCode || 'GVR-2025-0001'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Status</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px] inline-block">
                  Setup / Pending
                </span>
              </div>
            </div>
          </div>

          {/* 2. Property / Project Information Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h2 className="text-sm font-bold text-gray-900">2. Property / Project Information</h2>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs mb-4">
              <div>
                <span className="text-gray-400 block mb-0.5">Project / Property Name</span>
                <span className="font-bold text-gray-900">{propertyInfo.projectName || 'Green Valley Residency'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-400 block mb-0.5">Developer / Builder</span>
                <span className="font-semibold text-gray-800">{propertyInfo.developerName || 'Green Valley Developers Pvt. Ltd.'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Project Start Date</span>
                <span className="font-semibold text-gray-800">{formatDisplayDate(propertyInfo.projectStartDate || '2022-01-01')}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Expected Completion Date</span>
                <span className="font-semibold text-gray-800">{formatDisplayDate(propertyInfo.expectedCompletionDate || '2024-12-31')}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Actual Completion Date</span>
                <span className="font-semibold text-gray-800">{formatDisplayDate(propertyInfo.actualCompletionDate || '2025-03-15')}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Possession Start Date</span>
                <span className="font-semibold text-gray-800">{formatDisplayDate(propertyInfo.possessionStartDate || '2025-04-01')}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Total Project Area</span>
                <span className="font-bold text-gray-900">{formatIndianNumber(propertyInfo.totalProjectArea || 1350000)} sq.ft.</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Total Developed Area</span>
                <span className="font-bold text-gray-900">{formatIndianNumber(propertyInfo.totalDevelopedArea || 980000)} sq.ft.</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">No. of Buildings / Wings / Blocks</span>
                <span className="font-bold text-gray-900">{overallInventory.numberOfBuildings}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Property Type</span>
                <span className="font-semibold text-gray-800">{propertyInfo.propertyType || 'Mixed'}</span>
              </div>
            </div>
          </div>

          {/* Residential Inventory Summary Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-gray-900">Residential Inventory Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit</span>
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6 mb-4">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold bg-gray-50/50">
                    <th className="py-2 px-3">Wing / Block</th>
                    <th className="py-2 px-3">Property Type</th>
                    <th className="py-2 px-3">Configurations</th>
                    <th className="py-2 px-3 text-center">Floors</th>
                    <th className="py-2 px-3 text-center">Flats / Floor</th>
                    <th className="py-2 px-3 text-center">Unit Count</th>
                    <th className="py-2 px-3 text-right">Area / Unit (sq.ft.)</th>
                    <th className="py-2 px-3 text-center">Total Parking (4W)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {residentialInventory.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2 px-3 font-semibold text-gray-900">{row.wing}</td>
                      <td className="py-2 px-3 text-gray-600">{row.propertyType}</td>
                      <td className="py-2 px-3 font-medium text-gray-800">{row.configuration}</td>
                      <td className="py-2 px-3 text-center text-gray-700">{row.totalFloors || '—'}</td>
                      <td className="py-2 px-3 text-center text-gray-700">{row.unitsPerFloor || '—'}</td>
                      <td className="py-2 px-3 text-center font-bold text-gray-900">{row.unitCount}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{row.carpetArea}</td>
                      <td className="py-2 px-3 text-center font-semibold text-gray-800">{row.parking4W}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Green footer bar */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2 font-bold">
                <FaShieldAlt className="text-emerald-600 text-sm" />
                <span>Residential Total</span>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div>
                  <span className="block text-[10px] text-emerald-600">Total Wings / Blocks</span>
                  <span className="font-extrabold text-sm text-gray-900">{residentialTotals.totalWings}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-emerald-600">Total Residential Units</span>
                  <span className="font-extrabold text-sm text-gray-900">{residentialTotals.totalUnits}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-emerald-600">1 BHK Units</span>
                  <span className="font-extrabold text-sm text-gray-900">{residentialTotals.oneBhkUnits}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-emerald-600">Other Units</span>
                  <span className="font-extrabold text-sm text-gray-900">{residentialTotals.otherUnits}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-emerald-600">Total Parking (4W)</span>
                  <span className="font-extrabold text-sm text-gray-900">{residentialTotals.totalParking4W}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Inventory Summary Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <h2 className="text-sm font-bold text-gray-900">Commercial Inventory Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit</span>
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6 mb-4">
              <table className="w-full text-left text-xs border-collapse min-w-[450px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold bg-gray-50/50">
                    <th className="py-2 px-3">Block</th>
                    <th className="py-2 px-3">Commercial Type</th>
                    <th className="py-2 px-3 text-right">Unit Size (sq.ft.)</th>
                    <th className="py-2 px-3 text-center">Unit Count</th>
                    <th className="py-2 px-3 text-center">Parking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commercialInventory.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2 px-3 font-semibold text-gray-900">{row.block}</td>
                      <td className="py-2 px-3 text-gray-700">{row.commercialType}</td>
                      <td className="py-2 px-3 text-right text-gray-700">{formatIndianNumber(row.unitSize)}</td>
                      <td className="py-2 px-3 text-center font-bold text-gray-900">{row.unitCount}</td>
                      <td className="py-2 px-3 text-center font-semibold text-gray-800">{row.parking}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Purple footer bar */}
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between text-xs text-purple-900">
              <div className="flex items-center gap-2 font-bold">
                <FaStore className="text-purple-600 text-sm" />
                <span>Commercial Total</span>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="block text-[10px] text-purple-600">Total Commercial Units</span>
                  <span className="font-extrabold text-sm text-gray-900">{commercialTotals.totalCommercialUnits}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-purple-600">Total Commercial Area (sq.ft.)</span>
                  <span className="font-extrabold text-sm text-gray-900">
                    {formatIndianNumber(commercialTotals.totalCommercialArea)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Summary Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-gray-900">Amenities Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit</span>
              </button>
            </div>

            {/* 4 Mini Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Total Amenities</span>
                <span className="text-lg font-bold text-gray-900">{amenityStats.total}</span>
                <span className="text-[10px] text-emerald-600 block">{amenityStats.active} Active</span>
              </div>
              <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Bookable Amenities</span>
                <span className="text-lg font-bold text-gray-900">{amenityStats.bookable}</span>
                <span className="text-[10px] text-blue-600 block">Require Booking</span>
              </div>
              <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Chargeable Amenities</span>
                <span className="text-lg font-bold text-gray-900">{amenityStats.chargeable}</span>
                <span className="text-[10px] text-purple-600 block">Charges Applicable</span>
              </div>
              <div className="p-3 bg-orange-50/40 border border-orange-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Under Maintenance</span>
                <span className="text-lg font-bold text-gray-900">{amenityStats.underMaintenance}</span>
                <span className="text-[10px] text-[#EA580C] block">Temporarily Unavailable</span>
              </div>
            </div>

            {/* Key Amenities Included */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-2">Key Amenities Included:</span>
              <div className="flex flex-wrap gap-2">
                {keyAmenities.map((am) => (
                  <span
                    key={am.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                    <span>{am.name}</span>
                  </span>
                ))}
                {remainingAmenitiesCount > 0 && (
                  <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-[#EA580C] border border-orange-200 rounded-full text-xs font-bold">
                    + {remainingAmenitiesCount} More
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contacts Summary Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <h2 className="text-sm font-bold text-gray-900">Contacts Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Total Contacts</span>
                <span className="text-lg font-bold text-gray-900">{contactStats.total}</span>
                <span className="text-[10px] text-blue-600 block">Active Contacts</span>
              </div>
              <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Essential Contacts</span>
                <span className="text-lg font-bold text-gray-900">{contactStats.essential}</span>
                <span className="text-[10px] text-emerald-600 block">For Operations</span>
              </div>
              <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Emergency Contacts</span>
                <span className="text-lg font-bold text-gray-900">{contactStats.emergency}</span>
                <span className="text-[10px] text-purple-600 block">24 x 7 Available</span>
              </div>
              <div className="p-3 bg-orange-50/40 border border-orange-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Service Providers</span>
                <span className="text-lg font-bold text-gray-900">{contactStats.serviceProviders}</span>
                <span className="text-[10px] text-[#EA580C] block">Maintenance & Services</span>
              </div>
            </div>
          </div>

          {/* Documents Summary Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <h2 className="text-sm font-bold text-gray-900">Documents Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => goToStep(5)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Total Documents</span>
                <span className="text-lg font-bold text-gray-900">{documentStats.total}</span>
                <span className="text-[10px] text-blue-600 block">All Documents</span>
              </div>
              <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Verified Documents</span>
                <span className="text-lg font-bold text-gray-900">{documentStats.verified}</span>
                <span className="text-[10px] text-emerald-600 block">Approved</span>
              </div>
              <div className="p-3 bg-orange-50/40 border border-orange-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Expiring Soon</span>
                <span className="text-lg font-bold text-gray-900">{documentStats.expiringSoon}</span>
                <span className="text-[10px] text-[#EA580C] block">Within 60 Days</span>
              </div>
              <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl">
                <span className="text-[10px] text-gray-400 block">Expired Documents</span>
                <span className="text-lg font-bold text-gray-900">{documentStats.expired}</span>
                <span className="text-[10px] text-red-600 block">Require Attention</span>
              </div>
            </div>
          </div>

          {/* Parking Configuration Summary Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h2 className="text-sm font-bold text-gray-900">Parking Configuration Summary</h2>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <FiEdit2 className="text-xs" />
                <span>Edit</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs flex-1">
                <div>
                  <span className="text-gray-400 block mb-0.5">Four-Wheeler</span>
                  <span className="font-extrabold text-gray-900 text-sm">{parkingConfig.fourWheeler || 167}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Two-Wheeler</span>
                  <span className="font-extrabold text-gray-900 text-sm">{parkingConfig.twoWheeler || 250}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Visitor Parking</span>
                  <span className="font-extrabold text-gray-900 text-sm">{parkingConfig.visitor || 40}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">EV Charging Spaces</span>
                  <span className="font-extrabold text-gray-900 text-sm">{parkingConfig.evCharging || 10}</span>
                </div>
              </div>

              {/* Orange box right */}
              <div className="p-3.5 bg-orange-50/70 border border-orange-100 rounded-xl text-center sm:min-w-[190px]">
                <span className="text-[11px] text-gray-500 font-medium block">Total Parking Capacity</span>
                <span className="text-xl font-black text-gray-900 block leading-tight">
                  {parkingTotals.totalCapacity}
                </span>
                <span className="text-[10px] text-gray-400">(4W + 2W + Visitor + EV)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Info Column (1 Col) matching Screenshot 5 */}
        <div className="xl:col-span-1 space-y-5">
          {/* 1. Property Overview Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Property Overview</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Units (Residential)</span>
                <span className="font-bold text-gray-900">{residentialTotals.totalUnits}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Units (Commercial)</span>
                <span className="font-bold text-gray-900">{commercialTotals.totalCommercialUnits}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="font-bold text-gray-800">Total Units (Overall)</span>
                <span className="font-extrabold text-gray-900">{overallInventory.totalUnits}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="text-gray-500">Total Project Area</span>
                <span className="font-bold text-gray-900">{formatIndianNumber(propertyInfo.totalProjectArea || 1350000)} sq.ft.</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Developed Area</span>
                <span className="font-bold text-gray-900">{formatIndianNumber(propertyInfo.totalDevelopedArea || 980000)} sq.ft.</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Residential Area</span>
                <span className="font-bold text-gray-900">{formatIndianNumber(residentialTotals.totalCarpetArea)} sq.ft.</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Commercial Area</span>
                <span className="font-bold text-gray-900">{formatIndianNumber(commercialTotals.totalCommercialArea)} sq.ft.</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="font-bold text-gray-800">Total Parking Spaces</span>
                <span className="font-extrabold text-gray-900">{parkingTotals.totalCapacity}</span>
              </div>
            </div>
          </div>

          {/* 2. What Happens Next? Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-3">What Happens Next?</h3>
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <FaCheck className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                <span>After activation, the system will generate individual units based on your inventory configuration.</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheck className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                <span>You can review, edit and manage the generated units before registration.</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheck className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                <span>You can update any information later from Society Settings.</span>
              </li>
            </ul>

            <BuildingIllustration />
          </div>

          {/* 3. Important Note Card */}
          <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-orange-900">
              <FiAlertTriangle className="text-[#EA580C] text-sm" />
              <span>Important Note</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Please ensure all information is correct before activation. Some details will be used in billing, access management and compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6ReviewActivate;
