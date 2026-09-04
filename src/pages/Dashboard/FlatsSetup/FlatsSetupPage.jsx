import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Building, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { flatApi } from '../../../services/flatApi';
import { blockApi } from '../../../services/blockApi';
import { usePermissions } from '../../../context/PermissionsContext';
import CreateFlatModal from './CreateFlatModal';

const FlatsSetupPage = () => {
  const [flats, setFlats] = useState([]);
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWing, setSelectedWing] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { hasModuleAccess, PERMISSION_LEVELS } = usePermissions();
  const canManageFlats = hasModuleAccess('society_flat_setup', PERMISSION_LEVELS.MANAGE) || hasModuleAccess('society_flat_setup', PERMISSION_LEVELS.FULL);

  const loadWings = async () => {
    try {
      const res = await blockApi.getWings();
      setWings(res.data?.blockDoc?.wings || []);
    } catch (err) {
      console.error('Failed to load wings', err);
    }
  };

  const loadFlats = async () => {
    setLoading(true);
    try {
      const params = selectedWing ? { blockId: selectedWing } : {};
      const response = await flatApi.getFlats(params);
      setFlats(response.data?.data?.flats || []);
    } catch (err) {
      console.error('Failed to load flats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWings();
  }, []);

  useEffect(() => {
    loadFlats();
  }, [selectedWing]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Society & Flats</h1>
          <p className="text-gray-500 mt-1">Manage all wings and flats in your society.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={selectedWing}
            onChange={(e) => setSelectedWing(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Wings</option>
            {wings.map((wing) => (
              <option key={wing._id} value={wing._id}>
                {wing.name}
              </option>
            ))}
          </select>

          {canManageFlats && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Flat
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <th className="px-6 py-4 font-semibold">Flat No.</th>
                <th className="px-6 py-4 font-semibold">Wing</th>
                <th className="px-6 py-4 font-semibold">Floor</th>
                <th className="px-6 py-4 font-semibold">Area (sq ft)</th>
                <th className="px-6 py-4 font-semibold">Occupancy</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                {canManageFlats && (
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 relative">
              {loading && (
                <tr>
                  <td colSpan="6">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 min-h-[200px]">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                    </div>
                  </td>
                </tr>
              )}

              {!loading && flats.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Building className="w-12 h-12 text-gray-300 mb-3" />
                      <p>No flats found. Add a new flat to get started.</p>
                    </div>
                  </td>
                </tr>
              )}

              {flats.map((flat) => (
                <tr key={flat._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{flat.flatNumber}</div>
                    <div className="text-xs text-gray-500">{flat.type || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {wings.find(w => w._id?.toString() === flat.blockId?.toString())?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {flat.floor}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {flat.area || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {flat.occupancyStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize">
                      {flat.status}
                    </span>
                  </td>
                  {canManageFlats && (
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`flats/${flat._id}`}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CreateFlatModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          wings={wings}
          flats={flats}
          onSuccess={() => {
            setIsModalOpen(false);
            loadFlats();
          }}
        />
      )}
    </div>
  );
};

export default FlatsSetupPage;
