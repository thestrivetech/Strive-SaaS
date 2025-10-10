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
 *
 * ⚠️ CLIENT COMPONENT IMPORTS:
 * If you're in a 'use client' component, import from './actions' instead:
 *   import { createLoop } from '@/lib/modules/transactions/actions'
 *
 * This file exports queries which import Prisma (server-only).
 * Client components importing this will cause browser errors.
 */

// Core
export * from './core';

// Tasks
export * from './tasks/actions';
export * from './tasks/queries';

// Activity
export * from './activity/formatters';
export * from './activity/queries';

// Analytics
export * from './analytics/charts';
export { type TaskStats as AnalyticsTaskStats } from './analytics/queries';

// Listings
export * from './listings/actions';
export * from './listings/queries';

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

// Types
export type {
  transaction_loops,
  transaction_tasks,
  transaction_audit_logs
} from '@prisma/client';
