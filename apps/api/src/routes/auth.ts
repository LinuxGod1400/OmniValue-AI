import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { loadApiEnv } from '../env.js';

const env = loadApiEnv();
export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /auth/register
authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    return;
  }

  const { email, password, displayName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email already registered' } });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: { create: { displayName: displayName ?? null } },
    },
    include: { profile: true },
  });

  const { accessToken, refreshToken } = await issueTokens(user.id, user.email);

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, displayName: user.profile?.displayName ?? null },
    },
  });
});

// POST /auth/login
authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  if (!user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    return;
  }

  const { accessToken, refreshToken } = await issueTokens(user.id, user.email);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, displayName: user.profile?.displayName ?? null },
    },
  });
});

// POST /auth/refresh
authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'refreshToken is required' } });
    return;
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken, env.JWT_SECRET);
  } catch {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    return;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token expired or revoked' } });
    return;
  }

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const tokens = await issueTokens(stored.user.id, stored.user.email);

  res.json({ success: true, data: tokens });
});

// POST /auth/logout
authRouter.post('/logout', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => undefined);
  }
  res.json({ success: true, data: { message: 'Logged out' } });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function issueTokens(userId: string, email: string) {
  const jti = randomUUID();
  const refreshExpiresMs = parseExpiry(env.JWT_REFRESH_EXPIRES_IN);

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: userId, email }, env.JWT_SECRET, env.JWT_ACCESS_EXPIRES_IN),
    signRefreshToken({ sub: userId, jti }, env.JWT_SECRET, env.JWT_REFRESH_EXPIRES_IN),
  ]);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + refreshExpiresMs),
    },
  });

  return { accessToken, refreshToken };
}

function parseExpiry(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const [, num, unit] = match;
  const n = parseInt(num!, 10);
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * (multipliers[unit!] ?? 86_400_000);
}
