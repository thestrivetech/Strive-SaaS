/**
 * Marketplace Module - Public API
 *
 * Tool & Dashboard Marketplace for installing additional functionality
 * Supports FREE (pre-installed) and CUSTOM (pay-per-use) tiers
 *
 * Features (planned):
 * - Browse available tools and dashboards
 * - Install/uninstall tools
 * - Configure tool settings
 * - Usage analytics
 * - Tool recommendations
 */

// Actions
export * from './actions';

// Queries
export * from './queries';

// Schemas
export * from './schemas';

// Types
export type { Tool, InstallToolInput } from './schemas';
