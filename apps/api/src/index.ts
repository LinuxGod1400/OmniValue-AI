/**
 * OmniValue AI — API Server entry point
 */

import { createApp } from './app.js';
import { loadApiEnv } from './env.js';

const env = loadApiEnv();
const app = createApp(env);

const server = app.listen(env.PORT, () => {
  console.info(`[api] Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal: string) => {
  console.info(`[api] Received ${signal}. Shutting down gracefully…`);
  server.close(() => {
    console.info('[api] Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[api] Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
