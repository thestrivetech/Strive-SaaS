/**
 * Media Library Module - Public API
 *
 * Exports for media asset management, folder organization,
 * and file upload functionality.
 *
 * Session 3: Media Library - Upload & Management
 */

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
