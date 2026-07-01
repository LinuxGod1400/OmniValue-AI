import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { loadApiEnv } from '../env.js';
import { prisma } from '../lib/prisma.js';

const env = loadApiEnv({
  NODE_ENV: 'test',
  PORT: '3002',
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
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123!';

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('POST /auth/register', () => {
  it('creates a new user and returns tokens', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD, displayName: 'Test User' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
  });

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'other@example.com', password: 'short' });

    expect(res.status).toBe(422);
  });
});

describe('POST /auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});

describe('POST /auth/refresh', () => {
  it('issues new tokens from a valid refresh token', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const { refreshToken } = loginRes.body.data as { refreshToken: string };

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
