import { useQuery } from '@tanstack/react-query';
import type { ProductsQueryInput, CategoryProductsQueryInput } from '@amazon-clone/shared/validators';
import { getProducts, getProductBySlug, getCategories, getCategoryProducts } from '@/services/product-service';

export const useProducts = (query: Partial<ProductsQueryInput> = {}) => {
  return useQuery({
    queryKey: ['products', query],
    queryFn: async () => {
      const response = await getProducts(query);
      if (!response.success) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
  });
};

export const useProduct = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await getProductBySlug(slug!);
      if (!response.success) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    enabled: !!slug,
  });
};

export const useCategories = (includeChildren = false) => {
  return useQuery({
    queryKey: ['categories', { includeChildren }],
    queryFn: async () => {
      const response = await getCategories(includeChildren);
      if (!response.success) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
  });
};

export const useCategoryProducts = (slug: string | undefined, query: Partial<CategoryProductsQueryInput> = {}) => {
  return useQuery({
    queryKey: ['categoryProducts', slug, query],
    queryFn: async () => {
      const response = await getCategoryProducts(slug!, query);
      if (!response.success) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    enabled: !!slug,
  });
};
