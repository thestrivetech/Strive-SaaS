/**
 * Public configuration values safe for client-side use
 * All values here are prefixed with NEXT_PUBLIC_
 *
 * @module lib/config/public
 */

export const publicConfig = {
  /**
   * Application URL
   * Used for: Email links, redirects, OAuth callbacks
   */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /**
   * Supabase configuration (public keys only)
   */
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  /**
   * Stripe publishable key (safe for client)
   */
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  },

  /**
   * Feature flags
   */
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableAI: process.env.NEXT_PUBLIC_ENABLE_AI === 'true',
  },
} as const;

// Validate required public env vars at module load
if (!publicConfig.supabase.url) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!publicConfig.supabase.anonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
}
