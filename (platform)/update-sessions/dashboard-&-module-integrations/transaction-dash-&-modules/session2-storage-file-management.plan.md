# Session 2: Storage Infrastructure & File Management - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-2.5 hours
**Dependencies:** Session 1 (Database Schema) completed, Supabase configured
**Parallel Safe:** Partially (can run parallel with Session 7, 8)

---

## 🎯 Session Objectives

Set up complete file storage infrastructure using Supabase Storage with document encryption, secure upload/download, and proper access control for transaction documents.

**What We're Building:**
- ✅ Supabase Storage bucket configuration with RLS
- ✅ Document encryption/decryption service
- ✅ Secure file upload service with validation
- ✅ Signed URL generation for downloads
- ✅ File type validation and sanitization
- ✅ Storage service abstraction layer

**Security Requirements:**
- 🔒 All documents encrypted at rest
- 🔒 RLS policies on storage buckets
- 🔒 File type validation (PDF, images, Office docs only)
- 🔒 Size limits (10MB per file)
- 🔒 Signed URLs with expiration
- 🔒 Malware scanning (optional, future enhancement)

---

## 📋 Task Breakdown

### Phase 1: Supabase Storage Setup (25 minutes)

#### Step 1.1: Create Storage Buckets
- [ ] Open Supabase Dashboard → Storage
- [ ] Create bucket: `transaction-documents`
- [ ] Create bucket: `transaction-documents-encrypted`
- [ ] Set both to private (not public)
- [ ] Note bucket names for .env

**Bucket Configuration:**
```yaml
Bucket: transaction-documents
  - Public: false
  - Allowed MIME types:
    - application/pdf
    - image/jpeg
    - image/png
    - application/msword
    - application/vnd.openxmlformats-officedocument.wordprocessingml.document
    - application/vnd.ms-excel
    - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  - Max file size: 10MB
  - RLS: Enabled

Bucket: transaction-documents-encrypted
  - Public: false
  - Allowed MIME types: application/octet-stream
  - Max file size: 12MB (encrypted size larger)
  - RLS: Enabled
```

**Success Criteria:**
- [ ] Both buckets created
- [ ] Set to private
- [ ] RLS enabled by default

---

#### Step 1.2: Configure Storage RLS Policies
- [ ] Open SQL Editor in Supabase
- [ ] Create SELECT policy (org isolation)
- [ ] Create INSERT policy (authenticated users)
- [ ] Create UPDATE policy (owner only)
- [ ] Create DELETE policy (owner/admin only)

**Storage RLS Policies:**
```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view files from their organization's loops
CREATE POLICY "Users can view org transaction documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transaction-documents'
  AND (storage.foldername(name))[1] IN (
    -- Extract loopId from path: loops/{loopId}/documents/{filename}
    SELECT id::text FROM transaction_loops
    WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);

-- Policy: Authenticated users can upload to their org's loops
CREATE POLICY "Users can upload to org loops"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'transaction-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM transaction_loops
    WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);

-- Policy: File uploader can update/delete
CREATE POLICY "Uploaders can modify their files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'transaction-documents'
  AND owner = auth.uid()
);

CREATE POLICY "Uploaders can delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'transaction-documents'
  AND owner = auth.uid()
);

-- Repeat for encrypted bucket
-- ... similar policies for 'transaction-documents-encrypted'
```

**Success Criteria:**
- [ ] RLS policies created
- [ ] Organization isolation enforced
- [ ] Owner-based modification allowed
- [ ] Tested with Supabase client

---

### Phase 2: Document Encryption Service (35 minutes)

#### Step 2.1: Create Encryption Utilities
- [ ] Create directory: `lib/storage/encryption/`
- [ ] Create file: `lib/storage/encryption/index.ts`
- [ ] Implement AES-256-GCM encryption
- [ ] Add environment variable for encryption key

**Create `lib/storage/encryption/index.ts`:**
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const AUTH_TAG_LENGTH = 16;

