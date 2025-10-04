# Session 1.1: Fix Cross-Project Imports - PLAN

**Date:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Duration:** ~30-45 minutes
**Dependencies:** Session 1 Complete
**Parallel Safe:** Yes (isolated to website project)

---

## 🎯 Session Objectives

Fix all cross-project imports in the (website) project to ensure proper project isolation and prevent circular dependencies or incorrect import paths.

### Current Problem

The website project has imports that:
1. ❌ Reference paths outside the project incorrectly (`../../website/data/`)
2. ❌ May reference the platform project when they shouldn't
3. ❌ Use confusing relative paths that go up and back down
4. ⚠️ May have remnants of old project structure

### Correct Import Patterns

**Within Website Project:**
```typescript
// ✅ CORRECT - Import from same project
import { solutions } from '@/data/solutions';
import { Button } from '@/components/ui/button';
import { Hero } from '@/components/(web)/home/hero';
```

**From Shared Resources:**
```typescript
// ✅ CORRECT - Import from shared (when needed)
import { prisma } from '@/shared/prisma/client';
import type { User } from '@/shared/prisma/types';
```

**From Chatbot Project (future):**
```typescript
// ✅ CORRECT - Import chatbot component (when implementing)
import { ChatWidget } from '@/(chatbot)/components/chat-widget';
```

**NEVER Do This:**
```typescript
// ❌ WRONG - Don't reference platform
import { something } from '@/(platform)/lib/utils';
import { Component } from '../../platform/components/something';

// ❌ WRONG - Circular/confusing paths
import { data } from '../../website/data/something';

// ❌ WRONG - Going up to root then back down to website
import { solutions } from '../../../(website)/data/solutions';
```

---

## 📋 Task Breakdown

### Phase 1: Audit All Imports (10 minutes)

#### Task 1.1: Find All Import Statements
Search for all import statements that might be problematic:

```bash
# Find imports that reference other projects
grep -r "from.*\.\./\.\./\.\." "(website)/" --include="*.ts" --include="*.tsx"
grep -r "from.*platform" "(website)/" --include="*.ts" --include="*.tsx"
grep -r "from.*chatbot" "(website)/" --include="*.ts" --include="*.tsx"
grep -r "from.*website" "(website)/" --include="*.ts" --include="*.tsx"
```

**Expected Issues:**
- `data/index.ts` - Already partially fixed but may have more issues
- Other data files that might have cross-references
- Component files that might reference platform components
- Utility files that might share code incorrectly

#### Task 1.2: Create Audit Report
Document all problematic imports found:
- File path
- Current import statement
- Why it's wrong
- Correct import statement

---

### Phase 2: Fix Data Layer Imports (10 minutes)

#### Task 2.1: Review data/index.ts
**Current State (partially fixed in Session 1):**
```typescript
// data/index.ts - CURRENT
export * from './industries';
export * from './industry-cards';
export { solutions, solutionTypeOptions, /* ... */ } from './solutions';
export * from './projects';
```

**Issues to Check:**
- Ensure no `../../website/` paths remain
- Verify all relative paths are correct
- Check if `./projects` exists and exports correctly

#### Task 2.2: Check All Data Files
Files to review:
- `data/solutions.tsx`
- `data/industries.tsx`
- `data/industry-cards.tsx`
- `data/industry-statistics.ts`
- `data/solutions-mapping.ts`
- `data/projects/index.ts`
- All files in `data/resources/`

**Action:**
- Ensure all imports within data/ use relative paths
- No external project references
- No `../../website/` patterns

---

### Phase 3: Fix Component Imports (10 minutes)

#### Task 3.1: Review Component Files
Check components for incorrect imports:

```bash
# Find any imports that go up too many levels
grep -r "from.*\.\.\/\.\.\/\.\." "(website)/components/" --include="*.ts" --include="*.tsx"

# Find any @/ imports that might be wrong
grep -r "from.*@/.*platform" "(website)/components/" --include="*.ts" --include="*.tsx"
```

#### Task 3.2: Fix Component Imports
Common patterns to fix:

```typescript
// BEFORE (WRONG)
import { something } from '../../platform/lib/utils';
import { data } from '../../../website/data/solutions';

// AFTER (CORRECT)
import { something } from '@/lib/utils';  // Use website's own utils
import { data } from '@/data/solutions';   // Use @/ alias
```

---

### Phase 4: Fix Hook and Lib Imports (5 minutes)

