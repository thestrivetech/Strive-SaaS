/**
 * Party Management Module
 *
 * Public API for managing transaction loop parties with:
 * - Party invitation with email notifications
 * - Role-based permissions (view, edit, sign, upload)
 * - RBAC enforcement
 * - Multi-tenancy via organization isolation
 * - Audit logging
 */

// Actions - Mutations
export {
  inviteParty,
  updateParty,
  removeParty,
} from './actions';

// Queries - Data fetching
export {
  getPartiesByLoop,
  getPartyById,
  getPartyStats,
  type PartyWithCounts,
  type PartyWithDetails,
  type PartyStats,
} from './queries';

// Schemas & Types
export {
  CreatePartySchema,
  UpdatePartySchema,
  QueryPartiesSchema,
  type CreatePartyInput,
  type UpdatePartyInput,
  type QueryPartiesInput,
} from './schemas';
