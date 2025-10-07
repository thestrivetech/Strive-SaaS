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

  return await prisma.admin_action_logs.findMany({
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
