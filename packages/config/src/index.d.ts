/**
 * @omnivalue/config
 * Shared environment variable parsing and validation using Zod.
 *
 * Import the appropriate config object in each app rather than
 * reading process.env directly, so schemas are enforced at startup.
 */
import { z } from 'zod';
/**
 * Parse and validate environment variables against a Zod schema.
 * Throws a descriptive error on the first missing/invalid variable.
 */
export declare function parseEnv<T extends z.ZodTypeAny>(schema: T, env?: NodeJS.ProcessEnv): z.infer<T>;
export declare const nodeEnvSchema: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
export declare const portSchema: z.ZodNumber;
export declare const apiEnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodString;
    CORS_ORIGINS: z.ZodEffects<z.ZodDefault<z.ZodString>, string[], string | undefined>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    DATABASE_URL: string;
    CORS_ORIGINS: string[];
    LOG_LEVEL: "error" | "debug" | "info" | "warn";
}, {
    DATABASE_URL: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: number | undefined;
    CORS_ORIGINS?: string | undefined;
    LOG_LEVEL?: "error" | "debug" | "info" | "warn" | undefined;
}>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export declare const mobileEnvSchema: z.ZodObject<{
    EXPO_PUBLIC_API_URL: z.ZodDefault<z.ZodString>;
    EXPO_PUBLIC_APP_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
}, "strip", z.ZodTypeAny, {
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_APP_ENV: "development" | "test" | "production";
}, {
    EXPO_PUBLIC_API_URL?: string | undefined;
    EXPO_PUBLIC_APP_ENV?: "development" | "test" | "production" | undefined;
}>;
export type MobileEnv = z.infer<typeof mobileEnvSchema>;
//# sourceMappingURL=index.d.ts.map