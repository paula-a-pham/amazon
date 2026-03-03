import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loginSchema } from '@amazon-clone/shared/validators';
import { useLogin } from '@/hooks/use-auth';
import { useRateLimitTimer } from '@/hooks/use-rate-limit-timer';
import { useAutoScrollToError } from '@/hooks/use-auto-scroll-to-error';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const Login = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const loginMutation = useLogin();
  const { scrollToFirstError } = useAutoScrollToError(formRef);

  const serverError =
    loginMutation.data && !loginMutation.data.success
      ? loginMutation.data.error
      : null;

  const rateLimited = serverError?.code === 'RATE_LIMITED';
  const { secondsRemaining, isRateLimited } = useRateLimitTimer(
    rateLimited ? serverError?.message : undefined,
  );

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

    const parsed = loginSchema.safeParse({ email, password });
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

    loginMutation.mutate({ ...parsed.data, rememberMe });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footer={
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-400">or</span>
            </div>
          </div>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-amazon-river hover:text-amazon-blue-dark">Create one</Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          error={fieldErrors['email']}
        />
        <div>
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={fieldErrors['password']}
          />
          <div className="mt-1.5 text-right">
            <Link to="/forgot-password" className="text-xs text-amazon-river hover:text-amazon-blue-dark">
              Forgot password?
            </Link>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-amazon focus:ring-amazon-river"
          />
          <span className="text-sm text-gray-600">
            Remember me
            <span className="ml-1 text-xs text-gray-400">— Keep me signed in for 30 days</span>
          </span>
        </label>
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
          loading={loginMutation.isPending}
          disabled={isRateLimited}
          className="mt-2 w-full"
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
