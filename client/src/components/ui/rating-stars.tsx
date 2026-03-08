import { Star } from 'lucide-react';

type RatingStarsProps = {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
};

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
} as const;

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
} as const;

export const RatingStars = ({ rating, count, size = 'md' }: RatingStarsProps) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    const half = !filled && i === Math.ceil(rating) && rating % 1 >= 0.3;

    if (filled) {
      stars.push(<Star key={i} className={`${sizeMap[size]} fill-amber-400 text-amber-400`} strokeWidth={0} />);
    } else if (half) {
      stars.push(
        <span key={i} className={`relative inline-flex ${sizeMap[size]}`}>
          <Star className={`${sizeMap[size]} text-gray-200`} strokeWidth={0} fill="currentColor" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${sizeMap[size]} fill-amber-400 text-amber-400`} strokeWidth={0} />
          </span>
        </span>,
      );
    } else {
      stars.push(<Star key={i} className={`${sizeMap[size]} fill-gray-200 text-gray-200`} strokeWidth={0} />);
    }
  }

  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating} out of 5 stars`}>
      <div className="flex gap-0.5">{stars}</div>
      {count !== undefined && (
        <span className={`text-gray-400 ${textSizeMap[size]}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
};
