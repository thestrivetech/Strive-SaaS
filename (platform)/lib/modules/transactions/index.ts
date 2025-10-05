/**
 * Transactions Module - Public API
 *
 * Consolidated transactions module containing:
 * - Core transaction loop management
 * - Task management
 * - Activity tracking
 * - Transaction analytics
 * - Listings (real estate specific)
 * - Parties management
 * - Document management
 * - E-signature workflow
 * - Workflow automation
 * - Milestone tracking
 */

// Core
export * from './core';

// Tasks
export * from './tasks/actions';
export * from './tasks/queries';
export * from './tasks/schemas';

// Activity
export * from './activity/formatters';
export * from './activity/queries';

// Analytics
export * from './analytics/charts';
export { type TaskStats as AnalyticsTaskStats } from './analytics/queries';

// Listings
export * from './listings/actions';
export * from './listings/queries';
export * from './listings/schemas';

// Parties
export * from './parties/actions';
export * from './parties/queries';

// Documents
export * from './documents/actions';
export * from './documents/queries';

// Signatures
export * from './signatures/actions';
export * from './signatures/queries';

// Workflows
export * from './workflows/actions';
export * from './workflows/queries';

// Milestones
export * from './milestones/calculator';
export * from './milestones/schemas';

// Types
export type {
  transaction_loops,
  transaction_tasks,
  transaction_audit_logs
} from '@prisma/client';
