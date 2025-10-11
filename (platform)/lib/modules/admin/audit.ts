'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { canViewAuditLogs } from '@/lib/auth/rbac';
import type { AdminAction } from '@prisma/client';

interface LogAdminActionInput {
  action: AdminAction;
  description: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  success?: boolean;
  error?: string;
}

/**
 * Log an admin action for audit trail
 */
export async function logAdminAction(input: LogAdminActionInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  // Get client info (if available)
  const ipAddress = getClientIP();
  const userAgent = getUserAgent();

  return await prisma.admin_action_logs.create({
    data: {
      action: input.action,
      description: input.description,
      target_type: input.targetType,
      target_id: input.targetId,
      metadata: input.metadata,
      success: input.success ?? true,
      error: input.error,
      ip_address: ipAddress,
      user_agent: userAgent,
      admin_id: user.id,
    },
  });
}

/**
 * Get admin action logs with filtering
 */
export async function getAdminActionLogs(filters?: {
  action?: AdminAction;
  adminId?: string;
  targetType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const user = await getCurrentUser();

  if (!user || !canViewAuditLogs(user.role)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};

  if (filters?.action) where.action = filters.action;
  if (filters?.adminId) where.admin_id = filters.adminId;
  if (filters?.targetType) where.target_type = filters.targetType;
  if (filters?.startDate || filters?.endDate) {
    where.created_at = {};
    if (filters.startDate) where.created_at.gte = filters.startDate;
    if (filters.endDate) where.created_at.lte = filters.endDate;
  }

  const logs = await prisma.admin_action_logs.findMany({
    where,
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
    take: filters?.limit || 100,
  });

  // Transform to match expected format
  return logs.map(log => ({
    id: log.id,
    action: log.action,
    description: log.description,
    details: log.description,
    resource_type: log.target_type,
    resource_id: log.target_id,
    user_id: log.admin_id,
    user_name: log.admin?.name || 'Unknown',
    user_email: log.admin?.email || '',
    severity: getSeverityFromAction(log.action),
    ip_address: log.ip_address || 'Unknown',
    user_agent: log.user_agent,
    timestamp: log.created_at.toISOString(),
    success: log.success,
    error: log.error,
    metadata: log.metadata,
  }));
}

/**
 * Get recent audit logs (simplified for dashboard)
 */
export async function getRecentAuditLogs(limit: number = 5) {
  const user = await getCurrentUser();

  if (!user || !canViewAuditLogs(user.role)) {
    throw new Error('Unauthorized');
  }

  return await getAdminActionLogs({ limit });
}

// Helper functions (implement based on platform)
function getClientIP(): string | null {
  // TODO: Implement IP extraction from request headers
  // This will require accessing headers from the request context
  return null;
}

function getUserAgent(): string | null {
  // TODO: Implement UA extraction from request headers
  // This will require accessing headers from the request context
  return null;
}

/**
 * Map admin action to severity level
 */
function getSeverityFromAction(action: AdminAction): string {
  // Map actions to severity levels for audit display
  const severityMap: Record<AdminAction, string> = {
    CREATE_USER: 'INFO',
    UPDATE_USER: 'INFO',
    DELETE_USER: 'WARNING',
    SUSPEND_USER: 'WARNING',
    REACTIVATE_USER: 'INFO',
    CREATE_ORG: 'INFO',
    UPDATE_ORG: 'INFO',
    DELETE_ORG: 'CRITICAL',
    UPDATE_SUBSCRIPTION: 'INFO',
    CANCEL_SUBSCRIPTION: 'WARNING',
    CREATE_FEATURE_FLAG: 'INFO',
    UPDATE_FEATURE_FLAG: 'WARNING',
    DELETE_FEATURE_FLAG: 'WARNING',
    CREATE_ALERT: 'WARNING',
    UPDATE_ALERT: 'WARNING',
    DELETE_ALERT: 'INFO',
    IMPERSONATE_USER: 'CRITICAL',
    EXPORT_DATA: 'WARNING',
    MODIFY_PERMISSIONS: 'CRITICAL',
    SYSTEM_CONFIG_CHANGE: 'CRITICAL',
  };

  return severityMap[action] || 'INFO';
}
