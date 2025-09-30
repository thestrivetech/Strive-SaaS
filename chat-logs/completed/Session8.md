# Session 8 Tasks - Pagination Integration & Advanced Filtering

**Goal:** Complete pagination integration and implement advanced filtering across all list views
**Starting Point:** Phase 3 - 80% Complete 🚧
**Estimated Duration:** 4-5 hours

---

## 📍 Current Status (From Session 7)

### ✅ Already Completed (Session 7)
- **Loading States & Skeletons:** Complete system ✅
  - Base skeleton components (skeleton-card.tsx)
  - Feature-specific skeletons (CRM, Projects, Tasks)
  - Suspense boundaries in list pages
  - Perceived performance significantly improved

- **Pagination Infrastructure:** Ready to integrate ✅
  - PaginationControls component (170 lines)
  - Count queries in all modules (CRM, Projects, Tasks)
  - URL parameter support ready
  - Smart page number display algorithm

- **Quick Fixes:** All resolved ✅
  - Team members in CreateTaskDialog working
  - Subscription tier naming consistent (BASIC/PRO/ENTERPRISE)
  - TypeScript errors fixed (Decimal conversion)

### 🔧 Carry-Over Tasks from Session 7
- **Pagination Integration** - Not yet integrated in pages
  - PaginationControls component ready
  - Count queries ready
  - Need to update CRM and Projects pages

- **Advanced Filtering** - Backend supports, UI pending
  - Filter queries support complex conditions
  - Need date range picker component
  - Need multi-select component
  - Need filter UI for projects and tasks

- **Optimistic UI Updates** - Actions ready, need React 19 hooks
  - Task status changes
  - Task assignment
  - Quick toggles

---

## 🎯 Session 8 Primary Objectives

### Priority 1: Pagination Integration (Est: 45 min)

#### 1. Integrate Pagination in CRM Page (15 min)
**File:** `app/(platform)/crm/page.tsx`

**Implementation Requirements:**
- Read `page` and `limit` from searchParams
- Calculate offset: `(page - 1) * limit`
- Fetch count with same filters
- Pass to PaginationControls component
- Test with URL params: `/crm?page=2&limit=25`

**Code Pattern:**
```typescript
// Read URL params
const currentPage = parseInt(searchParams.page || '1');
const pageSize = parseInt(searchParams.limit || '25');

// Fetch with pagination
const filters = {
  search: searchParams.search,
  status: searchParams.status,
  source: searchParams.source,
  limit: pageSize,
  offset: (currentPage - 1) * pageSize,
};

const [customers, stats, totalCount] = await Promise.all([
  getCustomers(organizationId, filters),
  getCustomerStats(organizationId),
  getCustomersCount(organizationId, filters),  // Count respects filters
]);

// Render pagination
<PaginationControls
  currentPage={currentPage}
  totalItems={totalCount}
  itemsPerPage={pageSize}
/>
```

**Why Server Component:**
- Reads searchParams natively
- Direct database access
- SEO-friendly URLs
- PaginationControls is client component for interactivity

**Estimated Lines:** ~15 lines added

#### 2. Integrate Pagination in Projects Page (15 min)
**File:** `app/(platform)/projects/page.tsx`

**Implementation Requirements:**
- Same pattern as CRM page
- Read page/limit from searchParams
- Use getProjectsCount with filters
- Add PaginationControls component
- Test with large project lists

**Estimated Lines:** ~15 lines added

#### 3. Optional: Pagination for Task Lists (15 min)
**File:** `app/(platform)/projects/[projectId]/page.tsx`

**Implementation Requirements:**
- Only if project has >50 tasks (rare)
- Same pattern as above
- Use getTasksCount(projectId, filters)
- Conditional rendering (hide if < 50 tasks)

**Decision Point:**
- Check typical task count per project
- If usually < 50, defer this
- If 50+, implement now

**Estimated Lines:** ~15 lines added (if needed)

---

### Priority 2: Date Range Picker Component (Est: 30 min)

#### 1. Create DateRangePicker Component
**File:** `components/ui/date-range-picker.tsx` (~150 lines)

**Implementation Requirements:**
- Use shadcn Calendar component as base
- Display two months side-by-side
- Support start/end date selection
- Show selected range visually
- Preset buttons:
  - Today
  - Yesterday
  - Last 7 Days
  - Last 30 Days
  - This Month
  - Last Month
  - Custom Range

