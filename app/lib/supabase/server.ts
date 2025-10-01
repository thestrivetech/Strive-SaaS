import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Server client for Supabase with cookie-based authentication
 *
 * Use this in Server Components, Server Actions, and Route Handlers.
 * This client respects RLS policies and uses the authenticated user's context.
 *
 * @example Server Component
 * ```tsx
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data: user } = await supabase.auth.getUser();
 *   return <div>Welcome {user?.email}</div>;
 * }
 * ```
 *
 * @example Server Action
 * ```tsx
 * 'use server';
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function signOut() {
 *   const supabase = await createClient();
 *   await supabase.auth.signOut();
 *   redirect('/login');
 * }
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting can fail in certain contexts (e.g., middleware)
            // This is expected and can be safely ignored
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie removal can fail in certain contexts
            // This is expected and can be safely ignored
          }
        },
      },
    }
  );
}

/**
 * Service Role client for Supabase (bypasses RLS)
 *
 * ⚠️ WARNING: This client has full database access and bypasses all RLS policies.
 * Only use for:
 * - Administrative operations
 * - Background jobs
 * - System-level operations
 * - Operations that require cross-tenant access
 *
 * DO NOT use for user-facing operations - use createClient() instead.
 *
 * @example
 * ```tsx
 * 'use server';
 * import { createServiceRoleClient } from '@/lib/supabase/server';
 *
 * export async function adminDeleteUser(userId: string) {
 *   const supabase = createServiceRoleClient();
 *   // This bypasses RLS and can access/modify any data
 *   await supabase.from('users').delete().eq('id', userId);
 * }
 * ```
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Admin client for Supabase (bypasses RLS)
 *
 * Alias for createServiceRoleClient() for better semantic meaning
 * in administrative contexts.
 */
export const createAdminClient = createServiceRoleClient;
