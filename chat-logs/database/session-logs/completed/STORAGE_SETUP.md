# Supabase Storage Setup Guide
**Strive Tech SaaS Platform - File Storage Configuration**

**Last Updated:** October 1, 2025
**Version:** 1.0.0

---

## Overview

This guide covers setting up Supabase Storage buckets for the Strive Tech platform. The platform uses Supabase Storage for all file uploads (avatars, document attachments, project files) with metadata stored in PostgreSQL via Prisma.

**Hybrid Pattern:**
- **Supabase Storage**: Stores actual file bytes
- **Prisma (PostgreSQL)**: Stores file metadata (name, size, path, owner)

---

## Required Buckets

### 1. `attachments` - General File Attachments
**Purpose:** Store files attached to projects, customers, tasks, etc.

**Access:** Private (authenticated users only, RLS-protected)

**File Path Structure:**
```
{organizationId}/{entityType}/{entityId}/{timestamp}_{filename}

Example:
abc123/project/proj_456/1696123456789_proposal.pdf
abc123/customer/cust_789/1696123457890_contract.docx
```

**Max File Size:** 50 MB
**Allowed Types:** Documents, images, PDFs, spreadsheets
**Retention:** Files deleted when parent entity is deleted

### 2. `avatars` - User Profile Pictures
**Purpose:** Store user avatar images

**Access:** Public (read), Private (write)

**File Path Structure:**
```
{userId}/{timestamp}.{ext}

Example:
user_123/1696123456789.jpg
```

**Max File Size:** 5 MB
**Allowed Types:** image/jpeg, image/png, image/webp
**Retention:** Overwritten when user updates avatar

### 3. `public-assets` - Marketing & Public Files
**Purpose:** Store public marketing materials, resources, blog images

**Access:** Public (read/write controlled by RLS)

**File Path Structure:**
```
{type}/{filename}

Example:
blog/2024-10-feature-announcement.jpg
resources/whitepaper-ai-strategy.pdf
```

**Max File Size:** 10 MB
**Allowed Types:** Images, PDFs, videos
**Retention:** Permanent until manually deleted

---

## Setup Instructions

### Step 1: Create Buckets via Supabase Dashboard

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/storage
   ```

2. **Create `attachments` Bucket**
   - Click "New bucket"
   - Name: `attachments`
   - Public: ❌ **OFF** (private bucket)
   - File size limit: 52428800 (50 MB)
   - Allowed MIME types: Leave empty (will be controlled by RLS)
   - Click "Create"

3. **Create `avatars` Bucket**
   - Click "New bucket"
   - Name: `avatars`
   - Public: ✅ **ON** (public bucket for read access)
   - File size limit: 5242880 (5 MB)
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
   - Click "Create"

4. **Create `public-assets` Bucket**
   - Click "New bucket"
   - Name: `public-assets`
   - Public: ✅ **ON**
   - File size limit: 10485760 (10 MB)
   - Allowed MIME types: `image/jpeg,image/png,image/webp,application/pdf,video/mp4`
   - Click "Create"

### Step 2: Configure Storage Policies

Execute this SQL in **Supabase SQL Editor**:

```sql
-- =====================================================
-- STORAGE POLICIES - Supabase Storage Access Control
-- =====================================================

-- =====================================================
-- BUCKET: attachments (Private)
-- =====================================================

-- Policy 1: Users can upload files to their organization
CREATE POLICY "Users can upload attachments to their organization"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = (
    SELECT om.organization_id::text
    FROM organization_members om
    WHERE om.user_id = auth.uid()::text
    LIMIT 1
  )
);

-- Policy 2: Users can view files from their organization
CREATE POLICY "Users can view attachments from their organization"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = (
    SELECT om.organization_id::text
    FROM organization_members om
    WHERE om.user_id = auth.uid()::text
    LIMIT 1
  )
);

-- Policy 3: Users can delete files from their organization
CREATE POLICY "Users can delete attachments from their organization"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = (
    SELECT om.organization_id::text
    FROM organization_members om
    WHERE om.user_id = auth.uid()::text
    LIMIT 1
  )
);

-- =====================================================
-- BUCKET: avatars (Public Read, Private Write)
-- =====================================================

-- Policy 1: Anyone can view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 2: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- BUCKET: public-assets (Public Read, Admin Write)
-- =====================================================

-- Policy 1: Anyone can view public assets
CREATE POLICY "Public can view public assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'public-assets');

-- Policy 2: Admins can upload public assets
CREATE POLICY "Admins can upload public assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role = 'ADMIN'
  )
);

-- Policy 3: Admins can update public assets
CREATE POLICY "Admins can update public assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public-assets'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role = 'ADMIN'
  )
);

-- Policy 4: Admins can delete public assets
CREATE POLICY "Admins can delete public assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'public-assets'
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()::text
    AND u.role = 'ADMIN'
  )
);
```

### Step 3: Verify Setup

Run this test script to verify storage is configured correctly:

```typescript
// scripts/test-storage-setup.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testStorageSetup() {
  console.log('🧪 Testing Supabase Storage Setup...\n');

  // Test 1: List buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('❌ Failed to list buckets:', bucketsError);
    return;
  }

  const requiredBuckets = ['attachments', 'avatars', 'public-assets'];
  const foundBuckets = buckets.map(b => b.name);

  console.log('📦 Found buckets:', foundBuckets);

  for (const bucket of requiredBuckets) {
    if (foundBuckets.includes(bucket)) {
      console.log(`✅ Bucket "${bucket}" exists`);
    } else {
      console.log(`❌ Bucket "${bucket}" missing!`);
    }
  }

  // Test 2: Check bucket accessibility
  for (const bucket of requiredBuckets) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1 });

    if (error) {
      console.log(`⚠️  Bucket "${bucket}": ${error.message}`);
    } else {
      console.log(`✅ Bucket "${bucket}" accessible`);
    }
  }

  console.log('\n✅ Storage setup test complete!');
}

