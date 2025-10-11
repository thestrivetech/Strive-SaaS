import 'server-only';

import crypto from 'crypto';

/**
 * Encryption configuration
 * Uses AES-256-GCM for strong encryption
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY;

  if (!key) {
    throw new Error('DOCUMENT_ENCRYPTION_KEY is not configured');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt credentials before storing in database
 *
 * @param credentials - Credentials object to encrypt
 * @returns Encrypted string with IV and auth tag
 */
export function encryptCredentials(credentials: Record<string, any>): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key with salt for added security
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    const text = JSON.stringify(credentials);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine: salt + iv + tag + encrypted
    const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);

    return result.toString('base64');
  } catch (error: any) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt credentials retrieved from database
 *
 * @param encryptedData - Encrypted credentials string
 * @returns Decrypted credentials object
 */
export function decryptCredentials(encryptedData: string): Record<string, any> {
  try {
    const key = getEncryptionKey();
    const data = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = data.subarray(ENCRYPTED_POSITION);

    // Derive key with salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Validate provider-specific configuration
 *
 * @param provider - Integration provider
 * @param credentials - Credentials object
 * @returns Validation result
 */
export function validateProviderConfig(
  provider: string,
  credentials: Record<string, any>
): { valid: boolean; error?: string } {
  switch (provider) {
    case 'SLACK':
      if (!credentials.webhookUrl && !credentials.botToken) {
        return {
          valid: false,
          error: 'Slack requires either webhookUrl or botToken'
        };
      }
      break;

    case 'GMAIL':
      if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
        return {
          valid: false,
          error: 'Gmail requires clientId, clientSecret, and refreshToken',
        };
      }
      break;

    case 'WEBHOOK':
      if (!credentials.url) {
        return { valid: false, error: 'Webhook requires url' };
      }
      try {
        new URL(credentials.url);
      } catch {
        return { valid: false, error: 'Invalid webhook URL' };
      }
      break;

    case 'HTTP':
      if (!credentials.baseUrl) {
        return { valid: false, error: 'HTTP requires baseUrl' };
      }
      try {
        new URL(credentials.baseUrl);
      } catch {
        return { valid: false, error: 'Invalid base URL' };
      }
      break;

    default:
      return { valid: false, error: `Unknown provider: ${provider}` };
  }

  return { valid: true };
}

/**
 * Test provider connection
 *
 * @param provider - Integration provider
 * @param credentials - Decrypted credentials
 * @returns Test result
 */
export async function testProviderConnection(
  provider: string,
  credentials: Record<string, any>
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Validate configuration first
    const validation = validateProviderConfig(provider, credentials);
    if (!validation.valid) {
      return { success: false, message: 'Validation failed', error: validation.error };
    }

    // Import provider-specific test function
    switch (provider) {
      case 'SLACK': {
        const { testSlackConnection } = await import('./providers/slack');
        return await testSlackConnection(credentials);
      }

      case 'GMAIL': {
        const { testGmailConnection } = await import('./providers/gmail');
        return await testGmailConnection(credentials);
      }

      case 'WEBHOOK': {
        const { testWebhookConnection } = await import('./providers/webhook');
        return await testWebhookConnection(credentials);
      }

      case 'HTTP': {
        const { testHTTPConnection } = await import('./providers/http');
        return await testHTTPConnection(credentials);
      }

      default:
        return { success: false, message: 'Test failed', error: `Unknown provider: ${provider}` };
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error.message
    };
  }
}

/**
 * Format provider response for consistent output
 *
 * @param provider - Integration provider
 * @param rawResponse - Raw response from provider
 * @returns Formatted response
 */
export function formatProviderResponse(
  provider: string,
  rawResponse: any
): Record<string, any> {
  return {
    provider,
    success: true,
    timestamp: new Date().toISOString(),
    data: rawResponse,
  };
}

/**
 * Sanitize credentials for logging (remove sensitive data)
 *
 * @param credentials - Credentials object
 * @returns Sanitized credentials
 */
export function sanitizeCredentials(credentials: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(credentials)) {
    if (typeof value === 'string') {
      // Show only first/last 4 characters of sensitive values
      if (value.length > 12) {
        sanitized[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
      } else {
        sanitized[key] = '***';
      }
    } else {
      sanitized[key] = '***';
    }
  }

  return sanitized;
}
