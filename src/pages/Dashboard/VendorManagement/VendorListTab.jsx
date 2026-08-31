import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import VendorFormModal from './VendorFormModal';
import vendorApi from '../../../services/vendorApi';

const VendorListTab = ({ vendorData, refresh, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const roleKeys = user.roleKeys || JSON.parse(localStorage.getItem('roleKeys') || '[]');
  const isAdmin = ['admin', 'committee_member', 'super_admin'].some(
    (r) => user.role === r || roleKeys.includes(r)
  );

  const handleAdd = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDeactivate = async (vendor) => {
    if (window.confirm(`Are you sure you want to deactivate ${vendor.name}?`)) {
      try {
        await vendorApi.updateVendor(vendor._id, { status: 'INACTIVE' });
        refresh();
      } catch (err) {
        console.error('Failed to deactivate vendor:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">All Vendors</h3>
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <FaPlus size={12} /> Add Vendor
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Validity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Loading vendors...
                </td>
              </tr>
            ) : vendorData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No vendors found.
                </td>
              </tr>
            ) : (
              vendorData.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{vendor.name}</td>
                  <td className="px-6 py-4 text-gray-600">{vendor.serviceCategory}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div>{vendor.contactPerson}</div>
                    <div className="text-xs text-gray-400">{vendor.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="text-xs">
                      Start: {vendor.contractStartDate ? new Date(vendor.contractStartDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs">
                      End: {vendor.contractEndDate ? new Date(vendor.contractEndDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        vendor.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : vendor.status === 'INVITED'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      {vendor.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleDeactivate(vendor)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <VendorFormModal
          vendor={selectedVendor}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
};

export default VendorListTab;
