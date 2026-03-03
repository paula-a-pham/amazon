import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useResendVerification } from '@/hooks/use-auth';
import { getSessionItem, setSessionItem } from '@/utils/session-storage';

const DISMISS_KEY = 'email_banner_dismissed';
const RESHOW_HOURS = 24;

export const EmailVerificationBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const resendMutation = useResendVerification();

  // Check if previously dismissed within the reshow window
  useEffect(() => {
    const dismissedAt = getSessionItem<number>(DISMISS_KEY);
    if (dismissedAt) {
      const hoursSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60);
      if (hoursSinceDismiss < RESHOW_HOURS) {
        setDismissed(true);
      }
    }
  }, []);

  if (dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setSessionItem(DISMISS_KEY, Date.now());
    setDismissed(true);
  };

  const handleResend = () => {
    if (user?.email) {
      resendMutation.mutate({ email: user.email });
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200" role="alert">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
        <p className="text-sm text-amber-700">
          {resendMutation.data?.success
            ? 'Verification email sent! Check your inbox.'
            : 'Please verify your email address to access all features.'}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          {!resendMutation.data?.success && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="text-sm font-medium text-amber-700 underline hover:text-amber-900 transition-colors disabled:opacity-50"
            >
              {resendMutation.isPending ? 'Sending...' : 'Resend email'}
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
