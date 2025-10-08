# ContentPilot Troubleshooting Guide

**Module:** CMS & Marketing
**Version:** 1.0
**Last Updated:** 2025-10-07
**Audience:** Developers, Support Team, System Administrators

## Table of Contents

1. [Common User Issues](#common-user-issues)
2. [Technical Issues](#technical-issues)
3. [Database Issues](#database-issues)
4. [Performance Issues](#performance-issues)
5. [Security Issues](#security-issues)
6. [Integration Issues](#integration-issues)
7. [Debugging Procedures](#debugging-procedures)
8. [Emergency Procedures](#emergency-procedures)

---

## Common User Issues

### Issue: Content Not Publishing

**Symptoms:**
- "Publish" button is disabled/greyed out
- Click publish but content stays in draft status
- Error message: "Failed to publish content"

**Common Causes:**
1. Missing required fields (title, slug, content)
2. Insufficient permissions (USER role can't publish)
3. Duplicate slug (slug already exists)
4. Subscription tier doesn't include publishing (FREE tier)
5. Network connectivity issue

**Solutions:**

**Step 1: Check Required Fields**
```typescript
// Verify schema validation in browser console
// Open DevTools (F12) → Console → Look for validation errors

// Required fields from schema:
{
  title: string (min 1, max 200 chars)
  slug: string (min 1, max 200 chars)
  content: string (min 1 char)
  contentType: enum value
  status: enum value
}
```

**Step 2: Check User Permissions**
```sql
-- Check user's organization role
SELECT u.id, u.email, om.role
FROM users u
JOIN organization_members om ON u.id = om.user_id
WHERE u.id = '[user-id]';

-- Publishing requires ADMIN or OWNER role
-- If role is USER or MODERATOR, they can only create drafts
```

**Step 3: Check Slug Uniqueness**
```sql
-- Check for duplicate slug
SELECT id, title, slug, organization_id
FROM content_items
WHERE slug = '[the-slug]'
  AND organization_id = '[org-id]'
  AND deleted_at IS NULL;

-- If exists, suggest adding date suffix: 'article-title-2025'
```

**Step 4: Check Subscription Tier**
```sql
-- Verify organization subscription includes publishing
SELECT o.id, o.name, o.subscription_tier
FROM organizations o
WHERE o.id = '[org-id]';

-- ContentPilot requires GROWTH tier or above
-- FREE and STARTER tiers don't have access
```

**Step 5: Check Network Logs**
```javascript
// Browser DevTools → Network tab
// Look for failed POST request to /api/v1/content

// Common errors:
// 400 Bad Request: Validation failed
// 401 Unauthorized: Not logged in
// 403 Forbidden: Insufficient permissions
// 409 Conflict: Duplicate slug
// 500 Internal Server Error: Server issue
```

**Resolution Steps:**
1. If missing fields → Notify user which fields are required
2. If permissions issue → Explain role requirements, suggest contacting admin
3. If duplicate slug → Suggest changing slug or adding date suffix
4. If subscription issue → Prompt to upgrade plan
5. If network issue → Check server status, retry request

---

### Issue: Media Upload Failing

**Symptoms:**
- Upload button shows loading indefinitely
- Error message: "Upload failed"
- File appears in list but shows broken thumbnail
- Progress bar stuck at certain percentage

**Common Causes:**
1. File size exceeds limits (images 10MB, videos 50MB)
2. Unsupported file type
3. Network timeout (slow connection)
4. Supabase storage bucket permissions issue
5. Browser storage quota exceeded
6. File name contains special characters

**Solutions:**

**Step 1: Validate File Size and Type**
```typescript
// Check file before upload
const validateFile = (file: File) => {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024, // 50MB
    document: 10 * 1024 * 1024 // 10MB
  };

  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  // Get file type category
  const category = file.type.startsWith('image/') ? 'image'
    : file.type.startsWith('video/') ? 'video'
    : 'document';

  // Check size
  if (file.size > maxSizes[category]) {
    return { valid: false, error: `File too large. Max ${maxSizes[category] / 1024 / 1024}MB` };
  }

  // Check type
  if (!allowedTypes[category].includes(file.type)) {
    return { valid: false, error: `File type not supported: ${file.type}` };
  }

  return { valid: true };
};
```

**Step 2: Check Supabase Storage Bucket**
```sql
-- Verify storage bucket exists and is accessible
SELECT *
FROM storage.buckets
WHERE name = 'media-assets';

-- Check bucket RLS policies
SELECT *
FROM storage.policies
WHERE bucket_id = 'media-assets';

-- Verify user has upload permissions
-- Policy should allow INSERT for authenticated users in their org
```

**Step 3: Check Storage Quota**
```sql
-- Check organization storage usage
SELECT
  o.id,
  o.name,
  o.subscription_tier,
  COUNT(ma.id) as media_count,
  SUM(ma.file_size) as total_size_bytes,
  SUM(ma.file_size) / 1024 / 1024 / 1024 as total_size_gb
FROM organizations o
LEFT JOIN media_assets ma ON o.id = ma.organization_id
WHERE o.id = '[org-id]'
  AND ma.deleted_at IS NULL
GROUP BY o.id, o.name, o.subscription_tier;

-- Storage limits by tier:
-- GROWTH: 5GB
-- ELITE: 50GB
-- ENTERPRISE: Custom
```

**Step 4: Sanitize File Name**
```typescript
// Remove special characters from file name
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '-') // Replace special chars with dash
    .replace(/--+/g, '-') // Replace multiple dashes with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

// Example:
// "My Photo (2025).jpg" → "My-Photo-2025.jpg"
// "File & Document #1.pdf" → "File-Document-1.pdf"
```

**Step 5: Check Browser Network**
```javascript
// Monitor upload progress
const uploadWithProgress = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/v1/media/upload', {
    method: 'POST',
    body: formData,
    // Add timeout
    signal: AbortSignal.timeout(60000) // 60 second timeout
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Upload failed:', error);
    throw new Error(error.message);
  }

  return response.json();
};
```

**Resolution Steps:**
1. If file too large → Ask user to compress (provide tools: TinyPNG, HandBrake)
2. If wrong type → List supported types, suggest conversion tools
3. If storage full → Prompt to delete unused media or upgrade plan
4. If permissions → Check RLS policies, regenerate bucket policies
5. If network timeout → Suggest smaller file or better connection

---

### Issue: Search Not Finding Content

**Symptoms:**
- Search returns no results for known content
- Search only finds some content, not all
- Search is case-sensitive (shouldn't be)
- Recently created content not appearing in search

**Common Causes:**
1. Search index not updated (new content needs indexing)
2. Content is in draft status (not searchable by other users)
3. Content belongs to different organization (multi-tenancy)
4. Search terms too specific (no partial matching)
5. Content was soft-deleted

**Solutions:**

**Step 1: Verify Content Exists and is Searchable**
```sql
-- Check content exists and is published
SELECT
  id,
  title,
  slug,
  status,
  organization_id,
  created_at,
  deleted_at
FROM content_items
WHERE title ILIKE '%[search-term]%'
  AND organization_id = '[org-id]';

-- Check status:
-- DRAFT: Only visible to creator
-- REVIEW: Visible to ADMIN/MODERATOR
-- PUBLISHED: Visible to all in organization
-- ARCHIVED: Not in search results
```

**Step 2: Check Organization Isolation**
```sql
-- Verify user is searching in correct organization
SELECT
  ci.id,
  ci.title,
  ci.organization_id,
  o.name as org_name
FROM content_items ci
JOIN organizations o ON ci.organization_id = o.id
WHERE ci.title ILIKE '%[search-term]%'
  AND ci.deleted_at IS NULL;

-- User can only search content in their organization
-- Multi-org users: check which org context they're in
```

**Step 3: Test Search Query**
```typescript
// Check search implementation uses case-insensitive ILIKE
const searchContent = async (query: string, orgId: string) => {
  return await prisma.contentItem.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    }
  });
};

// Verify 'mode: insensitive' is set for case-insensitive search
```

**Step 4: Check Search Filters**
```typescript
// User may have filters applied that exclude results
// Check UI state for active filters:
{
  status: 'PUBLISHED', // May exclude DRAFT
  contentType: 'BLOG_POST', // May exclude other types
  category: 'NEWS', // May exclude other categories
  dateRange: { start: '2025-01-01', end: '2025-01-31' } // May exclude content outside range
}

// Solution: Clear all filters and search again
```

**Step 5: Check Recently Created Content**
```sql
-- Verify content was created successfully
SELECT id, title, slug, status, created_at
FROM content_items
WHERE organization_id = '[org-id]'
ORDER BY created_at DESC
LIMIT 20;

-- If created in last few seconds, may need page refresh
-- Check created_at timestamp matches expected time
```

**Resolution Steps:**
1. If content is draft → Explain visibility rules, suggest publishing
2. If wrong organization → Switch organization context
3. If filters active → Clear filters, try search again
4. If recently created → Refresh page, verify creation succeeded
5. If soft-deleted → Check deleted_at field, restore if needed

---

### Issue: Email Campaign Not Sending

**Symptoms:**
- Campaign stuck in "Scheduled" status
- Campaign shows "Sending" but never completes
- Recipients not receiving emails
- Error message: "Failed to send campaign"

**Common Causes:**
1. Sender email not verified
2. Scheduled time in the past
3. Empty recipient list
4. SMTP credentials invalid
5. Email quota exceeded (tier limits)
6. Email content triggers spam filters

**Solutions:**

**Step 1: Check Sender Email Verification**
```sql
-- Verify sender email is verified
SELECT
  ec.id,
  ec.subject,
  ec.sender_email,
  ec.status,
  ec.scheduled_at
FROM email_campaigns ec
WHERE ec.id = '[campaign-id]';

-- Check if sender_email is verified in organization settings
SELECT email, verified_at
FROM verified_emails
WHERE organization_id = '[org-id]'
  AND email = '[sender-email]';

-- If not verified, user needs to verify via confirmation email
```

**Step 2: Validate Scheduled Time**
```sql
-- Check scheduled time is in future
SELECT
  id,
  subject,
  scheduled_at,
  NOW() as current_time,
  scheduled_at > NOW() as is_future
FROM email_campaigns
WHERE id = '[campaign-id]';

-- If scheduled_at is in past, campaign won't send
-- User needs to reschedule to future time
```

**Step 3: Check Recipient List**
```sql
-- Verify campaign has recipients
SELECT
  ec.id,
  ec.subject,
  ec.recipient_count,
  COUNT(ecr.id) as actual_recipients
FROM email_campaigns ec
LEFT JOIN email_campaign_recipients ecr ON ec.id = ecr.campaign_id
WHERE ec.id = '[campaign-id]'
GROUP BY ec.id, ec.subject, ec.recipient_count;

-- If recipient_count = 0, campaign can't send
-- Check if segment/list has active contacts
```

**Step 4: Test SMTP Connection**
```typescript
// Test SMTP credentials
import nodemailer from 'nodemailer';

const testSMTP = async () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    await transporter.verify();
    console.log('✓ SMTP connection successful');
    return true;
  } catch (error) {
    console.error('✗ SMTP connection failed:', error);
    return false;
  }
};
```

**Step 5: Check Campaign Quota**
```sql
-- Check organization's campaign quota
SELECT
  o.id,
  o.subscription_tier,
  COUNT(ec.id) as campaigns_this_month
FROM organizations o
LEFT JOIN email_campaigns ec ON o.id = ec.organization_id
  AND ec.created_at >= DATE_TRUNC('month', NOW())
WHERE o.id = '[org-id]'
GROUP BY o.id, o.subscription_tier;

-- Campaign limits:
-- GROWTH: 5 campaigns per month
-- ELITE: Unlimited
-- ENTERPRISE: Custom
```

**Step 6: Check Spam Score**
```typescript
// Check email content for spam triggers
const spamTriggers = [
  'FREE!!!',
  'ACT NOW',
  'CLICK HERE',
  'LIMITED TIME',
  'GUARANTEED',
  'NO CREDIT CARD',
  'RISK FREE',
  '100% FREE',
  'EARN MONEY',
  'WEIGHT LOSS'
];

const checkSpamScore = (content: string, subject: string): number => {
  let score = 0;
  const allText = `${subject} ${content}`.toUpperCase();

  spamTriggers.forEach(trigger => {
    if (allText.includes(trigger)) score += 1;
  });

  // Check for excessive caps (>30% is spammy)
  const capsRatio = (allText.match(/[A-Z]/g) || []).length / allText.length;
  if (capsRatio > 0.3) score += 2;

  // Check for excessive exclamation marks
  const exclamations = (allText.match(/!/g) || []).length;
  if (exclamations > 3) score += 1;

  return score; // < 5 is good, >= 5 is likely spam
};
```

**Resolution Steps:**
1. If sender unverified → Send verification email, wait for confirmation
2. If time in past → Reschedule to future time (min 5 minutes ahead)
3. If no recipients → Check segment/list has contacts, rebuild list
4. If SMTP failed → Verify credentials, test connection, contact host
5. If quota exceeded → Wait for next month or upgrade plan
6. If spam score high → Rewrite content, reduce caps/exclamations, remove trigger words

---

## Technical Issues

### Issue: 500 Internal Server Error

**Symptoms:**
- API returns 500 status code
- Error message: "An unexpected error occurred"
- Browser console shows failed request
- Sentry/logging shows exception

**Common Causes:**
1. Unhandled exception in server code
2. Database connection failure
3. Missing environment variables
4. Invalid Prisma query (type mismatch)
5. Third-party API timeout (SMTP, storage)

**Debugging Steps:**

**Step 1: Check Vercel Function Logs**
```bash
# View real-time logs
vercel logs --follow

# Filter by function
vercel logs --follow --filter=/api/v1/content

# Search for specific error
vercel logs --filter="500" | grep "content"
```

**Step 2: Check Supabase Logs**
```
1. Open Supabase Dashboard
2. Navigate to Logs → Postgres Logs
3. Filter by timestamp of error
4. Look for:
   - Connection errors
   - Query errors
   - Permission denied errors
   - Timeout errors
```

**Step 3: Reproduce Locally**
```bash
cd (platform)

# Ensure all env vars are set
cat .env.local

# Run dev server
npm run dev

# Attempt same action that caused 500
# Check terminal for full error stack trace
```

**Step 4: Check Error Boundaries**
```typescript
// Verify error was caught and logged
// Check components/error-boundary.tsx
// Look for console.error or Sentry.captureException

// Common issues:
// - Async error not caught (missing try/catch)
// - Promise rejection not handled (.catch())
// - Server Action error not returned properly
```

**Step 5: Validate Prisma Query**
```typescript
// Check for type mismatches
// Example of common error:

// ❌ Wrong: Passing string where number expected
await prisma.contentItem.findUnique({
  where: { id: "123" } // id is Int, not String
});

// ✓ Correct:
await prisma.contentItem.findUnique({
  where: { id: 123 }
});

// ❌ Wrong: Accessing deleted relationship
const content = await prisma.contentItem.findUnique({
  where: { id: 123 }
  // Missing: include: { author: true }
});
console.log(content.author.name); // Error: Cannot read property 'name' of undefined

// ✓ Correct:
const content = await prisma.contentItem.findUnique({
  where: { id: 123 },
  include: { author: true }
});
if (content?.author) {
  console.log(content.author.name);
}
```

**Resolution Steps:**
1. Identify exact error from logs (stack trace)
2. Fix underlying issue (add validation, error handling)
3. Test fix locally
4. Deploy fix
5. Verify error resolved in production
6. Add test to prevent regression

---

### Issue: TypeScript Build Errors

**Symptoms:**
- `npm run build` fails
- Error: "Type 'X' is not assignable to type 'Y'"
- Error: "Property 'Z' does not exist on type 'W'"
- Vercel deployment fails

**Common Causes:**
1. Prisma types out of sync (`npx prisma generate` not run)
2. Importing wrong type
3. Missing null/undefined check
4. Using `any` type (bypasses type checking)
5. Third-party package type definitions missing

**Debugging Steps:**

**Step 1: Regenerate Prisma Types**
```bash
cd (platform)

# Regenerate Prisma client
npx prisma generate --schema=./prisma/schema.prisma

# Run type check
npx tsc --noEmit

# If errors persist, check schema changes
git diff prisma/schema.prisma
```

**Step 2: Check Import Paths**
```typescript
// ❌ Wrong: Importing from wrong location
import { ContentItem } from '@/lib/types'; // May not exist

// ✓ Correct: Import from Prisma
import { ContentItem } from '@prisma/client';

// ✓ Correct: Import extended type
import type { ContentItemWithAuthor } from '@/lib/modules/content/types';
```

**Step 3: Add Null Checks**
```typescript
// ❌ Wrong: Assuming property exists
const publishedDate = content.publishedAt.toISOString(); // Error if null

// ✓ Correct: Check for null/undefined
const publishedDate = content.publishedAt?.toISOString() ?? 'Not published';

// ✓ Correct: Type guard
if (content.publishedAt) {
  const publishedDate = content.publishedAt.toISOString();
}
```

**Step 4: Fix Explicit Any**
```typescript
// ❌ Wrong: Using any bypasses type safety
const processData = (data: any) => {
  return data.items.map(item => item.name); // No type checking
};

// ✓ Correct: Define proper types
type DataType = {
  items: Array<{ name: string; id: number }>;
};

const processData = (data: DataType) => {
  return data.items.map(item => item.name); // Fully typed
};
```

**Step 5: Install Type Definitions**
```bash
# If using third-party library without types
npm install --save-dev @types/[package-name]

# Example:
npm install --save-dev @types/node
npm install --save-dev @types/react
npm install --save-dev @types/react-dom
```

**Resolution Steps:**
1. Run `npx prisma generate` to sync types
2. Fix all TypeScript errors shown by `npx tsc --noEmit`
3. Add proper type annotations (no `any`)
4. Add null checks for optional properties
5. Verify build succeeds: `npm run build`

---

## Database Issues

### Issue: RLS Policy Blocking Queries

**Symptoms:**
- Queries return empty results (expected data)
- Error: "new row violates row-level security policy"
- Data visible in Supabase dashboard but not in app
- Prisma queries work in testing but not production

**Common Causes:**
1. RLS policy requires authentication context not provided
2. Policy checks organizationId but user has none
3. Policy role check fails (user has wrong role)
4. Prisma bypasses RLS (using service role key)
5. Missing organizationId in query WHERE clause

**Debugging Steps:**

**Step 1: Check RLS Policy**
```sql
-- View RLS policies for content_items table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'content_items';

-- Example policy:
-- CREATE POLICY "Users can view content in their organization"
-- ON content_items FOR SELECT
-- USING (organization_id = current_setting('app.organization_id')::uuid);
```

**Step 2: Test Query with RLS Context**
```sql
-- Set RLS context manually
SET app.organization_id = '[org-uuid]';
SET app.user_id = '[user-uuid]';

-- Run query
SELECT * FROM content_items
WHERE organization_id = '[org-uuid]';

-- If this works, RLS policy is correct
-- Issue is context not being set in application
```

**Step 3: Check Prisma Context**
```typescript
// Verify Prisma middleware sets RLS context
// File: lib/database/prisma-middleware.ts

import { prisma } from './prisma';

export const setTenantContext = async (context: {
  organizationId: string;
  userId: string;
}) => {
  await prisma.$executeRaw`SELECT set_config('app.organization_id', ${context.organizationId}, true)`;
  await prisma.$executeRaw`SELECT set_config('app.user_id', ${context.userId}, true)`;
};

// Usage in Server Action:
'use server';
export async function getContent() {
  const user = await getCurrentUser();
  await setTenantContext({
    organizationId: user.organizationId,
    userId: user.id
  });

  return await prisma.contentItem.findMany();
}
```

**Step 4: Verify WHERE Clause**
```typescript
// ❌ Wrong: Missing organizationId filter
const content = await prisma.contentItem.findMany({
  where: {
    status: 'PUBLISHED'
  }
});
// RLS may block if organizationId not set in context

// ✓ Correct: Explicit organizationId filter
const content = await prisma.contentItem.findMany({
  where: {
    organizationId: user.organizationId,
    status: 'PUBLISHED'
  }
});
// Works regardless of RLS context
```

**Step 5: Check Database Connection**
```bash
# Verify using correct DATABASE_URL
echo $DATABASE_URL

# Should be Supabase connection string with pooling:
# postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true

# NOT service role (which bypasses RLS):
# postgresql://postgres:[SERVICE-ROLE-KEY]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Resolution Steps:**
1. Add `organizationId` to all WHERE clauses (application-level filtering)
2. Use Prisma middleware to set RLS context before queries
3. Verify RLS policies allow expected operations
4. Test queries in Supabase SQL editor with context set
5. Document which approach is used (RLS vs app-level filtering)

---

### Issue: Slow Database Queries

**Symptoms:**
- API response time > 2 seconds
- Database CPU usage high
- Queries timeout
- Users report slow page loads

**Common Causes:**
1. Missing database indexes
2. N+1 query problem (sequential queries in loop)
3. Full table scan (WHERE clause not indexed)
4. Large JSON columns loaded unnecessarily
5. Complex JOIN without optimization

**Debugging Steps:**

**Step 1: Identify Slow Queries**
```sql
-- View slow queries (requires pg_stat_statements extension)
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%content_items%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Look for queries with:
-- - mean_exec_time > 1000ms (1 second)
-- - calls very high but slow (inefficient common query)
```

**Step 2: Analyze Query Plan**
```sql
-- Run EXPLAIN ANALYZE on slow query
EXPLAIN ANALYZE
SELECT ci.*, u.name as author_name
FROM content_items ci
JOIN users u ON ci.author_id = u.id
WHERE ci.organization_id = '[org-id]'
  AND ci.status = 'PUBLISHED'
ORDER BY ci.published_at DESC
LIMIT 20;

-- Look for:
-- - "Seq Scan" (should be "Index Scan")
-- - "rows=10000" but only need 20 (inefficient)
-- - High "actual time" values
```

**Step 3: Check Missing Indexes**
```sql
-- Indexes should exist for:
-- 1. All foreign keys
-- 2. Frequently filtered columns (status, organizationId)
-- 3. Sort columns (createdAt, publishedAt)

-- Check existing indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'content_items';

-- Create missing indexes:
CREATE INDEX CONCURRENTLY idx_content_items_org_status
  ON content_items(organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_content_items_published_at
  ON content_items(published_at DESC)
  WHERE status = 'PUBLISHED' AND deleted_at IS NULL;
```

**Step 4: Fix N+1 Queries**
```typescript
// ❌ Wrong: N+1 query (queries in loop)
const content = await prisma.contentItem.findMany();
for (const item of content) {
  const author = await prisma.user.findUnique({
    where: { id: item.authorId }
  });
  item.author = author;
}
// Total queries: 1 + N (where N = number of content items)

// ✓ Correct: Single query with include
const content = await prisma.contentItem.findMany({
  include: {
    author: {
      select: { id: true, name: true, email: true }
    }
  }
});
// Total queries: 1
```

**Step 5: Optimize Large Column Loads**
```typescript
// ❌ Wrong: Loading huge JSON content unnecessarily
const contentList = await prisma.contentItem.findMany({
  // Loads ALL columns including 10MB+ content field
});

// ✓ Correct: Select only needed columns
const contentList = await prisma.contentItem.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    excerpt: true, // Small text
    status: true,
    publishedAt: true,
    // Don't load: content (huge JSON field)
  }
});
```

**Resolution Steps:**
1. Add missing database indexes (see Session 8b index list)
2. Use Prisma `include` to avoid N+1 queries
3. Use `select` to load only needed columns
4. Add `WHERE deleted_at IS NULL` to leverage partial indexes
5. Monitor query performance after changes

---

## Performance Issues

### Issue: Slow Page Load Times

**Symptoms:**
- Dashboard takes > 5 seconds to load
- Content editor slow to open
- Media library hangs
- Users report "app is slow"

**Common Causes:**
1. Too much data loaded on initial page load
2. Missing pagination (loading all content at once)
3. Large images not optimized
4. JavaScript bundle too large
5. No caching (same data fetched repeatedly)

**Debugging Steps:**

**Step 1: Check Network Waterfall**
```
1. Open DevTools (F12)
2. Network tab → Reload page
3. Look for:
   - Slow requests (> 1s)
   - Large payloads (> 1MB)
   - Sequential requests (should be parallel)
   - Duplicate requests (should be cached)
```

**Step 2: Analyze Bundle Size**
```bash
cd (platform)

# Build with bundle analyzer
npm run build

# Look for:
# - "First Load JS" on each page
# - Should be < 500KB for fast load
# - Identify large dependencies
```

**Step 3: Check Data Fetching**
```typescript
// ❌ Wrong: Loading all content (could be 1000s of items)
const content = await prisma.contentItem.findMany({
  where: { organizationId }
});

// ✓ Correct: Paginated with limit
const content = await prisma.contentItem.findMany({
  where: { organizationId },
  take: 20, // Page size
  skip: (page - 1) * 20, // Offset
  orderBy: { createdAt: 'desc' }
});
```

**Step 4: Optimize Images**
```typescript
// ❌ Wrong: Using regular <img> tag
<img src="/media/large-image.jpg" alt="Hero" />

// ✓ Correct: Using Next.js Image component
import Image from 'next/image';

<Image
  src="/media/large-image.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority // For above-fold images
  placeholder="blur" // Show blur while loading
/>
// Automatically optimizes, lazy loads, serves WebP
```

**Step 5: Add Caching**
```typescript
// ❌ Wrong: No caching (refetches same data)
export async function getContentList() {
  return await prisma.contentItem.findMany();
}

// ✓ Correct: Add Next.js caching
export async function getContentList() {
  return await prisma.contentItem.findMany();
}

// Use React Query for client-side caching
const { data, isLoading } = useQuery({
  queryKey: ['content', organizationId],
  queryFn: () => getContentList(organizationId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Resolution Steps:**
1. Add pagination to all lists (20 items per page)
2. Use `select` to load only needed fields
3. Use Next.js Image component for all images
4. Add caching with React Query
5. Code-split heavy components (dynamic imports)

---

## Security Issues

### Issue: Unauthorized Access to Content

**Symptoms:**
- User can view content from another organization
- User can edit content they shouldn't have access to
- User can delete content without proper role
- API returns data from wrong organization

**Common Causes:**
1. Missing organizationId check in query
2. RLS policy not enforced (Prisma bypasses RLS)
3. Role-based access control (RBAC) not checked
4. Client-side authorization only (easily bypassed)
5. Session/token validation missing

**Debugging Steps:**

**Step 1: Verify Query Isolation**
```typescript
// Check all queries include organizationId filter
// Search codebase for potential issues:

// ❌ Wrong: No organizationId filter
await prisma.contentItem.findUnique({
  where: { id: contentId }
});
// Could return content from any organization!

// ✓ Correct: Always filter by organizationId
await prisma.contentItem.findUnique({
  where: {
    id: contentId,
    organizationId: user.organizationId
  }
});
```

**Step 2: Check RBAC Enforcement**
```typescript
// Every Server Action should check authentication
'use server';

export async function deleteContent(id: number) {
  // ❌ Wrong: No auth check
  await prisma.contentItem.delete({ where: { id } });

  // ✓ Correct: Require auth + role check
  const user = await requireAuth({
    minimumRole: 'ADMIN' // Only ADMIN can delete
  });

  const content = await prisma.contentItem.findUnique({
    where: {
      id,
      organizationId: user.organizationId // Org isolation
    }
  });

  if (!content) {
    throw new Error('Content not found');
  }

  await prisma.contentItem.delete({ where: { id } });
}
```

**Step 3: Test Authorization**
```typescript
// Create test cases for unauthorized access attempts

describe('Content Security', () => {
  it('should not allow USER to delete content', async () => {
    // User with USER role tries to delete
    await expect(
      deleteContent(contentId)
    ).rejects.toThrow('Insufficient permissions');
  });

  it('should not return content from other organizations', async () => {
    // User in Org A tries to access content from Org B
    const content = await getContent(orgBContentId);
    expect(content).toBeNull();
  });
});
```

**Step 4: Audit API Endpoints**
```bash
# Search for API routes without auth
grep -r "export async function" app/api --include="*.ts" -A 5 | grep -L "requireAuth"

# Search for Server Actions without auth
grep -r "'use server'" lib --include="*.ts" -A 5 | grep -L "requireAuth"
```

**Step 5: Check Session Validation**
```typescript
// Verify session is validated on every request
// File: lib/auth/session.ts

export async function getCurrentUser() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Get user with organization
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organizationMembers: {
        where: { deletedAt: null },
        include: { organization: true }
      }
    }
  });

  if (!user || !user.organizationMembers.length) {
    throw new Error('No organization membership');
  }

  return user;
}
```

**Resolution Steps:**
1. Add `requireAuth()` to all Server Actions
2. Add `organizationId` filter to all queries
3. Add role checks for sensitive operations (delete, publish)
4. Add tests for unauthorized access scenarios
5. Run security audit: `npm test -- security`

---

## Integration Issues

### Issue: Supabase Storage Upload Failing

**Symptoms:**
- Upload returns error: "Bucket not found"
- Upload succeeds but file not visible
- Error: "Access denied"
- File uploaded but can't be downloaded

**Common Causes:**
1. Storage bucket doesn't exist
2. RLS policies too restrictive
3. File path includes invalid characters
4. Bucket is public but should be private (or vice versa)
5. Service role key not configured

**Debugging Steps:**

**Step 1: Verify Bucket Exists**
```sql
-- Check storage buckets
SELECT id, name, public, created_at
FROM storage.buckets;

-- Should include:
-- - media-assets (public: false)
```

**Step 2: Check Bucket RLS Policies**
```sql
-- View storage policies
SELECT *
FROM storage.policies
WHERE bucket_id = 'media-assets';

-- Required policies:
-- 1. Allow INSERT for authenticated users in their org
-- 2. Allow SELECT for authenticated users in their org
-- 3. Allow DELETE for ADMIN users in their org
```

**Step 3: Test Upload with Service Role**
```typescript
// Test upload using service role (bypasses RLS)
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Admin key
);

const { data, error } = await supabaseAdmin.storage
  .from('media-assets')
  .upload('test/test.jpg', file);

if (error) {
  console.error('Upload failed:', error);
} else {
  console.log('Upload succeeded:', data);
}
// If this works, issue is RLS policy, not bucket config
```

**Step 4: Validate File Path**
```typescript
// Check file path follows pattern: orgId/folder/filename
const getStoragePath = (orgId: string, fileName: string, folder?: string): string => {
  // Sanitize file name
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/--+/g, '-')
    .toLowerCase();

  // Build path
  const path = folder
    ? `${orgId}/${folder}/${sanitized}`
    : `${orgId}/${sanitized}`;

  return path;
};

// ❌ Wrong: Missing orgId (can't enforce RLS)
const path = 'uploads/image.jpg';

// ✓ Correct: Includes orgId for isolation
const path = 'org-uuid/uploads/image.jpg';
```

**Step 5: Check Public vs Private**
```typescript
// For private files (most content):
const { data } = await supabase.storage
  .from('media-assets')
  .upload(path, file);

// Get signed URL (temporary access)
const { data: { signedUrl } } = await supabase.storage
  .from('media-assets')
  .createSignedUrl(path, 3600); // 1 hour expiry

// For public files (rare):
const { data } = await supabase.storage
  .from('media-assets')
  .upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('media-assets')
  .getPublicUrl(path);
```

**Resolution Steps:**
1. Create missing storage buckets (see docs/storage-setup.md)
2. Add/update RLS policies for bucket access
3. Use service role for admin operations
4. Validate file paths include organizationId
5. Use signed URLs for private files

---

## Debugging Procedures

### General Debugging Workflow

**Step 1: Reproduce the Issue**
```
1. Get exact steps from user:
   - What were you doing?
   - What did you expect to happen?
   - What actually happened?
   - Can you show me (screenshot/video)?

2. Try to reproduce locally:
   - Same browser/device
   - Same data/organization
   - Same user role
   - Same network conditions
```

**Step 2: Gather Information**
```typescript
// Enable debug logging
// Add to .env.local:
DEBUG=* // All debug logs
DEBUG=prisma:* // Prisma queries only
DEBUG=next:* // Next.js logs only

// Check logs:
// - Browser console (F12)
// - Vercel function logs
// - Supabase logs
// - Sentry (if configured)
```

**Step 3: Isolate the Problem**
```
1. Check if issue is:
   - Frontend only (UI bug)
   - Backend only (API error)
   - Database (query issue)
   - Network (connectivity)
   - Third-party (SMTP, storage)

2. Test in isolation:
   - Remove all code except failing part
   - Test with minimal data
   - Test with different user/org
   - Test in different environment
```

**Step 4: Form Hypothesis**
```
Based on evidence, what do you think is wrong?
- Missing validation?
- Wrong permissions?
- Race condition?
- Data corruption?

Test hypothesis:
- Add logging to confirm theory
- Test edge cases
- Check assumptions
```

**Step 5: Implement Fix**
```
1. Create fix (smallest change possible)
2. Test fix locally
3. Add test to prevent regression
4. Document fix (code comments)
5. Deploy to staging
6. Verify fix in staging
7. Deploy to production
8. Monitor for similar issues
```

---

## Emergency Procedures

### Production Outage

**Severity: P0 - Critical**

**Immediate Actions (< 5 minutes):**

1. **Acknowledge Incident**
   ```
   - Post in #incidents Slack channel
   - Update status page: status.strivetech.ai
   - Notify engineering team
   ```

2. **Assess Impact**
   ```
   - How many users affected?
   - What functionality broken?
   - Is data at risk?
   - Can users work around it?
   ```

3. **Decide: Fix Forward or Rollback?**
   ```
   Fix Forward if:
   - Issue is well understood
   - Fix is simple (1-line change)
   - No risk of making it worse

   Rollback if:
   - Issue is unclear
   - Fix requires investigation
   - Multiple systems affected
   ```

**Rollback Procedure (< 10 minutes):**

```bash
# Option 1: Vercel Dashboard
# 1. Go to Deployments
# 2. Find last known good deployment
# 3. Click "Promote to Production"

# Option 2: Vercel CLI
vercel rollback

# Option 3: Git revert
git revert HEAD
git push origin main
# Vercel auto-deploys
```

**Communication Template:**

```
Status Update: [Time]

Issue: [Brief description]
Impact: [Who/what is affected]
Action: [What we're doing]
ETA: [When we expect resolution]

We'll update in 15 minutes or when resolved.
```

**Post-Incident:**

1. Write incident report
2. Root cause analysis
3. Add monitoring/alerts
4. Improve runbooks
5. Schedule post-mortem

---

**Document Version**: 1.0
**Last Updated**: 2025-10-07
**Maintained By**: Engineering & Support Teams
