import 'server-only';

/**
 * Webhook Integration Provider
 *
 * Generic webhook support for POST/GET requests
 * with custom headers and payload transformation
 */

interface WebhookCredentials {
  url: string;
  headers?: Record<string, string>;
  method?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
  authType?: 'none' | 'bearer' | 'basic' | 'apiKey';
  authToken?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

interface WebhookParams {
  payload?: any;
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number; // milliseconds
}

/**
 * Build authentication headers
 */
function buildAuthHeaders(credentials: WebhookCredentials): Record<string, string> {
  const headers: Record<string, string> = {};

  switch (credentials.authType) {
    case 'bearer':
      if (credentials.authToken) {
        headers['Authorization'] = `Bearer ${credentials.authToken}`;
      }
      break;

    case 'basic':
      if (credentials.username && credentials.password) {
        const encoded = Buffer.from(
          `${credentials.username}:${credentials.password}`
        ).toString('base64');
        headers['Authorization'] = `Basic ${encoded}`;
      }
      break;

    case 'apiKey':
      if (credentials.apiKey && credentials.apiKeyHeader) {
        headers[credentials.apiKeyHeader] = credentials.apiKey;
      }
      break;

    case 'none':
    default:
      // No authentication
      break;
  }

  return headers;
}

/**
 * Send webhook request with retry logic
 */
export async function sendWebhook(
  credentials: WebhookCredentials,
  params: WebhookParams = {}
): Promise<any> {
  const maxRetries = 3;
  const timeout = params.timeout || 30000; // 30 seconds default
  const method = credentials.method || 'POST';

  // Build URL with query parameters
  let url = credentials.url;
  if (params.queryParams && Object.keys(params.queryParams).length > 0) {
    const searchParams = new URLSearchParams(params.queryParams);
    url += `?${searchParams.toString()}`;
  }

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Strive-Tech-AI-Hub/1.0',
    ...buildAuthHeaders(credentials),
    ...(credentials.headers || {}),
    ...(params.headers || {}),
  };

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: params.payload ? JSON.stringify(params.payload) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(`Webhook failed (${response.status}): ${JSON.stringify(data)}`);
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };
    } catch (error: any) {
      // Don't retry on timeout or abort
      if (error.name === 'AbortError') {
        throw new Error(`Webhook request timeout after ${timeout}ms`);
      }

      // Retry on network errors
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw new Error(`Webhook failed after ${maxRetries} attempts: ${error.message}`);
    }
  }

  throw new Error('Webhook execution failed');
}

/**
 * Parse webhook response
 */
export function parseWebhookResponse(response: any, transform?: string): any {
  if (!transform) {
    return response;
  }

  try {
    // Simple JSON path extraction (e.g., "data.result")
    const keys = transform.split('.');
    let result = response;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return response; // Can't transform, return original
      }
    }

    return result;
  } catch {
    return response;
  }
}

/**
 * Test webhook connection
 */
export async function testWebhookConnection(
  credentials: WebhookCredentials
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Send test request
    const result = await sendWebhook(credentials, {
      payload: { test: true, source: 'Strive Tech AI-Hub' },
      timeout: 10000, // 10 second timeout for test
    });

    return {
      success: true,
      message: `Webhook connection successful (${result.status} ${result.statusText})`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Webhook connection test failed',
      error: error.message,
    };
  }
}
