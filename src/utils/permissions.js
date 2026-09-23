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
  const targetLevel = typeof minLevel === 'string' ? (PERMISSION_LEVELS[minLevel] ?? PERMISSION_LEVELS.VIEW) : minLevel;
  return Boolean(perm && perm.level >= targetLevel);
};

export const hasModuleScope = (permissions, moduleId, minLevel = PERMISSION_LEVELS.MANAGE, excludedScopes = ['own', 'assigned', 'none']) => {
  const perm = permissions?.[moduleId];
  if (!perm) return false;
  const targetLevel = typeof minLevel === 'string' ? (PERMISSION_LEVELS[minLevel] ?? PERMISSION_LEVELS.MANAGE) : minLevel;
  if (perm.level < targetLevel) return false;
  if (perm.scope && excludedScopes.includes(perm.scope)) return false;
  return true;
};
