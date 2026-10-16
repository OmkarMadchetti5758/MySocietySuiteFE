import React, { useState, useEffect, useRef } from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiInfo,
} from 'react-icons/fi';
import { MATRIX_STRUCTURE } from './rolesUiConstants';

const ACTIONS = [
  { id: 'view', label: 'VIEW' },
  { id: 'create', label: 'CREATE' },
  { id: 'edit', label: 'EDIT' },
  { id: 'delete', label: 'DELETE' },
  { id: 'export', label: 'EXPORT' },
];

const HeaderCheckbox = ({ actionId, draftPermissions, allItemIds, isReadOnly, onToggle }) => {
  const checkboxRef = useRef(null);

  // Enabled items count
  const enabledItems = allItemIds.filter((id) => draftPermissions[id]?.enabled);
  const checkedItems = enabledItems.filter((id) => draftPermissions[id]?.[actionId]);

  const isAllChecked = enabledItems.length > 0 && checkedItems.length === enabledItems.length;
  const isIndeterminate = checkedItems.length > 0 && checkedItems.length < enabledItems.length;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase">
        {actionId.toUpperCase()}
      </span>
      <label className="flex items-center gap-1 cursor-pointer text-[10px] text-[#94A3B8] font-normal select-none">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={isAllChecked}
          disabled={isReadOnly || enabledItems.length === 0}
          onChange={() => onToggle(actionId, !isAllChecked)}
          className="w-3.5 h-3.5 rounded border-gray-300 text-[#EA580C] accent-orange-600 focus:ring-orange-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        />
        <span className="text-[9px] text-[#64748B]">Select all</span>
      </label>
    </div>
  );
};

const PermissionMatrix = ({
  draftPermissions = {},
  onToggleModule,
  onToggleAction,
  onSelectAllColumn,
  isReadOnly = false,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Collect all item IDs for column-level select all
  const allItemIds = [];
  MATRIX_STRUCTURE.forEach((entry) => {
    if (entry.type === 'group') {
      entry.items.forEach((item) => allItemIds.push(item.id));
    } else {
      allItemIds.push(entry.id);
    }
  });

  const renderModuleRow = (item, isGroupChild = false) => {
    const Icon = item.icon;
    const perm = draftPermissions[item.id] || {
      enabled: false,
      view: false,
      create: false,
      edit: false,
      delete: false,
      export: false,
    };
    const isEnabled = perm.enabled;

    return (
      <tr
        key={item.id}
        className={`border-b border-[#F1F1F1] transition-colors ${
          isEnabled ? 'bg-white hover:bg-orange-50/20' : 'bg-gray-50/40 opacity-75'
        }`}
      >
        {/* 1. Module Name & Icon */}
        <td
          className={`py-3 px-4 sm:px-6 text-xs font-semibold text-[#0F172A] flex items-center gap-2.5 ${
            isGroupChild ? 'pl-8 sm:pl-10' : ''
          }`}
        >
          <Icon className="text-sm text-[#64748B] shrink-0" />
          <span className="truncate">{item.label}</span>
        </td>

        {/* 2. Module Access Toggle */}
        <td className="py-3 px-3 text-center">
          <div className="flex justify-center">
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              aria-label={`Toggle access for ${item.label}`}
              disabled={isReadOnly}
              onClick={() => onToggleModule(item.id)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                isEnabled ? 'bg-[#EA580C]' : 'bg-gray-200'
              } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </td>

        {/* 3-7. Action Checkboxes (VIEW, CREATE, EDIT, DELETE, EXPORT) */}
        {ACTIONS.map((action) => {
          const isActionChecked = isEnabled && Boolean(perm[action.id]);
          const isDisabled = isReadOnly || !isEnabled;

          return (
            <td key={action.id} className="py-3 px-2 sm:px-3 text-center">
              <div className="flex justify-center items-center">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onToggleAction(item.id, action.id)}
                  aria-label={`${action.label} for ${item.label}`}
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                    isActionChecked
                      ? 'bg-[#EA580C] border-[#EA580C] text-white shadow-2xs'
                      : 'bg-white border-gray-300 hover:border-orange-400'
                  } ${
                    isDisabled
                      ? 'opacity-35 cursor-not-allowed bg-gray-100 border-gray-200'
                      : 'cursor-pointer'
                  }`}
                >
                  {isActionChecked && <FiCheck className="text-[11px] stroke-[3]" />}
                </button>
              </div>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="border border-[#F1F1F1] rounded-2xl overflow-hidden bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#F1F1F1]">
              <th className="py-3 px-4 sm:px-6 text-[10px] font-bold text-[#64748B] tracking-wider uppercase w-[220px]">
                MODULE
              </th>
              <th className="py-3 px-3 text-center w-[130px]">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#64748B] tracking-wider uppercase">
                  <span>MODULE ACCESS</span>
                  <FiInfo className="text-xs text-[#94A3B8]" />
                </div>
              </th>
              {ACTIONS.map((act) => (
                <th key={act.id} className="py-3 px-2 sm:px-3 text-center w-[85px]">
                  <HeaderCheckbox
                    actionId={act.id}
                    draftPermissions={draftPermissions}
                    allItemIds={allItemIds}
                    isReadOnly={isReadOnly}
                    onToggle={onSelectAllColumn}
                  />
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {MATRIX_STRUCTURE.map((entry) => {
              if (entry.type === 'single') {
                return renderModuleRow(entry, false);
              }

              const isCollapsed = Boolean(collapsedGroups[entry.id]);

              return (
                <React.Fragment key={entry.id}>
                  {/* Category Header Row */}
                  <tr
                    onClick={() => toggleGroup(entry.id)}
                    className="bg-[#FFF7ED]/70 border-y border-orange-100/60 cursor-pointer select-none hover:bg-[#FFF7ED] transition-colors"
                  >
                    <td
                      colSpan={7}
                      className="py-2 px-4 sm:px-6 text-xs font-bold text-[#0F172A]"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <FiChevronRight className="text-sm text-[#EA580C]" />
                        ) : (
                          <FiChevronDown className="text-sm text-[#EA580C]" />
                        )}
                        <span>{entry.label}</span>
                      </div>
                    </td>
                  </tr>

                  {/* Category Child Rows */}
                  {!isCollapsed &&
                    entry.items.map((subItem) => renderModuleRow(subItem, true))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionMatrix;
