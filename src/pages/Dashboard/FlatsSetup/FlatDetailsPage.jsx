import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Edit3, X, UserPlus } from 'lucide-react';
import { flatApi } from '../../../services/flatApi';
import AllocateResidentModal from './AllocateResidentModal';
import ExistingResidentModal from './ExistingResidentModal';
import ResidentSourcePicker from './ResidentSourcePicker';

const FlatDetailsPage = () => {
  const { flatId } = useParams();
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [allocateMode, setAllocateMode] = useState(null); // 'existing' | 'new'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadFlatDetails();
  }, [flatId]);

  const loadFlatDetails = async () => {
    setLoading(true);
    try {
      const response = await flatApi.getFlatById(flatId);
      const data = response.data?.data?.flat || null;
      setFlat(data);
      if (data) {
        setFormData({
          type: data.type || '',
          area: data.area || '',
          ownershipType: data.ownershipType || '',
          occupancyStatus: data.occupancyStatus || '',
          numberOfResidents: data.numberOfResidents || 0,
          parkingSlots: data.parkingSlots || 0,
          status: data.status || '',
          possessionDate: data.possessionDate ? new Date(data.possessionDate).toISOString().split('T')[0] : '',
          ownerName: data.ownerName || '',
          ownerContact: data.ownerContact || ''
        });
      }
    } catch (err) {
      console.error('Failed to load flat details', err);
      setError('Failed to load flat details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const payload = { ...formData };
      if (payload.area) payload.area = Number(payload.area);
      if (payload.numberOfResidents) payload.numberOfResidents = Number(payload.numberOfResidents);
      if (payload.parkingSlots) payload.parkingSlots = Number(payload.parkingSlots);

      await flatApi.updateFlat(flatId, payload);
      setIsEditing(false);
      loadFlatDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update flat');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!flat) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Flat not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-orange-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flat {flat.flatNumber}</h1>
            <p className="text-gray-500 mt-1">Floor {flat.floor}</p>
          </div>
        </div>

        {!isEditing ? (
          <div className="flex items-center gap-3">
            {flat.occupancyStatus === 'Vacant' && (
              <button
                onClick={() => setShowSourcePicker(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Allocate Resident
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit Details
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                loadFlatDetails(); // Reset form
              }}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Type</label>
              {isEditing ? (
                <input type="text" name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              ) : (
                <div className="text-gray-900 font-medium">{flat.type || '—'}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Area (sq ft)</label>
              {isEditing ? (
                <input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              ) : (
                <div className="text-gray-900 font-medium">{flat.area || '—'}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Possession Date</label>
              {isEditing ? (
                <input type="date" name="possessionDate" value={formData.possessionDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              ) : (
                <div className="text-gray-900 font-medium">{flat.possessionDate ? new Date(flat.possessionDate).toLocaleDateString() : '—'}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Occupancy & Ownership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ownership Type</label>
              {isEditing ? (
                <select name="ownershipType" value={formData.ownershipType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="Freehold">Freehold</option>
                  <option value="Leasehold">Leasehold</option>
                  <option value="Builder">Builder</option>
                </select>
              ) : (
                <div className="text-gray-900 font-medium">{flat.ownershipType || '—'}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Occupancy Status</label>
              {isEditing ? (
                <select name="occupancyStatus" value={formData.occupancyStatus} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="Vacant">Vacant</option>
                  <option value="Owner Occupied">Owner Occupied</option>
                  <option value="Tenant Occupied">Tenant Occupied</option>
                </select>
              ) : (
                <div className="text-gray-900 font-medium">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {flat.occupancyStatus || '—'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Flat Status</label>
              {isEditing ? (
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              ) : (
                <div className="text-gray-900 font-medium capitalize">{flat.status || '—'}</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Residents</label>
                {isEditing ? (
                  <input type="number" name="numberOfResidents" value={formData.numberOfResidents} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
                ) : (
                  <div className="text-gray-900 font-medium">{flat.numberOfResidents || '0'}</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Parking Slots</label>
                {isEditing ? (
                  <input type="number" name="parkingSlots" value={formData.parkingSlots} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
                ) : (
                  <div className="text-gray-900 font-medium">{flat.parkingSlots || '0'}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Owner Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Owner Name</label>
              {isEditing ? (
                <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="e.g. John Doe" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              ) : (
                <div className="text-gray-900 font-medium">{flat.ownerName || '—'}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Owner Contact</label>
              {isEditing ? (
                <input type="text" name="ownerContact" value={formData.ownerContact} onChange={handleChange} placeholder="e.g. +91 9876543210" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
              ) : (
                <div className="text-gray-900 font-medium">{flat.ownerContact || '—'}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSourcePicker && flat && (
        <ResidentSourcePicker
          flat={flat}
          onClose={() => setShowSourcePicker(false)}
          onSelect={(mode) => {
            setAllocateMode(mode);
            setShowSourcePicker(false);
            setShowAllocateModal(true);
          }}
        />
      )}

      {showAllocateModal && flat && allocateMode === 'existing' && (
        <ExistingResidentModal
          flat={flat}
          onClose={() => {
            setShowAllocateModal(false);
            setAllocateMode(null);
          }}
          onSuccess={() => {
            setShowAllocateModal(false);
            setAllocateMode(null);
            loadFlatDetails();
          }}
        />
      )}

      {showAllocateModal && flat && allocateMode === 'new' && (
        <AllocateResidentModal
          flat={flat}
          mode={allocateMode}
          onClose={() => {
            setShowAllocateModal(false);
            setAllocateMode(null);
          }}
          onSuccess={() => {
            setShowAllocateModal(false);
            setAllocateMode(null);
            loadFlatDetails();
          }}
        />
      )}
    </div>
  );
};

export default FlatDetailsPage;
