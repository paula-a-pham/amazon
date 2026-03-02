import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { registerCors } from '@/plugins/cors.js';
import { registerAuth } from '@/plugins/auth.js';
import { authRoutes } from '@/routes/auth/index.js';

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  // Plugins
  await registerCors(app);
  await app.register(cookie);
  await registerAuth(app);

  // Health check
  app.get('/api/v1/health', async () => {
    return { success: true, data: { status: 'ok' } };
  });

  // Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });

  return app;
};
