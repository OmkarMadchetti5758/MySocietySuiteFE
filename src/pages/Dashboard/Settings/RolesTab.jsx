import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRoles } from '../../../hooks/useRoles';
import RoleEditView from './RoleEditView';
import { FaUserShield, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

const RolesTab = () => {
  const { societyId } = useParams();
  const { roles, loading, error, fetchRoles, selectedRole, fetchRoleDetails, setSelectedRole } = useRoles(societyId);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  if (loading && !roles.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !roles.length) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
        <FaInfoCircle className="mt-0.5" />
        <div>
          <h4 className="font-semibold">Error Loading Roles</h4>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (selectedRole) {
    return (
      <RoleEditView 
        role={selectedRole} 
        onBack={() => {
          setSelectedRole(null);
          fetchRoles(); // Refresh list to get latest overrides
        }}
        societyId={societyId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Manage Roles</h3>
          <p className="text-sm text-gray-500 mt-1">Configure module access for different user roles in your society.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div 
            key={role.roleKey}
            className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white cursor-pointer group relative overflow-hidden"
            onClick={() => fetchRoleDetails(role.roleKey)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FaUserShield className="text-xl" />
              </div>
              {role.isOverride && (
                <span className="text-[10px] font-bold tracking-wider uppercase bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  Customized
                </span>
              )}
            </div>
            
            <h4 className="font-bold text-gray-900 text-lg mb-1">{role.roleName}</h4>
            <p className="text-sm text-gray-500 line-clamp-2">
              {role.isEditable 
                ? 'Click to manage module permissions for this role.' 
                : 'System role. Permissions cannot be modified.'}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-400">
                {role.permissions.filter(p => p.enabled).length} modules enabled
              </span>
              <button className="text-blue-600 font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
                {role.isEditable ? 'Edit' : 'View'} <FaChevronRight className="ml-1 text-[10px]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesTab;
