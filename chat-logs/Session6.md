# Session 6 Tasks - Project Details, Task Management & Activity Timeline

**Date:** TBD (Next Session)
**Goal:** Complete Projects module with task management and add activity timelines
**Starting Point:** Phase 3 - 50% Complete 🚧 (CRM Full CRUD ✅ | Projects Started ✅)
**Phase Reference:** Phase 3 (Week 5-8) - CRM System & Project Management
**Estimated Duration:** 3-4 hours

---

## 📍 Current Status (From Session 5)

### ✅ Already Completed
- **Phase 1 & 2:** 100% complete ✅
- **CRM System:** Full CRUD with search/filter (80% complete)
  - Customer creation, editing, deletion
  - Customer detail pages
  - Search by name/email/company (debounced)
  - Filter by status and source
  - Actions dropdown menu
- **Projects Module:** Foundation built (40% complete)
  - Module structure (schemas, queries, actions)
  - Project list with real data
  - Project creation dialog
  - Statistics dashboard
  - Progress calculation from tasks
- **Organization Management:** Complete with context switching
  - Cookie-based organization context
  - Organization switcher with loading states
  - Multi-tenancy enforced everywhere

### 🔧 Carry-Over Tasks from Session 5
- Project detail pages (module ready, needs UI)
- Task management system (no module yet)
- Team members dropdown (limited to current user)
- Customer activity timeline (ActivityLog populated, needs UI)
- Pagination for large datasets (backend ready)
- Loading states and skeletons

---

## 🎯 Session 6 Primary Objectives

### Priority 1: Project Detail Pages & Task Management
**Complete the Projects module with full task functionality**

#### 1. Project Detail Page
**File:** `app/app/(platform)/projects/[projectId]/page.tsx`

**Implementation Requirements:**
- Server Component for performance
- Dynamic route using App Router
- Full project information display:
  - Project name, description, status, priority
  - Customer information with link
  - Project manager with avatar
  - Budget and date range
  - Progress bar with percentage
  - Created/updated timestamps
- Related data sections:
  - Task list or Kanban board view
  - Team members assigned
  - Activity timeline
  - Project milestones (future)
- Edit and Delete buttons in header
- Back to Projects navigation

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│ Header: Project Name | Edit | Delete     │
├─────────────────────────────────────────┤
│ ┌───────────────┐  ┌──────────────────┐ │
│ │ Project Info  │  │   Sidebar        │ │
│ │ - Customer    │  │ - Status         │ │
│ │ - Manager     │  │ - Priority       │ │
│ │ - Progress    │  │ - Dates          │ │
│ │ - Description │  │ - Budget         │ │
│ │               │  │ - Team Members   │ │
│ │ ┌───────────┐ │  │                  │ │
│ │ │   Tasks   │ │  └──────────────────┘ │
│ │ │  Section  │ │                        │
│ │ │           │ │                        │
│ │ └───────────┘ │                        │
│ └───────────────┘                        │
└─────────────────────────────────────────┘
```

**Why Server Component:**
- Fetch project data on server
- SEO-friendly for project pages
- Faster initial load with RSC
- Direct database access

**Estimated Lines:** ~250 lines (server component with layout)

---

#### 2. Task Management Module
**Create:** `app/lib/modules/tasks/`

##### A. Task Schemas
**File:** `app/lib/modules/tasks/schemas.ts`

**Schemas to Define:**
```typescript
export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  projectId: z.string().min(1),
  assignedToId: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.number().positive().optional(),
});

export const updateTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  estimatedHours: z.number().positive().optional().nullable(),
});

export const taskFiltersSchema = z.object({
  projectId: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().positive().max(100).optional(),
  offset: z.number().nonnegative().optional(),
});
```

**Enums (from Prisma):**
- TaskStatus: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED
- TaskPriority: LOW, MEDIUM, HIGH, CRITICAL

**Estimated Lines:** ~40 lines

##### B. Task Queries
**File:** `app/lib/modules/tasks/queries.ts`

**Functions to Implement:**
```typescript
// Get tasks for a project
export async function getTasks(
  projectId: string,
  filters?: TaskFilters
): Promise<TaskWithAssignee[]>

// Get single task by ID
export async function getTaskById(
  taskId: string,
  organizationId: string
): Promise<TaskWithDetails | null>

// Get task statistics for a project
export async function getTaskStats(projectId: string): Promise<{
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  doneTasks: number;
  overdueTasks: number;
}>

