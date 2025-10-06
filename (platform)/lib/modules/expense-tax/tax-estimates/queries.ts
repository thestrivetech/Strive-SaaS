'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';

/**
 * Tax Estimate Queries
 *
 * Data fetching functions for tax estimates
 *
 * Features:
 * - Get tax estimates by year/quarter
 * - Get all tax estimates for organization
 * - Multi-tenancy enforcement
 *
 * SECURITY:
 * - Authentication required
 * - Organization filtering on all queries
 */

/**
 * Get tax estimate by year and optional quarter
 */
export async function getTaxEstimate(year: number, quarter?: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const estimate = await prisma.tax_estimates.findFirst({
    where: {
      year,
      quarter: quarter || null,
      organization_id: organizationId,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return estimate;
}

/**
 * Get all tax estimates for organization
 */
export async function getAllTaxEstimates() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const estimates = await prisma.tax_estimates.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: [
      { year: 'desc' },
      { quarter: 'desc' },
    ],
  });

  return estimates;
}

/**
 * Get tax estimates for a specific year (all quarters)
 */
export async function getTaxEstimatesForYear(year: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const estimates = await prisma.tax_estimates.findMany({
    where: {
      year,
      organization_id: organizationId,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { quarter: 'asc' },
  });

  return estimates;
}
