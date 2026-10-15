import React, { useState, useMemo } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiGrid,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  FaSwimmer,
  FaDumbbell,
  FaTableTennis,
  FaSpa,
  FaStore,
  FaMedkit,
  FaRunning,
} from 'react-icons/fa';
import { MdOutlineSportsTennis, MdOutlineSportsBasketball } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { useSetupWizard } from '../hooks/useSetupWizard';
import { AMENITY_CATEGORIES } from '../constants/setupConstants';
import StepInfoCard from '../components/StepInfoCard';
import AmenityModal from '../components/modals/AmenityModal';
import AmenityCategoriesModal from '../components/modals/AmenityCategoriesModal';

// Helper to render distinct amenity icons
const renderAmenityIcon = (name = '', category = '') => {
  const n = name.toLowerCase();
  if (n.includes('pool') || n.includes('swim')) return <FaSwimmer className="text-blue-500" />;
  if (n.includes('gym') || n.includes('fitness')) return <FaDumbbell className="text-purple-500" />;
  if (n.includes('tennis')) return <MdOutlineSportsTennis className="text-emerald-500" />;
  if (n.includes('badminton')) return <MdOutlineSportsTennis className="text-purple-500" />;
  if (n.includes('basketball')) return <MdOutlineSportsBasketball className="text-orange-500" />;
  if (n.includes('yoga') || n.includes('meditation') || n.includes('spa')) return <FaSpa className="text-amber-500" />;
  if (n.includes('mart') || n.includes('store')) return <FaStore className="text-teal-500" />;
  if (n.includes('first aid') || n.includes('medical') || n.includes('clinic')) return <FaMedkit className="text-red-500" />;
  if (n.includes('track') || n.includes('jogging')) return <FaRunning className="text-emerald-500" />;
  return <FaTableTennis className="text-blue-500" />;
};