#### Task 4.1: Review Hooks
Check `hooks/` directory:
- `hooks/use-toast.ts` ✅ (no external imports)
- `hooks/use-seo.ts` ✅ (no external imports)

#### Task 4.2: Review Lib Files
Check `lib/` directory:
- `lib/utils.ts` ✅ (already reviewed - uses clsx and tailwind-merge)

---

### Phase 5: Fix App Routes Imports (5 minutes)

#### Task 5.1: Check All Page Files
Review all `app/` route files:

```bash
# Find all page.tsx files
find "(website)/app" -name "page.tsx" -type f

# Check their imports
grep -r "from.*@/" "(website)/app/" --include="*.tsx" | grep -v "node_modules"
```

**Files to review:**
- `app/page.tsx` ✅ (already created correctly)
- `app/layout.tsx` ✅ (already reviewed)
- `app/about/page.tsx`
- `app/solutions/page.tsx` ✅ (partially fixed)
- `app/resources/page.tsx`
- `app/portfolio/page.tsx`
- `app/contact/page.tsx`
- `app/assessment/page.tsx`
- All solution pages in `app/solutions/*/page.tsx`

**Common fixes needed:**
```typescript
// BEFORE
import { solutions } from "@/data/(web)/solutions";

// AFTER
import { solutions } from "@/data";
```

---

### Phase 6: Update TypeScript Paths (if needed) (5 minutes)

#### Task 6.1: Review tsconfig.json
Check that path aliases are correct:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Ensure:**
- `@/*` maps to website root (`./*`)
- No references to platform or other projects
- Clean and simple configuration

---

### Phase 7: Test and Verify (10 minutes)

#### Task 7.1: Run Type Check
```bash
cd "(website)"
npm run type-check
```

Fix any TypeScript errors that arise from import changes.

#### Task 7.2: Start Dev Server
```bash
cd "(website)"
npm run dev
```

**Verify:**
- Server starts without errors
- No module resolution errors
- Homepage loads at http://localhost:3000
- Navigation works
- No console errors

#### Task 7.3: Test Key Routes
Manually test:
- `/` - Homepage
- `/about` - About page
- `/solutions` - Solutions page
- `/contact` - Contact page
- `/resources` - Resources page

**For each route:**
- ✅ Page loads
- ✅ No console errors
- ✅ Components render correctly
- ✅ No import errors in browser console

---

## 📊 Files to Review/Fix

### High Priority (Likely Issues)
1. ✅ `data/index.ts` - Partially fixed, verify complete
2. ⚠️ `app/solutions/page.tsx` - Partially fixed, verify
3. ⚠️ `app/resources/page.tsx` - Not reviewed yet
4. ⚠️ `app/portfolio/page.tsx` - Not reviewed yet
5. ⚠️ `app/contact/page.tsx` - Not reviewed yet
6. ⚠️ All solution sub-pages

### Medium Priority (Check for Safety)
7. All files in `data/resources/` (blog posts, case studies, etc.)
8. All files in `data/projects/`
9. All component files created in Session 1

### Low Priority (Should be OK)
10. UI components (created fresh in Session 1)
11. Homepage components (created fresh in Session 1)
12. Hooks (created fresh in Session 1)

---

## 🎯 Success Criteria

- [ ] Zero imports referencing `(platform)/`
- [ ] Zero imports with `../../website/` patterns
- [ ] Zero imports with confusing relative paths going up 3+ levels
- [ ] All imports use either:
  - `@/` alias for project files
  - `./` or `../` for nearby files (1 level max)
  - Absolute package imports (`react`, `next`, etc.)
- [ ] TypeScript compiles with 0 errors
- [ ] Dev server starts successfully
- [ ] All key routes load without errors
- [ ] No module resolution errors in browser console

---

## 🔧 Common Fix Patterns

### Pattern 1: Fix Data Import Paths
```typescript
// BEFORE
export * from '../../website/data/resources';

// AFTER
export * from './resources';  // Relative to current file
```

### Pattern 2: Fix Component Imports in Pages
```typescript
// BEFORE
import { solutions } from "@/data/(web)/solutions";

// AFTER
import { solutions } from "@/data";
// OR
import { solutions } from "@/data/solutions";
```

### Pattern 3: Fix Cross-Project Component Usage
```typescript
// BEFORE (if found)
import { PlatformButton } from "@/(platform)/components/ui/button";

// AFTER - Use website's own button
import { Button } from "@/components/ui/button";
```

