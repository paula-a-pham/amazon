import { useParams, useSearchParams } from 'react-router-dom';
import { PRODUCT_SORT_OPTIONS, PRODUCTS_PER_PAGE } from '@amazon-clone/shared/constants';
import { useCategoryProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/features/product-card';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { useThemeStyles } from '@/stores/theme-store';

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const ts = useThemeStyles();

  const page = Number(searchParams.get('page') ?? '1');
  const sortBy = (searchParams.get('sortBy') ?? 'newest') as typeof PRODUCT_SORT_OPTIONS[number]['value'];

  const { data, isLoading, error } = useCategoryProducts(slug, {
    page,
    limit: PRODUCTS_PER_PAGE,
    sortBy,
  });

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    updateParam('page', String(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Spinner size="lg" className="mx-auto mt-16" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Alert variant="error">Category not found.</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: data.category.name },
        ]}
      />

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{data.category.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data.pagination.total.toLocaleString()} product{data.pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <label htmlFor="category-sort" className="sr-only">Sort by</label>
          <select
            id="category-sort"
            value={sortBy}
            onChange={(e) => updateParam('sortBy', e.target.value)}
            className={`px-3.5 py-1.5 text-xs font-medium text-gray-600 focus:outline-none ${ts.selectStyle}`}
          >
            {PRODUCT_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {data.products.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-base text-gray-500">No products in this category yet.</p>
        </div>
      )}

      {data.pagination.totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Category;
