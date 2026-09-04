import React from 'react';
import {
  FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaGlobe, FaBan, FaEdit, FaUserCircle, FaCheckCircle,
  FaFileAlt
} from 'react-icons/fa';

const STATUS_CONFIG = {
  DRAFT:     { label: 'Draft',     bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: FaFileAlt },
  PUBLISHED: { label: 'Published', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  icon: FaGlobe },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    icon: FaBan },
  COMPLETED: { label: 'Completed', bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   icon: FaCheckCircle },
};

const FestivalDetailsModal = ({ festival, isAdmin, onClose, onStatusAction, onEdit, actionLoading }) => {
  const statusCfg = STATUS_CONFIG[festival.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusCfg.icon;
  const isLoading = actionLoading === festival._id;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const formatDateTime = (d) => new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-50 shrink-0">
          {festival.image ? (
            <img
              src={festival.image}
              alt={festival.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaCalendarAlt className="text-6xl text-orange-200" />
            </div>
          )}
          {/* Status */}
          <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} shadow-sm`}>
            <StatusIcon className="text-[10px]" />
            {statusCfg.label}
          </span>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-600 p-2 rounded-full shadow-sm transition-colors backdrop-blur-sm"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">{festival.title}</h2>
            {festival.description && (
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{festival.description}</p>
            )}
          </div>

          {/* Event Info Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 bg-orange-50 rounded-2xl p-4">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <FaCalendarAlt className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Date</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDate(festival.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <FaClock className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Time</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">
                  {formatTime(festival.startTime)} – {formatTime(festival.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-green-50 rounded-2xl p-4">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <FaMapMarkerAlt className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Venue</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{festival.venue}</p>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
            {festival.createdBy && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FaUserCircle className="text-gray-300" />
                <span>Created by <span className="text-gray-600 font-medium">{festival.createdBy.name || 'Admin'}</span></span>
                <span>· {formatDateTime(festival.createdAt)}</span>
              </div>
            )}
            {festival.updatedBy && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FaUserCircle className="text-gray-300" />
                <span>Updated by <span className="text-gray-600 font-medium">{festival.updatedBy.name || 'Admin'}</span></span>
                <span>· {formatDateTime(festival.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {isAdmin && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-2 justify-end shrink-0 rounded-b-3xl">
            {/* Draft → Publish */}
            {festival.status === 'DRAFT' && (
              <button
                onClick={() => { onStatusAction(festival, 'publish'); onClose(); }}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaGlobe /> Publish Event
              </button>
            )}

            {/* Published → Unpublish or Cancel */}
            {festival.status === 'PUBLISHED' && (
              <>
                <button
                  onClick={() => { onStatusAction(festival, 'unpublish'); onClose(); }}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => { onStatusAction(festival, 'cancel'); onClose(); }}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FaBan /> Cancel Event
                </button>
              </>
            )}

            {/* Edit (DRAFT or PUBLISHED) */}
            {(festival.status === 'DRAFT' || festival.status === 'PUBLISHED') && (
              <button
                onClick={() => { onEdit(festival); onClose(); }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FestivalDetailsModal;
