'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { ExpenseReportSchema } from './schemas';
import type { ExpenseReportInput } from './schemas';

/**
 * Expense Report Actions
 *
 * Server actions for generating and managing expense reports
 *
 * Features:
 * - Generate expense reports with filters
 * - Calculate report summaries
 * - Delete reports
 *
 * SECURITY:
 * - Authentication required
 * - Multi-tenancy enforced
 * - Input validation with Zod
 */

/**
 * Create a new expense report
 */
export async function createExpenseReport(input: ExpenseReportInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = ExpenseReportSchema.parse(input);

  try {
    // Build where clause for expense filtering
    const where: any = {
      organization_id: organizationId,
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

    // Fetch expenses based on filters
    const expenses = await prisma.expenses.findMany({
      where,
      include: {
        listing: {
          select: { id: true, address: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate totals
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );
    const totalDeductible = expenses
      .filter((e) => e.is_deductible)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Create report data structure
    const reportData = {
      expenses: expenses.map((e) => ({
        id: e.id,
        date: e.date,
        merchant: e.merchant,
        category: e.category,
        amount: Number(e.amount),
        isDeductible: e.is_deductible,
        listingAddress: e.listing?.address,
        createdBy: e.creator.name,
      })),
      summary: {
        totalExpenses,
        totalDeductible,
        count: expenses.length,
        deductibleCount: expenses.filter((e) => e.is_deductible).length,
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
        organization_id: organizationId,
        created_by_id: user.id,
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, report };
  } catch (error) {
    console.error('Failed to create expense report:', error);
    throw new Error('Failed to create expense report');
  }
}

/**
 * Delete an expense report
 */
export async function deleteExpenseReport(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  try {
    // Verify ownership
    const existing = await prisma.expense_reports.findUnique({
      where: { id },
      select: { organization_id: true },
    });

    if (!existing || existing.organization_id !== organizationId) {
      throw new Error('Report not found');
    }

    await prisma.expense_reports.delete({
      where: { id },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete report:', error);
    throw new Error('Failed to delete report');
  }
}
