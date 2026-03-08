type PriceDisplayProps = {
  price: string;
  compareAtPrice?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

const sizeStyles = {
  sm: { main: 'text-sm', cents: 'text-[10px]', compare: 'text-xs' },
  md: { main: 'text-lg', cents: 'text-xs', compare: 'text-sm' },
  lg: { main: 'text-2xl', cents: 'text-sm', compare: 'text-base' },
} as const;

export const PriceDisplay = ({ price, compareAtPrice, size = 'md' }: PriceDisplayProps) => {
  const numPrice = parseFloat(price);
  const dollars = Math.floor(numPrice);
  const cents = Math.round((numPrice - dollars) * 100)
    .toString()
    .padStart(2, '0');
  const styles = sizeStyles[size];

  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > numPrice;
  const discountPercent = hasDiscount
    ? Math.round(((parseFloat(compareAtPrice) - numPrice) / parseFloat(compareAtPrice)) * 100)
    : 0;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-bold text-gray-900 ${styles.main}`}>
        ${dollars}
        <sup className={styles.cents}>{cents}</sup>
      </span>
      {hasDiscount && (
        <>
          <span className={`text-gray-400 line-through ${styles.compare}`}>
            ${parseFloat(compareAtPrice).toFixed(2)}
          </span>
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
};
