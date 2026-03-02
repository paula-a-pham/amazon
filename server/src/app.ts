import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { registerCors } from '@/plugins/cors.js';
import { registerAuth } from '@/plugins/auth.js';

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

  return app;
};
