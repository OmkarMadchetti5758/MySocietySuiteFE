import React, { useState, useEffect, useCallback } from 'react';
import StaffDirectoryTab from './StaffDirectoryTab';
import AttendanceTab from './AttendanceTab';
import ShiftGateViewTab from './ShiftGateViewTab';
import MonthlyReportTab from './MonthlyReportTab';
import staffApi from '../../../services/staffApi';

const StaffPage = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, absent: 0, onLeave: 0 });

  // ── Derive facility-manager flag from stored session ──────────────────────
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const roleKeys = user.roleKeys || JSON.parse(localStorage.getItem('roleKeys') || '[]');
  const isFacilityManager =
    ['facility_manager', 'admin', 'super_admin', 'committee_member'].some(
      r => user.role === r || roleKeys.includes(r)
    );

  // ── Fetch staff list ──────────────────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffApi.getAllStaff();
      if (res.data?.status === 'success') {
        setStaffData(res.data.data);
      }
    } catch (err) {
      console.error('[StaffPage] Failed to fetch staff:', err?.response?.status, err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch attendance summary for today's stat cards ───────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await staffApi.getAttendanceSummary(today);
      if (res.data?.status === 'success') {
        setAttendanceStats(res.data.data);
      }
    } catch (err) {
      console.error('[StaffPage] Failed to fetch attendance summary:', err?.response?.data || err.message);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'directory' || activeTab === 'shift') fetchStaff();
    if (activeTab === 'attendance') fetchSummary();
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Staff</h1>
        <p className="text-sm text-gray-500">Manage staff, shifts, gate assignment and attendance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'directory',  label: 'Staff directory' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'shift',      label: 'Shift & gate view' },
          { id: 'report',     label: 'Monthly report' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Stat Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-500 mb-2">Total staff</div>
          <div className="text-2xl font-bold">{attendanceStats.total}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-500 mb-2">Present today</div>
          <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-500 mb-2">Absent today</div>
          <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-500 mb-2">On leave</div>
          <div className="text-2xl font-bold text-blue-600">{attendanceStats.onLeave}</div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-2">
        {activeTab === 'directory'  && <StaffDirectoryTab staffData={staffData} refresh={fetchStaff} loading={loading} />}
        {activeTab === 'attendance' && (
          <AttendanceTab
            staffData={staffData}
            isFacilityManager={isFacilityManager}
            onAttendanceChange={fetchSummary}
          />
        )}
        {activeTab === 'shift'  && <ShiftGateViewTab staffData={staffData} loading={loading} />}
        {activeTab === 'report' && <MonthlyReportTab staffData={staffData} />}
      </div>
    </div>
  );
};

export default StaffPage;

