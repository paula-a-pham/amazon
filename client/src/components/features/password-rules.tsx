import { Circle, CircleCheck, CircleX } from 'lucide-react';

const RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

type PasswordRulesProps = {
  password: string;
  hasInteracted: boolean;
};

export const PasswordRules = ({ password, hasInteracted }: PasswordRulesProps) => (
  <ul className="mt-2 grid grid-cols-2 gap-1" aria-live="polite" aria-label="Password requirements">
    {RULES.map(({ test, label }) => {
      const passes = test(password);
      const showResult = hasInteracted || password.length > 0;

      return (
        <li
          key={label}
          className={`flex items-center gap-1.5 text-xs ${
            !showResult
              ? 'text-gray-400'
              : passes
                ? 'text-green-600'
                : 'text-red-500'
          }`}
        >
          {!showResult ? (
            <Circle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          ) : passes ? (
            <CircleCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          ) : (
            <CircleX className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          )}
          {label}
        </li>
      );
    })}
  </ul>
);
