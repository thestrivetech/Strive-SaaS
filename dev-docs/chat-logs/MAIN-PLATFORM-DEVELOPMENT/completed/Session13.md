# Session 13 Tasks - Complete Phase 3 to 100%

**Goal:** Finish file attachments, add polish & error handling, complete validation
**Starting Point:** Phase 3 - 90% Complete
**Estimated Duration:** 2-3 hours

---

## Current Status (From Session 12)

### ✅ Already Completed
**TypeScript Fixes:**
- Project/task schemas fixed (Priority enum, removed defaults)
- Alert dialog component created
- React Hook Form compatibility resolved

**File Attachments Foundation:**
- FileUpload component created (230 lines) with drag & drop
- Attachments module created (schemas, actions, index - 340 lines)
- Attachment model added to Prisma schema
- Prisma client generated

**Other Features Complete:**
- CRM system (full CRUD, search, filter, export)
- Project management (full CRUD, 6 filters)
- Task management (full CRUD, 5 filters, real-time)
- Bulk operations (select, update status, delete)
- Notifications system (create, read, delete, real-time)
- AI chat interface (OpenRouter + Groq, 10 models)

### 🔧 Carry-Over Tasks from Session 12

**Critical Pre-Work (User Must Complete First):**
1. ⚠️ Set `DIRECT_URL` environment variable in `.env.local`
2. ⚠️ Run: `npx prisma migrate dev --name add_attachments_model`
3. ⚠️ Create "attachments" bucket in Supabase dashboard (Storage > New Bucket > Name: "attachments", Private)

**Implementation Tasks:**
1. Create TaskAttachments component
2. Integrate attachments in task detail pages
3. Add loading states to BulkSelector
4. Create ErrorBoundary component
5. Complete manual E2E testing checklist
6. Run performance check (Lighthouse)
7. Complete security audit checklist
8. Final TypeScript + lint validation

---

## Session 13 Primary Objectives

### Priority 1: Complete File Attachments (45 min)

#### 1. Verify Environment Setup
**Checklist:**
- [ ] `DIRECT_URL` in `.env.local`
- [ ] Prisma migration applied: `npx prisma migrate dev --name add_attachments_model`
- [ ] Supabase "attachments" bucket created
- [ ] Bucket is set to **Private** (not public)

**Commands to Verify:**
```bash
# Check migration status
npx prisma migrate status

# Check Prisma client has Attachment model
npx prisma generate
```

---

#### 2. Create TaskAttachments Component
**File:** `components/features/tasks/task-attachments.tsx` (~120 lines)

**Why Client Component:** File upload, delete actions, useState for attachments list

**Implementation Requirements:**

**A. Component Interface:**
```typescript
interface TaskAttachmentsProps {
  taskId: string;
  projectId: string;
  initialAttachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
    uploadedBy: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export function TaskAttachments({
  taskId,
  projectId,
  initialAttachments
}: TaskAttachmentsProps)
```

**B. State Management:**
```typescript
const [attachments, setAttachments] = useState(initialAttachments);
const [isUploading, setIsUploading] = useState(false);
const [isDeleting, setIsDeleting] = useState<string | null>(null);
```

**C. Upload Handler:**
```typescript
async function handleUpload(files: File[]) {
  setIsUploading(true);

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', 'task');
    formData.append('entityId', taskId);

    const result = await uploadAttachment(formData);

    if (result.success && result.data) {
      setAttachments((prev) => [result.data, ...prev]);
      toast.success(`${file.name} uploaded successfully`);
    } else {
      toast.error(result.error || 'Upload failed');
    }
  }

  setIsUploading(false);
}
```

**D. Download Handler:**
```typescript
async function handleDownload(attachmentId: string, fileName: string) {
  const result = await getAttachmentUrl(attachmentId);

  if (result.success && result.data) {
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = result.data.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Download started');
  } else {
    toast.error(result.error || 'Download failed');
  }
}
```

