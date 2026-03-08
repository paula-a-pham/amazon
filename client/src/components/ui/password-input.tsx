import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCapsLock } from '@/hooks/use-caps-lock';

type PasswordInputProps = {
  label?: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const { isCapsLockOn, capsLockHandlers } = useCapsLock();

    return (
      <div>
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const form = (e.target as HTMLElement).closest('form');
                  form?.requestSubmit();
                }
              }}
              className="rounded p-0.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amazon-river/40"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" strokeWidth={1.5} /> : <Eye className="h-4.5 w-4.5" strokeWidth={1.5} />}
            </button>
          }
          {...props}
          {...capsLockHandlers}
        />
        <span className="sr-only" aria-live="polite">
          {showPassword ? 'Password is visible' : 'Password is hidden'}
        </span>
        {isCapsLockOn && !showPassword && (
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-600" aria-live="assertive">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            Caps Lock is on
          </p>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
