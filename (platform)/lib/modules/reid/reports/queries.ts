'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessREID } from '@/lib/auth/rbac';

/**
 * Get all market reports for the current organization
 * Filters by organization_id for multi-tenancy
 */
export async function getMarketReports(filters?: ReportFilters) {
  const user = await requireAuth();

  if (!canAccessREID(user)) {
    throw new Error('Unauthorized: REID access required');
  }

  const validatedFilters = filters ? ReportFiltersSchema.parse(filters) : {};

  return await prisma.market_reports.findMany({
    where: {
      organization_id: user.organizationId,
      ...(validatedFilters.reportType && {
        report_type: validatedFilters.reportType
      }),
      ...(validatedFilters.isPublic !== undefined && {
        is_public: validatedFilters.isPublic
      }),
      ...(validatedFilters.startDate && {
        created_at: { gte: validatedFilters.startDate }
      }),
      ...(validatedFilters.endDate && {
        created_at: { lte: validatedFilters.endDate }
      }),
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

/**
 * Get a single market report by ID
 * Enforces organization ownership
 */
export async function getMarketReportById(id: string) {
  const user = await requireAuth();

  const report = await prisma.market_reports.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!report) {
    throw new Error('Report not found');
  }

  return report;
}

/**
 * Get a public report by share token
 * No authentication required - for public sharing
 */
export async function getPublicReport(shareToken: string) {
  const report = await prisma.market_reports.findFirst({
    where: {
      share_token: shareToken,
      is_public: true
    },
    include: {
      creator: {
        select: { name: true }
      }
    }
  });

  if (!report) {
    throw new Error('Public report not found');
  }

  return report;
}
