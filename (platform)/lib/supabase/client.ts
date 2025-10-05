'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useMemo } from 'react';
import type { Database } from '@/lib/types/shared/supabase';

/**
 * Browser client for Supabase
 *
 * Use this hook in Client Components to get a Supabase client
 * that properly handles browser authentication.
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useSupabaseClient } from '@/lib/supabase/client';
 *
 * export function MyComponent() {
 *   const supabase = useSupabaseClient();
 *
 *   const handleSignIn = async () => {
 *     const { error } = await supabase.auth.signInWithPassword({
 *       email: 'user@example.com',
 *       password: 'password',
 *     });
 *   };
 *
 *   return <button onClick={handleSignIn}>Sign In</button>;
 * }
 * ```
 */
export function useSupabaseClient() {
  return useMemo(() => {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);
}

/**
 * Create a browser client for Supabase
 *
 * Alternative to useSupabaseClient for use outside of React components.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
