/**
 * Expense & Tax Module - Public API
 *
 * Consolidated expense tracking and tax management module
 *
 * Features (Planned for Session 3 - Phase 2):
 * - Expense tracking and categorization
 * - Tax deduction management
 * - Receipt upload and storage
 * - Mileage tracking
 * - Tax reports and summaries
 * - Quarterly tax estimates
 * - Transaction integration
 *
 * TODO:
 * - Implement actions, queries, and schemas
 * - Add expense categories
 * - Integrate with transaction module
 * - Build reporting functionality
 */

// Actions
export * from './actions';

// Queries
export * from './queries';

// Schemas
export * from './schemas';

// Types will be added when Prisma models are created
// export type { expenses, tax_records } from '@prisma/client';
