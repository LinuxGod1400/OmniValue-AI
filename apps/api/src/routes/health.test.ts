import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { loadApiEnv } from '../env.js';

const env = loadApiEnv({
  NODE_ENV: 'test',
  PORT: '3001',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-secret-at-least-32-characters-long!!',
  CORS_ORIGINS: 'http://localhost:8081',
  LOG_LEVEL: 'error',
  UPLOAD_DIR: '/tmp/test-uploads',
  MAX_FILE_SIZE_MB: '10',
});

const app = createApp(env);

describe('GET /', () => {
  it('returns API info with name, version, status, and timestamp', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('OmniValue AI API');
    expect(res.body.version).toBeDefined();
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(() => new Date(res.body.timestamp as string)).not.toThrow();
  });
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns exactly { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ status: 'ok' });
  });
});
