import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, UserX, CalendarOff, Clock, FileText, ChevronDown } from 'lucide-react';
import staffApi from '../../../services/staffApi';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  {
    key: 'present',
    label: 'Present',
    icon: Check,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    selectedBg: 'bg-emerald-500',
    selectedText: 'text-white',
    selectedBorder: 'border-emerald-500',
    dot: 'bg-emerald-500',
  },
  {
    key: 'absent',
    label: 'Absent',
    icon: UserX,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    selectedBg: 'bg-red-500',
    selectedText: 'text-white',
    selectedBorder: 'border-red-500',
    dot: 'bg-red-500',
  },
  {
    key: 'on-leave',
    label: 'On Leave',
    icon: CalendarOff,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    selectedBg: 'bg-amber-500',
    selectedText: 'text-white',
    selectedBorder: 'border-amber-500',
    dot: 'bg-amber-500',
  },
];

const getInitials = (name) => {
  if (!name) return 'S';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const AttendanceModal = ({ staff, date, currentStatus, onClose, onSaved }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || '');
  const [notes, setNotes] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Escape key closes modal
  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  const handleSave = async () => {
    if (!selectedStatus) {
      toast.error('Please select an attendance status');
      return;
    }
    try {
      setSaving(true);
      await staffApi.markAttendance({
        staffId: staff._id,
        date,
        status: selectedStatus,
        notes: notes.trim() || undefined,
        checkInTime: checkInTime || undefined,
        checkOutTime: checkOutTime || undefined,
      });
      toast.success(`Attendance marked as ${selectedStatus} for ${staff.name}`);
      onSaved(staff._id, selectedStatus);
      handleClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to mark attendance';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-md transition-all duration-200 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-gray-900">Mark Attendance</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Info */}
        <div className="px-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-lg font-bold shadow-md shrink-0">
              {getInitials(staff.name)}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">{staff.name}</div>
              <div className="text-sm text-gray-500 capitalize mt-0.5">
                {staff.designation?.replace(/_/g, ' ')}
              </div>
              {staff.shift && (
                <div className="text-xs text-orange-500 font-medium mt-1">
                  {staff.shift} shift{staff.gateOrArea ? ` · ${staff.gateOrArea}` : ''}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
            <CalendarOff className="w-4 h-4 text-gray-400 shrink-0" />
            {formattedDate}
          </div>
        </div>

        {/* Status Selector */}
        <div className="px-6 py-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Select Status
          </div>
          <div className="grid grid-cols-3 gap-3">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStatus === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelectedStatus(opt.key)}
                  className={`relative flex flex-col items-center gap-2.5 px-3 py-4 rounded-2xl border-2 transition-all duration-150 ${
                    isSelected
                      ? `${opt.selectedBg} ${opt.selectedText} ${opt.selectedBorder} shadow-lg scale-105`
                      : `${opt.bg} ${opt.color} ${opt.border} hover:scale-102 hover:shadow-sm`
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white'} transition-colors`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">{opt.label}</span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Optional extras toggle */}
          <button
            onClick={() => setShowExtras(v => !v)}
            className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${showExtras ? 'rotate-180' : ''}`}
            />
            {showExtras ? 'Hide' : 'Add'} optional details
          </button>

          {showExtras && (
            <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
              {/* Check-in / Check-out */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />Check-in
                  </label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />Check-out
                  </label>
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <FileText className="w-3.5 h-3.5 inline mr-1" />Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Left early due to emergency…"
                  maxLength={500}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedStatus || saving}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              selectedStatus && !saving
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
