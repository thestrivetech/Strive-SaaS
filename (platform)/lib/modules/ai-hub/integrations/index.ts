/**
 * AI Hub - Integrations Module
 *
 * External service integrations for workflows:
 * - Slack (messages, files, threads)
 * - Gmail (OAuth emails)
 * - Webhooks (custom HTTP)
 * - HTTP (general API client)
 *
 * @module ai-hub/integrations
 */

// Schemas
export * from './schemas';

// Queries
export * from './queries';

// Actions
export * from './actions';

// Utilities
export * from './utils';

// Providers
export * from './providers/slack';
export * from './providers/gmail';
export * from './providers/webhook';
export * from './providers/http';
