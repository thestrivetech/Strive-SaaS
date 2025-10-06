# Supabase Storage Buckets Setup

**Purpose:** File storage for user-uploaded content across all projects
**Provider:** Supabase Storage (S3-compatible)
**Security:** Row Level Security (RLS) on storage.objects table

---

## 📦 Current Buckets

### 1. `media` - General Media Files
- **Used by:** Platform (CMS, Marketing module)
- **Content:** Images, videos, documents
- **Public:** false (RLS-controlled access)
- **Max Size:** 50MB per file
- **Allowed Types:** images/*, video/*, application/pdf

**Folder Structure:**
```
media/
├── {org-id-1}/
│   ├── media/
│   │   ├── {timestamp}-image.webp
│   │   └── {timestamp}-video.mp4
│   └── campaigns/
│       └── {timestamp}-banner.webp
└── {org-id-2}/
    └── media/
        └── {timestamp}-doc.pdf
```

### 2. `documents` - Transaction Documents
- **Used by:** Platform (Transaction/Workspace module)
- **Content:** Contracts, agreements, PDFs
- **Public:** false (RLS-controlled access)
- **Max Size:** 100MB per file
- **Allowed Types:** application/pdf, image/*
- **Encryption:** AES-256-GCM (via DOCUMENT_ENCRYPTION_KEY)

**Folder Structure:**
```
documents/
└── {org-id}/
    └── transactions/
        ├── {transaction-id}/
        │   ├── {timestamp}-contract.pdf
        │   └── {timestamp}-agreement.pdf
        └── {transaction-id}/
            └── {timestamp}-disclosure.pdf
```

### 3. `receipts` - Expense Receipts
- **Used by:** Platform (Expense & Tax module)
- **Content:** Receipt images, PDFs
- **Public:** false (RLS-controlled access)
- **Max Size:** 10MB per file
- **Allowed Types:** image/*, application/pdf

**Folder Structure:**
```
receipts/
└── {org-id}/
    └── expenses/
        ├── {expense-id}/
        │   └── {timestamp}-receipt.webp
        └── {expense-id}/
            └── {timestamp}-invoice.pdf
```

### 4. `avatars` - User Profile Pictures
- **Used by:** All projects
- **Content:** User profile images
- **Public:** true (publicly accessible URLs)
- **Max Size:** 2MB per file
- **Allowed Types:** image/*
- **Optimization:** Auto-converted to WebP, max 500x500px

**Folder Structure:**
```
avatars/
├── users/
│   ├── {user-id-1}.webp
│   └── {user-id-2}.webp
└── organizations/
    ├── {org-id-1}.webp
    └── {org-id-2}.webp
```

---

## 🔧 Bucket Creation (One-Time Setup)

### Via Supabase Dashboard

1. **Navigate to Storage**
   ```
   Supabase Dashboard → Storage → New Bucket
   ```

2. **Create Each Bucket**

   **For `media`:**
   ```
   Name: media
   Public: false
   File size limit: 52428800 (50MB)
   Allowed MIME types: image/*, video/*, application/pdf
   ```

   **For `documents`:**
   ```
   Name: documents
   Public: false
   File size limit: 104857600 (100MB)
   Allowed MIME types: application/pdf, image/*
   ```

   **For `receipts`:**
   ```
   Name: receipts
   Public: false
   File size limit: 10485760 (10MB)
   Allowed MIME types: image/*, application/pdf
   ```

   **For `avatars`:**
   ```
   Name: avatars
   Public: true
   File size limit: 2097152 (2MB)
   Allowed MIME types: image/*
   ```

3. **Apply RLS Policies** (see next section)

---

## 🔒 RLS Policies for Storage

### Why RLS on Storage?

Storage buckets use PostgreSQL's `storage.objects` table, which supports RLS for fine-grained access control.

### Policy Structure

```sql
-- Template for storage RLS policy
CREATE POLICY "policy_name"
ON storage.objects
FOR [SELECT | INSERT | UPDATE | DELETE]
[USING (condition)]
[WITH CHECK (condition)];
```

### Policies for `media` Bucket

```sql
-- Allow authenticated users to upload to their org folder
CREATE POLICY "media_insert_own_org"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM users
    WHERE id = auth.uid()::text
  )
);

-- Allow users to read their org's media
CREATE POLICY "media_select_own_org"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM users
    WHERE id = auth.uid()::text
  )
);

-- Allow users to update their org's media
CREATE POLICY "media_update_own_org"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM users
    WHERE id = auth.uid()::text
  )
);

-- Allow users to delete their org's media
CREATE POLICY "media_delete_own_org"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM users
    WHERE id = auth.uid()::text
  )
);
```

### Policies for `avatars` Bucket (Public)

```sql
-- Allow anyone to read avatars (public bucket)
CREATE POLICY "avatars_select_all"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "avatars_insert_own"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatars' AND
  (
    name = 'users/' || auth.uid()::text || '.webp'
    OR
    (storage.foldername(name))[1] = 'organizations' AND
    (storage.foldername(name))[2] IN (
      SELECT organization_id::text
      FROM organization_members
      WHERE user_id = auth.uid()::text
      AND role IN ('OWNER', 'ADMIN')
    )
  )
);

-- Allow users to update their own avatar
CREATE POLICY "avatars_update_own"
ON storage.objects
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatars' AND
  (
    name = 'users/' || auth.uid()::text || '.webp'
    OR
    (storage.foldername(name))[1] = 'organizations' AND
    (storage.foldername(name))[2] IN (
      SELECT organization_id::text
      FROM organization_members
      WHERE user_id = auth.uid()::text
      AND role IN ('OWNER', 'ADMIN')
    )
  )
);
```

### Applying Policies

**Option 1: Via SQL Editor (Dashboard)**
```sql
-- Copy policy SQL above
-- Paste into Supabase Dashboard → SQL Editor
-- Execute
```

**Option 2: Via Migration (Recommended)**
```bash
# Create a new migration
cd (platform)
npm run db:migrate
# Name: setup_storage_rls_policies

# Add policy SQL to migration file:
# shared/prisma/migrations/XXXXXX_setup_storage_rls_policies/migration.sql

# Apply migration
npm run db:apply
# Then use Claude MCP tool or dashboard to execute
```

---

## 💻 Usage in Code

### Upload File (Server-Side)

```typescript
// lib/modules/content/media/upload.ts
'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Server-side only!
);

export async function uploadFile(
  file: File,
  bucket: string = 'media'
) {
  const user = await getCurrentUser();
  const orgId = getUserOrganizationId(user);

  // Generate path with org isolation
  const fileName = `${orgId}/media/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false
    });

  if (error) throw error;
  return data;
}
```

### Get Public URL

```typescript
// For public buckets (avatars)
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`users/${userId}.webp`);

console.log(data.publicUrl);
// https://xxxxx.supabase.co/storage/v1/object/public/avatars/users/user-123.webp
```

### Get Signed URL (Private Buckets)

```typescript
// For private buckets (media, documents, receipts)
const { data, error } = await supabase.storage
  .from('media')
  .createSignedUrl(`${orgId}/media/file.webp`, 3600); // 1 hour expiry

console.log(data.signedUrl);
// https://xxxxx.supabase.co/storage/v1/object/sign/media/org-123/media/file.webp?token=...
```

### Download File

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .download(`${orgId}/transactions/${transactionId}/contract.pdf`);

if (data) {
  // data is a Blob
  const url = URL.createObjectURL(data);
  // Use url for download or display
}
```

### Delete File

```typescript
const { error } = await supabase.storage
  .from('media')
  .remove([`${orgId}/media/${fileName}`]);
```

---

## 🎯 Best Practices

### Naming Conventions

**✅ DO:**
```typescript
// Organization-isolated paths
`${orgId}/media/${timestamp}-${sanitizedName}.webp`
`${orgId}/transactions/${transactionId}/contract.pdf`

// Sanitize filenames
const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

// Use timestamps to avoid collisions
const timestamp = Date.now();
```

**❌ DON'T:**
```typescript
// Missing org isolation - data leak!
`media/${fileName}`

// Unsanitized user input - security risk!
`${orgId}/${userProvidedPath}/${fileName}`

// No timestamp - file collisions
`${orgId}/media/${fileName}`
```

### File Validation

**✅ DO:**
```typescript
// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Validate file size
const maxSize = 50 * 1024 * 1024; // 50MB
if (file.size > maxSize) {
  throw new Error('File too large');
}

// Optimize images
const optimized = await sharp(buffer)
  .resize(1920, 1080, { fit: 'inside' })
  .webp({ quality: 85 })
  .toBuffer();
```

**❌ DON'T:**
```typescript
// No validation - security risk!
await supabase.storage.from('media').upload(path, file);

// Trust client-provided MIME type
const contentType = file.type; // Can be spoofed!

// Store original large files
// Wastes storage and bandwidth
```

### Security

**✅ DO:**
```typescript
// Use service role key server-side only
'use server';
const supabase = createClient(..., SERVICE_ROLE_KEY!);

// Enforce org isolation in path
const path = `${user.organizationId}/${folder}/${file}`;

// Create signed URLs with expiry
const { data } = await supabase.storage
  .from('documents')
  .createSignedUrl(path, 3600); // 1 hour
```

**❌ DON'T:**
```typescript
// Service role key on client - NEVER!
const supabase = createClient(..., SERVICE_ROLE_KEY!);

// Let users specify paths - data leak!
const path = req.body.path; // User can access other orgs!

// Permanent public URLs for private data
const url = supabase.storage.from('documents').getPublicUrl(path);
```

---

## 🧪 Testing RLS Policies

### Test Upload Access

```sql
-- Set user context
SET request.jwt.claims = '{"sub": "user-123", "role": "authenticated"}';

-- Try to upload (should work for own org)
INSERT INTO storage.objects (bucket_id, name, owner)
VALUES ('media', 'org-456/media/test.webp', 'user-123');
-- Success if user-123 belongs to org-456

-- Try to upload to different org (should fail)
INSERT INTO storage.objects (bucket_id, name, owner)
VALUES ('media', 'org-999/media/test.webp', 'user-123');
-- Error: new row violates row-level security policy
```

### Test Download Access

```sql
-- Try to read own org's files (should work)
SELECT * FROM storage.objects
WHERE bucket_id = 'media'
AND name LIKE 'org-456/%';
-- Returns files if user-123 belongs to org-456

-- Try to read other org's files (should return empty)
SELECT * FROM storage.objects
WHERE bucket_id = 'media'
AND name LIKE 'org-999/%';
-- Returns 0 rows (RLS filters them out)
```

---

## 📊 Monitoring

### Check Bucket Usage

```sql
-- Total size per bucket
SELECT
  bucket_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::bigint) as total_bytes,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
GROUP BY bucket_id;
```

### Check Per-Organization Usage

```sql
-- Storage usage per organization
SELECT
  (string_to_array(name, '/'))[1] as organization_id,
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
WHERE bucket_id IN ('media', 'documents', 'receipts')
GROUP BY 1, 2
ORDER BY 1, 2;
```

---

## 🔧 Troubleshooting

### "Access denied" errors

**Cause:** RLS policy blocking access
**Solution:**
1. Check if user is authenticated
2. Verify path includes correct organization ID
3. Check RLS policy SQL
4. Test policy with SQL query

### Files not uploading

**Cause:** File size or type restriction
**Solution:**
1. Check file size vs bucket limit
2. Verify MIME type is allowed
3. Check server logs for errors
4. Ensure service role key is set

### Can't delete files

**Cause:** Missing DELETE policy
**Solution:**
```sql
-- Add delete policy
CREATE POLICY "bucket_delete_own_org"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'bucket_name' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text
    FROM users
    WHERE id = auth.uid()::text
  )
);
```

---

## 📚 Related Documentation

- **Supabase Setup:** `SUPABASE-SETUP.md` - Overall Supabase configuration
- **RLS Policies:** `RLS-POLICIES.md` - Complete RLS reference
- **Platform Upload:** `../../(platform)/lib/modules/content/media/upload.ts` - Upload implementation

---

**Last Updated:** 2025-10-06
**Buckets:** 4 (media, documents, receipts, avatars)
