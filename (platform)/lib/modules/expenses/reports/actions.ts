'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { ExpenseReportSchema } from './schemas';
import type { ExpenseReportInput } from './schemas';

export async function createExpenseReport(input: ExpenseReportInput) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const validated = ExpenseReportSchema.parse(input);

  try {
    // Build where clause for expense filtering
    const where: any = {
      organization_id: user.organizationId,
      date: {
        gte: validated.startDate,
        lte: validated.endDate,
      },
    };

    if (validated.categories.length > 0) {
      where.category = { in: validated.categories };
    }

    if (validated.listings.length > 0) {
      where.listing_id = { in: validated.listings };
    }

    if (validated.merchants.length > 0) {
      where.merchant = { in: validated.merchants };
    }

    // Fetch expenses with related data
    const expenses = await prisma.expenses.findMany({
      where,
      include: {
        listing: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const totalDeductible = expenses
      .filter((e: any) => e.is_deductible)
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    // Create report data structure
    const reportData = {
      expenses: expenses.map((e: any) => ({
        id: e.id,
        date: e.date,
        merchant: e.merchant,
        category: e.category,
        amount: Number(e.amount),
        isDeductible: e.is_deductible,
        listingAddress: e.listing?.address || null,
        createdBy: e.creator.name || e.creator.email,
      })),
      summary: {
        totalExpenses,
        totalDeductible,
        count: expenses.length,
        deductibleCount: expenses.filter((e: any) => e.is_deductible).length,
      },
      filters: {
        startDate: validated.startDate,
        endDate: validated.endDate,
        categories: validated.categories,
        listings: validated.listings,
        merchants: validated.merchants,
      },
    };

    // Create report record
    const report = await prisma.expense_reports.create({
      data: {
        name: validated.name,
        report_type: validated.reportType,
        start_date: validated.startDate,
        end_date: validated.endDate,
        categories: validated.categories,
        listings: validated.listings,
        merchants: validated.merchants,
        report_data: reportData,
        total_expenses: totalExpenses,
        total_deductible: totalDeductible,
        organization_id: user.organizationId,
        created_by_id: user.id,
      }
    });

    revalidatePath('/real-estate/expense-tax/reports');
    return { success: true, report };
  } catch (error) {
    console.error('Failed to create expense report:', error);
    throw new Error('Failed to create expense report');
  }
}

export async function deleteExpenseReport(id: string) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    const existing = await prisma.expense_reports.findUnique({
      where: { id },
      select: { organization_id: true }
    });

    if (!existing || existing.organization_id !== user.organizationId) {
      throw new Error('Report not found');
    }

    await prisma.expense_reports.delete({
      where: { id }
    });

    revalidatePath('/real-estate/expense-tax/reports');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete report:', error);
    throw new Error('Failed to delete report');
  }
}
