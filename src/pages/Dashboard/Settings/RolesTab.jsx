import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { FaExclamationTriangle, FaUndo } from 'react-icons/fa';
import { useRoles } from '../../../hooks/useRoles';
import { usePermissions } from '../../../context/PermissionsContext';
import RolesList from './RolesList';
import PermissionsPanel from './PermissionsPanel';
import { MATRIX_STRUCTURE } from './rolesUiConstants';

// Helper to normalize backend module keys into matrix IDs
const mapRolePermissionsToDraft = (role) => {
  const draft = {};
  if (!role || !role.permissions) return draft;

  // Build a lookup map of backend permissions by moduleKey
  const backendMap = {};
  role.permissions.forEach((p) => {
    backendMap[p.moduleKey] = p;
  });

  const allItems = [];
  MATRIX_STRUCTURE.forEach((entry) => {
    if (entry.type === 'group') {
      entry.items.forEach((item) => allItems.push(item));
    } else {
      allItems.push(entry);
    }
  });

  allItems.forEach((item) => {
    let matchedBackend = null;
    for (const key of item.matchKeys) {
      if (backendMap[key]) {
        matchedBackend = backendMap[key];
        break;
      }
    }

    const isEnabled = matchedBackend ? (matchedBackend.enabled && matchedBackend.access !== 'none') : false;

    if (!isEnabled) {
      draft[item.id] = {
        enabled: false,
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
      };
    } else {
      const access = matchedBackend.access || 'view';
      const isFull = ['full', 'manage', 'financial', 'manage_assigned'].includes(access);
      const isDeleteChecked = isFull && (item.id === 'documents' || role.roleKey === 'admin');

      draft[item.id] = {
        enabled: true,
        view: true,
        create: isFull,
        edit: isFull,
        delete: isDeleteChecked,
        export: true,
      };
    }
  });

  return draft;
};

