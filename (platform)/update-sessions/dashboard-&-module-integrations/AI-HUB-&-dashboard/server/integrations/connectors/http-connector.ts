import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base-connector';

export class HttpConnector extends BaseConnector {
  config: ConnectorConfig = {
    id: 'http',
    name: 'HTTP Request',
    description: 'Make HTTP requests to any REST API',
    icon: 'globe',
    category: 'developer',
    authType: 'custom',
    configSchema: {
      baseUrl: { type: 'string', required: false, label: 'Base URL' },
      defaultHeaders: { type: 'object', required: false, label: 'Default Headers' },
    },
    capabilities: ['get', 'post', 'put', 'delete', 'patch'],
  };

  actions: ConnectorAction[] = [
    {
      id: 'get',
      name: 'GET Request',
      description: 'Send GET request',
      inputSchema: {
        url: { type: 'string', required: true, description: 'Request URL' },
        headers: { type: 'object', required: false, description: 'Request headers' },
        queryParams: { type: 'object', required: false, description: 'Query parameters' },
      },
      outputSchema: {
        status: { type: 'number' },
        data: { type: 'any' },
        headers: { type: 'object' },
      },
    },
    {
      id: 'post',
      name: 'POST Request',
      description: 'Send POST request',
      inputSchema: {
        url: { type: 'string', required: true, description: 'Request URL' },
        body: { type: 'object', required: true, description: 'Request body' },
        headers: { type: 'object', required: false, description: 'Request headers' },
      },
      outputSchema: {
        status: { type: 'number' },
        data: { type: 'any' },
        headers: { type: 'object' },
      },
    },
    {
      id: 'put',
      name: 'PUT Request',
      description: 'Send PUT request',
      inputSchema: {
        url: { type: 'string', required: true, description: 'Request URL' },
        body: { type: 'object', required: true, description: 'Request body' },
        headers: { type: 'object', required: false, description: 'Request headers' },
      },
      outputSchema: {
        status: { type: 'number' },
        data: { type: 'any' },
      },
    },
    {
      id: 'delete',
      name: 'DELETE Request',
      description: 'Send DELETE request',
      inputSchema: {
        url: { type: 'string', required: true, description: 'Request URL' },
        headers: { type: 'object', required: false, description: 'Request headers' },
      },
      outputSchema: {
        status: { type: 'number' },
        data: { type: 'any' },
      },
    },
    {
      id: 'patch',
      name: 'PATCH Request',
      description: 'Send PATCH request',
      inputSchema: {
        url: { type: 'string', required: true, description: 'Request URL' },
        body: { type: 'object', required: true, description: 'Request body' },
        headers: { type: 'object', required: false, description: 'Request headers' },
      },
      outputSchema: {
        status: { type: 'number' },
        data: { type: 'any' },
      },
    },
  ];

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const baseUrl = this.credentials.custom?.baseUrl;
    if (baseUrl) {
      try {
        await fetch(baseUrl, { method: 'HEAD' });
        return { success: true, message: 'Base URL is reachable' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
    return { success: true, message: 'HTTP connector ready (no base URL configured)' };
  }

  async executeAction(actionId: string, input: any): Promise<any> {
    const url = this.buildUrl(input.url);
    const headers = { ...this.credentials.custom?.defaultHeaders, ...input.headers };

    switch (actionId) {
      case 'get':
        return await this.makeRequest('GET', url, { headers, queryParams: input.queryParams });
      case 'post':
        return await this.makeRequest('POST', url, { headers, body: input.body });
      case 'put':
        return await this.makeRequest('PUT', url, { headers, body: input.body });
      case 'delete':
        return await this.makeRequest('DELETE', url, { headers });
      case 'patch':
        return await this.makeRequest('PATCH', url, { headers, body: input.body });
      default:
        throw new Error(`Action ${actionId} not implemented`);
    }
  }

  private buildUrl(path: string): string {
    const baseUrl = this.credentials.custom?.baseUrl;
    if (!baseUrl) {
      return path;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
