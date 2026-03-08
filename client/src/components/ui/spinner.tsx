import { LoaderCircle } from 'lucide-react';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
} as const;

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => (
  <LoaderCircle
    className={`animate-spin text-amazon-river ${sizeMap[size]} ${className}`}
    strokeWidth={2}
    role="status"
    aria-label="Loading"
  />
);
