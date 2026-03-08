import type { FastifyInstance } from 'fastify';
import { productsQuerySchema, productSlugSchema } from '@amazon-clone/shared/validators';
import { getProducts, getProductBySlug } from '@/services/product-service.js';

export const productRoutes = async (app: FastifyInstance) => {
  // GET / — list products with filters and pagination
  app.get('/', async (request, reply) => {
    const parsed = productsQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const result = await getProducts(parsed.data);
    return reply.code(200).send({ success: true, data: result });
  });

  // GET /:slug — single product by slug
  app.get('/:slug', async (request, reply) => {
    const parsed = productSlugSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const result = await getProductBySlug(parsed.data.slug);

    if ('error' in result) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    return reply.code(200).send({ success: true, data: result.product });
  });
};
