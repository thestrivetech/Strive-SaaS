# Deleted Routes Archive

**Date:** 2025-10-05
**Refactor:** Platform Directory Restructure v2.0

## Purpose
These files were deleted during the multi-industry architecture refactor. They are preserved here for reference in case functionality needs to be restored.

## What Changed
- Old structure: Duplicate routes across `app/dashboard/`, `app/projects/`, `app/crm/`, etc.
- New structure: Consolidated under `app/real-estate/` with role-based dashboards

## Archived Files (16 total)

### Dashboard Routes
- `dashboard-page.tsx` - Old dashboard page
- `dashboard-layout.tsx` - Old dashboard layout

### Project Routes
- `projects-page.tsx` - Project list page
- `projects-layout.tsx` - Project layout
- `projects-detail-page.tsx` - Individual project page

### Settings Routes
- `settings-page.tsx` - Settings main page
- `settings-layout.tsx` - Settings layout
- `settings-team-page.tsx` - Team settings page

### Tools Routes
- `tools-page.tsx` - Tools marketplace page
- `tools-layout.tsx` - Tools layout

### AI Routes
- `ai-page.tsx` - AI assistant page
- `ai-layout.tsx` - AI layout

### CRM Routes
- `crm-page.tsx` - CRM main page
- `crm-layout.tsx` - CRM layout
- `crm-customer-detail-page.tsx` - Customer detail page

### Protected Routes
- `protected-transactions-analytics-page.tsx` - Transaction analytics (was in (protected) group)

## Recovery
To restore functionality:
1. Review archived file
2. Adapt to new structure under `app/real-estate/`
3. Update imports to match new paths
4. Test thoroughly

## References
- Refactor Plan: `update-sessions/(project)-directory-refactor.md`
- Cleanup Guide: `update-sessions/refactor-testing-&-cleanup.md`
- New Structure: `CLAUDE.md` v2.0
