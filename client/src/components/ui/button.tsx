import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cta';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

const variantStyles = {
  primary: 'bg-amazon text-white hover:bg-amazon-light disabled:opacity-50',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50',
  cta: 'bg-amazon-yellow text-amazon hover:bg-amazon-orange font-semibold disabled:opacity-50',
} as const;

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
} as const;

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...props}
  >
    {loading && <Spinner size="sm" />}
    {children}
  </button>
);
