import api from "./apiClient";

const staffApi = {
    addStaff: async (payload) => {
        return api.post("/staff", payload);
    },
    getAllStaff: async (role = "All roles") => {
        return api.get(`/staff?role=${encodeURIComponent(role)}`);
    },
    getShiftView: async () => {
        return api.get("/staff/shift-view");
    },
    markAttendance: async (payload) => {
        // payload: { staffId, date, status, notes?, checkInTime?, checkOutTime? }
        return api.post("/attendance", payload);
    },
    getAttendance: async (date) => {
        return api.get(`/attendance?date=${date}`);
    },
    getAttendanceSummary: async (date) => {
        return api.get(`/attendance/summary?date=${date}`);
    },
    getMonthlyReport: async (month, year) => {
        return api.get(`/attendance/report?month=${month}&year=${year}`);
    }
};

export default staffApi;

