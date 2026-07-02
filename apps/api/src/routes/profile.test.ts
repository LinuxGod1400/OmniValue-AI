import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { loadApiEnv } from '../env.js';
import { prisma } from '../lib/prisma.js';

const env = loadApiEnv({
  NODE_ENV: 'test',
  PORT: '3004',
  DATABASE_URL: process.env['DATABASE_URL'] ?? 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-secret-at-least-32-characters-long!!',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  CORS_ORIGINS: 'http://localhost:8081',
  LOG_LEVEL: 'error',
  UPLOAD_DIR: '/tmp/test-uploads',
  MAX_FILE_SIZE_MB: '10',
});

const app = createApp(env);
const TEST_EMAIL = `profile-test-${Date.now()}@example.com`;
let accessToken = '';

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  const res = await request(app)
    .post('/auth/register')
    .send({ email: TEST_EMAIL, password: 'Password123!', displayName: 'Initial Name' });
  accessToken = (res.body.data as { accessToken: string }).accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('GET /api/v1/profile', () => {
  it('returns the current user profile', async () => {
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_EMAIL);
    expect(res.body.data.displayName).toBe('Initial Name');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/profile');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/v1/profile', () => {
  it('updates display name and bio', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ displayName: 'Updated Name', bio: 'Collector of fine things' });

    expect(res.status).toBe(200);
    expect(res.body.data.displayName).toBe('Updated Name');
    expect(res.body.data.bio).toBe('Collector of fine things');
  });

  it('persists the updated name on subsequent GET', async () => {
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.body.data.displayName).toBe('Updated Name');
  });

  it('rejects bio over 500 chars', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bio: 'x'.repeat(501) });
    expect(res.status).toBe(422);
  });
});
