import React, { useState } from 'react';
import RolesTab from './RolesTab';
import SocietyDetailsTab from './SocietyDetailsTab';
import WingDetailsTab from './WingDetailsTab';
import { FaUserShield, FaBuilding, FaUserTie, FaLayerGroup } from 'react-icons/fa';
import { usePermissions } from '../../../context/PermissionsContext';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('society_details');
  const { hasModuleAccess, PERMISSION_LEVELS } = usePermissions();
  const canManageRoles = hasModuleAccess('settings', PERMISSION_LEVELS.FULL);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[70vh]">
      <div className="border-b border-gray-200">
        <div className="px-6 py-5">
          <h2 className="text-2xl font-bold text-gray-800">Society Settings</h2>
          <p className="text-gray-500 mt-1">Manage society configuration and user access roles.</p>
        </div>
        
        <div className="flex px-6 space-x-8">
          <button
            onClick={() => setActiveTab('society_details')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'society_details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaBuilding /> Society Details
          </button>
          <button
            onClick={() => setActiveTab('admin_details')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'admin_details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaUserTie /> Admin Details
          </button>
          <button
            onClick={() => setActiveTab('wing_details')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'wing_details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaLayerGroup /> Wing Details
          </button>
          {canManageRoles && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'roles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUserShield /> Roles & Permissions
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'society_details' && (
          <SocietyDetailsTab />
        )}

        {activeTab === 'admin_details' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Details</h3>
            <p className="text-gray-500">Admin details configuration is coming soon.</p>
          </div>
        )}

        {activeTab === 'wing_details' && <WingDetailsTab />}

        {activeTab === 'roles' && canManageRoles && <RolesTab />}
      </div>
    </div>
  );
};

export default SettingsPage;
