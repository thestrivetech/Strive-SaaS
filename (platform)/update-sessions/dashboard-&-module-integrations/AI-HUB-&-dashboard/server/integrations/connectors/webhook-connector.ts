import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base-connector';

export class WebhookConnector extends BaseConnector {
  config: ConnectorConfig = {
    id: 'webhook',
    name: 'Webhook',
    description: 'Send HTTP requests to any webhook endpoint',
    icon: 'webhook',
    category: 'developer',
    authType: 'custom',
    configSchema: {
      url: { type: 'string', required: true, label: 'Webhook URL' },
      method: { type: 'select', required: true, label: 'HTTP Method', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      headers: { type: 'object', required: false, label: 'Custom Headers' },
      authHeader: { type: 'string', required: false, label: 'Authorization Header' },
    },
    capabilities: ['send_request', 'trigger_webhook'],
  };

  actions: ConnectorAction[] = [
    {
      id: 'send_request',
      name: 'Send Request',
      description: 'Send HTTP request to webhook endpoint',
      inputSchema: {
        body: { type: 'object', required: false, description: 'Request body (JSON)' },
        queryParams: { type: 'object', required: false, description: 'Query parameters' },
        headers: { type: 'object', required: false, description: 'Additional headers' },
      },
      outputSchema: {
        status: { type: 'number' },
        data: { type: 'any' },
        headers: { type: 'object' },
      },
    },
  ];

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const url = this.credentials.custom?.url;
      if (!url) {
        return { success: false, message: 'Webhook URL not configured' };
      }

      const response = await fetch(url, {
        method: 'HEAD',
        headers: this.buildHeaders({}),
      });

      return {
        success: response.ok || response.status === 405,
        message: response.ok ? 'Webhook endpoint is reachable' : `HTTP ${response.status}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async executeAction(actionId: string, input: any): Promise<any> {
    if (actionId === 'send_request') {
      return await this.sendRequest(input);
    }
    throw new Error(`Action ${actionId} not implemented`);
  }

  private buildHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.credentials.custom?.headers || {}),
      ...additionalHeaders,
    };

    if (this.credentials.custom?.authHeader) {
      headers['Authorization'] = this.credentials.custom.authHeader;
    }

    return headers;
  }

  private async sendRequest(input: any): Promise<any> {
    const url = this.credentials.custom?.url;
    if (!url) {
      throw new Error('Webhook URL not configured');
    }

    const method = (this.credentials.custom?.method || 'POST') as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    const response = await this.makeRequest(method, url, {
      headers: this.buildHeaders(input.headers),
      body: input.body,
      queryParams: input.queryParams,
    });

    return response;
  }
}
