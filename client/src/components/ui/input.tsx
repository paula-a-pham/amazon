import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

type InputProps = {
  label?: string;
  error?: string;
  rightElement?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightElement, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`w-full rounded-lg border bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:bg-white focus:ring-2 focus:outline-none ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 focus:border-amazon-river focus:ring-amazon-river/20'
            } ${rightElement ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
