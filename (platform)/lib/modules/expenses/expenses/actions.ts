'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { ExpenseSchema, ExpenseUpdateSchema } from './schemas';
import type { ExpenseInput, ExpenseUpdate } from './schemas';

/**
 * Create Expense
 *
 * Creates a new expense with multi-tenancy and RBAC enforcement.
 *
 * @param input - Expense data
 * @returns Created expense
 */
export async function createExpense(input: ExpenseInput) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  // Validate input with Zod
  const validated = ExpenseSchema.parse(input);

  try {
    // Calculate tax year from date
    const taxYear = validated.date.getFullYear();

    const expense = await prisma.expenses.create({
      data: {
        date: validated.date,
        merchant: validated.merchant,
        category_id: validated.categoryId,
        amount: validated.amount,
        description: validated.description,
        notes: validated.notes,
        listing_id: validated.listingId,
        is_deductible: validated.isDeductible,
        deduction_percent: validated.deductionPercent,
        tax_year: taxYear,
        mileage_start: validated.mileageStart,
        mileage_end: validated.mileageEnd,
        mileage_distance: validated.mileageDistance,
        mileage_purpose: validated.mileagePurpose,
        status: 'PENDING',
        organization_id: user.organizationId,
        user_id: user.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    revalidatePath('/real-estate/expense-tax/expense-tax-dashboard');

    return {
      success: true,
      expense: {
        id: expense.id,
        date: expense.date.toISOString(),
        merchant: expense.merchant,
        category: expense.category.name,
        categoryId: expense.category.id,
        amount: Number(expense.amount),
        listing: expense.listing
          ? {
              id: expense.listing.id,
              address: expense.listing.address,
            }
          : null,
        description: expense.description,
        notes: expense.notes,
        isDeductible: expense.is_deductible,
        deductionPercent: expense.deduction_percent,
        status: expense.status,
        createdAt: expense.created_at.toISOString(),
        createdBy: {
          id: expense.user.id,
          name: expense.user.name,
          email: expense.user.email,
        },
      },
    };
  } catch (error) {
    console.error('Failed to create expense:', error);
    throw new Error('Failed to create expense');
  }
}

/**
 * Update Expense
 *
 * Updates an existing expense with organization validation.
 *
 * @param input - Expense update data with ID
 * @returns Updated expense
 */
export async function updateExpense(input: ExpenseUpdate) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  // Validate input with Zod
  const validated = ExpenseUpdateSchema.parse(input);

  try {
    // Verify expense exists and belongs to organization
    const existing = await prisma.expenses.findFirst({
      where: {
        id: validated.id,
        organization_id: user.organizationId,
      },
    });

    if (!existing) {
      throw new Error('Expense not found or access denied');
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    if (validated.date !== undefined) {
      updateData.date = validated.date;
      updateData.tax_year = validated.date.getFullYear();
    }
    if (validated.merchant !== undefined) updateData.merchant = validated.merchant;
    if (validated.categoryId !== undefined) updateData.category_id = validated.categoryId;
    if (validated.amount !== undefined) updateData.amount = validated.amount;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    if (validated.listingId !== undefined) updateData.listing_id = validated.listingId;
    if (validated.isDeductible !== undefined)
      updateData.is_deductible = validated.isDeductible;
    if (validated.deductionPercent !== undefined)
      updateData.deduction_percent = validated.deductionPercent;
    if (validated.mileageStart !== undefined) updateData.mileage_start = validated.mileageStart;
    if (validated.mileageEnd !== undefined) updateData.mileage_end = validated.mileageEnd;
    if (validated.mileageDistance !== undefined)
      updateData.mileage_distance = validated.mileageDistance;
    if (validated.mileagePurpose !== undefined)
      updateData.mileage_purpose = validated.mileagePurpose;

    const expense = await prisma.expenses.update({
      where: { id: validated.id },
      data: updateData,
      include: {
        listing: {
          select: {
            id: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    revalidatePath('/real-estate/expense-tax/expense-tax-dashboard');

    return {
      success: true,
      expense: {
        id: expense.id,
        date: expense.date.toISOString(),
        merchant: expense.merchant,
        category: expense.category.name,
        categoryId: expense.category.id,
        amount: Number(expense.amount),
        listing: expense.listing
          ? {
              id: expense.listing.id,
              address: expense.listing.address,
            }
          : null,
        description: expense.description,
        notes: expense.notes,
        isDeductible: expense.is_deductible,
        deductionPercent: expense.deduction_percent,
        status: expense.status,
        updatedAt: expense.updated_at.toISOString(),
      },
    };
  } catch (error) {
    console.error('Failed to update expense:', error);
    throw new Error('Failed to update expense');
  }
}

/**
 * Delete Expense
 *
 * Deletes an expense with organization validation.
 * Also deletes associated receipts from the receipts table (cascade delete via FK).
 *
 * @param id - Expense ID
 * @returns Success status
 */
export async function deleteExpense(id: string) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    // Verify expense exists and belongs to organization
    const existing = await prisma.expenses.findFirst({
      where: {
        id,
        organization_id: user.organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new Error('Expense not found or access denied');
    }

    // Delete expense (receipts will be cascade deleted via FK constraint)
    await prisma.expenses.delete({
      where: { id },
    });

    revalidatePath('/real-estate/expense-tax');
    revalidatePath('/real-estate/expense-tax/expense-tax-dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw new Error('Failed to delete expense');
  }
}
