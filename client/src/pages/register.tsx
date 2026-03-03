import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { registerSchema } from '@amazon-clone/shared/validators';
import { useRegister } from '@/hooks/use-auth';
import { useRateLimitTimer } from '@/hooks/use-rate-limit-timer';
import { useAutoScrollToError } from '@/hooks/use-auto-scroll-to-error';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PasswordRules } from '@/components/features/password-rules';

const Register = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordInteracted, setPasswordInteracted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const registerMutation = useRegister();
  const { scrollToFirstError } = useAutoScrollToError(formRef);

  const persistedFields = useMemo(() => ({ name, email }), [name, email]);
  const { clearPersisted } = useFormPersistence(
    'register_form',
    persistedFields,
    { name: setName, email: setEmail },
  );

  const serverError =
    registerMutation.data && !registerMutation.data.success
      ? registerMutation.data.error
      : null;

  const rateLimited = serverError?.code === 'RATE_LIMITED';
  const { secondsRemaining, isRateLimited } = useRateLimitTimer(
    rateLimited ? serverError?.message : undefined,
  );

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

    const parsed = registerSchema.safeParse({ name, email, password });
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

    registerMutation.mutate(parsed.data, {
      onSuccess: (response) => {
        if (response.success) clearPersisted();
      },
    });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started with your free account."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-amazon-river hover:text-amazon-blue-dark">Sign in</Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Full name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
          placeholder="Jane Doe"
          autoComplete="name"
          autoFocus
          error={fieldErrors['name']}
        />
        <Input
          label="Email address"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
          placeholder="you@example.com"
          autoComplete="email"
          error={fieldErrors['email']}
        />
        <div>
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); setPasswordInteracted(true); }}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={fieldErrors['password']}
          />
          <PasswordRules password={password} hasInteracted={passwordInteracted} />
        </div>
        <PasswordInput
          label="Confirm password"
          value={passwordConfirm}
          onChange={(e) => { setPasswordConfirm(e.target.value); clearFieldError('passwordConfirm'); }}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={confirmMismatch ? 'Passwords do not match' : fieldErrors['passwordConfirm']}
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
          loading={registerMutation.isPending}
          disabled={isRateLimited}
          className="mt-2 w-full"
        >
          {registerMutation.isPending ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Register;
