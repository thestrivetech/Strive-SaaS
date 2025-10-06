'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';
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
    const attachment = await prisma.attachments.create({
      data: {
        file_name: validated.fileName,
        file_size: validated.fileSize,
        mime_type: validated.mimeType,
        file_path: uploadData.path,
        entity_type: validated.entityType,
        entity_id: validated.entityId,
        organization_id: organizationId,
        uploaded_by_id: user.id,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        user_id: user.id,
        organization_id: organizationId,
        action: 'CREATE',
        resource_type: 'Attachment',
        resource_id: attachment.id,
        new_data: {
          description: `Uploaded file "${validated.fileName}" to ${entityType}`,
          fileName: validated.fileName,
        } as Prisma.JsonObject,
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
    const attachment = await prisma.attachments.findFirst({
      where: {
        id: validated.attachmentId,
        organization_id: organizationId,
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
      .remove([attachment.file_path]);

    if (storageError) {
      console.error('Supabase delete error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete attachment record
    await prisma.attachments.delete({
      where: { id: validated.attachmentId },
    });

    // Log activity
    await prisma.activity_logs.create({
      data: {
        user_id: user.id,
        organization_id: organizationId,
        action: 'DELETE',
        resource_type: 'Attachment',
        resource_id: attachment.id,
        old_data: {
          description: `Deleted file "${attachment.file_name}"`,
          fileName: attachment.file_name,
        } as Prisma.JsonObject,
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
    const attachment = await prisma.attachments.findFirst({
      where: {
        id: attachmentId,
        organization_id: organizationId,
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
      .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry

    if (error) {
      console.error('Supabase signed URL error:', error);
      return { success: false, error: 'Failed to generate download URL' };
    }

    return {
      success: true,
      data: {
        url: data.signedUrl,
        fileName: attachment.file_name,
        mimeType: attachment.mime_type,
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

    const attachments = await prisma.attachments.findMany({
      where: {
        organization_id: organizationId,
        entity_type: validated.entityType,
        entity_id: validated.entityId,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return { success: true, data: attachments };
  } catch (error) {
    console.error('Get attachments error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get attachments';
    return { success: false, error: message };
  }
}
