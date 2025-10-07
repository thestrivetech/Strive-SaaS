/**
 * Lead Actions Wrapper
 *
 * This file wraps server actions from lib/modules/crm/leads for use in client components.
 * Next.js 15 requires that client components cannot directly import files with 'use server' or 'server-only' directives.
 *
 * Pattern: Client components import from this file, which re-exports server actions.
 * Note: This file does NOT have 'use server' - it simply re-exports from files that do.
 */

import {
  createLead as createLeadAction,
  updateLead as updateLeadAction,
  deleteLead as deleteLeadAction,
  convertLead as convertLeadAction,
  updateLeadScore as updateLeadScoreAction,
  updateLeadStatus as updateLeadStatusAction,
  bulkAssignLeads as bulkAssignLeadsAction,
} from '@/lib/modules/crm/leads/actions';

// Re-export server actions with same names
export const createLead = createLeadAction;
export const updateLead = updateLeadAction;
export const deleteLead = deleteLeadAction;
export const convertLead = convertLeadAction;
export const updateLeadScore = updateLeadScoreAction;
export const updateLeadStatus = updateLeadStatusAction;
export const bulkAssignLeads = bulkAssignLeadsAction;

// Re-export schemas and types that components need
export {
  createLeadSchema,
  updateLeadSchema,
  leadFiltersSchema,
  updateLeadScoreSchema,
  updateLeadStatusSchema,
  bulkAssignLeadsSchema,
  type CreateLeadInput,
  type UpdateLeadInput,
  type LeadFilters,
  type UpdateLeadScoreInput,
  type UpdateLeadStatusInput,
  type BulkAssignLeadsInput,
} from '@/lib/modules/crm/leads/schemas';

// Note: LeadWithAssignee is not exported from lib/modules/crm/leads
// Components that need it define it locally as: leads & { assigned_to: { ... } }