// Get tasks assigned to a user
export async function getUserTasks(
  userId: string,
  organizationId: string,
  filters?: TaskFilters
): Promise<TaskWithProject[]>
```

**Type Definitions:**
```typescript
type TaskWithAssignee = Prisma.TaskGetPayload<{
  include: {
    assignedTo: { select: { id, name, email, avatarUrl } };
  };
}>;

type TaskWithDetails = Prisma.TaskGetPayload<{
  include: {
    assignedTo: { select: { id, name, email, avatarUrl } };
    project: { select: { id, name, customer } };
  };
}>;
```

**Estimated Lines:** ~150 lines

##### C. Task Actions
**File:** `app/lib/modules/tasks/actions.ts`

**Server Actions to Implement:**
```typescript
// Create new task
export async function createTask(input: CreateTaskInput): Promise<Task>

// Update existing task
export async function updateTask(input: UpdateTaskInput): Promise<Task>

// Delete task
export async function deleteTask(taskId: string): Promise<{ success: boolean }>

// Update task status (for quick status changes)
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<Task>

// Assign task to user
export async function assignTask(
  taskId: string,
  userId: string | null
): Promise<Task>
```

**Security Checks (All Actions):**
- Verify user authentication
- Check organization access via project
- Validate input with Zod
- Log activity for audit trail
- Revalidate relevant paths

**Estimated Lines:** ~200 lines

---

#### 3. Task Components

##### A. Create Task Dialog
**File:** `app/components/features/tasks/create-task-dialog.tsx`

**Implementation:**
- Client Component with React Hook Form
- Form fields:
  - Title (required)
  - Description (textarea, optional)
  - Assigned To (dropdown from team)
  - Status (dropdown: Todo/In Progress/In Review/Done/Cancelled)
  - Priority (dropdown: Low/Medium/High/Critical)
  - Due Date (date picker)
  - Estimated Hours (number input)
- Hidden projectId field
- Zod validation with resolver
- Connect to createTask action
- Toast notifications
- Refresh on success

**Props:**
```typescript
interface CreateTaskDialogProps {
  projectId: string;
  teamMembers?: Pick<User, 'id' | 'name'>[];
  children?: React.ReactNode;
}
```

**Estimated Lines:** ~280 lines (form component)

##### B. Task List Component
**File:** `app/components/features/tasks/task-list.tsx`

**Implementation:**
- Client Component (needs drag & drop state)
- Display tasks in list format
- Each task card shows:
  - Title and description preview
  - Status badge
  - Priority badge
  - Assigned user avatar
  - Due date with overdue indicator
- Quick actions:
  - Status update dropdown
  - Edit button
  - Delete button
- Group by status (optional)
- Sort options (priority, due date, created)
- Empty state when no tasks

**Props:**
```typescript
interface TaskListProps {
  tasks: TaskWithAssignee[];
  projectId: string;
  teamMembers?: Pick<User, 'id' | 'name'>[];
}
```

**Estimated Lines:** ~200 lines

##### C. Edit Task Dialog
**File:** `app/components/features/tasks/edit-task-dialog.tsx`

**Implementation:**
- Similar to CreateTaskDialog
- Pre-populate with existing task data
- Connect to updateTask action
- useEffect to reset on task change
- All same fields as create

**Estimated Lines:** ~280 lines (form component)

##### D. Task Card Component
**File:** `app/components/features/tasks/task-card.tsx`

**Implementation:**
- Small reusable card for task display
- Shows key task info
- Click to expand/navigate
- Status indicator
- Priority badge
- Assignee avatar
- Due date badge

**Estimated Lines:** ~100 lines

---

### Priority 2: Activity Timeline Component
**Display activity logs for customers and projects**

#### 1. Activity Timeline Component
**File:** `app/components/features/shared/activity-timeline.tsx`

**Implementation:**
- Server Component (fetches from ActivityLog)
- Props:
  - resourceType: 'customer' | 'project' | 'task'
  - resourceId: string
  - organizationId: string
- Query ActivityLog for resource
- Display in chronological order (newest first)
- Each entry shows:
  - User who performed action
  - Action type (created, updated, deleted)
  - Timestamp (relative time)
  - Changed fields (for updates)
  - Old/new values (if relevant)
- Group by date
- Limit to last 50 entries
- "View All" link for full history

**Activity Types:**
```typescript
type ActivityAction =
  | 'created_customer' | 'updated_customer' | 'deleted_customer'
  | 'created_project' | 'updated_project' | 'deleted_project'
  | 'created_task' | 'updated_task' | 'deleted_task';
```

**Display Format:**
```
Today
  • John Doe updated customer status to "Active" (2 hours ago)
  • Jane Smith created task "Design mockups" (4 hours ago)

