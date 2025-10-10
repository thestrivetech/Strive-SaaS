/**
 * Contact Actions Wrapper
 *
 * This file wraps server actions from lib/modules/crm/contacts for use in client components.
 * Next.js 15 requires that client components cannot directly import files with 'use server' or 'server-only' directives.
 *
 * Pattern: Client components import from this file, which re-exports server actions.
 * Note: This file does NOT have 'use server' - it simply re-exports from files that do.
 */

import {
  createContact as createContactAction,
  updateContact as updateContactAction,
  deleteContact as deleteContactAction,
  logCommunication as logCommunicationAction,
  updateContactStatus as updateContactStatusAction,
  bulkAssignContacts as bulkAssignContactsAction,
} from '@/lib/modules/crm/contacts/actions';

// Re-export server actions with same names
export const createContact = createContactAction;
export const updateContact = updateContactAction;
export const deleteContact = deleteContactAction;
export const logCommunication = logCommunicationAction;
export const updateContactStatus = updateContactStatusAction;
export const bulkAssignContacts = bulkAssignContactsAction;

// Re-export Prisma enums
export { ContactType, ContactStatus } from '@prisma/client';

// Re-export query types
export type { ContactWithAssignee, ContactWithRelations } from '@/lib/modules/crm/contacts/queries';
