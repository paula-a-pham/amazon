import { create } from 'zustand';
import type { User } from '@amazon-clone/shared/types';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, _accessToken) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },
  clearAuth: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
