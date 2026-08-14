import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../services/authApi';
import { setPermissionsStaleHandler, setSessionExpiredHandler } from '../services/apiClient';
import { clearAuthSession, isSessionExpiredError, redirectToLogin } from '../utils/authSession';
import { hasModuleAccess as checkModuleAccess, loadStoredPermissions, PERMISSION_LEVELS } from '../utils/permissions';

const PermissionsContext = createContext(null);

const persistAuthPayload = ({ permissions, permissionsVersion, roleKeys, accessToken, refreshToken }) => {
  if (permissions) {
    localStorage.setItem('permissions', JSON.stringify(permissions));
  }
  if (permissionsVersion !== undefined) {
    localStorage.setItem('permissionsVersion', String(permissionsVersion));
  }
  if (roleKeys) {
    localStorage.setItem('roleKeys', JSON.stringify(roleKeys));
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.roleKeys = roleKeys;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch {
      // ignore malformed user payload
    }
  }
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(() => loadStoredPermissions());

  const applyPermissions = useCallback((nextPermissions) => {
    setPermissions(nextPermissions);
    localStorage.setItem('permissions', JSON.stringify(nextPermissions));
    window.dispatchEvent(new CustomEvent('permissions-updated', { detail: nextPermissions }));
    return nextPermissions;
  }, []);

  const refreshPermissions = useCallback(async ({ silent = false } = {}) => {
    try {
      const response = await authApi.refreshPermissions();
      const payload = response.data;

      persistAuthPayload(payload);
      applyPermissions(payload.permissions);

      if (!silent) {
        toast.success('Your access permissions were updated.');
      }

      return payload;
    } catch (error) {
      console.error('Failed to refresh permissions', error);
      if (!isSessionExpiredError(error) && !silent) {
        toast.error('Could not refresh permissions. Please sign in again.');
      }
      throw error;
    }
  }, [applyPermissions]);

  const setPermissionsFromLogin = useCallback((payload) => {
    persistAuthPayload(payload);
    applyPermissions(payload.permissions);
  }, [applyPermissions]);

  useEffect(() => {
    setPermissionsStaleHandler(() => refreshPermissions({ silent: true }));

    setSessionExpiredHandler(() => {
      clearAuthSession();
      setPermissions({});
      redirectToLogin('/');
    });
  }, [refreshPermissions]);

  const hasModuleAccess = useCallback(
    (moduleId, minLevel = PERMISSION_LEVELS.VIEW) => checkModuleAccess(permissions, moduleId, minLevel),
    [permissions]
  );

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        setPermissions: applyPermissions,
        setPermissionsFromLogin,
        refreshPermissions,
        hasModuleAccess,
        PERMISSION_LEVELS,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
};
