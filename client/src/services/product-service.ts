import type { Product, ProductsResponse, CategoriesResponse, CategoryWithProducts, Category } from '@amazon-clone/shared/types';
import type { ProductsQueryInput, CategoryProductsQueryInput } from '@amazon-clone/shared/validators';
import { apiClient } from '@/services/api-client';

const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

export const getProducts = async (query: Partial<ProductsQueryInput>) => {
  const qs = buildQueryString(query);
  return apiClient<ProductsResponse>(`/products${qs}`);
};

export const getProductBySlug = async (slug: string) => {
  return apiClient<Product>(`/products/${encodeURIComponent(slug)}`);
};

export const getCategories = async (includeChildren = false) => {
  const qs = includeChildren ? '?includeChildren=true' : '';
  return apiClient<CategoriesResponse>(`/categories${qs}`);
};

export const getCategoryBySlug = async (slug: string) => {
  return apiClient<Category>(`/categories/${encodeURIComponent(slug)}`);
};

export const getCategoryProducts = async (slug: string, query: Partial<CategoryProductsQueryInput>) => {
  const qs = buildQueryString(query);
  return apiClient<CategoryWithProducts>(`/categories/${encodeURIComponent(slug)}/products${qs}`);
};
