'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';

/**
 * Tax Report Stats
 * Aggregated statistics for hero section
 */
export interface TaxReportStats {
  totalReports: number;
  currentYearReports: number;
  completedReports: number;
  sharedReports: number;
}

/**
 * Tax Report Filters
 */
export interface TaxReportFilters {
  taxYear?: number;
  status?: 'GENERATING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  templateType?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get aggregated tax report statistics
 * Used for hero section stats display
 */
export async function getTaxReportStats(): Promise<TaxReportStats> {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense & Tax module access required');
  }

  const currentYear = new Date().getFullYear();

  // Run all counts in parallel for performance
  const [totalReports, currentYearReports, completedReports, sharedReports] = await Promise.all([
    prisma.tax_reports.count({
      where: { organization_id: user.organizationId }
    }),
    prisma.tax_reports.count({
      where: {
        organization_id: user.organizationId,
        tax_year: currentYear
      }
    }),
    prisma.tax_reports.count({
      where: {
        organization_id: user.organizationId,
        status: 'COMPLETED'
      }
    }),
    prisma.tax_reports.count({
      where: {
        organization_id: user.organizationId,
        is_shared: true
      }
    })
  ]);

  return {
    totalReports,
    currentYearReports,
    completedReports,
    sharedReports
  };
}

/**
 * Get all tax reports for the current organization
 * Filters by organization_id for multi-tenancy
 */
export async function getTaxReports(filters?: TaxReportFilters) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense & Tax module access required');
  }

  const whereClause: any = {
    organization_id: user.organizationId,
  };

  if (filters?.taxYear) whereClause.tax_year = filters.taxYear;
  if (filters?.status) whereClause.status = filters.status;
  if (filters?.templateType) whereClause.template_type = filters.templateType;
  if (filters?.startDate) {
    whereClause.created_at = { ...whereClause.created_at, gte: filters.startDate };
  }
  if (filters?.endDate) {
    whereClause.created_at = { ...whereClause.created_at, lte: filters.endDate };
  }

  return await prisma.tax_reports.findMany({
    where: whereClause,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

/**
 * Get a single tax report by ID
 * Enforces organization ownership
 */
export async function getTaxReportById(id: string) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense & Tax module access required');
  }

  const report = await prisma.tax_reports.findFirst({
    where: {
      id,
      organization_id: user.organizationId
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!report) {
    throw new Error('Tax report not found');
  }

  return report;
}

/**
 * Get recent tax reports (for dashboard/recent section)
 * Limited to 10 most recent
 */
export async function getRecentTaxReports(limit: number = 10) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense & Tax module access required');
  }

  return await prisma.tax_reports.findMany({
    where: {
      organization_id: user.organizationId
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { created_at: 'desc' },
    take: limit
  });
}
