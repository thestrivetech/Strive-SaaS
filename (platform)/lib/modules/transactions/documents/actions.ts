'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { prisma } from '@/lib/database/prisma';
import { storageService } from '@/lib/storage/supabase-storage';
import { validateFile, generateUniqueFilename } from '@/lib/storage/validation';
import { UploadDocumentSchema, UpdateDocumentSchema } from './schemas';
import type { UploadDocumentInput, UpdateDocumentInput } from './schemas';

/**
 * Upload a document to a transaction loop
 *
 * This action:
 * - Validates the file (type, size)
 * - Checks loop ownership (organization isolation)
 * - Encrypts and uploads to Supabase Storage
 * - Creates document record in database
 *
 * @param formData - FormData containing file and metadata
 * @returns {Promise<{success: boolean, document: any}>}
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If file is invalid
 * @throws {Error} If loop not found or not owned by user's organization
 * @throws {Error} If upload fails
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', fileBlob);
 * formData.append('loopId', 'loop-123');
 * formData.append('category', 'contract');
 * formData.append('description', 'Purchase agreement');
 *
 * const result = await uploadDocument(formData);
 * ```
 */
export async function uploadDocument(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Extract file
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  // Extract metadata (FormData returns null for missing fields)
  const loopId = formData.get('loopId') as string;
  const category = (formData.get('category') as string) || 'other';
  const description = formData.get('description') as string | null;

  // Validate input (convert null to undefined for optional fields)
  const validatedInput = UploadDocumentSchema.parse({
    loopId,
    category,
    description: description || undefined,
  });

  // Validate file
  const validation = validateFile({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Check loop ownership (organization isolation)
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: validatedInput.loopId,
      organization_id: getUserOrganizationId(user),
    },
  });

  if (!loop) {
    throw new Error('Transaction loop not found');
  }

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(file.name);

  // Upload to storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = await storageService.uploadDocument({
    loopId: validatedInput.loopId,
    fileName: uniqueFilename,
    fileBuffer: buffer,
    mimeType: file.type,
    encrypt: true,
    metadata: {
      uploadedBy: user.id,
      category: validatedInput.category || 'other',
    },
  });

  // Create document record
  const document = await prisma.documents.create({
    data: {
      filename: uniqueFilename,
      original_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      storage_key: storageKey,
      category: validatedInput.category,
      loop_id: validatedInput.loopId,
      uploaded_by: user.id,
      version: 1,
      status: 'DRAFT',
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Revalidate cache
  revalidatePath(`/transactions/${validatedInput.loopId}`);

  return { success: true, document };
}

/**
 * Create a new version of an existing document
 *
 * This action:
 * - Validates the new file
 * - Checks document ownership (organization isolation)
 * - Archives the current version
 * - Uploads the new version
 * - Updates the document record
 *
 * @param documentId - ID of the document to version
 * @param formData - FormData containing the new file
 * @returns {Promise<{success: boolean, document: any}>}
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If file is invalid
 * @throws {Error} If document not found or not owned by user's organization
 * @throws {Error} If upload fails
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', newFileBlob);
 *
 * const result = await createDocumentVersion('doc-123', formData);
 * ```
 */
export async function createDocumentVersion(documentId: string, formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  // Get existing document (with org isolation via loop)
  const existingDoc = await prisma.documents.findFirst({
    where: {
      id: documentId,
      loop: {
        organization_id: getUserOrganizationId(user),
      },
    },
  });

  if (!existingDoc) {
    throw new Error('Document not found');
  }

  // Validate file
  const validation = validateFile({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Upload new version
  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueFilename = generateUniqueFilename(file.name);
  const storageKey = await storageService.uploadDocument({
    loopId: existingDoc.loop_id,
    fileName: uniqueFilename,
    fileBuffer: buffer,
    mimeType: file.type,
    encrypt: true,
    metadata: {
      uploadedBy: user.id,
      previousVersion: existingDoc.version.toString(),
    },
  });

  // Create version record (archive old version)
  const newVersion = existingDoc.version + 1;

  await prisma.document_versions.create({
    data: {
      document_id: documentId,
      version_number: newVersion,
      storage_key: existingDoc.storage_key, // Archive old version's storage key
      file_size: existingDoc.file_size,
      created_by: user.id,
    },
  });

  // Update document with new version
  const updated = await prisma.documents.update({
    where: { id: documentId },
    data: {
      storage_key: storageKey,
      filename: uniqueFilename,
      original_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      version: newVersion,
      updated_at: new Date(),
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      versions: {
        orderBy: { version_number: 'desc' },
        take: 5,
      },
    },
  });

  // Revalidate cache
  revalidatePath(`/transactions/${existingDoc.loop_id}`);

  return { success: true, document: updated };
}

/**
 * Get a signed URL for downloading a document
 *
 * This action:
 * - Checks document ownership (organization isolation)
 * - Generates a signed URL valid for 1 hour
 * - Does not decrypt the file (client downloads encrypted, browser handles)
 *
 * @param documentId - ID of the document to download
 * @returns {Promise<{url: string}>} Signed URL valid for 1 hour
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If document not found or not owned by user's organization
 *
 * @example
 * ```typescript
 * const { url } = await getDocumentDownloadUrl('doc-123');
 * window.open(url); // Opens download in new tab
 * ```
 */
export async function getDocumentDownloadUrl(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const document = await prisma.documents.findFirst({
    where: {
      id: documentId,
      loop: {
        organization_id: getUserOrganizationId(user),
      },
    },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Generate signed URL (valid for 1 hour)
  const signedUrl = await storageService.getSignedUrl(document.storage_key, 3600);

  return { url: signedUrl };
}

/**
 * Update document metadata
 *
 * This action:
 * - Validates the input
 * - Checks document ownership (organization isolation)
 * - Updates only the provided fields
 *
 * @param documentId - ID of the document to update
 * @param input - Fields to update
 * @returns {Promise<{success: boolean, document: any}>}
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If document not found or not owned by user's organization
 * @throws {Error} If validation fails
 *
 * @example
 * ```typescript
 * const result = await updateDocument('doc-123', {
 *   category: 'contract',
 *   status: 'REVIEWED',
 *   description: 'Final purchase agreement',
 * });
 * ```
 */
export async function updateDocument(documentId: string, input: UpdateDocumentInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Validate input
  const validated = UpdateDocumentSchema.parse(input);

  // Check document ownership (organization isolation)
  const existingDoc = await prisma.documents.findFirst({
    where: {
      id: documentId,
      loop: {
        organization_id: getUserOrganizationId(user),
      },
    },
  });

  if (!existingDoc) {
    throw new Error('Document not found');
  }

  // Update document
  const updated = await prisma.documents.update({
    where: { id: documentId },
    data: {
      ...validated,
      updated_at: new Date(),
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Revalidate cache
  revalidatePath(`/transactions/${existingDoc.loop_id}`);

  return { success: true, document: updated };
}

/**
 * Delete a document permanently
 *
 * This action:
 * - Checks document ownership (organization isolation)
 * - Deletes document record (cascade deletes versions)
 * - Deletes file from storage
 *
 * @param documentId - ID of the document to delete
 * @returns {Promise<{success: boolean}>}
 *
 * @throws {Error} If user is not authenticated
 * @throws {Error} If document not found or not owned by user's organization
 *
 * @example
 * ```typescript
 * await deleteDocument('doc-123');
 * ```
 */
export async function deleteDocument(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get document (with org isolation)
  const document = await prisma.documents.findFirst({
    where: {
      id: documentId,
      loop: {
        organization_id: getUserOrganizationId(user),
      },
    },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Delete from database (cascade deletes versions)
  await prisma.documents.delete({
    where: { id: documentId },
  });

  // Delete from storage
  try {
    await storageService.deleteDocument(document.storage_key);
  } catch (error) {
    console.error('Failed to delete document from storage:', error);
    // Continue - database record is already deleted
  }

  // Revalidate cache
  revalidatePath(`/transactions/${document.loop_id}`);

  return { success: true };
}
