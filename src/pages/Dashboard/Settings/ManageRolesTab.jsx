import React, { useEffect, useState } from 'react';
import { Shield, Plus, Building2, UserPlus, RefreshCw, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { useManagers } from '../../../hooks/useManagers';
import CreateManagerModal from './CreateManagerModal';

const ManageRolesTab = () => {
  const societyId = JSON.parse(localStorage.getItem('user'))?.societyId;
  const { 
    managersData, loading, fetchManagers, 
    assignExistingResident, inviteNewManager, 
    deactivateManager, resendInvite 
  } = useManagers(societyId);

  const [activeRoleModal, setActiveRoleModal] = useState(null);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

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
    await resendInvite(assignmentId);
  };

  const handleDeactivate = async (assignmentId) => {
    if (window.confirm('Are you sure you want to deactivate this manager?')) {
      await deactivateManager(assignmentId);
    }
  };

  if (loading && managersData.length === 0) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-50 h-32 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> Department Managers
          </h3>
          <p className="text-sm text-gray-500 mt-1">Assign department heads to manage specific operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {managersData.map((roleConfig) => (
          <div key={roleConfig.roleKey} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900">{roleConfig.roleName}</h4>
                <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 mt-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {roleConfig.department} Dept.
                </div>
              </div>
              
              <button
                onClick={() => setActiveRoleModal(roleConfig)}
                disabled={!roleConfig.allowMultiple && roleConfig.assignments.some(a => ['active', 'invite_pending'].includes(a.status))}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tooltip-trigger"
                title={!roleConfig.allowMultiple && roleConfig.assignments.some(a => ['active', 'invite_pending'].includes(a.status)) ? "Role already assigned" : "Assign Manager"}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-3">
              {roleConfig.assignments.filter(a => ['active', 'invite_pending'].includes(a.status)).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-4">
                  <UserPlus className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No Manager Assigned</p>
                </div>
              ) : (
                roleConfig.assignments.filter(a => ['active', 'invite_pending'].includes(a.status)).map(assignment => (
                  <div key={assignment._id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900">
                        {assignment.managerName}
                        {assignment.status === 'invite_pending' && (
                          <span className="ml-2 text-[10px] font-bold tracking-wider uppercase bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            Pending Invite
                          </span>
                        )}
                      </div>
                      
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        {assignment.status === 'invite_pending' && (
                          <button onClick={() => handleResend(assignment._id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Resend Invite">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDeactivate(assignment._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Deactivate">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      {assignment.managerEmail && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {assignment.managerEmail}
                        </div>
                      )}
                      {assignment.managerPhone && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {assignment.managerPhone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> Joined {new Date(assignment.joiningDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateManagerModal
        isOpen={!!activeRoleModal}
        onClose={() => setActiveRoleModal(null)}
        role={activeRoleModal}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
};

export default ManageRolesTab;
