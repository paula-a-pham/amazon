import type { AuthResponse } from '@amazon-clone/shared/types';
import type { RegisterInput, LoginInput } from '@amazon-clone/shared/validators';
import { apiClient, setAccessToken } from '@/services/api-client';

export const registerUser = async (data: RegisterInput) => {
  const response = await apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success) {
    setAccessToken(response.data.accessToken);
  }

  return response;
};

export const loginUser = async (data: LoginInput) => {
  const response = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success) {
    setAccessToken(response.data.accessToken);
  }

  return response;
};

export const refreshAuth = async () => {
  const response = await apiClient<AuthResponse>('/auth/refresh', {
    method: 'POST',
  });

  if (response.success) {
    setAccessToken(response.data.accessToken);
  }

  return response;
};

export const logoutUser = async () => {
  const response = await apiClient<{ message: string }>('/auth/logout', {
    method: 'POST',
  });

  setAccessToken(null);
  return response;
};

export const forgotPassword = async (data: { email: string }) => {
  return apiClient<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const resetPasswordRequest = async (data: { token: string; password: string }) => {
  return apiClient<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const verifyEmailRequest = async (data: { token: string }) => {
  return apiClient<{ message: string }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const resendVerification = async (data: { email: string }) => {
  return apiClient<{ message: string }>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
