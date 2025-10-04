import { BaseConnector } from './base-connector';
import { SlackConnector } from './connectors/slack-connector';
import { WebhookConnector } from './connectors/webhook-connector';
import { HttpConnector } from './connectors/http-connector';
import { EmailConnector } from './connectors/email-connector';

export class ConnectorRegistry {
  private connectors: Map<string, () => BaseConnector> = new Map();

  constructor() {
    this.registerDefaultConnectors();
  }

  private registerDefaultConnectors(): void {
    this.register('slack', () => new SlackConnector());
    this.register('webhook', () => new WebhookConnector());
    this.register('http', () => new HttpConnector());
    this.register('email', () => new EmailConnector());
  }

  register(id: string, factory: () => BaseConnector): void {
    this.connectors.set(id, factory);
  }

  getConnector(id: string): BaseConnector {
    const factory = this.connectors.get(id);
    if (!factory) {
      throw new Error(`Connector ${id} not found`);
    }
    return factory();
  }

  listConnectors(): Array<{ id: string; config: any }> {
    return Array.from(this.connectors.entries()).map(([id, factory]) => {
      const connector = factory();
      return {
        id,
        config: connector.config,
      };
    });
  }

  getConnectorActions(id: string): any[] {
    const connector = this.getConnector(id);
    return connector.actions;
  }
}

export const connectorRegistry = new ConnectorRegistry();
