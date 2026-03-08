import type { Prisma, Product as PrismaProduct, Category as PrismaCategory, ProductImage as PrismaProductImage } from '@prisma/client';
import type { Product, ProductListItem, ProductImage, Category, CategoryWithChildren } from '@amazon-clone/shared/types';
import type { ProductsQueryInput, CategoryProductsQueryInput } from '@amazon-clone/shared/validators';
import { prisma } from '@/utils/prisma.js';

type PrismaProductWithRelations = PrismaProduct & {
  images: PrismaProductImage[];
  category: PrismaCategory;
};

type PrismaProductWithImages = PrismaProduct & {
  images: PrismaProductImage[];
};

type PrismaCategoryWithChildren = PrismaCategory & {
  children: PrismaCategory[];
};

const sanitizeProductImage = (image: PrismaProductImage): ProductImage => ({
  id: image.id,
  url: image.url,
  alt: image.alt,
  displayOrder: image.displayOrder,
});

const sanitizeCategory = (category: PrismaCategory): Category => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  image: category.image,
  parentId: category.parentId,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
});

const sanitizeCategoryWithChildren = (category: PrismaCategoryWithChildren): CategoryWithChildren => ({
  ...sanitizeCategory(category),
  children: category.children.map(sanitizeCategory),
});

export const sanitizeProduct = (product: PrismaProductWithRelations): Product => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price.toString(),
  compareAtPrice: product.compareAtPrice?.toString() ?? null,
  stock: product.stock,
  ratingAvg: product.ratingAvg.toString(),
  ratingCount: product.ratingCount,
  isActive: product.isActive,
  sellerId: product.sellerId,
  categoryId: product.categoryId,
  category: sanitizeCategory(product.category),
  images: product.images.map(sanitizeProductImage),
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});

const sanitizeProductListItem = (product: PrismaProductWithImages): ProductListItem => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description.length > 200 ? product.description.slice(0, 200) + '...' : product.description,
  price: product.price.toString(),
  compareAtPrice: product.compareAtPrice?.toString() ?? null,
  stock: product.stock,
  ratingAvg: product.ratingAvg.toString(),
  ratingCount: product.ratingCount,
  categoryId: product.categoryId,
  images: product.images.map(sanitizeProductImage),
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});

const buildProductWhere = (filters: {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  categoryId?: string;
}): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters.minRating !== undefined) {
    where.ratingAvg = { gte: filters.minRating };
  }

  return where;
};

const buildProductOrderBy = (sortBy: string): Prisma.ProductOrderByWithRelationInput => {
  switch (sortBy) {
    case 'price_asc':
      return { price: 'asc' };
    case 'price_desc':
      return { price: 'desc' };
    case 'rating':
      return { ratingAvg: 'desc' };
    case 'name_asc':
      return { name: 'asc' };
    case 'name_desc':
      return { name: 'desc' };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
};

export const getProducts = async (query: ProductsQueryInput) => {
  const { page, limit, sortBy, ...filters } = query;
  const where = buildProductWhere(filters);
  const orderBy = buildProductOrderBy(sortBy);
  const skip = (page - 1) * limit;

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(sanitizeProductListItem),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      category: true,
    },
  });

  if (!product) {
    return { error: 'NOT_FOUND' as const };
  }

  return { product: sanitizeProduct(product) };
};

export const getCategories = async (includeChildren: boolean) => {
  if (includeChildren) {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
    return { categories: categories.map(sanitizeCategoryWithChildren) };
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
  });
  return { categories: categories.map(sanitizeCategory) };
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return { error: 'NOT_FOUND' as const };
  }

  return { category: sanitizeCategory(category) };
};

export const getCategoryProducts = async (slug: string, query: CategoryProductsQueryInput) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: { select: { id: true } } },
  });

  if (!category) {
    return { error: 'NOT_FOUND' as const };
  }

  const { page, limit, sortBy, ...filters } = query;
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];
  const where: Prisma.ProductWhereInput = {
    ...buildProductWhere(filters),
    categoryId: { in: categoryIds },
  };
  const orderBy = buildProductOrderBy(sortBy);
  const skip = (page - 1) * limit;

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    category: sanitizeCategory(category),
    products: products.map(sanitizeProductListItem),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
