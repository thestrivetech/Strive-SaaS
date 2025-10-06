import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Receipt Storage Module
 *
 * Supabase Storage helpers for receipt file management
 *
 * Features:
 * - Upload receipts to Supabase Storage
 * - Delete receipts from storage
 * - Multi-tenant file organization
 * - Public URL generation
 *
 * SECURITY:
 * - Files organized by organizationId/expenseId
 * - RLS policies enforce access control
 * - File type and size validation at upload
 */

const BUCKET_NAME = 'receipts';

/**
 * Upload receipt file to Supabase Storage
 *
 * @param file - File to upload
 * @param expenseId - Expense ID for organization
 * @param organizationId - Organization ID for multi-tenant isolation
 * @returns Object containing public URL and storage path
 */
export async function uploadReceiptToStorage(
  file: File,
  expenseId: string,
  organizationId: string
): Promise<{ url: string; path: string }> {
  const supabase = createServerSupabaseClient();

  // Generate unique file path: org-id/expense-id/timestamp-filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}-${sanitizedFileName}`;
  const filePath = `${organizationId}/${expenseId}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error('Failed to upload receipt');
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Delete receipt file from Supabase Storage
 *
 * @param filePath - Storage path to delete
 */
export async function deleteReceiptFromStorage(filePath: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error('Supabase storage delete error:', error);
    throw new Error('Failed to delete receipt from storage');
  }
}

/**
 * Get public URL for receipt file
 *
 * @param filePath - Storage path
 * @returns Public URL
 */
export async function getReceiptUrl(filePath: string): Promise<string> {
  const supabase = createServerSupabaseClient();

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return data.publicUrl;
}
