import type { ReactNode } from 'react';

type AlertProps = {
  variant?: 'error' | 'success' | 'info';
  children: ReactNode;
  onDismiss?: () => void;
};

const variantStyles = {
  error: 'bg-red-50 text-red-600',
  success: 'bg-green-50 text-green-600',
  info: 'bg-blue-50 text-blue-600',
} as const;

export const Alert = ({ variant = 'error', children, onDismiss }: AlertProps) => (
  <div className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${variantStyles[variant]}`} role="alert" aria-live="assertive">
    <div className="flex-1">{children}</div>
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);
