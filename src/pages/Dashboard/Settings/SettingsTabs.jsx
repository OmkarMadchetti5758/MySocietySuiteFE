import { FaLayerGroup, FaUserTie, FaShieldAlt, FaClipboardCheck, FaBoxes } from 'react-icons/fa';

const TABS = [
  { id: 'setup_details', label: 'Society Setup Details', icon: FaClipboardCheck },
  { id: 'inventory', label: 'Inventory', icon: FaBoxes },
  { id: 'wing_details', label: 'Wing Details', icon: FaLayerGroup },
  { id: 'managers', label: 'Managers', icon: FaUserTie, requiresPermission: true },
  { id: 'roles', label: 'Roles & Permissions', icon: FaShieldAlt, requiresPermission: true },
];

const SettingsTabs = ({ activeTab, onTabChange, canManageRoles }) => {
  const visibleTabs = TABS.filter(tab => !tab.requiresPermission || canManageRoles);

  return (
    <div className="mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Society Settings
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Configure your society, details, wings, managers and access control.
        </p>
      </div>

      {/* Pill Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-4">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${isActive
                  ? 'bg-[#EA580C] text-white shadow-sm ring-2 ring-orange-400/30 font-bold'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
                }`}
            >
              <Icon className={`text-xs ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsTabs;
