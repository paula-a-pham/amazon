import { z } from 'zod';

export const PRODUCT_SORT_VALUES = [
  'price_asc',
  'price_desc',
  'rating',
  'newest',
  'name_asc',
  'name_desc',
] as const;

export const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  categorySlug: z.string().max(120).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(PRODUCT_SORT_VALUES).default('newest'),
});

export const productSlugSchema = z.object({
  slug: z.string().min(1, 'Product slug is required').max(280),
});

export const categorySlugSchema = z.object({
  slug: z.string().min(1, 'Category slug is required').max(120),
});

export const categoryQuerySchema = z.object({
  includeChildren: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
});

export const categoryProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(PRODUCT_SORT_VALUES).default('newest'),
});

export type ProductsQueryInput = z.infer<typeof productsQuerySchema>;
export type ProductSlugInput = z.infer<typeof productSlugSchema>;
export type CategorySlugInput = z.infer<typeof categorySlugSchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
export type CategoryProductsQueryInput = z.infer<typeof categoryProductsQuerySchema>;
