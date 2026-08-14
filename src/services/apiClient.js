import axios from 'axios';
import toast from 'react-hot-toast';
import { clearAuthSession, isSessionExpiredError, redirectToLogin } from '../utils/authSession';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let permissionsStaleHandler = null;
let permissionsRefreshPromise = null;
let sessionExpiredHandler = null;
let isLoggingOut = false;

export const setPermissionsStaleHandler = (handler) => {
  permissionsStaleHandler = handler;
};

export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

export const handleSessionExpired = ({ silent = false } = {}) => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  clearAuthSession();

  if (!silent) {
    toast.error('Your session has expired. Please sign in again.');
  }

  if (sessionExpiredHandler) {
    sessionExpiredHandler();
  } else {
    redirectToLogin('/');
  }
};

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const staleHeader = response.headers['x-permissions-stale'];

    if (staleHeader === 'true' && permissionsStaleHandler) {
      if (!permissionsRefreshPromise) {
        permissionsRefreshPromise = Promise.resolve(permissionsStaleHandler())
          .finally(() => {
            permissionsRefreshPromise = null;
          });
      }
    }

    return response;
  },
  (error) => {
    if (isSessionExpiredError(error)) {
      handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
