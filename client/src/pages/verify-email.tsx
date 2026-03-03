import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useResendVerification, useAuth } from '@/hooks/use-auth';
import { useRateLimitTimer } from '@/hooks/use-rate-limit-timer';
import { useAuthStore } from '@/stores/auth-store';
import { verifyEmailRequest } from '@/services/auth-service';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { user, isAuthenticated } = useAuth();
  const updateUser = useAuthStore((s) => s.updateUser);
  const resendMutation = useResendVerification();

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const initiated = useRef(false);

  const resendError =
    resendMutation.data && !resendMutation.data.success
      ? resendMutation.data.error
      : null;

  const resendRateLimited = resendError?.code === 'RATE_LIMITED';
  const { secondsRemaining, isRateLimited } = useRateLimitTimer(
    resendRateLimited ? resendError?.message : undefined,
  );

  const tokenExpired = errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid');

  useEffect(() => {
    if (!token || initiated.current) return;
    initiated.current = true;

    setStatus('loading');
    verifyEmailRequest({ token })
      .then((response) => {
        if (response.success) {
          setStatus('success');
          updateUser({ emailVerified: true });
        } else {
          setStatus('error');
          setErrorMessage(response.error.message);
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMessage('Failed to verify email. Please check your connection and try again.');
      });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    const email = user?.email ?? resendEmail;
    if (email) {
      resendMutation.mutate({ email });
    }
  };

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Verifying your email address."
    >
      <div className="mt-6 space-y-4" aria-live="polite">
        {!token && (
          <Alert variant="error">
            Missing verification token. Please use the link from your email.
          </Alert>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <Alert variant="success">
              Your email has been verified successfully!
            </Alert>
            {isAuthenticated ? (
              <Link to="/">
                <Button variant="cta" className="w-full">
                  Continue to home
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="cta" className="w-full">
                  Continue to sign in
                </Button>
              </Link>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <Alert variant="error">
              {errorMessage}
            </Alert>
            {tokenExpired && (
              <p className="text-sm text-gray-600">
                Verification links expire after a limited time. Request a new one below.
              </p>
            )}
            {resendMutation.data?.success ? (
              <Alert variant="success">
                A new verification email has been sent. Check your inbox.
              </Alert>
            ) : (
              <form onSubmit={handleResend} className="space-y-3">
                <p className="text-sm text-gray-600">
                  Need a new verification link?
                </p>
                {!user?.email && (
                  <Input
                    label="Email address"
                    type="email"
                    inputMode="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                )}
                {resendRateLimited && (
                  <Alert variant="info">
                    {isRateLimited
                      ? `Too many attempts. Please try again in ${secondsRemaining} seconds.`
                      : resendError.message}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="cta"
                  loading={resendMutation.isPending}
                  disabled={(!user?.email && !resendEmail) || isRateLimited}
                  className="w-full"
                >
                  {resendMutation.isPending ? 'Sending...' : 'Resend verification email'}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
