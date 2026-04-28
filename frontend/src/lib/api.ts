import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import type { AuthTokensResponse } from '../types/user';
import { env } from './env';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getRememberPreference,
  setTokens,
} from './authStorage';

const baseURL = env.apiUrl;

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthTokensResponse>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    setTokens(data.accessToken, data.refreshToken, getRememberPreference());
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/register')
    ) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccess = await refreshPromise;
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
