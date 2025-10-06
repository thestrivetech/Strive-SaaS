/**
 * Media Library - Data Queries
 *
 * Server-side data fetching for media assets and folders with
 * React cache optimization and multi-tenancy enforcement.
 *
 * Session 3: Media Library - Upload & Management
 */

'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { cache } from 'react';
import type { MediaFilters } from './schemas';

// ============================================================================
// Get Media Assets
// ============================================================================

export const getMediaAssets = cache(async (filters?: MediaFilters) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const organizationId = getUserOrganizationId(user);

  const where: any = {
    organization_id: organizationId,
  };

  // Filter by folder
  if (filters?.folderId !== undefined) {
    where.folder_id = filters.folderId;
  }

  // Filter by MIME type (e.g., 'image/' for all images)
  if (filters?.mimeType) {
    where.mime_type = { startsWith: filters.mimeType };
  }

  // Search by name, alt text, or caption
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { alt: { contains: filters.search, mode: 'insensitive' } },
      { caption: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const assets = await prisma.media_assets.findMany({
    where,
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
        },
      },
      folder: {
        select: {
          id: true,
          name: true,
          path: true,
        },
      },
    },
    orderBy: { uploaded_at: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });

  return assets;
});

// ============================================================================
// Get Media Asset by ID
// ============================================================================

export const getMediaAssetById = cache(async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const organizationId = getUserOrganizationId(user);

  const asset = await prisma.media_assets.findFirst({
    where: {
      id,
      organization_id: organizationId,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
        },
      },
      folder: {
        select: {
          id: true,
          name: true,
          path: true,
        },
      },
    },
  });

  return asset;
});

// ============================================================================
// Get Media Folders
// ============================================================================

export const getMediaFolders = cache(async (parentId?: string | null) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const organizationId = getUserOrganizationId(user);

  const folders = await prisma.media_folders.findMany({
    where: {
      organization_id: organizationId,
      parent_id: parentId === undefined ? null : parentId,
    },
    include: {
      _count: {
        select: {
          assets: true,
          children: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return folders;
});

// ============================================================================
// Get Folder Tree
// ============================================================================

export const getFolderTree = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const organizationId = getUserOrganizationId(user);

  const folders = await prisma.media_folders.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      _count: {
        select: {
          assets: true,
          children: true,
        },
      },
    },
    orderBy: { path: 'asc' },
  });

  // Build tree structure
  const tree: any[] = [];
  const map = new Map();

  // Create map of all folders
  folders.forEach((folder) => {
    map.set(folder.id, { ...folder, children: [] });
  });

  // Build parent-child relationships
  folders.forEach((folder) => {
    const node = map.get(folder.id);
    if (folder.parent_id) {
      const parent = map.get(folder.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent not found, add to root
        tree.push(node);
      }
    } else {
      // Root level folder
      tree.push(node);
    }
  });

  return tree;
});

// ============================================================================
// Get Folder by ID
// ============================================================================

export const getMediaFolderById = cache(async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const organizationId = getUserOrganizationId(user);

  const folder = await prisma.media_folders.findFirst({
    where: {
      id,
      organization_id: organizationId,
    },
    include: {
      _count: {
        select: {
          assets: true,
          children: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      parent: {
        select: {
          id: true,
          name: true,
          path: true,
        },
      },
    },
  });

  return folder;
});

// ============================================================================
// Get Media Stats
// ============================================================================

export const getMediaStats = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const organizationId = getUserOrganizationId(user);

  const [total, totalSize, images, videos, documents] = await Promise.all([
    // Total asset count
    prisma.media_assets.count({
      where: { organization_id: organizationId },
    }),

    // Total file size
    prisma.media_assets.aggregate({
      where: { organization_id: organizationId },
      _sum: { file_size: true },
    }),

    // Image count
    prisma.media_assets.count({
      where: {
        organization_id: organizationId,
        mime_type: { startsWith: 'image/' },
      },
    }),

    // Video count
    prisma.media_assets.count({
      where: {
        organization_id: organizationId,
        mime_type: { startsWith: 'video/' },
      },
    }),

    // Document count
    prisma.media_assets.count({
      where: {
        organization_id: organizationId,
        mime_type: { startsWith: 'application/' },
      },
    }),
  ]);

  return {
    total,
    totalSize: totalSize._sum.file_size || 0,
    images,
    videos,
    documents,
    averageSize: total > 0 ? (totalSize._sum.file_size || 0) / total : 0,
  };
});

// ============================================================================
// Get Recent Media
// ============================================================================

export const getRecentMedia = cache(async (limit: number = 10) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const organizationId = getUserOrganizationId(user);

  const assets = await prisma.media_assets.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
        },
      },
    },
    orderBy: { uploaded_at: 'desc' },
    take: limit,
  });

  return assets;
});

// ============================================================================
// Search Media
// ============================================================================

export const searchMedia = cache(
  async (query: string, filters?: Partial<MediaFilters>) => {
    const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
    const organizationId = getUserOrganizationId(user);

    const where: any = {
      organization_id: organizationId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { alt: { contains: query, mode: 'insensitive' } },
        { caption: { contains: query, mode: 'insensitive' } },
        { original_name: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Apply additional filters
    if (filters?.folderId) {
      where.folder_id = filters.folderId;
    }

    if (filters?.mimeType) {
      where.mime_type = { startsWith: filters.mimeType };
    }

    const assets = await prisma.media_assets.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { uploaded_at: 'desc' },
      take: filters?.limit || 50,
    });

    return assets;
  }
);

// ============================================================================
// Get Media Count
// ============================================================================

export const getMediaCount = cache(async (filters?: MediaFilters) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const organizationId = getUserOrganizationId(user);

  const where: any = {
    organization_id: organizationId,
  };

  if (filters?.folderId !== undefined) {
    where.folder_id = filters.folderId;
  }

  if (filters?.mimeType) {
    where.mime_type = { startsWith: filters.mimeType };
  }

  const count = await prisma.media_assets.count({ where });

  return count;
});
