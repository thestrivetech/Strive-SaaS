'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/utils';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import {
  uploadAttachmentSchema,
  deleteAttachmentSchema,
  getAttachmentsSchema,
  type UploadAttachmentInput,
  type DeleteAttachmentInput,
  type GetAttachmentsInput,
} from './schemas';

/**
 * Upload a file to Supabase Storage and create an attachment record
 */
export async function uploadAttachment(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate input
    const validated = uploadAttachmentSchema.parse({
      entityType,
      entityId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      organizationId,
    });

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Upload to Supabase Storage
    const filePath = `${organizationId}/${entityType}/${entityId}/${Date.now()}_${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // Create attachment record in database
    const attachment = await prisma.attachment.create({
      data: {
        fileName: validated.fileName,
        fileSize: validated.fileSize,
        mimeType: validated.mimeType,
        filePath: uploadData.path,
        entityType: validated.entityType,
        entityId: validated.entityId,
        organizationId,
        uploadedById: user.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        organizationId,
        action: 'CREATE',
        entityType: 'Attachment',
        entityId: attachment.id,
        description: `Uploaded file "${validated.fileName}" to ${entityType}`,
      },
    });

    revalidatePath('/');
    return { success: true, data: attachment };
  } catch (error) {
    console.error('Upload attachment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload attachment';
    return { success: false, error: message };
  }
}

/**
 * Delete an attachment file and record
 */
export async function deleteAttachment(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);
    const validated = deleteAttachmentSchema.parse(input);

    // Verify ownership and get attachment details
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: validated.attachmentId,
        organizationId,
      },
    });

    if (!attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Delete from Supabase Storage
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([attachment.filePath]);

    if (storageError) {
      console.error('Supabase delete error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete attachment record
    await prisma.attachment.delete({
      where: { id: validated.attachmentId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        organizationId,
        action: 'DELETE',
        entityType: 'Attachment',
        entityId: attachment.id,
        description: `Deleted file "${attachment.fileName}"`,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete attachment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete attachment';
    return { success: false, error: message };
  }
}

/**
 * Get download URL for an attachment
 */
export async function getAttachmentUrl(attachmentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);

    // Verify ownership
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        organizationId,
      },
    });

    if (!attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Get signed URL from Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data, error } = await supabase.storage
      .from('attachments')
      .createSignedUrl(attachment.filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Supabase signed URL error:', error);
      return { success: false, error: 'Failed to generate download URL' };
    }

    return {
      success: true,
      data: {
        url: data.signedUrl,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
      },
    };
  } catch (error) {
    console.error('Get attachment URL error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get download URL';
    return { success: false, error: message };
  }
}

/**
 * Get all attachments for a specific entity
 */
export async function getAttachments(input: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = getUserOrganizationId(user);
    const validated = getAttachmentsSchema.parse(input);

    const attachments = await prisma.attachment.findMany({
      where: {
        organizationId,
        entityType: validated.entityType,
        entityId: validated.entityId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: attachments };
  } catch (error) {
    console.error('Get attachments error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get attachments';
    return { success: false, error: message };
  }
}
