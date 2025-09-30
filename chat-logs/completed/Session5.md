# Session 5 Tasks - Complete CRM CRUD & Start Projects

**Date:** TBD (Next Session)
**Goal:** Complete CRM functionality with full CRUD operations and begin Projects module
**Starting Point:** Phase 2 - 100% Complete ✅ | Phase 3 - 30% Complete 🚧
**Phase Reference:** Phase 3 (Week 5-8) - CRM System & Project Management
**Estimated Duration:** 3-4 hours

---

## 📍 Current Status (From Session 4)

### ✅ Already Completed
- Phase 2 - Team Management 100% complete
- Organization creation, invitation, and management UI
- CRM module architecture (schemas, queries, actions)
- Customer list page with real database integration
- Customer creation dialog with validation
- Multi-tenancy enforcement across all operations
- Activity logging for audit trail
- Toast notification system (Sonner)

### 🔧 Carry-Over Tasks from Session 4
- Customer detail pages (backend ready, needs UI)
- Customer edit/delete UI (actions exist, needs connection)
- CRM search and filter functionality
- Organization context switching (component exists, needs logic)

---

## 🎯 Session 5 Primary Objectives

### Priority 1: Complete CRM CRUD Operations
**Finish the Customer Management system**

#### 1. Customer Detail Page
**File:** `app/(platform)/crm/[customerId]/page.tsx`
- Create dynamic route for individual customers
- Display full customer information:
  - Contact details (name, email, phone, company)
  - Status and source badges
  - Assigned team member
  - Created/updated timestamps
- Show related data:
  - Associated projects list
  - Upcoming appointments
  - Activity timeline from ActivityLog
- Add edit and delete buttons in header
- Add "Back to CRM" navigation

**Why Server Component:**
- Fetch customer data on server
- SEO-friendly for customer profiles
- Faster initial load with RSC

#### 2. Customer Edit Dialog
**File:** `app/components/features/crm/edit-customer-dialog.tsx`
- Reuse CreateCustomerDialog structure
- Pre-populate form with existing customer data
- Connect to updateCustomer server action
- Handle optimistic UI updates
- Show success/error toasts
- Auto-refresh parent page

**Pattern:**
```typescript
<EditCustomerDialog
  customer={existingCustomer}
  organizationId={orgId}
/>
```

#### 3. Customer Delete Confirmation
**File:** `app/components/features/crm/delete-customer-dialog.tsx`
- Create confirmation dialog with warning
- Show customer name to confirm intent
- Connect to deleteCustomer server action
- Handle cascade implications (projects, appointments)
- Show toast on success/failure
- Redirect to CRM list after delete

**Pattern:**
```typescript
<AlertDialog>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
    <AlertDialogDescription>
      This will permanently delete {customer.name} and all associated data.
    </AlertDialogDescription>
    {/* Delete button with action */}
  </AlertDialogContent>
</AlertDialog>
```

#### 4. Connect Dropdown Menu Actions
**File:** `app/(platform)/crm/page.tsx` (existing)
- Make dropdown items functional:
  - "View details" → Navigate to `/crm/[id]`
  - "Edit customer" → Open EditCustomerDialog
  - "Delete customer" → Open DeleteCustomerDialog
- Add loading states during actions
- Handle errors gracefully

---

### Priority 2: CRM Search & Filter
**Add search and filtering capabilities**

#### 1. Search Input Component
**File:** `app/components/features/crm/customer-search.tsx` (client component)
- Debounced search input (300ms delay)
- Search by: name, email, company
- Clear button when text entered
- Show search icon
- Connect to URL search params

**Why Client Component:**
- Needs useState for debouncing
- Interactive typing experience
- Updates URL params for sharing

#### 2. Filter Dropdowns
**File:** `app/components/features/crm/customer-filters.tsx` (client component)
- Status filter (Lead, Prospect, Active, Churned, All)
- Source filter (Website, Referral, Social, Email, Other, All)
- Assigned To filter (team members dropdown)
- Clear all filters button
- Connect to URL search params

#### 3. Update CRM Page with Filters
**File:** `app/(platform)/crm/page.tsx` (modify existing)
- Read search params from URL
- Pass filters to getCustomers query
- Add CustomerSearch and CustomerFilters components
- Show active filter badges
- Maintain filters across page refreshes

**Pattern:**
```typescript
export default async function CRMPage({ searchParams }) {
  const filters = {
    search: searchParams.search,
    status: searchParams.status,
    source: searchParams.source,
  };
  const customers = await getCustomers(orgId, filters);
  // ...
}
```

---

