import 'server-only';

import { z } from 'zod';

/**
 * Environment variable schema with validation
 *
 * This validates all required environment variables at application startup,
 * providing clear error messages if any are missing or invalid.
 *
 * IMPORTANT: This file is server-only and will never be exposed to the client.
 * Use NEXT_PUBLIC_ prefix only for variables that should be accessible client-side.
 *
 * Import this file in app/layout.tsx to ensure validation runs before the app starts.
 */

const envSchema = z.object({
  // ============================================================================
  // Database
  // ============================================================================
  DATABASE_URL: z.string().url().startsWith('postgres', 'DATABASE_URL must be a PostgreSQL connection string'),
  DIRECT_URL: z.string().url().startsWith('postgres', 'DIRECT_URL must be a PostgreSQL connection string').optional(),

  // ============================================================================
  // Supabase
  // ============================================================================
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32, 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be at least 32 characters'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32, 'SUPABASE_SERVICE_ROLE_KEY must be at least 32 characters (NEVER expose to client!)'),

  // ============================================================================
  // AI Services (optional)
  // ============================================================================
  GROQ_API_KEY: z.string().min(10).optional(),
  OPENAI_API_KEY: z.string().min(10).optional(),
  OPENROUTER_API_KEY: z.string().min(10).optional(),

  // ============================================================================
  // Upstash Redis (Rate Limiting & Caching)
  // ============================================================================
  UPSTASH_REDIS_REST_URL: z.string().url().optional().describe('Upstash Redis REST URL for rate limiting'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional().describe('Upstash Redis REST token'),

  // ============================================================================
  // App Configuration
  // ============================================================================
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // ============================================================================
  // Auth (optional - if using Clerk)
  // ============================================================================
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),

  // ============================================================================
  // Stripe (optional)
  // ============================================================================
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // ============================================================================
  // Optional: Analytics & Monitoring
  // ============================================================================
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // ============================================================================
  // Optional: Email & Communications
  // ============================================================================
  RESEND_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 *
 * @throws {Error} If validation fails
 * @returns {Env} Validated environment variables
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated successfully');
    }

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:\n');
      console.error('Missing or invalid environment variables:\n');

      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });

      console.error('\nPlease check your .env.local file and ensure all required variables are set.');
      console.error('See .env.local.example for reference.\n');

      process.exit(1);
    }

    throw error;
  }
}

/**
 * Validated environment variables
 *
 * This is executed when the module is imported, ensuring validation
 * happens at application startup.
 */
export const env = validateEnv();

/**
 * Check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Helper function to check if a feature is enabled
 */
export function isFeatureEnabled(feature: 'ai' | 'stripe' | 'clerk' | 'redis'): boolean {
  switch (feature) {
    case 'ai':
      return !!(env.GROQ_API_KEY || env.OPENAI_API_KEY || env.OPENROUTER_API_KEY);
    case 'stripe':
      return !!(env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    case 'clerk':
      return !!(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
    case 'redis':
      return !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
    default:
      return false;
  }
}

/**
 * Assert environment variable exists (runtime check)
 *
 * Use this for optional env vars that become required in certain contexts.
 *
 * @example
 * ```typescript
 * function sendEmail() {
 *   assertEnvExists('RESEND_API_KEY', 'Email sending requires RESEND_API_KEY');
 *   // Now safe to use env.RESEND_API_KEY
 * }
 * ```
 */
export function assertEnvExists(
  key: keyof Env,
  message?: string
): void {
  if (!env[key]) {
    throw new Error(
      message || `Environment variable ${key} is required but not set`
    );
  }
}

/**
 * Development-only logging
 */
if (isDevelopment) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Environment:', env.NODE_ENV);
  console.log('App URL:', env.NEXT_PUBLIC_APP_URL);
  console.log('Database:', env.DATABASE_URL ? '✅ Connected' : '❌ Not configured');
  console.log('Supabase:', env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Connected' : '❌ Not configured');
  console.log('Redis (Rate Limiting):', isFeatureEnabled('redis') ? '✅ Enabled' : '⚠️  Disabled (dev mode OK)');
  console.log('Stripe:', isFeatureEnabled('stripe') ? '✅ Configured' : '⚠️  Not configured');
  console.log('AI Providers:', isFeatureEnabled('ai') ? '✅ Configured' : '⚠️  Not configured');
  console.log('Clerk Auth:', isFeatureEnabled('clerk') ? '✅ Configured' : '⚠️  Not configured');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
