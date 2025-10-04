import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base-connector';

export class SlackConnector extends BaseConnector {
  config: ConnectorConfig = {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and interact with Slack workspaces',
    icon: 'slack',
    category: 'communication',
    authType: 'api_key',
    configSchema: {
      botToken: { type: 'string', required: true, label: 'Bot User OAuth Token' },
      workspaceName: { type: 'string', required: false, label: 'Workspace Name' },
    },
    capabilities: ['send_message', 'list_channels', 'get_user_info', 'upload_file'],
  };

  actions: ConnectorAction[] = [
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send a message to a Slack channel or user',
      inputSchema: {
        channel: { type: 'string', required: true, description: 'Channel ID or name (e.g., #general)' },
        text: { type: 'string', required: true, description: 'Message text' },
        blocks: { type: 'array', required: false, description: 'Rich message blocks' },
        threadTs: { type: 'string', required: false, description: 'Thread timestamp for replies' },
      },
      outputSchema: {
        ok: { type: 'boolean' },
        channel: { type: 'string' },
        ts: { type: 'string' },
        message: { type: 'object' },
      },
    },
    {
      id: 'list_channels',
      name: 'List Channels',
      description: 'Get list of channels in workspace',
      inputSchema: {
        types: { type: 'string', required: false, description: 'public_channel,private_channel' },
        limit: { type: 'number', required: false, description: 'Max results (default 100)' },
      },
      outputSchema: {
        ok: { type: 'boolean' },
        channels: { type: 'array' },
      },
    },
    {
      id: 'get_user_info',
      name: 'Get User Info',
      description: 'Get information about a Slack user',
      inputSchema: {
        userId: { type: 'string', required: true, description: 'User ID' },
      },
      outputSchema: {
        ok: { type: 'boolean' },
        user: { type: 'object' },
      },
    },
  ];

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest('POST', 'https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (response.data.ok) {
        return {
          success: true,
          message: `Connected to ${response.data.team} workspace as ${response.data.user}`,
        };
      }

      return {
        success: false,
        message: response.data.error || 'Authentication failed',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async executeAction(actionId: string, input: any): Promise<any> {
    switch (actionId) {
      case 'send_message':
        return await this.sendMessage(input);
      case 'list_channels':
        return await this.listChannels(input);
      case 'get_user_info':
        return await this.getUserInfo(input);
      default:
        throw new Error(`Action ${actionId} not implemented`);
    }
  }

  private getToken(): string {
    const creds = this.credentials as any;
    return creds.botToken || creds.custom?.botToken || creds.apiKey || '';
  }

  private async sendMessage(input: any): Promise<any> {
    const body: any = {
      channel: input.channel,
      text: input.text,
    };

    if (input.blocks) {
      body.blocks = input.blocks;
    }

    if (input.threadTs) {
      body.thread_ts = input.threadTs;
    }

    const response = await this.makeRequest('POST', 'https://slack.com/api/chat.postMessage', {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body,
    });

    return response.data;
  }

  private async listChannels(input: any): Promise<any> {
    const queryParams: Record<string, string> = {};
    
    if (input.types) {
      queryParams.types = input.types;
    }
    
    if (input.limit) {
      queryParams.limit = input.limit.toString();
    }

    const response = await this.makeRequest('GET', 'https://slack.com/api/conversations.list', {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      queryParams,
    });

    return response.data;
  }

  private async getUserInfo(input: any): Promise<any> {
    const response = await this.makeRequest('GET', 'https://slack.com/api/users.info', {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      queryParams: {
        user: input.userId,
      },
    });

    return response.data;
  }
}
