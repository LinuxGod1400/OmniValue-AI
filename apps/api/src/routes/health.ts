import { Router } from 'express';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  services: Record<string, { status: 'ok' | 'degraded' | 'down'; latencyMs?: number; message?: string }>;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const body: HealthResponse = {
    status: 'ok',
    version: process.env['npm_package_version'] ?? '0.1.0',
    timestamp: nowIso(),
    services: { api: { status: 'ok' } },
  };
  res.json(body);
});
