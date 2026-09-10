import React, { useState, useEffect } from 'react';
import {
  FaUserEdit, FaEnvelope, FaPhone, FaIdCard, FaBuilding,
  FaHome, FaLayerGroup, FaShieldAlt, FaCalendarAlt, FaClock,
  FaCheck, FaTimes, FaSpinner, FaUserTag
} from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import { blockApi } from '../../services/blockApi';
import toast from 'react-hot-toast';

const InfoRow = ({ icon: Icon, label, value, badge, badgeColor }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
      <Icon className="text-gray-400 text-sm" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      {badge ? (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {(Array.isArray(value) ? value : [value]).map((v, i) => (
            <span key={i} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor || 'bg-orange-50 text-orange-600 border-orange-100'}`}>
              {v}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm font-semibold text-gray-800">{value || <span className="text-gray-400 font-normal italic">Not available</span>}</p>
      )}
    </div>
  </div>
);

const formatRole = (r) =>
  (r || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });
  const [flatDetails, setFlatDetails] = useState(null); // { flatNumber, wingName }
  const [loadingFlat, setLoadingFlat] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({ name: parsedUser.name || '', email: parsedUser.email || '', mobile: parsedUser.mobile || '' });
      if (parsedUser.flatId) fetchFlatDetails(parsedUser.flatId);
    }
  }, []);

  const fetchFlatDetails = async (flatId) => {
    setLoadingFlat(true);
    try {
      // Fetch flat + wings in parallel (same approach as residents list on BE)
      const [flatRes, blocksRes] = await Promise.all([
        apiClient.get(`/flats/${flatId}`),
        blockApi.getWings(),
      ]);
      const flat = flatRes.data?.data?.flat || flatRes.data?.data || flatRes.data?.flat || null;
      const wings = blocksRes?.blockDoc?.wings || blocksRes?.data?.blockDoc?.wings || [];
      // Cross-reference flat.blockId against wings list to get wing name
      const wing = flat?.blockId
        ? wings.find(w => String(w._id) === String(flat.blockId))
        : null;
      setFlatDetails({
        flatNumber: flat?.flatNumber || null,
        wingName: wing?.name || null,
      });
    } catch (err) {
      console.error('Failed to fetch flat details:', err);
    } finally {
      setLoadingFlat(false);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center p-16">
      <FaSpinner className="animate-spin text-2xl text-orange-500 mr-3" />
      <span className="text-gray-500">Loading profile...</span>
    </div>
  );

  const roleKeys = user.roleKeys || JSON.parse(localStorage.getItem('roleKeys') || '[]');
  const allRoles = [...new Set([...(user.role ? [user.role] : []), ...roleKeys])];
  const primaryRole = formatRole(user.role || roleKeys[0] || 'User');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await apiClient.patch(`/auth/me`, formData);
      const updatedUser = { ...user, ...formData, ...(res.data.data?.user || res.data.data || {}) };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({ name: user.name || '', email: user.email || '', mobile: user.mobile || '' });
    setIsEditing(false);
  };

  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <FaUserEdit /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <FaTimes className="text-xs" /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <FaCheck className="text-xs" /> Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-r from-orange-400 via-orange-300 to-amber-200 relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
          />
        </div>

        {/* Avatar + Name */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-14 mb-8">
            <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-3xl font-black">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 pb-1">
              <h3 className="text-2xl font-black text-gray-900">{user.name}</h3>
              <p className="text-gray-500 font-semibold text-sm mt-0.5">{primaryRole}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allRoles.map((r, i) => (
                  <span key={i} className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                    {formatRole(r)}
                  </span>
                ))}
              </div>
            </div>
            <div className="pb-1 shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Two-column detail grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Personal Information */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 space-y-0">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Personal Information</h4>

              {/* Name */}
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <FaIdCard className="text-gray-400 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                  {isEditing ? (
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold" />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <FaEnvelope className="text-gray-400 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                  {isEditing ? (
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold" />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">{user.email || <span className="text-gray-400 font-normal italic">Not provided</span>}</p>
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <FaPhone className="text-gray-400 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</p>
                  {isEditing ? (
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold" />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">{user.mobile || <span className="text-gray-400 font-normal italic">Not provided</span>}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Society & Access */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Society & Access</h4>

              <InfoRow icon={FaBuilding} label="Society" value={user.societyName || localStorage.getItem('societyName') || 'Unknown'} />

              <InfoRow
                icon={FaLayerGroup}
                label="Wing / Block"
                value={loadingFlat ? '...' : flatDetails?.wingName || (user.flatId ? '—' : null)}
              />

              <InfoRow
                icon={FaHome}
                label="Flat / Unit Number"
                value={loadingFlat ? '...' : flatDetails?.flatNumber || (user.flatId ? '—' : null)}
              />

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;

