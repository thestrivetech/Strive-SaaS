# Session 2: Content Module - Backend & Validation - Todo List

**Session Date:** 2025-10-05
**Status:** IN PROGRESS
**Dependencies:** Session 1 (Database Schema) - COMPLETE

---

## 📋 Task Breakdown

### Phase 1: Environment Setup & Validation
- [ ] 1.1 Navigate to (platform) directory
- [ ] 1.2 Verify Prisma client has ContentItem types available
- [ ] 1.3 Generate Prisma client if needed
- [ ] 1.4 Verify database schema contains all ContentPilot models
- [ ] 1.5 Check existing lib/modules/content/ structure

### Phase 2: Content Module Structure
- [ ] 2.1 Create lib/modules/content/content/ directory structure
- [ ] 2.2 Create lib/modules/content/media/ directory structure
- [ ] 2.3 Create lib/modules/content/campaigns/ directory structure
- [ ] 2.4 Verify directory permissions and structure

### Phase 3: Content Schemas Implementation
- [ ] 3.1 Create schemas.ts with ContentItemSchema
- [ ] 3.2 Add UpdateContentSchema
- [ ] 3.3 Add PublishContentSchema
- [ ] 3.4 Add ContentFiltersSchema
- [ ] 3.5 Export all schema types
- [ ] 3.6 Validate Zod schemas with comprehensive rules

### Phase 4: Content Queries Implementation
- [ ] 4.1 Create queries.ts with RLS context helper
- [ ] 4.2 Implement getContentItems with filters
- [ ] 4.3 Implement getContentItemById
- [ ] 4.4 Implement getContentBySlug (public)
- [ ] 4.5 Implement getContentStats
- [ ] 4.6 Implement getContentCount
- [ ] 4.7 Add React cache() optimization
- [ ] 4.8 Verify multi-tenancy enforcement

### Phase 5: Content Actions Implementation
- [ ] 5.1 Create actions.ts with createContentItem
- [ ] 5.2 Implement updateContentItem with revision tracking
- [ ] 5.3 Implement publishContent (with scheduling)
- [ ] 5.4 Implement unpublishContent
- [ ] 5.5 Implement deleteContent
- [ ] 5.6 Add RBAC checks for all actions
- [ ] 5.7 Add revalidatePath calls
- [ ] 5.8 Verify organizationId isolation

### Phase 6: Content Helpers Implementation
- [ ] 6.1 Create helpers.ts with generateUniqueSlug
- [ ] 6.2 Implement isSlugTaken
- [ ] 6.3 Implement generateExcerpt (SEO)
- [ ] 6.4 Implement extractKeywords
- [ ] 6.5 Implement validateSEO
- [ ] 6.6 Export all helper functions

### Phase 7: RBAC Permissions
- [ ] 7.1 Add canAccessContent to lib/auth/rbac.ts
- [ ] 7.2 Add canCreateContent
- [ ] 7.3 Add canPublishContent
- [ ] 7.4 Add canDeleteContent
- [ ] 7.5 Add getContentLimits (tier enforcement)
- [ ] 7.6 Verify GROWTH+ tier requirement
- [ ] 7.7 Update auth/constants.ts if needed

### Phase 8: Module Public API
- [ ] 8.1 Create content/index.ts with schema exports
- [ ] 8.2 Export query functions
- [ ] 8.3 Export action functions
- [ ] 8.4 Export helper functions
- [ ] 8.5 Export Prisma types (ContentItem, ContentType, ContentStatus)
- [ ] 8.6 Update main lib/modules/content/index.ts

### Phase 9: Testing
- [ ] 9.1 Create __tests__/modules/content/ directory
- [ ] 9.2 Create content.test.ts with createContentItem test
- [ ] 9.3 Add generateUniqueSlug test
- [ ] 9.4 Add validateSEO test
- [ ] 9.5 Add multi-tenancy isolation test
- [ ] 9.6 Run tests and verify 80%+ coverage

### Phase 10: Verification & Validation
- [ ] 10.1 Run TypeScript compilation (npx tsc --noEmit)
- [ ] 10.2 Verify zero TypeScript errors
- [ ] 10.3 Run ESLint (npm run lint)
- [ ] 10.4 Verify all files under 500 lines
- [ ] 10.5 Check RBAC permissions work correctly
- [ ] 10.6 Verify multi-tenancy isolation
- [ ] 10.7 Test slug generation uniqueness

### Phase 11: Documentation & Summary
- [ ] 11.1 Create session2-summary.md
- [ ] 11.2 Document all files created/modified
- [ ] 11.3 Include verification command outputs
- [ ] 11.4 List any issues or blockers
- [ ] 11.5 Document next steps for Session 3
- [ ] 11.6 Verify summary is comprehensive

---

## 🔴 BLOCKING CRITERIA

**DO NOT report success unless:**
- ✅ All TypeScript compilation passes (npx tsc --noEmit)
- ✅ All files under 500 lines
- ✅ All RBAC functions added to rbac.ts
- ✅ Multi-tenancy verified (organizationId in all queries)
- ✅ RLS context set in all queries
- ✅ Revision system functional (creates revision before update)
- ✅ Slug generation produces unique slugs
- ✅ SEO validation works correctly
- ✅ Tests written and passing
- ✅ session2-summary.md created with verification proof

---

## 📊 Progress Tracking

**Total Tasks:** 67
**Completed:** 0
**In Progress:** 0
**Blocked:** 0
**Progress:** 0%

**Estimated Time Remaining:** 4-5 hours

---

## 🔧 Verification Commands

```bash
# TypeScript validation
npx tsc --noEmit 2>&1 | head -50

# Linting
npm run lint 2>&1 | grep -E "(error|warning)" | head -20

# Tests
npm test -- __tests__/modules/content 2>&1

# Prisma client check
npx prisma generate --schema=../shared/prisma/schema.prisma

# File size check
find lib/modules/content -name "*.ts" -exec wc -l {} \; | sort -rn
```

---

**Last Updated:** 2025-10-05
**Status:** READY TO START
