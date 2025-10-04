import { createClient } from '@supabase/supabase-js';
import { encryptDocument, decryptDocument } from './encryption';

/**
 * Supabase Storage Service for Transaction Documents
 *
 * This service provides secure file upload/download with:
 * - AES-256-GCM encryption at rest
 * - Organization-based access control via RLS
 * - Signed URLs for temporary access
 * - File versioning support
 * - Audit logging
 */

// Initialize Supabase client with service role (bypasses RLS for admin operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase configuration missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Options for uploading a document
 */
export interface UploadOptions {
  /** Transaction loop ID (for organization isolation) */
  loopId: string;
  /** Original filename */
  fileName: string;
  /** File content as buffer */
  fileBuffer: Buffer;
  /** MIME type (e.g., 'application/pdf') */
  mimeType: string;
  /** Whether to encrypt file (default: true) */
  encrypt?: boolean;
  /** Additional metadata to store with file */
  metadata?: Record<string, string>;
}

/**
 * Result of downloading a document
 */
export interface DownloadResult {
  /** Decrypted file content */
  buffer: Buffer;
  /** Original MIME type */
  mimeType: string;
  /** Original filename */
  fileName: string;
}

/**
 * Supabase Storage Service Class
 *
 * Handles all file operations for transaction documents with encryption,
 * organization isolation, and secure access control.
 */
export class SupabaseStorageService {
  /** Bucket for unencrypted documents (legacy/testing only) */
  private readonly DOCUMENTS_BUCKET = 'transaction-documents';

  /** Bucket for encrypted documents (production use) */
  private readonly ENCRYPTED_BUCKET = 'transaction-documents-encrypted';

