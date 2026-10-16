import { FiBox, FiUsers, FiClock } from 'react-icons/fi';
import { formatAuditInfo } from './rolesUiConstants';

const SummaryCards = ({ role, enabledCount = 0, totalCount = 13, theme = {} }) => {
  const audit = formatAuditInfo(role?.lastAudit);

  const usersCount = theme.usersCount !== undefined ? theme.usersCount : 4;
  const avatars = theme.avatars && theme.avatars.length > 0
    ? theme.avatars
    : [
        { initials: 'SJ', bg: 'bg-blue-100 text-blue-700' },
        { initials: 'PK', bg: 'bg-purple-100 text-purple-700' },
        { initials: 'RD', bg: 'bg-emerald-100 text-emerald-700' },
        { initials: '+1', bg: 'bg-gray-100 text-gray-600' },
      ];

  const getModuleSummaryHelper = () => {
    if (enabledCount === totalCount) return 'This role has full system access.';
    if (enabledCount >= 10) return 'This role has access to most modules.';
    if (enabledCount >= 5) return 'This role has standard module access.';
    return 'This role has restricted module access.';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Modules Enabled */}
      <div className="p-3.5 rounded-xl border border-[#F1F1F1] bg-[#FAFAFA] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-lg">
          <FiBox />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase">
            MODULES ENABLED
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#0F172A] leading-tight">
            {enabledCount} of {totalCount}
          </div>
          <p className="text-[10px] text-[#64748B] truncate mt-0.5">
            {getModuleSummaryHelper()}
          </p>
        </div>
      </div>

      {/* 2. Users Assigned */}
      <div className="p-3.5 rounded-xl border border-[#F1F1F1] bg-[#FAFAFA] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-lg">
          <FiUsers />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase">
            USERS ASSIGNED
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base sm:text-lg font-extrabold text-[#0F172A] leading-tight">
              {usersCount}
            </span>
            <div className="flex items-center -space-x-1">
              {avatars.map((av, idx) => (
                <span
                  key={idx}
                  className={`w-5 h-5 rounded-full ${av.bg} text-[9px] font-bold flex items-center justify-center ring-1 ring-white shrink-0`}
                >
                  {av.initials}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Last Updated */}
      <div className="p-3.5 rounded-xl border border-[#F1F1F1] bg-[#FAFAFA] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0 text-lg">
          <FiClock />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase">
            LAST UPDATED
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#0F172A] leading-tight">
            {audit.timeStr}
          </div>
          <p className="text-[10px] text-[#64748B] truncate mt-0.5">
            by {audit.author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
