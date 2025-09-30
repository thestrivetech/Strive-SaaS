# Session 11 Tasks - Complete Phase 3 to 100%

**Goal:** Fix TypeScript errors, implement file attachments, complete testing
**Starting Point:** Phase 3 - 85% Complete
**Estimated Duration:** 3 hours

---

## Current Status (From Session 10)

### ✅ Already Completed
- **Real-Time Integration**: Task list with live updates, connection status indicator
- **Bulk Operations**: Full UI integration with selection, actions, toast notifications
- **Notifications System**: Complete backend + frontend + real-time updates
  - Schemas, queries, actions (382 lines)
  - NotificationDropdown component (286 lines)
  - Integrated in topbar across all 6 platform layouts
- **CRM Type Fix**: React Hook Form types resolved in create-customer-dialog

### 🔧 Carry-Over Tasks from Session 10
1. Fix TypeScript errors in projects/tasks modules (416 errors remaining)
2. File attachments system (not started)
3. Add loading states to bulk operations
4. Create error boundary component
5. E2E testing
6. Multi-user collaboration testing
7. Performance check
8. Security audit

---

## Session 11 Primary Objectives

### Priority 1: TypeScript Error Resolution (45 min)

#### 1. Fix Project Module Schemas
**File:** `lib/modules/projects/schemas.ts`

**Implementation Requirements:**
- Remove `.default()` from `status` field
- Remove `.default()` from `priority` field
- Pattern: Same as CRM fix in Session 10

**Before:**
```typescript
export const createProjectSchema = z.object({
  // ...
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  // ...
});
```

**After:**
```typescript
export const createProjectSchema = z.object({
  // ...
  status: z.nativeEnum(ProjectStatus),
  priority: z.nativeEnum(Priority),
  // ...
});
```

**Why:** React Hook Form expects these as required fields, not optional

**Affected Files:**
- `components/features/projects/create-project-dialog.tsx` - Will resolve ~8 errors
- `components/features/projects/edit-project-dialog.tsx` - Will resolve ~8 errors

**Estimated Lines:** 2 lines modified

**Validation:**
1. Run `npx tsc --noEmit | grep "create-project-dialog"`
2. Should see 0 errors
3. Test create project form - defaults should work via `defaultValues`

---

#### 2. Fix Task Module Schemas
**File:** `lib/modules/tasks/schemas.ts`

**Implementation Requirements:**
- Remove `.default()` from `status` field
- Remove `.default()` from `priority` field
- Remove `.default()` from `tags` field

**Before:**
```typescript
export const createTaskSchema = z.object({
  // ...
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  tags: z.array(z.string()).default([]),
  // ...
});
```

**After:**
```typescript
export const createTaskSchema = z.object({
  // ...
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(Priority),
  tags: z.array(z.string()),
  // ...
});
```

**Affected Files:**
- `components/features/tasks/create-task-dialog.tsx` - Will resolve ~8 errors
- `components/features/tasks/edit-task-dialog.tsx` - Will resolve ~8 errors

**Estimated Lines:** 3 lines modified

**Validation:**
1. Test create task form - status, priority, tags should have defaults
2. Test edit task form - existing values should populate

---

#### 3. Install Missing UI Components
**Command:**
```bash
npx shadcn-ui@latest add alert-dialog
```

**Affected Files:**
- `components/features/crm/delete-customer-dialog.tsx` - Fixes import error
- `components/features/projects/delete-project-dialog.tsx` - Fixes import error

**Why:** Delete dialogs use AlertDialog but component not installed

**Estimated Time:** 5 minutes

---

#### 4. Fix ProjectPriority Import
**Files to Fix:**
- `components/features/projects/create-project-dialog.tsx`
- `components/features/projects/edit-project-dialog.tsx`

**Change:**
```typescript
// Before
import { ProjectStatus, ProjectPriority } from '@prisma/client';

// After
import { ProjectStatus, Priority } from '@prisma/client';
```

**Why:** Prisma schema uses `Priority` enum (shared between tasks and projects), not `ProjectPriority`

**Estimated Lines:** 2 lines (1 per file)

---

#### 5. Final TypeScript Validation
**Commands:**
```bash
npx tsc --noEmit 2>&1 | grep -v "app/(web)/"
```

