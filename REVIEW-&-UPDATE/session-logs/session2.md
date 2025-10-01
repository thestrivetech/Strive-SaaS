# Session 2 Plan - A+ Implementation: Complete File Size Compliance

**Goal:** Fix all remaining file-size violations + middleware refactoring
**Status:** 2/7 files compliant | 5 files remaining (3,019 lines to refactor)
**Estimated Time:** 6-8 hours

---

## 📋 TODO LIST (From Session 1)

### ✅ Completed (Session 1)
- [x] Delete app/app/(platform)/page.tsx route conflict
- [x] Split resources/page.tsx (1808 lines → 259 lines)
- [x] Split chatbot-sai/page.tsx (544 lines → 475 lines)

### 🔴 CRITICAL - File Size Violations (5 files)
**These BLOCK ESLint and must be fixed:**

#### Priority 1: Quick Wins (2-3 hours)
1. **[ ] about/page.tsx (581 lines → <500)**
   - Extract: AboutHero, AboutContent, AboutTeam sections
   - Estimated: 45 min

2. **[ ] contact/page.tsx (645 lines → <500)**
   - Extract: ContactForm, ContactInfo, MapSection
   - Estimated: 1 hour

#### Priority 2: Medium Complexity (3-4 hours)
3. **[ ] assessment/page.tsx (700 lines → <500)**
   - Extract: AssessmentQuiz, QuestionFlow, ResultsDisplay
   - Similar to resources QuizModal pattern
   - Estimated: 1.5 hours

4. **[ ] request/page.tsx (920 lines → <500)**
   - Extract: RequestForm, FormFields, FormValidation
   - Large form with multiple steps
   - Estimated: 2 hours

#### Priority 3: Most Complex (3 hours)
5. **[ ] solutions/page.tsx (1173 lines → <500)**
   - Extract: SolutionFilters, SolutionGrid, SolutionModal
   - Extract: IndustryCards, FilterLogic hook
   - Complex filtering + correlation logic
   - Estimated: 3 hours

---

## 🔧 MIDDLEWARE REFACTORING (1-2 hours)

### Current: middleware.ts (242 lines)
**Target:** <150 lines (orchestrator only)

**Tasks:**
6. **[ ] Extract CORS logic → lib/middleware/cors.ts**
   - Handle CORS for analytics endpoints
   - ~40 lines

7. **[ ] Extract auth logic → lib/middleware/auth.ts**
   - Supabase auth client creation
   - User authentication checks
   - Admin role verification
   - ~80 lines

8. **[ ] Extract routing logic → lib/middleware/routing.ts**
   - Host-based routing (chatbot, marketing, platform)
   - Route protection logic
   - ~60 lines

9. **[ ] Simplify main middleware.ts to orchestrator**
   - Import and chain middleware functions
   - Keep only orchestration logic
   - Target: ~100 lines

---

## 🔒 SECURITY HARDENING (1-2 hours)

10. **[ ] Add Zod validation to API routes**
    - `api/chat/route.ts` - validate message input
    - `api/analytics/*/route.ts` - validate analytics data
    - Any other public API routes

11. **[ ] Add server-only guards to sensitive operations**
    - Add `import 'server-only'` to sensitive files
    - Database operations
    - API key usage

---

## ✅ VERIFICATION & TESTING (30 min)

12. **[ ] Run type-check: `npx tsc --noEmit`**
    - Fix any TypeScript errors
    - Verify all imports resolve

13. **[ ] Run lint: `npm run lint`**
    - Should pass with 0 errors
    - All files under 500 lines

14. **[ ] Test refactored pages**
    - Manually test each refactored page
    - Verify functionality preserved

---

## 📦 DETAILED BREAKDOWN

### Task 1: about/page.tsx (45 min)

**Current:** 581 lines
**Target:** <400 lines

**Components to Extract:**
```
components/about/
├── AboutHero.tsx (~80 lines)
├── AboutContent.tsx (~100 lines)
└── AboutTeam.tsx (~120 lines)
```

**Main page:** ~280 lines (orchestrator)

---

### Task 2: contact/page.tsx (1 hour)

**Current:** 645 lines
**Target:** <400 lines

**Components to Extract:**
```
components/contact/
├── ContactForm.tsx (~200 lines)
├── ContactInfo.tsx (~80 lines)
└── MapSection.tsx (~60 lines)
```

**Main page:** ~305 lines

---

### Task 3: assessment/page.tsx (1.5 hours)

**Current:** 700 lines
**Target:** <450 lines

**Components to Extract:**
```
components/assessment/
├── AssessmentQuiz.tsx (~200 lines)
├── QuestionFlow.tsx (~150 lines)
└── ResultsDisplay.tsx (~100 lines)
```

**Main page:** ~250 lines

**Note:** Similar pattern to resources QuizModal - reuse architecture

---

### Task 4: request/page.tsx (2 hours)

**Current:** 920 lines
**Target:** <450 lines

