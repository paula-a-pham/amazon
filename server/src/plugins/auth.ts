import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fjwt from '@fastify/jwt';
import { env } from '@/config/env.js';

export const registerAuth = async (app: FastifyInstance) => {
  await app.register(fjwt, {
    secret: env.JWT_ACCESS_SECRET,
    namespace: 'access',
    jwtVerify: 'accessVerify',
    jwtSign: 'accessSign',
    sign: { expiresIn: '15m' },
  });

  await app.register(fjwt, {
    secret: env.JWT_REFRESH_SECRET,
    namespace: 'refresh',
    jwtVerify: 'refreshVerify',
    jwtSign: 'refreshSign',
    sign: { expiresIn: '7d' },
  });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.accessVerify();
    } catch {
      reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }
  });
};