**Success Criteria:**
- 0 errors in platform code (`components/`, `lib/`, `app/(platform)/`)
- Legacy `app/(web)/` errors ignored
- Build should pass: `npm run build`

**If Errors Remain:**
1. Check if form `defaultValues` include all required fields
2. Verify Zod schema exports correct type
3. Compare with working CRM example

**Estimated Time:** 5 minutes

---

### Priority 2: File Attachments System (60 min)

#### 1. Create File Upload Component
**File:** `components/ui/file-upload.tsx` (~150 lines)

**Implementation Requirements:**
- Drag & drop zone with visual feedback
- File input fallback for click-to-upload
- Multiple file support
- File validation:
  - Max size: 10MB per file
  - Allowed types: images (jpg, png, gif, webp), documents (pdf, docx, xlsx), text (txt, csv)
- Preview thumbnails for images
- Progress bar during upload
- Error handling with toast notifications

**Why Client Component:** Browser File API, drag & drop events, useState for files

**Component Interface:**
```typescript
interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.docx', '.xlsx'],
  disabled = false,
}: FileUploadProps)
```

**Features:**
1. Drag & drop zone:
   ```tsx
   <div
     onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
     onDragLeave={() => setIsDragging(false)}
     onDrop={handleDrop}
     className={isDragging ? 'border-primary' : 'border-muted'}
   >
     <Upload className="h-8 w-8" />
     <p>Drag & drop files here, or click to browse</p>
   </div>
   ```

2. File validation:
   ```typescript
   const validateFile = (file: File): string | null => {
     if (file.size > maxSizeMB * 1024 * 1024) {
       return `File ${file.name} exceeds ${maxSizeMB}MB`;
     }
     // ... type validation
     return null;
   };
   ```

3. Preview thumbnails:
   ```tsx
   {files.map((file) => (
     <div key={file.name} className="relative">
       {file.type.startsWith('image/') ? (
         <img src={URL.createObjectURL(file)} alt={file.name} />
       ) : (
         <FileIcon className="h-12 w-12" />
       )}
       <button onClick={() => removeFile(file.name)}>
         <X className="h-4 w-4" />
       </button>
     </div>
   ))}
   ```

**Estimated Lines:** ~150 lines

---

#### 2. Create Attachments Module
**Files to Create:**

**2a. Attachment Schemas** (`lib/modules/attachments/schemas.ts`, ~40 lines)
```typescript
export const uploadAttachmentSchema = z.object({
  entityType: z.enum(['task', 'project', 'customer']),
  entityId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(10 * 1024 * 1024), // 10MB
  mimeType: z.string(),
  organizationId: z.string().uuid(),
});

export const deleteAttachmentSchema = z.object({
  attachmentId: z.string().uuid(),
});

export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;
export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>;
```

**2b. Attachment Actions** (`lib/modules/attachments/actions.ts`, ~150 lines)
```typescript
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Upload file to Supabase Storage and create attachment record
 */
export async function uploadAttachment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const file = formData.get('file') as File;
  const entityType = formData.get('entityType') as string;
  const entityId = formData.get('entityId') as string;

  // Validate
  const validated = uploadAttachmentSchema.parse({
    entityType,
    entityId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    organizationId: user.organizationId,
  });

  // Upload to Supabase Storage
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() }
  );

  const filePath = `${user.organizationId}/${entityType}/${entityId}/${Date.now()}_${file.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(filePath, file);

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Create attachment record
  const attachment = await prisma.attachment.create({
    data: {
      fileName: validated.fileName,
      fileSize: validated.fileSize,
      mimeType: validated.mimeType,
      filePath: uploadData.path,
      entityType: validated.entityType,
      entityId: validated.entityId,
      organizationId: user.organizationId,
      uploadedById: user.id,
    },
  });

  revalidatePath('/');
  return { success: true, data: attachment };
}

/**
 * Delete attachment file and record
 */
export async function deleteAttachment(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const validated = deleteAttachmentSchema.parse(input);

  // Verify ownership
  const attachment = await prisma.attachment.findFirst({
    where: {
      id: validated.attachmentId,
      organizationId: user.organizationId,
    },
  });

  if (!attachment) return { success: false, error: 'Not found' };

  // Delete from Supabase Storage
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() }
  );

  await supabase.storage.from('attachments').remove([attachment.filePath]);

  // Delete record
  await prisma.attachment.delete({
    where: { id: validated.attachmentId },
  });

  revalidatePath('/');
  return { success: true };
}

