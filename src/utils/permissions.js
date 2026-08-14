export const PERMISSION_LEVELS = {
  NO_ACCESS: 0,
  VIEW: 1,
  MANAGE: 2,
  FULL: 3,
};

export const loadStoredPermissions = () => {
  try {
    const raw = localStorage.getItem('permissions');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const hasModuleAccess = (permissions, moduleId, minLevel = PERMISSION_LEVELS.VIEW) => {
  const perm = permissions?.[moduleId];
  return Boolean(perm && perm.level >= minLevel);
};
