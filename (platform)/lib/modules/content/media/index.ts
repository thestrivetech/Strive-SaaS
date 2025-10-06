/**
 * Media Library Module - Public API
 *
 * Exports for media asset management, folder organization,
 * and file upload functionality.
 *
 * Session 3: Media Library - Upload & Management
 */

// ============================================================================
// Schemas & Validation
// ============================================================================

export {
  MediaAssetSchema,
  MediaFolderSchema,
  MediaFiltersSchema,
  UpdateMediaAssetSchema,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_WIDTH,
  WEBP_QUALITY,
  isAllowedImageType,
  isAllowedVideoType,
  isAllowedDocumentType,
  isAllowedFileType,
} from './schemas';

export type {
  MediaAssetInput,
  MediaFolderInput,
  MediaFilters,
  UpdateMediaAssetInput,
} from './schemas';

// ============================================================================
// Upload Helpers
// ============================================================================

export {
  uploadToSupabase,
  deleteFromSupabase,
  batchDeleteFromSupabase,
  getFileMetadata,
} from './upload';

export type { UploadResult } from './upload';

// ============================================================================
// Server Actions
// ============================================================================

export {
  uploadMediaAsset,
  createMediaFolder,
  updateMediaAsset,
  deleteMediaAsset,
  deleteMediaFolder,
  moveAssetsToFolder,
} from './actions';

// ============================================================================
// Queries
// ============================================================================

export {
  getMediaAssets,
  getMediaAssetById,
  getMediaFolders,
  getFolderTree,
  getMediaFolderById,
  getMediaStats,
  getRecentMedia,
  searchMedia,
  getMediaCount,
} from './queries';

// ============================================================================
// Prisma Types
// ============================================================================

export type {
  media_assets as MediaAsset,
  media_folders as MediaFolder,
} from '@prisma/client';
