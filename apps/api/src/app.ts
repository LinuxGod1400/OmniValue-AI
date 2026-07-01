import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { type ApiEnv } from './env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { profileRouter } from './routes/profile.js';
import { inventoryRouter } from './routes/inventory.js';
import { uploadsRouter } from './routes/uploads.js';
import { aiRouter } from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

export function createApp(env: ApiEnv): express.Application {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    }),
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

  // Routes
  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/api/v1/profile', profileRouter);
  app.use('/api/v1/items', inventoryRouter);
  app.use('/api/v1/uploads', uploadsRouter);
  app.use('/api/v1/ai', aiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
