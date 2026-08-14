import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaEnvelope, FaPhone, FaIdCard, FaBuilding } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        mobile: parsedUser.mobile || '',
      });
    }
  }, []);

  if (!user) return <div className="p-8">Loading profile...</div>;

  const roleKeys = user.roleKeys || JSON.parse(localStorage.getItem('roleKeys') || '[]');
  const roleLabel = roleKeys.length > 1
    ? `${roleKeys.length} roles`
    : (user.role || roleKeys[0] || 'User').replace(/_/g, ' ');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const id = user._id || user.id;
      if (!id) {
        toast.error("User ID not found");
        return;
      }
      
      const res = await apiClient.patch(`/auth/me`, formData);
      // Backend returns the updated user in res.data.data.user
      const updatedUser = { ...user, ...formData, ...(res.data.data?.user || res.data.data || res.data) };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <FaUserEdit />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-orange-100 to-orange-50"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-8">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-orange-100 text-orange-600 flex items-center justify-center text-4xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-500 font-medium capitalize">{roleLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personal Information</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 text-gray-800 font-medium">
                      <FaIdCard className="text-gray-400" />
                      {user.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 text-gray-800 font-medium">
                      <FaEnvelope className="text-gray-400" />
                      {user.email || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 text-gray-800 font-medium">
                      <FaPhone className="text-gray-400" />
                      {user.mobile || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Settings</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                  <div className="flex items-center gap-3 text-gray-800 font-medium capitalize">
                    <FaIdCard className="text-gray-400" />
                    {roleLabel}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Roles cannot be changed from the profile screen.</p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Society Access</label>
                  <div className="flex items-center gap-3 text-gray-800 font-medium">
                    <FaBuilding className="text-gray-400" />
                    {localStorage.getItem('societyName') || 'Unknown Society'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
