import React, { useState } from 'react';
import { usePermissions } from '../../../context/PermissionsContext';
import { PERMISSION_LEVELS } from '../../../utils/permissions';
import { FaCalendarAlt, FaList } from 'react-icons/fa';
import AmenityList from './AmenityList';
import BookingList from './BookingList';

const MODULE_ID = 'amenity_booking';

const AmenityBookingContainer = () => {
  const { hasModuleAccess } = usePermissions();
  const [activeTab, setActiveTab] = useState('amenities');

  if (!hasModuleAccess(MODULE_ID, PERMISSION_LEVELS.VIEW)) {
    return (
      <div className="p-8 text-center text-gray-500">
        You do not have access to this module.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
          <h2 className="text-2xl font-bold text-gray-800">Amenities & Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage society facilities and reservations.</p>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            id="tab-amenities"
            onClick={() => setActiveTab('amenities')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'amenities'
                ? 'text-orange-600 border-orange-500 bg-orange-50/30'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaList />
            Amenities
          </button>
          <button
            id="tab-bookings"
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'bookings'
                ? 'text-orange-600 border-orange-500 bg-orange-50/30'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaCalendarAlt />
            Bookings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'amenities' && <AmenityList />}
        {activeTab === 'bookings' && <BookingList />}
      </div>
    </div>
  );
};

export default AmenityBookingContainer;
