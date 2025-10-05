# Session 3: Media Library - Upload & Management

## Session Overview
**Goal:** Build comprehensive media library with Supabase Storage integration, folder organization, and asset management.

**Duration:** 4-5 hours
**Complexity:** High (File upload complexity)
**Dependencies:** Sessions 1-2

## Objectives

1. ✅ Create media module backend
2. ✅ Implement Supabase Storage integration
3. ✅ Build file upload with validation
4. ✅ Create folder management system
5. ✅ Implement image optimization
6. ✅ Build media library UI
7. ✅ Add drag-and-drop upload
8. ✅ Create media picker component

## Module Structure

```
lib/modules/content/media/
├── index.ts          # Public API
├── schemas.ts        # Validation
├── queries.ts        # Data fetching
├── actions.ts        # Server Actions
└── upload.ts         # Upload helpers

components/real-estate/content/media/
├── media-library.tsx         # Main library view
├── media-upload-zone.tsx     # Drag-drop upload
├── media-grid.tsx            # Grid display
├── media-card.tsx            # Asset card
├── media-folder-tree.tsx     # Folder nav
├── media-picker-dialog.tsx   # Picker for content
└── media-details-panel.tsx   # Asset details
```

## Implementation Steps

### 1. Media Schemas

**File:** `lib/modules/content/media/schemas.ts`

```typescript
import { z } from 'zod';

export const MediaAssetSchema = z.object({
  name: z.string().min(1).max(255),
  originalName: z.string().min(1),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  mimeType: z.string().min(1),
  fileSize: z.number().positive().max(50 * 1024 * 1024), // 50MB max
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
  folderId: z.string().uuid().optional(),
  alt: z.string().max(255).optional(),
  caption: z.string().max(500).optional(),
  organizationId: z.string().uuid(),
});

export const MediaFolderSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
});

export const MediaFiltersSchema = z.object({
  folderId: z.string().uuid().optional(),
  mimeType: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// Supported file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export type MediaAssetInput = z.infer<typeof MediaAssetSchema>;
export type MediaFolderInput = z.infer<typeof MediaFolderSchema>;
export type MediaFilters = z.infer<typeof MediaFiltersSchema>;
```

### 2. Media Upload Helper

**File:** `lib/modules/content/media/upload.ts`

```typescript
'use server';

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { requireAuth } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UploadResult {
  fileName: string;
  fileUrl: string;
  width?: number;
  height?: number;
  fileSize: number;
}

export async function uploadToSupabase(
  file: File,
  folder: string = 'media'
): Promise<UploadResult> {
  const session = await requireAuth();

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${session.user.organizationId}/${folder}/${timestamp}-${sanitizedName}`;

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let finalBuffer = buffer;
  let width: number | undefined;
  let height: number | undefined;

  // Optimize images
  if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
    const optimized = await optimizeImage(buffer);
    finalBuffer = optimized.buffer;
    width = optimized.width;
    height = optimized.height;
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('content-media')
    .upload(fileName, finalBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('content-media')
    .getPublicUrl(fileName);

  return {
    fileName: data.path,
    fileUrl: publicUrl,
    width,
    height,
    fileSize: finalBuffer.length,
  };
}

