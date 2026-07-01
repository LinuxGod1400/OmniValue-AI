import { Router } from 'express';
import { z } from 'zod';
import { getOpenAIClient, analyzeItemImage } from '../lib/openai.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { loadApiEnv } from '../env.js';

const env = loadApiEnv();
export const aiRouter = Router();
aiRouter.use(requireAuth);

const analyzeSchema = z.object({
  imageUrl: z.string().url(),
  itemId: z.string().optional(),
});

// POST /api/v1/ai/analyze
aiRouter.post('/analyze', async (req, res) => {
  const client = getOpenAIClient(env.OPENAI_API_KEY);
  if (!client) {
    res.status(503).json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'AI analysis is not configured' } });
    return;
  }

  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    return;
  }

  const { userId } = req as unknown as AuthRequest;
  const { imageUrl, itemId } = parsed.data;

  let analysis;
  try {
    analysis = await analyzeItemImage(client, imageUrl, env.OPENAI_MODEL);
  } catch (err) {
    const openAiErr = err as { status?: number; code?: string; message?: string };
    if (openAiErr.status === 429 || openAiErr.code === 'insufficient_quota') {
      res.status(402).json({ success: false, error: { code: 'QUOTA_EXCEEDED', message: 'OpenAI quota exceeded — please add billing credits to your OpenAI account.' } });
      return;
    }
    if (openAiErr.status === 401) {
      res.status(502).json({ success: false, error: { code: 'AI_AUTH_ERROR', message: 'OpenAI API key is invalid.' } });
      return;
    }
    res.status(502).json({ success: false, error: { code: 'AI_ERROR', message: openAiErr.message ?? 'AI analysis failed.' } });
    return;
  }

  // Persist analysis to item if itemId provided
  if (itemId) {
    const item = await prisma.item.findFirst({ where: { id: itemId, userId } });
    if (item) {
      await prisma.item.update({
        where: { id: item.id },
        data: {
          aiAnalysis: analysis as object,
          name: item.name === 'New Item' ? analysis.name : item.name,
          category: item.category ?? analysis.category,
          estimatedValue: item.estimatedValue ?? analysis.estimatedValue ?? null,
        },
      });
    }
  }

  res.json({ success: true, data: analysis });
});
