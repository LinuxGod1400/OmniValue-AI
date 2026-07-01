import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const profileRouter = Router();
profileRouter.use(requireAuth);

const updateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
});

// GET /api/v1/profile
profileRouter.get('/', async (req, res) => {
  const { userId } = req as AuthRequest;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName ?? null,
      bio: user.profile?.bio ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      createdAt: user.createdAt,
    },
  });
});

// PUT /api/v1/profile
profileRouter.put('/', async (req, res) => {
  const { userId } = req as AuthRequest;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    return;
  }

  const upsertData = {
    displayName: parsed.data.displayName ?? null,
    bio: parsed.data.bio ?? null,
  };

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: upsertData,
    create: { userId, ...upsertData },
  });

  res.json({ success: true, data: profile });
});
