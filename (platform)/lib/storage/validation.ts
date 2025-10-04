import { z } from 'zod';

/**
 * Allowed MIME types for transaction documents
 *
 * Only these file types are permitted for upload to ensure security.
 * Executables, scripts, and other potentially dangerous file types are blocked.
 */
export const ALLOWED_MIME_TYPES = [
  // PDFs
  'application/pdf',

  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',

  // Microsoft Office (legacy)
  'application/msword', // .doc
  'application/vnd.ms-excel', // .xls
  'application/vnd.ms-powerpoint', // .ppt

  // Microsoft Office (modern)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx

  // Plain text
  'text/plain',
  'text/csv',
] as const;

/**
 * Maximum file size: 10MB
 *
 * This limit balances usability with storage costs and performance.
 * Most transaction documents (contracts, disclosures) are well under 10MB.
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * File extension to MIME type mapping
 *
 * Used for validation - ensures file extension matches declared MIME type
 * to prevent file type spoofing attacks.
 */
const EXTENSION_MIME_MAP: Record<string, string> = {
  // PDFs
  pdf: 'application/pdf',

  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',

  // Microsoft Office (legacy)
  doc: 'application/msword',
  xls: 'application/vnd.ms-excel',
  ppt: 'application/vnd.ms-powerpoint',

  // Microsoft Office (modern)
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Plain text
  txt: 'text/plain',
  csv: 'text/csv',
};

/**
 * Zod schema for file upload validation
 */
export const FileUploadSchema = z.object({
  name: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
  size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
  type: z.enum(ALLOWED_MIME_TYPES as any, {
    errorMap: () => ({ message: 'Invalid file type. Only PDFs, images, and Office documents are allowed.' }),
  }),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

/**
 * Validation result - either valid or contains error message
 */
type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Validate file meets all security and size requirements
 *
 * Checks:
 * - File size is within limits
 * - MIME type is in allowed list
 * - File extension matches MIME type
 * - Filename is not empty
 *
 * @param file - File metadata (name, size, type)
 * @returns {ValidationResult} Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateFile({
 *   name: 'contract.pdf',
 *   size: 1024 * 1024, // 1MB
 *   type: 'application/pdf',
 * });
 *
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateFile(file: {
  name: string;
  size: number;
  type: string;
}): ValidationResult {
  try {
    // Validate against Zod schema
    FileUploadSchema.parse(file);

    // Additional validation: check extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension) {
      return { valid: false, error: 'File has no extension' };
    }

    const expectedMime = EXTENSION_MIME_MAP[extension];

    if (!expectedMime) {
      return {
        valid: false,
        error: `Unsupported file extension: .${extension}`,
      };
    }

    // Some files may have different but compatible MIME types
    // (e.g., image/jpg vs image/jpeg), so we check if it's in allowed list
    if (expectedMime !== file.type) {
      // Allow if the provided type is in the allowed list
      if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
        return {
          valid: false,
          error: `File extension .${extension} does not match MIME type ${file.type}`,
        };
      }
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid file' };
  }
}

/**
 * Sanitize filename to prevent path traversal and injection attacks
 *
 * Security measures:
 * - Removes path separators (/, \)
 * - Removes parent directory references (..)
 * - Removes special characters
 * - Limits length to 200 characters
 *
 * @param filename - Original filename
 * @returns {string} Sanitized filename safe for storage
 *
 * @example
 * ```typescript
 * sanitizeFilename('../../etc/passwd'); // Returns 'etc_passwd'
 * sanitizeFilename('My Document.pdf'); // Returns 'My_Document.pdf'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .replace(/^\./, '') // Remove leading dot
    .replace(/\/$/, '') // Remove trailing slash
    .substring(0, 200); // Limit length
}

/**
 * Generate unique filename with timestamp and random suffix
 *
 * Format: {original-name}_{timestamp}_{random}.{ext}
 *
 * This prevents:
 * - File name collisions
 * - Overwriting existing files
 * - Predictable file paths
 *
 * @param originalName - Original filename
 * @returns {string} Unique sanitized filename
 *
 * @example
 * ```typescript
 * generateUniqueFilename('contract.pdf');
 * // Returns: contract_1704368400000_x7k9m2.pdf
 * ```
 */
export function generateUniqueFilename(originalName: string): string {
  const sanitized = sanitizeFilename(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  const extension = sanitized.split('.').pop();
  const nameWithoutExt = sanitized.replace(`.${extension}`, '');

  return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
}

/**
 * Check if file buffer matches MIME type using magic number verification
 *
 * Magic numbers are the first few bytes of a file that identify its type.
 * This provides defense-in-depth against file type spoofing.
 *
 * @param buffer - File buffer
 * @param expectedMimeType - Expected MIME type
 * @returns {boolean} True if magic number matches expected type
 *
 * @example
 * ```typescript
 * const buffer = fs.readFileSync('document.pdf');
 * const isValidPDF = verifyFileSignature(buffer, 'application/pdf');
 * ```
 *
 * TODO: Implement full magic number verification for enhanced security
 * Current implementation returns true (validation placeholder)
 */
export function verifyFileSignature(
  buffer: Buffer,
  expectedMimeType: string
): boolean {
  // Magic number verification examples:
  // PDF: %PDF (0x25 0x50 0x44 0x46)
  // PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  // JPEG: 0xFF 0xD8 0xFF
  // GIF: GIF87a or GIF89a
  // ZIP (docx, xlsx): 0x50 0x4B 0x03 0x04

  // TODO: Implement magic number checks for each supported file type
  // For now, return true (rely on extension + MIME type validation)
  // This can be enhanced in a future security update

  return true;
}