### Priority 3: Organization Context Switching
**Enable multi-organization switching**

#### 1. Organization Context Cookie
**File:** `app/lib/modules/organization/context.ts`
- Create helper functions:
  - `setCurrentOrganization(orgId)` - Set cookie
  - `getCurrentOrganization(userId)` - Get from cookie or default
- Cookie config:
  - httpOnly: false (need client access)
  - secure: true (HTTPS only in prod)
  - sameSite: 'lax'
  - maxAge: 30 days

#### 2. Update OrganizationSwitcher
**File:** `app/components/features/organization/organization-switcher.tsx`
- Connect to setCurrentOrganization action
- Show loading state during switch
- Refresh page after switch (router.refresh())
- Update UI to show current org from cookie

#### 3. Update All Queries to Use Context
**Files:** All pages with org queries
- Dashboard: Use org from context
- CRM: Use org from context
- Settings: Use org from context
- Projects: Use org from context (when implemented)

**Helper Function:**
```typescript
async function getActiveOrganization(userId: string) {
  const orgId = getCurrentOrganization(userId);
  if (orgId) {
    return await getOrganization(orgId);
  }
  // Fallback to first org
  const userOrgs = await getUserOrganizations(userId);
  return userOrgs[0]?.organization;
}
```

---

### Priority 4: Start Projects Module
**Begin project management system**

#### 1. Create Projects Module Structure
```
app/lib/modules/projects/
├── schemas.ts       # Project, Task validation schemas
├── queries.ts       # getProjects, getTasks, getProjectById
├── actions.ts       # createProject, updateProject, deleteProject
└── types.ts         # Project-specific types (optional)
```

**schemas.ts - Key Schemas:**
- `createProjectSchema` - Name, description, customer, dates, budget
- `updateProjectSchema` - Partial project updates
- `projectFiltersSchema` - Status, priority, date range
- `createTaskSchema` - Task creation (for later)

**queries.ts - Key Functions:**
- `getProjects(orgId, filters)` - List with pagination
- `getProjectById(id, orgId)` - Full project with tasks
- `getProjectStats(orgId)` - Dashboard metrics
- Calculate progress from tasks

**actions.ts - Key Actions:**
- `createProject(data)` - With validation and logging
- `updateProject(id, data)` - Update fields
- `deleteProject(id)` - Cascade to tasks
- All with multi-tenancy checks

#### 2. Connect Projects Page to Database
**File:** `app/(platform)/projects/page.tsx` (modify existing)
- Replace mock data with real queries
- Fetch projects from database
- Calculate progress from tasks
- Show team member avatars
- Add statistics cards:
  - Total projects
  - Active projects
  - Completed projects
  - Total budget/revenue
- Add CreateProjectDialog button

#### 3. Create Project Dialog
**File:** `app/components/features/projects/create-project-dialog.tsx`
- Form fields:
  - Name (required)
  - Description (textarea)
  - Customer (dropdown from CRM)
  - Project manager (dropdown from team)
  - Status (dropdown: Planning, Active, On Hold, Completed, Cancelled)
  - Priority (dropdown: Low, Medium, High, Critical)
  - Start date (date picker)
  - Due date (date picker)
  - Budget (optional number)
- React Hook Form + Zod validation
- Connect to createProject action
- Toast notifications
- Refresh on success

---

## 📋 Technical Tasks Summary

### Components to Create (8 new)
```typescript
// CRM Components
- EditCustomerDialog          # Customer edit form
- DeleteCustomerDialog        # Deletion confirmation
- CustomerSearch              # Debounced search input
- CustomerFilters             # Status/source filters
- CustomerDetailCard          # Full customer info display
- CustomerActivityTimeline    # Activity log display

// Projects Components
- CreateProjectDialog         # New project form
- ProjectCard                 # Project summary card (enhance existing)
```

### Server Actions to Implement (1 new)
```typescript
// Organization Context
- setCurrentOrganization(orgId: string) → Cookie
- getCurrentOrganization(userId: string) → orgId
```

### Files to Modify (5 files)
```typescript
- app/(platform)/crm/page.tsx              # Add search/filter, connect actions
- app/(platform)/projects/page.tsx         # Replace mock data
- app/components/features/organization/    # Add context switching
  organization-switcher.tsx
```

---

## 🧪 Testing Checklist

### CRM CRUD Testing
- [ ] View customer detail page
- [ ] Edit customer information successfully
- [ ] Delete customer with confirmation
- [ ] Search finds customers by name/email/company
- [ ] Status filter works correctly
- [ ] Source filter works correctly
- [ ] Multiple filters work together
- [ ] Filters persist in URL
- [ ] Empty states display correctly

