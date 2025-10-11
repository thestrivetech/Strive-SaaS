// Export public API - Actions
export {
  createLead,
  updateLead,
  deleteLead,
  updateLeadScore,
  updateLeadStatus,
  bulkAssignLeads,
  convertLead,
} from './actions';

// Export public API - Queries
export {
  getLeads,
  getLeadsCount,
  getLeadById,
  getLeadStats,
  searchLeads,
  getLeadsByAssignee,
} from './queries';

// Re-export Prisma types
export type { leads as Lead } from '@prisma/client';
