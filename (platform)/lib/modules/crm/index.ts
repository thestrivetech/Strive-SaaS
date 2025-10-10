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

// Leads
export * from './leads/actions';
export * from './leads/queries';

// Deals
export * from './deals/actions';
export * from './deals/queries';

// Core CRM
export * from './core/actions';
export * from './core/queries';

// Types
export type { contacts, leads, deals } from '@prisma/client';
