'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';

export async function getTaxEstimates(year?: number, quarter?: number) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const where: any = {
    organization_id: user.organizationId,
  };

  if (year) {
    where.year = year;
  }

  if (quarter) {
    where.quarter = quarter;
  }

  const taxEstimates = await prisma.tax_estimates.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: [
      { year: 'desc' },
      { quarter: 'desc' },
    ],
  });

  return taxEstimates;
}

export async function getTaxEstimateById(id: string) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const taxEstimate = await prisma.tax_estimates.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  if (!taxEstimate || taxEstimate.organization_id !== user.organizationId) {
    throw new Error('Tax estimate not found');
  }

  return taxEstimate;
}
