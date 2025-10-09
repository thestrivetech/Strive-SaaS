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
        status: 'PENDING',
        organization_id: user.organizationId,
        created_by_id: user.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            address: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
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
        category: expense.category,
        amount: Number(expense.amount),
        listing: expense.listing
          ? {
              id: expense.listing.id,
              address: expense.listing.address,
            }
          : null,
        notes: expense.notes,
        isDeductible: expense.is_deductible,
        taxCategory: expense.tax_category,
        status: expense.status,
        createdAt: expense.created_at.toISOString(),
        createdBy: {
          id: expense.creator.id,
          name: expense.creator.name,
          email: expense.creator.email,
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
    if (validated.date !== undefined) updateData.date = validated.date;
    if (validated.merchant !== undefined) updateData.merchant = validated.merchant;
    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.amount !== undefined) updateData.amount = validated.amount;
    if (validated.listingId !== undefined) updateData.listing_id = validated.listingId;
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    if (validated.isDeductible !== undefined)
      updateData.is_deductible = validated.isDeductible;
    if (validated.taxCategory !== undefined)
      updateData.tax_category = validated.taxCategory;

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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
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
        category: expense.category,
        amount: Number(expense.amount),
        listing: expense.listing
          ? {
              id: expense.listing.id,
              address: expense.listing.address,
            }
          : null,
        notes: expense.notes,
        isDeductible: expense.is_deductible,
        taxCategory: expense.tax_category,
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
 * Also deletes associated receipt from Supabase Storage if exists.
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
        receipt_url: true,
      },
    });

    if (!existing) {
      throw new Error('Expense not found or access denied');
    }

    // TODO: Delete receipt from Supabase Storage if exists
    // This will be implemented when we add the receipts module
    if (existing.receipt_url) {
      // const { deleteReceipt } = await import('../receipts/actions');
      // await deleteReceipt(id);
    }

    // Delete expense
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
