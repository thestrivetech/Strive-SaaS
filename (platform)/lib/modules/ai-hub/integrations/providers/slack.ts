import 'server-only';

/**
 * Slack Integration Provider
 *
 * Supports:
 * - Webhook messages
 * - Bot API (with bot token)
 * - File uploads
 * - Thread replies
 */

interface SlackCredentials {
  webhookUrl?: string;
  botToken?: string;
}

interface SlackMessageParams {
  channel?: string;
  text: string;
  blocks?: any[];
  thread_ts?: string;
}

interface SlackFileParams {
  channels: string;
  file: Buffer | string;
  filename: string;
  title?: string;
  initial_comment?: string;
}

/**
 * Send message to Slack channel
 */
export async function sendSlackMessage(
  credentials: SlackCredentials,
  params: SlackMessageParams
): Promise<any> {
  try {
    // Use webhook if available (simpler)
    if (credentials.webhookUrl) {
      const response = await fetch(credentials.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: params.text,
          blocks: params.blocks,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Slack webhook failed: ${error}`);
      }

      return { success: true, method: 'webhook' };
    }

    // Use Bot API if bot token available
    if (credentials.botToken) {
      if (!params.channel) {
        throw new Error('Channel is required when using bot token');
      }

      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${credentials.botToken}`,
        },
        body: JSON.stringify({
          channel: params.channel,
          text: params.text,
          blocks: params.blocks,
          thread_ts: params.thread_ts,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      return data;
    }

    throw new Error('No valid Slack credentials provided');
  } catch (error: any) {
    throw new Error(`Failed to send Slack message: ${error.message}`);
  }
}

/**
 * Post reply to Slack thread
 */
export async function postSlackThread(
  credentials: SlackCredentials,
  params: SlackMessageParams & { thread_ts: string }
): Promise<any> {
  if (!credentials.botToken) {
    throw new Error('Bot token required for thread replies');
  }

  return sendSlackMessage(credentials, params);
}

/**
 * Upload file to Slack
 */
export async function uploadSlackFile(
  credentials: SlackCredentials,
  params: SlackFileParams
): Promise<any> {
  try {
    if (!credentials.botToken) {
      throw new Error('Bot token required for file uploads');
    }

    const formData = new FormData();
    formData.append('channels', params.channels);
    formData.append('filename', params.filename);

    if (params.title) {
      formData.append('title', params.title);
    }

    if (params.initial_comment) {
      formData.append('initial_comment', params.initial_comment);
    }

    // Handle file as Buffer or base64 string
    if (Buffer.isBuffer(params.file)) {
      formData.append('file', new Blob([params.file]), params.filename);
    } else {
      const buffer = Buffer.from(params.file, 'base64');
      formData.append('file', new Blob([buffer]), params.filename);
    }

    const response = await fetch('https://slack.com/api/files.upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.botToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack file upload error: ${data.error}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Failed to upload file to Slack: ${error.message}`);
  }
}

/**
 * Test Slack connection
 */
export async function testSlackConnection(
  credentials: SlackCredentials
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Test webhook if available
    if (credentials.webhookUrl) {
      const response = await fetch(credentials.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '[Test] Strive Tech AI-Hub connection test',
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: 'Webhook connection failed',
          error: await response.text(),
        };
      }

      return {
        success: true,
        message: 'Webhook connection successful',
      };
    }

    // Test bot token if available
    if (credentials.botToken) {
      const response = await fetch('https://slack.com/api/auth.test', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${credentials.botToken}`,
        },
      });

      const data = await response.json();

      if (!data.ok) {
        return {
          success: false,
          message: 'Bot token validation failed',
          error: data.error,
        };
      }

      return {
        success: true,
        message: `Connected as ${data.user} to ${data.team}`,
      };
    }

    return {
      success: false,
      message: 'No credentials provided',
      error: 'Either webhookUrl or botToken is required',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error.message,
    };
  }
}