Yesterday
  • Bob Johnson updated project due date (Yesterday at 3:45 PM)
  • Alice Brown created customer "Acme Corp" (Yesterday at 9:30 AM)
```

**Estimated Lines:** ~180 lines

#### 2. Activity Query Function
**File:** `app/lib/modules/dashboard/queries.ts` (modify existing)

**Add Function:**
```typescript
export async function getActivityLogs(
  organizationId: string,
  resourceType?: string,
  resourceId?: string,
  limit: number = 50
): Promise<ActivityLogWithUser[]> {
  // Fetch from ActivityLog table
  // Include user information
  // Filter by resource if specified
  // Sort by createdAt desc
  // Limit results
}

type ActivityLogWithUser = Prisma.ActivityLogGetPayload<{
  include: {
    user: { select: { id, name, email, avatarUrl } };
  };
}>;
```

**Estimated Lines:** ~40 lines (add to existing file)

#### 3. Integrate Timeline in Detail Pages
**Files to Modify:**
- `app/app/(platform)/crm/[customerId]/page.tsx` - Add activity timeline section
- `app/app/(platform)/projects/[projectId]/page.tsx` - Add activity timeline section

**Changes:**
- Import ActivityTimeline component
- Add timeline section in layout
- Pass resourceType, resourceId, organizationId

**Example:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Activity Timeline</CardTitle>
  </CardHeader>
  <CardContent>
    <ActivityTimeline
      resourceType="project"
      resourceId={project.id}
      organizationId={currentOrg.organizationId}
    />
  </CardContent>
</Card>
```

---

### Priority 3: Fix Team Members & Improve Dropdowns
**Get proper organization members for assignment dropdowns**

#### 1. Organization Members Query
**File:** `app/lib/modules/organization/queries.ts` (modify existing)

**Add Function:**
```typescript
export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMemberWithUser[]> {
  return prisma.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { user: { name: 'asc' } },
  });
}

type OrganizationMemberWithUser = Prisma.OrganizationMemberGetPayload<{
  include: {
    user: { select: { id, name, email, avatarUrl } };
  };
}>;
```

**Estimated Lines:** ~20 lines (add to existing file)

#### 2. Update Projects Page
**File:** `app/app/(platform)/projects/page.tsx` (modify existing)

**Changes:**
- Import getOrganizationMembers
- Fetch org members instead of hardcoded current user
- Map to teamMembers format
- Pass to CreateProjectDialog

**Before:**
```typescript
const teamMembers = [{
  id: user.id,
  name: user.name || user.email,
}];
```

**After:**
```typescript
const orgMembers = await getOrganizationMembers(currentOrg.organizationId);
const teamMembers = orgMembers.map(m => ({
  id: m.user.id,
  name: m.user.name || m.user.email,
}));
```

#### 3. Update All Assignment Dropdowns
**Files to Update:**
- CreateProjectDialog (already receives teamMembers prop)
- CreateTaskDialog (add teamMembers prop)
- EditTaskDialog (add teamMembers prop)

**Ensure Consistency:**
- All use same teamMembers format
- Show "(You)" indicator for current user
- Show avatar in dropdown (future enhancement)

---

### Priority 4: Edit & Delete Projects
**Complete Project CRUD operations**

#### 1. Edit Project Dialog
**File:** `app/components/features/projects/edit-project-dialog.tsx`

**Implementation:**
- Copy CreateProjectDialog pattern
- Pre-populate with existing project data
- Connect to updateProject action
- useEffect to reset on project change
- All same fields as create
- Handle null values (dates, budget)

**Props:**
```typescript
interface EditProjectDialogProps {
  project: Project;
  customers?: Pick<Customer, 'id' | 'name'>[];
  teamMembers?: Pick<User, 'id' | 'name'>[];
  children?: React.ReactNode;
}
```

**Estimated Lines:** ~320 lines (form component)

#### 2. Delete Project Dialog
**File:** `app/components/features/projects/delete-project-dialog.tsx`

**Implementation:**
- AlertDialog for confirmation
- Show project name
- Warning about cascade:
  - "All tasks related to this project will also be deleted"
- Connect to deleteProject action
- Loading state
- Toast notifications
- Redirect to projects list

**Props:**
```typescript
interface DeleteProjectDialogProps {
  projectId: string;
  projectName: string;
  children?: React.ReactNode;
}
```

**Estimated Lines:** ~75 lines

#### 3. Integrate in Project Detail Page
**File:** `app/app/(platform)/projects/[projectId]/page.tsx`

