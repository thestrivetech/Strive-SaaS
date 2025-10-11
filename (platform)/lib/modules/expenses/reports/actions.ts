'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { SimpleTaxReportInput } from './schemas';

export async function createExpenseReport(input: SimpleTaxReportInput) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  const validated = input;

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
        user: {
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
        createdBy: e.user.name || e.user.email,
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
    const report = await prisma.tax_reports.create({
      data: {
        name: validated.name,
        template_type: validated.reportType,
        tax_year: new Date(validated.startDate).getFullYear(),
        period_start: validated.startDate,
        period_end: validated.endDate,
        total_expenses: totalExpenses,
        status: 'COMPLETED',
        organization_id: user.organizationId,
        user_id: user.id,
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
    const existing = await prisma.tax_reports.findUnique({
      where: { id },
      select: { organization_id: true }
    });

    if (!existing || existing.organization_id !== user.organizationId) {
      throw new Error('Report not found');
    }

    await prisma.tax_reports.delete({
      where: { id }
    });

    revalidatePath('/real-estate/expense-tax/reports');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete report:', error);
    throw new Error('Failed to delete report');
  }
}
