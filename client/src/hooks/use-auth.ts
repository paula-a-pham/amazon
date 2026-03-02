import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { RegisterInput, LoginInput } from '@amazon-clone/shared/validators';
import { useAuthStore } from '@/stores/auth-store';
import { registerUser, loginUser, logoutUser, refreshAuth } from '@/services/auth-service';
import { setAccessToken } from '@/services/api-client';

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

  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
    onSuccess: (response) => {
      if (response.success) {
        setAuth(response.data.user, response.data.accessToken);
        queryClient.setQueryData(['auth', 'refresh'], response.data);
        navigate('/');
      }
    },
  });
};

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: (response) => {
      if (response.success) {
        setAuth(response.data.user, response.data.accessToken);
        queryClient.setQueryData(['auth', 'refresh'], response.data);
        navigate('/');
      }
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      setAccessToken(null);
      clearAuth();
      queryClient.setQueryData(['auth', 'refresh'], null);
      navigate('/login');
    },
  });
};