/**
 * Get download URL for attachment
 */
export async function getAttachmentUrl(attachmentId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      organizationId: user.organizationId,
    },
  });

  if (!attachment) return { success: false, error: 'Not found' };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() }
  );

  const { data } = supabase.storage
    .from('attachments')
    .getPublicUrl(attachment.filePath);

  return { success: true, data: { url: data.publicUrl, fileName: attachment.fileName } };
}
```

**Security Considerations:**
- Multi-tenancy enforced via organizationId
- File size limits enforced
- Storage path includes organization ID (isolation)
- Download URLs verified for ownership

**Estimated Lines:** ~190 lines total

---

#### 3. Create Task Attachments Component
**File:** `components/features/tasks/task-attachments.tsx` (~100 lines)

**Implementation Requirements:**
- Display list of attachments with icons
- Show file metadata (name, size, upload date, uploader)
- Download button for each file
- Delete button with confirmation
- Upload new files section

**Why Client Component:** File upload, delete actions, useState

**Component Interface:**
```typescript
interface TaskAttachmentsProps {
  taskId: string;
  initialAttachments: Attachment[];
}

export function TaskAttachments({ taskId, initialAttachments }: TaskAttachmentsProps)
```

**Features:**
1. File list with icons:
   ```tsx
   {attachments.map((att) => (
     <div key={att.id} className="flex items-center gap-3 p-3 border rounded">
       {getFileIcon(att.mimeType)}
       <div className="flex-1">
         <p className="font-medium">{att.fileName}</p>
         <p className="text-xs text-muted-foreground">
           {formatFileSize(att.fileSize)} • {formatDate(att.createdAt)}
         </p>
       </div>
       <Button variant="ghost" size="sm" onClick={() => handleDownload(att.id)}>
         <Download className="h-4 w-4" />
       </Button>
       <Button variant="ghost" size="sm" onClick={() => handleDelete(att.id)}>
         <Trash2 className="h-4 w-4 text-destructive" />
       </Button>
     </div>
   ))}
   ```

2. Upload section:
   ```tsx
   <FileUpload
     onFilesSelected={handleUpload}
     maxFiles={5}
     maxSizeMB={10}
   />
   ```

**Estimated Lines:** ~100 lines

---

#### 4. Add Attachments to Task Detail Page
**File:** `app/(platform)/projects/[projectId]/tasks/[taskId]/page.tsx` (if exists) or modify task modal

**Changes:**
1. Import TaskAttachments component
2. Fetch attachments in server component
3. Add attachments section to UI

**Estimated Lines:** ~20 lines

---

### Priority 3: Polish & Testing (45 min)

#### 1. Add Loading States to Bulk Operations
**File:** `components/ui/bulk-selector.tsx`

**Changes:**
- Add `isLoading` prop to BulkSelector
- Show loading spinner in "Bulk Actions" button
- Disable actions dropdown during loading

**Before:**
```tsx
<Button variant="outline" size="sm">
  Bulk Actions
  <ChevronDown className="ml-2 h-4 w-4" />
</Button>
```

**After:**
```tsx
<Button variant="outline" size="sm" disabled={isLoading}>
  {isLoading ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : null}
  Bulk Actions
  <ChevronDown className="ml-2 h-4 w-4" />
</Button>
```

**Update TaskList:**
```tsx
<BulkSelector
  items={tasks}
  actions={bulkActions}
  onBulkAction={handleBulkAction}
  isLoading={isBulkProcessing}  // Add this prop
/>
```

**Estimated Lines:** ~10 lines

**Estimated Time:** 10 minutes

---

#### 2. Create Error Boundary Component
**File:** `components/shared/error-boundary.tsx` (~80 lines)

**Implementation:**
```typescript
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // TODO: Send to error logging service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded text-xs font-mono overflow-auto">
                  {this.state.error.message}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  variant="outline"
                  className="flex-1"
                >
                  Try again
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                >
                  Go to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage:**
