/**
 * Environment variable parsing for the API server.
 * Uses Zod to validate at startup — fails fast on missing/invalid config.
 */

import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1).default('postgresql://localhost:5432/omnivalue_dev'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:8081')
    .transform((val) => val.split(',')),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type ApiEnv = z.infer<typeof schema>;

export function loadApiEnv(env: NodeJS.ProcessEnv = process.env): ApiEnv {
  const result = schema.safeParse(env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }
  return result.data;
}
