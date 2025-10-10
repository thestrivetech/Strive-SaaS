/**
 * Contacts Module
 *
 * Public API for managing contacts in the CRM system
 *
 * Multi-tenant: All operations filtered by organizationId
 * RBAC: Permission checks enforced in actions
 */

// Server Actions (mutations)
export {
  createContact,
  updateContact,
  deleteContact,
  logCommunication,
  updateContactStatus,
  bulkAssignContacts,
} from './actions';

// Queries (data fetching)
export {
  getContacts,
  getContactById,
  getContactWithFullHistory,
  getContactStats,
  getContactsCount,
} from './queries';

// Re-export Prisma types for convenience
export type { contacts } from '@prisma/client';
export { ContactType, ContactStatus } from '@prisma/client';
