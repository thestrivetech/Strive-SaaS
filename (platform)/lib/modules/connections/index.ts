/**
 * Connections Module
 *
 * Manages user connections to third-party services (Google, social media, etc.)
 * for AI capabilities and automation features.
 */

// Schemas
export {
  ConnectionProviderEnum,
  ConnectionStatusEnum,
  UserConnectionSchema,
  CreateConnectionSchema,
  UpdateConnectionSchema,
  OAuthCallbackSchema,
  ProviderConfigSchema,
  ConnectionCapabilities,
  type ConnectionProvider,
  type ConnectionStatus,
  type UserConnection,
  type CreateConnectionInput,
  type UpdateConnectionInput,
  type OAuthCallbackData,
  type ProviderConfig,
} from './schemas';

// Queries
export {
  getUserConnections,
  getConnectionByProvider,
  isProviderConnected,
  getConnectionStats,
  getExpiredConnections,
  getProvidersWithStatus,
} from './queries';

// Actions
export {
  upsertConnection,
  updateConnection,
  disconnectConnection,
  deleteConnection,
  refreshConnectionToken,
  testConnection,
  syncConnection,
} from './actions';
