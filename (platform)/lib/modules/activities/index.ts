/**
 * Activities Module
 *
 * Public API for activity management and recent activity feeds
 *
 * @module activities
 */

// Check if mock mode is enabled
import { dataConfig } from '@/lib/data/config';

// Queries - Use mock data if enabled
export const getRecentActivities = dataConfig.useMocks
  ? async (options?: any) => (await import('@/lib/data/providers/activities-provider')).getRecentActivities(options)
  : async (options?: any) => (await import('./queries')).getRecentActivities(options);

export const getActivitiesByEntity = dataConfig.useMocks
  ? async () => []
  : async (entityType: string, entityId: string, limit?: number) => (await import('./queries')).getActivitiesByEntity(entityType, entityId, limit);

export type { GetRecentActivitiesOptions } from './queries';

// Prisma types
export type { activities } from '@prisma/client';