**Changes:**
- Import EditProjectDialog and DeleteProjectDialog
- Add Edit button in header
- Add Delete button in header
- Pass project data and options

---

## 📋 Technical Tasks Summary

### New Modules to Create (1 module)
```
lib/modules/tasks/
├── schemas.ts           # Task validation schemas (3 schemas)
├── queries.ts           # Task database queries (4 functions)
└── actions.ts           # Task server actions (5 actions)
```

### Components to Create (10 new)
```typescript
// Task Components
- CreateTaskDialog           # New task form
- EditTaskDialog             # Edit task form
- TaskList                   # Task list display
- TaskCard                   # Individual task card

// Project Components
- EditProjectDialog          # Edit project form
- DeleteProjectDialog        # Delete confirmation

// Shared Components
- ActivityTimeline           # Activity log display

// Pages
- app/(platform)/projects/[projectId]/page.tsx  # Project detail view
```

### Files to Modify (4 files)
```typescript
- app/(platform)/projects/page.tsx              # Add getOrganizationMembers
- app/(platform)/crm/[customerId]/page.tsx      # Add ActivityTimeline
- lib/modules/organization/queries.ts           # Add getOrganizationMembers
- lib/modules/dashboard/queries.ts              # Add getActivityLogs
```

---

## 🧪 Testing Checklist

### Project Detail Testing
- [ ] Project detail page displays all information correctly
- [ ] Tasks list shows all project tasks
- [ ] Edit button opens dialog with pre-filled data
- [ ] Delete button shows confirmation
- [ ] Activity timeline displays recent actions
- [ ] Navigation back to projects works

### Task Management Testing
- [ ] Can create tasks with all fields
- [ ] Tasks display in list/board correctly
- [ ] Can update task status quickly
- [ ] Can edit task details
- [ ] Can delete tasks with confirmation
- [ ] Task assignment to team members works
- [ ] Task statistics calculate correctly

### Activity Timeline Testing
- [ ] Timeline shows all activity for resource
- [ ] Activities grouped by date
- [ ] User names and timestamps correct
- [ ] Changed fields display properly
- [ ] Timeline updates after actions

### Team Members Testing
- [ ] Organization members fetch correctly
- [ ] All assignment dropdowns show full team
- [ ] Current user indicated in dropdowns
- [ ] Unassigned option available

### Project CRUD Testing
- [ ] Can edit project details
- [ ] Can delete projects with cascade warning
- [ ] Project updates reflect immediately
- [ ] Statistics recalculate after changes

---

## 🛠️ Technical Debt to Address

### High Priority
1. **Standardize Subscription Tiers**
   - Fix tools page to use BASIC/PRO/ENTERPRISE
   - Update all tier comparisons
   - Ensure consistency across app
   - **Estimate:** 30 minutes

2. **Add Loading States**
   - Skeleton for project detail page
   - Skeleton for task list
   - Loading spinner for async actions
   - Disable buttons during submission
   - **Estimate:** 45 minutes

3. **Error Boundaries**
   - Add to project routes
   - Add to task operations
   - Implement fallback UI
   - Log errors properly
   - **Estimate:** 30 minutes

### Medium Priority
4. **Pagination Components**
   - Create reusable pagination component
   - Add to CRM list
   - Add to Projects list
   - Add to Task lists
   - Show total count
   - **Estimate:** 60 minutes

5. **Improved Date Handling**
   - Create date formatter utility
   - Consistent date display format
   - Relative time helper (updated X ago)
   - Timezone awareness
   - **Estimate:** 30 minutes

### Low Priority
6. **Task Drag & Drop (Kanban)**
   - Implement drag & drop for task status
   - Visual feedback during drag
   - Optimistic updates
   - Revert on error
   - **Estimate:** 90 minutes (stretch goal)

---

## ✅ Session 6 Success Criteria

### Must Complete ✅
- [ ] Project detail pages working with full information
- [ ] Task creation, editing, deletion functional
- [ ] Task list/board displays correctly
- [ ] Activity timeline shows on customer/project pages
- [ ] Team members dropdown shows all org members
- [ ] Project edit/delete operational

### Stretch Goals 🎯
- [ ] Task drag & drop (Kanban board style)
- [ ] Task filtering in project view
- [ ] Pagination on all lists
- [ ] Loading skeletons everywhere
- [ ] Bulk task operations

