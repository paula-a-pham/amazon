import type { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, resendVerificationSchema } from '@amazon-clone/shared/validators';
import {
  register,
  login,
  sanitizeUser,
  createRefreshToken,
  findRefreshToken,
  rotateRefreshToken,
  revokeAllUserTokens,
  findUserByEmail,
  createPasswordResetToken,
  resetPassword,
  createEmailVerificationToken,
  verifyEmail,
} from '@/services/auth-service.js';
import { sendVerificationEmail, sendPasswordResetEmail, setEmailLogger } from '@/services/email-service.js';
import { env } from '@/config/env.js';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_PATH = '/';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: COOKIE_PATH,
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

export const authRoutes = async (app: FastifyInstance) => {
  setEmailLogger(app.log);

  // POST /register
  app.post('/register', { config: { rateLimit: { max: 3, timeWindow: '1 minute' } } }, async (request, reply) => {
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

    // Send verification email (non-blocking)
    let verificationToken;
    try {
      verificationToken = await createEmailVerificationToken(user.id);
      await sendVerificationEmail(user.email, user.name, verificationToken.token);
    } catch (err) {
      const verifyUrl = verificationToken
        ? `${env.CLIENT_URL}/verify-email?token=${verificationToken.token}`
        : '(token creation failed)';
      app.log.error(err, `Failed to send verification email — URL: ${verifyUrl}`);
    }

    return reply.code(201).send({
      success: true,
      data: { user, accessToken },
    });
  });

  // POST /login
  app.post('/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { email, password, rememberMe } = parsed.data;
    const result = await login(email, password);

    if ('error' in result) {
      return reply.code(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const expiryDays = rememberMe ? 30 : 7;
    const user = sanitizeUser(result.user);
    const accessToken = await reply.accessSign({ sub: user.id, role: user.role });
    const refreshToken = await createRefreshToken(user.id, expiryDays);
    const refreshJwt = await reply.refreshSign({ sub: refreshToken.id });

    reply.setCookie(REFRESH_COOKIE, refreshJwt, {
      ...COOKIE_OPTIONS,
      maxAge: expiryDays * 24 * 60 * 60,
    });

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
      reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
      return reply.code(401).send({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }

    const oldToken = await findRefreshToken(payload.sub);
    if (!oldToken || oldToken.expiresAt < new Date()) {
      reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
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
    reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });

    return reply.code(200).send({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  });

  // POST /forgot-password
  app.post('/forgot-password', { config: { rateLimit: { max: 3, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { email } = parsed.data;
    const user = await findUserByEmail(email);

    if (user) {
      let resetToken;
      try {
        resetToken = await createPasswordResetToken(user.id);
        await sendPasswordResetEmail(user.email, user.name, resetToken.token);
      } catch (err) {
        const resetUrl = resetToken
          ? `${env.CLIENT_URL}/reset-password?token=${resetToken.token}`
          : '(token creation failed)';
        app.log.error(err, `Failed to send password reset email — URL: ${resetUrl}`);
      }
    }

    // Always return success to prevent email enumeration
    return reply.code(200).send({
      success: true,
      data: { message: 'If an account with that email exists, a password reset link has been sent.' },
    });
  });

  // POST /reset-password
  app.post('/reset-password', async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { token, password: newPassword } = parsed.data;
    const result = await resetPassword(token, newPassword);

    if ('error' in result) {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'This reset link is invalid or has expired. Please request a new one.' },
      });
    }

    reply.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });

    return reply.code(200).send({
      success: true,
      data: { message: 'Password has been reset successfully.' },
    });
  });

  // POST /verify-email
  app.post('/verify-email', async (request, reply) => {
    const parsed = verifyEmailSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const result = await verifyEmail(parsed.data.token);

    if ('error' in result) {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'This verification link is invalid or has expired. Please request a new one.' },
      });
    }

    return reply.code(200).send({
      success: true,
      data: { message: 'Email verified successfully.' },
    });
  });

  // POST /resend-verification
  app.post('/resend-verification', { config: { rateLimit: { max: 3, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = resendVerificationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { email } = parsed.data;
    const user = await findUserByEmail(email);

    if (user && !user.emailVerified) {
      let verificationToken;
      try {
        verificationToken = await createEmailVerificationToken(user.id);
        await sendVerificationEmail(user.email, user.name, verificationToken.token);
      } catch (err) {
        const verifyUrl = verificationToken
          ? `${env.CLIENT_URL}/verify-email?token=${verificationToken.token}`
          : '(token creation failed)';
        app.log.error(err, `Failed to send verification email — URL: ${verifyUrl}`);
      }
    }

    // Always return success to prevent email enumeration
    return reply.code(200).send({
      success: true,
      data: { message: 'If an account with that email exists and is not yet verified, a verification email has been sent.' },
    });
  });
};