// Get encryption key from env (must be 32 bytes)
function getEncryptionKey(): Buffer {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('DOCUMENT_ENCRYPTION_KEY environment variable not set');
  }

  // Ensure key is exactly 32 bytes
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (64 hex chars)`);
  }

  return keyBuffer;
}

export interface EncryptedData {
  encryptedBuffer: Buffer;
  iv: string;           // Base64
  authTag: string;      // Base64
  algorithm: string;
}

/**
 * Encrypt a file buffer using AES-256-GCM
 */
export function encryptDocument(fileBuffer: Buffer): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encryptedChunks: Buffer[] = [];
  encryptedChunks.push(cipher.update(fileBuffer));
  encryptedChunks.push(cipher.final());

  const authTag = cipher.getAuthTag();
  const encryptedBuffer = Buffer.concat(encryptedChunks);

  return {
    encryptedBuffer,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    algorithm: ALGORITHM,
  };
}

/**
 * Decrypt a file buffer using AES-256-GCM
 */
export function decryptDocument(encryptedData: EncryptedData): Buffer {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decryptedChunks: Buffer[] = [];
  decryptedChunks.push(decipher.update(encryptedData.encryptedBuffer));
  decryptedChunks.push(decipher.final());

  return Buffer.concat(decryptedChunks);
}

/**
 * Generate a secure encryption key (run once, store in .env)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
```

**Success Criteria:**
- [ ] Encryption service created
- [ ] AES-256-GCM implemented
- [ ] IV and auth tag properly handled
- [ ] Environment variable validation

---

#### Step 2.2: Add Encryption Key to Environment
- [ ] Generate key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Add to `.env.local`
- [ ] Add to `.env.example` (with placeholder)
- [ ] Document key rotation process

**Update `.env.local`:**
```bash
# Document Encryption (AES-256-GCM)
DOCUMENT_ENCRYPTION_KEY="<generated-64-char-hex-string>"
```