const RolesTab = () => {
  const params = useParams();
  const societyId = params.societyId ||
    JSON.parse(localStorage.getItem('user') || '{}')?.societyId ||
    localStorage.getItem('societyDatabase');

  const {
    roles,
    loading,
    error,
    fetchRoles,
    selectedRole,
    fetchRoleDetails,
    updateRole,
    resetRole,
  } = useRoles(societyId);

  const { refreshPermissions } = usePermissions();

  // Local draft state keyed by roleKey to avoid useEffect setState anti-pattern
  const [draftPermissionsByRole, setDraftPermissionsByRole] = useState({});
  const [saving, setSaving] = useState(false);

  // Modals state
  const [pendingRoleKey, setPendingRoleKey] = useState(null);
  const [showConfirmSwitchModal, setShowConfirmSwitchModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: '', description: '' });

  // Initial fetch
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Auto-select Accountant or first role on initial load
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      const preferred = roles.find((r) => r.roleKey === 'accountant') || roles[0];
      fetchRoleDetails(preferred.roleKey);
    }
  }, [roles, selectedRole, fetchRoleDetails]);

  // Baseline saved permissions computed directly from selectedRole
  const savedPermissions = useMemo(() => {
    return selectedRole ? mapRolePermissionsToDraft(selectedRole) : {};
  }, [selectedRole]);

  // Active draft permissions for current selected role
  const draftPermissions = useMemo(() => {
    if (!selectedRole) return {};
    return draftPermissionsByRole[selectedRole.roleKey] || savedPermissions;
  }, [selectedRole, draftPermissionsByRole, savedPermissions]);

  // Check if draft has unsaved changes compared to saved state
  const hasChanges = useMemo(() => {
    if (!selectedRole || !selectedRole.isEditable) return false;
    if (!draftPermissionsByRole[selectedRole.roleKey]) return false;
    return JSON.stringify(draftPermissions) !== JSON.stringify(savedPermissions);
  }, [selectedRole, draftPermissionsByRole, draftPermissions, savedPermissions]);

  // Role selection with unsaved changes prompt
  const handleSelectRole = useCallback(
    (roleKey) => {
      if (selectedRole && selectedRole.roleKey === roleKey) return;

      if (hasChanges) {
        setPendingRoleKey(roleKey);
        setShowConfirmSwitchModal(true);
      } else {
        fetchRoleDetails(roleKey);
      }
    },
    [hasChanges, selectedRole, fetchRoleDetails]
  );

  const confirmSwitchRole = () => {
    if (pendingRoleKey) {
      // Discard changes for current role
      if (selectedRole) {
        setDraftPermissionsByRole((prev) => {
          const next = { ...prev };
          delete next[selectedRole.roleKey];
          return next;
        });
      }
      fetchRoleDetails(pendingRoleKey);
      setPendingRoleKey(null);
    }
    setShowConfirmSwitchModal(false);
  };

  // Matrix handlers
  const handleToggleModule = (moduleId) => {
    if (!selectedRole?.isEditable) return;

    setDraftPermissionsByRole((prev) => {
      const currentRoleDraft = prev[selectedRole.roleKey] || savedPermissions;
      const current = currentRoleDraft[moduleId] || {};
      const newEnabled = !current.enabled;

      return {
        ...prev,
        [selectedRole.roleKey]: {
          ...currentRoleDraft,
          [moduleId]: {
            enabled: newEnabled,
            view: newEnabled,
            create: newEnabled,
            edit: newEnabled,
            delete: newEnabled ? current.delete : false,
            export: newEnabled,
          },
        },
      };
    });
  };

  const handleToggleAction = (moduleId, actionId) => {
    if (!selectedRole?.isEditable) return;

    setDraftPermissionsByRole((prev) => {
      const currentRoleDraft = prev[selectedRole.roleKey] || savedPermissions;
      const current = currentRoleDraft[moduleId] || {};
      if (!current.enabled) return prev;

      return {
        ...prev,
        [selectedRole.roleKey]: {
          ...currentRoleDraft,
          [moduleId]: {
            ...current,
            [actionId]: !current[actionId],
          },
        },
      };
    });
  };

  const handleSelectAllColumn = (actionId, shouldSelect) => {
    if (!selectedRole?.isEditable) return;

    setDraftPermissionsByRole((prev) => {
      const currentRoleDraft = prev[selectedRole.roleKey] || savedPermissions;
      const nextRoleDraft = { ...currentRoleDraft };

      Object.keys(nextRoleDraft).forEach((modId) => {
        if (nextRoleDraft[modId]?.enabled) {
          nextRoleDraft[modId] = {
            ...nextRoleDraft[modId],
            [actionId]: shouldSelect,
          };
        }
      });

      return {
        ...prev,
        [selectedRole.roleKey]: nextRoleDraft,
      };
    });
  };

  // Save changes handler
  const handleSave = async () => {
    if (!selectedRole || !selectedRole.isEditable || saving) return;

    setSaving(true);
    try {
      const diff = {};
      if (selectedRole.permissions) {
        selectedRole.permissions.forEach((p) => {
          // Find all UI items that match this backend moduleKey
          const matchingItems = MATRIX_STRUCTURE.flatMap((e) =>
            e.type === 'group' ? e.items : [e]
          ).filter((i) => i.matchKeys.includes(p.moduleKey));

          if (matchingItems.length === 0) return;

          // If any matching UI item is enabled, the module is enabled
          const isAnyEnabled = matchingItems.some((item) => draftPermissions[item.id]?.enabled);

          // Check if any matching UI item has write permissions (create/edit/delete)
          const hasWrite = matchingItems.some(
            (item) => draftPermissions[item.id]?.enabled &&
              (draftPermissions[item.id]?.create || draftPermissions[item.id]?.edit || draftPermissions[item.id]?.delete)
          );

          let resolvedAccess = 'none';
          if (isAnyEnabled) {
            const valid = p.validAccessLevels || ['none', 'view', 'full'];
            if (hasWrite) {
              if (valid.includes('full')) resolvedAccess = 'full';
              else if (valid.includes('manage')) resolvedAccess = 'manage';
              else if (valid.includes('financial')) resolvedAccess = 'financial';
              else if (valid.includes('manage_assigned')) resolvedAccess = 'manage_assigned';
              else resolvedAccess = 'view';
            } else {
              if (valid.includes('view')) resolvedAccess = 'view';
              else if (valid.includes('financial_queries')) resolvedAccess = 'financial_queries';
              else resolvedAccess = 'view';
            }
          }

          const hasEnabledChanged = isAnyEnabled !== p.enabled;
          const hasAccessChanged = resolvedAccess !== p.access;

          if (hasEnabledChanged || hasAccessChanged) {
            diff[p.moduleKey] = {
              enabled: isAnyEnabled,
              access: resolvedAccess,
            };
          }
        });
      }

      if (Object.keys(diff).length > 0) {
        const success = await updateRole(selectedRole.roleKey, diff);
        if (success) {
          toast.success('Role permissions updated successfully');
          setDraftPermissionsByRole((prev) => {
            const next = { ...prev };
            delete next[selectedRole.roleKey];
            return next;
          });
          await refreshPermissions({ silent: true });
        }
      } else {
        toast.success('No changes to save');
        setDraftPermissionsByRole((prev) => {
          const next = { ...prev };
          delete next[selectedRole.roleKey];
          return next;
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Revert changes
  const handleCancel = () => {
    if (!selectedRole) return;
    setDraftPermissionsByRole((prev) => {
      const next = { ...prev };
      delete next[selectedRole.roleKey];
      return next;
    });
    toast('Unsaved changes discarded', { icon: '↩️' });
  };

  // Reset to default
  const handleConfirmReset = async () => {
    if (!selectedRole || saving) return;
    setSaving(true);
    try {
      const success = await resetRole(selectedRole.roleKey);
      if (success) {
        toast.success(`Reset ${selectedRole.roleName} to default template`);
        setDraftPermissionsByRole((prev) => {
          const next = { ...prev };
          delete next[selectedRole.roleKey];
          return next;
        });
        setShowResetModal(false);
        await refreshPermissions({ silent: true });
      }
    } catch {
      toast.error('Failed to reset role');
    } finally {
      setSaving(false);
    }
  };

  // Duplicate Role
  const handleDuplicate = () => {
    if (!selectedRole) return;
    setNewRoleForm({
      name: `${selectedRole.roleName} (Copy)`,
      description: selectedRole.description || '',
    });
    setShowAddRoleModal(true);
  };

  // Add custom role
  const handleAddRoleSubmit = (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;

    toast.success(`Role "${newRoleForm.name}" created`);
    setShowAddRoleModal(false);
    setNewRoleForm({ name: '', description: '' });
  };

  // Loading error state
  if (error && !roles.length) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
        <FaExclamationTriangle className="mt-0.5 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Error Loading Roles</h4>
          <p className="text-xs text-red-500 mt-0.5">{error}</p>
          <button
            type="button"
            onClick={fetchRoles}
            className="mt-3 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Two Column Layout (Left: Roles List, Right: Permissions Panel) */}
      <div className="flex flex-col lg:flex-row items-start gap-5">
        {/* Left Column: Roles Card */}
        <RolesList
          roles={roles}
          selectedRoleKey={selectedRole?.roleKey}
          onSelectRole={handleSelectRole}
          onAddRole={() => {
            setNewRoleForm({ name: '', description: '' });
            setShowAddRoleModal(true);
          }}
          loading={loading && roles.length === 0}
        />

        {/* Right Column: Permissions Panel */}
        <PermissionsPanel
          role={selectedRole}
          draftPermissions={draftPermissions}
          hasChanges={hasChanges}
          onToggleModule={handleToggleModule}
          onToggleAction={handleToggleAction}
          onSelectAllColumn={handleSelectAllColumn}
          onSave={handleSave}
          onReset={() => setShowResetModal(true)}
          onDuplicate={handleDuplicate}
          onCancel={handleCancel}
          saving={saving}
          totalCount={13}
        />
      </div>

      {/* Confirmation Modal for Unsaved Changes when Switching Roles */}
      {showConfirmSwitchModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center mb-3">
              <FaExclamationTriangle className="text-base" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              Unsaved Changes
            </h3>
            <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
              You have unsaved changes on the current role. Discard changes and switch role?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmSwitchModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#475569] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={confirmSwitchRole}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
              >
                Discard & Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && selectedRole && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center mb-3">
              <FaUndo className="text-base" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              Reset to Default Template?
            </h3>
            <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
              This will revert all custom permission overrides for{' '}
              <strong className="text-[#0F172A]">{selectedRole.roleName}</strong> to the system
              default template.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={saving}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#475569] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={saving}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Reset Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role / Duplicate Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              {newRoleForm.name.includes('(Copy)') ? 'Duplicate Role' : 'Create New Role'}
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Configure role details for your society.
            </p>

            <form onSubmit={handleAddRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={newRoleForm.name}
                  onChange={(e) =>
                    setNewRoleForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Accounts Assistant"
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#F1F1F1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newRoleForm.description}
                  onChange={(e) =>
                    setNewRoleForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of responsibilities..."
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#F1F1F1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#475569] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg transition-colors cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesTab;
