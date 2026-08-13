import React, { useState, useEffect } from 'react';
import { blockApi } from '../../../services/blockApi';
import { societyApi } from '../../../services/societyApi';
import { FaBuilding, FaSave, FaSpinner } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';

const WING_STATUS_OPTIONS = ['Active', 'Inactive', 'Under Maintenance'];

const defaultWing = (name = '') => ({
  name,
  code: '',
  totalFloors: '',
  totalFlats: '',
  status: 'Active',
  assignedStaff: '',
});

const WingDetailsTab = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [wings, setWings] = useState([]);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch society to get the wing names defined in Society Details
      const [societyRes, wingsRes, staffRes] = await Promise.allSettled([
        societyApi.getCurrentSociety(),
        blockApi.getWings(),
        blockApi.getStaffList(),
      ]);

      let societyWingNames = [];
      if (societyRes.status === 'fulfilled') {
        const society = societyRes.value?.data?.society;
        if (society?.blocks && Array.isArray(society.blocks)) {
          societyWingNames = society.blocks;
        }
      }

      let savedWings = [];
      if (wingsRes.status === 'fulfilled') {
        savedWings = wingsRes.value?.data?.blockDoc?.wings || [];
      }

      if (staffRes.status === 'fulfilled') {
        setStaffList(staffRes.value?.data?.staff || []);
      }

      // Merge: use saved data if it exists, otherwise create default from society wing name
      if (societyWingNames.length > 0) {
        const mergedWings = societyWingNames.map((name) => {
          const existing = savedWings.find((w) => w.name === name);
          if (existing) {
            return {
              name: existing.name,
              code: existing.code || '',
              totalFloors: existing.totalFloors || '',
              totalFlats: existing.totalFlats || '',
              status: existing.status || 'Active',
              assignedStaff: existing.assignedStaff?._id || existing.assignedStaff || '',
            };
          }
          return defaultWing(name);
        });
        setWings(mergedWings);
      } else if (savedWings.length > 0) {
        // No society-level wing names defined, but we have saved wings
        setWings(
          savedWings.map((w) => ({
            name: w.name,
            code: w.code || '',
            totalFloors: w.totalFloors || '',
            totalFlats: w.totalFlats || '',
            status: w.status || 'Active',
            assignedStaff: w.assignedStaff?._id || w.assignedStaff || '',
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load wing details.');
    } finally {
      setLoading(false);
    }
  };

  const handleWingChange = (index, field, value) => {
    const updated = [...wings];
    updated[index] = { ...updated[index], [field]: value };
    setWings(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await blockApi.saveWings(wings);
      setSuccessMsg('Wing details saved successfully!');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to save wing details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <FaSpinner className="animate-spin mr-2 text-blue-500" size={20} />
        <span>Loading wing details...</span>
      </div>
    );
  }

  if (wings.length === 0) {
    return (
      <div className="text-center py-16">
        <FaBuilding size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Wings Configured</h3>
        <p className="text-gray-500 text-sm">
          Go to the <strong>Society Details</strong> tab and enter the number of blocks/wings and their names first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
      {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {wings.map((wing, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Wing Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {String.fromCharCode(65 + index)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{wing.name || `Wing ${index + 1}`}</h4>
                <p className="text-xs text-gray-500">Block / Wing {index + 1}</p>
              </div>
              <MdEdit className="ml-auto text-gray-400" size={16} />
            </div>

            {/* Wing Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
              {/* Name (pre-filled, read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Block/Wing Name *
                </label>
                <input
                  type="text"
                  value={wing.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Block/Wing Code *
                </label>
                <input
                  type="text"
                  required
                  value={wing.code}
                  onChange={(e) => handleWingChange(index, 'code', e.target.value)}
                  placeholder="e.g. A, B1, T1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>

              {/* Total Floors */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Number of Floors *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={wing.totalFloors}
                  onChange={(e) => handleWingChange(index, 'totalFloors', e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>

              {/* Total Flats */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Number of Flats
                </label>
                <input
                  type="number"
                  min="0"
                  value={wing.totalFlats}
                  onChange={(e) => handleWingChange(index, 'totalFlats', e.target.value)}
                  placeholder="e.g. 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={wing.status}
                  onChange={(e) => handleWingChange(index, 'status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm"
                >
                  {WING_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Staff */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Assigned Staff / Manager
                </label>
                <select
                  value={wing.assignedStaff}
                  onChange={(e) => handleWingChange(index, 'assignedStaff', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm"
                >
                  <option value="">-- Select Staff --</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Submit */}
        <div className="flex justify-end pt-2 pb-4">
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors shadow-sm ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {submitting ? 'Saving...' : 'Save Wing Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WingDetailsTab;
