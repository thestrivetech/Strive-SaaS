# Session 10 Tasks - Phase 3 Completion & Polish

**Goal:** Complete Phase 3, integrate Session 9 features, and polish for Phase 4
**Starting Point:** Phase 3 - 97% Complete
**Estimated Duration:** 3-4 hours

---

## 📍 Current Status (From Session 9)

### ✅ Already Completed (Sessions 1-9)

**Foundation (Phase 1 & 2):** 100% ✅
- Next.js 15 + React 19 + Prisma 6.16.2 setup
- Supabase authentication & database
- 56 UI components from shadcn/ui
- Dashboard layouts & navigation
- Organization & team management

**SaaS Features (Phase 3):** 97% ✅
- **CRM System:** Full CRUD, advanced filtering, pagination, search, export
- **Project Management:** Complete with 6 filters, export
- **Task Management:** Full functionality with 5 filters
- **AI Integration:** Chat interface with OpenRouter + Groq (10 models)
- **Real-Time:** Hooks created (ready to integrate)
- **Bulk Operations:** Server actions + UI component (ready to integrate)
- **Export:** CSV export for CRM & Projects

### 🔧 Carry-Over Tasks from Session 9

1. **Realtime integration in pages** - Hooks created, need to wire up
2. **Bulk operations UI** - Component ready, need to add to task lists
3. **Fix React Hook Form types** - Pre-existing issue in create-customer-dialog.tsx

---

## 🎯 Session 10 Primary Objectives

### Priority 1: Integration Tasks (Est: 45 min)

#### 1. Integrate Realtime in Project Detail Page
**File:** `app/(platform)/projects/[projectId]/page.tsx` (modify ~30 lines)

**Implementation Requirements:**
- Import useRealtimeTaskUpdates hook
- Wrap task list in client component
- Pass projectId and initialTasks
- Display connection status indicator
- Handle realtime events (INSERT, UPDATE, DELETE)

**Why Client Component:**
- Uses useState for task updates
- Real-time event handling
- Connection status display

**Pattern:**
```typescript
'use client';

import { useRealtimeTaskUpdates } from '@/lib/realtime/use-realtime';

export function TaskList({ projectId, initialTasks }: Props) {
  const { tasks, isConnected } = useRealtimeTaskUpdates(projectId, initialTasks);

  return (
    <div>
      {/* Connection status */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Live updates' : 'Connecting...'}
        </span>
      </div>

      {/* Task list */}
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

**Estimated Lines:** ~30 lines modified

---

#### 2. Add Bulk Operations to Task List
**File:** `app/(platform)/projects/[projectId]/page.tsx` (modify ~40 lines)

**Implementation Requirements:**
- Import BulkSelector component
- Import bulk action server actions
- Add selected state management
- Wire up bulk action handlers
- Add confirmation dialogs for destructive actions
- Show toast notifications on success/error

**Pattern:**
```typescript
'use client';

import { BulkSelector, type BulkAction } from '@/components/ui/bulk-selector';
import { bulkUpdateTaskStatus, bulkDeleteTasks } from '@/lib/modules/tasks/bulk-actions';
import { toast } from 'sonner';

