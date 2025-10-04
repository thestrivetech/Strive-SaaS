# Supabase Storage Setup for Transaction Documents

**Date:** 2025-10-04
**Session:** Session 2 - Storage Infrastructure & File Management
**Status:** ⚠️ Manual Configuration Required

---

## 📋 Overview

This document provides step-by-step instructions for setting up Supabase Storage buckets and RLS policies for the Transaction Management Dashboard's document storage system.

**What you'll set up:**
- 2 storage buckets (encrypted & unencrypted)
- 8 RLS policies for organization-based access control
- Bucket configuration (file types, size limits)

---

## 🎯 Prerequisites

Before you begin, ensure you have:
- ✅ Supabase account with project access
- ✅ Admin access to Supabase Dashboard
- ✅ `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`
- ✅ `DOCUMENT_ENCRYPTION_KEY` in your `.env.local` ⚠️ **CRITICAL - See below!**
- ✅ Session 1 completed (database schema with transaction_loops table)

**⚠️ CRITICAL: Document Encryption Key**

The encryption key is **ALREADY SET** in your `.env.local` file from Session 2:

```bash
# Location: (platform)/.env.local
DOCUMENT_ENCRYPTION_KEY="<your-64-character-hex-key-here>"
```

**To view your actual key:**
```bash
# From (platform) directory:
grep DOCUMENT_ENCRYPTION_KEY .env.local
```

**IMPORTANT:**
- ❌ **NEVER commit** `.env.local` to version control
- ❌ **NEVER put real key in documentation files**
- ✅ **BACKUP this key securely** - lost key = lost documents!
- ✅ Key is 64 hex characters (32 bytes for AES-256)
- ✅ Used for encrypting all transaction documents at rest
- 🔄 If lost, you'll need to regenerate and re-encrypt all existing documents

---

## 📦 Part 1: Create Storage Buckets

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `bztkedvdjbxffpjxihtc`
3. Click **Storage** in the left sidebar

### Step 2: Create `transaction-documents` Bucket (Unencrypted)

**Purpose:** Legacy/testing bucket for unencrypted documents (development use)

1. Click **New Bucket**
2. Configure:
   - **Name:** `transaction-documents`
   - **Public:** ❌ **OFF** (private bucket)
   - **File size limit:** `10485760` (10MB in bytes)
   - **Allowed MIME types:** Leave empty (we handle this in code)
3. Click **Create Bucket**

### Step 3: Create `transaction-documents-encrypted` Bucket (Production)

**Purpose:** Production bucket for AES-256-GCM encrypted documents

1. Click **New Bucket**
2. Configure:
   - **Name:** `transaction-documents-encrypted`
   - **Public:** ❌ **OFF** (private bucket)
   - **File size limit:** `12582912` (12MB - allows for encryption overhead)
   - **Allowed MIME types:** Leave empty (encrypted files are `application/octet-stream`)
3. Click **Create Bucket**

---

## 🔒 Part 2: Configure RLS Policies

### Step 1: Enable RLS on Storage.Objects

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this SQL to enable RLS:

```sql
-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create RLS Policies for `transaction-documents`

Run this SQL to create policies for the unencrypted bucket:

```sql
-- ===================================================================
-- RLS POLICIES FOR: transaction-documents (Unencrypted Bucket)
-- ===================================================================

-- Policy 1: Users can view files from their organization's loops
CREATE POLICY "Users can view org transaction documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transaction-documents'
  AND (storage.foldername(name))[2] IN (
    -- Extract loopId from path: loops/{loopId}/documents/{filename}
    -- foldername returns array, [1]='loops', [2]=loopId
    SELECT id::text FROM transaction_loops
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy 2: Users can upload to their organization's loops
CREATE POLICY "Users can upload to org loops"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'transaction-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] IN (
    SELECT id::text FROM transaction_loops
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy 3: File uploader can update their files
CREATE POLICY "Uploaders can update their files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'transaction-documents'
  AND owner = auth.uid()
);

-- Policy 4: File uploader can delete their files
CREATE POLICY "Uploaders can delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'transaction-documents'
  AND owner = auth.uid()
);
```

### Step 3: Create RLS Policies for `transaction-documents-encrypted`

Run this SQL to create policies for the encrypted bucket:

```sql
-- ===================================================================
-- RLS POLICIES FOR: transaction-documents-encrypted (Production)
-- ===================================================================

-- Policy 1: Users can view encrypted files from their organization's loops
CREATE POLICY "Users can view encrypted org transaction documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transaction-documents-encrypted'
  AND (
    -- Allow access to loop documents
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM transaction_loops
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
    -- OR allow access to archived documents
    OR (
      (storage.foldername(name))[1] = 'archives'
      AND (storage.foldername(name))[2] IN (
        SELECT id::text FROM transaction_loops
        WHERE organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid()
        )
      )
    )
  )
);

