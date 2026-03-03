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
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            {!showResult ? (
              <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            ) : passes ? (
              <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.28-8.72a.75.75 0 0 0-1.06-1.06L7 8.44 5.78 7.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3.75-3.75Z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-9.72a.75.75 0 0 1 0 1.06L9.06 8l1.72 1.72a.75.75 0 1 1-1.06 1.06L8 9.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            )}
          </svg>
          {label}
        </li>
      );
    })}
  </ul>
);
