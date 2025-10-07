'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { uploadReceiptToStorage, deleteReceiptFromStorage } from './storage';

/**
 * Receipt Actions Module
 *
 * Server Actions for receipt file management with Supabase Storage
 *
 * SECURITY:
 * - All actions require authentication
 * - Multi-tenancy enforced via organizationId
 * - File validation before upload
 * - Storage cleanup on delete
 *
 * Features:
 * - Receipt upload to Supabase Storage
 * - Receipt deletion with cleanup
 * - Expense record updates
 * - Activity logging
 */

/**
 * Upload receipt file and create receipt record
 *
 * @param formData - FormData containing expenseId and file
 * @returns Success status and receipt record
 */
export async function uploadReceipt(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);
  const expenseId = formData.get('expenseId') as string;
  const file = formData.get('file') as File;

  if (!expenseId || !file) {
    throw new Error('Expense ID and file are required');
  }

  try {
    // Verify expense belongs to user's organization
    const expense = await prisma.expenses.findUnique({
      where: {
        id: expenseId,
        organization_id: organizationId,
      },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Upload to Supabase Storage
    const { url, path } = await uploadReceiptToStorage(file, expenseId, organizationId);

    // Create receipt record
    const receipt = await prisma.receipts.create({
      data: {
        expense_id: expenseId,
        original_name: file.name,
        file_name: path.split('/').pop() || file.name,
        file_url: url,
        file_size: file.size,
        mime_type: file.type,
      },
    });

    // Update expense with receipt info
    await prisma.expenses.update({
      where: { id: expenseId },
      data: {
        receipt_url: url,
        receipt_name: file.name,
        receipt_type: file.type,
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'uploaded_receipt',
        resource_type: 'receipt',
        resource_id: receipt.id,
        new_data: {
          expenseId,
          fileName: file.name,
          fileSize: file.size,
        },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true, receipt };
  } catch (error) {
    console.error('Failed to upload receipt:', error);
    throw new Error('Failed to upload receipt');
  }
}

/**
 * Delete receipt file and record
 *
 * @param receiptId - Receipt ID to delete
 * @returns Success status
 */
export async function deleteReceipt(receiptId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  try {
    // Get receipt and verify access
    const receipt = await prisma.receipts.findUnique({
      where: { id: receiptId },
      include: {
        expense: {
          select: { organization_id: true, id: true },
        },
      },
    });

    if (!receipt || receipt.expense.organization_id !== organizationId) {
      throw new Error('Receipt not found');
    }

    // Extract file path from URL (last 3 segments: org/expense/file)
    const urlParts = receipt.file_url.split('/');
    const filePath = urlParts.slice(-3).join('/');

    // Delete from storage
    await deleteReceiptFromStorage(filePath);

    // Delete receipt record
    await prisma.receipts.delete({
      where: { id: receiptId },
    });

    // Update expense
    await prisma.expenses.update({
      where: { id: receipt.expense.id },
      data: {
        receipt_url: null,
        receipt_name: null,
        receipt_type: null,
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        organization_id: organizationId,
        user_id: user.id,
        action: 'deleted_receipt',
        resource_type: 'receipt',
        resource_id: receiptId,
        old_data: {
          expenseId: receipt.expense.id,
          fileName: receipt.original_name,
        },
      },
    });

    revalidatePath('/real-estate/expense-tax');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete receipt:', error);
    throw new Error('Failed to delete receipt');
  }
}

/**
 * Get receipt by ID with access validation
 *
 * @param receiptId - Receipt ID
 * @returns Receipt record
 */
export async function getReceiptById(receiptId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const organizationId = getUserOrganizationId(user);

  const receipt = await prisma.receipts.findUnique({
    where: { id: receiptId },
    include: {
      expense: {
        select: { organization_id: true, merchant: true, amount: true },
      },
    },
  });

  if (!receipt || receipt.expense.organization_id !== organizationId) {
    throw new Error('Receipt not found');
  }

  return receipt;
}
