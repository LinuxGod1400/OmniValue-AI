/**
 * @omnivalue/config
 * Shared environment variable parsing and validation using Zod.
 *
 * Import the appropriate config object in each app rather than
 * reading process.env directly, so schemas are enforced at startup.
 */

import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse and validate environment variables against a Zod schema.
 * Throws a descriptive error on the first missing/invalid variable.
 */
export function parseEnv<T extends z.ZodTypeAny>(schema: T, env = process.env): z.infer<T> {
  const result = schema.safeParse(env);
  if (!result.success) {
    const formatted = result.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }
  return result.data as z.infer<T>;
}

// ─── Shared env schema fragments ─────────────────────────────────────────────

export const nodeEnvSchema = z
  .enum(['development', 'test', 'production'])
  .default('development');

export const portSchema = z.coerce.number().int().min(1).max(65535);

// ─── API environment schema ───────────────────────────────────────────────────

export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  PORT: portSchema.default(3000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:8081')
    .transform((val) => val.split(',')),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

// ─── Mobile environment schema ────────────────────────────────────────────────

export const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z
    .string()
    .url('EXPO_PUBLIC_API_URL must be a valid URL')
    .default('http://localhost:3000'),
  EXPO_PUBLIC_APP_ENV: nodeEnvSchema,
});

export type MobileEnv = z.infer<typeof mobileEnvSchema>;