  /**
   * Upload a document to Supabase Storage with optional encryption
   *
   * File path structure: loops/{loopId}/documents/{filename}
   * This enables RLS policies to enforce organization isolation via loopId.
   *
   * @param options - Upload configuration
   * @returns {Promise<string>} Storage key (bucket/path) for database reference
   *
   * @throws {Error} If upload fails or file validation fails
   *
   * @example
   * ```typescript
   * const storageKey = await storageService.uploadDocument({
   *   loopId: 'loop_123',
   *   fileName: 'contract.pdf',
   *   fileBuffer: pdfBuffer,
   *   mimeType: 'application/pdf',
   *   encrypt: true,
   *   metadata: { uploadedBy: 'user_456' },
   * });
   * // Returns: 'transaction-documents-encrypted/loops/loop_123/documents/contract.pdf'
   * ```
   */
  async uploadDocument(options: UploadOptions): Promise<string> {
    const {
      loopId,
      fileName,
      fileBuffer,
      mimeType,
      encrypt = true,
      metadata = {},
    } = options;

    let uploadBuffer = fileBuffer;
    let bucket = this.DOCUMENTS_BUCKET;
    let storagePath = `loops/${loopId}/documents/${fileName}`;
    let uploadMetadata: Record<string, string> = { ...metadata, mimeType };

    // Encrypt file if required (production default)
    if (encrypt) {
      const encrypted = encryptDocument(fileBuffer);
      uploadBuffer = encrypted.encryptedBuffer;
      bucket = this.ENCRYPTED_BUCKET;

      // Store encryption metadata (needed for decryption)
      uploadMetadata = {
        ...uploadMetadata,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        algorithm: encrypted.algorithm,
        originalMimeType: mimeType,
        encrypted: 'true',
      } as Record<string, string>;
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, uploadBuffer, {
        contentType: encrypt ? 'application/octet-stream' : mimeType,
        upsert: false, // Don't overwrite - fail if file exists
        metadata: uploadMetadata,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Return storage key in format: bucket/path
    return `${bucket}/${data.path}`;
  }

  /**
   * Download a document from Supabase Storage with automatic decryption
   *
   * @param storageKey - Storage key from database (format: bucket/path)
   * @returns {Promise<DownloadResult>} Decrypted file with metadata
   *
   * @throws {Error} If download fails or decryption fails
   *
   * @example
   * ```typescript
   * const { buffer, mimeType, fileName } = await storageService.downloadDocument(
   *   'transaction-documents-encrypted/loops/loop_123/documents/contract.pdf'
   * );
   *
   * // Use buffer to send file to client
   * return new Response(buffer, {
   *   headers: { 'Content-Type': mimeType },
   * });
   * ```
   */
  async downloadDocument(storageKey: string): Promise<DownloadResult> {
    const [bucket, ...pathParts] = storageKey.split('/');
    const path = pathParts.join('/');

    // Download file from storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    // Get file metadata for decryption
    const pathDir = pathParts.slice(0, -1).join('/');
    const fileName = pathParts[pathParts.length - 1];

    const { data: fileList } = await supabaseAdmin.storage
      .from(bucket)
      .list(pathDir, {
        search: fileName,
      });

    const fileInfo = fileList?.[0];
    const metadata = (fileInfo?.metadata as Record<string, string>) || {};

    // Convert blob to buffer
    let buffer: Buffer = Buffer.from(await data.arrayBuffer());
    let mimeType = metadata.originalMimeType || metadata.mimeType || 'application/octet-stream';

    // Decrypt if file was encrypted
    if (bucket === this.ENCRYPTED_BUCKET || metadata.encrypted === 'true') {
      if (!metadata.iv || !metadata.authTag || !metadata.algorithm) {
        throw new Error('File is encrypted but missing decryption metadata');
      }

      buffer = decryptDocument({
        encryptedBuffer: buffer,
        iv: metadata.iv,
        authTag: metadata.authTag,
        algorithm: metadata.algorithm,
      }) as Buffer;

      mimeType = metadata.originalMimeType || mimeType;
    }

    return {
      buffer,
      mimeType,
      fileName: path.split('/').pop() || 'document',
    };
  }

  /**
   * Generate a signed URL for temporary file access
   *
   * Signed URLs allow clients to download files directly from Supabase Storage
   * without exposing credentials. URLs expire after the specified duration.
   *
   * @param storageKey - Storage key from database
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns {Promise<string>} Temporary signed URL
   *
   * @throws {Error} If URL generation fails
   *
   * @example
   * ```typescript
   * const signedUrl = await storageService.getSignedUrl(
   *   'transaction-documents-encrypted/loops/loop_123/documents/contract.pdf',
   *   3600 // 1 hour
   * );
   *
   * // Return URL to client for direct download
   * return { downloadUrl: signedUrl };
   * ```
   */
  async getSignedUrl(storageKey: string, expiresIn: number = 3600): Promise<string> {
    const [bucket, ...pathParts] = storageKey.split('/');
    const path = pathParts.join('/');

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Delete a document from storage permanently
   *
   * ⚠️ WARNING: This operation is irreversible!
   * Consider using archiveDocument() instead for soft deletion.
   *
   * @param storageKey - Storage key from database
   * @returns {Promise<void>}
   *
   * @throws {Error} If deletion fails
   *
   * @example
   * ```typescript
   * await storageService.deleteDocument(
   *   'transaction-documents-encrypted/loops/loop_123/documents/old-contract.pdf'
   * );
   * ```
   */
  async deleteDocument(storageKey: string): Promise<void> {
    const [bucket, ...pathParts] = storageKey.split('/');
    const path = pathParts.join('/');

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Archive a document (soft delete)
   *
   * Moves document to archive location instead of permanently deleting.
   * Archived files can be restored or permanently deleted later.
   *
   * Archive path: archives/{loopId}/{timestamp}_{filename}
   *
   * @param storageKey - Storage key from database
   * @returns {Promise<string>} New storage key in archive location
   *
   * @throws {Error} If archiving fails
   *
   * @example
   * ```typescript
   * const archiveKey = await storageService.archiveDocument(
   *   'transaction-documents-encrypted/loops/loop_123/documents/contract.pdf'
   * );
   * // Returns: 'transaction-documents-encrypted/archives/loop_123/1704368400000_contract.pdf'
   * ```
   */
  async archiveDocument(storageKey: string): Promise<string> {
    // Download the file first
    const { buffer, mimeType, fileName } = await this.downloadDocument(storageKey);

    // Extract loopId from original path
    const pathParts = storageKey.split('/');
    const loopId = pathParts[1]; // Format: bucket/loops/{loopId}/documents/{file}

    // Create archive path with timestamp
    const timestamp = Date.now();
    const archivePath = `archives/${loopId}/${timestamp}_${fileName}`;
    const bucket = this.ENCRYPTED_BUCKET;

    // Re-encrypt and upload to archive location
    const encrypted = encryptDocument(buffer);

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(archivePath, encrypted.encryptedBuffer, {
        contentType: 'application/octet-stream',
        metadata: {
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          algorithm: encrypted.algorithm,
          originalMimeType: mimeType,
          encrypted: 'true',
          archivedAt: new Date().toISOString(),
          originalPath: storageKey,
        },
      });

    if (error) {
      throw new Error(`Archive failed: ${error.message}`);
    }

    // Delete original file after successful archive
    await this.deleteDocument(storageKey);

    return `${bucket}/${data.path}`;
  }

  /**
   * List all documents in a transaction loop
   *
   * @param loopId - Transaction loop ID
   * @returns {Promise<string[]>} Array of storage keys
   *
   * @throws {Error} If listing fails
   *
   * @example
   * ```typescript
   * const documents = await storageService.listDocuments('loop_123');
   * // Returns: [
   * //   'transaction-documents-encrypted/loops/loop_123/documents/contract.pdf',
   * //   'transaction-documents-encrypted/loops/loop_123/documents/disclosure.pdf'
   * // ]
   * ```
   */
  async listDocuments(loopId: string): Promise<string[]> {
    const path = `loops/${loopId}/documents`;

    const { data, error } = await supabaseAdmin.storage
      .from(this.ENCRYPTED_BUCKET)
      .list(path);

    if (error) {
      throw new Error(`Failed to list documents: ${error.message}`);
    }

    return data.map(file => `${this.ENCRYPTED_BUCKET}/${path}/${file.name}`);
  }

  /**
   * Check if a file exists in storage
   *
   * @param storageKey - Storage key to check
   * @returns {Promise<boolean>} True if file exists
   *
   * @example
   * ```typescript
   * const exists = await storageService.fileExists(
   *   'transaction-documents-encrypted/loops/loop_123/documents/contract.pdf'
   * );
   * ```
   */
  async fileExists(storageKey: string): Promise<boolean> {
    const [bucket, ...pathParts] = storageKey.split('/');
    const path = pathParts.join('/');

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(pathParts.slice(0, -1).join('/'), {
        search: pathParts[pathParts.length - 1],
      });

    if (error) {
      return false;
    }

    return data.length > 0;
  }
}

/**
 * Singleton instance of SupabaseStorageService
 *
 * Import this to use storage operations throughout the application.
 *
 * @example
 * ```typescript
 * import { storageService } from '@/lib/storage/supabase-storage';
 *
 * const storageKey = await storageService.uploadDocument({...});
 * ```
 */
export const storageService = new SupabaseStorageService();
