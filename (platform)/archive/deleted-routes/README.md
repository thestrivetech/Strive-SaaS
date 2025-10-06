# Deleted Routes Archive

**Date:** 2025-10-05
**Refactor:** Platform Directory Restructure v2.0

## Purpose
These files were deleted during the multi-industry architecture refactor. They are preserved here for reference in case functionality needs to be restored.

## What Changed
- Old structure: Duplicate routes across `app/dashboard/`, `app/projects/`, `app/crm/`, etc.
- New structure: Consolidated under `app/real-estate/` with role-based dashboards

## Status Update (2025-10-05 - Refactor Session 2)

### ✅ Restored:
- **protected-transactions-analytics-page.tsx** → `app/real-estate/workspace/analytics/page.tsx`

### 🗑️ Deleted (Not Needed):
- Dashboard routes (dashboard-page.tsx, dashboard-layout.tsx)
- Project routes (projects-page.tsx, projects-layout.tsx, projects-detail-page.tsx)
- Tools routes (tools-page.tsx, tools-layout.tsx)
- AI routes (ai-page.tsx, ai-layout.tsx)
- CRM routes (crm-page.tsx, crm-layout.tsx, crm-customer-detail-page.tsx)
- Protected route (protected-transactions-analytics-page.tsx - restored, so deleted from archive)
- **Reason:** These don't fit the new multi-industry architecture. CRM functionality already exists in `app/real-estate/crm/`.

### 📋 Kept for Future Implementation:
- **settings-page.tsx** - Planned as shared module at `app/settings/`
- **settings-layout.tsx** - Settings layout component
- **settings-team-page.tsx** - Team management page
- **Reason:** Settings will be shared across ALL industries (not industry-specific), so will be implemented as a standalone shared module.

## Archived Files (3 remaining)

### Settings Routes (Future Shared Module)
- `settings-page.tsx` - Settings main page (planned for `app/settings/`)
- `settings-layout.tsx` - Settings layout
- `settings-team-page.tsx` - Team settings page

## Recovery
To implement settings module:
1. Create `app/settings/` directory structure
2. Adapt archived settings files to new architecture
3. Ensure settings work across all industries (Real Estate, Healthcare, etc.)
4. Update imports to match new paths
5. Test thoroughly across different industries and roles

## References
- Refactor Plan: `update-sessions/(project)-directory-refactor.md`
- Cleanup Guide: `update-sessions/refactor-testing-&-cleanup.md`
- New Structure: `CLAUDE.md` v2.0
