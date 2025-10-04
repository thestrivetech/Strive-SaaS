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
  type ContactWithAssignee,
  type ContactWithRelations,
} from './queries';

// Schemas and types
export {
  createContactSchema,
  updateContactSchema,
  contactFiltersSchema,
  logCommunicationSchema,
  updateContactStatusSchema,
  bulkAssignContactsSchema,
  importContactSchema,
  type CreateContactInput,
  type UpdateContactInput,
  type ContactFilters,
  type LogCommunicationInput,
  type UpdateContactStatusInput,
  type BulkAssignContactsInput,
  type ImportContactInput,
} from './schemas';

// Re-export Prisma types for convenience
export type { contacts } from '@prisma/client';
export { ContactType, ContactStatus } from '@prisma/client';
