import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { ProductListItem } from '@amazon-clone/shared/types';
import { RatingStars } from '@/components/ui/rating-stars';
import { PriceDisplay } from '@/components/ui/price-display';
import { useThemeStyles } from '@/stores/theme-store';

type ProductCardProps = {
  product: ProductListItem;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const ts = useThemeStyles();
  const mainImage = product.images[0];

  return (
    <article className={`group flex flex-col overflow-hidden bg-white transition-all ${ts.card}`}>
      <div className="relative bg-gradient-to-b from-gray-50 to-gray-100/50 p-6">
        <Link to={`/products/${product.slug}`}>
          {mainImage ? (
            <img src={mainImage.url} alt={mainImage.alt} className="mx-auto h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">No image</div>
          )}
        </Link>
        <button type="button" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 backdrop-blur-sm hover:text-red-500" aria-label={`Add ${product.name} to wishlist`}>
          <Heart className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <Link to={`/products/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-gray-800 hover:text-amazon-blue">
          {product.name}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{product.description}</p>
        <div className="mt-2">
          <RatingStars rating={parseFloat(product.ratingAvg)} count={product.ratingCount} size="sm" />
        </div>
        <div className="mt-1.5">
          <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
        </div>
        {product.stock > 0 && product.stock <= 5 && <p className="mt-1 text-xs font-medium text-red-500">Only {product.stock} left!</p>}
        {product.stock === 0 && <p className="mt-1 text-xs font-medium text-gray-400">Out of stock</p>}
        <div className="mt-auto pt-3">
          <button type="button" disabled={product.stock === 0} className={`flex w-full items-center justify-center gap-1.5 bg-amazon-blue py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amazon-light disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 ${ts.button} ${ts.buttonLabel}`}>
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};
