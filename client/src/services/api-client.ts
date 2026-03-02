import type { ApiResponse } from '@amazon-clone/shared/types';

const BASE_URL = '/api/v1';

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const rawFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
};

const attemptRefresh = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = (await response.json()) as ApiResponse<{ accessToken: string }>;
    if (data.success) {
      accessToken = data.data.accessToken;
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const response = await rawFetch(endpoint, options);

  if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    // Prevent concurrent refresh attempts
    if (!refreshPromise) {
      refreshPromise = attemptRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      const retryResponse = await rawFetch(endpoint, options);
      return retryResponse.json() as Promise<ApiResponse<T>>;
    }
  }

  return response.json() as Promise<ApiResponse<T>>;
};
