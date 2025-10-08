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

// Mock types (for TypeScript)
export type { MockContact, MockLead, MockCustomer } from './mocks/crm';