-- Policy 2: Users can upload encrypted files to their organization's loops
CREATE POLICY "Users can upload encrypted to org loops"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'transaction-documents-encrypted'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] IN (
    SELECT id::text FROM transaction_loops
    WHERE organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy 3: File uploader can update their encrypted files
CREATE POLICY "Uploaders can update their encrypted files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'transaction-documents-encrypted'
  AND owner = auth.uid()
);

-- Policy 4: File uploader can delete their encrypted files
CREATE POLICY "Uploaders can delete their encrypted files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'transaction-documents-encrypted'
  AND owner = auth.uid()
);
```

---

## ✅ Part 3: Verify Setup

### Step 1: Check Buckets

1. Go to **Storage** → **Buckets**
2. Verify you see:
   - ✅ `transaction-documents` (Private)
   - ✅ `transaction-documents-encrypted` (Private)

### Step 2: Check RLS Policies

1. Go to **Authentication** → **Policies**
2. Look for table: `storage.objects`
3. Verify you see **8 policies**:
   - 4 for `transaction-documents`
   - 4 for `transaction-documents-encrypted`

### Step 3: Test Upload (Optional)

Create a test file in Supabase Dashboard:

1. Go to **Storage** → `transaction-documents-encrypted`
2. Create folder structure: `loops/test-loop/documents/`
3. Try uploading a test file
4. Verify file appears in correct location

---

## 🗂️ Storage Path Structure

### Unencrypted Bucket (`transaction-documents`)
```
transaction-documents/
├── loops/
│   ├── {loopId}/
│   │   └── documents/
│   │       ├── contract.pdf
│   │       ├── disclosure.pdf
│   │       └── ...
│   └── ...
```

### Encrypted Bucket (`transaction-documents-encrypted`)
```
transaction-documents-encrypted/
├── loops/
│   ├── {loopId}/
│   │   └── documents/
│   │       ├── contract_1704368400000_x7k9m2.pdf.enc
│   │       ├── disclosure_1704368401000_a2f8n1.pdf.enc
│   │       └── ...
│   └── ...
└── archives/
    └── {loopId}/
        └── 1704368400000_old_contract.pdf.enc
```

---

## 🔐 Security Considerations

### Organization Isolation
- ✅ RLS policies enforce organization-based access
- ✅ Users can only access files from their organization's loops
- ✅ Path structure includes `loopId` for filtering

### Encryption
- ✅ All production files encrypted with AES-256-GCM
- ✅ Encryption metadata stored in file metadata
- ✅ IV and auth tag unique per file

### File Validation
- ✅ 10MB size limit enforced
- ✅ MIME type whitelist (PDFs, images, Office docs)
- ✅ Filename sanitization prevents path traversal
- ✅ No executables or scripts allowed

---

## 🚨 Troubleshooting

### Issue: "bucket does not exist" error
**Solution:** Ensure bucket names exactly match:
- `transaction-documents`
- `transaction-documents-encrypted`

### Issue: RLS policy creation fails
**Solution:**
1. Verify `transaction_loops` table exists (Session 1)
2. Check `organization_members` table exists
3. Ensure RLS is enabled: `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`

### Issue: Cannot upload files
**Solution:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set in .env.local
2. Verify bucket is **private** (not public)
3. Check file path matches: `loops/{loopId}/documents/{filename}`

### Issue: Access denied when downloading
**Solution:**
1. Verify user is member of organization that owns the loop
2. Check RLS policies are active
3. Use signed URLs for client-side downloads

---

## 📚 Next Steps

After completing this setup:

1. ✅ **Test Upload** - Use storage service in Session 4
2. ✅ **Create Documents** - Link documents to transaction loops
3. ✅ **Generate Signed URLs** - Enable client downloads
4. ✅ **Implement Archiving** - Soft delete old documents

**Integration Point:** Session 4 (Document Upload API) will use these buckets and services.

---

## 📝 Notes

- **Production:** Use `transaction-documents-encrypted` bucket exclusively
- **Development:** Can use `transaction-documents` for testing
- **File Retention:** Implement archiving policy (90 days recommended)

## ⚠️ CRITICAL: Encryption Key Backup

**Your encryption key is stored in:** `(platform)/.env.local`

**To view your key:**
```bash
cd (platform)
grep DOCUMENT_ENCRYPTION_KEY .env.local
```

**YOU MUST:**
1. ✅ Backup this key in a secure password manager (1Password, Bitwarden, etc.)
2. ✅ Store a copy in your team's secure documentation (NOT in git!)
3. ✅ NEVER commit `.env.local` to git (already in `.gitignore`)
4. ✅ NEVER put the real key in any file that will be committed
5. ✅ Add to production environment variables in Vercel/deployment platform

**IF YOU LOSE THIS KEY:**
- ❌ All encrypted documents become **permanently inaccessible**
- ❌ No recovery is possible - encryption is unbreakable without the key
- 🔄 You'll need to regenerate the key and re-upload all documents

**Last Updated:** 2025-10-04
**Related Session:** Session 2 - Storage Infrastructure
**Status:** ⏳ Awaiting Manual Configuration
