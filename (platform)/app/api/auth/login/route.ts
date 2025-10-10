import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';

// Force dynamic rendering and prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Collect cookies that Supabase will set
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

    // Create Supabase client with cookie collectors
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          set(name: string, value: string, options: any) {
            cookiesToSet.push({ name, value, options });
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          remove(name: string, options: any) {
            cookiesToSet.push({ name, value: '', options });
          },
        },
      }
    );

    // Attempt to sign in - this will collect cookies via the handlers above
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Return Supabase Auth user data directly
    // Database sync for roles/organizations happens on protected routes
    const response = NextResponse.json(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
        },
        session: data.session,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );

    // Now set all the cookies that Supabase collected
    for (const cookie of cookiesToSet) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}