**Update `.env.example`:**
```bash
# Document Encryption (AES-256-GCM)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
DOCUMENT_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

**Success Criteria:**
- [ ] Encryption key generated
- [ ] Added to .env.local
- [ ] Documented in .env.example
- [ ] Key is 64 hex chars (32 bytes)

---

### Phase 3: Storage Service Layer (40 minutes)

#### Step 3.1: Create Supabase Storage Client
- [ ] Create file: `lib/storage/supabase-storage.ts`
- [ ] Initialize Supabase client
- [ ] Implement upload/download methods
- [ ] Add signed URL generation

**Create `lib/storage/supabase-storage.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { encryptDocument, decryptDocument } from './encryption';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role (bypasses RLS for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface UploadOptions {
  loopId: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
  encrypt?: boolean;
  metadata?: Record<string, string>;
}

export interface DownloadResult {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

export class SupabaseStorageService {
  private readonly DOCUMENTS_BUCKET = 'transaction-documents';
  private readonly ENCRYPTED_BUCKET = 'transaction-documents-encrypted';

  /**
   * Upload a document to Supabase Storage
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
    let uploadMetadata = { ...metadata, mimeType };

    // Encrypt if required
    if (encrypt) {
      const encrypted = encryptDocument(fileBuffer);
      uploadBuffer = encrypted.encryptedBuffer;
      bucket = this.ENCRYPTED_BUCKET;

      // Store encryption metadata
      uploadMetadata = {
        ...uploadMetadata,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        algorithm: encrypted.algorithm,
        originalMimeType: mimeType,
      };
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, uploadBuffer, {
        contentType: encrypt ? 'application/octet-stream' : mimeType,
        upsert: false, // Don't overwrite existing files
        metadata: uploadMetadata,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Return full storage key: bucket/path
    return `${bucket}/${data.path}`;
  }

  /**
   * Download a document from Supabase Storage
   */
  async downloadDocument(storageKey: string): Promise<DownloadResult> {
    const [bucket, ...pathParts] = storageKey.split('/');
    const path = pathParts.join('/');

    // Download file
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    // Get metadata
    const { data: fileInfo } = await supabaseAdmin.storage
      .from(bucket)
      .list(pathParts.slice(0, -1).join('/'), {
        search: pathParts[pathParts.length - 1],
      });

    const file = fileInfo?.[0];
    const metadata = file?.metadata as Record<string, string> || {};

    // Convert blob to buffer
    let buffer = Buffer.from(await data.arrayBuffer());
    let mimeType = metadata.originalMimeType || metadata.mimeType || 'application/octet-stream';

    // Decrypt if encrypted
    if (bucket === this.ENCRYPTED_BUCKET) {
      buffer = decryptDocument({
        encryptedBuffer: buffer,
        iv: metadata.iv,
        authTag: metadata.authTag,
        algorithm: metadata.algorithm,
      });
      mimeType = metadata.originalMimeType || mimeType;
    }

    return {
      buffer,
      mimeType,
      fileName: path.split('/').pop() || 'document',
    };
  }

  /**
   * Generate signed URL for temporary access (1 hour)
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
   * Delete a document from storage
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
   * Move document to archive bucket (soft delete)
   */
  async archiveDocument(storageKey: string): Promise<string> {
    const { buffer, mimeType, fileName } = await this.downloadDocument(storageKey);

    // Upload to archive location
    const [, loopId] = storageKey.split('/');
    const archivePath = `archives/${loopId}/${Date.now()}_${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(this.ENCRYPTED_BUCKET)
      .upload(archivePath, buffer, {
        contentType: mimeType,
      });

    if (error) {
      throw new Error(`Archive failed: ${error.message}`);
    }

    // Delete original
    await this.deleteDocument(storageKey);

    return `${this.ENCRYPTED_BUCKET}/${data.path}`;
  }
}

export const storageService = new SupabaseStorageService();
```

**Success Criteria:**
- [ ] Storage service created
- [ ] Upload with encryption works
- [ ] Download with decryption works
- [ ] Signed URLs generated
- [ ] Delete functionality works

---

### Phase 4: File Validation Service (25 minutes)

#### Step 4.1: Create File Validators
- [ ] Create file: `lib/storage/validation.ts`
- [ ] Implement MIME type validation
- [ ] Add file size validation
- [ ] Create file extension checker
- [ ] Add magic number verification (future)

**Create `lib/storage/validation.ts`:**
```typescript
import { z } from 'zod';

// Allowed MIME types for transaction documents
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
] as const;

// Max file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// File extension to MIME type mapping
const EXTENSION_MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
};

export const FileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
  type: z.enum(ALLOWED_MIME_TYPES as any, {
    errorMap: () => ({ message: 'Invalid file type' }),
  }),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

/**
 * Validate file meets all requirements
 */
export function validateFile(file: {
  name: string;
  size: number;
  type: string;
}): { valid: true } | { valid: false; error: string } {
  try {
    FileUploadSchema.parse(file);

    // Additional validation: check extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension) {
      return { valid: false, error: 'File has no extension' };
    }

    const expectedMime = EXTENSION_MIME_MAP[extension];
    if (expectedMime && expectedMime !== file.type) {
      return {
        valid: false,
        error: `File extension .${extension} does not match MIME type ${file.type}`,
      };
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
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Remove double dots
    .replace(/^\./, '') // Remove leading dot
    .substring(0, 200); // Limit length
}

/**
 * Generate unique filename with timestamp
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
 * Check if file buffer matches MIME type (magic number check)
 * TODO: Implement in future for enhanced security
 */
export function verifyFileSignature(
  buffer: Buffer,
  expectedMimeType: string
): boolean {
  // Magic number verification
  // PDF: %PDF (0x25 0x50 0x44 0x46)
  // PNG: 0x89 0x50 0x4E 0x47
  // JPEG: 0xFF 0xD8 0xFF

  // For now, return true (implement later for enhanced security)
  return true;
}
```

**Success Criteria:**
- [ ] MIME type validation works
- [ ] File size limits enforced
- [ ] Filename sanitization prevents injection
- [ ] Unique filename generation works

---

### Phase 5: Storage Service Tests (30 minutes)

#### Step 5.1: Create Unit Tests
- [ ] Create test file: `__tests__/storage/encryption.test.ts`
- [ ] Test encryption/decryption
- [ ] Test file validation
- [ ] Test storage operations

**Create `__tests__/storage/encryption.test.ts`:**
```typescript
import { encryptDocument, decryptDocument } from '@/lib/storage/encryption';

describe('Document Encryption', () => {
  beforeAll(() => {
    // Set test encryption key
    process.env.DOCUMENT_ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  it('should encrypt and decrypt buffer correctly', () => {
    const originalBuffer = Buffer.from('This is a test document content');

    const encrypted = encryptDocument(originalBuffer);
    expect(encrypted.encryptedBuffer).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();

    const decrypted = decryptDocument(encrypted);
    expect(decrypted.toString()).toBe(originalBuffer.toString());
  });

  it('should produce different ciphertexts for same input', () => {
    const buffer = Buffer.from('Same content');

    const encrypted1 = encryptDocument(buffer);
    const encrypted2 = encryptDocument(buffer);

    // Different IVs = different ciphertexts
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
    expect(encrypted1.encryptedBuffer.toString('hex')).not.toBe(
      encrypted2.encryptedBuffer.toString('hex')
    );
  });

  it('should fail decryption with wrong auth tag', () => {
    const buffer = Buffer.from('Test');
    const encrypted = encryptDocument(buffer);

    encrypted.authTag = Buffer.from('wrong', 'utf-8').toString('base64');

    expect(() => decryptDocument(encrypted)).toThrow();
  });
});
```

**Create `__tests__/storage/validation.test.ts`:**
```typescript
import { validateFile, sanitizeFilename, generateUniqueFilename } from '@/lib/storage/validation';

describe('File Validation', () => {
  it('should accept valid PDF file', () => {
    const result = validateFile({
      name: 'contract.pdf',
      size: 1024 * 1024, // 1MB
      type: 'application/pdf',
    });
    expect(result.valid).toBe(true);
  });

  it('should reject file over 10MB', () => {
    const result = validateFile({
      name: 'large.pdf',
      size: 11 * 1024 * 1024, // 11MB
      type: 'application/pdf',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });

  it('should reject invalid MIME type', () => {
    const result = validateFile({
      name: 'script.exe',
      size: 1024,
      type: 'application/x-msdownload',
    });
    expect(result.valid).toBe(false);
  });

  it('should sanitize dangerous filenames', () => {
    const dangerous = '../../etc/passwd';
    const safe = sanitizeFilename(dangerous);
    expect(safe).not.toContain('..');
    expect(safe).not.toContain('/');
  });

  it('should generate unique filenames', () => {
    const name1 = generateUniqueFilename('document.pdf');
    const name2 = generateUniqueFilename('document.pdf');
    expect(name1).not.toBe(name2);
    expect(name1).toContain('.pdf');
  });
});
```

**Run Tests:**
```bash
npm test storage
```

**Success Criteria:**
- [ ] All encryption tests pass
- [ ] All validation tests pass
- [ ] Coverage > 80%

---

## 📊 Files to Create/Update

### Files to Create (5 files)
```
lib/storage/
├── encryption/
│   └── index.ts                    # ✅ Create (AES-256-GCM encryption)
├── supabase-storage.ts             # ✅ Create (Storage service)
└── validation.ts                   # ✅ Create (File validation)

__tests__/storage/
├── encryption.test.ts              # ✅ Create (Encryption tests)
└── validation.test.ts              # ✅ Create (Validation tests)
```

### Files to Update (2 files)
```
.env.local                          # 🔄 Add DOCUMENT_ENCRYPTION_KEY
.env.example                        # 🔄 Document encryption key
```

### Supabase Configuration
```
Storage Buckets:
- transaction-documents (private, RLS enabled)
- transaction-documents-encrypted (private, RLS enabled)

RLS Policies:
- 4 policies per bucket (SELECT, INSERT, UPDATE, DELETE)
```

**Total:** 7 file operations, 2 storage buckets, 8 RLS policies

---

## 🎯 Success Criteria

**MANDATORY - All must pass:**
- [ ] Supabase storage buckets created and configured
- [ ] RLS policies enforce organization isolation
- [ ] Encryption service encrypts/decrypts correctly
- [ ] Storage service uploads/downloads files
- [ ] File validation rejects invalid files
- [ ] Filename sanitization prevents injection
- [ ] Signed URLs generated with expiration
- [ ] All tests pass with 80%+ coverage
- [ ] Environment variable for encryption key set
- [ ] No hardcoded secrets in code

**Quality Checks:**
- [ ] AES-256-GCM encryption used
- [ ] IV and auth tag stored with encrypted data
- [ ] File size limits enforced (10MB)
- [ ] MIME type validation with whitelist
- [ ] Storage paths prevent directory traversal
- [ ] Error handling for all storage operations

---

## 🔗 Integration Points

### With Session 1 (Database)
```typescript
// Document model uses storageKey
const document = await prisma.document.create({
  data: {
    storageKey: 'transaction-documents/loops/{loopId}/documents/{file}',
    // ... other fields
  },
});
```

### With Session 4 (Document Upload)
```typescript
// Upload API will use storage service
import { storageService } from '@/lib/storage/supabase-storage';
import { validateFile } from '@/lib/storage/validation';

const storageKey = await storageService.uploadDocument({
  loopId,
  fileName,
  fileBuffer,
  mimeType,
  encrypt: true,
});
```

### With Supabase Auth
```typescript
// RLS policies use auth.uid()
-- Users can only access files from their organization's loops
USING (
  (storage.foldername(name))[1] IN (
    SELECT id FROM transaction_loops WHERE organization_id = ...
  )
)
```

---

## 📝 Implementation Notes

### Storage Path Structure
```
Bucket: transaction-documents-encrypted/
├── loops/
│   ├── {loopId}/
│   │   ├── documents/
│   │   │   ├── contract_1234567890_abc123.pdf
│   │   │   ├── disclosure_1234567891_def456.pdf
│   │   │   └── ...
│   └── ...
└── archives/
    └── {loopId}/
        └── 1234567890_old_contract.pdf
```

### Encryption Metadata
```typescript
// Stored in Supabase Storage metadata
{
  iv: 'base64-encoded-iv',
  authTag: 'base64-encoded-auth-tag',
  algorithm: 'aes-256-gcm',
  originalMimeType: 'application/pdf',
  uploadedBy: 'user-id',
  loopId: 'loop-id',
}
```

### File Size Considerations
- Original: 10MB max
- Encrypted: ~10.1MB (IV + auth tag overhead minimal)
- Bucket limit: 12MB (safety margin)

---

## 🚀 Quick Start Commands

```bash
# Phase 1: Create buckets in Supabase Dashboard
# (Manual step)

# Phase 2: Create encryption service
mkdir -p lib/storage/encryption
# (Create files from templates above)

# Phase 3: Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add to .env.local

# Phase 4: Create storage service
# (Create supabase-storage.ts from template)

# Phase 5: Create validation
# (Create validation.ts from template)

# Phase 6: Run tests
mkdir -p __tests__/storage
# (Create test files)
npm test storage

# Verify
npm test -- --coverage
```

---

## 🔄 Dependencies

**Requires (from setup):**
- Session 1 completed (Document model exists)
- Supabase project configured
- SUPABASE_SERVICE_ROLE_KEY in env
- Node.js crypto module available

**Blocks (must complete before):**
- **Session 4** (Document Upload) - Needs storage service
- **Session 6** (UI Components) - Needs signed URLs for preview

**Enables:**
- Secure document storage with encryption
- File upload/download in Session 4
- Document preview in Session 6
- Compliance with data protection regulations

---

## ⚠️ Critical Warnings

**DO NOT:**
- ❌ Store encryption key in code or git
- ❌ Use public buckets for sensitive docs
- ❌ Skip file type validation - security risk
- ❌ Allow unlimited file sizes
- ❌ Expose SUPABASE_SERVICE_ROLE_KEY to client
- ❌ Skip RLS policies - data leak risk

**MUST:**
- ✅ Encrypt all documents at rest
- ✅ Validate file types with whitelist
- ✅ Sanitize all filenames
- ✅ Use signed URLs with expiration
- ✅ Test encryption/decryption thoroughly
- ✅ Keep service role key server-side only

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 HIGH - Required for document management!
