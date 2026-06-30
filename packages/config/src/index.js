"use strict";
/**
 * @omnivalue/config
 * Shared environment variable parsing and validation using Zod.
 *
 * Import the appropriate config object in each app rather than
 * reading process.env directly, so schemas are enforced at startup.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileEnvSchema = exports.apiEnvSchema = exports.portSchema = exports.nodeEnvSchema = void 0;
exports.parseEnv = parseEnv;
const zod_1 = require("zod");
// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Parse and validate environment variables against a Zod schema.
 * Throws a descriptive error on the first missing/invalid variable.
 */
function parseEnv(schema, env = process.env) {
    const result = schema.safeParse(env);
    if (!result.success) {
        const formatted = result.error.errors
            .map((e) => `  ${e.path.join('.')}: ${e.message}`)
            .join('\n');
        throw new Error(`Invalid environment variables:\n${formatted}`);
    }
    return result.data;
}
// ─── Shared env schema fragments ─────────────────────────────────────────────
exports.nodeEnvSchema = zod_1.z
    .enum(['development', 'test', 'production'])
    .default('development');
exports.portSchema = zod_1.z.coerce.number().int().min(1).max(65535);
// ─── API environment schema ───────────────────────────────────────────────────
exports.apiEnvSchema = zod_1.z.object({
    NODE_ENV: exports.nodeEnvSchema,
    PORT: exports.portSchema.default(3000),
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL'),
    CORS_ORIGINS: zod_1.z
        .string()
        .default('http://localhost:8081')
        .transform((val) => val.split(',')),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});
// ─── Mobile environment schema ────────────────────────────────────────────────
exports.mobileEnvSchema = zod_1.z.object({
    EXPO_PUBLIC_API_URL: zod_1.z
        .string()
        .url('EXPO_PUBLIC_API_URL must be a valid URL')
        .default('http://localhost:3000'),
    EXPO_PUBLIC_APP_ENV: exports.nodeEnvSchema,
});
//# sourceMappingURL=index.js.map