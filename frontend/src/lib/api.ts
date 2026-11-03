import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, AuthResponseData } from '@/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let inMemoryToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

export const setAuthTokens = (accessToken: string | null, refreshToken: string | null) => {
  inMemoryToken = accessToken;
  inMemoryRefreshToken = refreshToken;
  if (accessToken && refreshToken) {
    sessionStorage.setItem('hireflow_refresh_token', refreshToken);
  } else {
    sessionStorage.removeItem('hireflow_refresh_token');
  }
};

export const getStoredRefreshToken = (): string | null => {
  return inMemoryRefreshToken || sessionStorage.getItem('hireflow_refresh_token');
};

export const getAccessToken = () => inMemoryToken;

// Request Interceptor: Attach JWT Bearer
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Refresh Token Rotation on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefresh = getStoredRefreshToken();
      if (!storedRefresh) {
        setAuthTokens(null, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const resp = await axios.post<ApiResponse<AuthResponseData>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: storedRefresh }
        );

        if (resp.data?.success && resp.data.data) {
          const { accessToken, refreshToken } = resp.data.data;
          setAuthTokens(accessToken, refreshToken);
          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          setAuthTokens(null, null);
          processQueue(new Error('Refresh failed'), null);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        setAuthTokens(null, null);
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
