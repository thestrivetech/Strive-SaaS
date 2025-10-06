/**
 * Media Library - Server Actions
 *
 * Server-side mutations for media asset upload, folder management,
 * and file operations with RBAC and multi-tenancy enforcement.
 *
 * Session 3: Media Library - Upload & Management
 */

'use server';

import { getCurrentUser } from '@/lib/auth/middleware';
import { canAccessContent } from '@/lib/auth/rbac';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';
import {
  MediaFolderSchema,
  UpdateMediaAssetSchema,
  type MediaFolderInput,
  type UpdateMediaAssetInput,
} from './schemas';
import { uploadToSupabase, deleteFromSupabase } from './upload';

// ============================================================================
// Upload Media Asset
// ============================================================================

export async function uploadMediaAsset(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  const file = formData.get('file') as File;
  const folderId = formData.get('folderId') as string | null;
  const alt = formData.get('alt') as string | null;
  const caption = formData.get('caption') as string | null;

  if (!file) {
    throw new Error('No file provided');
  }

  try {
    // Upload to Supabase Storage
    const uploadResult = await uploadToSupabase(file, folderId || 'root');

    const organizationId = getUserOrganizationId(user);

    // Save to database
    const mediaAsset = await prisma.media_assets.create({
      data: {
        name: file.name,
        original_name: file.name,
        file_name: uploadResult.fileName,
        file_url: uploadResult.fileUrl,
        mime_type: uploadResult.mimeType,
        file_size: uploadResult.fileSize,
        width: uploadResult.width,
        height: uploadResult.height,
        folder_id: folderId || null,
        alt: alt || null,
        caption: caption || null,
        organization_id: organizationId,
        uploaded_by: user.id,
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
        folder: true,
      },
    });

    revalidatePath('/real-estate/cms-marketing/library');
    revalidatePath('/content/library');
    return mediaAsset;
  } catch (error) {
    console.error('Upload media asset error:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to upload media asset');
  }
}

// ============================================================================
// Create Media Folder
// ============================================================================

export async function createMediaFolder(input: MediaFolderInput) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  const organizationId = getUserOrganizationId(user);
  const validated = MediaFolderSchema.parse({
    ...input,
    organizationId,
  });

  try {
    // Build folder path
    let path = validated.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (validated.parentId) {
      const parent = await prisma.media_folders.findFirst({
        where: {
          id: validated.parentId,
          organization_id: organizationId,
        },
      });

      if (!parent) {
        throw new Error('Parent folder not found');
      }

      path = `${parent.path}/${path}`;
    }

    // Check for duplicate folder name in same parent
    const existing = await prisma.media_folders.findFirst({
      where: {
        name: validated.name,
        parent_id: validated.parentId || null,
        organization_id: organizationId,
      },
    });

    if (existing) {
      throw new Error('A folder with this name already exists in this location');
    }

    const folder = await prisma.media_folders.create({
      data: {
        name: validated.name,
        path,
        parent_id: validated.parentId || null,
        organization_id: organizationId,
        created_by: user.id,
      },
      include: {
        _count: {
          select: {
            assets: true,
            children: true,
          },
        },
      },
    });

    revalidatePath('/real-estate/cms-marketing/library');
    revalidatePath('/content/library');
    return folder;
  } catch (error) {
    console.error('Create media folder error:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to create media folder');
  }
}

// ============================================================================
// Update Media Asset
// ============================================================================

export async function updateMediaAsset(input: UpdateMediaAssetInput) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  const validated = UpdateMediaAssetSchema.parse(input);

  try {
    const organizationId = getUserOrganizationId(user);
    const asset = await prisma.media_assets.findFirst({
      where: {
        id: validated.id,
        organization_id: organizationId,
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    const updated = await prisma.media_assets.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        alt: validated.alt,
        caption: validated.caption,
        folder_id: validated.folderId,
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
        folder: true,
      },
    });

    revalidatePath('/real-estate/cms-marketing/library');
    revalidatePath('/content/library');
    return updated;
  } catch (error) {
    console.error('Update media asset error:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to update media asset');
  }
}

// ============================================================================
// Delete Media Asset
// ============================================================================

export async function deleteMediaAsset(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  try {
    const organizationId = getUserOrganizationId(user);
    const asset = await prisma.media_assets.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Delete from Supabase Storage first
    await deleteFromSupabase(asset.file_name);

    // Delete from database
    await prisma.media_assets.delete({
      where: { id },
    });

    revalidatePath('/real-estate/cms-marketing/library');
    revalidatePath('/content/library');
    return { success: true };
  } catch (error) {
    console.error('Delete media asset error:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to delete media asset');
  }
}

// ============================================================================
// Delete Media Folder
// ============================================================================

export async function deleteMediaFolder(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  try {
    const organizationId = getUserOrganizationId(user);
    const folder = await prisma.media_folders.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
      include: {
        assets: true,
        children: true,
      },
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    if (folder.assets.length > 0) {
      throw new Error(
        'Cannot delete folder with assets. Move or delete assets first.'
      );
    }

    if (folder.children.length > 0) {
      throw new Error(
        'Cannot delete folder with subfolders. Delete subfolders first.'
      );
    }

    await prisma.media_folders.delete({
      where: { id },
    });

    revalidatePath('/real-estate/cms-marketing/library');
    revalidatePath('/content/library');
    return { success: true };
  } catch (error) {
    console.error('Delete media folder error:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to delete media folder');
  }
}

// ============================================================================
// Move Assets to Folder
// ============================================================================

export async function moveAssetsToFolder(
  assetIds: string[],
  folderId: string | null
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  if (!canAccessContent(user)) {
    throw new Error('Unauthorized: Content access required');
  }

  try {
    const organizationId = getUserOrganizationId(user);
    // Verify folder exists if folderId provided
    if (folderId) {
      const folder = await prisma.media_folders.findFirst({
        where: {
          id: folderId,
          organization_id: organizationId,
        },
      });

      if (!folder) {
        throw new Error('Target folder not found');
      }
    }

    // Update all assets
    await prisma.media_assets.updateMany({
      where: {
        id: { in: assetIds },
        organization_id: organizationId,
      },
      data: {
        folder_id: folderId,
      },
    });

    revalidatePath('/real-estate/cms-marketing/library');
    revalidatePath('/content/library');
    return { success: true, movedCount: assetIds.length };
  } catch (error) {
    console.error('Move assets error:', error);
    throw error instanceof Error ? error : new Error('Failed to move assets');
  }
}
