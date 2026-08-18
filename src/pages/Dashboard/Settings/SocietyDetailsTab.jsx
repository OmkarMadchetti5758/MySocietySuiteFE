import React, { useState, useEffect } from 'react';
import { societyApi } from '../../../services/societyApi';

const SocietyDetailsTab = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    societyName: '',
    registrationNumber: '',
    logo: null,
    address: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    contactNumber: '',
    emailId: '',
    societyType: '',
    numberOfBlocks: 0,
    subscriptionPlan: '',
  });

  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    fetchSocietyDetails();
  }, []);

  const fetchSocietyDetails = async () => {
    try {
      setLoading(true);
      const data = await societyApi.getCurrentSociety();
      const society = data.data.society;

      setFormData({
        societyName: society.name || '',
        registrationNumber: society.registrationNumber || '',
        logo: null, // Keep null for file input, display preview if needed
        address: society.address?.street || '',
        city: society.address?.city || '',
        state: society.address?.state || '',
        country: society.address?.country || 'India',
        pinCode: society.address?.zipCode || '',
        contactNumber: society.contactPhone || '',
        emailId: society.contactEmail || '',
        societyType: society.societyType || '',
        numberOfBlocks: society.numberOfBlocks || 0,
        subscriptionPlan: society.subscriptionPlan || '', // Adjust based on DB format
      });

      if (society.blocks && Array.isArray(society.blocks)) {
        setBlocks(society.blocks);
      } else if (society.numberOfBlocks > 0) {
        setBlocks(Array(society.numberOfBlocks).fill(''));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch society details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === 'numberOfBlocks') {
      const num = parseInt(value, 10) || 0;
      const newBlocks = Array(num).fill('');
      // Preserve existing block names if any
      for (let i = 0; i < Math.min(num, blocks.length); i++) {
        newBlocks[i] = blocks[i];
      }
      setBlocks(newBlocks);
    }
  };

  const handleBlockChange = (index, value) => {
    const newBlocks = [...blocks];
    newBlocks[index] = value;
    setBlocks(newBlocks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const data = new FormData();
      data.append('name', formData.societyName);
      data.append('registrationNumber', formData.registrationNumber);
      if (formData.logo) {
        data.append('logo', formData.logo);
      }
      data.append('address', formData.address);
      data.append('city', formData.city);
      data.append('state', formData.state);
      data.append('country', formData.country);
      data.append('pinCode', formData.pinCode);
      data.append('contactPhone', formData.contactNumber);
      data.append('contactEmail', formData.emailId);
      data.append('societyType', formData.societyType);
      data.append('numberOfBlocks', formData.numberOfBlocks);
      data.append('blocks', JSON.stringify(blocks));
      data.append('subscriptionPlan', formData.subscriptionPlan);

      await societyApi.updateCurrentSociety(data);
      setSuccessMsg("Society details updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update society details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading society details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
      {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">{successMsg}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Society Name *</label>
              <input
                type="text"
                name="societyName"
                required
                value={formData.societyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors cursor-not-allowed bg-gray-100"
                placeholder="Enter society name"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
              <input
                type="text"
                name="registrationNumber"
                required
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter registration number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Society Logo</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleInputChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors file:mr-2 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Society Type</label>
              <select
                name="societyType"
                value={formData.societyType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                <option value="">Select Type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed">Mixed (Residential & Commercial)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea
                name="address"
                required
                rows="2"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter complete address"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
              <input
                type="text"
                name="pinCode"
                required
                value={formData.pinCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact & Subscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Society Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Society Email ID</label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan *</label>
              <select
                name="subscriptionPlan"
                required
                value={formData.subscriptionPlan}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                <option value="">Select Plan</option>
                <option value="Basic">Basic Plan (Free, limited features)</option>
                <option value="Premium">Premium Plan (All features included)</option>
                <option value="Enterprise">Enterprise Plan (Customized for large societies)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Blocks & Wings Configuration</h3>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Blocks/Wings</label>
            <input
              type="number"
              name="numberOfBlocks"
              min="0"
              max="50"
              value={formData.numberOfBlocks}
              onChange={handleInputChange}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="e.g. 3"
            />
          </div>

          {blocks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {blocks.map((block, index) => (
                <div key={index}>
                  <label className="block text-sm text-gray-600 mb-1">Block/Wing {index + 1} Name</label>
                  <input
                    type="text"
                    required
                    value={block}
                    onChange={(e) => handleBlockChange(index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder={`e.g. A, B, or Wing ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors shadow-sm ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Saving...' : 'Save Society Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SocietyDetailsTab;
