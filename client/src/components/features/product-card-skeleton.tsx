import { Skeleton } from '@/components/ui/skeleton';
import { useThemeStyles } from '@/stores/theme-store';

export const ProductCardSkeleton = () => {
  const ts = useThemeStyles();
  return (
    <div className={`flex flex-col overflow-hidden bg-white ${ts.cardSkeleton}`}>
      <div className="bg-gray-50 p-6"><Skeleton className="mx-auto h-40 w-full rounded-lg" /></div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="mt-1 h-3 w-full rounded" />
        <Skeleton className="mt-2.5 h-3.5 w-24 rounded" />
        <Skeleton className="mt-1.5 h-4 w-16 rounded" />
        <Skeleton className={`mt-auto h-10 w-full ${ts.button}`} />
      </div>
    </div>
  );
};