async function optimizeImage(buffer: Buffer) {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Resize if too large (max 2000px)
  let optimized = image;
  if (metadata.width && metadata.width > 2000) {
    optimized = optimized.resize(2000, undefined, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to WebP for better compression (except GIFs)
  if (metadata.format !== 'gif') {
    optimized = optimized.webp({ quality: 85 });
  }

  const optimizedBuffer = await optimized.toBuffer();
  const optimizedMetadata = await sharp(optimizedBuffer).metadata();

  return {
    buffer: optimizedBuffer,
    width: optimizedMetadata.width,
    height: optimizedMetadata.height,
  };
}

export async function deleteFromSupabase(fileName: string): Promise<void> {
  const { error } = await supabase.storage
    .from('content-media')
    .remove([fileName]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
```

### 3. Media Actions

**File:** `lib/modules/content/media/actions.ts`

```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { canAccessContent } from '@/lib/auth/rbac';
import { prisma } from '@/lib/database/prisma';
import { revalidatePath } from 'next/cache';
import {
  MediaAssetSchema,
  MediaFolderSchema,
  type MediaAssetInput,
  type MediaFolderInput,
} from './schemas';
import { uploadToSupabase, deleteFromSupabase } from './upload';

// Upload media asset
export async function uploadMediaAsset(formData: FormData) {
  const session = await requireAuth();

  if (!canAccessContent(session.user)) {
    throw new Error('Unauthorized: Content access required');
  }

  const file = formData.get('file') as File;
  const folderId = formData.get('folderId') as string | null;
  const alt = formData.get('alt') as string | null;
  const caption = formData.get('caption') as string | null;

  if (!file) {
    throw new Error('No file provided');
  }

  // Upload to Supabase
  const uploadResult = await uploadToSupabase(file, folderId || 'root');

  // Save to database
  const mediaAsset = await prisma.mediaAsset.create({
    data: {
      name: file.name,
      originalName: file.name,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.fileUrl,
      mimeType: file.type,
      fileSize: uploadResult.fileSize,
      width: uploadResult.width,
      height: uploadResult.height,
      folderId: folderId || null,
      alt: alt || null,
      caption: caption || null,
      organizationId: session.user.organizationId,
      uploadedBy: session.user.id,
    },
    include: {
      uploader: {
        select: { id: true, name: true, email: true },
      },
      folder: true,
    },
  });

  revalidatePath('/content/library');
  return mediaAsset;
}

// Create media folder
export async function createMediaFolder(input: MediaFolderInput) {
  const session = await requireAuth();

  if (!canAccessContent(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = MediaFolderSchema.parse(input);

  // Build folder path
  let path = validated.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  if (validated.parentId) {
    const parent = await prisma.mediaFolder.findFirst({
      where: {
        id: validated.parentId,
        organizationId: session.user.organizationId,
      },
    });

    if (parent) {
      path = `${parent.path}/${path}`;
    }
  }

  const folder = await prisma.mediaFolder.create({
    data: {
      name: validated.name,
      path,
      parentId: validated.parentId || null,
      organizationId: session.user.organizationId,
      createdBy: session.user.id,
    },
  });

  revalidatePath('/content/library');
  return folder;
}

// Update media asset
export async function updateMediaAsset(id: string, updates: Partial<MediaAssetInput>) {
  const session = await requireAuth();

  const asset = await prisma.mediaAsset.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!asset) {
    throw new Error('Asset not found');
  }

  const updated = await prisma.mediaAsset.update({
    where: { id },
    data: updates,
  });

  revalidatePath('/content/library');
  return updated;
}

// Delete media asset
export async function deleteMediaAsset(id: string) {
  const session = await requireAuth();

  const asset = await prisma.mediaAsset.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!asset) {
    throw new Error('Asset not found');
  }

  // Delete from Supabase Storage
  await deleteFromSupabase(asset.fileName);

  // Delete from database
  await prisma.mediaAsset.delete({
    where: { id },
  });

  revalidatePath('/content/library');
  return { success: true };
}

// Delete media folder
export async function deleteMediaFolder(id: string) {
  const session = await requireAuth();

  const folder = await prisma.mediaFolder.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
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
    throw new Error('Cannot delete folder with assets. Move or delete assets first.');
  }

  if (folder.children.length > 0) {
    throw new Error('Cannot delete folder with subfolders. Delete subfolders first.');
  }

  await prisma.mediaFolder.delete({
    where: { id },
  });

  revalidatePath('/content/library');
  return { success: true };
}
```

### 4. Media Queries

**File:** `lib/modules/content/media/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { cache } from 'react';
import type { MediaFilters } from './schemas';

// Get media assets
export const getMediaAssets = cache(async (filters?: MediaFilters) => {
  const session = await requireAuth();

  const where: any = {
    organizationId: session.user.organizationId,
  };

  if (filters?.folderId) {
    where.folderId = filters.folderId;
  } else if (filters?.folderId === null) {
    where.folderId = null; // Root folder
  }

  if (filters?.mimeType) {
    where.mimeType = { startsWith: filters.mimeType };
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { alt: { contains: filters.search, mode: 'insensitive' } },
      { caption: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return await prisma.mediaAsset.findMany({
    where,
    include: {
      uploader: {
        select: { id: true, name: true, avatarUrl: true },
      },
      folder: true,
    },
    orderBy: { uploadedAt: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  });
});

// Get media folders
export const getMediaFolders = cache(async (parentId?: string | null) => {
  const session = await requireAuth();

  return await prisma.mediaFolder.findMany({
    where: {
      organizationId: session.user.organizationId,
      parentId: parentId === undefined ? null : parentId,
    },
    include: {
      _count: {
        select: {
          assets: true,
          children: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
});

// Get folder tree (for navigation)
export const getFolderTree = cache(async () => {
  const session = await requireAuth();

  const folders = await prisma.mediaFolder.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      _count: {
        select: { assets: true },
      },
    },
    orderBy: { path: 'asc' },
  });

  // Build tree structure
  const tree: any[] = [];
  const map = new Map();

  folders.forEach(folder => {
    map.set(folder.id, { ...folder, children: [] });
  });

  folders.forEach(folder => {
    if (folder.parentId) {
      const parent = map.get(folder.parentId);
      if (parent) {
        parent.children.push(map.get(folder.id));
      }
    } else {
      tree.push(map.get(folder.id));
    }
  });

  return tree;
});

// Get media stats
export const getMediaStats = cache(async () => {
  const session = await requireAuth();

  const [total, totalSize, images, videos, documents] = await Promise.all([
    prisma.mediaAsset.count({
      where: { organizationId: session.user.organizationId },
    }),
    prisma.mediaAsset.aggregate({
      where: { organizationId: session.user.organizationId },
      _sum: { fileSize: true },
    }),
    prisma.mediaAsset.count({
      where: {
        organizationId: session.user.organizationId,
        mimeType: { startsWith: 'image/' },
      },
    }),
    prisma.mediaAsset.count({
      where: {
        organizationId: session.user.organizationId,
        mimeType: { startsWith: 'video/' },
      },
    }),
    prisma.mediaAsset.count({
      where: {
        organizationId: session.user.organizationId,
        mimeType: { startsWith: 'application/' },
      },
    }),
  ]);

  return {
    total,
    totalSize: totalSize._sum.fileSize || 0,
    images,
    videos,
    documents,
  };
});
```

### 5. Media Library UI

**File:** `components/real-estate/content/media/media-library.tsx`

```typescript
'use client';

import { useState } from 'react';
import { MediaUploadZone } from './media-upload-zone';
import { MediaGrid } from './media-grid';
import { MediaFolderTree } from './media-folder-tree';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Grid3x3, List, FolderPlus } from 'lucide-react';

interface MediaLibraryProps {
  assets: any[];
  folders: any[];
  onUpload?: () => void;
}

export function MediaLibrary({ assets, folders, onUpload }: MediaLibraryProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAssets = assets.filter(asset => {
    if (selectedFolder && asset.folderId !== selectedFolder) return false;
    if (search && !asset.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Sidebar - Folder Tree */}
      <aside className="w-64 flex-shrink-0">
        <Card className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Folders</h3>
            <Button size="sm" variant="ghost">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <MediaFolderTree
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
          />
        </Card>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Upload Zone */}
        <MediaUploadZone folderId={selectedFolder} onUpload={onUpload} />

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid3x3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Assets Grid/List */}
        <Card className="p-4 h-[calc(100%-12rem)] overflow-y-auto">
          <MediaGrid assets={filteredAssets} viewMode={viewMode} />
        </Card>
      </div>
    </div>
  );
}
```

### 6. Upload Zone Component

**File:** `components/real-estate/content/media/media-upload-zone.tsx`

```typescript
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { uploadMediaAsset } from '@/lib/modules/content/media';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface MediaUploadZoneProps {
  folderId?: string | null;
  onUpload?: () => void;
}

export function MediaUploadZone({ folderId, onUpload }: MediaUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folderId', folderId);

        await uploadMediaAsset(formData);
      }

      toast({
        title: 'Upload successful',
        description: `${acceptedFiles.length} file(s) uploaded`,
      });

      router.refresh();
      onUpload?.();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [folderId, onUpload, toast, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <Card
      {...getRootProps()}
      className={`
        p-8 border-2 border-dashed transition-colors cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-center">
        {uploading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading files...</p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse (max 50MB)
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
```

## Dependencies

Install required packages:
```bash
npm install sharp react-dropzone
```

## Success Criteria

- [x] Media module backend complete
- [x] Supabase Storage integration working
- [x] File upload with drag-drop functional
- [x] Image optimization implemented
- [x] Folder management working
- [x] Media library UI responsive
- [x] File validation enforced
- [x] Multi-tenancy isolation verified

## Files Created

- ✅ `lib/modules/content/media/*` (5 files)
- ✅ `components/real-estate/content/media/*` (7 files)

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 4: Content Editor UI - Rich Text & Publishing**
2. ✅ Media library complete
3. ✅ Ready to build content editor
4. ✅ Can select media in content

---

**Session 3 Complete:** ✅ Media library with Supabase Storage integration
