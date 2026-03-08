export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  displayOrder: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryWithChildren = Category & {
  children: Category[];
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  ratingAvg: string;
  ratingCount: number;
  isActive: boolean;
  sellerId: string;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  ratingAvg: string;
  ratingCount: number;
  categoryId: string;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductsResponse = {
  products: ProductListItem[];
  pagination: PaginationMeta;
};

export type CategoriesResponse = {
  categories: Category[] | CategoryWithChildren[];
};

export type CategoryWithProducts = {
  category: Category;
  products: ProductListItem[];
  pagination: PaginationMeta;
};
