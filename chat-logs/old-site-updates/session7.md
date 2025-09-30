# Session 7: Portfolio + Request + Static Pages Conversion

**Branch:** `feature/single-app-migration`
**Prerequisites:** Session 6 complete (2/30 pages done)
**Estimated Time:** 2-3 hours
**Status:** 🔴 NOT STARTED

---

## 🎯 Primary Goals

1. Convert portfolio page (429 lines) - Medium complexity, project cards with filtering
2. Convert request page (920 lines) - Large multi-step form with validation
3. Convert 4 static pages (privacy, terms, cookies, not-found) - Simple, quick wins (~300 lines total)
4. Optional: Begin individual solution pages if time permits

**Target:** 5-7 pages converted (~1,650+ lines)

---

## 📋 Session Prerequisites Check

Before starting Session 7, verify:
- [x] Session 6 is complete (solutions + resources pages converted)
- [ ] Dev server runs successfully: `cd app && npm run dev`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Branch checked out: `git branch` shows `feature/single-app-migration`
- [ ] Previous Session 6 changes committed by user
- [ ] Solutions page loads: http://localhost:3000/solutions
- [ ] Resources page loads: http://localhost:3000/resources

---

## 🚀 SESSION 7 START PROMPT

```
I'm ready to start Session 7 of the web pages migration. Please follow the session start protocol from MIGRATION_SESSION_START.md:

1. Read these core files in order:
   - CLAUDE.md (project root)
   - app/MIGRATION_SESSIONS.md
   - app/SINGLE_APP_MIGRATION_PLAN.md
   - chat-logs/old-site-updates/session7.md (this file)

2. Create a TodoWrite list with these tasks:
   - Convert portfolio page (429 lines)
   - Convert request page (920 lines)
   - Convert privacy page
   - Convert terms page
   - Convert cookies page
   - Convert not-found page
   - Test all converted pages
   - Delete old source files
   - Update documentation

3. Start with converting the portfolio page as outlined in Part 1 below.

Context: Session 6 converted solutions and resources pages (2,975 lines). Now we'll tackle portfolio, request, and static pages.
```

---

## Part 1: Convert Portfolio Page (30-40 min)

### Step 1.1: Read Source File
```bash
app/web/client/src/pages/portfolio.tsx (429 lines)
```

**Key features to preserve:**
- Project filtering (all, demo, prototype, template)
- Project cards with categories and types
- Project detail modal
- Type badges and icons
- Mobile/desktop responsive design

### Step 1.2: Create Target Structure
```bash
mkdir -p app/app/\(web\)/portfolio
```

### Step 1.3: Convert to Next.js
**Target:** `app/app/(web)/portfolio/page.tsx`

**Conversion checklist:**
- [ ] Add `"use client"` directive (uses useState for filtering)
- [ ] Remove Wouter imports
- [ ] Add `import { useRouter } from "next/navigation"`
- [ ] Replace any `window.location.href` with `router.push()`
- [ ] Keep all data imports from `@/data/portfolio`
- [ ] Preserve all filtering logic
- [ ] Preserve modal system
- [ ] Keep all icon imports and usage

**Expected result:** Clean Next.js client component with all features intact

---

## Part 2: Convert Request Page (45-60 min)

### Step 2.1: Read Source File
```bash
app/web/client/src/pages/request.tsx (920 lines)
```

**Key features to preserve:**
- Multi-step form (4 steps)
- Form validation with Zod or custom logic
- Industry/solution selection
- Budget and timeline inputs
- File upload capability
- Form persistence (localStorage)
- API submission to `/api/request`
- Success/error toast notifications

### Step 2.2: Create Target Structure
```bash
mkdir -p app/app/\(web\)/request
```

### Step 2.3: Convert to Next.js
**Target:** `app/app/(web)/request/page.tsx`

**Conversion checklist:**
- [ ] Add `"use client"` directive (extensive form state and validation)
- [ ] Remove Wouter imports
- [ ] Add `import { useRouter } from "next/navigation"`
- [ ] Keep all form state management
- [ ] Preserve validation logic
- [ ] Keep localStorage persistence
- [ ] Maintain API call structure
- [ ] Keep toast notifications
- [ ] Preserve multi-step UI logic

**Expected result:** Fully functional multi-step form in Next.js

---

## Part 3: Convert Static Pages (20-30 min)

### Step 3.1: Privacy Policy Page
**Source:** `app/web/client/src/pages/privacy.tsx`
**Target:** `app/app/(web)/privacy/page.tsx`

