import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema } from '@amazon-clone/shared/validators';
import { useForgotPassword } from '@/hooks/use-auth';
import { useRateLimitTimer } from '@/hooks/use-rate-limit-timer';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const forgotMutation = useForgotPassword();

  const serverError =
    forgotMutation.data && !forgotMutation.data.success
      ? forgotMutation.data.error
      : null;

  const rateLimited = serverError?.code === 'RATE_LIMITED';
  const { secondsRemaining, isRateLimited } = useRateLimitTimer(
    rateLimited ? serverError?.message : undefined,
  );
  const success = forgotMutation.data?.success;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    forgotMutation.mutate(parsed.data);
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
      backPath="/login"
      footer={
        <Link to="/login" className="font-medium text-amazon-river hover:text-amazon-blue-dark">
          Back to sign in
        </Link>
      }
    >
      {success ? (
        <div className="mt-6 space-y-3">
          <Alert variant="success">
            Check your email for a password reset link. It may take a few minutes to arrive.
          </Alert>
          <p className="text-center text-xs text-gray-500">
            The link expires in 1 hour.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (fieldErrors['email']) setFieldErrors({}); }}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            error={fieldErrors['email']}
          />
          {serverError && (
            <Alert variant={rateLimited ? 'info' : 'error'}>
              {isRateLimited
                ? `Too many attempts. Please try again in ${secondsRemaining} seconds.`
                : serverError.message}
            </Alert>
          )}
          <Button
            type="submit"
            variant="cta"
            loading={forgotMutation.isPending}
            disabled={isRateLimited}
            className="mt-2 w-full"
          >
            {forgotMutation.isPending ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
