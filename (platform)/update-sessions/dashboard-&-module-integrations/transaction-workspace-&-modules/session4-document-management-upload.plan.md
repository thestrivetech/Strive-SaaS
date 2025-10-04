# Session 4: Document Management & Upload System - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2.5-3 hours
**Dependencies:** Session 1, 2, 3 completed
**Parallel Safe:** Partially (can run parallel with Session 7)

---

## 🎯 Session Objectives

Build secure document upload/download system with version control, file validation, and integration with Supabase Storage.

**What We're Building:**
- ✅ Document upload API (FormData handling)
- ✅ Version control system
- ✅ Document viewer with signed URLs
- ✅ File categorization and metadata
- ✅ Document search and filtering

---

## 📋 Task Breakdown

### Phase 1: Document Module Setup (40 minutes)

**Create `lib/modules/documents/schemas.ts`:**
```typescript
import { z } from 'zod';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/storage/validation';

export const UploadDocumentSchema = z.object({
  loopId: z.string().uuid(),
  category: z.enum(['contract', 'disclosure', 'inspection', 'appraisal', 'title', 'other']).optional(),
  description: z.string().max(1000).optional(),
});

export const UpdateDocumentSchema = z.object({
  filename: z.string().min(1).max(255).optional(),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'REVIEWED', 'SIGNED', 'ARCHIVED']).optional(),
  description: z.string().max(1000).optional(),
});
```

**Create `lib/modules/documents/actions.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { storageService } from '@/lib/storage/supabase-storage';
import { validateFile, generateUniqueFilename } from '@/lib/storage/validation';
import { UploadDocumentSchema } from './schemas';

export async function uploadDocument(formData: FormData) {
  const session = await requireAuth();

  // Extract file
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  // Extract metadata
  const loopId = formData.get('loopId') as string;
  const category = formData.get('category') as string || 'other';
  const description = formData.get('description') as string;

  // Validate input
  UploadDocumentSchema.parse({ loopId, category, description });

  // Validate file
  const validation = validateFile({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Check loop ownership
  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: loopId,
      organizationId: session.user.organizationId!,
    },
  });

  if (!loop) throw new Error('Loop not found');

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(file.name);

  // Upload to storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = await storageService.uploadDocument({
    loopId,
    fileName: uniqueFilename,
    fileBuffer: buffer,
    mimeType: file.type,
    encrypt: true,
    metadata: {
      uploadedBy: session.user.id,
      category,
    },
  });

  // Create document record
  const document = await prisma.document.create({
    data: {
      filename: uniqueFilename,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      storageKey,
      category,
      loopId,
      uploadedBy: session.user.id,
      version: 1,
      status: 'DRAFT',
    },
  });

  return { success: true, document };
}

export async function createDocumentVersion(documentId: string, formData: FormData) {
  const session = await requireAuth();
  const file = formData.get('file') as File;

  // Get existing document
  const existingDoc = await prisma.document.findFirst({
    where: {
      id: documentId,
      loop: { organizationId: session.user.organizationId! },
    },
  });

  if (!existingDoc) throw new Error('Document not found');

  // Validate file
  const validation = validateFile({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!validation.valid) throw new Error(validation.error);

  // Upload new version
  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueFilename = generateUniqueFilename(file.name);
  const storageKey = await storageService.uploadDocument({
    loopId: existingDoc.loopId,
    fileName: uniqueFilename,
    fileBuffer: buffer,
    mimeType: file.type,
    encrypt: true,
  });

  // Create version record
  const newVersion = existingDoc.version + 1;

  await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber: newVersion,
      storageKey: existingDoc.storageKey, // Archive old version
      fileSize: existingDoc.fileSize,
      createdBy: session.user.id,
    },
  });

  // Update document
  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      storageKey,
      filename: uniqueFilename,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      version: newVersion,
    },
  });

  return { success: true, document: updated };
}

export async function getDocumentDownloadUrl(documentId: string) {
  const session = await requireAuth();

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      loop: { organizationId: session.user.organizationId! },
    },
  });

  if (!document) throw new Error('Document not found');

  const signedUrl = await storageService.getSignedUrl(document.storageKey, 3600);

  return { url: signedUrl };
}
```

**Create `lib/modules/documents/queries.ts`:**
```typescript
'use server';

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

export async function getDocumentsByLoop(loopId: string) {
  const session = await requireAuth();

  return await prisma.document.findMany({
    where: {
      loopId,
      loop: { organizationId: session.user.organizationId! },
    },
    include: {
      uploader: {
        select: { id: true, name: true, email: true },
      },
      versions: {
        orderBy: { versionNumber: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDocumentVersions(documentId: string) {
  const session = await requireAuth();

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      loop: { organizationId: session.user.organizationId! },
    },
    include: {
      versions: {
        include: {
          creator: {
            select: { id: true, name: true },
          },
        },
        orderBy: { versionNumber: 'desc' },
      },
    },
  });

  if (!document) throw new Error('Document not found');

  return document.versions;
}
```

**Success Criteria:**
- [ ] Upload with file validation
- [ ] Version control implemented
- [ ] Signed URLs for download
- [ ] Organization isolation enforced

---

## 📊 Files to Create

```
lib/modules/documents/
├── schemas.ts          # ✅ Validation schemas
├── actions.ts          # ✅ Upload/version actions
├── queries.ts          # ✅ Document queries
└── index.ts            # ✅ Public API

__tests__/modules/documents/
├── upload.test.ts      # ✅ Upload tests
└── versions.test.ts    # ✅ Version control tests
```

**Total:** 6 files

---

## 🎯 Success Criteria

- [ ] File upload with encryption works
- [ ] Version control creates snapshots
- [ ] Download URLs signed and expire
- [ ] File type validation enforces whitelist
- [ ] Size limits enforced (10MB)
- [ ] Org isolation on all queries
- [ ] Tests pass with 80%+ coverage

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 HIGH
