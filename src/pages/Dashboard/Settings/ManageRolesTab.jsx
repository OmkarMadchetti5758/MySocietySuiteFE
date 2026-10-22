import React, { useEffect, useState, useMemo } from 'react';
import {
  Shield, Plus, Building2, UserPlus, RefreshCw, Trash2, Mail, Phone,
  Calendar, Search, Filter, CheckCircle2, Clock, AlertTriangle,
  UserCheck, X, Briefcase, Users, ChevronRight, Check
} from 'lucide-react';
import { useManagers } from '../../../hooks/useManagers';
import CreateManagerModal from './CreateManagerModal';

const DEPARTMENT_CONFIG = {
  Finance: {
    accent: '#059669',
    bg: '#ecfdf5',
    text: '#065f46',
    border: '#a7f3d0',
    icon: Building2,
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  Security: {
    accent: '#2563eb',
    bg: '#eff6ff',
    text: '#1e40af',
    border: '#bfdbfe',
    icon: Shield,
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  Facility: {
    accent: '#d97706',
    bg: '#fffbeb',
    text: '#92400e',
    border: '#fde68a',
    icon: Briefcase,
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  Procurement: {
    accent: '#7c3aed',
    bg: '#f5f3ff',
    text: '#5b21b6',
    border: '#ddd6fe',
    icon: Users,
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
  },
};

const AVATAR_COLORS = [
  '#ea580c', '#059669', '#2563eb', '#7c3aed', '#d97706', '#0891b2', '#dc2626'
];

const ManageRolesTab = () => {
  const societyId = JSON.parse(localStorage.getItem('user'))?.societyId;
  const { 
    managersData, loading, fetchManagers, 
    assignExistingResident, inviteNewManager, 
    deactivateManager, resendInvite 
  } = useManagers(societyId);

  const [activeRoleModal, setActiveRoleModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deactivateModal, setDeactivateModal] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  // Summary Metrics
  const stats = useMemo(() => {
    let active = 0;
    let pending = 0;
    let unassigned = 0;

    managersData.forEach(role => {
      const activeOrPending = (role.assignments || []).filter(a => ['active', 'invite_pending'].includes(a.status));
      if (activeOrPending.length === 0) {
        unassigned += 1;
      } else {
        activeOrPending.forEach(a => {
          if (a.status === 'active') active += 1;
          if (a.status === 'invite_pending') pending += 1;
        });
      }
    });

    return {
      total: managersData.length,
      active,
      pending,
      unassigned,
    };
  }, [managersData]);

  // Filtered Roles List
  const filteredRoles = useMemo(() => {
    return managersData.filter(role => {
      // Department filter
      if (departmentFilter !== 'All' && role.department.toLowerCase() !== departmentFilter.toLowerCase()) {
        return false;
      }

      const activeOrPending = (role.assignments || []).filter(a => ['active', 'invite_pending'].includes(a.status));

      // Status filter
      if (statusFilter === 'unassigned' && activeOrPending.length > 0) return false;
      if (statusFilter === 'active' && !activeOrPending.some(a => a.status === 'active')) return false;
      if (statusFilter === 'invite_pending' && !activeOrPending.some(a => a.status === 'invite_pending')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const roleMatches = role.roleName.toLowerCase().includes(q) || role.department.toLowerCase().includes(q);
        const managerMatches = activeOrPending.some(a => 
          (a.managerName && a.managerName.toLowerCase().includes(q)) ||
          (a.managerEmail && a.managerEmail.toLowerCase().includes(q)) ||
          (a.managerPhone && a.managerPhone.includes(q))
        );
        if (!roleMatches && !managerMatches) return false;
      }

      return true;
    });
  }, [managersData, departmentFilter, statusFilter, searchQuery]);

  const handleCreateSubmit = async (path, payload) => {
    if (path === 'existing') {
      const success = await assignExistingResident(payload);
      if (success) setActiveRoleModal(null);
    } else {
      const data = await inviteNewManager(payload);
      if (data) {
        if (data.devInviteLink) {
          return data.devInviteLink;
        } else {
          setActiveRoleModal(null);
        }
      }
    }
  };

  const handleResend = async (assignmentId) => {
    setResendingId(assignmentId);
    try {
      await resendInvite(assignmentId);
    } finally {
      setResendingId(null);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateModal) return;
    setIsDeactivating(true);
    try {
      await deactivateManager(deactivateModal.assignmentId);
      setDeactivateModal(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  // Skeleton Loader
  if (loading && managersData.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header & KPI Summary ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Department Managers
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign and supervise verified department heads across society operations.
              </p>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Roles:</span>
            <span className="text-xs font-bold text-slate-900">{stats.total}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">Active:</span>
            <span className="text-xs font-bold text-emerald-900">{stats.active}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-700">Invited:</span>
            <span className="text-xs font-bold text-amber-900">{stats.pending}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-xs font-semibold text-orange-700">Vacant:</span>
            <span className="text-xs font-bold text-orange-950">{stats.unassigned}</span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or manager name, email, phone…"
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Refresh */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Finance">Finance</option>
            <option value="Security">Security</option>
            <option value="Facility">Facility</option>
            <option value="Procurement">Procurement</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ea580c] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="invite_pending">Invited Only</option>
            <option value="unassigned">Vacant Only</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchManagers()}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-[#ea580c] hover:bg-orange-50 rounded-xl border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh managers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ea580c]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Empty Search Results ── */}
      {filteredRoles.length === 0 && (
        <div className="py-14 text-center rounded-2xl border-2 border-dashed border-slate-200 p-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No matching manager roles found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or clear your current filters.
          </p>
          {(searchQuery || departmentFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setDepartmentFilter('All'); setStatusFilter('All'); }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-[#ea580c] bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* ── Department Roles Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredRoles.map((roleConfig) => {
          const deptStyle = DEPARTMENT_CONFIG[roleConfig.department] || {
            accent: '#ea580c',
            bg: '#fff7ed',
            text: '#9a3412',
            border: '#fed7aa',
            icon: Building2,
            badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
          };
          const DeptIcon = deptStyle.icon;

          const activeAssignments = (roleConfig.assignments || []).filter(a =>
            ['active', 'invite_pending'].includes(a.status)
          );

          const isAssigned = activeAssignments.length > 0;
          const canAssign = roleConfig.allowMultiple || !isAssigned;

          return (
            <div
              key={roleConfig.roleKey}
              className="bg-white border-1.5 border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-white flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ background: `linear-gradient(135deg, ${deptStyle.accent} 0%, ${deptStyle.accent}dd 100%)` }}
                  >
                    <DeptIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight truncate">
                        {roleConfig.roleName}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${deptStyle.badgeBg}`}>
                        {roleConfig.department}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {roleConfig.allowMultiple ? 'Multiple holders allowed' : 'Single designated head'}
                    </span>
                  </div>
                </div>

                {/* Assign Button */}
                <button
                  onClick={() => setActiveRoleModal(roleConfig)}
                  disabled={!canAssign}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    canAssign
                      ? 'bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white shadow-xs hover:shadow-md hover:shadow-orange-500/20 active:scale-95'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  title={!canAssign ? "Role already assigned (single-holder)" : "Assign Manager"}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-center">
                {!isAssigned ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2.5">
                      <UserPlus className="w-5 h-5 opacity-70" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">No Manager Assigned</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Assign a verified society resident or send an invite to an external professional.
                    </p>
                    <button
                      onClick={() => setActiveRoleModal(roleConfig)}
                      className="mt-3 text-xs font-bold text-[#ea580c] hover:text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Assign {roleConfig.roleName} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  /* Active Assignments List */
                  <div className="space-y-3">
                    {activeAssignments.map((assignment, aIdx) => {
                      const avatarColor = AVATAR_COLORS[aIdx % AVATAR_COLORS.length];
                      const isPending = assignment.status === 'invite_pending';

                      return (
                        <div
                          key={assignment._id}
                          className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 transition-all hover:bg-slate-50 hover:border-orange-200/80"
                        >
                          <div className="flex justify-between items-start gap-3 mb-3">
                            {/* Manager Avatar & Name */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                                style={{ background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}cc 100%)` }}
                              >
                                {assignment.managerName ? assignment.managerName.charAt(0).toUpperCase() : 'M'}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-sm truncate">
                                    {assignment.managerName}
                                  </span>
                                  {isPending ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                      Invite Pending
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      Active
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {assignment.isResidentPromoted ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                                      <UserCheck className="w-3 h-3" /> Promoted Resident
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-200/60 px-1.5 py-0.2 rounded">
                                      <Mail className="w-3 h-3" /> External Invite
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {isPending && (
                                <button
                                  onClick={() => handleResend(assignment._id)}
                                  disabled={resendingId === assignment._id}
                                  className="p-1.5 text-slate-400 hover:text-[#ea580c] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  title="Resend Invitation Link"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${resendingId === assignment._id ? 'animate-spin text-[#ea580c]' : ''}`} />
                                </button>
                              )}
                              <button
                                onClick={() => setDeactivateModal({
                                  assignmentId: assignment._id,
                                  name: assignment.managerName,
                                  roleName: roleConfig.roleName
                                })}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Deactivate Manager"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Contact Details & Joining Meta */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                            {assignment.managerEmail && (
                              <div className="flex items-center gap-2 truncate" title={assignment.managerEmail}>
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{assignment.managerEmail}</span>
                              </div>
                            )}
                            {assignment.managerPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{assignment.managerPhone}</span>
                              </div>
                            )}
                            {assignment.joiningDate && (
                              <div className="flex items-center gap-2 col-span-full text-[11px] text-slate-400">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>Assigned: {new Date(assignment.joiningDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Assign Manager Modal ── */}
      <CreateManagerModal
        isOpen={!!activeRoleModal}
        onClose={() => setActiveRoleModal(null)}
        role={activeRoleModal}
        onSubmit={handleCreateSubmit}
      />

      {/* ── Deactivate Confirmation Modal ── */}
      {deactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Deactivate Manager?</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to deactivate <span className="font-bold text-slate-800">{deactivateModal.name}</span> as <span className="font-bold text-slate-800">{deactivateModal.roleName}</span>? Their managerial privileges will be revoked.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeactivateModal(null)}
                disabled={isDeactivating}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                disabled={isDeactivating}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeactivating ? 'Deactivating…' : 'Yes, Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRolesTab;
