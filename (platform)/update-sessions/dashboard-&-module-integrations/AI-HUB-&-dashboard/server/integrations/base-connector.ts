export interface ConnectorConfig {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: 'communication' | 'productivity' | 'data' | 'developer' | 'custom';
  authType: 'none' | 'api_key' | 'oauth2' | 'basic' | 'custom';
  configSchema: Record<string, any>;
  capabilities: string[];
}

export interface ConnectorCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  password?: string;
  custom?: Record<string, any>;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}

export abstract class BaseConnector {
  abstract config: ConnectorConfig;
  abstract actions: ConnectorAction[];

  protected credentials: ConnectorCredentials = {};

  setCredentials(credentials: ConnectorCredentials): void {
    this.credentials = credentials;
  }

  abstract testConnection(): Promise<{ success: boolean; message: string }>;

  abstract executeAction(actionId: string, input: any): Promise<any>;

  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    options: {
      headers?: Record<string, string>;
      body?: any;
      queryParams?: Record<string, string>;
    } = {}
  ): Promise<{ status: number; data: any; headers: Record<string, string> }> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let fullUrl = url;
    if (options.queryParams) {
      const params = new URLSearchParams(options.queryParams);
      fullUrl += `?${params.toString()}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options.body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(fullUrl, fetchOptions);

    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      data,
      headers: responseHeaders,
    };
  }
}
