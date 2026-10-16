import React from 'react';
import { FiCheckCircle, FiInfo } from 'react-icons/fi';
import { SOCIETY_TYPES } from '../constants/setupConstants';
import { useSetupWizard } from '../hooks/useSetupWizard';
import StepInfoCard from '../components/StepInfoCard';

const Step1SocietyDetails = () => {
  const { societyDetails, updateSocietyDetails, validationErrors } = useSetupWizard();

  const handleChange = (field, value) => {
    updateSocietyDetails({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Register Society</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up your society legal and registration information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {/* Left 3 Cols on XL: Form */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          {/* Main Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">1. Society Legal Information</h2>
                <p className="text-xs text-gray-500">Official registered identity and government records</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {societyDetails.status || 'Setup / Pending'}
              </span>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Society Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Green Valley Residency"
                    value={societyDetails.societyName || ''}
                    onChange={(e) => handleChange('societyName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                  {validationErrors.societyName && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.societyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Society Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={societyDetails.societyType || 'Mixed (Residential + Commercial)'}
                    onChange={(e) => handleChange('societyType', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  >
                    {SOCIETY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {validationErrors.societyType && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.societyType}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GVR/2025/001"
                    value={societyDetails.registrationNumber || ''}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                  {validationErrors.registrationNumber && (
                    <p className="text-[11px] text-red-500 mt-1">{validationErrors.registrationNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Society Registration Date
                  </label>
                  <input
                    type="date"
                    value={societyDetails.registrationDate || ''}
                    onChange={(e) => handleChange('registrationDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Society Code / ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GVR-2025-0001"
                    value={societyDetails.societyCode || ''}
                    onChange={(e) => handleChange('societyCode', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address & Contact Information */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-1">Society Location & Official Contacts</h2>
            <p className="text-xs text-gray-500 mb-6">Registered physical address and official communication channels</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot No. 42, Sector 18, Palm Beach Road"
                  value={societyDetails.streetAddress || ''}
                  onChange={(e) => handleChange('streetAddress', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Navi Mumbai"
                    value={societyDetails.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={societyDetails.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 400705"
                    value={societyDetails.pincode || ''}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Official Email ID
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. office@greenvalleyresidency.com"
                    value={societyDetails.contactEmail || ''}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Official Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9226605656"
                    value={societyDetails.contactPhone || ''}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-1 xl:col-span-1">
          <StepInfoCard
            title="About this step"
            description="Enter the core legal and identification details of your society. This information will appear on official certificates, invoices, and notices."
            items={[
              'Ensure the registration number matches your government registration certificate.',
              'Society code will be used as a prefix for unit and member IDs.',
              'Choose the correct society type to configure appropriate tax and billing rules.',
            ]}
            tipsTitle="Quick Guidelines"
            tips={[
              'Have your registration certificate handy for verification.',
              'All details can be edited before final activation.',
              'Society code cannot be changed once activated.',
            ]}
            illustration="building"
          />
        </div>
      </div>
    </div>
  );
};

export default Step1SocietyDetails;
