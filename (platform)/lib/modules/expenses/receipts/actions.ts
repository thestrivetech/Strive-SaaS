'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessExpenses } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';

/**
 * Upload Receipt
 *
 * Uploads a receipt file to Supabase Storage and updates the expense record.
 *
 * @param formData - FormData containing expenseId and file
 * @returns Success status with receipt URL
 */
export async function uploadReceipt(formData: FormData) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    const expenseId = formData.get('expenseId') as string;
    const file = formData.get('file') as File;

    if (!expenseId || !file) {
      throw new Error('Expense ID and file are required');
    }

    // Verify expense exists and belongs to organization
    const expense = await prisma.expenses.findFirst({
      where: {
        id: expenseId,
        organization_id: user.organizationId,
      },
    });

    if (!expense) {
      throw new Error('Expense not found or access denied');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only images (JPEG, PNG, WEBP) and PDFs are allowed');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.organizationId}/${expenseId}/${timestamp}.${fileExt}`;

    // Upload to Supabase Storage
    const supabase = await createClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('expense-receipts')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error('Failed to upload receipt to storage');
    }

    // Get public URL (or signed URL for private buckets)
    const { data: urlData } = supabase.storage
      .from('expense-receipts')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to generate receipt URL');
    }

    // Update expense with receipt information
    await prisma.expenses.update({
      where: { id: expenseId },
      data: {
        receipt_url: urlData.publicUrl,
        receipt_name: file.name,
        receipt_type: file.type,
      },
    });

    revalidatePath('/real-estate/expense-tax');
    revalidatePath('/real-estate/expense-tax/dashboard');

    return {
      success: true,
      receiptUrl: urlData.publicUrl,
      fileName: file.name,
    };
  } catch (error) {
    console.error('Failed to upload receipt:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload receipt'
    );
  }
}

/**
 * Delete Receipt
 *
 * Deletes a receipt file from Supabase Storage and updates the expense record.
 *
 * @param expenseId - Expense ID
 * @returns Success status
 */
export async function deleteReceipt(expenseId: string) {
  const user = await requireAuth();

  if (!canAccessExpenses(user.role)) {
    throw new Error('Unauthorized: Expense access required');
  }

  try {
    // Verify expense exists and belongs to organization
    const expense = await prisma.expenses.findFirst({
      where: {
        id: expenseId,
        organization_id: user.organizationId,
      },
      select: {
        id: true,
        receipt_url: true,
      },
    });

    if (!expense) {
      throw new Error('Expense not found or access denied');
    }

    if (!expense.receipt_url) {
      throw new Error('No receipt found for this expense');
    }

    // Extract file path from URL
    const url = new URL(expense.receipt_url);
    const pathParts = url.pathname.split('/expense-receipts/');
    const filePath = pathParts[1];

    if (!filePath) {
      throw new Error('Invalid receipt URL');
    }

    // Delete from Supabase Storage
    const supabase = await createClient();
    const { error: deleteError } = await supabase.storage
      .from('expense-receipts')
      .remove([filePath]);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      // Continue anyway to clear the database record
    }

    // Update expense to remove receipt information
    await prisma.expenses.update({
      where: { id: expenseId },
      data: {
        receipt_url: null,
        receipt_name: null,
        receipt_type: null,
      },
    });

    revalidatePath('/real-estate/expense-tax');
    revalidatePath('/real-estate/expense-tax/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete receipt:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to delete receipt'
    );
  }
}