### Pattern 4: Shared Resources (Future)
```typescript
// When we need shared Prisma types
import type { User } from "@/shared/prisma/types";

// When we need shared utilities (if created)
import { sharedUtil } from "@/shared/lib/utils";
```

---

## 📝 Audit Checklist

### Data Layer
- [ ] `data/index.ts` - No `../../website/` paths
- [ ] `data/solutions.tsx` - Only local imports
- [ ] `data/industries.tsx` - Only local imports
- [ ] `data/industry-cards.tsx` - Only local imports
- [ ] `data/projects/index.ts` - Only local imports
- [ ] `data/resources/**/*` - All files clean

### Components
- [ ] All `components/(web)/**/*` - No cross-project imports
- [ ] All `components/ui/**/*` - Only local imports

### App Routes
- [ ] `app/page.tsx` - Clean imports ✅
- [ ] `app/layout.tsx` - Clean imports ✅
- [ ] `app/about/page.tsx` - Review needed
- [ ] `app/solutions/page.tsx` - Partially fixed, verify
- [ ] `app/resources/page.tsx` - Review needed
- [ ] `app/portfolio/page.tsx` - Review needed
- [ ] `app/contact/page.tsx` - Review needed
- [ ] `app/assessment/page.tsx` - Review needed
- [ ] All solution sub-pages - Review needed

### Utilities
- [ ] `lib/utils.ts` - Clean ✅
- [ ] `hooks/use-toast.ts` - Clean ✅
- [ ] `hooks/use-seo.ts` - Clean ✅

---

## 🚀 Quick Start Commands

```bash
# Navigate to project
cd "(website)"

# Audit - Find problematic imports
grep -r "from.*\.\./\.\./\.\." . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
grep -r "from.*platform" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
grep -r "from.*website" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules

# After fixes - Test
npm run type-check
npm run lint
npm run dev
```

---

## 🔗 Integration Points

### With Session 1
- Builds on foundation created in Session 1
- Fixes import issues discovered after initial build
- Ensures proper project isolation

### With Future Sessions
- Enables clean integration of chatbot (Session 4+)
- Prevents import confusion in larger codebase
- Establishes pattern for proper project boundaries

---

## ⚠️ Important Notes

### Project Isolation Principle
Each project in the tri-fold repository should be independent:
- `(website)/` - Marketing site (this project)
- `(platform)/` - SaaS platform (separate)
- `(chatbot)/` - Chatbot widget (separate)
- `shared/` - Shared resources (Prisma, Supabase config)

### Import Rules
1. **Website** can import from:
   - ✅ Itself (`@/` or relative paths)
   - ✅ `shared/` (database, auth)
   - ✅ `(chatbot)/` (when embedding chatbot widget)
   - ❌ NOT from `(platform)/`

2. **Platform** can import from:
   - ✅ Itself
   - ✅ `shared/`
   - ✅ `(chatbot)/` (when embedding chatbot)
   - ❌ NOT from `(website)/`

3. **Chatbot** can import from:
   - ✅ Itself
   - ✅ `shared/`
   - ❌ NOT from `(platform)/` or `(website)/`

### Why This Matters
- **Independent deployment** - Each project can be deployed separately
- **No circular dependencies** - Prevents build issues
- **Clear boundaries** - Easier to understand and maintain
- **Scalability** - Can move projects to separate repos if needed
- **Team collaboration** - Different teams can work on different projects

---

## 📖 Reference Files

**Read before starting:**
- `../CLAUDE.md` - Tri-fold repository structure and rules
- `./CLAUDE.md` - Website-specific development rules
- Session 1 summary - What was created and current state

**Similar Patterns:**
- Check `(platform)/` imports for comparison (what NOT to do from website)
- Check `shared/` structure for proper shared resource imports

---

## 🎨 Expected Outcomes

After this session:
1. ✅ All imports properly scoped to website project
2. ✅ No cross-project contamination
3. ✅ TypeScript compiles cleanly
4. ✅ Dev server runs without module errors
5. ✅ Clear pattern established for future development
6. ✅ Documentation of proper import patterns

**This ensures:**
- Clean project architecture
- Independent deployability
- No mysterious import errors
- Future-proof for chatbot integration
- Easy to understand for new developers

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Next Session:** SESSION 2 - Fix Middleware & Complete Testing
