import React, { useState, useEffect, useCallback } from 'react';
import vendorApi from '../../../services/vendorApi';
import VendorListTab from './VendorListTab';
import VendorTasksAdminTab from './VendorTasksAdminTab';

const VendorsPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getAllVendors();
      if (res.data?.status === 'success') {
        setVendorData(res.data.data);
      }
    } catch (err) {
      console.error('[VendorsPage] Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Vendors</h1>
        <p className="text-sm text-gray-500">Manage external service providers and their contracts.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'list',  label: 'Vendor Directory' },
          { id: 'tasks', label: 'Tasks & Assignments' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-2">
        {activeTab === 'list' && (
          <VendorListTab 
            vendorData={vendorData} 
            refresh={fetchVendors} 
            loading={loading} 
          />
        )}
        {activeTab === 'tasks' && (
          <VendorTasksAdminTab 
            vendors={vendorData} 
          />
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