```tsx
// In layout.tsx or page.tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Estimated Lines:** ~80 lines

**Estimated Time:** 20 minutes

---

#### 3. Manual E2E Testing Checklist
**Estimated Time:** 15 minutes

**CRM Testing:**
- [ ] Create customer → verify in list
- [ ] Edit customer → verify changes saved
- [ ] Delete customer → verify removed from list
- [ ] Search customers → verify results filter
- [ ] Filter by status → verify correct results
- [ ] Export to CSV → verify file downloads

**Projects Testing:**
- [ ] Create project → verify in list
- [ ] Edit project → verify changes saved
- [ ] Delete project → verify removed from list
- [ ] Filter projects → verify correct results
- [ ] View project detail → verify all data shown

**Tasks Testing:**
- [ ] Create task → verify in list
- [ ] Edit task → verify changes saved
- [ ] Delete task → verify removed from list
- [ ] Change task status → verify status updates
- [ ] Bulk select tasks → verify selection UI
- [ ] Bulk update status → verify all updated
- [ ] Bulk delete → verify all removed
- [ ] Real-time updates → verify live sync (2 windows)

**Notifications Testing:**
- [ ] View notifications → verify list appears
- [ ] Mark notification as read → verify unread count decreases
- [ ] Mark all as read → verify all marked
- [ ] Delete notification → verify removed
- [ ] Real-time notification → verify appears instantly

**File Attachments Testing:**
- [ ] Upload file to task → verify appears in list
- [ ] Download file → verify correct file
- [ ] Delete file → verify removed
- [ ] Upload invalid file → verify error message
- [ ] Upload oversized file → verify error message

---

### Priority 4: Validation (30 min)

#### 1. Performance Check
**Commands:**
```bash
npm run build
npm run start
```

**Chrome DevTools Lighthouse:**
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Desktop" + "Performance"
4. Click "Analyze page load"

**Success Criteria:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Performance Score: > 90

**If Issues Found:**
- Check bundle size: `npm run build` shows sizes
- Look for large components that should be code-split
- Check for unnecessary re-renders
- Verify images are optimized

**Estimated Time:** 10 minutes

---

#### 2. Security Audit Checklist
**Estimated Time:** 10 minutes

**Input Validation:**
- [ ] All server actions validate input with Zod
- [ ] No raw SQL queries (only Prisma)
- [ ] No `dangerouslySetInnerHTML` in components
- [ ] File uploads validate size and type

**Authentication & Authorization:**
- [ ] All server actions check `getCurrentUser()`
- [ ] All queries filter by `organizationId`
- [ ] Resource ownership verified before mutations
- [ ] Middleware protects platform routes

**Environment Variables:**
- [ ] No API keys in client code
- [ ] `NEXT_PUBLIC_` prefix only for safe variables
- [ ] `.env.local` in `.gitignore`
- [ ] Supabase service role key never exposed

**Rate Limiting:**
- [ ] AI requests limited per user/org
- [ ] Bulk operations limited to 100 items
- [ ] File uploads limited to 10MB

**Activity Logging:**
- [ ] All mutations log to `activityLog` table
- [ ] Bulk operations include count in log
- [ ] Logs include userId, organizationId

---

#### 3. Final TypeScript Validation
**Commands:**
```bash
npx tsc --noEmit 2>&1 | grep -v "app/(web)/"
npm run lint
```

**Success Criteria:**
- **TypeScript:** 0 errors in platform code
- **ESLint:** 0 warnings (or only minor ones)
- **Build:** `npm run build` succeeds

**If Errors Remain:**
1. Check if all schemas fixed (CRM, projects, tasks)
2. Verify alert-dialog installed
3. Check import statements (ProjectPriority → Priority)
4. Review error messages for clues

**Estimated Time:** 10 minutes

---

## Technical Tasks Summary

**Modules to Create:**
- Attachments module (schemas, actions) - 2 files, ~190 lines

**Components to Create:**
- FileUpload component - 1 file, ~150 lines
- TaskAttachments component - 1 file, ~100 lines
- ErrorBoundary component - 1 file, ~80 lines

**Files to Modify:**
- Project schemas - 2 lines
- Task schemas - 3 lines
- Project dialogs - 2 lines (imports)
- BulkSelector - ~10 lines (loading state)
- Task detail page - ~20 lines (attachments)

**Total New Code:** ~520 lines
**Total Modified Code:** ~37 lines

---

## Testing Checklist

### Must Complete ✅
- [ ] TypeScript: 0 errors in platform code
- [ ] Build succeeds: `npm run build`
- [ ] CRM: All CRUD operations work
- [ ] Projects: All CRUD operations work
- [ ] Tasks: All CRUD operations work
- [ ] Bulk operations: Select, update, delete work
- [ ] Real-time: Multi-window updates work
- [ ] Notifications: Create, read, delete work
- [ ] File attachments: Upload, download, delete work

### Stretch Goals 🎯
- [ ] Performance: Lighthouse score > 90
- [ ] Security: All checklist items pass
- [ ] Error handling: ErrorBoundary catches errors
- [ ] Loading states: All async operations show feedback

---

## Success Criteria

### Must Complete ✅
- [ ] 0 TypeScript errors in platform code (target: 416 → 0)
- [ ] File attachments fully functional (upload, download, delete)
- [ ] Error boundary implemented and tested
- [ ] All features manually tested via checklist
- [ ] TypeScript compilation succeeds
- [ ] Production build succeeds

### Phase 3 Complete 🎯
- [ ] Phase 3: 85% → 100% (+15%)
- [ ] All SaaS features implemented and tested
- [ ] Codebase ready for deployment
- [ ] No blocking technical debt

---

## Implementation Order (Recommended)

### Phase 1: TypeScript Fixes (45 min)
1. Fix project schemas - 5 min
2. Fix task schemas - 5 min
3. Install alert-dialog - 5 min
4. Fix ProjectPriority imports - 2 min
5. Validate TypeScript - 5 min
6. Test forms - 10 min
7. Run build - 5 min
8. Buffer - 8 min

**Checkpoint:** TypeScript errors = 0, build succeeds

---

### Phase 2: File Attachments (60 min)
1. Create FileUpload component - 25 min
2. Create attachment schemas - 5 min
3. Create attachment actions - 20 min
4. Create TaskAttachments component - 15 min
5. Integrate in task detail page - 10 min
6. Test upload/download/delete - 10 min
7. Buffer - 5 min

**Checkpoint:** File attachments fully functional

---

### Phase 3: Polish (45 min)
1. Add loading states to BulkSelector - 10 min
2. Create ErrorBoundary component - 20 min
3. Manual E2E testing checklist - 15 min

**Checkpoint:** All features polished and tested

---

### Phase 4: Validation (30 min)
1. Performance check with Lighthouse - 10 min
2. Security audit checklist - 10 min
3. Final TypeScript + lint validation - 10 min

**Checkpoint:** Phase 3 at 100%, ready for Phase 4

---

**Total Estimated:** 3 hours

---

## Post-Session 11: Phase 4 Preview

Once Phase 3 is 100% complete, Phase 4 will focus on:

1. **Marketing Site Integration** (4 hours)
   - Migrate `app/(web)/` to new design system
   - Update components to use shadcn/ui
   - Fix TypeScript errors in marketing pages
   - Responsive design improvements

2. **Launch Preparation** (3 hours)
   - Set up production environment (Vercel/Railway)
   - Configure environment variables
   - Set up Supabase production database
   - Configure custom domain
   - Set up monitoring (Sentry, Vercel Analytics)

3. **Documentation** (2 hours)
   - User guide for each feature
   - Admin documentation
   - API documentation
   - Deployment guide

4. **Final Testing** (2 hours)
   - Playwright E2E test suite
   - Cross-browser testing
   - Mobile responsiveness testing
   - Performance testing under load

**Phase 4 Total:** ~11 hours

---

## Notes for Next Session

### Quick Start Checklist
1. Read Session10_Summary.md (5 min)
2. Read this file (Session11.md) (5 min)
3. Create todo list from objectives (2 min)
4. Start with TypeScript fixes (immediate win)

### Known Gotchas
- **Form defaults:** After removing `.default()` from schemas, ensure all form `defaultValues` include those fields
- **File uploads:** Need FormData, not JSON, for file uploads to server actions
- **Supabase Storage:** Need to create "attachments" bucket in Supabase dashboard first
- **ErrorBoundary:** Must be class component (React limitation)

### Dependencies to Install
- None (alert-dialog comes from shadcn-ui)

### Environment Variables Needed
- `NEXT_PUBLIC_SUPABASE_URL` (already set)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already set)
- No new variables needed

---

**Let's complete Phase 3! 🚀**