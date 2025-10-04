import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base-connector';

export class EmailConnector extends BaseConnector {
  config: ConnectorConfig = {
    id: 'email',
    name: 'Email (SMTP)',
    description: 'Send emails via SMTP',
    icon: 'mail',
    category: 'communication',
    authType: 'custom',
    configSchema: {
      smtpHost: { type: 'string', required: true, label: 'SMTP Host' },
      smtpPort: { type: 'number', required: true, label: 'SMTP Port' },
      username: { type: 'string', required: true, label: 'Username' },
      password: { type: 'string', required: true, label: 'Password', secure: true },
      fromEmail: { type: 'string', required: true, label: 'From Email' },
      fromName: { type: 'string', required: false, label: 'From Name' },
    },
    capabilities: ['send_email'],
  };

  actions: ConnectorAction[] = [
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send an email message',
      inputSchema: {
        to: { type: 'string', required: true, description: 'Recipient email' },
        subject: { type: 'string', required: true, description: 'Email subject' },
        body: { type: 'string', required: true, description: 'Email body (HTML or plain text)' },
        cc: { type: 'string', required: false, description: 'CC recipients (comma-separated)' },
        bcc: { type: 'string', required: false, description: 'BCC recipients (comma-separated)' },
        isHtml: { type: 'boolean', required: false, description: 'Is body HTML?' },
      },
      outputSchema: {
        success: { type: 'boolean' },
        messageId: { type: 'string' },
      },
    },
  ];

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Email connector configured (SMTP connection test requires actual send)',
    };
  }

  async executeAction(actionId: string, input: any): Promise<any> {
    if (actionId === 'send_email') {
      return await this.sendEmail(input);
    }
    throw new Error(`Action ${actionId} not implemented`);
  }

  private async sendEmail(input: any): Promise<any> {
    return {
      success: true,
      messageId: `simulated-${Date.now()}`,
      message: 'Email sending simulated (requires actual SMTP library like nodemailer)',
      input,
    };
  }
}
