import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { localStorageService } from '@/services/storage/localStorage';
import { useAppStore } from '@/stores/useAppStore';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ====================================
// GLOBAL REFRESH TOKEN HANDLING
// ====================================
let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  subscribers.push(cb);
}

function onRefreshed(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

async function refreshAccessToken() {
  const refreshToken = localStorageService.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const baseURL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const refreshUrl = `${baseURL}/auth/refresh`;

  const response = await axios.post(refreshUrl, {
    refreshToken,
  });
  const { accessToken, expiresIn, accesstoken } =
    response.data.data || response.data;
  if (!accessToken) {
    // Clear store and logout if no access token
    useAppStore.getState().logout();
    localStorageService.removeToken();
    localStorageService.removeUser();
    throw new Error('Refresh failed - no access token');
  }

  localStorageService.setToken(accessToken);
  localStorageService.setRefreshToken(accesstoken);
  if (expiresIn) localStorageService.setExpiresIn(expiresIn);

  return accessToken;
}
// ====================================
// REQUEST INTERCEPTOR
// ====================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers || {};

    const token = localStorageService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

// ====================================
// RESPONSE INTERCEPTOR
// ====================================
apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't refresh token for auth endpoints (login, register, etc.)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/refresh');
    
    // Only attempt token refresh if:
    // 1. Status is 401
    // 2. Request hasn't been retried
    // 3. It's not an auth endpoint (login/register)
    // 4. We have a refresh token available
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !isAuthEndpoint &&
        localStorageService.getRefreshToken()) {
      originalRequest._retry = true;

      // avoid multiple refresh requests
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          onRefreshed(newToken);
        } catch (err) {
          isRefreshing = false;
          // toast.error('You may have loggedin from another device, please login again');
          // Clear store and logout
          useAppStore.getState().logout();
          localStorageService.removeToken();
          localStorageService.removeUser();
          // window.location.href = '/login';
          return Promise.reject(err);
        }
      }

      // wait until token is refreshed
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    // OTHER ERRORS
    if (error.response) {
      const message =
        (error.response.data as { message?: string })?.message ||
        'An error occurred';

      console.log(message);
    } else if (error.request) {
      toast.error('Network Error');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
