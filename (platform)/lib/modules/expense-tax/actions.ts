'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { ExpenseSchema, UpdateExpenseSchema, TaxEstimateSchema, ExpenseReportSchema } from './schemas';
import type { ExpenseInput, UpdateExpenseInput, TaxEstimateInput, ExpenseReportInput } from './schemas';

/**
 * Expense & Tax Actions Module
 *
 * Server Actions for expense tracking and tax management with RBAC enforcement
 *
 * SECURITY:
 * - All actions require authentication
 * - Multi-tenancy enforced via organizationId
 * - Input validation with Zod schemas
 * - RBAC checks for permissions
 *
 * Features:
 * - Expense CRUD operations
 * - Tax calculations
 * - Expense review workflow
 * - Receipt management
 * - Report generation
 */

/**
 * Create a new expense
 */
export async function createExpense(input: ExpenseInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  // Validate input
  const validated = ExpenseSchema.parse(input);

  try {
    const expense = await prisma.expenses.create({
      data: {
        date: validated.date,
        merchant: validated.merchant,
        category: validated.category,
        amount: validated.amount,
        listing_id: validated.listingId,
        notes: validated.notes,
        is_deductible: validated.isDeductible,
        tax_category: validated.taxCategory,
        organization_id: organizationId,
        created_by_id: user.id,
      },
      include: {
        listing: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'created_expense',
        resource_type: 'expense',
        resource_id: expense.id,
        new_data: {
          merchant: expense.merchant,
          category: expense.category,
          amount: expense.amount.toNumber(),
        },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, expense };
  } catch (error) {
    console.error('Failed to create expense:', error);
    throw new Error('Failed to create expense');
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(input: UpdateExpenseInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = UpdateExpenseSchema.parse(input);
  const { id, ...data } = validated;

  try {
    // Verify expense belongs to user's organization
    const existing = await prisma.expenses.findUnique({
      where: { id },
      select: { organization_id: true },
    });

    if (!existing || existing.organization_id !== organizationId) {
      throw new Error('Expense not found');
    }

    const updateData: any = {};
    if (data.date) updateData.date = data.date;
    if (data.merchant) updateData.merchant = data.merchant;
    if (data.category) updateData.category = data.category;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.listingId !== undefined) updateData.listing_id = data.listingId;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.isDeductible !== undefined) updateData.is_deductible = data.isDeductible;
    if (data.taxCategory !== undefined) updateData.tax_category = data.taxCategory;

    const expense = await prisma.expenses.update({
      where: { id },
      data: updateData,
      include: {
        listing: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'updated_expense',
        resource_type: 'expense',
        resource_id: expense.id,
        new_data: updateData,
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, expense };
  } catch (error) {
    console.error('Failed to update expense:', error);
    throw new Error('Failed to update expense');
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  // Check if user can delete expenses (OWNER, ADMIN, MODERATOR)
  if (!['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions to delete expenses');
  }

  try {
    // Verify expense belongs to user's organization
    const existing = await prisma.expenses.findUnique({
      where: { id },
      select: { organization_id: true, merchant: true, amount: true },
    });

    if (!existing || existing.organization_id !== organizationId) {
      throw new Error('Expense not found');
    }

    await prisma.expenses.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'deleted_expense',
        resource_type: 'expense',
        resource_id: id,
        old_data: {
          merchant: existing.merchant,
          amount: existing.amount.toNumber(),
        },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw new Error('Failed to delete expense');
  }
}

/**
 * Review an expense (approve or reject)
 */
export async function reviewExpense(id: string, status: 'APPROVED' | 'REJECTED') {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  // Only OWNER and ADMIN can review expenses
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Cannot review expenses');
  }

  try {
    const expense = await prisma.expenses.update({
      where: {
        id,
        organization_id: organizationId,
      },
      data: {
        status,
        reviewed_at: new Date(),
        reviewed_by_id: user.id,
      },
      include: {
        listing: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        reviewer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'reviewed_expense',
        resource_type: 'expense',
        resource_id: expense.id,
        new_data: { status, reviewedBy: user.id },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, expense };
  } catch (error) {
    console.error('Failed to review expense:', error);
    throw new Error('Failed to review expense');
  }
}

/**
 * Create or update tax estimate
 */
export async function upsertTaxEstimate(input: TaxEstimateInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = TaxEstimateSchema.parse(input);

  try {
    // Check if estimate already exists
    const existing = await prisma.tax_estimates.findFirst({
      where: {
        year: validated.year,
        quarter: validated.quarter || null,
        organization_id: organizationId,
      },
    });

    let estimate;
    if (existing) {
      // Update existing estimate
      estimate = await prisma.tax_estimates.update({
        where: { id: existing.id },
        data: {
          total_income: validated.totalIncome,
          business_income: validated.businessIncome,
          other_income: validated.otherIncome,
          total_deductions: validated.totalDeductions,
          business_deductions: validated.businessDeductions,
          standard_deduction: validated.standardDeduction,
          taxable_income: validated.taxableIncome,
          estimated_tax: validated.estimatedTax,
          tax_rate: validated.taxRate,
          paid_amount: validated.paidAmount,
          due_date: validated.dueDate,
          is_paid: validated.isPaid,
        },
      });
    } else {
      // Create new estimate
      estimate = await prisma.tax_estimates.create({
        data: {
          year: validated.year,
          quarter: validated.quarter || null,
          total_income: validated.totalIncome,
          business_income: validated.businessIncome,
          other_income: validated.otherIncome,
          total_deductions: validated.totalDeductions,
          business_deductions: validated.businessDeductions,
          standard_deduction: validated.standardDeduction,
          taxable_income: validated.taxableIncome,
          estimated_tax: validated.estimatedTax,
          tax_rate: validated.taxRate,
          paid_amount: validated.paidAmount,
          due_date: validated.dueDate,
          is_paid: validated.isPaid,
          organization_id: organizationId,
          created_by_id: user.id,
        },
      });
    }

    revalidatePath('/real-estate/expense-tax');
    return { success: true, estimate };
  } catch (error) {
    console.error('Failed to upsert tax estimate:', error);
    throw new Error('Failed to save tax estimate');
  }
}

/**
 * Generate expense report
 */
export async function generateExpenseReport(input: ExpenseReportInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = ExpenseReportSchema.parse(input);

  try {
    // Query expenses for the report
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

    const [expenses, totalExpenses, deductibleExpenses] = await Promise.all([
      prisma.expenses.findMany({
        where,
        include: {
          listing: true,
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.expenses.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.expenses.aggregate({
        where: { ...where, is_deductible: true },
        _sum: { amount: true },
      }),
    ]);

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
        report_data: {
          expenses: expenses.map((e) => ({
            id: e.id,
            date: e.date,
            merchant: e.merchant,
            category: e.category,
            amount: e.amount.toNumber(),
            isDeductible: e.is_deductible,
          })),
          summary: {
            totalCount: expenses.length,
            totalAmount: totalExpenses._sum.amount?.toNumber() || 0,
            deductibleAmount: deductibleExpenses._sum.amount?.toNumber() || 0,
          },
        },
        total_expenses: totalExpenses._sum.amount || 0,
        total_deductible: deductibleExpenses._sum.amount || 0,
        organization_id: organizationId,
        created_by_id: user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, report };
  } catch (error) {
    console.error('Failed to generate expense report:', error);
    throw new Error('Failed to generate expense report');
  }
}

/**
 * Calculate tax deductions for a given period
 */
export async function calculateTaxDeductions(year: number, quarter?: number) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  try {
    let startDate: Date;
    let endDate: Date;

    if (quarter) {
      // Quarterly calculation
      const quarterStartMonth = (quarter - 1) * 3;
      startDate = new Date(year, quarterStartMonth, 1);
      endDate = new Date(year, quarterStartMonth + 3, 0);
    } else {
      // Annual calculation
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    const [totalDeductible, categoryBreakdown] = await Promise.all([
      prisma.expenses.aggregate({
        where: {
          organization_id: organizationId,
          is_deductible: true,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amount: true },
      }),
      prisma.expenses.groupBy({
        by: ['category'],
        where: {
          organization_id: organizationId,
          is_deductible: true,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      year,
      quarter,
      totalDeductible: totalDeductible._sum.amount?.toNumber() || 0,
      breakdown: categoryBreakdown.map((item) => ({
        category: item.category,
        total: item._sum.amount?.toNumber() || 0,
        count: item._count,
      })),
    };
  } catch (error) {
    console.error('Failed to calculate tax deductions:', error);
    throw new Error('Failed to calculate tax deductions');
  }
}
