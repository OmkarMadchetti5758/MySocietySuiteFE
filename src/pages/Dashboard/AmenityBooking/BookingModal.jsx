import React, { useState, useEffect, useCallback, useRef } from 'react';
import { amenityService, bookingService } from '../../../services/amenityBookingService';
import { FaTimes, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookingModal = ({ amenity, onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + (amenity.advanceBookingLimit || 30));
    return d.toISOString().split('T')[0];
  })();

  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [availError, setAvailError] = useState('');
  const bookingInFlight = useRef(false); // prevents double-click

  const fetchAvailability = useCallback(async (d) => {
    setLoading(true);
    setAvailError('');
    setSlots([]);
    setSelectedSlot(null);
    try {
      const res = await amenityService.checkAvailability(amenity._id, d);
      if (res.success) {
        setSlots(res.data.slots || []);
        if ((res.data.slots || []).length === 0) {
          setAvailError('No slots configured for this day.');
        }
      }
    } catch (err) {
      setAvailError(err.response?.data?.message || 'Could not load availability. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [amenity._id]);

  useEffect(() => {
    if (date) fetchAvailability(date);
  }, [date, fetchAvailability]);

  const handleBook = async () => {
    if (!selectedSlot || !date || bookingInFlight.current) return;
    bookingInFlight.current = true;
    setBooking(true);

    // Generate idempotency key: unique per user+amenity+slot+date session
    const idempotencyKey = `book-${amenity._id}-${selectedSlot}-${date}-${Date.now()}`;

    try {
      const res = await bookingService.createBooking(
        { amenityId: amenity._id, slotId: selectedSlot, date },
        idempotencyKey
      );
      if (res.success) {
        const isPending = res.data?.status === 'pending';
        toast.success(
          isPending
            ? 'Booking request submitted! Waiting for admin approval.'
            : 'Slot booked successfully!'
        );
        onClose();
      }
    } catch (err) {
      const code = err.response?.data?.errorCode;
      if (code === 'SLOT_ALREADY_BOOKED') {
        toast.error('This slot was just booked by someone else. Please select another slot.');
        // Refresh availability so user sees updated state
        await fetchAvailability(date);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create booking');
      }
    } finally {
      setBooking(false);
      bookingInFlight.current = false;
    }
  };

  const available = slots.filter(s => s.isAvailable);
  const booked = slots.filter(s => !s.isAvailable);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-orange-50 to-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Book a Slot</h2>
            <p className="text-sm text-orange-600 font-medium mt-0.5">{amenity.name}</p>
            {amenity.requiresApproval && (
              <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mt-2 inline-block">
                ⚠️ Requires admin approval
              </p>
            )}
          </div>
          <button id="btn-close-booking" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/80 transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Date Picker */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <FaCalendarAlt className="text-orange-500" /> Select Date
            </label>
            <input
              id="input-booking-date"
              type="date"
              value={date}
              min={today}
              max={maxDate}
              onChange={e => setDate(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Up to {amenity.advanceBookingLimit} days in advance.
            </p>
          </div>

          {/* Slots */}
          {date && (
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <FaClock className="text-orange-500" /> Available Slots
              </label>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
                </div>
              ) : availError ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">{availError}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {available.length === 0 && booked.length > 0 && (
                    <div className="text-center py-4 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-sm text-red-500 font-medium">All slots are booked for this date.</p>
                    </div>
                  )}
                  {available.map(slot => (
                    <button
                      key={slot._id}
                      id={`slot-${slot._id}`}
                      onClick={() => setSelectedSlot(slot._id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all ${selectedSlot === slot._id
                          ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-sm ring-1 ring-orange-400'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/30'
                        }`}
                    >
                      <span>{slot.startTime} – {slot.endTime}</span>
                      {selectedSlot === slot._id && <FaCheckCircle className="text-orange-500" />}
                    </button>
                  ))}
                  {booked.map(slot => (
                    <div
                      key={slot._id}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
                    >
                      <span className="line-through">{slot.startTime} – {slot.endTime}</span>
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                        {slot.unavailableReason === 'SLOT_ALREADY_STARTED' ? 'Started' : 'Booked'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            id="btn-confirm-booking"
            onClick={handleBook}
            disabled={!selectedSlot || booking}
            className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {booking ? 'Booking...' : amenity.requiresApproval ? 'Request Booking' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
