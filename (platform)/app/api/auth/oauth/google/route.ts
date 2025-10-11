import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { getGoogleAuthUrl } from '@/lib/modules/connections/providers/google';
import { randomBytes } from 'crypto';

/**
 * Google OAuth Initiation
 * GET /api/auth/oauth/google
 */
export async function GET() {
  try {
    // Require authentication
    await requireAuth();

    // Generate state parameter for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation later
    const response = NextResponse.redirect(getGoogleAuthUrl(state));
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.redirect(
      `/settings/connections?error=${encodeURIComponent('Failed to initiate Google OAuth')}`
    );
  }
}