export function TaskList({ tasks }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const bulkActions: BulkAction[] = [
    { id: 'status-done', label: 'Mark as Done', icon: <CheckCircle /> },
    { id: 'status-in-progress', label: 'Mark In Progress', icon: <Clock /> },
    { id: 'delete', label: 'Delete', icon: <Trash />, variant: 'destructive' },
  ];

  const handleBulkAction = async (actionId: string, ids: string[]) => {
    if (actionId === 'delete') {
      if (!confirm(`Delete ${ids.length} tasks?`)) return;
      const result = await bulkDeleteTasks({ taskIds: ids });
      if (result.success) {
        toast.success(`Deleted ${result.data.count} tasks`);
        setSelectedIds([]);
      }
    } else if (actionId.startsWith('status-')) {
      const status = actionId.replace('status-', '').toUpperCase();
      const result = await bulkUpdateTaskStatus({ taskIds: ids, status });
      if (result.success) {
        toast.success(`Updated ${result.data.count} tasks`);
        setSelectedIds([]);
      }
    }
  };

  return (
    <div>
      <BulkSelector
        items={tasks}
        actions={bulkActions}
        onBulkAction={handleBulkAction}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      {/* Task cards */}
    </div>
  );
}
```

**Estimated Lines:** ~40 lines modified

---

#### 3. Test Multi-User Collaboration
**Manual Testing:** (15 min)

**Test Scenarios:**
- [ ] Open project in two browser windows
- [ ] Create task in window 1 → appears in window 2
- [ ] Update task in window 2 → updates in window 1
- [ ] Delete task in window 1 → removes from window 2
- [ ] Verify connection status indicator
- [ ] Test bulk operations with selection state

---

### Priority 2: Notifications System (Est: 60 min)

#### 1. Create Notification Schemas
**File:** `lib/modules/notifications/schemas.ts` (~40 lines)

**Implementation Requirements:**
```typescript
export const CreateNotificationSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  actionUrl: z.string().url().optional(),
});

export const MarkNotificationReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export const BulkMarkReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).max(100),
});
```

**Estimated Lines:** ~40 lines

---

#### 2. Create Notification Queries
**File:** `lib/modules/notifications/queries.ts` (~60 lines)

**Implementation Requirements:**
```typescript
/**
 * Get unread notifications for user
 */
