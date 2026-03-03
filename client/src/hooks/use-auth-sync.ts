import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { setAccessToken } from '@/services/api-client';

type AuthEvent = 'AUTH_LOGIN' | 'AUTH_LOGOUT';

const CHANNEL_NAME = 'amazon_auth_sync';
const STORAGE_KEY = 'amazon_auth_event';

let channel: BroadcastChannel | null = null;

const getChannel = (): BroadcastChannel | null => {
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    return channel;
  } catch {
    return null;
  }
};

export const broadcastAuthEvent = (event: AuthEvent): void => {
  const ch = getChannel();
  if (ch) {
    ch.postMessage(event);
  } else {
    // Fallback: use localStorage event (fires across tabs)
    localStorage.setItem(STORAGE_KEY, `${event}:${Date.now()}`);
  }
};

export const useAuthSync = () => {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuthEvent = (event: AuthEvent) => {
      if (event === 'AUTH_LOGIN') {
        // Refetch auth state — the refresh cookie will be valid
        queryClient.invalidateQueries({ queryKey: ['auth', 'refresh'] });
      } else if (event === 'AUTH_LOGOUT') {
        setAccessToken(null);
        clearAuth();
        queryClient.setQueryData(['auth', 'refresh'], null);
      }
    };

    // Try BroadcastChannel first
    const ch = getChannel();
    const bcHandler = (e: MessageEvent) => handleAuthEvent(e.data as AuthEvent);

    if (ch) {
      ch.addEventListener('message', bcHandler);
    }

    // Fallback: storage event (always listen — works even if BroadcastChannel exists)
    const storageHandler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      const event = e.newValue.split(':')[0] as AuthEvent;
      handleAuthEvent(event);
    };

    window.addEventListener('storage', storageHandler);

    return () => {
      ch?.removeEventListener('message', bcHandler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [clearAuth, queryClient]);
};
