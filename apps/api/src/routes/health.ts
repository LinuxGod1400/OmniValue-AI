import { Router } from 'express';

export const healthRouter = Router();

// GET /health — liveness probe
healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});
