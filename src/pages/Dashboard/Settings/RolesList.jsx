import { useState, useMemo } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import RoleCard from './RoleCard';

const RolesList = ({
  roles = [],
  selectedRoleKey,
  onSelectRole,
  onAddRole,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    const q = searchQuery.toLowerCase().trim();
    return roles.filter((role) => {
      const name = (role.roleName || '').toLowerCase();
      const desc = (role.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [roles, searchQuery]);

  return (
    <div className="w-full lg:w-[380px] shrink-0 bg-white rounded-[20px] border border-[#F1F1F1] p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">Roles</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Create and manage roles for your society.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddRole}
          className="bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <FiPlus className="text-sm" />
          <span>Add Role</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search roles..."
          className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] border border-[#F1F1F1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        />
      </div>

      {/* Roles List */}
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5 custom-scrollbar">
        {loading && roles.length === 0 ? (
          // Loading skeletons
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-[#F1F1F1] bg-[#FAFAFA] animate-pulse h-24"
              />
            ))}
          </div>
        ) : filteredRoles.length === 0 ? (
          // Empty state
          <div className="py-8 text-center text-xs text-[#64748B]">
            <p className="font-semibold text-[#0F172A] mb-1">No roles found</p>
            <p>Try searching for a different keyword.</p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <RoleCard
              key={role.roleKey}
              role={role}
              isSelected={selectedRoleKey === role.roleKey}
              onSelect={onSelectRole}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RolesList;
