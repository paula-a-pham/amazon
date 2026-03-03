import type { ApiResponse } from '@amazon-clone/shared/types';

const BASE_URL = '/api/v1';
const REQUEST_TIMEOUT_MS = 15000;

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
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: options.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const attemptRefresh = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
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
  let response: Response;

  try {
    response = await rawFetch(endpoint, options);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Taking longer than expected. Please try again.',
        },
      } as ApiResponse<T>;
    }

    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect. Please check your internet connection and try again.',
      },
    } as ApiResponse<T>;
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after');
    const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
    return {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: `Too many attempts. Please try again in ${retrySeconds} seconds.`,
      },
    } as ApiResponse<T>;
  }

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
