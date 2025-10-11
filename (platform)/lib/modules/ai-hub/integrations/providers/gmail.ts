import 'server-only';

/**
 * Gmail Integration Provider
 *
 * Uses OAuth 2.0 for authentication
 * Supports sending emails with attachments
 */

interface GmailCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
}

interface GmailSendParams {
  to: string | string[];
  subject: string;
  body: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  isHtml?: boolean;
}

/**
 * Refresh Gmail access token
 */
async function refreshAccessToken(credentials: GmailCredentials): Promise<string> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: credentials.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
    }

    return data.access_token;
  } catch (error: any) {
    throw new Error(`Failed to refresh Gmail access token: ${error.message}`);
  }
}

/**
 * Create email message in RFC 2822 format
 */
function createEmailMessage(from: string, params: GmailSendParams): string {
  const to = Array.isArray(params.to) ? params.to.join(', ') : params.to;
  const cc = params.cc ? (Array.isArray(params.cc) ? params.cc.join(', ') : params.cc) : '';
  const bcc = params.bcc ? (Array.isArray(params.bcc) ? params.bcc.join(', ') : params.bcc) : '';

  let message = [
    `From: ${from}`,
    `To: ${to}`,
    cc ? `Cc: ${cc}` : '',
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: ${params.subject}`,
    `Content-Type: ${params.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
    '',
    params.body,
  ]
    .filter(Boolean)
    .join('\n');

  // Base64url encode
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Send email via Gmail API
 */
export async function sendGmail(
  credentials: GmailCredentials,
  params: GmailSendParams
): Promise<any> {
  try {
    // Refresh access token
    const accessToken = await refreshAccessToken(credentials);

    // Get user email (for from field)
    const userResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();
    const fromEmail = userData.emailAddress;

    // Create email message
    const encodedMessage = createEmailMessage(fromEmail, params);

    // Send email
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Gmail API error: ${data.error?.message || 'Unknown error'}`);
    }

    return {
      id: data.id,
      threadId: data.threadId,
      labelIds: data.labelIds,
    };
  } catch (error: any) {
    throw new Error(`Failed to send Gmail: ${error.message}`);
  }
}

/**
 * Test Gmail connection
 */
export async function testGmailConnection(
  credentials: GmailCredentials
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Try to refresh access token
    const accessToken = await refreshAccessToken(credentials);

    // Get user profile
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: 'Gmail API connection failed',
        error: data.error?.message || 'Unknown error',
      };
    }

    return {
      success: true,
      message: `Connected to Gmail: ${data.emailAddress}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Gmail connection test failed',
      error: error.message,
    };
  }
}
