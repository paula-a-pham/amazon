import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { RegisterInput, LoginInput } from '@amazon-clone/shared/validators';
import { useAuthStore } from '@/stores/auth-store';
import { useToastStore } from '@/stores/toast-store';
import { registerUser, loginUser, logoutUser, refreshAuth, forgotPassword, resetPasswordRequest, resendVerification } from '@/services/auth-service';
import { setAccessToken } from '@/services/api-client';
import { broadcastAuthEvent } from '@/hooks/use-auth-sync';
import { useRedirectAfterLogin } from '@/hooks/use-redirect-after-login';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  return { user, isAuthenticated, isLoading };
};

export const useAuthInit = () => {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  const { isLoading } = useQuery({
    queryKey: ['auth', 'refresh'],
    queryFn: async () => {
      const response = await refreshAuth();
      if (response.success) {
        setAuth(response.data.user, response.data.accessToken);
        return response.data;
      }
      clearAuth();
      return null;
    },
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    onSuccess: (response) => {
      if (response.success) {
        setAuth(response.data.user, response.data.accessToken);
        queryClient.setQueryData(['auth', 'refresh'], response.data);
        broadcastAuthEvent('AUTH_LOGIN');
        addToast('Account created successfully!');
        navigate('/');
      }
    },
  });
};

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const { redirectPath, clearRedirect } = useRedirectAfterLogin();

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: (response) => {
      if (response.success) {
        setAuth(response.data.user, response.data.accessToken);
        queryClient.setQueryData(['auth', 'refresh'], response.data);
        broadcastAuthEvent('AUTH_LOGIN');
        addToast('Welcome back!');
        navigate(redirectPath);
        clearRedirect();
      }
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: () => logoutUser(),
    onMutate: () => {
      // Optimistic: clear state before API call
      setAccessToken(null);
      clearAuth();
      queryClient.setQueryData(['auth', 'refresh'], null);
    },
    onSuccess: () => {
      broadcastAuthEvent('AUTH_LOGOUT');
      addToast('You have been signed out.');
      navigate('/login');
    },
    onError: () => {
      // Even if API fails, keep user logged out locally
      broadcastAuthEvent('AUTH_LOGOUT');
      navigate('/login');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => forgotPassword(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => resetPasswordRequest(data),
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => resendVerification(data),
  });
};
