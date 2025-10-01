import { z } from 'zod';

/**
 * Environment variable schema with validation
 *
 * This validates all required environment variables at application startup,
 * providing clear error messages if any are missing or invalid.
 *
 * Import this file in app/layout.tsx to ensure validation runs before the app starts.
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith('postgres', 'DATABASE_URL must be a PostgreSQL connection string'),
  DIRECT_URL: z.string().url().startsWith('postgres', 'DIRECT_URL must be a PostgreSQL connection string').optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32, 'NEXT_PUBLIC_SUPABASE_ANON_KEY must be at least 32 characters'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32, 'SUPABASE_SERVICE_ROLE_KEY must be at least 32 characters'),

  // AI Services (optional)
  GROQ_API_KEY: z.string().min(10).optional(),
  OPENAI_API_KEY: z.string().min(10).optional(),
  OPENROUTER_API_KEY: z.string().min(10).optional(),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Auth (optional - if using Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),

  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
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
 * Helper function to check if a feature is enabled
 */
export function isFeatureEnabled(feature: 'ai' | 'stripe' | 'clerk'): boolean {
  switch (feature) {
    case 'ai':
      return !!(env.GROQ_API_KEY || env.OPENAI_API_KEY || env.OPENROUTER_API_KEY);
    case 'stripe':
      return !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY);
    case 'clerk':
      return !!(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
    default:
      return false;
  }
}
