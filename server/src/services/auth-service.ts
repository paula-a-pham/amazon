import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import type { User as PrismaUser } from '@prisma/client';
import type { User } from '@amazon-clone/shared/types';
import { prisma } from '@/utils/prisma.js';

const SALT_ROUNDS = 10;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export const sanitizeUser = (user: PrismaUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const register = async (name: string, email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'EMAIL_TAKEN' as const };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return { user };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'INVALID_CREDENTIALS' as const };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: 'INVALID_CREDENTIALS' as const };
  }

  return { user };
};

export const createRefreshToken = async (userId: string, expiryDays = REFRESH_TOKEN_EXPIRY_DAYS) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const token = await prisma.refreshToken.create({
    data: { userId, expiresAt },
  });

  return token;
};

export const findRefreshToken = async (id: string) => {
  return prisma.refreshToken.findUnique({
    where: { id },
    include: { user: true },
  });
};

export const rotateRefreshToken = async (oldTokenId: string, userId: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  const [, newToken] = await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: oldTokenId } }),
    prisma.refreshToken.create({ data: { userId, expiresAt } }),
  ]);

  return newToken;
};

export const revokeAllUserTokens = async (userId: string) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createPasswordResetToken = async (userId: string) => {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);

  const resetToken = await prisma.passwordResetToken.create({
    data: { userId, token, expiresAt },
  });

  return resetToken;
};

export const findValidResetToken = async (token: string) => {
  return prisma.passwordResetToken.findFirst({
    where: {
      token,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
};

export const resetPassword = async (token: string, newPassword: string) => {
  const resetToken = await findValidResetToken(token);
  if (!resetToken) {
    return { error: 'INVALID_TOKEN' as const };
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return { success: true as const };
};

export const createEmailVerificationToken = async (userId: string) => {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

  const verificationToken = await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt },
  });

  return verificationToken;
};

export const findValidVerificationToken = async (token: string) => {
  return prisma.emailVerificationToken.findFirst({
    where: {
      token,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
};

export const verifyEmail = async (token: string) => {
  const verificationToken = await findValidVerificationToken(token);
  if (!verificationToken) {
    return { error: 'INVALID_TOKEN' as const };
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    }),
  ]);

  return { success: true as const };
};