### Definition of Done 📋
- [ ] Full CRUD on projects (create, read, update, delete)
- [ ] Full CRUD on tasks (create, read, update, delete)
- [ ] Activity timeline functional on detail pages
- [ ] Team members properly fetched and displayed
- [ ] No new TypeScript errors
- [ ] All new components follow file size limits
- [ ] Multi-tenancy enforced on all new actions
- [ ] Activity logging for all mutations

---

## 🚀 Implementation Order (Recommended)

### Phase 1: Task Module Foundation (60 min)
1. Create tasks schemas (15 min)
2. Create tasks queries (30 min)
3. Create tasks actions (15 min)

### Phase 2: Task UI Components (90 min)
4. Create CreateTaskDialog (30 min)
5. Create TaskList component (30 min)
6. Create EditTaskDialog (20 min)
7. Create TaskCard component (10 min)

### Phase 3: Project Detail Page (60 min)
8. Create project detail page (40 min)
9. Integrate task list in project page (10 min)
10. Add EditProjectDialog (from create pattern) (10 min)

### Phase 4: Activity Timeline (45 min)
11. Add getActivityLogs query (10 min)
12. Create ActivityTimeline component (25 min)
13. Integrate in customer detail page (5 min)
14. Integrate in project detail page (5 min)

### Phase 5: Team Members Fix (30 min)
15. Add getOrganizationMembers query (10 min)
16. Update projects page to fetch members (10 min)
17. Test all assignment dropdowns (10 min)

### Phase 6: Testing & Polish (30 min)
18. Manual testing of all features
19. Fix any TypeScript errors
20. Add loading states if time permits

**Total Estimated Time:** ~5 hours (includes buffer)

---

## 📚 Reference Documents

### Session History
- **Session 1:** `chat-logs/session1.md` (Foundation)
- **Session 2:** `chat-logs/Session2.md` (Dashboard backend)
- **Session 3:** `chat-logs/Session3.md` (Auth & org backend)
- **Session 4:** `chat-logs/Session4.md` (Team UI & CRM start)
- **Session 5:** `chat-logs/Session5_Summary.md` (CRM CRUD & Projects start)

### Project Documentation
- **Build Plan:** `docs/APP_BUILD_PLAN.md` (Phase 3 - 50% complete)
- **Dev Rules:** `CLAUDE.md` (Follow strictly)
- **Architecture:** `docs/README.md` (Tech stack)
- **Database Schema:** `app/prisma/schema.prisma` (Reference for Task model)

### Existing Modules (To Reference)
- **CRM Module:** `app/lib/modules/crm/` (Pattern for task module)
- **Projects Module:** `app/lib/modules/projects/` (Already complete)
- **Organization Module:** `app/lib/modules/organization/` (For team members)

### Existing Components (To Reference)
- **CreateCustomerDialog:** `app/components/features/crm/create-customer-dialog.tsx` (Form pattern)
- **CreateProjectDialog:** `app/components/features/projects/create-project-dialog.tsx` (Form pattern)
- **CustomerActionsMenu:** `app/components/features/crm/customer-actions-menu.tsx` (Menu pattern)

---

## 🔮 Session 7 Preview

After completing Projects & Tasks:
- **Analytics Dashboard** - Project/task metrics and visualizations
- **AI Integration** - Sai Assistant chat interface
- **Tool Marketplace** - Browse and activate tools
- **Advanced Filtering** - Saved filters, date ranges
- **Email Notifications** - Task assignments, deadlines
- **Time Tracking** - Task time logs and reporting

---

## 📝 Pre-Session 6 Checklist

Before starting Session 6:
- [ ] Review Session 5 summary
- [ ] Verify dev server runs (`npm run dev`)
- [ ] Check database connection (Supabase)
- [ ] Review projects module code (schemas, queries, actions)
- [ ] Review Task model in Prisma schema
- [ ] Understand multi-tenancy pattern
- [ ] Have test data ready (projects with customer/manager)

---

## 🎯 Key Focus Areas

1. **Complete Projects Module** - Full CRUD with task management
2. **Task Management** - Create comprehensive task system
3. **Activity Timeline** - Visualize audit logs
4. **Team Members** - Fix assignment dropdowns

**Priority Order:** Task Module → Project Details → Activity Timeline → Team Fix

**Time Allocation:**
- Task Module: 90 min
- Task UI: 90 min
- Project Details: 60 min
- Activity Timeline: 45 min
- Team Members Fix: 30 min
- Testing & Polish: 30 min

**Total Estimated:** 5.5 hours (with buffer)

---

**Ready to complete the Projects module and make it fully functional! 🚀**

**After Session 6:** Projects will be 90% complete, ready for time tracking and advanced features.