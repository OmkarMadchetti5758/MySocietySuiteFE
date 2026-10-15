import React from 'react';
import { FiX, FiFolder, FiCheck } from 'react-icons/fi';
import { AMENITY_CATEGORIES } from '../../constants/setupConstants';
import { useSetupWizard } from '../../hooks/useSetupWizard';

const AmenityCategoriesModal = ({ isOpen, onClose }) => {
  const { amenityStats, amenities } = useSetupWizard();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <FiFolder className="text-[#EA580C] text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Amenity Categories</h3>
              <p className="text-xs text-gray-500">Categories used to group and filter society amenities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {AMENITY_CATEGORIES.map((cat) => {
            const count = amenityStats.categoryCounts[cat] || 0;
            const items = amenities.filter((a) => a.category === cat);

            return (
              <div
                key={cat}
                className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl hover:bg-orange-50/20 hover:border-orange-100 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-800">{cat}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                    {count} {count === 1 ? 'amenity' : 'amenities'}
                  </span>
                </div>
                {items.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {items.map((it) => (
                      <span
                        key={it.id}
                        className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md"
                      >
                        {it.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No amenities in this category yet</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FiCheck className="text-base" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmenityCategoriesModal;
