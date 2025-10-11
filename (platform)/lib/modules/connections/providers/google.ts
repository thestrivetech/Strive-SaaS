import { type ProviderConfig } from '../schemas';

/**
 * Google OAuth Provider Configuration
 */
export const googleConfig: ProviderConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`,
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.file',
  ],
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: googleConfig.clientId,
    redirect_uri: googleConfig.redirectUri,
    response_type: 'code',
    scope: googleConfig.scope.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${googleConfig.authorizationUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGoogleCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}> {
  const response = await fetch(googleConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: googleConfig.clientId,
      client_secret: googleConfig.clientSecret,
      redirect_uri: googleConfig.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange authorization code');
  }

  return response.json();
}

/**
 * Get Google user profile
 */
export async function getGoogleUserProfile(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture: string;
}> {
  const response = await fetch(googleConfig.userInfoUrl || '', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

/**
 * Refresh Google access token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const response = await fetch(googleConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: googleConfig.clientId,
      client_secret: googleConfig.clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
}
