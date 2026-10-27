import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SettingsTabs from './SettingsTabs';
import RolesTab from './RolesTab';
import ManageRolesTab from './ManageRolesTab';
import WingDetailsTab from './WingDetailsTab';
import SocietySetupDetailsTab from './SocietySetupDetailsTab';
import { usePermissions } from '../../../context/PermissionsContext';

const DEFAULT_TAB = 'setup_details';

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasModuleAccess, PERMISSION_LEVELS } = usePermissions();
  const canManageRoles = hasModuleAccess('settings', PERMISSION_LEVELS.FULL);

  const tabParam = searchParams.get('tab');
  const isValidTab =
    tabParam === 'setup_details' ||
    tabParam === 'wing_details' ||
    ((tabParam === 'managers' || tabParam === 'roles') && canManageRoles);

  const activeTab = isValidTab ? tabParam : DEFAULT_TAB;

  useEffect(() => {
    // If URL has an invalid/removed tab (e.g. society_details), fallback to default tab
    if (tabParam && !isValidTab) {
      setSearchParams({ tab: DEFAULT_TAB }, { replace: true });
    }
  }, [tabParam, isValidTab, setSearchParams]);

  const handleTabChange = (tabId) => {
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
        {activeTab === 'setup_details' && (
          <div className="bg-white rounded-[20px] border border-[#F1F1F1] p-6 shadow-xs">
            <SocietySetupDetailsTab />
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

        {activeTab === 'roles' && canManageRoles && <RolesTab />}
      </div>
    </div>
  );
};

export default SettingsPage;
