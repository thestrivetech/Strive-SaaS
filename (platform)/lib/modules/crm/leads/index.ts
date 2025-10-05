// Export public API
export {
  createLead,
  updateLead,
  deleteLead,
  updateLeadScore,
  updateLeadStatus,
  bulkAssignLeads,
  convertLead,
} from './actions';

export {
  getLeads,
  getLeadsCount,
  getLeadById,
  getLeadStats,
  searchLeads,
  getLeadsByAssignee,
} from './queries';

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
} from './schemas';

// Re-export Prisma types
export type { leads as Lead } from '@prisma/client';