**E. Delete Handler with Confirmation:**
```typescript
async function handleDelete(attachmentId: string, fileName: string) {
  setIsDeleting(attachmentId);

  const result = await deleteAttachment({ attachmentId });

  if (result.success) {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    toast.success(`${fileName} deleted`);
  } else {
    toast.error(result.error || 'Delete failed');
  }

  setIsDeleting(null);
}
```

**F. UI Structure:**
```tsx
<div className="space-y-6">
  {/* Header */}
  <div>
    <h3 className="text-lg font-semibold">Attachments</h3>
    <p className="text-sm text-muted-foreground">
      {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
    </p>
  </div>

  {/* Attachment List */}
  {attachments.length > 0 && (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg">
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon(attachment.mimeType)}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(attachment.fileSize)} •
              Uploaded by {attachment.uploadedBy.name || attachment.uploadedBy.email} •
              {formatDate(attachment.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(attachment.id, attachment.fileName)}
            >
              <Download className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete attachment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{attachment.fileName}"?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(attachment.id, attachment.fileName)}
                    disabled={isDeleting === attachment.id}
                  >
                    {isDeleting === attachment.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Upload Section */}
  <div>
    <FileUpload
      onFilesSelected={handleUpload}
      maxFiles={5}
      maxSizeMB={10}
      disabled={isUploading}
    />
    {isUploading && (
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Uploading files...
      </div>
    )}
  </div>
</div>
```

**G. Helper Functions:**
```typescript
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  if (mimeType.includes('word')) return <FileText className="h-8 w-8 text-blue-600" />;
  if (mimeType.includes('sheet') || mimeType.includes('excel'))
    return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
  return <FileIcon className="h-8 w-8 text-gray-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}
```

**Imports Needed:**
```typescript
'use client';

import { useState } from 'react';
import { Loader2, Download, Trash2, FileIcon, ImageIcon, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { uploadAttachment, deleteAttachment, getAttachmentUrl } from '@/lib/modules/attachments';
import { toast } from 'sonner';
```

**Estimated Lines:** ~120 lines

---

#### 3. Integrate Attachments in Task Detail Pages
**Files to Check:**
- `app/(platform)/projects/[projectId]/tasks/[taskId]/page.tsx` (if exists)
- OR task modal component (if using modal instead of page)

**Integration Steps:**

**A. Fetch Attachments in Server Component:**
```typescript
import { getAttachments } from '@/lib/modules/attachments';

async function TaskDetailPage({ params }: { params: { projectId: string; taskId: string } }) {
  const task = await getTask(params.taskId);

  // Fetch attachments
  const attachmentsResult = await getAttachments({
    entityType: 'task',
    entityId: params.taskId,
  });

  const attachments = attachmentsResult.success ? attachmentsResult.data : [];

  return (
    <div>
      {/* Existing task details */}

      {/* Add attachments section */}
      <section className="mt-8">
        <TaskAttachments
          taskId={task.id}
          projectId={params.projectId}
          initialAttachments={attachments}
        />
      </section>
    </div>
  );
}
```

**B. If Using Modal Instead:**
Add attachments section to existing task detail modal component

**Estimated Time:** 15 minutes

---

### Priority 2: Polish & Error Handling (45 min)

#### 1. Add Loading States to BulkSelector
**File:** `components/ui/bulk-selector.tsx`

**Changes Needed:**

**A. Add isLoading Prop:**
```typescript
interface BulkSelectorProps<T> {
  items: T[];
  actions: BulkAction<T>[];
  onBulkAction: (action: string, selectedItems: T[]) => Promise<void>;
  isLoading?: boolean; // ← Add this
  // ... rest
}
```

**B. Update Button UI:**
```tsx
// Find the "Bulk Actions" button and update:
<Button
  variant="outline"
  size="sm"
  disabled={isLoading || selectedItems.length === 0}
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Processing...
    </>
  ) : (
    <>
      Bulk Actions
      <ChevronDown className="ml-2 h-4 w-4" />
    </>
  )}
</Button>
```

