import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { registerCors } from '@/plugins/cors.js';
import { registerAuth } from '@/plugins/auth.js';
import { registerRateLimit } from '@/plugins/rate-limit.js';
import { authRoutes } from '@/routes/auth/index.js';

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  // Plugins
  await registerCors(app);
  await app.register(cookie);
  await registerAuth(app);
  await registerRateLimit(app);

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode ?? 500;
    if (statusCode >= 500) {
      return reply.code(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again later.' },
      });
    }

    return reply.code(statusCode).send({
      success: false,
      error: { code: error.code ?? 'ERROR', message: error.message },
    });
  });

  // Health check
  app.get('/api/v1/health', async () => {
    return { success: true, data: { status: 'ok' } };
  });


  // Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });

  return app;
};
