import type { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema } from '@amazon-clone/shared/validators';
import {
  register,
  login,
  sanitizeUser,
  createRefreshToken,
  findRefreshToken,
  rotateRefreshToken,
  revokeAllUserTokens,
} from '@/services/auth-service.js';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

export const authRoutes = async (app: FastifyInstance) => {
  // POST /register
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { name, email, password } = parsed.data;
    const result = await register(name, email, password);

    if ('error' in result) {
      return reply.code(409).send({
        success: false,
        error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' },
      });
    }

    const user = sanitizeUser(result.user);
    const accessToken = await reply.accessSign({ sub: user.id, role: user.role });
    const refreshToken = await createRefreshToken(user.id);
    const refreshJwt = await reply.refreshSign({ sub: refreshToken.id });

    reply.setCookie(REFRESH_COOKIE, refreshJwt, COOKIE_OPTIONS);

    return reply.code(201).send({
      success: true,
      data: { user, accessToken },
    });
  });

  // POST /login
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { email, password } = parsed.data;
    const result = await login(email, password);

    if ('error' in result) {
      return reply.code(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const user = sanitizeUser(result.user);
    const accessToken = await reply.accessSign({ sub: user.id, role: user.role });
    const refreshToken = await createRefreshToken(user.id);
    const refreshJwt = await reply.refreshSign({ sub: refreshToken.id });

    reply.setCookie(REFRESH_COOKIE, refreshJwt, COOKIE_OPTIONS);

    return reply.code(200).send({
      success: true,
      data: { user, accessToken },
    });
  });

  // POST /refresh
  app.post('/refresh', async (request, reply) => {
    const cookieValue = request.cookies[REFRESH_COOKIE];
    if (!cookieValue) {
      return reply.code(401).send({
        success: false,
        error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided' },
      });
    }

    let payload: { sub: string };
    try {
      payload = await request.refreshVerify() as unknown as { sub: string };
    } catch {
      reply.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
      return reply.code(401).send({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }

    const oldToken = await findRefreshToken(payload.sub);
    if (!oldToken || oldToken.expiresAt < new Date()) {
      reply.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
      return reply.code(401).send({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }

    const newToken = await rotateRefreshToken(oldToken.id, oldToken.userId);
    const user = sanitizeUser(oldToken.user);
    const accessToken = await reply.accessSign({ sub: user.id, role: user.role });
    const refreshJwt = await reply.refreshSign({ sub: newToken.id });

    reply.setCookie(REFRESH_COOKIE, refreshJwt, COOKIE_OPTIONS);

    return reply.code(200).send({
      success: true,
      data: { user, accessToken },
    });
  });

  // POST /logout
  app.post('/logout', { preHandler: [app.authenticate] }, async (request, reply) => {
    await revokeAllUserTokens(request.user.sub);
    reply.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });

    return reply.code(200).send({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  });
};
