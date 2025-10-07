import 'server-only';

/**
 * Server-only configuration values
 * NEVER import this in client components
 *
 * @module lib/config/server
 */

export const serverConfig = {
  /**
   * Database configuration
   */
  database: {
    url: process.env.DATABASE_URL!,
  },

  /**
   * Supabase service role (bypasses RLS - server only!)
   */
  supabase: {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  /**
   * Stripe secrets (server only)
   */
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },

  /**
   * Document encryption key (AES-256-GCM)
   */
  encryption: {
    documentKey: process.env.DOCUMENT_ENCRYPTION_KEY!,
  },

  /**
   * Email service API key
   */
  email: {
    resendApiKey: process.env.RESEND_API_KEY!,
  },
} as const;
