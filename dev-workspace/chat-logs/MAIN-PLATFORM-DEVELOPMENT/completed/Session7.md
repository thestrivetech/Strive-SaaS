# Session 7 Tasks - Enhanced UI/UX & Advanced Features

**Date:** TBD (Next Session)
**Goal:** Improve user experience with loading states, pagination, advanced filtering, and polish
**Starting Point:** Phase 3 - 75% Complete 🚧
**Phase Reference:** Phase 3 (Week 5-8) - SaaS Features completion
**Estimated Duration:** 4-5 hours

---

## 📍 Current Status (From Session 6)

### ✅ Already Completed (Phase 3: 75%)
- **Phase 1 & 2:** 100% complete ✅
- **CRM System:** 80% complete
  - Full CRUD operations
  - Customer detail pages with activity timeline
  - Search by name/email/company (debounced)
  - Filter by status and source
  - Actions dropdown menu
- **Projects Module:** 90% complete
  - Full CRUD operations
  - Project detail pages with tasks
  - Statistics dashboard
  - Progress tracking from task completion
  - Activity timeline integration
  - Team member assignment
- **Tasks Module:** 85% complete ✅ (NEW in Session 6)
  - Full CRUD operations
  - Task creation/editing dialogs
  - Task list with status grouping
  - Quick status updates
  - Task assignment to team members
  - Due date and estimated hours tracking
- **Organization Management:** Complete
  - Multi-tenancy enforced everywhere
  - Organization switcher
  - Team member management

### 🔧 Carry-Over Tasks from Session 6
- **Loading states:** No skeletons yet (affects perceived performance)
- **Pagination:** Backend ready (limit/offset), needs UI component
- **Team members in CreateTaskDialog:** Passing empty array (5 min fix)
- **Advanced filtering:** Basic filters work, need date ranges and multi-select
- **Subscription tier naming:** Inconsistent (TIER_1 vs BASIC)

### 🐛 Known Issues to Address
1. Empty teamMembers array in project detail page CreateTaskDialog
2. No loading indicators on slow operations
3. Large lists (>50 items) show all at once (need pagination)
4. Can't filter by date ranges
5. Tools page tier comparison uses wrong enum values

---

## 🎯 Session 7 Primary Objectives

### Priority 1: Loading States & Skeletons (90 min)
**Enhance perceived performance and user experience**

#### 1. Create Skeleton Components
**Files to Create:**
- `components/ui/skeleton-card.tsx` (~50 lines)
- `components/features/crm/customer-list-skeleton.tsx` (~60 lines)
- `components/features/projects/project-list-skeleton.tsx` (~60 lines)
- `components/features/tasks/task-list-skeleton.tsx` (~60 lines)

**Implementation Requirements:**

##### A. Base Skeleton Card Component
**File:** `components/ui/skeleton-card.tsx`

```typescript
// Reusable skeleton component using shadcn/ui Skeleton
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
      </CardContent>
    </Card>
  );
}

// Variations:
- SkeletonCardGrid (3-4 cards in grid)
- SkeletonTable (table row skeletons)
- SkeletonForm (form field skeletons)
```

**Why Client Component:** Uses shadcn/ui Skeleton (has animations)

##### B. Feature-Specific Skeletons
**Pattern:** Match the actual component layout exactly

```typescript
// CustomerListSkeleton - matches customer card layout
- Avatar skeleton (circle)
- Name skeleton (wide)
- Email skeleton (medium)
- Status badge skeleton (small)
- Action buttons skeleton

// ProjectListSkeleton - matches project card layout
- Title skeleton
- Description skeleton (2 lines)
- Progress bar skeleton
- Metadata row skeleton

// TaskListSkeleton - matches task list layout
- Status section headers (3-4 groups)
- Task cards in each group (3-5 per group)
- Matches TaskCard dimensions exactly
```

**Estimated Lines:** ~230 lines total (4 skeleton components)

---

#### 2. Integrate Suspense Boundaries
**Files to Modify:**
- `app/(platform)/crm/page.tsx`
- `app/(platform)/projects/page.tsx`
- `app/(platform)/projects/[projectId]/page.tsx`
- `app/(platform)/crm/[customerId]/page.tsx`

**Pattern to Apply:**
```typescript
// Before:
export default async function Page() {
  const data = await getData();
  return <DataList data={data} />;
}

// After:
import { Suspense } from 'react';
import { DataListSkeleton } from '@/components/features/data-list-skeleton';

export default function Page() {
  return (
    <Suspense fallback={<DataListSkeleton />}>
      <DataList />
    </Suspense>
  );
}

// Move data fetching to component:
async function DataList() {
  const data = await getData();
  return <DataListComponent data={data} />;
}
```

