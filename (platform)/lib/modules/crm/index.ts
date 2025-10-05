/**
 * CRM Module - Public API
 *
 * Consolidated CRM module containing:
 * - Contacts management
 * - Leads management
 * - Deals/pipeline management
 * - Calendar/appointments (future)
 * - CRM analytics (future)
 */

// Contacts
export * from './contacts/actions';
export * from './contacts/queries';
export * from './contacts/schemas';

// Leads
export * from './leads/actions';
export * from './leads/queries';
export * from './leads/schemas';

// Deals
export * from './deals/actions';
export * from './deals/queries';
export * from './deals/schemas';

// Core CRM
export * from './core/actions';
export * from './core/queries';
export * from './core/schemas';

// Types
export type { contacts, leads, deals } from '@prisma/client';
