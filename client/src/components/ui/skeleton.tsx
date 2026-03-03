type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div
    className={`animate-pulse rounded bg-gray-200 ${className}`}
    aria-hidden="true"
  />
);

