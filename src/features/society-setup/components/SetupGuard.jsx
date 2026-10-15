import React from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { SETUP_STATUS } from '../constants/setupConstants';
import { setupStorageService } from '../services/setupStorageService';

/**
 * SetupGuard protects admin dashboard routes and the wizard route.
 *
 * Props:
 * - mode: "require-completed" (default, for Dashboard routes)
 *         If setup is NOT completed, redirects to /:societyId/setup
 *         "require-incomplete" (for Wizard /setup routes)
 *         If setup is ALREADY completed, redirects to /:societyId/dashboard
 */
export const SetupGuard = ({ children, mode = 'require-completed' }) => {
  const { societyId: routeSocietyId } = useParams();
  const location = useLocation();

  const societyId =
    routeSocietyId ||
    localStorage.getItem('societyDatabase') ||
    'default';

  // Read current setup status from isolated service
  const currentStatus = setupStorageService.getSetupStatus(societyId);
  const isCompleted = currentStatus === SETUP_STATUS.COMPLETED;

  // Retrieve user session info if available
  let isAdmin = true;
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      const role = parsed.role;
      const roleKeys = parsed.roleKeys || [];
      // Only admins are required to complete setup; guards and vendors bypass setup wizard
      if (role === 'security_guard' || role === 'guard' || role === 'vendor') {
        isAdmin = false;
      } else {
        isAdmin =
          role === 'admin' ||
          role === 'super_admin' ||
          roleKeys.includes('admin') ||
          roleKeys.includes('super_admin');
      }
    }
  } catch (e) {
    // default to admin
  }

  // 1. If guarding Dashboard routes ("require-completed"):
  if (mode === 'require-completed') {
    if (isAdmin && !isCompleted) {
      // Setup not completed yet -> redirect to setup wizard
      const targetPath = routeSocietyId ? `/${routeSocietyId}/setup` : '/setup';
      return <Navigate to={targetPath} replace state={{ from: location }} />;
    }
    return children;
  }

  // 2. If guarding Setup Wizard route ("require-incomplete"):
  if (mode === 'require-incomplete') {
    if (isCompleted) {
      // Society already activated -> redirect straight to dashboard
      const targetPath = routeSocietyId ? `/${routeSocietyId}/dashboard` : '/dashboard';
      return <Navigate to={targetPath} replace />;
    }
    return children;
  }

  return children;
};

export default SetupGuard;
