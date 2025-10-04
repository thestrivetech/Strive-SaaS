/**
 * Activities Module
 *
 * Public API for activity management and recent activity feeds
 *
 * @module activities
 */

// Queries
export {
  getRecentActivities,
  getActivitiesByEntity,
  type GetRecentActivitiesOptions,
} from './queries';

// Prisma types
export type { activities } from '@prisma/client';
