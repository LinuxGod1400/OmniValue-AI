import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { loadApiEnv } from '../env.js';
import { prisma } from '../lib/prisma.js';

const env = loadApiEnv({
  NODE_ENV: 'test',
  PORT: '3003',
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
const TEST_EMAIL = `inv-test-${Date.now()}@example.com`;
let accessToken = '';
let createdItemId = '';

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  const res = await request(app)
    .post('/auth/register')
    .send({ email: TEST_EMAIL, password: 'Password123!' });
  accessToken = (res.body.data as { accessToken: string }).accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('POST /api/v1/items', () => {
  it('creates an item for authenticated user', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Camera', category: 'Electronics', estimatedValue: 250 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Camera');
    expect(res.body.data.estimatedValue).toBe(250);
    createdItemId = (res.body.data as { id: string }).id;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/v1/items').send({ name: 'Stolen' });
    expect(res.status).toBe(401);
  });

  it('requires a name', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ category: 'Electronics' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/items', () => {
  it('lists items for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/items')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it('filters by search query', async () => {
    const res = await request(app)
      .get('/api/v1/items?search=Camera')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/v1/items/:id', () => {
  it('returns a single item by id', async () => {
    const res = await request(app)
      .get(`/api/v1/items/${createdItemId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdItemId);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .get('/api/v1/items/nonexistent-id')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/v1/items/:id', () => {
  it('updates item fields', async () => {
    const res = await request(app)
      .put(`/api/v1/items/${createdItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Camera', estimatedValue: 300 });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Camera');
    expect(res.body.data.estimatedValue).toBe(300);
  });
});

describe('DELETE /api/v1/items/:id', () => {
  it('deletes an item', async () => {
    const res = await request(app)
      .delete(`/api/v1/items/${createdItemId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Item deleted');
  });
});