**Notes:**
- Likely a **Server Component** (no interactivity)
- Simple content page with sections
- No "use client" needed unless has TOC scroll functionality

```bash
mkdir -p app/app/\(web\)/privacy
# Convert file (should be quick - mostly static content)
```

### Step 3.2: Terms of Service Page
**Source:** `app/web/client/src/pages/terms.tsx`
**Target:** `app/app/(web)/terms/page.tsx`

**Notes:**
- Likely a **Server Component**
- Simple content page
- Similar to privacy page

```bash
mkdir -p app/app/\(web\)/terms
# Convert file
```

### Step 3.3: Cookie Policy Page
**Source:** `app/web/client/src/pages/cookies.tsx`
**Target:** `app/app/(web)/cookies/page.tsx`

**Notes:**
- Likely a **Server Component**
- Simple content page
- Similar to privacy and terms

```bash
mkdir -p app/app/\(web\)/cookies
# Convert file
```

### Step 3.4: 404 Not Found Page
**Source:** `app/web/client/src/pages/not-found.tsx`
**Target:** `app/app/(web)/not-found.tsx` (Note: special Next.js file - no directory)

**Notes:**
- Next.js has special handling for `not-found.tsx`
- Should be **Server Component** unless has interactive elements
- Place directly in `(web)` directory, not in subdirectory

```bash
# Convert file - place in app/(web)/ directly
```

---

## Part 4: Test All Converted Pages (20 min)

### Step 4.1: Start Dev Server
```bash
cd app
npm run dev
```

### Step 4.2: Manual Testing Checklist
Visit each page and verify:

**Portfolio Page:**
- [ ] http://localhost:3000/portfolio loads without errors
- [ ] Filter buttons work (all, demo, prototype, template)
- [ ] Project cards display correctly
- [ ] Project modal opens and shows details
- [ ] All icons and badges render
- [ ] Responsive on mobile

**Request Page:**
- [ ] http://localhost:3000/request loads without errors
- [ ] Form steps progress correctly (1→2→3→4)
- [ ] All form fields work
- [ ] Validation shows errors appropriately
- [ ] File upload works (if present)
- [ ] Form submission works (test with dev data)
- [ ] Success/error messages display

**Static Pages:**
- [ ] http://localhost:3000/privacy loads
- [ ] http://localhost:3000/terms loads
- [ ] http://localhost:3000/cookies loads
- [ ] http://localhost:3000/invalid-route shows 404 (not-found page)

**Regression Test:**
- [ ] http://localhost:3000/ (home) still works
- [ ] http://localhost:3000/about still works
- [ ] http://localhost:3000/contact still works
- [ ] http://localhost:3000/solutions still works
- [ ] http://localhost:3000/resources still works

### Step 4.3: TypeScript Check
```bash
cd app
npx tsc --noEmit
```
**Expected:** Zero TypeScript errors in new files

---

## Part 5: Cleanup Old Source Files (10 min)

### Step 5.1: Delete Converted Files
```bash
# Portfolio
rm -f app/web/client/src/pages/portfolio.tsx

# Request
rm -f app/web/client/src/pages/request.tsx

# Static pages
rm -f app/web/client/src/pages/privacy.tsx
rm -f app/web/client/src/pages/terms.tsx
rm -f app/web/client/src/pages/cookies.tsx
rm -f app/web/client/src/pages/not-found.tsx
```

### Step 5.2: Verify Old Files Deleted
```bash
ls app/web/client/src/pages/
# Should show remaining unconverted files
```

---

## Part 6: Update Documentation (15 min)

### Step 6.1: Update MIGRATION_SESSIONS.md
Add Session 7 subsection under Session 2:
```markdown
**Session 7 (2025-09-30):**
- Converted portfolio page (429 lines)
- Converted request page (920 lines)
- Converted 4 static pages: privacy, terms, cookies, not-found (~300 lines)
- Total: 7 pages, 1,649 lines converted
- Running total: 9/30 pages complete
```

### Step 6.2: Create session7_summary.md
Follow template from MIGRATION_SESSION_END.md

### Step 6.3: Create session8.md
Plan for next session (individual solution pages batch conversion)

---

## ✅ Success Criteria

Session 7 is complete when:
- [ ] Portfolio page converted and working
- [ ] Request page converted and working (all steps)
- [ ] 4 static pages converted and working
- [ ] All manual tests pass
- [ ] Zero TypeScript errors
- [ ] Old source files deleted
- [ ] Documentation updated (MIGRATION_SESSIONS.md, session7_summary.md, session8.md)
- [ ] TodoWrite list shows all tasks completed

