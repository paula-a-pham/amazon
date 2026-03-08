import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, RotateCcw } from 'lucide-react';
import { useProduct } from '@/hooks/use-products';
import { ImageGallery } from '@/components/features/image-gallery';
import { RatingStars } from '@/components/ui/rating-stars';
import { PriceDisplay } from '@/components/ui/price-display';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { useThemeStyles } from '@/stores/theme-store';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const ts = useThemeStyles();

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Alert variant="error">Product not found. <Link to="/products" className="underline">Browse all products</Link></Alert>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: product.category.name, href: `/categories/${product.category.slug}` },
        { label: product.name },
      ]} />

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <ImageGallery images={product.images} productName={product.name} />

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">{product.description}</p>
          <div className="mt-4"><RatingStars rating={parseFloat(product.ratingAvg)} count={product.ratingCount} /></div>

          <div className="my-6 h-px bg-gray-100" />
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          <div className="my-6 h-px bg-gray-100" />

          {/* Quantity + stock */}
          {inStock && (
            <div className="flex flex-wrap items-center gap-4">
              <QuantitySelector value={quantity} min={1} max={Math.min(product.stock, 30)} onChange={setQuantity} />
              {lowStock ? (
                <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">Only {product.stock} left</span>
              ) : (
                <span className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">In Stock</span>
              )}
            </div>
          )}
          {!inStock && <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Currently unavailable</span>}

          {/* CTAs */}
          {inStock && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" className={`flex-1 bg-amazon-blue px-6 py-3.5 font-bold text-white hover:bg-amazon-light ${ts.ctaPrimary}`}>
                Buy Now
              </button>
              <button type="button" className={`flex-1 border-amazon-blue px-6 py-3.5 font-bold text-amazon-blue hover:bg-amazon-blue/5 ${ts.ctaSecondary}`}>
                Add to Cart
              </button>
            </div>
          )}

          {/* Delivery perks */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-amazon-orange" strokeWidth={1.5} />
              <div className="text-sm">
                <p className="font-bold text-gray-900">Free Delivery</p>
                <p className="text-amazon-blue">Enter your Postal code for Delivery Availability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-amazon-orange" strokeWidth={1.5} />
              <div className="text-sm">
                <p className="font-bold text-gray-900">Return Delivery</p>
                <p className="text-gray-500">Free 30 Days Delivery Returns. <span className="cursor-pointer text-amazon-blue underline">Details</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
