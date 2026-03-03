import { useCallback } from 'react';
import { getSessionItem, setSessionItem, removeSessionItem } from '@/utils/session-storage';

const REDIRECT_KEY = 'redirect_after_login';

export const saveRedirectPath = (path: string): void => {
  // Don't save auth-related paths
  if (path.startsWith('/login') || path.startsWith('/register')) return;
  setSessionItem(REDIRECT_KEY, path);
};

export const useRedirectAfterLogin = () => {
  const redirectPath = getSessionItem<string>(REDIRECT_KEY) ?? '/';

  const clearRedirect = useCallback(() => {
    removeSessionItem(REDIRECT_KEY);
  }, []);

  return { redirectPath, clearRedirect };
};
