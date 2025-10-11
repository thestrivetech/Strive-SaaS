import 'server-only';

/**
 * HTTP Integration Provider
 *
 * General-purpose HTTP client for API integrations
 * Supports all HTTP methods, custom headers, and request/response logging
 */

interface HTTPCredentials {
  baseUrl: string;
  headers?: Record<string, string>;
  authType?: 'none' | 'bearer' | 'basic' | 'apiKey';
  authToken?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  timeout?: number; // milliseconds
}

interface HTTPRequestParams {
  path?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

interface HTTPResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  executionTime: number;
}

/**
 * Build authentication headers
 */
function buildAuthHeaders(credentials: HTTPCredentials): Record<string, string> {
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
 * Execute HTTP request
 */
export async function executeHTTPRequest(
  credentials: HTTPCredentials,
  params: HTTPRequestParams = {}
): Promise<HTTPResponse> {
  const startTime = Date.now();
  const method = params.method || 'GET';
  const timeout = params.timeout || credentials.timeout || 30000;
  const maxRetries = params.retries || 3;

  // Build URL
  let url = credentials.baseUrl;
  if (params.path) {
    url = url.endsWith('/') ? url + params.path.replace(/^\//, '') : url + params.path;
  }

  if (params.query && Object.keys(params.query).length > 0) {
    const searchParams = new URLSearchParams(params.query);
    url += `${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
  }

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Strive-Tech-AI-Hub/1.0',
    ...buildAuthHeaders(credentials),
    ...(credentials.headers || {}),
    ...(params.headers || {}),
  };

  // Retry logic
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: params.body ? JSON.stringify(params.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        // Binary data
        data = await response.arrayBuffer();
      }

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(
          `HTTP request failed (${response.status}): ${
            typeof data === 'string' ? data : JSON.stringify(data)
          }`
        );
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        executionTime,
      };
    } catch (error: any) {
      // Don't retry on timeout
      if (error.name === 'AbortError') {
        throw new Error(`HTTP request timeout after ${timeout}ms`);
      }

      // Retry on network errors
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw new Error(`HTTP request failed after ${maxRetries} attempts: ${error.message}`);
    }
  }

  throw new Error('HTTP request execution failed');
}

/**
 * Test HTTP connection
 */
export async function testHTTPConnection(
  credentials: HTTPCredentials
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Try HEAD request first (lightweight)
    const result = await executeHTTPRequest(credentials, {
      method: 'HEAD',
      timeout: 10000,
      retries: 1,
    }).catch(() => {
      // If HEAD fails, try GET
      return executeHTTPRequest(credentials, {
        method: 'GET',
        timeout: 10000,
        retries: 1,
      });
    });

    return {
      success: true,
      message: `HTTP connection successful (${result.status} ${result.statusText}) - ${result.executionTime}ms`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'HTTP connection test failed',
      error: error.message,
    };
  }
}

/**
 * Log HTTP request/response (for debugging)
 */
export function logHTTPRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: any
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[HTTP Request]', {
      url,
      method,
      headers,
      body,
    });
  }
}

export function logHTTPResponse(response: HTTPResponse): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[HTTP Response]', {
      status: response.status,
      statusText: response.statusText,
      executionTime: `${response.executionTime}ms`,
      data: response.data,
    });
  }
}
