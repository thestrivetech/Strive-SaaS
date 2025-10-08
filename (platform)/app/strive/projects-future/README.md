# Projects Module (Future Implementation)

**Status:** Not yet implemented
**Planned for:** Q2 2026
**Purpose:** Project management for Strive Tech clients

## Components Preserved

**Total:** 8 components moved from `components/real-estate/projects/`

### Dialog Components
- `create-project-dialog.tsx` - Project creation form
- `edit-project-dialog.tsx` - Project editing form
- `delete-project-dialog.tsx` - Project deletion confirmation
- `project-filters.tsx` - Project filtering controls
- `project-list-skeleton.tsx` - Loading skeleton

### Organization Components
- `organization/invite-member-dialog.tsx` - Invite members to organization
- `organization/create-organization-dialog.tsx` - Create new organization
- `organization/organization-switcher.tsx` - Switch between organizations

## Implementation Notes

- Do not use in production yet
- Components may need updates when implemented
- Will require:
  - Database schema for projects
  - API routes for project CRUD
  - RBAC permissions for project access
  - Multi-tenant isolation (RLS)

## Integration Plan

When ready to implement:

1. **Database Schema**
   - Add Project model to Prisma schema
   - Include organizationId for multi-tenancy
   - Add RLS policies

2. **Backend Logic**
   - Create `lib/modules/projects/` module
   - Implement Server Actions (create, update, delete)
   - Add queries for project data

3. **Frontend Routes**
   - Create `app/real-estate/projects/` route structure
   - Integrate these preserved components
   - Add project dashboard and detail pages

4. **RBAC & Tiers**
   - Define which subscription tiers can access projects
   - Set up permission checks in Server Actions
   - Implement TierGate on project routes

## Preserved From

Original location: `components/real-estate/projects/`
Moved on: 2025-10-08
Reason: Component audit cleanup - preserving for future implementation
