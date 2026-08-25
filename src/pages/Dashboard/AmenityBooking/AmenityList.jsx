import React, { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '../../../context/PermissionsContext';
import { PERMISSION_LEVELS } from '../../../utils/permissions';
import { amenityService } from '../../../services/amenityBookingService';
import { FaPlus, FaCalendarPlus, FaCog, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import AmenityModal from './AmenityModal';
import SlotManagerModal from './SlotManagerModal';
import BookingModal from './BookingModal';

const MODULE_ID = 'amenity_booking';

const ImageCarousel = ({ images, fallbackText, status }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="h-36 relative overflow-hidden group">
      {(!images || images.length === 0) ? (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <span className="text-5xl font-black text-white/20 uppercase tracking-widest select-none group-hover:scale-110 transition-transform duration-300">
            {fallbackText}
          </span>
        </div>
      ) : (
        <div className="w-full h-full relative bg-gray-100">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Amenity"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            />
          ))}
          {/* Subtle gradient overlay to make the status badge pop if placed over an image */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-0 pointer-events-none" />
        </div>
      )}
      
      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide z-10 shadow-sm ${
        status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {status}
      </span>
    </div>
  );
};

const AmenityList = () => {
  const { hasModuleAccess } = usePermissions();
  const canManage = hasModuleAccess(MODULE_ID, PERMISSION_LEVELS.FULL);
  const canBook   = hasModuleAccess(MODULE_ID, PERMISSION_LEVELS.MANAGE);

  const [amenities, setAmenities]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [amenityModal, setAmenityModal]     = useState({ open: false, amenity: null });
  const [slotModal, setSlotModal]           = useState({ open: false, amenity: null });
  const [bookingModal, setBookingModal]     = useState({ open: false, amenity: null });

  const fetchAmenities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await amenityService.getAmenities();
      if (res.success) setAmenities(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load amenities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAmenities(); }, [fetchAmenities]);

  const closeAmenityModal = (refresh = false) => {
    setAmenityModal({ open: false, amenity: null });
    if (refresh) fetchAmenities();
  };

  const closeSlotModal = () => setSlotModal({ open: false, amenity: null });
  const closeBookingModal = () => setBookingModal({ open: false, amenity: null });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Society Amenities</h3>
        {canManage && (
          <button
            id="btn-add-amenity"
            onClick={() => setAmenityModal({ open: true, amenity: null })}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-sm font-medium text-sm"
          >
            <FaPlus />
            Add Amenity
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : amenities.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <FaCalendarPlus className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No amenities configured yet.</p>
          {canManage && <p className="text-sm text-gray-400 mt-1">Click "Add Amenity" to get started.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {amenities.map(amenity => (
            <div key={amenity._id} className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group">
              {/* Card Header (Image Slider or Placeholder) */}
              <ImageCarousel 
                images={amenity.images} 
                fallbackText={amenity.name.substring(0, 3)} 
                status={amenity.status} 
              />

              {/* Card Body */}
              <div className="p-5">
                <h4 className="text-base font-bold text-gray-900 mb-1">{amenity.name}</h4>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">
                  {amenity.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-y-1.5 mb-5 text-xs">
                  <span className="text-gray-400">Capacity</span>
                  <span className="text-gray-700 font-medium text-right">{amenity.capacity ?? 'N/A'}</span>
                  <span className="text-gray-400">Requires Approval</span>
                  <span className={`text-right font-medium ${amenity.requiresApproval ? 'text-amber-600' : 'text-green-600'}`}>
                    {amenity.requiresApproval ? 'Yes' : 'No'}
                  </span>
                  <span className="text-gray-400">Advance Limit</span>
                  <span className="text-gray-700 font-medium text-right">{amenity.advanceBookingLimit} days</span>
                  <span className="text-gray-400">Cancel Window</span>
                  <span className="text-gray-700 font-medium text-right">{amenity.cancellationWindow}h before</span>
                </div>

                <div className="flex gap-2 border-t border-gray-100 pt-4">
                  {amenity.status === 'ACTIVE' && canBook && (
                    <button
                      id={`btn-book-${amenity._id}`}
                      onClick={() => setBookingModal({ open: true, amenity })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-100 transition-colors"
                    >
                      <FaCalendarPlus /> Book Slot
                    </button>
                  )}
                  {canManage && (
                    <>
                      <button
                        id={`btn-slots-${amenity._id}`}
                        onClick={() => setSlotModal({ open: true, amenity })}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        title="Manage Slots"
                      >
                        Slots
                      </button>
                      <button
                        id={`btn-edit-${amenity._id}`}
                        onClick={() => setAmenityModal({ open: true, amenity })}
                        className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Edit Amenity"
                      >
                        <FaCog className="text-xs" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {amenityModal.open && (
        <AmenityModal amenity={amenityModal.amenity} onClose={closeAmenityModal} />
      )}
      {slotModal.open && (
        <SlotManagerModal amenity={slotModal.amenity} onClose={closeSlotModal} />
      )}
      {bookingModal.open && (
        <BookingModal amenity={bookingModal.amenity} onClose={closeBookingModal} />
      )}
    </div>
  );
};

export default AmenityList;
