import type { FastifyInstance } from 'fastify';
import { categorySlugSchema, categoryQuerySchema, categoryProductsQuerySchema } from '@amazon-clone/shared/validators';
import { getCategories, getCategoryBySlug, getCategoryProducts } from '@/services/product-service.js';

export const categoryRoutes = async (app: FastifyInstance) => {
  // GET / — list categories
  app.get('/', async (request, reply) => {
    const parsed = categoryQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const result = await getCategories(parsed.data.includeChildren);
    return reply.code(200).send({ success: true, data: result });
  });

  // GET /:slug — single category by slug
  app.get('/:slug', async (request, reply) => {
    const parsed = categorySlugSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const result = await getCategoryBySlug(parsed.data.slug);

    if ('error' in result) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' },
      });
    }

    return reply.code(200).send({ success: true, data: result.category });
  });

  // GET /:slug/products — products for a category with pagination
  app.get('/:slug/products', async (request, reply) => {
    const slugParsed = categorySlugSchema.safeParse(request.params);
    if (!slugParsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: slugParsed.error.errors[0].message },
      });
    }

    const queryParsed = categoryProductsQuerySchema.safeParse(request.query);
    if (!queryParsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: queryParsed.error.errors[0].message },
      });
    }

    const result = await getCategoryProducts(slugParsed.data.slug, queryParsed.data);

    if ('error' in result) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' },
      });
    }

    return reply.code(200).send({ success: true, data: result });
  });
};