export async function getUnreadNotifications(
  userId: string,
  organizationId: string,
  limit: number = 10
) {
  return await prisma.notification.findMany({
    where: {
      userId,
      organizationId,
      read: false,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get all notifications with pagination
 */
export async function getNotifications(
  userId: string,
  organizationId: string,
  { limit = 25, offset = 0 }
) {
  const [notifications, count] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({
      where: { userId, organizationId },
    }),
  ]);

  return { notifications, count };
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId: string, organizationId: string) {
  return await prisma.notification.count({
    where: { userId, organizationId, read: false },
  });
}
```

**Estimated Lines:** ~60 lines

---

#### 3. Create Notification Actions
**File:** `lib/modules/notifications/actions.ts` (~100 lines)

**Implementation Requirements:**
```typescript
'use server';

/**
 * Mark notification as read
 */
export async function markNotificationRead(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const validated = MarkNotificationReadSchema.parse(input);

  // Verify ownership
  const notification = await prisma.notification.findFirst({
    where: {
      id: validated.notificationId,
      userId: user.id,
      organizationId: user.organizationId,
    },
  });

  if (!notification) {
    return { success: false, error: 'Notification not found' };
  }

  await prisma.notification.update({
    where: { id: validated.notificationId },
    data: { read: true },
  });

  return { success: true };
}

/**
 * Mark all as read
 */
export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await prisma.notification.updateMany({
    where: {
      userId: user.id,
      organizationId: user.organizationId,
      read: false,
    },
    data: { read: true },
  });

  return { success: true, data: { count: result.count } };
}

/**
 * Create notification (internal use)
 */
export async function createNotification(input: unknown) {
  const validated = CreateNotificationSchema.parse(input);

  const notification = await prisma.notification.create({
    data: validated,
  });

  return { success: true, data: notification };
}
```

**Estimated Lines:** ~100 lines

---

#### 4. Create Notification Dropdown Component
**File:** `components/shared/navigation/notification-dropdown.tsx` (~200 lines)

**Implementation Requirements:**
- Bell icon with unread count badge
- Dropdown with notification list
- Mark as read on click
- "Mark all as read" button
- Empty state
- Action buttons (if actionUrl provided)
- Time ago display (e.g., "5 min ago")
- Real-time updates via Supabase

**Why Client Component:**
- Dropdown state management
- Real-time notification updates
- User interaction handlers

**Pattern:**
```typescript
'use client';

import { Bell } from 'lucide-react';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/modules/notifications/actions';

export function NotificationDropdown({ userId, organizationId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time subscription
  useEffect(() => {
    const client = new RealtimeClient();
    const unsubscribe = client.subscribeToNotifications(userId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setNotifications((prev) => [payload.new, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationRead({ notificationId });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {/* Notification list */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Estimated Lines:** ~200 lines

---

#### 5. Add Notification Dropdown to Topbar
**File:** `components/shared/layouts/topbar.tsx` (modify ~10 lines)

**Implementation Requirements:**
- Import NotificationDropdown
- Add between search and user menu
- Pass userId and organizationId

**Estimated Lines:** ~10 lines modified

---

### Priority 3: File Attachments (Est: 45 min)

#### 1. Create File Upload Component
**File:** `components/ui/file-upload.tsx` (~150 lines)

**Implementation Requirements:**
- Drag & drop zone
- File input fallback
- File size validation (max 10MB per file)
- File type validation (images, documents, PDFs)
- Progress bar during upload
- Multiple file support
- Preview thumbnails
- Remove file before upload

**Why Client Component:**
- File input handling
- Drag & drop events
- Upload progress tracking
- Preview state management

**Pattern:**
```typescript
'use client';

import { useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxSize?: number; // in bytes
  accept?: string[];
  multiple?: boolean;
}

export function FileUpload({ onUpload, maxSize = 10485760, accept, multiple = true }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  };

  const validateAndAddFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max ${maxSize / 1024 / 1024}MB)`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);

    try {
      await onUpload(files);
      setFiles([]);
      toast.success('Files uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-lg p-8 text-center"
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2">Drag & drop files or click to browse</p>
        <input type="file" multiple={multiple} onChange={handleFileChange} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <span className="flex-1">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {uploading && <Progress value={progress} className="mt-4" />}

      <Button onClick={handleUpload} disabled={files.length === 0 || uploading} className="mt-4">
        Upload {files.length} file(s)
      </Button>
    </div>
  );
}
```

**Estimated Lines:** ~150 lines

---

#### 2. Create File Attachment Actions
**File:** `lib/modules/attachments/actions.ts` (~100 lines)

**Implementation Requirements:**
- Upload file to Supabase Storage
- Create attachment record in database
- Link to task or project
- Delete attachment (file + record)
- Multi-tenancy enforcement

**Pattern:**
```typescript
'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-only key
);

export async function uploadAttachment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const file = formData.get('file') as File;
  const entityType = formData.get('entityType') as string;
  const entityId = formData.get('entityId') as string;

  // Validate entity ownership
  // ... multi-tenancy check

  // Upload to Supabase Storage
  const fileName = `${user.organizationId}/${entityType}/${entityId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(fileName, file);

  if (error) {
    return { success: false, error: 'Upload failed' };
  }

  // Create attachment record
  const attachment = await prisma.attachment.create({
    data: {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath: fileName,
      entityType,
      entityId,
      uploadedById: user.id,
      organizationId: user.organizationId,
    },
  });

  return { success: true, data: attachment };
}
```

**Estimated Lines:** ~100 lines

---

#### 3. Add Attachment Display to Tasks
**File:** `components/features/tasks/task-attachments.tsx` (~100 lines)

**Implementation Requirements:**
- Display attachment list
- Download button
- Delete button (with confirmation)
- File icons based on type
- File size display
- Upload date

**Estimated Lines:** ~100 lines

---

### Priority 4: Bug Fixes & Polish (Est: 30 min)

#### 1. Fix React Hook Form Types in CRM
**File:** `components/features/crm/create-customer-dialog.tsx` (modify ~20 lines)

**Issue:** Type mismatch between form schema and resolver

**Fix Pattern:**
```typescript
// Before (causing errors)
const form = useForm({
  resolver: zodResolver(CreateCustomerSchema),
});

// After (explicit types)
type CreateCustomerFormData = z.infer<typeof CreateCustomerSchema>;

const form = useForm<CreateCustomerFormData>({
  resolver: zodResolver(CreateCustomerSchema),
  defaultValues: {
    status: 'LEAD',
    source: 'WEBSITE',
    tags: [],
  },
});
```

**Estimated Lines:** ~20 lines modified

---

#### 2. Add Loading States to Bulk Operations
**File:** `components/ui/bulk-selector.tsx` (modify ~15 lines)

**Enhancement:**
- Show loading spinner during bulk operations
- Disable actions while processing
- Clear selection after success

**Estimated Lines:** ~15 lines modified

---

#### 3. Add Error Boundaries
**File:** `components/shared/error-boundary.tsx` (~80 lines)

**Implementation:**
- Generic error boundary component
- Fallback UI with retry button
- Error logging
- User-friendly error messages

**Estimated Lines:** ~80 lines

---

### Priority 5: Phase 3 Review & Testing (Est: 30 min)

#### 1. E2E Testing Checklist

**CRM System:**
- [ ] Create customer
- [ ] Edit customer
- [ ] Delete customer
- [ ] Filter customers
- [ ] Export customers to CSV
- [ ] Search customers

**Project Management:**
- [ ] Create project
- [ ] Edit project
- [ ] Delete project
- [ ] Filter projects
- [ ] Export projects to CSV
- [ ] View project details

**Task Management:**
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Filter tasks
- [ ] Bulk update task status
- [ ] Bulk assign tasks
- [ ] Bulk delete tasks

**AI Assistant:**
- [ ] Send message to AI
- [ ] Switch between models
- [ ] View conversation history
- [ ] Rate limiting works per tier

**Real-Time:**
- [ ] Task updates appear in real-time
- [ ] Connection status indicator works
- [ ] No duplicate messages on reconnect

**Notifications:**
- [ ] Receive notifications
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Real-time notification updates

**File Attachments:**
- [ ] Upload file to task
- [ ] Download attachment
- [ ] Delete attachment
- [ ] View attachment list

---

#### 2. Performance Testing

**Core Web Vitals:**
```bash
# Run Lighthouse in Chrome DevTools
# Target metrics:
LCP: < 2.5s
FID: < 100ms
CLS: < 0.1
```

**Bundle Size:**
```bash
npm run build
# Check .next/server/app output
# Target: < 500kb for main bundle
```

---

#### 3. Security Audit

**Checklist:**
- [ ] All inputs validated with Zod
- [ ] Multi-tenancy enforced on all queries
- [ ] API keys not exposed to client
- [ ] Rate limiting on AI requests
- [ ] File upload size limits enforced
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF tokens (Next.js built-in)

---

## 📋 Technical Tasks Summary

### Modules to Create (2 new modules)
1. Notifications module (`lib/modules/notifications/`)
2. Attachments module (`lib/modules/attachments/`)

### Components to Create (4 new components)
1. NotificationDropdown (~200 lines)
2. FileUpload (~150 lines)
3. TaskAttachments (~100 lines)
4. ErrorBoundary (~80 lines)

### Files to Modify (4 files)
1. `app/(platform)/projects/[projectId]/page.tsx` - Realtime + bulk ops integration
2. `components/shared/layouts/topbar.tsx` - Add notification dropdown
3. `components/features/crm/create-customer-dialog.tsx` - Fix types
4. `components/ui/bulk-selector.tsx` - Add loading states

### Total New Code Estimate
- **New Files:** ~930 lines
- **Modified Files:** ~115 lines
- **Total:** ~1,045 lines

---

## ✅ Success Criteria

### Must Complete ✅
- [ ] Realtime updates work in project detail page
- [ ] Bulk operations integrated in task list UI
- [ ] Notifications system functional (create, read, mark as read)
- [ ] File attachments work for tasks
- [ ] All TypeScript errors fixed
- [ ] No regression in existing features
- [ ] Phase 3 complete (100%)

### Stretch Goals 🎯
- [ ] Add realtime to CRM page (customers)
- [ ] PDF export (in addition to CSV)
- [ ] Email notifications (not just in-app)
- [ ] Keyboard shortcuts for bulk operations (Shift+Click to select range)
- [ ] Attachment preview (images, PDFs)

---

## 🚀 Implementation Order (Recommended)

### Phase 1: Integration (45 min)
1. Integrate realtime in project detail page (20 min)
2. Add bulk operations to task list (20 min)
3. Manual testing (5 min)

**Checkpoint:** Real-time collaboration and bulk operations working

---

### Phase 2: Notifications (60 min)
1. Create notification schemas (10 min)
2. Create notification queries (15 min)
3. Create notification actions (20 min)
4. Build notification dropdown (30 min)
5. Add to topbar (5 min)

**Checkpoint:** Users receive and can manage notifications

---

### Phase 3: File Attachments (45 min)
1. Create file upload component (25 min)
2. Create attachment actions (15 min)
3. Add attachment display to tasks (15 min)

**Checkpoint:** Users can upload/download/delete attachments

---

### Phase 4: Polish (30 min)
1. Fix CRM types (10 min)
2. Add loading states (5 min)
3. Create error boundary (15 min)

**Checkpoint:** All known issues resolved

---

### Phase 5: Testing (30 min)
1. E2E testing (15 min)
2. Performance testing (5 min)
3. Security audit (10 min)

**Checkpoint:** Phase 3 verified complete

---

**Total Estimated:** 3-3.5 hours

---

## 📦 Dependencies

### Already Installed
- `@supabase/supabase-js@2.58.0` - Realtime + Storage
- `openai@5.23.2` - AI integration
- All shadcn/ui components

### No New Dependencies Needed
All features use existing libraries

---

## 🔗 References & Resources

### Supabase Docs
- **Storage:** https://supabase.com/docs/guides/storage
- **Realtime:** https://supabase.com/docs/guides/realtime

### Next.js Patterns
- **Error Boundaries:** https://nextjs.org/docs/app/building-your-application/routing/error-handling
- **Server Actions:** https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

---

## 📝 Notes & Considerations

### Notification Strategy
- **In-app first** - Real-time notifications via Supabase
- **Email later** - Phase 4 enhancement with SMTP
- **Push notifications** - Future enhancement (PWA)

### File Storage
- **Supabase Storage** - Automatic CDN, built-in security
- **Organization-based paths** - `/org-id/entity-type/entity-id/filename`
- **Size limits** - 10MB per file, 100MB per entity
- **Automatic cleanup** - Delete files when entity deleted

### Real-Time Performance
- **Connection pooling** - Supabase handles automatically
- **Subscription limits** - Max 100 concurrent per user
- **Debouncing** - Not needed, Supabase handles efficiently
- **Reconnection** - Automatic with exponential backoff

---

## 🎯 Expected Outcomes

**After Session 10 completion:**

1. **Phase 3 Progress:** 97% → 100% (+3%) ✅ COMPLETE
2. **Feature Completeness:**
   - Real-time collaboration working in production
   - Bulk operations fully integrated and tested
   - Notifications system live
   - File attachments functional
3. **Code Quality:**
   - 0 TypeScript errors
   - All features tested E2E
   - Performance targets met
   - Security audit passed
4. **Ready for Phase 4:**
   - Marketing site integration
   - Deployment to production
   - User acceptance testing

---

## 🔮 Session 11 Preview

**Focus:** Phase 4 - Marketing Site Integration & Launch

With Phase 3 complete, Session 11 will focus on:

1. **Marketing Site Updates** - Update login/signup flow
2. **Cookie Sharing** - Enable auth across domains
3. **Deployment** - Configure Vercel for app.strivetech.ai
4. **DNS Setup** - Point subdomain to Vercel
5. **Production Testing** - E2E testing in production
6. **Launch Preparation** - Final checks before go-live

**Expected:** Phase 4: 0% → 60% (deployment ready)

---

**Session 10 Ready to Begin!**

Clear objectives, detailed implementation plans, and all context from previous sessions.