import React, { useState, useEffect } from 'react';
import { useRoles } from '../../../hooks/useRoles';
import { FaArrowLeft, FaUndo, FaSave, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePermissions } from '../../../context/PermissionsContext';

const RoleEditView = ({ role, onBack, societyId }) => {
  const { updateRole, resetRole, loading, error, setError } = useRoles(societyId);
  const { refreshPermissions } = usePermissions();

  // Local state for toggles before saving
  const [localPermissions, setLocalPermissions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (role) {
      const initial = {};
      role.permissions.forEach(p => {
        initial[p.moduleKey] = { enabled: p.enabled, access: p.access };
      });
      setLocalPermissions(initial);
      setHasChanges(false);
    }
  }, [role]);

  const handleToggle = (moduleKey, currentEnabled) => {
    if (!role.isEditable) return;

    setLocalPermissions(prev => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        enabled: !currentEnabled
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const diff = {};
    role.permissions.forEach(p => {
      const current = localPermissions[p.moduleKey];
      if (current && current.enabled !== p.enabled) {
        diff[p.moduleKey] = { enabled: current.enabled };
      }
    });

    if (Object.keys(diff).length === 0) return;

    const success = await updateRole(role.roleKey, diff);
    if (success) {
      toast.success('Role permissions updated');
      setHasChanges(false);
      await refreshPermissions({ silent: true });
    }
  };

  const handleReset = async () => {
    const success = await resetRole(role.roleKey);
    if (success) {
      toast.success('Role reset to default template');
      setShowResetConfirm(false);
      await refreshPermissions({ silent: true });
    }
  };

  const formatAccessLevel = (level) => {
    switch (level) {
      case 'full': return 'Full Access';
      case 'view': return 'View Only';
      case 'none': return 'No Access';
      case 'view_pay_own': return 'View & Pay Own';
      case 'approve_own': return 'Approve Own';
      case 'raise_own': return 'Raise Own';
      case 'manage_assigned': return 'Manage Assigned';
      case 'vote': return 'Vote Only';
      case 'book_own': return 'Book Own';
      case 'manage': return 'Manage';
      case 'view_own_profile': return 'Own Profile Only';
      case 'view_restricted': return 'View (Restricted)';
      case 'financial': return 'Financial Only';
      case 'financial_queries': return 'Financial Queries';
      case 'facility_queries': return 'Facility Queries';
      case 'pay_own': return 'Pay Own';
      default: return level;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <FaArrowLeft className="mr-2" /> Back to Roles
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">{role.roleName}</h3>
            {!role.isEditable && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">Read Only</span>
            )}
            {role.isOverride && (
              <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium">Customized</span>
            )}
          </div>
        </div>

        {role.isEditable && (
          <div className="flex items-center gap-3">
            {role.isOverride && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <FaUndo /> Reset to Default
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all ${hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FaSave />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="mt-0.5" />
            <div>
              <h4 className="font-semibold">Save Failed</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Modules List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-6 md:col-span-7">Module Access</div>
          <div className="col-span-4 md:col-span-3 text-left">Access Level</div>
          <div className="col-span-2 text-right pr-2">Status</div>
        </div>

        <div className="divide-y divide-gray-100">
          {role.permissions.map((perm) => {
            const localState = localPermissions[perm.moduleKey] || { enabled: false, access: 'none' };
            const isEnabled = localState.enabled;

            return (
              <div
                key={perm.moduleKey}
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${!role.isEditable ? 'opacity-80 bg-gray-50' : 'hover:bg-blue-50/30'
                  }`}
              >
                <div className="col-span-6 md:col-span-7 pr-4">
                  <h5 className={`font-medium text-sm ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                    {perm.moduleName}
                  </h5>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{perm.description}</p>
                </div>

                <div className="col-span-4 md:col-span-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${isEnabled
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                    {formatAccessLevel(localState.access)}
                  </span>
                </div>

                <div className="col-span-2 flex justify-end items-center pr-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(perm.moduleKey, isEnabled)}
                    disabled={!role.isEditable}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      } ${!role.isEditable ? 'cursor-not-allowed opacity-60' : ''}`}
                    role="switch"
                    aria-checked={isEnabled}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Audit Info */}
      <div className="mt-6 text-center">
        {role.lastAudit ? (
          <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5">
            <FaInfoCircle /> Last modified by {role.lastAudit.changedByName} on {new Date(role.lastAudit.changedAt).toLocaleDateString()} at {new Date(role.lastAudit.changedAt).toLocaleTimeString()}
          </p>
        ) : role.isOverride ? (
          <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5">
            <FaInfoCircle /> Customized from defaults
          </p>
        ) : (
          <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5">
            <FaInfoCircle /> Currently using system default template
          </p>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <FaUndo className="text-xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset to Default?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will remove all custom overrides for <strong>{role.roleName}</strong> and revert it back to the system default template. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-2"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Reset Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleEditView;
