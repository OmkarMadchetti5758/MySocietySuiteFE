import React, { useState } from 'react';
import { FaTimes, FaCheck, FaCopy } from 'react-icons/fa';
import vendorApi from '../../../services/vendorApi';

const VendorFormModal = ({ vendor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    serviceCategory: vendor?.serviceCategory || '',
    contactPerson: vendor?.contactPerson || '',
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    address: vendor?.address || '',
    contractStartDate: vendor?.contractStartDate ? vendor.contractStartDate.split('T')[0] : '',
    contractEndDate: vendor?.contractEndDate ? vendor.contractEndDate.split('T')[0] : '',
    status: vendor?.status || 'ACTIVE'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email && !formData.phone) {
      setError('At least one of Email or Phone is required to send an invite.');
      setLoading(false);
      return;
    }

    try {
      let res;
      if (vendor) {
        res = await vendorApi.updateVendor(vendor._id, formData);
        onSave();
      } else {
        res = await vendorApi.createVendor(formData);
        const link = res.data?.data?.devInviteLink || res.data?.devInviteLink;
        if (link) {
          setInviteLink(link);
          return; // Don't call onSave() yet, wait for user to close modal
        } else {
          onSave();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (inviteLink) {
      onSave(); // Refresh the list if we are closing after success
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h3 className="font-semibold text-gray-800">{vendor ? 'Edit Vendor' : 'Add Vendor'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <FaTimes />
          </button>
        </div>

        {inviteLink ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <FaCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">Vendor Invited Successfully</h4>
              <p className="text-gray-500 mt-2">
                The vendor account has been created. They must activate their account using the invite link.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Development Invite Link
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shrink-0 flex items-center gap-2 text-sm font-medium"
                >
                  {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded inline-block">
                Note: This link is only shown because the server is running in development mode.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 overflow-y-auto">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

              <form id="vendorForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Category *</label>
                    <select
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    >
                      <option value="">Select category</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Pest Control">Pest Control</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Start Date</label>
                    <input
                      type="date"
                      name="contractStartDate"
                      value={formData.contractStartDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract End Date</label>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={formData.contractEndDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {vendor && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="vendorForm"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Inviting...' : 'Invite Vendor'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorFormModal;
