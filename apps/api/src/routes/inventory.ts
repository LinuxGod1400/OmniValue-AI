import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const inventoryRouter = Router();
inventoryRouter.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  estimatedValue: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('USD'),
  imageUrl: z.string().url().optional(),
});

const updateSchema = createSchema.partial();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
});

// GET /api/v1/items
inventoryRouter.get('/', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const query = paginationSchema.parse(req.query);
  const { page, pageSize, category, search } = query;

  const where = {
    userId,
    ...(category ? { category } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.item.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

// GET /api/v1/items/:id
inventoryRouter.get('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const item = await prisma.item.findFirst({ where: { id: req.params['id'], userId } });
  if (!item) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } });
    return;
  }
  res.json({ success: true, data: item });
});

// POST /api/v1/items
inventoryRouter.post('/', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    return;
  }
  const item = await prisma.item.create({
    data: {
      userId,
      name: parsed.data.name,
      currency: parsed.data.currency,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      estimatedValue: parsed.data.estimatedValue ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
    },
  });
  res.status(201).json({ success: true, data: item });
});

// PUT /api/v1/items/:id
inventoryRouter.put('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const existing = await prisma.item.findFirst({ where: { id: req.params['id'], userId } });
  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } });
    return;
  }
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData['name'] = parsed.data.name;
  if (parsed.data.currency !== undefined) updateData['currency'] = parsed.data.currency;
  if ('description' in parsed.data) updateData['description'] = parsed.data.description ?? null;
  if ('category' in parsed.data) updateData['category'] = parsed.data.category ?? null;
  if ('estimatedValue' in parsed.data) updateData['estimatedValue'] = parsed.data.estimatedValue ?? null;
  if ('imageUrl' in parsed.data) updateData['imageUrl'] = parsed.data.imageUrl ?? null;
  const item = await prisma.item.update({ where: { id: existing.id }, data: updateData });
  res.json({ success: true, data: item });
});

// DELETE /api/v1/items/:id
inventoryRouter.delete('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const existing = await prisma.item.findFirst({ where: { id: req.params['id'], userId } });
  if (!existing) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Item not found' } });
    return;
  }
  await prisma.item.delete({ where: { id: existing.id } });
  res.json({ success: true, data: { message: 'Item deleted' } });
});