**Component Structure:**
```typescript
'use client';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onSelect: (range: { from?: Date; to?: Date }) => void;
  placeholder?: string;
}

export function DateRangePicker({ from, to, onSelect, placeholder }: DateRangePickerProps) {
  // Preset handlers
  const handlePreset = (preset: string) => {
    const now = new Date();
    switch (preset) {
      case 'today':
        onSelect({ from: now, to: now });
        break;
      case 'last7days':
        const last7 = new Date(now);
        last7.setDate(now.getDate() - 7);
        onSelect({ from: last7, to: now });
        break;
      // ... more presets
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {from && to ? (
            `${format(from, 'MMM d')} - ${format(to, 'MMM d, yyyy')}`
          ) : (
            placeholder || 'Select date range'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Preset buttons */}
          <div className="flex flex-col gap-2 p-3 border-r">
            <Button variant="ghost" size="sm" onClick={() => handlePreset('today')}>
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handlePreset('last7days')}>
              Last 7 Days
            </Button>
            {/* ... more presets */}
          </div>

          {/* Calendar */}
          <Calendar
            mode="range"
            selected={{ from, to }}
            onSelect={onSelect}
            numberOfMonths={2}
            className="p-3"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Why "use client":**
- Event handlers (onClick, onSelect)
- Popover state management
- Interactive calendar

**Testing:**
- Verify preset buttons work
- Verify custom range selection
- Verify display formatting
- Verify date range clearing

**Estimated Lines:** ~150 lines

---

### Priority 3: Multi-Select Component (Est: 30 min)

#### 1. Create MultiSelect Component
**File:** `components/ui/multi-select.tsx` (~200 lines)

**Implementation Requirements:**
- Dropdown with searchable list
- Checkbox for each option
- "Select All" and "Clear All" buttons
- Selected count in trigger button
- Selected items shown as badges
- Remove badge to deselect
- Search/filter options

**Component Structure:**
```typescript
'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items',
  searchPlaceholder = 'Search...',
}: MultiSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    onChange(filteredOptions.map((opt) => opt.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selected.length === 0 ? (
            placeholder
          ) : (
            <span>{selected.length} selected</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        {/* Search input */}
        <div className="p-2 border-b">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="flex-1"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="flex-1"
          >
            Clear All
          </Button>
        </div>

        {/* Options list */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
              onClick={() => handleToggle(option.value)}
            >
              <Checkbox checked={selected.includes(option.value)} />
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>

        {/* Selected badges */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1 p-2 border-t">
            {selected.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                <Badge key={value} variant="secondary" className="gap-1">
                  {option?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(value);
                    }}
                  />
                </Badge>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
```

**Why "use client":**
- useState for search and open state
- Event handlers for interactions
- Popover state management
- Badge removal handlers

**Testing:**
- Verify search filtering works
- Verify select all/clear all
- Verify individual selection
- Verify badge removal
- Verify keyboard navigation

**Estimated Lines:** ~200 lines

---

### Priority 4: Project Filters Component (Est: 30 min)

#### 1. Create ProjectFilters Component
**File:** `components/features/projects/project-filters.tsx` (~150 lines)

**Implementation Requirements:**
- Use MultiSelect for status filter
- Use MultiSelect for priority filter
- Use Select for project manager filter
- Use Select for customer filter
- Use DateRangePicker for created date
- Use DateRangePicker for due date
- "Apply Filters" and "Clear Filters" buttons
- Update URL params on apply

**Component Structure:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ProjectStatus, Priority } from '@prisma/client';

interface ProjectFiltersProps {
  customers: Array<{ id: string; name: string }>;
  teamMembers: Array<{ id: string; name: string }>;
}

export function ProjectFilters({ customers, teamMembers }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    searchParams.get('priority')?.split(',').filter(Boolean) || []
  );
  // ... more state

  const statusOptions = [
    { value: 'PLANNING', label: 'Planning' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update URL params
    if (selectedStatuses.length > 0) {
      params.set('status', selectedStatuses.join(','));
    } else {
      params.delete('status');
    }

    if (selectedPriorities.length > 0) {
      params.set('priority', selectedPriorities.join(','));
    } else {
      params.delete('priority');
    }

    // ... more params

    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    // ... clear more state
    router.push(window.location.pathname); // Clear all params
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {(selectedStatuses.length + selectedPriorities.length) > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedStatuses.length + selectedPriorities.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Projects</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your project list
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Status filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <MultiSelect
              options={statusOptions}
              selected={selectedStatuses}
              onChange={setSelectedStatuses}
              placeholder="Select statuses"
            />
          </div>

          {/* Priority filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <MultiSelect
              options={priorityOptions}
              selected={selectedPriorities}
              onChange={setSelectedPriorities}
              placeholder="Select priorities"
            />
          </div>

          {/* More filters... */}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

**Why "use client":**
- useState for filter state
- useRouter for navigation
- useSearchParams for URL reading
- Event handlers for apply/clear

**Integration:**
- Add to `app/(platform)/projects/page.tsx`
- Fetch customers and teamMembers (already done)
- Pass as props to ProjectFilters
- Update ProjectListContent to read filter params

**Estimated Lines:** ~150 lines

---

### Priority 5: Task Filters Component (Est: 30 min)

#### 1. Create TaskFilters Component
**File:** `components/features/tasks/task-filters.tsx` (~150 lines)

**Implementation Requirements:**
- Same pattern as ProjectFilters
- Status multi-select (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED)
- Priority multi-select
- Assignee select (team members)
- Due date range picker
- Overdue toggle (boolean)
- Apply/Clear buttons

**Similar structure to ProjectFilters, adapted for tasks**

**Integration:**
- Add to `app/(platform)/projects/[projectId]/page.tsx`
- Pass teamMembers prop
- Update TaskList to accept filters
- Update getTasks call to include filter params

**Estimated Lines:** ~150 lines

---

### Priority 6: Enhance Customer Filters (Est: 30 min)

#### 1. Enhance Existing CustomerFilters
**File:** `components/features/crm/customer-filters.tsx` (already exists)

**Current Features:**
- Status dropdown (single select)
- Source dropdown (single select)

**Add to Existing:**
- Convert status to multi-select (allow multiple)
- Convert source to multi-select (allow multiple)
- Add created date range picker
- Add "Last Contact" date range (future field)
- Apply/Clear buttons
- Active filter count badge

**Pattern:**
```typescript
// Current (single select):
<Select onValueChange={(value) => router.push(`?status=${value}`)}>
  ...
</Select>

// New (multi-select):
<MultiSelect
  options={statusOptions}
  selected={selectedStatuses}
  onChange={setSelectedStatuses}
/>
// Then apply on button click
```

**Why Change to Multi-Select:**
- Users often want "ACTIVE or LEAD" customers
- More flexible filtering
- Consistent with ProjectFilters pattern

**Estimated Lines:** ~50 lines added

---

### Priority 7: Optimistic UI Updates (Est: 30 min)

#### 1. Add Optimistic Task Status Updates
**File:** `components/features/tasks/task-list.tsx`

**Implementation Requirements:**
- Use React 19 `useOptimistic` hook
- Show instant status change before server confirms
- Revert on error
- Show loading state during update

**Pattern:**
```typescript
'use client';

import { useOptimistic } from 'react';
import { updateTaskStatus } from '@/lib/modules/tasks/actions';

export function TaskList({ tasks, projectId }) {
  // Optimistic state
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    tasks,
    (state, { taskId, newStatus }) => {
      return state.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
    }
  );

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Update UI immediately
    updateOptimisticTasks({ taskId, newStatus });

    try {
      // Confirm with server
      await updateTaskStatus(taskId, newStatus);
      toast.success('Status updated');
      router.refresh(); // Get real data
    } catch (error) {
      // Optimistic state automatically reverts
      toast.error('Failed to update status');
    }
  };

  // Render with optimisticTasks instead of tasks
  return (
    <div>
      {optimisticTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
```

**Why useOptimistic:**
- Instant feedback (no wait for server)
- Automatic revert on error
- Built into React 19
- No manual state management

**Apply to:**
1. Task status changes (dropdown, drag & drop)
2. Task assignment (assignee dropdown)
3. Quick actions (Mark as Done button)

**Testing:**
- Verify instant UI update
- Verify server confirmation
- Verify revert on error
- Verify loading indicator

**Estimated Lines:** ~30 lines modified

---

### Priority 8 (STRETCH): Task Drag & Drop Kanban (Est: 60 min)

#### 1. Install @dnd-kit Library
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### 2. Create TaskKanbanBoard Component
**File:** `components/features/tasks/task-kanban-board.tsx` (~250 lines)

**Implementation Requirements:**
- 5 columns (one per TaskStatus)
- Drag tasks between columns
- Drop changes status optimistically
- Visual feedback during drag
- Scroll containers if many tasks
- Mobile-friendly (disable on small screens?)

**Component Structure:**
```typescript
'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './task-card';
import { TaskStatus } from '@prisma/client';
import { updateTaskStatus } from '@/lib/modules/tasks/actions';

export function TaskKanbanBoard({ tasks, projectId }) {
  const [items, setItems] = useState(tasks);
  const [activeId, setActiveId] = useState(null);

  const columns: TaskStatus[] = [
    'TODO',
    'IN_PROGRESS',
    'REVIEW',
    'DONE',
    'CANCELLED',
  ];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Optimistic update
    setItems((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success('Task moved');
    } catch (error) {
      // Revert on error
      setItems(tasks);
      toast.error('Failed to move task');
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={({ active }) => setActiveId(active.id)}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => (
          <div key={status} className="flex-shrink-0 w-[300px]">
            <div className="bg-muted/50 p-4 rounded-lg">
              {/* Column header */}
              <h3 className="font-semibold mb-4">
                {statusLabels[status]}
                <Badge variant="secondary" className="ml-2">
                  {items.filter((t) => t.status === status).length}
                </Badge>
              </h3>

              {/* Droppable area */}
              <SortableContext
                id={status}
                items={items.filter((t) => t.status === status).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 min-h-[200px]">
                  {items
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <TaskCard key={task.id} task={task} draggable />
                    ))}
                </div>
              </SortableContext>
            </div>
          </div>
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeId ? (
          <TaskCard
            task={items.find((t) => t.id === activeId)!}
            dragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

**Why "use client":**
- Drag and drop interactions
- useState for active task
- Event handlers for drag events
- Interactive overlay

#### 3. Add View Toggle to Project Detail Page
**File:** `app/(platform)/projects/[projectId]/page.tsx`

**Add toggle between List and Kanban views:**
```typescript
// Add to page (client component wrapper needed):
<Tabs defaultValue="list">
  <TabsList>
    <TabsTrigger value="list">List View</TabsTrigger>
    <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
  </TabsList>
  <TabsContent value="list">
    <TaskList tasks={tasks} projectId={project.id} />
  </TabsContent>
  <TabsContent value="kanban">
    <TaskKanbanBoard tasks={tasks} projectId={project.id} />
  </TabsContent>
</Tabs>
```

**Testing:**
- Verify drag between columns
- Verify status update on drop
- Verify optimistic update
- Verify revert on error
- Verify mobile behavior

**Estimated Lines:** ~250 lines (Kanban) + ~30 lines (toggle)

---

## 📊 Technical Tasks Summary

### Components to Create (8 new components)
1. DateRangePicker (~150 lines)
2. MultiSelect (~200 lines)
3. ProjectFilters (~150 lines)
4. TaskFilters (~150 lines)
5. TaskKanbanBoard (~250 lines) - STRETCH

**Total New Code:** ~650-900 lines (depending on stretch goal)

### Components to Modify (5 existing)
1. CRM page - pagination integration (~15 lines)
2. Projects page - pagination integration (~15 lines)
3. Project detail page - filters integration (~20 lines)
4. CustomerFilters - enhance with date ranges (~50 lines)
5. TaskList - optimistic updates (~30 lines)

**Total Modified Code:** ~130 lines

### Modules to Update
- No new queries needed (all filters already supported)
- Potentially add helper functions for filter parsing

---

## ✅ Testing Checklist

### Pagination Testing
- [ ] CRM page pagination works with URL params
- [ ] Projects page pagination works with URL params
- [ ] Page navigation updates URL correctly
- [ ] Page size selector updates URL correctly
- [ ] Pagination preserves search/filter params
- [ ] Back/forward browser buttons work
- [ ] Direct URL with ?page=X works
- [ ] Total item count is accurate
- [ ] "Showing X to Y of Z" is correct

### Date Range Picker Testing
- [ ] Preset buttons work (Today, Last 7 Days, etc.)
- [ ] Custom range selection works
- [ ] Two-month calendar displays correctly
- [ ] Selected range displays in trigger
- [ ] Clear range works
- [ ] Date formatting is consistent
- [ ] Mobile responsive

### Multi-Select Testing
- [ ] Search filtering works
- [ ] Select All works
- [ ] Clear All works
- [ ] Individual selection works
- [ ] Badge removal works
- [ ] Selected count updates
- [ ] Keyboard navigation works
- [ ] Mobile responsive

### Project Filters Testing
- [ ] All filter types work (status, priority, manager, customer, dates)
- [ ] Apply Filters updates URL
- [ ] Clear Filters resets URL
- [ ] Filter count badge updates
- [ ] Filters persist on page refresh
- [ ] Multiple filters combine correctly (AND logic)
- [ ] Projects list updates after filter

### Task Filters Testing
- [ ] Status multi-select works
- [ ] Priority multi-select works
- [ ] Assignee select works
- [ ] Due date range works
- [ ] Overdue toggle works
- [ ] Filters apply to task list
- [ ] Clear filters works

### Optimistic UI Testing
- [ ] Status change shows immediately
- [ ] Assignment change shows immediately
- [ ] Loading indicator shows during update
- [ ] Success toast on confirm
- [ ] Error toast and revert on failure
- [ ] Multiple rapid changes handled correctly

### Kanban Board Testing (STRETCH)
- [ ] Drag task between columns
- [ ] Status updates on drop
- [ ] Optimistic update shows immediately
- [ ] Visual feedback during drag
- [ ] Drag overlay shows correctly
- [ ] Mobile behavior (disable or different UX?)
- [ ] List/Kanban toggle works
- [ ] View preference persists

---

## 🎯 Success Criteria

### Must Complete ✅
- [x] Pagination working on CRM page
- [x] Pagination working on Projects page
- [x] DateRangePicker component created and working
- [x] MultiSelect component created and working
- [x] ProjectFilters component created and integrated
- [x] TaskFilters component created and integrated
- [x] CustomerFilters enhanced with date ranges
- [x] Optimistic UI updates for task status/assignment
- [x] All filters update URL parameters
- [x] TypeScript passes with no new errors
- [x] Manual testing of all features complete

### Stretch Goals 🎯
- [ ] Task Kanban board with drag & drop
- [ ] View toggle (List/Kanban) on project detail page
- [ ] Keyboard shortcuts for quick actions
- [ ] Filter presets (Save/Load common filters)

### Performance Targets
- **Pagination:** < 100ms page navigation (client-side)
- **Filters:** < 200ms to apply filters
- **Optimistic Updates:** < 16ms UI update (instant)
- **Kanban Drag:** 60 FPS during drag

---

## 🚀 Implementation Order (Recommended)

### Phase 1: Pagination (45 min)
1. Integrate pagination in CRM page (15 min)
2. Test CRM pagination thoroughly (10 min)
3. Integrate pagination in Projects page (15 min)
4. Test Projects pagination (5 min)

**Checkpoint:** Pagination working on both pages

### Phase 2: Reusable Filter Components (60 min)
1. Create DateRangePicker component (30 min)
2. Test DateRangePicker standalone (10 min)
3. Create MultiSelect component (30 min)
4. Test MultiSelect standalone (10 min)

**Checkpoint:** Both components working independently

### Phase 3: Feature-Specific Filters (90 min)
1. Create ProjectFilters component (30 min)
2. Integrate ProjectFilters in Projects page (15 min)
3. Test ProjectFilters end-to-end (10 min)
4. Create TaskFilters component (30 min)
5. Integrate TaskFilters in Project detail (15 min)
6. Test TaskFilters end-to-end (10 min)

**Checkpoint:** Advanced filtering working on Projects and Tasks

### Phase 4: Enhance Customer Filters (30 min)
1. Enhance CustomerFilters with date ranges (20 min)
2. Test CustomerFilters thoroughly (10 min)

**Checkpoint:** All three list views have advanced filtering

### Phase 5: Optimistic Updates (30 min)
1. Add useOptimistic to TaskList (15 min)
2. Test optimistic updates (10 min)
3. Add loading/error states (5 min)

**Checkpoint:** Task updates feel instant

### Phase 6 (STRETCH): Kanban Board (60 min)
1. Install @dnd-kit library (5 min)
2. Create TaskKanbanBoard component (40 min)
3. Add view toggle to project detail (10 min)
4. Test drag & drop thoroughly (15 min)

**Checkpoint:** Kanban board working with drag & drop

### Phase 7: Final Testing & Polish (30 min)
1. Run full test suite (from checklist)
2. Fix any discovered bugs
3. TypeScript type check
4. Create Session 8 summary

**Total Estimated:** 4-5 hours (including stretch goal)

---

## 🔗 Dependencies

### External Libraries
- **@dnd-kit/core** - Drag and drop core (STRETCH GOAL)
- **@dnd-kit/sortable** - Sortable list support (STRETCH GOAL)
- **@dnd-kit/utilities** - Helper utilities (STRETCH GOAL)

### Internal Dependencies
- ✅ shadcn/ui Calendar component (already installed)
- ✅ shadcn/ui Popover component (already installed)
- ✅ shadcn/ui Sheet component (already installed)
- ✅ shadcn/ui Badge component (already installed)
- ✅ date-fns for date formatting (already installed)
- ✅ React 19 useOptimistic hook (already available)

### Module Dependencies
- ✅ All count queries ready
- ✅ All filter queries support complex conditions
- ✅ Server actions ready for optimistic updates
- ✅ URL parameter parsing ready

---

## 📝 Notes & Considerations

### URL Parameter Structure
```
# Pagination
?page=2&limit=50

# Single filters
?status=ACTIVE&priority=HIGH

# Multi-select filters (comma-separated)
?status=ACTIVE,LEAD&priority=HIGH,CRITICAL

# Date ranges (ISO format)
?createdFrom=2025-01-01&createdTo=2025-01-31

# Combined example
/projects?page=2&limit=25&status=ACTIVE,PLANNING&priority=HIGH&manager=user123
```

### Filter Logic
- Multiple values in one filter = OR logic (status=ACTIVE OR LEAD)
- Multiple filters = AND logic (status AND priority AND dates)
- Empty filter = not applied (all values included)

### Mobile Considerations
- DateRangePicker: Single month on mobile
- MultiSelect: Full-screen sheet on mobile
- ProjectFilters: Full-screen sheet (already using Sheet component)
- Kanban board: Disable drag on mobile? Or horizontal scroll?

### Accessibility
- All components keyboard navigable
- ARIA labels on interactive elements
- Focus management in popovers/sheets
- Screen reader announcements for optimistic updates

### Performance
- Debounce search in MultiSelect (300ms)
- Virtualize long lists in MultiSelect (if >100 options)
- Memoize filter calculations
- Use React.memo for TaskCard (prevent re-renders during drag)

---

## 🎯 Expected Outcomes

**After Session 8 completion:**

1. **Phase 3 Progress:** 80% → 90% (+10%)
   - UI/UX Enhancements: 40% → 85% (+45%)
   - CRM System: 82% → 90% (+8%)
   - Project Management: 92% → 95% (+3%)
   - Task Management: 87% → 92% (+5%)

2. **User Experience:**
   - Pagination handles large datasets efficiently
   - Advanced filters enable precise data querying
   - Optimistic updates feel instant
   - Kanban board provides alternative workflow (stretch)

3. **Technical Debt:**
   - All infrastructure from Session 7 now integrated
   - Filter system complete and consistent
   - URL state management proven pattern

4. **Ready for Next Phase:**
   - With pagination + filtering complete, Phase 3 SaaS features nearly done
   - Can move to AI integration features
   - Can add real-time collaboration

---

## 🔮 Next Session Preview (Session 9)

### Focus Areas:
1. **AI Chat Integration** - OpenRouter/Groq chat interface
2. **Real-Time Updates** - Supabase Realtime for multi-user
3. **Bulk Operations** - Select multiple, bulk actions
4. **Export Features** - CSV, PDF exports

**Phase 3 Target:** 95-100% complete after Session 9

---

**Session 8 Ready to Begin!**

All infrastructure in place, clear objectives defined, implementation order planned. Estimated 4-5 hours to complete, with clear checkpoints along the way.