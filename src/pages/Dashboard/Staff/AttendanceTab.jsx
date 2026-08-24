import React, { useState, useEffect } from 'react';
import { Lock, ChevronRight, CheckCircle2, Clock8 } from 'lucide-react';
import staffApi from '../../../services/staffApi';
import AttendanceModal from './AttendanceModal';

const STATUS_STYLES = {
  present:    { label: 'Present',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  absent:     { label: 'Absent',   bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500'     },
  'on-leave': { label: 'On Leave', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
};

const getInitials = (name) => {
  if (!name) return 'S';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const AttendanceTab = ({ staffData, isFacilityManager, onAttendanceChange }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftFilter, setShiftFilter] = useState('All shifts');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null); // staff whose modal is open

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await staffApi.getAttendance(date);
      if (res.data?.status === 'success') {
        const recordsMap = {};
        res.data.data.forEach(record => {
          // record.staff is an ObjectId — .toString() ensures consistent string key
          recordsMap[String(record.staff)] = record;
        });
        setAttendanceRecords(recordsMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Called by AttendanceModal on save success — optimistic update + refresh parent stat cards
  const handleAttendanceSaved = (staffId, status) => {
    fetchAttendance(); // refresh the full record to get check-in/out times
    if (onAttendanceChange) onAttendanceChange();
  };

  const filteredData = shiftFilter === 'All shifts'
    ? staffData
    : staffData.filter(s => (s.shift || '').toLowerCase().includes(shiftFilter.toLowerCase()));

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between p-5 border-b border-gray-200 bg-white gap-4">
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option>All shifts</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Night</option>
            </select>
          </div>

          {/* Role indicator badge */}
          {isFacilityManager ? (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Click a staff row to mark attendance
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
              <Lock className="w-3.5 h-3.5 text-orange-500" />
              Only facility managers can mark attendance
            </div>
          )}
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Staff</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Shift</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Gate / Area</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Check-in</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Check-out</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
                {isFacilityManager && (
                  <th className="px-5 py-3 border-b border-gray-200 w-12" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Loading…</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No staff found.</td>
                </tr>
              ) : (
                filteredData.map(staff => {
                  const record = attendanceRecords[String(staff._id)];
                  const status = record?.status;
                  const statusStyle = status ? STATUS_STYLES[status] : null;

                  return (
                    <tr
                      key={staff._id}
                      onClick={() => isFacilityManager && setSelectedStaff(staff)}
                      className={`transition-colors group ${
                        isFacilityManager
                          ? 'cursor-pointer hover:bg-orange-50/40'
                          : 'cursor-default hover:bg-gray-50/50'
                      }`}
                      title={!isFacilityManager ? 'Only facility managers can mark attendance' : ''}
                    >
                      {/* Staff Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(staff.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{staff.name}</div>
                            <div className="text-xs text-gray-400 capitalize">
                              {staff.designation?.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Shift */}
                      <td className="px-5 py-4 text-sm text-gray-600">{staff.shift || '—'}</td>

                      {/* Gate / Area */}
                      <td className="px-5 py-4">
                        <span className="inline-flex bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">
                          {staff.gateOrArea || 'N/A'}
                        </span>
                      </td>

                      {/* Check-in */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {record?.checkInTime ? (
                          <span className="inline-flex items-center gap-1.5"><Clock8 className="w-3.5 h-3.5 text-gray-400" /> {record.checkInTime}</span>
                        ) : '—'}
                      </td>

                      {/* Check-out */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {record?.checkOutTime ? (
                          <span className="inline-flex items-center gap-1.5"><Clock8 className="w-3.5 h-3.5 text-gray-400" /> {record.checkOutTime}</span>
                        ) : '—'}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        {statusStyle ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusStyle.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                            <Clock8 className="w-3 h-3" />
                            Not marked
                          </span>
                        )}
                      </td>

                      {/* Chevron arrow — only for facility managers */}
                      {isFacilityManager && (
                        <td className="px-5 py-4 text-right">
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Marking Modal */}
      {selectedStaff && (
        <AttendanceModal
          staff={selectedStaff}
          date={date}
          currentStatus={attendanceRecords[selectedStaff._id]?.status || ''}
          onClose={() => setSelectedStaff(null)}
          onSaved={handleAttendanceSaved}
        />
      )}
    </>
  );
};

export default AttendanceTab;
