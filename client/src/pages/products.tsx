import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { PRODUCT_SORT_OPTIONS, PRODUCTS_PER_PAGE } from '@amazon-clone/shared/constants';
import { useProducts, useCategories } from '@/hooks/use-products';
import { ProductCard } from '@/components/features/product-card';
import { ProductCardSkeleton } from '@/components/features/product-card-skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Alert } from '@/components/ui/alert';
import { useThemeStyles } from '@/stores/theme-store';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceOpen, setPriceOpen] = useState(false);
  const ts = useThemeStyles();

  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('search') ?? undefined;
  const categorySlug = searchParams.get('categorySlug') ?? undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const sortBy = (searchParams.get('sortBy') ?? 'newest') as typeof PRODUCT_SORT_OPTIONS[number]['value'];

  const { data, isLoading, error } = useProducts({ page, limit: PRODUCTS_PER_PAGE, search, categorySlug, minPrice, maxPrice, minRating, sortBy });
  const { data: categoriesData } = useCategories();

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '') next.delete(key); else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    updateParam('page', String(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [localMinPrice, setLocalMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [localMaxPrice, setLocalMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (localMinPrice) next.set('minPrice', localMinPrice); else next.delete('minPrice');
    if (localMaxPrice) next.set('maxPrice', localMaxPrice); else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
    setPriceOpen(false);
  };

  const clearFilters = () => {
    setSearchParams(search ? { search } : {});
    setLocalMinPrice('');
    setLocalMaxPrice('');
  };

  const hasActiveFilters = categorySlug || minPrice || maxPrice || minRating;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Title */}
      <div className="mb-6">
        {search ? (
          <h1 className="text-lg font-bold text-gray-900">
            Results for &quot;{search}&quot;
            {data && <span className="ml-2 text-sm font-normal text-gray-400">({data.pagination.total})</span>}
          </h1>
        ) : (
          <h1 className={ts.sectionTitle}>All Products</h1>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-5">
        {categoriesData?.categories.map((cat) => (
          <button key={cat.id} type="button" onClick={() => updateParam('categorySlug', categorySlug === cat.slug ? undefined : cat.slug)}
            className={`px-3.5 py-1.5 text-xs font-medium transition-all ${categorySlug === cat.slug ? ts.filterPillActive : ts.filterPill} ${categorySlug !== cat.slug ? 'bg-white text-gray-600 hover:bg-gray-50' : ''}`}>
            {cat.name}
          </button>
        ))}

        <select value={minRating ?? ''} onChange={(e) => updateParam('minRating', e.target.value || undefined)}
          className={`px-3.5 py-1.5 text-xs font-medium text-gray-600 focus:outline-none ${ts.selectStyle}`} aria-label="Minimum rating">
          <option value="">Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>

        <button type="button" onClick={() => setPriceOpen(!priceOpen)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium transition-all ${minPrice || maxPrice ? ts.filterPillActive : ts.filterPill} ${!(minPrice || maxPrice) ? 'bg-white text-gray-600 hover:bg-gray-50' : ''}`}>
          <SlidersHorizontal className="h-3 w-3" /> Price
        </button>

        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
            <X className="h-3 w-3" /> Clear
          </button>
        )}

        <div className="flex-1" />

        {data && <span className="text-xs text-gray-400">{data.pagination.total} products</span>}
        <label htmlFor="sort-select" className="sr-only">Sort by</label>
        <select id="sort-select" value={sortBy} onChange={(e) => updateParam('sortBy', e.target.value)}
          className={`px-3.5 py-1.5 text-xs font-medium text-gray-600 focus:outline-none ${ts.selectStyle}`}>
          {PRODUCT_SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Price panel */}
      {priceOpen && (
        <div className="flex items-center gap-2 border-b border-gray-200 py-3">
          <span className="text-xs font-medium text-gray-500">Price:</span>
          <input type="number" min="0" placeholder="Min" value={localMinPrice} onChange={(e) => setLocalMinPrice(e.target.value)}
            className="w-20 rounded border border-gray-200 px-2.5 py-1.5 text-xs focus:border-amazon-blue focus:outline-none" aria-label="Min price" />
          <span className="text-gray-300">—</span>
          <input type="number" min="0" placeholder="Max" value={localMaxPrice} onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="w-20 rounded border border-gray-200 px-2.5 py-1.5 text-xs focus:border-amazon-blue focus:outline-none" aria-label="Max price" />
          <button type="button" onClick={applyPriceFilter} className={`bg-amazon-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-amazon-light ${ts.button}`}>Apply</button>
        </div>
      )}

      {error && <div className="mt-4"><Alert variant="error">Failed to load products.</Alert></div>}

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {!isLoading && data?.products.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-base text-gray-500">No products found.</p>
          {hasActiveFilters && <button type="button" onClick={clearFilters} className="mt-3 text-sm font-medium text-amazon-blue hover:underline">Clear all filters</button>}
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-10"><Pagination currentPage={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={handlePageChange} /></div>
      )}
    </div>
  );
};

export default Products;
