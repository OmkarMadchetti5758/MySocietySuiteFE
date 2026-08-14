/** Keys cleared on logout / session expiry */
const AUTH_STORAGE_KEYS = [
  'accessToken',
  'refreshToken',
  'user',
  'permissions',
  'permissionsVersion',
  'roleKeys',
  'societyDatabase',
  'societyName',
];

export const clearAuthSession = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

/**
 * Returns true when a 401 indicates the access token is expired or invalid.
 * Skips public auth endpoints (login, invite, refresh).
 */
export const isSessionExpiredError = (error) => {
  const status = error?.response?.status;
  if (status !== 401) return false;

  const url = error?.config?.url || '';
  const publicPaths = [
    '/auth/login',
    '/auth/super-admin/login',
    '/auth/invite/',
    '/auth/refresh-token',
  ];

  if (publicPaths.some((path) => url.includes(path))) {
    return false;
  }

  const data = error.response?.data || {};
  const errorCode = data.errorCode || data.code;
  const message = (data.message || '').toLowerCase();

  if (errorCode === 'TOKEN_EXPIRED') return true;
  if (errorCode === 'TOKEN_INVALID' || errorCode === 'INVALID_TOKEN_TYPE') return true;
  if (message.includes('expired')) return true;
  if (message.includes('invalid token') || message.includes('invalid access token')) return true;
  if (message.includes('no token provided') || message.includes('token missing')) return true;

  // Default: treat 401 on protected routes as session expired
  return true;
};

export const redirectToLogin = (path = '/') => {
  if (window.location.pathname !== path) {
    window.location.href = path;
  } else {
    window.location.reload();
  }
};
