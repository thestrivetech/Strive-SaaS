import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { exchangeGoogleCode, getGoogleUserProfile } from '@/lib/modules/connections/providers/google';
import { upsertConnection } from '@/lib/modules/connections';

/**
 * Google OAuth Callback Handler
 * GET /api/auth/oauth/google/callback
 */
export async function GET(request: NextRequest) {
  try {
    // Get search params
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?error=${encodeURIComponent(error)}`
      );
    }

    // Validate required params
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?error=missing_parameters`
      );
    }

    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get('oauth_state')?.value;
    if (state !== storedState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?error=invalid_state`
      );
    }

    // Require authentication
    await requireAuth();

    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code);

    // Get user profile
    const profile = await getGoogleUserProfile(tokens.access_token);

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Save connection to database
    await upsertConnection({
      provider: 'GOOGLE',
      providerUserId: profile.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      scope: tokens.scope,
      profileData: {
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      },
    });

    // Clear state cookie
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?success=google_connected`
    );
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'oauth_failed'
      )}`
    );
  }
}
