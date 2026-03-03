import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

export const registerRateLimit = async (app: FastifyInstance) => {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many attempts. Please try again later.',
      },
    }),
  });
};
