import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SettingsTabs from './SettingsTabs';
import RolesTab from './RolesTab';
import ManageRolesTab from './ManageRolesTab';
import SocietyDetailsTab from './SocietyDetailsTab';
import WingDetailsTab from './WingDetailsTab';
import InventoryTab from './InventoryTab';
import { usePermissions } from '../../../context/PermissionsContext';

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'roles';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { hasModuleAccess, PERMISSION_LEVELS } = usePermissions();
  const canManageRoles = hasModuleAccess('settings', PERMISSION_LEVELS.FULL);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="w-full">
      {/* Page Header and Pill Navigation Tabs */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        canManageRoles={canManageRoles}
      />

      {/* Active Tab Content */}
      <div>
        {activeTab === 'roles' && canManageRoles && <RolesTab />}

        {activeTab === 'society_details' && (
          <div className="bg-white rounded-[20px] border border-[#F1F1F1] p-6 shadow-xs">
            <SocietyDetailsTab />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[20px] border border-[#F1F1F1] p-6 shadow-xs">
            <InventoryTab />
          </div>
        )}

        {activeTab === 'wing_details' && (
          <div className="bg-white rounded-[20px] border border-[#F1F1F1] p-6 shadow-xs">
            <WingDetailsTab />
          </div>
        )}

        {activeTab === 'managers' && canManageRoles && (
          <div className="bg-white rounded-[20px] border border-[#F1F1F1] p-6 shadow-xs">
            <ManageRolesTab />
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
