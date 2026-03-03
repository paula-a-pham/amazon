import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPasswordSchema } from '@amazon-clone/shared/validators';
import { useResetPassword } from '@/hooks/use-auth';
import { useRateLimitTimer } from '@/hooks/use-rate-limit-timer';
import { useAutoScrollToError } from '@/hooks/use-auto-scroll-to-error';
import { AuthLayout } from '@/components/layout/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PasswordRules } from '@/components/features/password-rules';

const ResetPassword = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordInteracted, setPasswordInteracted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const resetMutation = useResetPassword();
  const { scrollToFirstError } = useAutoScrollToError(formRef);

  const serverError =
    resetMutation.data && !resetMutation.data.success
      ? resetMutation.data.error
      : null;

  const rateLimited = serverError?.code === 'RATE_LIMITED';
  const { secondsRemaining, isRateLimited } = useRateLimitTimer(
    rateLimited ? serverError?.message : undefined,
  );

  const tokenExpired = serverError?.code === 'TOKEN_EXPIRED' || serverError?.code === 'INVALID_TOKEN';
  const success = resetMutation.data?.success;

  const confirmMismatch =
    password.length > 0 && passwordConfirm.length > 0 && password !== passwordConfirm;

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setPasswordInteracted(true);

    if (!token) {
      setFieldErrors({ token: 'Missing reset token. Please use the link from your email.' });
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      scrollToFirstError();
      return;
    }

    if (password !== passwordConfirm) {
      setFieldErrors({ passwordConfirm: 'Passwords do not match' });
      scrollToFirstError();
      return;
    }

    resetMutation.mutate(parsed.data);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter a new password for your account."
      backPath="/forgot-password"
      footer={
        <Link to="/login" className="font-medium text-amazon-river hover:text-amazon-blue-dark">
          Back to sign in
        </Link>
      }
    >
      {success ? (
        <div className="mt-6 space-y-4">
          <Alert variant="success">
            Your password has been reset successfully.
          </Alert>
          <Link
            to="/login"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-amazon-yellow px-4 py-2.5 text-sm font-semibold text-amazon transition-colors hover:bg-amazon-orange"
          >
            Sign in with new password
          </Link>
        </div>
      ) : tokenExpired ? (
        <div className="mt-6 space-y-4">
          <Alert variant="error">
            {serverError?.message ?? 'This reset link has expired or is invalid.'}
          </Alert>
          <p className="text-sm text-gray-600">
            Reset links expire after 1 hour. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-amazon-yellow px-4 py-2.5 text-sm font-semibold text-amazon transition-colors hover:bg-amazon-orange"
          >
            Request new reset link
          </Link>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <PasswordInput
              label="New password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); setPasswordInteracted(true); }}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              autoFocus
              error={fieldErrors['password']}
            />
            <PasswordRules password={password} hasInteracted={passwordInteracted} />
          </div>
          <PasswordInput
            label="Confirm new password"
            value={passwordConfirm}
            onChange={(e) => { setPasswordConfirm(e.target.value); clearFieldError('passwordConfirm'); }}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={confirmMismatch ? 'Passwords do not match' : fieldErrors['passwordConfirm']}
          />
          {(serverError && !tokenExpired || fieldErrors['token']) && (
            <Alert variant={rateLimited ? 'info' : 'error'}>
              {rateLimited && isRateLimited
                ? `Too many attempts. Please try again in ${secondsRemaining} seconds.`
                : serverError?.message ?? fieldErrors['token']}
            </Alert>
          )}
          <Button
            type="submit"
            variant="cta"
            loading={resetMutation.isPending}
            disabled={isRateLimited}
            className="mt-2 w-full"
          >
            {resetMutation.isPending ? 'Resetting...' : 'Reset password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
