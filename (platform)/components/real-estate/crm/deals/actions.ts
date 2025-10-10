/**
 * Deal Actions Wrapper
 *
 * This file wraps server actions from lib/modules/crm/deals for use in client components.
 * Next.js 15 requires that client components cannot directly import files with 'use server' or 'server-only' directives.
 *
 * Pattern: Client components import from this file, which re-exports server actions.
 * Note: This file does NOT have 'use server' - it simply re-exports from files that do.
 */

import {
  createDeal as createDealAction,
  updateDeal as updateDealAction,
  deleteDeal as deleteDealAction,
  updateDealStage as updateDealStageAction,
  closeDeal as closeDealAction,
  bulkUpdateDeals as bulkUpdateDealsAction,
} from '@/lib/modules/crm/deals/actions';

// Re-export server actions with same names
export const createDeal = createDealAction;
export const updateDeal = updateDealAction;
export const deleteDeal = deleteDealAction;
export const updateDealStage = updateDealStageAction;
export const closeDeal = closeDealAction;
export const bulkUpdateDeals = bulkUpdateDealsAction;

// Re-export pipeline constants and types (from client-safe constants file)
export { PIPELINE_STAGES, type StageConfig } from '@/lib/modules/crm/deals/constants';