**C. Update TaskList to Pass isLoading:**
```typescript
// In task-list.tsx
const [isBulkProcessing, setIsBulkProcessing] = useState(false);

async function handleBulkAction(action: string, tasks: Task[]) {
  setIsBulkProcessing(true);
  // ... existing bulk action logic
  setIsBulkProcessing(false);
}

<BulkSelector
  items={tasks}
  actions={bulkActions}
  onBulkAction={handleBulkAction}
  isLoading={isBulkProcessing} // ← Add this
/>
```

**Estimated Time:** 10 minutes

---

#### 2. Create ErrorBoundary Component
**File:** `components/shared/error-boundary.tsx` (~80 lines)

**Why Class Component:** React ErrorBoundary must be class component

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
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to error logging service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
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
              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-40">
                  <p className="font-semibold text-destructive mb-1">Error:</p>
                  <p className="text-muted-foreground">{this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <>
                      <p className="font-semibold text-destructive mt-2 mb-1">Component Stack:</p>
                      <pre className="text-muted-foreground text-xs whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
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

**Usage Example:**
```tsx
// In layout.tsx or page.tsx
import { ErrorBoundary } from '@/components/shared/error-boundary';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

**Estimated Time:** 20 minutes

---

#### 3. Manual E2E Testing Checklist
**Estimated Time:** 15 minutes

**CRM Testing:**
- [ ] Create customer → Verify appears in list
- [ ] Edit customer → Verify changes saved
- [ ] Delete customer → Verify removed from list
- [ ] Search customers → Verify results filter correctly
- [ ] Filter by status → Verify correct customers shown
- [ ] Export to CSV → Verify file downloads with correct data

**Projects Testing:**
- [ ] Create project → Verify appears in list
- [ ] Edit project → Verify changes saved
- [ ] Delete project → Verify removed from list
- [ ] Filter projects (status, priority, customer) → Verify correct results
- [ ] View project detail → Verify all data displayed correctly

**Tasks Testing:**
- [ ] Create task → Verify appears in list
- [ ] Edit task → Verify changes saved
- [ ] Delete task → Verify removed from list
- [ ] Change task status → Verify status updates
- [ ] Bulk select tasks → Verify selection UI works
- [ ] Bulk update status → Verify all tasks updated
- [ ] Bulk delete → Verify all tasks removed
- [ ] Real-time updates → Open 2 browser windows, verify changes sync

**Notifications Testing:**
- [ ] View notifications → Verify list appears
- [ ] Mark notification as read → Verify unread count decreases
- [ ] Mark all as read → Verify all marked read
- [ ] Delete notification → Verify removed from list
- [ ] Real-time notification → Create notification, verify appears instantly

**File Attachments Testing:**
- [ ] Upload file to task → Verify appears in list
- [ ] Upload multiple files → Verify all appear
- [ ] Download file → Verify correct file downloads
- [ ] Delete file → Verify removed from list and storage
- [ ] Upload invalid file (too large) → Verify error message
- [ ] Upload invalid file (wrong type) → Verify error message
- [ ] Verify file isolation → Upload in different orgs, verify not visible cross-org

---

### Priority 3: Validation (30 min)

#### 1. Performance Check with Lighthouse
**Estimated Time:** 10 minutes

**Steps:**
1. Build production version:
   ```bash
   npm run build
   npm run start
   ```

2. Open Chrome DevTools (F12)
3. Go to "Lighthouse" tab
4. Select:
   - Mode: Navigation
   - Device: Desktop
   - Categories: Performance
5. Click "Analyze page load"

**Success Criteria:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Performance Score:** > 90

**If Issues Found:**
- Check bundle size: Look at build output
- Look for large components that should be code-split
- Check for unnecessary re-renders
- Verify images are optimized (using Next.js Image)

---

#### 2. Security Audit Checklist
**Estimated Time:** 10 minutes

**Input Validation:**
- [ ] All server actions validate input with Zod
- [ ] No raw SQL queries (only Prisma)
- [ ] No `dangerouslySetInnerHTML` in components
- [ ] File uploads validate size and type (client + server)

**Authentication & Authorization:**
- [ ] All server actions check `getCurrentUser()`
- [ ] All queries filter by `organizationId`
- [ ] Resource ownership verified before mutations
- [ ] Middleware protects platform routes

**Environment Variables:**
- [ ] No API keys in client code
- [ ] `NEXT_PUBLIC_` prefix only for safe variables
- [ ] `.env.local` in `.gitignore`
- [ ] Supabase service role key never exposed to client

**Rate Limiting:**
- [ ] AI requests limited per user/org (verify in code)
- [ ] Bulk operations limited to 100 items (verify in code)
- [ ] File uploads limited to 10MB (verify in code)

**Activity Logging:**
- [ ] All mutations log to `activityLog` table
- [ ] Bulk operations include count in log
- [ ] Logs include userId, organizationId
- [ ] Attachment operations logged

---

#### 3. Final TypeScript + Lint Validation
**Estimated Time:** 10 minutes

**Commands:**
```bash
# TypeScript check (exclude legacy web folder)
npx tsc --noEmit 2>&1 | grep -v "app/(web)/"

# Lint check
npm run lint

# Build check
npm run build
```

**Success Criteria:**
- **TypeScript:** 0 errors in platform code (warnings about React Hook Form types are OK)
- **ESLint:** 0 warnings (or only minor ones)
- **Build:** `npm run build` succeeds without errors

**If Errors Remain:**
1. Check if all schemas fixed (Priority → ProjectPriority)
2. Verify alert-dialog installed correctly
3. Check import statements are correct
4. Review error messages for clues

---

## Technical Tasks Summary

### Modules Complete
- ✅ CRM module (schemas, actions, queries)
- ✅ Projects module (schemas, actions, queries)
- ✅ Tasks module (schemas, actions, queries)
- ✅ AI module (schemas, actions, queries)
- ✅ Notifications module (schemas, actions, queries)
- ✅ Attachments module (schemas, actions) - Backend complete
- ✅ Bulk actions module

### Components to Create (2 components, ~200 lines)
1. TaskAttachments component (~120 lines)
2. ErrorBoundary component (~80 lines)

### Components to Modify (1 component, ~10 lines)
1. BulkSelector - Add loading states

### Files to Modify (1-2 files, ~20 lines)
1. Task detail page/modal - Add attachments section
2. Task list - Add isLoading prop to BulkSelector

**Total New Code:** ~220 lines
**Total Modified Code:** ~30 lines

---

## Testing Checklist

### Must Complete ✅
- [ ] Database migration applied (`attachments` table exists)
- [ ] Supabase bucket created ("attachments")
- [ ] TaskAttachments component works (upload, download, delete)
- [ ] BulkSelector shows loading state during operations
- [ ] ErrorBoundary catches errors gracefully
- [ ] All E2E tests pass (CRM, projects, tasks, notifications, attachments)
- [ ] TypeScript compiles with 0 platform errors
- [ ] Build succeeds

### Stretch Goals 🎯
- [ ] Performance: Lighthouse score > 90
- [ ] Security: All checklist items pass
- [ ] Add ErrorBoundary to all major layout sections
- [ ] Add loading skeletons for better UX

---

## Success Criteria

### Must Complete ✅ (Phase 3 → 100%)
- [ ] File attachments fully functional (upload, download, delete)
- [ ] Attachments integrated in task pages
- [ ] Loading states added to bulk operations
- [ ] Error boundary implemented and tested
- [ ] All features manually tested via E2E checklist
- [ ] TypeScript compilation succeeds (no blocking errors)
- [ ] Production build succeeds

### Phase 3 Complete 🎯
- [ ] Phase 3: 90% → 100% (+10%)
- [ ] All SaaS features implemented and tested
- [ ] Codebase ready for Phase 4 (deployment prep)
- [ ] No blocking technical debt
- [ ] All module patterns consistent

---

## Implementation Order (Recommended)

### Phase 1: Environment Setup (10 min)
1. Verify `DIRECT_URL` in `.env.local`
2. Run Prisma migration
3. Create Supabase "attachments" bucket
4. Verify bucket is private
5. Test bucket access

**Checkpoint:** Migration applied, bucket created

---

### Phase 2: File Attachments UI (30 min)
1. Create TaskAttachments component - 20 min
   - Component structure with state
   - Upload handler using FileUpload
   - Download handler with signed URLs
   - Delete handler with AlertDialog
   - Helper functions (formatFileSize, getFileIcon, formatDate)
2. Integrate in task detail page - 10 min
   - Fetch attachments in server component
   - Add TaskAttachments to UI

**Checkpoint:** Can upload, download, delete files on tasks

---

### Phase 3: Polish & Error Handling (25 min)
1. Add loading states to BulkSelector - 10 min
   - Add isLoading prop
   - Update button UI
   - Update TaskList to pass prop
2. Create ErrorBoundary component - 15 min
   - Class component with error catching
   - Error UI with try again/go home buttons
   - Development error details
   - Add to main layout

**Checkpoint:** Loading states work, errors caught gracefully

---

### Phase 4: Testing (15 min)
1. Manual E2E testing - 15 min
   - Test all CRM operations
   - Test all project operations
   - Test all task operations
   - Test notifications
   - Test file attachments (upload, download, delete)

**Checkpoint:** All features work end-to-end

---

### Phase 5: Validation (30 min)
1. Performance check - 10 min
   - Build production
   - Run Lighthouse
   - Verify > 90 score
2. Security audit - 10 min
   - Run through checklist
   - Verify all items pass
3. Final validation - 10 min
   - TypeScript check
   - Lint check
   - Build check

**Checkpoint:** Phase 3 at 100%, ready for Phase 4

---

**Total Estimated:** 2 hours

---

## Post-Session 13: Phase 4 Preview

Once Phase 3 is 100% complete, Phase 4 will focus on:

### 1. Marketing Site Integration (4 hours)
- Migrate `app/(web)/` pages to Next.js 15 patterns
- Update components to use shared shadcn/ui
- Fix TypeScript errors in marketing pages
- Responsive design improvements
- Performance optimization

### 2. Launch Preparation (3 hours)
- Set up production environment (Vercel)
- Configure production environment variables
- Set up production Supabase database
- Configure custom domain (app.strivetech.ai)
- Set up monitoring (Sentry, Vercel Analytics)
- Create production RLS policies

### 3. Documentation (2 hours)
- User guide for each feature
- Admin documentation
- API documentation (if needed)
- Deployment guide
- Troubleshooting guide

### 4. Final Testing (2 hours)
- Playwright E2E test suite
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness testing
- Performance testing under load
- Security penetration testing

**Phase 4 Total:** ~11 hours

---

## Notes for Next Session

### Quick Start Checklist
1. Read Session12_Summary.md (5 min)
2. Read this file (Session13.md) (5 min)
3. Verify environment setup (migration, bucket) (5 min)
4. Create todo list from objectives (2 min)
5. Start with TaskAttachments component (immediate value)

### Known Gotchas
- **Supabase Bucket**: Must be created manually, not via code
- **Prisma Migration**: Must run before testing attachments
- **ErrorBoundary**: Must be class component (React limitation)
- **File Downloads**: Use signed URLs, not direct storage URLs
- **Multi-tenancy**: Verify organizationId in all attachment queries

### Dependencies Already Installed
- @radix-ui/react-alert-dialog ✅
- All other dependencies ready ✅

### Environment Variables Needed
```env
# Verify these are set in .env.local:
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."           # ← Must be set for migration
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Files Ready to Use
- ✅ `components/ui/file-upload.tsx` - Import and use
- ✅ `lib/modules/attachments/index.ts` - Import actions
- ✅ `components/ui/alert-dialog.tsx` - Import for delete confirmation

### Critical Path
1. Environment setup (can't proceed without this)
2. TaskAttachments component (enables testing)
3. E2E testing (validates everything works)
4. Validation (ensures production-ready)

---

**Let's complete Phase 3! 🚀**
