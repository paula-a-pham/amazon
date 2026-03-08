import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/use-products';
import { ProductCard } from '@/components/features/product-card';
import { ProductCardSkeleton } from '@/components/features/product-card-skeleton';
import { CategoryCard } from '@/components/features/category-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { useThemeStyles } from '@/stores/theme-store';

const Home = () => {
  const ts = useThemeStyles();
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts({ limit: 8, sortBy: 'rating' });

  return (
    <div>
      {/* Hero */}
      <section className="bg-amazon">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20">
          <h1 className="max-w-lg text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Grab Up to 50% Off On Selected Products
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/70 sm:text-base">
            Discover great deals on electronics, books, home essentials, and more.
          </p>
          <Link to="/products" className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-amazon hover:bg-gray-100">
            Buy Now
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Categories */}
        <section aria-labelledby="categories-heading">
          <div className="flex items-end justify-between">
            <h2 id="categories-heading" className={ts.sectionTitle}>Browse Categories</h2>
            <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-amazon-blue hover:text-amazon-light">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {categoriesError && <Alert variant="error">Failed to load categories.</Alert>}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)
              : categoriesData?.categories.map((c) => <CategoryCard key={c.id} category={c} />)}
          </div>
        </section>

        {/* Featured */}
        <section className="mt-16" aria-labelledby="featured-heading">
          <div className="flex items-end justify-between">
            <h2 id="featured-heading" className={ts.sectionTitle}>Top Rated Products</h2>
            <Link to="/products?sortBy=rating" className="flex items-center gap-1 text-sm font-medium text-amazon-blue hover:text-amazon-light">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {productsError && <Alert variant="error">Failed to load products.</Alert>}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productsLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : productsData?.products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
