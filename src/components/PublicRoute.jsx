import React from 'react';
import { Navigate } from 'react-router-dom';
import { SETUP_STATUS } from '../features/society-setup/constants/setupConstants';
import { setupStorageService } from '../features/society-setup/services/setupStorageService';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');

  // No active session — show the public page as normal
  if (!token) {
    return children;
  }

  // Active session — resolve the correct redirect destination
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch {
    // Corrupted storage — fall through and show the login page
    return children;
  }

  if (!user) return children;

  const societyId = user.societyId || localStorage.getItem('societyDatabase');
  const role = user.role || '';
  const roleKeys = user.roleKeys || [];

  // Guards and vendors skip the setup wizard entirely
  const isGuardOrVendor =
    role === 'security_guard' ||
    role === 'guard' ||
    role === 'vendor' ||
    roleKeys.includes('vendor');

  if (isGuardOrVendor) {
    return <Navigate to={`/${societyId}/dashboard`} replace />;
  }

  // Admins: check setup completion
  const setupStatus = user.setupStatus || setupStorageService.getSetupStatus(societyId);
  const setupComplete = setupStatus === SETUP_STATUS.COMPLETED;

  if (setupComplete) {
    return <Navigate to={`/${societyId}/dashboard`} replace />;
  }

  return <Navigate to={`/${societyId}/setup`} replace />;
};

export default PublicRoute;
