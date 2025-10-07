import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { Prisma } from '@prisma/client';
import type { ActivityFeedParams, Activity } from './types';

/**
 * Transaction Activity Queries Module
 *
 * Fetches transaction audit logs for activity feeds
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 *
 * @module transaction-activity/queries
 */

type AuditLogWithUser = Prisma.transaction_audit_logsGetPayload<{
  include: {
    user: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
  };
}>;

// Re-export types for convenience
export type { ActivityFeedParams, Activity };

/**
 * Get activity feed for transaction loops
 *
 * @param params - Filter and pagination options
 * @returns Array of activity items
 */
export async function getActivityFeed(
  params: ActivityFeedParams = {}
): Promise<Activity[]> {
  return withTenantContext(async () => {
    try {
      const { loopId, limit = 50, offset = 0 } = params;

      // Get current user for organizationId
      const { getCurrentUser } = await import('@/lib/auth/auth-helpers');
      const currentUser = await getCurrentUser();

      if (!currentUser?.organization_members?.[0]?.organization_id) {
        throw new Error('User organization not found');
      }

      const organizationId = currentUser.organization_members[0].organization_id;

      // Base where clause - MUST include organizationId for security
      const where: Prisma.transaction_audit_logsWhereInput = {
        organization_id: organizationId,
      };

      if (loopId) {
        // CRITICAL: Verify loop ownership before fetching related activities
        const loop = await prisma.transaction_loops.findFirst({
          where: {
            id: loopId,
            organization_id: organizationId,
          },
        });

        if (!loop) {
          throw new Error('Loop not found or access denied');
        }

        // Get related entity IDs (security enforced by loop ownership verification above)
        const [documentIds, partyIds, taskIds, signatureIds] = await Promise.all([
          getDocumentIdsByLoop(loopId),
          getPartyIdsByLoop(loopId),
          getTaskIdsByLoop(loopId),
          getSignatureIdsByLoop(loopId),
        ]);

        where.OR = [
          { entity_type: 'loop', entity_id: loopId },
          { entity_type: 'document', entity_id: { in: documentIds } },
          { entity_type: 'party', entity_id: { in: partyIds } },
          { entity_type: 'task', entity_id: { in: taskIds } },
          { entity_type: 'signature', entity_id: { in: signatureIds } },
        ];
      }

      const activities = await prisma.transaction_audit_logs.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      });

      return activities.map(formatActivity);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Get activity for a specific loop
 *
 * @param loopId - Transaction loop ID
 * @param limit - Maximum number of activities to return
 * @returns Array of activity items for the loop
 */
export async function getLoopActivity(
  loopId: string,
  limit: number = 50
): Promise<Activity[]> {
  return getActivityFeed({ loopId, limit });
}

/**
 * Get recent organization-wide activity
 *
 * @param limit - Maximum number of activities to return
 * @returns Array of recent activity items
 */
export async function getRecentActivity(limit: number = 20): Promise<Activity[]> {
  return getActivityFeed({ limit });
}

/**
 * Get activity by entity type
 *
 * @param entityType - Type of entity (loop, document, party, task, signature)
 * @param entityId - Entity ID
 * @param limit - Maximum number of activities to return
 * @returns Array of activity items for the entity
 */
export async function getActivityByEntity(
  entityType: string,
  entityId: string,
  limit: number = 50
): Promise<Activity[]> {
  return withTenantContext(async () => {
    try {
      // Get current user for organizationId
      const { getCurrentUser } = await import('@/lib/auth/auth-helpers');
      const currentUser = await getCurrentUser();

      if (!currentUser?.organization_members?.[0]?.organization_id) {
        throw new Error('User organization not found');
      }

      const organizationId = currentUser.organization_members[0].organization_id;

      const activities = await prisma.transaction_audit_logs.findMany({
        where: {
          entity_type: entityType,
          entity_id: entityId,
          organization_id: organizationId, // Explicit org filter for security
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return activities.map(formatActivity);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Get activity count for a loop
 *
 * @param loopId - Transaction loop ID
 * @returns Total activity count
 */
export async function getLoopActivityCount(loopId: string): Promise<number> {
  return withTenantContext(async () => {
    try {
      // Get current user for organizationId
      const { getCurrentUser } = await import('@/lib/auth/auth-helpers');
      const currentUser = await getCurrentUser();

      if (!currentUser?.organization_members?.[0]?.organization_id) {
        throw new Error('User organization not found');
      }

      const organizationId = currentUser.organization_members[0].organization_id;

      // Verify loop ownership first
      const loop = await prisma.transaction_loops.findFirst({
        where: {
          id: loopId,
          organization_id: organizationId,
        },
      });

      if (!loop) {
        throw new Error('Loop not found or access denied');
      }

      const [documentIds, partyIds, taskIds, signatureIds] = await Promise.all([
        getDocumentIdsByLoop(loopId),
        getPartyIdsByLoop(loopId),
        getTaskIdsByLoop(loopId),
        getSignatureIdsByLoop(loopId),
      ]);

      return await prisma.transaction_audit_logs.count({
        where: {
          organization_id: organizationId, // Explicit org filter for security
          OR: [
            { entity_type: 'loop', entity_id: loopId },
            { entity_type: 'document', entity_id: { in: documentIds } },
            { entity_type: 'party', entity_id: { in: partyIds } },
            { entity_type: 'task', entity_id: { in: taskIds } },
            { entity_type: 'signature', entity_id: { in: signatureIds } },
          ],
        },
      });
    } catch (error) {
      throw handleDatabaseError(error);
    }
  });
}

/**
 * Format audit log to activity object
 *
 * @param log - Raw audit log with user relation
 * @returns Formatted activity object
 */
function formatActivity(log: AuditLogWithUser): Activity {
  return {
    id: log.id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    user: log.user,
    timestamp: log.timestamp,
    description: '', // Will be formatted by formatters module
    oldValues: log.old_values as Record<string, unknown> | undefined,
    newValues: log.new_values as Record<string, unknown> | undefined,
  };
}

/**
 * Helper: Get document IDs for a loop
 *
 * SECURITY: Loop ownership is verified before calling this function (in getActivityFeed)
 * These tables don't have organization_id - they inherit security through loop_id relationship
 */
async function getDocumentIdsByLoop(loopId: string): Promise<string[]> {
  const documents = await prisma.documents.findMany({
    where: {
      loop_id: loopId,
    },
    select: { id: true },
  });
  return documents.map(d => d.id);
}

/**
 * Helper: Get party IDs for a loop
 *
 * SECURITY: Loop ownership is verified before calling this function (in getActivityFeed)
 * These tables don't have organization_id - they inherit security through loop_id relationship
 */
async function getPartyIdsByLoop(loopId: string): Promise<string[]> {
  const parties = await prisma.loop_parties.findMany({
    where: {
      loop_id: loopId,
    },
    select: { id: true },
  });
  return parties.map(p => p.id);
}

/**
 * Helper: Get task IDs for a loop
 *
 * SECURITY: Loop ownership is verified before calling this function (in getActivityFeed)
 * These tables don't have organization_id - they inherit security through loop_id relationship
 */
async function getTaskIdsByLoop(loopId: string): Promise<string[]> {
  const tasks = await prisma.transaction_tasks.findMany({
    where: {
      loop_id: loopId,
    },
    select: { id: true },
  });
  return tasks.map(t => t.id);
}

/**
 * Helper: Get signature request IDs for a loop
 *
 * SECURITY: Loop ownership is verified before calling this function (in getActivityFeed)
 * These tables don't have organization_id - they inherit security through loop_id relationship
 */
async function getSignatureIdsByLoop(loopId: string): Promise<string[]> {
  const signatures = await prisma.signature_requests.findMany({
    where: {
      loop_id: loopId,
    },
    select: { id: true },
  });
  return signatures.map(s => s.id);
}
