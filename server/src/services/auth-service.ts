import bcrypt from 'bcrypt';
import type { User as PrismaUser } from '@prisma/client';
import type { User } from '@amazon-clone/shared/types';
import { prisma } from '@/utils/prisma.js';

const SALT_ROUNDS = 10;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export const sanitizeUser = (user: PrismaUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
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

export const createRefreshToken = async (userId: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

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
