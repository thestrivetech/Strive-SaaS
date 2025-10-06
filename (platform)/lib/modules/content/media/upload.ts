/**
 * Media Library - Upload Helpers
 *
 * Supabase Storage integration with image optimization,
 * file validation, and secure upload handling.
 *
 * Session 3: Media Library - Upload & Management
 */

'use server';

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import {
  isAllowedFileType,
  isAllowedImageType,
  MAX_FILE_SIZE,
  MAX_IMAGE_WIDTH,
  WEBP_QUALITY,
} from './schemas';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// Upload Result Type
// ============================================================================

export interface UploadResult {
  fileName: string;
  fileUrl: string;
  width?: number;
  height?: number;
  fileSize: number;
  mimeType: string;
}

// ============================================================================
// Upload to Supabase Storage
// ============================================================================

export async function uploadToSupabase(
  file: File,
  folder: string = 'media'
): Promise<UploadResult> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Validate file type
  if (!isAllowedFileType(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Generate unique filename with organization isolation
  const organizationId = getUserOrganizationId(user);
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${organizationId}/${folder}/${timestamp}-${sanitizedName}`;

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let finalBuffer: Buffer = buffer;
  let width: number | undefined;
  let height: number | undefined;
  let finalMimeType = file.type;

  // Optimize images (except SVG)
  if (isAllowedImageType(file.type) && file.type !== 'image/svg+xml') {
    const optimized = await optimizeImage(buffer, file.type);
    finalBuffer = optimized.buffer;
    width = optimized.width;
    height = optimized.height;
    finalMimeType = optimized.mimeType;
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('content-media')
    .upload(fileName, finalBuffer, {
      contentType: finalMimeType,
      upsert: false,
      cacheControl: '3600',
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('content-media').getPublicUrl(fileName);

  return {
    fileName: data.path,
    fileUrl: publicUrl,
    width,
    height,
    fileSize: finalBuffer.length,
    mimeType: finalMimeType,
  };
}

// ============================================================================
// Image Optimization
// ============================================================================

interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
}

async function optimizeImage(
  buffer: Buffer,
  originalMimeType: string
): Promise<OptimizedImage> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    let optimized = image;

    // Resize if too large (max 2000px width)
    if (metadata.width && metadata.width > MAX_IMAGE_WIDTH) {
      optimized = optimized.resize(MAX_IMAGE_WIDTH, undefined, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to WebP for better compression (except GIFs)
    let finalMimeType = originalMimeType;
    if (metadata.format !== 'gif') {
      optimized = optimized.webp({ quality: WEBP_QUALITY });
      finalMimeType = 'image/webp';
    }

    const optimizedBuffer = await optimized.toBuffer();
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    return {
      buffer: optimizedBuffer,
      width: optimizedMetadata.width || metadata.width || 0,
      height: optimizedMetadata.height || metadata.height || 0,
      mimeType: finalMimeType,
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    // If optimization fails, return original buffer
    const metadata = await sharp(buffer).metadata();
    return {
      buffer,
      width: metadata.width || 0,
      height: metadata.height || 0,
      mimeType: originalMimeType,
    };
  }
}

// ============================================================================
// Delete from Supabase Storage
// ============================================================================

export async function deleteFromSupabase(fileName: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  const { error } = await supabase.storage
    .from('content-media')
    .remove([fileName]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

// ============================================================================
// Batch Delete from Supabase Storage
// ============================================================================

export async function batchDeleteFromSupabase(
  fileNames: string[]
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  if (fileNames.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from('content-media')
    .remove(fileNames);

  if (error) {
    console.error('Supabase batch delete error:', error);
    throw new Error(`Batch delete failed: ${error.message}`);
  }
}

// ============================================================================
// Get File Metadata
// ============================================================================

export async function getFileMetadata(fileName: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase.storage
    .from('content-media')
    .list(fileName.split('/').slice(0, -1).join('/'), {
      search: fileName.split('/').pop(),
    });

  if (error) {
    console.error('Get file metadata error:', error);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }

  return data?.[0] || null;
}