---

## 📊 Expected Files Structure After Session 7

```
app/app/(web)/
├── page.tsx                    # Home (Session 4) ✅
├── about/page.tsx              # About (Session 4) ✅
├── contact/page.tsx            # Contact (Session 5) ✅
├── solutions/page.tsx          # Solutions (Session 6) ✅
├── resources/page.tsx          # Resources (Session 6) ✅
├── portfolio/page.tsx          # Portfolio (Session 7) ⬅️ NEW
├── request/page.tsx            # Request (Session 7) ⬅️ NEW
├── privacy/page.tsx            # Privacy (Session 7) ⬅️ NEW
├── terms/page.tsx              # Terms (Session 7) ⬅️ NEW
├── cookies/page.tsx            # Cookies (Session 7) ⬅️ NEW
├── not-found.tsx               # 404 (Session 7) ⬅️ NEW
└── [17 solution pages]         # (Session 8) ⚠️ PENDING
```

---

## ⚠️ Important Notes

### Request Page Complexity
The request page is the **largest remaining utility page** (920 lines). Key concerns:
1. **Multi-step form logic** - Ensure step navigation works correctly
2. **Validation** - May use react-hook-form or custom validation
3. **File uploads** - If present, verify Next.js handles correctly
4. **API integration** - `/api/request` must exist and work
5. **localStorage** - Form persistence across refreshes

**Recommendation:** Test each form step individually during conversion.

### Not Found Page Special Case
Next.js treats `not-found.tsx` as a special file:
- Must be placed in route group root: `app/(web)/not-found.tsx`
- NOT in a subdirectory like `not-found/page.tsx`
- Automatically shown for 404 errors in (web) routes
- Can be Server Component or Client Component

### Static Pages
Privacy, terms, and cookies pages are likely **Server Components**:
- No "use client" directive needed
- Pure content with section headings
- May have internal anchor links (still works as Server Component)
- Only add "use client" if they have interactive TOC or scroll effects

---

## 🐛 Potential Issues & Solutions

### Issue 1: Request Page API Missing
**Problem:** `/api/request` route doesn't exist yet
**Solution:**
- Convert page anyway
- API conversion is separate task (Session 10)
- For now, verify form structure and validation work

### Issue 2: File Upload in Request Page
**Problem:** Next.js handles file uploads differently
**Solution:**
- If file upload exists, keep existing logic
- May need to update API route later
- Test with small file to verify

### Issue 3: Form Validation Library
**Problem:** May use react-hook-form or custom validation
**Solution:**
- Keep existing validation approach
- No need to change validation libraries
- Just ensure it works in Next.js client component

### Issue 4: localStorage Not Available
**Problem:** Server Component can't access localStorage
**Solution:**
- Request page must be Client Component
- Add "use client" directive
- localStorage will work as expected

---

## 🎯 Time Breakdown

| Task | Estimated Time |
|------|----------------|
| Portfolio page conversion | 30-40 min |
| Request page conversion | 45-60 min |
| Static pages (4 pages) | 20-30 min |
| Testing all pages | 20 min |
| Cleanup old files | 10 min |
| Documentation | 15 min |
| **TOTAL** | **2h 20m - 3h 15m** |

---

## Optional: Individual Solution Pages (If Time Permits)

If Session 7 finishes early, begin converting individual solution pages:

**17 pages to convert** (~100 lines each, similar patterns):
```
solutions/ai-automation/page.tsx
solutions/healthcare/page.tsx
solutions/financial/page.tsx
solutions/retail/page.tsx
solutions/manufacturing/page.tsx
solutions/education/page.tsx
... (12 more)
```

**Batch conversion strategy:**
1. Read first solution page as template
2. Identify common pattern (likely similar structure)
3. Convert 5-7 pages in batch
4. Test batch before continuing
5. Document pattern for Session 8

**Only start if:**
- All Session 7 objectives complete
- Testing passed
- Time remaining > 30 minutes

---

## Next Session Preview: Session 8

**Focus:** Individual solution pages batch conversion + utility pages

**Goals:**
1. Convert remaining 17 individual solution pages
2. Convert 3 nested technology pages
3. Convert healthcare case study page
4. Optional: Start assessment/onboarding pages

**Estimated Time:** 2-3 hours

---

**Session 7 ready to start! Portfolio, Request, and Static Pages ahead.**