**Benefits:**
- Streaming SSR (page loads faster)
- Shows skeleton while loading
- Better perceived performance
- Handles slow DB queries gracefully

---

#### 3. Add Loading States to Dialogs
**Files to Modify:**
- All dialog components (create/edit dialogs)

**Changes Needed:**
```typescript
// Add to all submit handlers:
const [isSubmitting, setIsSubmitting] = useState(false);

async function onSubmit(data) {
  setIsSubmitting(true);
  try {
    await action(data);
    toast.success('Success!');
  } finally {
    setIsSubmitting(false);  // Always reset
  }
}

// Update button:
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

**Already Done:** Most dialogs (verify all)
**Need to Add:** Any missing loading indicators

---

### Priority 2: Pagination Component (60 min)
**Handle large datasets efficiently**

#### 1. Create Reusable Pagination Component
**File:** `components/ui/pagination-controls.tsx` (~120 lines)

**Implementation Requirements:**
```typescript
'use client';

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex items-center justify-between">
      {/* Left: Items count */}
      <div className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
      </div>

      {/* Center: Page buttons */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {/* Page number buttons (smart display: 1 ... 5 6 [7] 8 9 ... 20) */}
        {renderPageNumbers()}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      {/* Right: Page size selector */}
      {onPageSizeChange && (
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
```

**Features:**
- Previous/Next buttons
- Page number buttons with smart display
- Jump to first/last page
- Page size selector
- Item count display
- Disabled states
- Keyboard navigation

**Why Client Component:** Interactive (buttons, state)

---

#### 2. Add URL Parameter Support
**Pattern:** Use Next.js searchParams for page state

**Files to Modify:**
- `app/(platform)/crm/page.tsx`
- `app/(platform)/projects/page.tsx`

**Implementation:**
```typescript
export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '25', 10);
  const offset = (page - 1) * limit;

  const [data, totalCount] = await Promise.all([
    getData({ limit, offset }),
    getDataCount(),  // Need to add count queries
  ]);

  return (
    <>
      <DataList data={data} />
      <PaginationControls
        currentPage={page}
        totalItems={totalCount}
        itemsPerPage={limit}
        onPageChange={(newPage) => {
          // Client-side navigation
          router.push(`?page=${newPage}&limit=${limit}`);
        }}
      />
    </>
  );
}
```

**Need to Create Count Queries:**
- `getCustomersCount(organizationId, filters?)`
- `getProjectsCount(organizationId, filters?)`
- `getTasksCount(projectId, filters?)`

**Files to Modify:**
- `lib/modules/crm/queries.ts` (add count query)
- `lib/modules/projects/queries.ts` (add count query)
- `lib/modules/tasks/queries.ts` (add count query)

**Estimated Lines:** ~30 lines (count queries are simple)

---

### Priority 3: Advanced Filtering (90 min)
**Enable power users to find data quickly**

#### 1. Date Range Filter Component
**File:** `components/ui/date-range-picker.tsx` (~150 lines)

**Implementation Requirements:**
```typescript
'use client';

import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, 'LLL dd, y')} -{' '}
                {format(value.to, 'LLL dd, y')}
              </>
            ) : (
              format(value.from, 'LLL dd, y')
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
```

**Features:**
- Two-month calendar view
- Range selection
- Keyboard navigation
- Clear button
- Preset ranges (Today, Last 7 days, Last 30 days, This month)

---

#### 2. Multi-Select Filter Component
**File:** `components/ui/multi-select.tsx` (~200 lines)

**Implementation Requirements:**
```typescript
'use client';

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  maxDisplay = 3,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {value.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            <div className="flex gap-1">
              {value.slice(0, maxDisplay).map((v) => (
                <Badge key={v} variant="secondary">
                  {options.find((o) => o.value === v)?.label}
                </Badge>
              ))}
              {value.length > maxDisplay && (
                <Badge variant="secondary">
                  +{value.length - maxDisplay} more
                </Badge>
              )}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  const newValue = value.includes(option.value)
                    ? value.filter((v) => v !== option.value)
                    : [...value, option.value];
                  onChange(newValue);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

**Features:**
- Checkbox-style multi-select
- Search/filter options
- Badge display for selected items
- "Select all" / "Clear all" buttons
- Keyboard navigation

---

#### 3. Enhance Existing Filter Components
**Files to Modify:**
- `components/features/crm/customer-filters.tsx`
- Create: `components/features/projects/project-filters.tsx`
- Create: `components/features/tasks/task-filters.tsx`

**Enhancements Needed:**
```typescript
// Customer Filters - Add:
- Date range for createdAt
- Multi-select for status (select multiple)
- Multi-select for source
- Date range for lastContactDate (future field)

// Project Filters - Create new:
- Date range for startDate / dueDate
- Multi-select for status
- Multi-select for priority
- Budget range (min/max)
- Customer filter (dropdown)
- Project manager filter (dropdown)

// Task Filters - Create new:
- Date range for dueDate
- Date range for createdAt
- Multi-select for status
- Multi-select for priority
- Assignee filter (dropdown)
- Overdue toggle (boolean)
```

**Pattern:**
```typescript
'use client';

export function ProjectFilters({
  filters,
  onFiltersChange,
}: {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <MultiSelect
        options={statusOptions}
        value={filters.status || []}
        onChange={(status) => onFiltersChange({ ...filters, status })}
        placeholder="Status"
      />

      <MultiSelect
        options={priorityOptions}
        value={filters.priority || []}
        onChange={(priority) => onFiltersChange({ ...filters, priority })}
        placeholder="Priority"
      />

      <DateRangePicker
        value={filters.dateRange}
        onChange={(dateRange) => onFiltersChange({ ...filters, dateRange })}
        placeholder="Due date range"
      />

      {/* Clear filters button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({})}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
```

---

### Priority 4: Quick Fixes & Polish (30 min)
**Address known issues and improve consistency**

#### 1. Fix CreateTaskDialog Team Members
**File:** `app/(platform)/projects/[projectId]/page.tsx`

**Current Issue:**
```typescript
// Line 199: Empty array passed
<CreateTaskDialog projectId={project.id} teamMembers={[]} />
```

**Fix:**
```typescript
// Need to fetch org members
const orgMembers = await getOrganizationMembers(currentOrg.organizationId);
const teamMembers = orgMembers.map((m) => ({
  id: m.user.id,
  name: m.user.name || m.user.email,
}));

// Pass to dialog
<CreateTaskDialog projectId={project.id} teamMembers={teamMembers} />
```

**Estimated Time:** 5 minutes

---

#### 2. Fix Subscription Tier Naming
**File:** `app/(platform)/tools/page.tsx`

**Current Issue:**
```typescript
// Lines 144-146: Wrong enum values
if (userTier === 'TIER_1') // ❌ Wrong
if (userTier === 'TIER_2') // ❌ Wrong
if (userTier === 'TIER_3') // ❌ Wrong

// Should be:
if (userTier === 'BASIC')      // ✅ Correct
if (userTier === 'PRO')        // ✅ Correct
if (userTier === 'ENTERPRISE') // ✅ Correct
```

**Fix:**
```typescript
// Update tier comparisons to match Prisma enum
enum SubscriptionTier {
  FREE,
  BASIC,     // ← Use these
  PRO,       // ← Use these
  ENTERPRISE // ← Use these
}
```

**Estimated Time:** 5 minutes

---

#### 3. Add Optimistic UI Updates
**Pattern:** Show success immediately, handle errors

**Files to Consider:**
- Task status updates
- Quick edits
- Toggle states

**Implementation:**
```typescript
// Before:
async function updateStatus(id, status) {
  await updateTaskStatus(id, status);
  router.refresh();  // Wait for server
}

// After:
async function updateStatus(id, status) {
  // 1. Optimistic update (instant)
  setTasks(tasks.map(t => t.id === id ? {...t, status} : t));

  try {
    // 2. Server update
    await updateTaskStatus(id, status);
  } catch (error) {
    // 3. Revert on error
    setTasks(originalTasks);
    toast.error('Failed to update status');
  }
}
```

**Estimated Time:** 20 minutes (1-2 components)

---

### Priority 5: Task Drag & Drop (60 min - STRETCH GOAL)
**Kanban-style task status updates**

#### 1. Install dnd-kit Library
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### 2. Create Kanban Board Component
**File:** `components/features/tasks/task-kanban-board.tsx` (~250 lines)

**Implementation Requirements:**
```typescript
'use client';

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskKanbanBoardProps {
  tasks: TaskWithAssignee[];
  projectId: string;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export function TaskKanbanBoard({
  tasks,
  projectId,
  onStatusChange,
}: TaskKanbanBoardProps) {
  const [columns, setColumns] = useState({
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    REVIEW: tasks.filter(t => t.status === 'REVIEW'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  });

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Optimistic update
    // ... move task to new column

    // Server update
    await onStatusChange(taskId, newStatus);
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(columns).map(([status, tasks]) => (
          <Column key={status} status={status} tasks={tasks} />
        ))}
      </div>
    </DndContext>
  );
}

function Column({ status, tasks }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{status}</h3>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <DraggableTaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}

function DraggableTaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}
```

**Features:**
- 4 columns (TODO, IN_PROGRESS, REVIEW, DONE)
- Drag tasks between columns
- Visual feedback during drag
- Optimistic updates
- Touch support (mobile)
- Keyboard accessibility

**Why Client Component:** Drag & drop interactions

---

#### 3. Add View Toggle to Project Detail Page
**File:** `app/(platform)/projects/[projectId]/page.tsx`

**Addition:**
```typescript
// Add toggle between List and Kanban views
<Tabs defaultValue="list">
  <TabsList>
    <TabsTrigger value="list">List View</TabsTrigger>
    <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
  </TabsList>

  <TabsContent value="list">
    <TaskList tasks={tasks} projectId={projectId} />
  </TabsContent>

  <TabsContent value="kanban">
    <TaskKanbanBoard tasks={tasks} projectId={projectId} />
  </TabsContent>
</Tabs>
```

---

## 📋 Technical Tasks Summary

### New Components to Create (11 components)
```
UI Components (3):
├── skeleton-card.tsx            (~50 lines)
├── pagination-controls.tsx      (~120 lines)
└── date-range-picker.tsx        (~150 lines)
└── multi-select.tsx             (~200 lines)

Feature Skeletons (3):
├── customer-list-skeleton.tsx   (~60 lines)
├── project-list-skeleton.tsx    (~60 lines)
└── task-list-skeleton.tsx       (~60 lines)

Filter Components (3):
├── project-filters.tsx          (~150 lines)
└── task-filters.tsx             (~150 lines)

Kanban (STRETCH - 1):
└── task-kanban-board.tsx        (~250 lines)
```

### Files to Modify (9+ files)
```
Pages (4):
├── app/(platform)/crm/page.tsx
├── app/(platform)/projects/page.tsx
├── app/(platform)/projects/[projectId]/page.tsx
└── app/(platform)/crm/[customerId]/page.tsx

Queries (3):
├── lib/modules/crm/queries.ts         (add count query)
├── lib/modules/projects/queries.ts    (add count query)
└── lib/modules/tasks/queries.ts       (add count query)

Filters (1):
├── components/features/crm/customer-filters.tsx  (enhance)

Tools (1):
└── app/(platform)/tools/page.tsx      (fix tier names)
```

### Total Estimated Lines
- **New Components:** ~1,310 lines
- **Modified Files:** ~150 lines
- **Total New Code:** ~1,460 lines

---

## 🧪 Testing Checklist

### Loading States
- [ ] Skeleton displays while loading CRM page
- [ ] Skeleton displays while loading Projects page
- [ ] Skeleton displays while loading Project detail page
- [ ] Skeleton displays while loading Customer detail page
- [ ] Dialog buttons show loading spinner during submit
- [ ] Dialog buttons disabled during submit

### Pagination
- [ ] Page navigation works (prev/next buttons)
- [ ] Page size selector changes items per page
- [ ] URL parameters update on page change
- [ ] Direct URL navigation works (e.g., ?page=3)
- [ ] Correct item count display
- [ ] First/last page buttons disabled appropriately

### Advanced Filtering
- [ ] Date range picker selects ranges correctly
- [ ] Multi-select shows selected badges
- [ ] Filter combinations work (multiple filters)
- [ ] Clear filters button resets all
- [ ] URL parameters update with filters
- [ ] Filters persist on page refresh

### Quick Fixes
- [ ] CreateTaskDialog shows team members
- [ ] Subscription tier comparisons work
- [ ] Optimistic UI updates instantly
- [ ] Errors revert optimistic updates

### Drag & Drop (Stretch)
- [ ] Tasks drag between columns
- [ ] Visual feedback during drag
- [ ] Status updates on drop
- [ ] Optimistic update shows immediately
- [ ] Keyboard accessibility works

---

## ✅ Success Criteria

### Must Complete ✅
- [ ] All list pages have loading skeletons
- [ ] Pagination works on CRM and Projects pages
- [ ] Count queries added for pagination
- [ ] Date range filter component created
- [ ] Multi-select filter component created
- [ ] CreateTaskDialog team members fixed
- [ ] Subscription tier naming fixed
- [ ] All dialogs have loading states
- [ ] URL parameters work for pagination

### Should Complete 🎯
- [ ] Project filters component created
- [ ] Task filters component created
- [ ] Customer filters enhanced
- [ ] Optimistic UI updates on 1-2 operations
- [ ] Loading states on detail pages

### Stretch Goals 🚀
- [ ] Task drag & drop (Kanban board)
- [ ] View toggle (List/Kanban)
- [ ] Saved filter presets
- [ ] Filter chips with remove buttons
- [ ] Keyboard shortcuts for pagination

---

## 🚀 Implementation Order (Recommended)

### Phase 1: Skeletons & Loading States (90 min)
1. Create base SkeletonCard component (15 min)
2. Create CustomerListSkeleton (15 min)
3. Create ProjectListSkeleton (15 min)
4. Create TaskListSkeleton (15 min)
5. Add Suspense to all list pages (20 min)
6. Verify all dialog loading states (10 min)

### Phase 2: Pagination (60 min)
7. Create PaginationControls component (30 min)
8. Add count queries to modules (15 min)
9. Integrate pagination in CRM page (7 min)
10. Integrate pagination in Projects page (8 min)

### Phase 3: Advanced Filtering (90 min)
11. Create DateRangePicker component (30 min)
12. Create MultiSelect component (30 min)
13. Create ProjectFilters component (15 min)
14. Create TaskFilters component (15 min)

### Phase 4: Quick Fixes (30 min)
15. Fix CreateTaskDialog team members (5 min)
16. Fix subscription tier naming (5 min)
17. Add optimistic UI updates (20 min)

### Phase 5: Drag & Drop (STRETCH - 60 min)
18. Install dnd-kit library (5 min)
19. Create TaskKanbanBoard component (40 min)
20. Add view toggle to project detail (15 min)

### Phase 6: Testing & Polish (30 min)
21. Manual testing of all features
22. Fix any TypeScript errors
23. Test URL parameter persistence
24. Verify filter combinations

**Total Estimated Time:** 4-5 hours (includes buffer)

---

## 📚 Reference Documents

### Session History
- **Session 5:** `chat-logs/Session5_Summary.md` (CRM CRUD & Projects start)
- **Session 6:** `chat-logs/Session6_Summary.md` (Tasks & Activity Timeline)

### Project Documentation
- **Build Plan:** `docs/APP_BUILD_PLAN.md` (Phase 3 - 75% complete)
- **Dev Rules:** `CLAUDE.md` (Follow strictly)
- **Architecture:** `docs/README.md` (Tech stack)

### Existing Components to Reference
- **Skeleton:** `components/ui/skeleton.tsx` (from shadcn/ui)
- **Pagination:** None yet (need to create)
- **Filters:** `components/features/crm/customer-filters.tsx` (basic example)

### Libraries to Use
- **dnd-kit:** For drag & drop (stretch goal)
- **date-fns:** Already installed (for date formatting)
- **react-day-picker:** Already installed (for calendars)

---

## 🔮 Session 8 Preview

After completing UI/UX enhancements:
- **Analytics Dashboard** - Charts and metrics visualization
- **Time Tracking** - Start/stop timers for tasks
- **Bulk Operations** - Multi-select actions
- **Email Notifications** - Task assignments, deadlines
- **Export Features** - PDF/CSV exports
- **Search Improvements** - Global search, recent searches

---

## 📝 Pre-Session 7 Checklist

Before starting Session 7:
- [ ] Review Session 6 summary
- [ ] Verify dev server runs (`npm run dev`)
- [ ] Check database connection (Supabase)
- [ ] Review shadcn/ui Skeleton component docs
- [ ] Research dnd-kit library (if doing stretch goal)
- [ ] Understand Next.js searchParams
- [ ] Have example data ready (50+ items for pagination testing)

---

## 🎯 Key Focus Areas

1. **Loading States** - Improve perceived performance with skeletons
2. **Pagination** - Handle large datasets efficiently
3. **Advanced Filtering** - Enable power users to find data
4. **Polish** - Fix known issues and inconsistencies

**Priority Order:** Skeletons → Pagination → Filters → Fixes → Drag & Drop (stretch)

**Time Allocation:**
- Skeletons & Loading: 90 min (30%)
- Pagination: 60 min (20%)
- Advanced Filtering: 90 min (30%)
- Quick Fixes: 30 min (10%)
- Drag & Drop (Stretch): 60 min (20%)
- Testing & Polish: 30 min (10%)

**Total Estimated:** 5 hours (with all stretch goals)
**Minimum Viable:** 4 hours (without drag & drop)

---

**Ready to enhance the user experience! 🚀**

**After Session 7:** Phase 3 will be 85-90% complete, with polished UI/UX and all core features working smoothly.