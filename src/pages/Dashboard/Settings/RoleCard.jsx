import { FiLock } from 'react-icons/fi';
import { getRoleTheme } from './rolesUiConstants';

const RoleCard = ({ role, isSelected, onSelect }) => {
  const theme = getRoleTheme(role.roleKey);
  const Icon = theme.icon;
  const isSystemRole = !role.isEditable || role.roleKey === 'admin';
  const enabledCount = role.permissions ? role.permissions.filter(p => p.enabled).length : 0;
  const description = role.description || theme.defaultDesc;

  return (
    <div
      onClick={() => onSelect(role.roleKey)}
      className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer relative ${
        isSelected
          ? 'border-[#EA580C] bg-[#FFF7ED] ring-2 ring-orange-500/20 shadow-xs'
          : 'border-[#F1F1F1] bg-white hover:border-orange-200 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Pastel Icon Tile (48px / 11-12) */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg ${theme.tileBg}`}
        >
          <Icon />
        </div>

        {/* Role Name & Description */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-[#0F172A] truncate">
            {role.roleName}
          </h4>
          <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {/* Badges Row */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-1">
        <div>
          {isSystemRole && (
            <span className="inline-flex items-center gap-1 bg-[#F1F5F9] text-[#64748B] text-[10px] font-semibold px-2 py-0.5 rounded-md">
              <FiLock className="text-[10px]" />
              <span>System role</span>
            </span>
          )}
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.pillBg}`}
        >
          {enabledCount} modules
        </span>
      </div>
    </div>
  );
};

export default RoleCard;