### Organization Switching Testing
- [ ] Can switch between organizations
- [ ] Correct org data loads after switch
- [ ] Cookie persists across sessions
- [ ] Switching refreshes all pages
- [ ] Can't access other org's data

### Projects Testing
- [ ] Projects display real data
- [ ] Can create new project
- [ ] Form validation works
- [ ] Progress calculates from tasks
- [ ] Team members display correctly
- [ ] Statistics are accurate

---

## 🛠️ Technical Debt to Address

### High Priority
1. **Standardize Subscription Tiers**
   - Fix tools page to use BASIC/PRO/ENTERPRISE
   - Update all tier comparisons
   - Ensure consistency across app

2. **Add Loading States**
   - Skeleton for customer table
   - Skeleton for project cards
   - Loading spinner for dialogs
   - Disable buttons during submission

### Medium Priority
1. **Error Boundaries**
   - Add to CRM routes
   - Add to Projects routes
   - Implement fallback UI
   - Log errors properly

2. **Pagination for Large Lists**
   - Implement offset/limit in queries
   - Add pagination controls to tables
   - Show total count
   - Remember page in URL

### Low Priority
1. **URL Search Params Helpers**
   - Create utility for reading/writing params
   - Type-safe param parsing
   - Maintain params across navigation

---

## ✅ Session 5 Success Criteria

### Must Complete ✅
- [ ] Customer detail pages working
- [ ] Customer edit/delete functional
- [ ] CRM search and filter operational
- [ ] Organization context switching works
- [ ] Projects page displays real data
- [ ] Project creation dialog functional

### Stretch Goals 🎯
- [ ] Customer activity timeline
- [ ] Project edit/delete
- [ ] Task list on project detail
- [ ] Loading states added
- [ ] Pagination implemented

### Definition of Done 📋
- [ ] Full CRUD on customers (view, edit, delete)
- [ ] Can search and filter customers
- [ ] Can switch organizations seamlessly
- [ ] Projects use real database
- [ ] Can create projects with validation
- [ ] No new TypeScript errors
- [ ] All new components under 200 lines

---

## 📚 Reference Documents

### Previous Sessions
- **Session 1:** `chat-logs/session1.md` (Foundation)
- **Session 2:** `chat-logs/Session2.md` (Dashboard backend)
- **Session 3:** `chat-logs/Session3.md` (Auth & org backend)
- **Session 4:** `chat-logs/Session4.md` (Team UI & CRM start)

### Documentation
- **Build Plan:** `docs/APP_BUILD_PLAN.md` (Phase 3 - 30% complete)
- **Dev Rules:** `CLAUDE.md` (Follow strictly)
- **Schema:** `app/prisma/schema.prisma` (Reference for types)

### Existing Modules
- **Organization Module:** `app/lib/modules/organization/` (Complete)
- **Dashboard Module:** `app/lib/modules/dashboard/` (Complete)
- **CRM Module:** `app/lib/modules/crm/` (30% - needs UI completion)

### Components Directory
- **Organization Features:** `app/components/features/organization/`
- **CRM Features:** `app/components/features/crm/`
- **Projects Features:** `app/components/features/projects/` (to create)

---

## 🔮 Session 6 Preview

After completing CRM and starting Projects:
- Project detail pages with task management
- Task Kanban board implementation
- Time tracking integration
- Advanced CRM features (pipeline, notes)
- Analytics and reporting dashboards
- Begin AI integration (Sai Assistant)

---

## 📝 Pre-Session 5 Checklist

Before starting Session 5:
- [ ] Review Session 4 summary and decisions
- [ ] Verify dev server runs (`npm run dev`)
- [ ] Check database connection (Supabase)
- [ ] Review CRM module code (schemas, queries, actions)
- [ ] Understand multi-tenancy pattern
- [ ] Have test organization with data ready

---

## 🎯 Key Focus Areas

1. **Complete CRM CRUD** - Finish what we started
2. **Search & Filter** - Make CRM useful with lots of data
3. **Org Switching** - Enable multi-tenant experience
4. **Projects Start** - Begin next major feature

**Priority Order:** CRM CRUD → Search/Filter → Org Switching → Projects

**Time Allocation:**
- CRM Detail/Edit/Delete: 60 min
- Search & Filter: 45 min
- Org Switching: 30 min
- Projects Module: 60 min
- Testing & Polish: 30 min

**Total Estimated:** 3.5 hours

---

**Ready to complete CRM and launch Projects! 🚀**