testStorageSetup();
```

**Run test:**
```bash
npx tsx scripts/test-storage-setup.ts
```

---

## Usage Examples

### Upload File to Attachments

```typescript
// Server Action
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function uploadAttachment(formData: FormData) {
  const file = formData.get('file') as File;
  const entityType = formData.get('entityType') as string;
  const entityId = formData.get('entityId') as string;

  // Get user session
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get user's organization
  const userOrg = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    select: { organizationId: true },
  });

  if (!userOrg) throw new Error('No organization found');

  // Upload to Supabase Storage
  const filePath = `${userOrg.organizationId}/${entityType}/${entityId}/${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Save metadata to database
  const attachment = await prisma.attachment.create({
    data: {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      filePath: data.path,
      entityType,
      entityId,
      organizationId: userOrg.organizationId,
      uploadedById: user.id,
    },
  });

  return { success: true, attachment };
}
```

### Download File with Signed URL

```typescript
export async function getAttachmentUrl(attachmentId: string) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) throw new Error('Attachment not found');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role for admin access
  );

  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUrl(attachment.filePath, 3600); // 1 hour expiry

  if (error) throw error;

  return data.signedUrl;
}
```

### Delete File

```typescript
export async function deleteAttachment(attachmentId: string) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) throw new Error('Attachment not found');

  // Delete from storage
  const supabase = createServerClient(/* ... */);
  await supabase.storage
    .from('attachments')
    .remove([attachment.filePath]);

  // Delete metadata from database
  await prisma.attachment.delete({
    where: { id: attachmentId },
  });

  return { success: true };
}
```

---

## Troubleshooting

### Issue: "new row violates row-level security policy"
**Solution:** Verify user is authenticated and belongs to an organization:
```sql
SELECT
  auth.uid() as user_id,
  om.organization_id
FROM organization_members om
WHERE om.user_id = auth.uid()::text;
```

### Issue: Files uploading but not visible
**Solution:** Check SELECT policy allows user to read:
```sql
-- Test policy manually
SELECT * FROM storage.objects
WHERE bucket_id = 'attachments'
AND (storage.foldername(name))[1] = 'YOUR_ORG_ID';
```

### Issue: Upload fails with "Bucket not found"
**Solution:** Verify bucket exists:
```sql
SELECT * FROM storage.buckets WHERE name = 'attachments';
```

### Issue: File size limit exceeded
**Solution:** Increase bucket file size limit or compress file client-side before upload.

---

## Security Best Practices

1. **Always use organization-scoped paths**
   ```typescript
   // ✅ Good
   `${orgId}/${entityType}/${entityId}/file.pdf`

   // ❌ Bad
   `uploads/file.pdf`
   ```

2. **Use signed URLs for private files**
   ```typescript
   // ✅ Good - time-limited access
   const { data } = await supabase.storage
     .from('attachments')
     .createSignedUrl(path, 3600);

   // ❌ Bad - permanent public URL
   const publicUrl = supabase.storage
     .from('attachments')
     .getPublicUrl(path);
   ```

3. **Validate file types server-side**
   ```typescript
   const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
   if (!allowedTypes.includes(file.type)) {
     throw new Error('Invalid file type');
   }
   ```

4. **Scan files for malware** (future enhancement)
   - Integrate with virus scanning service
   - Quarantine suspicious files

5. **Set appropriate cache headers**
   ```typescript
   await supabase.storage.from('avatars').upload(path, file, {
     cacheControl: '3600',      // Cache for 1 hour
     contentType: file.type,
   });
   ```

---

## Monitoring & Maintenance

### Check Storage Usage
```sql
SELECT
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(size)) as total_size
FROM storage.objects
GROUP BY bucket_id;
```

### Find Large Files
```sql
SELECT
  name,
  bucket_id,
  pg_size_pretty(size) as file_size,
  created_at
FROM storage.objects
WHERE size > 10485760  -- Files larger than 10MB
ORDER BY size DESC
LIMIT 20;
```

### Cleanup Orphaned Files
```sql
-- Find files in storage with no metadata record
SELECT o.name, o.bucket_id
FROM storage.objects o
WHERE o.bucket_id = 'attachments'
AND NOT EXISTS (
  SELECT 1 FROM attachments a
  WHERE a.file_path = o.name
);
```

---

## Related Documentation

- [DATABASE_AUDIT_REPORT.md](./DATABASE_AUDIT_REPORT.md) - Overall database health
- [PRISMA-SUPABASE-STRATEGY.md](./PRISMA-SUPABASE-STRATEGY.md) - Hybrid architecture guide
- [RLS_POLICIES.md](./RLS_POLICIES.md) - Row Level Security policies

---

**Next Steps:** After setting up storage, configure RLS policies (see [RLS_POLICIES.md](./RLS_POLICIES.md))
