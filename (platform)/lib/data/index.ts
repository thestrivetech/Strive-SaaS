/**
 * Data Layer - Central Export
 *
 * Import all data providers from here
 *
 * @example
 * ```typescript
 * import { contactsProvider } from '@/lib/data';
 *
 * const contacts = await contactsProvider.findMany(orgId);
 * ```
 */

export { dataConfig, simulateDelay, maybeThrowError } from './config';

// CRM Providers
export { contactsProvider, leadsProvider, customersProvider } from './providers/crm-provider';

// CMS & Marketing Providers
export { contentProvider } from './providers/content-provider';
export { campaignsProvider } from './providers/campaigns-provider';

// Marketplace Providers
export {
  toolsProvider,
  bundlesProvider,
  purchasesProvider,
  reviewsProvider,
  cartProvider,
} from './providers/marketplace-provider';

// Analytics Providers
export { getOverviewKPIs, getSalesFunnelData, getAgentPerformance } from './providers/analytics-provider';

// Appointments Providers
export { getUpcomingAppointments } from './providers/appointments-provider';

// Activities Providers
export { getRecentActivities } from './providers/activities-provider';

// Mock types (for TypeScript)
export type { MockContact, MockLead, MockCustomer } from './mocks/crm';
export type { MockContentItem, MockCampaign, MockEmailCampaign } from './mocks/content';
export type {
  MockTool,
  MockBundle,
  MockPurchase,
  MockReview,
  MockCart,
} from './mocks/marketplace';
