import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FaCar, 
  FaParking, 
  FaUserCheck, 
  FaWalking, 
  FaClock, 
  FaExclamationTriangle, 
  FaChartPie 
} from 'react-icons/fa';

import parkingApi from '../../../services/parkingApi';
import { residentsApi } from '../../../services/residentsApi';
import { blockApi } from '../../../services/blockApi';
import { toast } from 'react-toastify';
import ParkingDashboardTab from './components/ParkingDashboardTab';
import ParkingSlotsTab from './components/ParkingSlotsTab';
import VehiclesTab from './components/VehiclesTab';
import AssignmentsTab from './components/AssignmentsTab';
import VisitorParkingTab from './components/VisitorParkingTab';
import ParkingRequestsTab from './components/ParkingRequestsTab';
import ViolationsTab from './components/ViolationsTab';
import { ParkingModals } from './components/ParkingModals';

const ParkingPage = () => {
  const { societyId } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isResident = user?.role === 'resident_owner' || user?.role === 'resident_tenant' || user?.role === 'resident';

  // Module Data States
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [violations, setViolations] = useState([]);
  const [residents, setResidents] = useState([]);
  const [societyWings, setSocietyWings] = useState([]);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Derived unique wings from society setup, slots, and vehicles
  const wings = Array.from(new Set([
    ...societyWings,
    ...slots.map(s => s.wing).filter(Boolean),
    ...vehicles.map(v => v.flatId?.wing || v.wing).filter(Boolean)
  ])).filter(Boolean).sort();

  // Load Data on Tab Switch or Mount
  useEffect(() => {
    loadTabContent(activeTab);
  }, [activeTab, societyId]);

  useEffect(() => {
    loadAuxiliaryData();
  }, [societyId]);

  const loadAuxiliaryData = async () => {
    try {
      const [resRes, blockRes, slotsRes] = await Promise.allSettled([
        residentsApi.getResidents({ limit: 100 }),
        blockApi.getWings(),
        parkingApi.getSlots({ limit: 200 }),
      ]);

      if (resRes.status === 'fulfilled') {
        const val = resRes.value;
        const resList = val?.data?.residents || val?.residents || val?.data || (Array.isArray(val) ? val : []);
        setResidents(resList);
      }

      if (blockRes.status === 'fulfilled') {
        const val = blockRes.value;
        const wingDocs = val?.data?.blockDoc?.wings || val?.blockDoc?.wings || [];
        const fetchedWings = wingDocs.map(w => typeof w === 'string' ? w : w.name || w.wingCode).filter(Boolean);
        if (fetchedWings.length > 0) {
          setSocietyWings(fetchedWings);
        }
      }

      if (slotsRes.status === 'fulfilled') {
        const val = slotsRes.value;
        const slotList = val?.data?.data?.slots || val?.data?.slots || [];
        // Only pre-populate if the slots tab hasn't already loaded them
        setSlots(prev => prev.length === 0 ? slotList : prev);
      }
    } catch (err) {
      console.warn("Auxiliary data load error:", err);
    }
  };

  const loadTabContent = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const res = await parkingApi.getDashboardStats();
        setStats(res?.data?.data?.stats || res?.data?.data || res?.data);
      } else if (tab === 'slots') {
        const res = await parkingApi.getSlots();
        setSlots(res?.data?.data?.slots || res?.data?.slots || []);
      } else if (tab === 'vehicles') {
        const res = await parkingApi.getVehicles();
        setVehicles(res?.data?.data?.vehicles || res?.data?.vehicles || []);
      } else if (tab === 'assignments') {
        const res = await parkingApi.getAssignments();
        setAssignments(res?.data?.data?.assignments || res?.data?.assignments || []);
      } else if (tab === 'visitors') {
        const res = await parkingApi.getVisitorParkings();
        setVisitors(res?.data?.data?.sessions || res?.data?.sessions || []);
      } else if (tab === 'requests') {
        const res = await parkingApi.getRequests();
        setRequests(res?.data?.data?.requests || res?.data?.requests || []);
      } else if (tab === 'violations') {
        const res = await parkingApi.getViolations();
        setViolations(res?.data?.data?.violations || res?.data?.violations || []);
      }
    } catch (err) {
      toast.error(formatErrorMessage(err, 'Failed to load parking data'));
    } finally {
      setLoading(false);
    }
  };

  const formatErrorMessage = (err, fallback) => {
    const msg = err?.response?.data?.message || err?.message || fallback;
    if (typeof msg === 'string') {
      if (msg.includes('is not a valid enum value')) {
        return 'Invalid vehicle or slot type selected. Please select a valid type.';
      }
      if (msg.includes('already registered') || msg.includes('11000')) {
        return 'This vehicle registration number is already registered in this society.';
      }
      if (msg.includes('STALE_PARKING_DATA') || msg.includes('changed by another user')) {
        return 'Parking slot details were updated by another user. Please refresh.';
      }
      if (msg.includes('PARKING_SLOT_HAS_ACTIVE_ASSIGNMENT')) {
        return 'This slot is currently allocated to a resident. Release assignment first.';
      }
      return msg;
    }
    return fallback;
  };

  const showSuccess = (msg) => {
    toast.success(msg);
  };

  const showError = (err, fallback) => {
    toast.error(formatErrorMessage(err, fallback));
  };

  /* ── Slot Handlers ── */
  const handleSaveSlot = async (slotData, slotId) => {
    try {
      if (slotId) {
        await parkingApi.updateSlot(slotId, slotData);
        showSuccess('Parking slot updated successfully');
      } else {
        await parkingApi.createSlot(slotData);
        showSuccess(`Parking slot ${slotData.slotNumber} added for Wing ${slotData.wing}`);
      }
      setActiveModal(null);
      loadTabContent('slots');
    } catch (err) {
      showError(err, 'Failed to save parking slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this parking slot?')) return;
    try {
      await parkingApi.deleteSlot(slotId);
      showSuccess('Parking slot deleted');
      loadTabContent('slots');
    } catch (err) {
      showError(err, 'Failed to delete slot');
    }
  };

  /* ── Vehicle Handlers ── */
  const handleSaveVehicle = async (vehicleData, vehicleId) => {
    try {
      if (vehicleId) {
        await parkingApi.updateVehicle(vehicleId, vehicleData);
        showSuccess('Vehicle details updated successfully');
      } else {
        await parkingApi.createVehicle(vehicleData);
        showSuccess(`Vehicle ${vehicleData.registrationNumber || vehicleData.regNumber} registered successfully`);
      }
      setActiveModal(null);
      loadTabContent('vehicles');
    } catch (err) {
      showError(err, 'Failed to register vehicle');
    }
  };

  const handleDeactivateVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to deactivate this vehicle registration?')) return;
    try {
      await parkingApi.deactivateVehicle(vehicleId);
      showSuccess('Vehicle registration deactivated');
      loadTabContent('vehicles');
    } catch (err) {
      showError(err, 'Failed to deactivate vehicle');
    }
  };

  /* ── Assignment Handlers ── */
  const handleAssignSlot = async (assignData) => {
    try {
      await parkingApi.assignSlot(assignData);
      showSuccess('Parking slot successfully allocated');
      setActiveModal(null);
      loadTabContent('assignments');
    } catch (err) {
      showError(err, 'Failed to allocate slot');
    }
  };

  const handleUnassignSlot = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to release / unassign this parking slot?')) return;
    try {
      await parkingApi.unassignSlot(assignmentId, { releaseReason: 'Admin unassigned' });
      showSuccess('Slot unassigned and marked available');
      loadTabContent('assignments');
    } catch (err) {
      showError(err, 'Failed to unassign slot');
    }
  };

  /* ── Visitor Handlers ── */
  const handleCheckInVisitor = async (visitorData) => {
    try {
      await parkingApi.checkInVisitor(visitorData);
      showSuccess('Visitor checked in & parking pass issued');
      setActiveModal(null);
      loadTabContent('visitors');
    } catch (err) {
      showError(err, 'Failed to check-in visitor');
    }
  };

  const handleCheckOutVisitor = async (visitorId) => {
    try {
      await parkingApi.checkOutVisitor(visitorId, {});
      showSuccess('Visitor checked out successfully');
      loadTabContent('visitors');
    } catch (err) {
      showError(err, 'Failed to checkout visitor');
    }
  };

  /* ── Request Handlers ── */
  const handleCreateRequest = async (reqData) => {
    try {
      await parkingApi.createRequest(reqData);
      showSuccess('Parking request submitted successfully');
      setActiveModal(null);
      loadTabContent('requests');
    } catch (err) {
      showError(err, 'Failed to submit request');
    }
  };

  const handleApproveRequest = async (req) => {
    setActiveModal('assignSlot');
    setModalData(req);
  };

  const handleRejectRequest = async (reqId) => {
    const reason = window.prompt('Reason for rejection (optional):');
    try {
      await parkingApi.rejectRequest(reqId, { reviewNotes: reason || 'Rejected by Admin' });
      showSuccess('Request rejected');
      loadTabContent('requests');
    } catch (err) {
      showError(err, 'Failed to reject request');
    }
  };

  /* ── Violation Handlers ── */
  const handleReportViolation = async (violData) => {
    try {
      await parkingApi.reportViolation(violData);
      showSuccess('Parking violation reported successfully');
      setActiveModal(null);
      loadTabContent('violations');
    } catch (err) {
      showError(err, 'Failed to report violation');
    }
  };

  const handleResolveViolation = async (violId) => {
    const notes = window.prompt('Resolution notes (optional):');
    try {
      await parkingApi.resolveViolation(violId, { actionTaken: 'RESOLVED', resolutionNotes: notes || 'Resolved' });
      showSuccess('Violation marked as resolved');
      loadTabContent('violations');
    } catch (err) {
      showError(err, 'Failed to resolve violation');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: FaChartPie },
    { id: 'slots', label: 'Parking Slots', icon: FaParking },
    { id: 'vehicles', label: 'Vehicles', icon: FaCar },
    { id: 'assignments', label: 'Assignments', icon: FaUserCheck },
    { id: 'visitors', label: 'Visitor Parking', icon: FaWalking },
    { id: 'requests', label: 'Requests', icon: FaClock },
    { id: 'violations', label: 'Violations', icon: FaExclamationTriangle }
  ];

  return (
    <div className="space-y-6">
      {/* Top Section Header & Tabs */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Smart Society
              </span>
              <span className="text-xs text-gray-400 font-medium">• Multi-Wing System</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Parking Management</h1>
          </div>
        </div>

        {/* Full Width Top Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
                }`}
              >
                <Icon className={isActive ? 'text-white' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>


      {/* Tab Content Render */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && (
          <ParkingDashboardTab
            stats={stats}
            loading={loading}
            onTabChange={setActiveTab}
            onOpenModal={(modalType) => {
              setModalData(null);
              setActiveModal(modalType);
            }}
          />
        )}

        {activeTab === 'slots' && (
          <ParkingSlotsTab
            slots={slots}
            loading={loading}
            wings={wings}
            onAddSlot={() => { setModalData(null); setActiveModal('addSlot'); }}
            onEditSlot={(slot) => { setModalData(slot); setActiveModal('editSlot'); }}
            onDeleteSlot={handleDeleteSlot}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesTab
            vehicles={vehicles}
            loading={loading}
            onAddVehicle={() => { setModalData(null); setActiveModal('addVehicle'); }}
            onEditVehicle={(v) => { setModalData(v); setActiveModal('editVehicle'); }}
            onDeactivateVehicle={handleDeactivateVehicle}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            loading={loading}
            onAssignSlot={() => { setModalData(null); setActiveModal('assignSlot'); }}
            onUnassignSlot={handleUnassignSlot}
          />
        )}

        {activeTab === 'visitors' && (
          <VisitorParkingTab
            visitors={visitors}
            loading={loading}
            onCheckInVisitor={() => { setModalData(null); setActiveModal('checkInVisitor'); }}
            onCheckOutVisitor={handleCheckOutVisitor}
          />
        )}

        {activeTab === 'requests' && (
          <ParkingRequestsTab
            requests={requests}
            loading={loading}
            isResident={isResident}
            onCreateRequest={() => { setModalData(null); setActiveModal('requestSlot'); }}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        )}

        {activeTab === 'violations' && (
          <ViolationsTab
            violations={violations}
            loading={loading}
            isResident={isResident}
            onReportViolation={() => { setModalData(null); setActiveModal('reportViolation'); }}
            onResolveViolation={handleResolveViolation}
          />
        )}
      </div>

      {/* Unified Modals Manager */}
      <ParkingModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        modalData={modalData}
        wings={wings}
        residents={residents}
        flats={[]}
        slots={slots}
        vehicles={vehicles}
        onSubmitSlot={handleSaveSlot}
        onSubmitVehicle={handleSaveVehicle}
        onSubmitAssign={handleAssignSlot}
        onSubmitVisitor={handleCheckInVisitor}
        onSubmitRequest={handleCreateRequest}
        onSubmitViolation={handleReportViolation}
      />
    </div>
  );
};

export default ParkingPage;