**Components to Extract:**
```
components/request/
├── RequestForm.tsx (~250 lines)
├── FormSteps.tsx (~150 lines)
├── FormFields.tsx (~100 lines)
└── FormValidation.tsx (~80 lines)
```

**Hook to Extract:**
```
lib/hooks/useRequestForm.ts (~150 lines)
```

**Main page:** ~190 lines

---

### Task 5: solutions/page.tsx (3 hours) ⚠️ MOST COMPLEX

**Current:** 1,173 lines
**Target:** <450 lines

**Components to Extract:**
```
components/solutions/
├── SolutionFilters.tsx (~200 lines)
├── SolutionGrid.tsx (~250 lines)
├── SolutionModal.tsx (~150 lines)
└── IndustryCards.tsx (~100 lines)
```

**Hooks to Extract:**
```
lib/hooks/
├── useSolutionFilters.ts (~250 lines)
└── useSolutionCorrelations.ts (~150 lines)
```

**Main page:** ~273 lines

**Complexity:**
- Industry-solution correlation mappings
- Complex filtering logic (industry + solution type)
- URL parameter handling
- Modal state management

---

### Task 6-9: Middleware Refactoring (1-2 hours)

**Current Structure:**
```typescript
middleware.ts (242 lines)
├── CORS handling (~40 lines)
├── Auth logic (~80 lines)
├── Routing logic (~60 lines)
└── Other (~62 lines)
```

**Target Structure:**
```typescript
middleware.ts (~100 lines) - Orchestrator
lib/middleware/
├── cors.ts (~50 lines)
├── auth.ts (~90 lines)
└── routing.ts (~70 lines)
```

**Example Orchestrator:**
```typescript
// middleware.ts
import { handleCors } from '@/lib/middleware/cors';
import { handleAuth } from '@/lib/middleware/auth';
import { handleRouting } from '@/lib/middleware/routing';

export async function middleware(request: NextRequest) {
  // CORS first
  const corsResponse = await handleCors(request);
  if (corsResponse) return corsResponse;

  // Then routing
  const routingResponse = await handleRouting(request);
  if (routingResponse) return routingResponse;

  // Finally auth
  return handleAuth(request);
}
```

---

## 🎯 SUCCESS CRITERIA

### File Size Compliance
- [ ] All `.tsx` files under 500 lines
- [ ] middleware.ts under 150 lines
- [ ] ESLint passes with 0 errors

### Code Quality
- [ ] TypeScript compiles with 0 errors
- [ ] All imports resolve correctly
- [ ] No circular dependencies

### Functionality
- [ ] All pages load without errors
- [ ] Forms submit correctly
- [ ] Filters work as expected
- [ ] Modals open/close properly

---

## ⏱️ TIME ESTIMATES

### Minimum Path (Critical Only)
- Tasks 1-5 (File sizes): 8 hours
- **Total:** 8 hours

### Complete Path (All Tasks)
- Tasks 1-5 (File sizes): 8 hours
- Tasks 6-9 (Middleware): 2 hours
- Tasks 10-11 (Security): 2 hours
- Tasks 12-14 (Verification): 0.5 hours
- **Total:** 12.5 hours

### Recommended Approach
**Session 2A (4-5 hours):**
- Tasks 1-2 (about, contact)
- Task 6-9 (middleware)
- Task 12 (verification)

**Session 2B (4-5 hours):**
- Tasks 3-5 (assessment, request, solutions)
- Tasks 10-11 (security)
- Tasks 13-14 (final verification)

---

## 📝 PRE-SESSION CHECKLIST

Before starting:
- [ ] Read session1_summary.md
- [ ] Review created components from Session 1
- [ ] Verify no merge conflicts
- [ ] Have CLAUDE.md open for reference

---

## 🚀 POST-SESSION DELIVERABLES

### Required
1. All 7 files under 500 lines
2. ESLint passing
3. TypeScript compiling
4. session2_summary.md created

### Optional
5. Git commit with changes
6. Build test passed
7. Manual QA completed

---

## 💡 TIPS FOR SESSION 2

### Component Extraction Strategy
1. **Identify sections** - Look for logical UI boundaries
2. **Extract largest first** - Biggest impact on line count
3. **Test incrementally** - Verify after each extraction
4. **Preserve props** - Keep component interfaces clean

### Common Patterns
- **Forms:** Extract fields, validation, submission logic separately
- **Modals:** Extract to standalone component with open/close props
- **Filters:** Extract logic to custom hook, UI to component
- **Grids:** Reuse ResourceGrid pattern from Session 1

### Avoid These Mistakes
- ❌ Don't change functionality while refactoring
- ❌ Don't create circular dependencies
- ❌ Don't extract too granularly (many tiny files)
- ✅ Do test imports resolve before moving on
- ✅ Do keep related code together
- ✅ Do follow existing patterns (ResourceGrid, QuizModal)

---

**Ready to Start:** ✅
**Next Step:** Begin with Task 1 (about/page.tsx)
