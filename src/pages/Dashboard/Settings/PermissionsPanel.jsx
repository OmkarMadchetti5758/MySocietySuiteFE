import { FiInfo, FiCopy, FiLock } from 'react-icons/fi';
import { FaSave, FaUndo } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { getRoleTheme } from './rolesUiConstants';
import SummaryCards from './SummaryCards';
import PermissionMatrix from './PermissionMatrix';
import UnsavedChangesBar from './UnsavedChangesBar';

const PermissionsPanel = ({
  role,
  draftPermissions = {},
  hasChanges = false,
  onToggleModule,
  onToggleAction,
  onSelectAllColumn,
  onSave,
  onReset,
  onDuplicate,
  onCancel,
  saving = false,
  totalCount = 13,
}) => {
  if (!role) {
    return (
      <div className="flex-1 bg-white rounded-[20px] border border-[#F1F1F1] p-12 shadow-xs flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#EA580C] flex items-center justify-center text-2xl mb-3">
          <FiInfo />
        </div>
        <h3 className="text-base font-bold text-[#0F172A]">No Role Selected</h3>
        <p className="text-xs text-[#64748B] mt-1 max-w-sm">
          Select a role from the left list to view and configure its permissions matrix.
        </p>
      </div>
    );
  }

  const theme = getRoleTheme(role.roleKey);
  const Icon = theme.icon;
  const isReadOnly = !role.isEditable || role.roleKey === 'admin';
  const description = role.description || theme.defaultDesc;

  // Calculate enabled count
  const enabledCount = Object.values(draftPermissions).filter((p) => p.enabled).length;

  return (
    <div className="flex-1 bg-white rounded-[20px] border border-[#F1F1F1] p-5 sm:p-6 shadow-xs flex flex-col gap-5 min-w-0">
      {/* 1. Header with Role Info & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Role Icon Tile & Name */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${theme.tileBg}`}
          >
            <Icon />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#0F172A] truncate">
              {role.roleName}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5 truncate">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {isReadOnly ? (
            <span className="inline-flex items-center gap-1.5 bg-[#F1F5F9] text-[#64748B] text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200">
              <FiLock className="text-xs" />
              <span>System Role (Read-only)</span>
            </span>
          ) : (
            <>
              {/* Reset Button */}
              <button
                type="button"
                onClick={onReset}
                disabled={saving}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#475569] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FaUndo className="text-[10px]" />
                <span>Reset</span>
              </button>

              {/* Duplicate Role Button */}
              <button
                type="button"
                onClick={onDuplicate}
                disabled={saving}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#475569] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiCopy className="text-xs" />
                <span>Duplicate Role</span>
              </button>

              {/* Save Changes Button */}
              <button
                type="button"
                onClick={onSave}
                disabled={!hasChanges || saving}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hasChanges && !saving
                    ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-orange-500/20'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FaSave className="text-xs" />
                )}
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Three Summary Cards */}
      <SummaryCards
        role={role}
        enabledCount={enabledCount}
        totalCount={totalCount}
        theme={theme}
      />

      {/* 3. Info Banner */}
      <div className="bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl px-4 py-2.5 flex items-center gap-2.5">
        <FiInfo className="text-sm text-[#EA580C] shrink-0" />
        <span className="text-xs font-medium text-[#C2410C]">
          Changes apply to all users with this role.
        </span>
      </div>

      {/* 4. Permissions Matrix Table */}
      <PermissionMatrix
        draftPermissions={draftPermissions}
        onToggleModule={onToggleModule}
        onToggleAction={onToggleAction}
        onSelectAllColumn={onSelectAllColumn}
        isReadOnly={isReadOnly}
      />

      {/* 5. Sticky Footer Bar for Unsaved Changes */}
      {!isReadOnly && (
        <UnsavedChangesBar
          hasChanges={hasChanges}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
        />
      )}
    </div>
  );
};

export default PermissionsPanel;
