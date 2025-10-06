import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AUTH_ROUTES, UserRole } from './constants';
import type { UserWithOrganization } from './user-helpers';
import { enhanceUser, type EnhancedUser } from './types';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: unknown) {
          cookieStore.set({ name, value, ...(options as Record<string, unknown>) });
        },
        remove(name: string, options: unknown) {
          cookieStore.set({ name, value: '', ...(options as Record<string, unknown>) });
        },
      },
    }
  );
};

export const getSession = async () => {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<UserWithOrganization | null> => {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  try {
    let user = await prisma.users.findUnique({
      where: {
        email: session.user.email!,
      },
      include: {
        organization_members: {
          include: {
            organizations: {
              include: {
                subscriptions: true,
              },
            },
          },
        },
      },
    });

    // Lazy sync: If user authenticated with Supabase but not in our DB, create them
    if (!user) {
      user = await prisma.users.create({
        data: {
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
        },
        include: {
          organization_members: {
            include: {
              organizations: {
                include: {
                  subscriptions: true,
                },
              },
            },
          },
        },
      });
    }

    return user as UserWithOrganization | null;
  } catch (error) {
    console.error('Error fetching user from database:', error);
    return null;
  }
};

/**
 * Require authentication and return enhanced user object
 * This function replaces the old requireAuth that returned a session
 *
 * @returns Enhanced user with organization data and convenient property accessors
 * @throws Redirects to login if not authenticated or no organization
 */
export const requireAuth = async (): Promise<EnhancedUser> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  if (!user.organization_members || user.organization_members.length === 0) {
    redirect('/onboarding/organization');
  }

  return enhanceUser(user);
};

/**
 * Get current session (Supabase auth session)
 * Use requireAuth() instead if you need user data with organization
 *
 * @returns Supabase session or redirects to login
 * @deprecated Use requireAuth() for most cases
 */
export const requireSession = async () => {
  const session = await getSession();

  if (!session) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  return session;
};

export const requireRole = async (requiredRole: UserRole) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  if (user.role !== requiredRole && user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return user;
};

export const requireOrganization = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  if (!user.organization_members || user.organization_members.length === 0) {
    redirect('/onboarding/organization');
  }

  return user.organization_members[0].organizations;
};

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }

  redirect(AUTH_ROUTES.LOGIN);
}

export async function signIn(email: string, password: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // User sync happens lazily in getCurrentUser() when needed
  return data;
}

export async function signUp(email: string, password: string, name?: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  // User sync happens lazily in getCurrentUser() when needed
  return data;
}