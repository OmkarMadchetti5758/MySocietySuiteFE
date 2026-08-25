import React, { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '../../../context/PermissionsContext';
import { PERMISSION_LEVELS } from '../../../utils/permissions';
import { bookingService } from '../../../services/amenityBookingService';
import { FaCheckCircle, FaTimesCircle, FaBan, FaFilter, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/common/ConfirmModal';

const MODULE_ID = 'amenity_booking';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100  text-gray-600'  },
  rejected:  { label: 'Rejected',  cls: 'bg-red-100   text-red-800'   },
  completed: { label: 'Completed', cls: 'bg-blue-100  text-blue-800'  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const BookingList = () => {
  const { hasModuleAccess } = usePermissions();
  const canManageAll = hasModuleAccess(MODULE_ID, PERMISSION_LEVELS.FULL);

  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionId, setActionId]         = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [reasonModal, setReasonModal]   = useState({ open: false, type: '', bookingId: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ open: false, bookingId: null });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await bookingService.getBookings(params);
      if (res.success) setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleApproveSubmit = async () => {
    setActionId(approveModal.bookingId);
    try {
      await bookingService.approveBooking(approveModal.bookingId);
      toast.success('Booking approved');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionId(null);
      setApproveModal({ open: false, bookingId: null });
    }
  };

  const handleReasonSubmit = async () => {
    if (!reasonModal.reason.trim()) { toast.error('Reason is required'); return; }
    setActionId(reasonModal.bookingId);
    try {
      if (reasonModal.type === 'reject') {
        await bookingService.rejectBooking(reasonModal.bookingId, reasonModal.reason);
        toast.success('Booking rejected');
      } else {
        await bookingService.cancelBooking(reasonModal.bookingId, reasonModal.reason);
        toast.success('Booking cancelled');
      }
      setReasonModal({ open: false, type: '', bookingId: null, reason: '' });
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${reasonModal.type}`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          {canManageAll ? 'All Bookings' : 'My Bookings'}
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 text-sm" />
            <select
              id="filter-booking-status"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            id="btn-refresh-bookings"
            onClick={fetchBookings}
            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <FaBan className="mx-auto text-4xl text-gray-200 mb-3" />
          <p className="text-gray-500">No bookings found.</p>
          <p className="text-sm text-gray-400 mt-1">
            {filterStatus ? 'Try changing the filter.' : 'Bookings will appear here once created.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amenity</th>
                {canManageAll && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resident</th>}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Slot</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map(b => (
                <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-900">{b.amenityId?.name ?? '—'}</p>
                  </td>
                  {canManageAll && (
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-800">{b.bookedBy?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{b.bookedBy?.email}</p>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {b.slotId?.startTime} – {b.slotId?.endTime}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={b.status} />
                    {b.status === 'rejected' && b.rejectionReason && (
                      <p className="text-xs text-red-400 mt-1 max-w-[180px] truncate" title={b.rejectionReason}>
                        {b.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Admin: approve/reject pending */}
                      {canManageAll && b.status === 'pending' && (
                        <>
                          <button
                            id={`btn-approve-${b._id}`}
                            onClick={() => setApproveModal({ open: true, bookingId: b._id })}
                            disabled={actionId === b._id}
                            title="Approve"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            id={`btn-reject-${b._id}`}
                            onClick={() => setReasonModal({ open: true, type: 'reject', bookingId: b._id, reason: '' })}
                            disabled={actionId === b._id}
                            title="Reject"
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <FaTimesCircle />
                          </button>
                        </>
                      )}
                      {/* Cancel (resident own / admin) */}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          id={`btn-cancel-${b._id}`}
                          onClick={() => setReasonModal({ open: true, type: 'cancel', bookingId: b._id, reason: '' })}
                          disabled={actionId === b._id}
                          className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          {actionId === b._id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={approveModal.open}
        onClose={() => setApproveModal({ open: false, bookingId: null })}
        onConfirm={handleApproveSubmit}
        title="Approve Booking"
        message="Are you sure you want to approve this booking?"
        confirmText="Approve"
        type="success"
      />

      {/* Reason Modal (Reject/Cancel) */}
      {reasonModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-1">
              {reasonModal.type === 'reject' ? 'Reject Booking' : 'Cancel Booking'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {reasonModal.type === 'reject' 
                ? 'Provide a reason that will be shown to the resident.' 
                : 'Reason for cancellation (required):'}
            </p>
            <textarea
              id="input-reason"
              value={reasonModal.reason}
              onChange={e => setReasonModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder={reasonModal.type === 'reject' ? 'e.g. Party hall is reserved for society maintenance.' : 'e.g. Changed my mind.'}
              rows={3}
              className="w-full p-3 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReasonModal({ open: false, type: '', bookingId: null, reason: '' })}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-submit-reason"
                onClick={handleReasonSubmit}
                disabled={actionId !== null}
                className={`px-4 py-2 text-sm font-medium text-white rounded-xl disabled:opacity-40 transition-colors ${
                  reasonModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {actionId ? 'Processing...' : reasonModal.type === 'reject' ? 'Reject Booking' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
