import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { signupApiSchema } from '@/lib/auth/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, username } = signupApiSchema.parse(body);

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(_name: string, _value: string, _options: unknown) {
            // We'll set cookies in the response
          },
          remove(_name: string, _options: unknown) {
            // We'll remove cookies in the response
          },
        },
      }
    );

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
          username,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Return success - user created in Supabase Auth
    // Database sync for roles/organizations happens when user first logs in
    if (data.user) {
      return NextResponse.json(
        {
          message: 'Account created successfully! Please check your email for verification.',
          user: {
            id: data.user.id,
            email: data.user.email,
            name: username,
          },
          needsVerification: !data.session, // If no session, verification email was sent
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user account' },
      { status: 500 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'errors' in error && Array.isArray(error.errors) && error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}