const Step3Amenities = () => {
  const {
    amenities,
    addAmenity,
    updateAmenity,
    deleteAmenity,
    amenityStats,
    validationErrors,
  } = useSetupWizard();

  // Filter & Pagination state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [amenityModalOpen, setAmenityModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  // Filtered amenities
  const filteredAmenities = useMemo(() => {
    if (selectedCategory === 'All') return amenities;
    return amenities.filter((a) => a.category === selectedCategory);
  }, [amenities, selectedCategory]);

  // Paginated amenities
  const totalItems = filteredAmenities.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAmenities = filteredAmenities.slice(startIndex, startIndex + pageSize);

  const handleCategoryTab = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register Society</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up your society, property inventory, amenities and important contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Column (3 Cols) */}
        <div className="xl:col-span-3 space-y-6">

          {/* Top Section Header with Action Buttons */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">Amenities Configuration</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure the amenities available in your society. These will be used for bookings, maintenance and access management.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setCategoriesModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors"
                >
                  <FiGrid className="text-gray-500 text-sm" />
                  <span>Amenity Categories</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingAmenity(null);
                    setAmenityModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <FiPlus className="text-sm stroke-[3]" />
                  <span>Add New Amenity</span>
                </button>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {/* Card 1: Total Amenities */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FiCalendar className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Total Amenities</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{amenityStats.total}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">{amenityStats.active} Active</span>
                </div>
              </div>

              {/* Card 2: Bookable */}
              <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Bookable Amenities</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{amenityStats.bookable}</span>
                  <span className="text-[10px] text-blue-600 font-medium">Require Booking</span>
                </div>
              </div>

              {/* Card 3: Chargeable */}
              <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <FiClock className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Chargeable Amenities</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{amenityStats.chargeable}</span>
                  <span className="text-[10px] text-purple-600 font-medium">Charges Applicable</span>
                </div>
              </div>

              {/* Card 4: Under Maintenance */}
              <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                  <FiAlertCircle className="text-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 block leading-tight">Under Maintenance</span>
                  <span className="text-xl font-extrabold text-gray-900 block">{amenityStats.underMaintenance}</span>
                  <span className="text-[10px] text-[#EA580C] font-medium">Temporarily Unavailable</span>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100 mb-4">
              <button
                type="button"
                onClick={() => handleCategoryTab('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'All'
                    ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>All Amenities</span>
                <span className="text-[10px] opacity-80">{amenities.length}</span>
              </button>

              {AMENITY_CATEGORIES.map((cat) => {
                const count = amenityStats.categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryTab(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-orange-50 text-[#EA580C] border border-orange-200 font-bold'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>

            {validationErrors.amenities && (
              <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded-lg">
                {validationErrors.amenities}
              </p>
            )}

            {/* Amenities Table */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold bg-gray-50/50">
                    <th className="py-3 px-3">Amenity Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3 text-center">Bookable</th>
                    <th className="py-3 px-3 text-center">Charges Applicable</th>
                    <th className="py-3 px-3">Operating Hours</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedAmenities.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Name + Subtitle + Icon */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            {renderAmenityIcon(row.name, row.category)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{row.name}</span>
                            <span className="text-[11px] text-gray-400 block truncate max-w-[200px]">
                              {row.description || 'Community facility'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50/80 text-blue-700 font-medium text-[11px] border border-blue-100">
                          {row.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-gray-600 font-medium">{row.location}</td>

                      {/* Bookable */}
                      <td className="py-3 px-3 text-center">
                        {row.bookable ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <FiCheckCircle className="text-sm stroke-[2.5]" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[11px]">
                            <FiX className="text-sm stroke-[2.5]" />
                            <span>No</span>
                          </span>
                        )}
                      </td>

                      {/* Charges Applicable */}
                      <td className="py-3 px-3 text-center">
                        {row.chargesApplicable ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <FiCheckCircle className="text-sm stroke-[2.5]" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[11px]">
                            <FiX className="text-sm stroke-[2.5]" />
                            <span>No</span>
                          </span>
                        )}
                      </td>

                      {/* Operating Hours */}
                      <td className="py-3 px-3 text-gray-600">{row.operatingHours}</td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-block ${
                            row.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : row.status === 'Under Maintenance'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAmenity(row);
                              setAmenityModalOpen(true);
                            }}
                            className="p-1 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <FiEdit2 className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteAmenity(row.id);
                              toast.success('Amenity removed');
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

            {/* Table Footer with Pagination matching Screenshot 2 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-4 text-xs text-gray-500">
              <div>
                Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} amenities
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <FiChevronLeft className="text-sm" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'border border-[#EA580C] text-[#EA580C] bg-orange-50/50'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <FiChevronRight className="text-sm" />
                </button>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="ml-2 px-2.5 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                </select>
              </div>
            </div>

          </div>

        </div>

        {/* Right Info Column (1 Col) */}
        <div className="xl:col-span-1">
          <StepInfoCard
            title="Amenity Guidelines"
            items={[
              'Add all the amenities available in your society.',
              'You can set booking, charges, timings and availability.',
              'These amenities will be visible to residents and used for bookings and operations.',
            ]}
            tipsTitle="Quick Tips"
            tips={[
              "Use 'Amenity Categories' to organize amenities better.",
              'Mark amenities as bookable if residents need to reserve.',
              'Enable charges if society collects fees for the amenity.',
              'Keep operating hours updated for accurate access control.',
            ]}
            illustration="amenity"
          />
        </div>
      </div>

      {/* Modals */}
      <AmenityModal
        isOpen={amenityModalOpen}
        onClose={() => setAmenityModalOpen(false)}
        editData={editingAmenity}
        onSave={(data) => {
          if (editingAmenity) {
            updateAmenity(editingAmenity.id, data);
            toast.success('Amenity updated successfully');
          } else {
            addAmenity(data);
            toast.success('New amenity added');
          }
        }}
      />

      <AmenityCategoriesModal
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
      />
    </div>
  );
};

export default Step3Amenities;
