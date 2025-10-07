/**
 * Next.js Instrumentation Hook
 * Validates required environment variables at startup (production only)
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.NODE_ENV === 'production') {
      console.log('[Startup] Validating required secrets...');

      const requiredSecrets = [
        'DATABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'DOCUMENT_ENCRYPTION_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'RESEND_API_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ];

      const missing: string[] = [];

      for (const secret of requiredSecrets) {
        if (!process.env[secret]) {
          missing.push(secret);
        }
      }

      if (missing.length > 0) {
        console.error('[Startup] CRITICAL: Missing required secrets:');
        missing.forEach(secret => console.error(`  - ${secret}`));
        throw new Error(
          `Missing ${missing.length} required environment variable(s). ` +
          `Check .env.local file. Missing: ${missing.join(', ')}`
        );
      }

      console.log('[Startup] ✅ All required secrets present');

      // Validate encryption key format
      const encryptionKey = process.env.DOCUMENT_ENCRYPTION_KEY;
      if (encryptionKey && encryptionKey.length !== 64) {
        throw new Error(
          'DOCUMENT_ENCRYPTION_KEY must be 64 hex characters (32 bytes). ' +
          'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
      }
    }
  }
}
