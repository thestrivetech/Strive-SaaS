'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';

export async function getExpenseReports() {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const reports = await prisma.expense_reports.findMany({
    where: {
      organization_id: user.organizationId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: { created_at: 'desc' },
  });

  return reports;
}

export async function getExpenseReportById(id: string) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const report = await prisma.expense_reports.findUnique({
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

  if (!report || report.organization_id !== user.organizationId) {
    throw new Error('Report not found');
  }

  return report;
}
