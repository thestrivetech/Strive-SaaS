# Session 6: Convert Remaining Web Pages & API Routes

**Branch:** `feature/single-app-migration`
**Prerequisites:** Session 5 complete (Core pages: Home, About, Contact ✅)
**Estimated Time:** 2-2.5 hours
**Status:** 🔴 NOT STARTED

---

## 🎯 Primary Goals

1. **Convert remaining web pages** to Next.js App Router
2. **Convert web API routes** from Express to Next.js API routes
3. **Test all converted pages** for functionality
4. **Clean up remaining source files** after verification

---

## 📋 Session Prerequisites Check

Before starting, verify:
- [ ] Session 5 is complete (contact page converted)
- [ ] Dev server is running at http://localhost:3000
- [ ] No TypeScript errors in existing converted pages
- [ ] Branch: `feature/single-app-migration` is checked out
- [ ] All Session 5 changes are committed

---

## 🚀 SESSION 6 START PROMPT

```
I'm starting Session 6 of the single-app migration.

Read the complete plan in chat-logs/old-site-updates/session6.md

**Context:**
- Session 5 completed core web pages (home, about, contact) ✅
- Dev server running successfully at http://localhost:3000
- Need to convert remaining web pages and API routes

**Session 6 Goals:**
1. Convert solutions pages (main + dynamic routes)
2. Convert resources, portfolio, and case study pages
3. Convert API routes (contact form, newsletter)
4. Test all pages and delete old source files
5. Update documentation

**Instructions:**
Follow the step-by-step plan in session6.md. Start with Part 1 (analyzing remaining pages).

Branch: feature/single-app-migration
```

---

## Part 1: Analyze Remaining Web Pages (10 min)

### Step 1.1: List All Remaining Pages
```bash
# Find all remaining pages in web/client/src/pages/
find web/client/src/pages -name "*.tsx" -type f | grep -v "home.tsx\|company.tsx\|contact.tsx"
```

### Step 1.2: Analyze Each Page Structure
For each remaining page, document:
- File path
- Page type (static, dynamic, nested)
- Interactive features (needs "use client"?)
- Dependencies (components, hooks, utilities)
- Estimated complexity (simple, medium, complex)

### Expected Pages to Convert:
Based on typical marketing site structure:

**Solutions Pages:**
- `solutions.tsx` → `app/(web)/solutions/page.tsx`
- Individual solution pages (likely in subdirectory)

**Resources Pages:**
- `resources.tsx` → `app/(web)/resources/page.tsx`
- Possibly blog/article pages

**Portfolio/Case Studies:**
- `portfolio.tsx` → `app/(web)/portfolio/page.tsx`
- Individual case study pages

**Other Pages:**
- Privacy policy, terms of service, etc.

---

## Part 2: Convert Solutions Pages (40-50 min)

### Step 2.1: Convert Main Solutions Page

**Source:** `web/client/src/pages/solutions.tsx`
**Target:** `app/app/(web)/solutions/page.tsx`

**Conversion Checklist:**
- [ ] Read source file to understand structure
- [ ] Determine if "use client" is needed (check for useState, useEffect, events)
- [ ] Create target directory: `mkdir -p app/app/(web)/solutions`
- [ ] Convert file with proper imports:
  - Replace `wouter` → `next/navigation`
  - Replace `<Link>` imports
  - Update image imports to Next.js Image
- [ ] Preserve all content and styling
- [ ] Test compilation (check dev server output)

**Common Patterns:**
```typescript
// OLD (Wouter)
import { Link, useLocation } from 'wouter';
const [, setLocation] = useLocation();

// NEW (Next.js)
import Link from 'next/link';
import { useRouter } from 'next/navigation';
const router = useRouter();
```

### Step 2.2: Identify Dynamic Solution Routes

Check if there are individual solution pages:
```bash
# Look for solution subdirectories
ls -la web/client/src/pages/solutions/ 2>/dev/null

# Or check for dynamic routing patterns
grep -r "solutions/" web/client/src/pages/ 2>/dev/null
```

### Step 2.3: Convert Dynamic Solution Pages (if exists)

**If found:** `web/client/src/pages/solutions/[slug].tsx` or similar

**Target:** `app/app/(web)/solutions/[slug]/page.tsx`

**Dynamic Route Conversion:**
```typescript
// Next.js 13+ App Router dynamic route
export default function SolutionPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Use slug to fetch/display solution data
  return <div>Solution: {slug}</div>;
}

// Optional: Generate static params for static generation
export async function generateStaticParams() {
  return [
    { slug: 'ai-automation' },
    { slug: 'healthcare' },
    // ... other solutions
  ];
}
```

### Step 2.4: Move Solution Components

**Check for solution-specific components:**
```bash
find web/client/src/components -name "*solution*" -type f
```

**Move to:** `app/components/web/solutions/`

---

## Part 3: Convert Resources & Portfolio Pages (30-40 min)

### Step 3.1: Convert Resources Page

**Source:** `web/client/src/pages/resources.tsx`
**Target:** `app/app/(web)/resources/page.tsx`

**Follow same conversion pattern as solutions page.**

### Step 3.2: Convert Portfolio Page

**Source:** `web/client/src/pages/portfolio.tsx`
**Target:** `app/app/(web)/portfolio/page.tsx`

**Special considerations:**
- Likely has image galleries (ensure Next.js Image is used)
- May have filtering/sorting (needs "use client")
- Check for modal/lightbox functionality

### Step 3.3: Convert Case Study Pages (if exists)

**Check for case study routes:**
```bash
ls -la web/client/src/pages/case-studies/ 2>/dev/null
find web/client/src/pages -name "*case-study*" -type f
```

**If found, convert to:**
- `app/app/(web)/case-studies/page.tsx` (listing)
- `app/app/(web)/case-studies/[slug]/page.tsx` (individual)

---

## Part 4: Convert Static Pages (20 min)

### Step 4.1: List Static Pages
```bash
# Find privacy, terms, etc.
find web/client/src/pages -name "privacy*.tsx" -o -name "terms*.tsx" -o -name "legal*.tsx"
```

### Step 4.2: Convert Each Static Page

**Typical static pages:**
- Privacy Policy → `app/app/(web)/privacy/page.tsx`
- Terms of Service → `app/app/(web)/terms/page.tsx`
- Cookie Policy → `app/app/(web)/cookies/page.tsx`

**Note:** These are usually simple, static content pages. Can likely be **Server Components** (no "use client" needed).

---

## Part 5: Convert API Routes (30-40 min)

### Step 5.1: Identify Existing API Routes

**Check Express routes:**
```bash
# Find API route definitions
cat web/server/routes.ts 2>/dev/null
grep -r "app.post\|app.get" web/server/ 2>/dev/null
```

**Expected routes:**
- POST `/api/contact` - Contact form submission
- POST `/api/newsletter` - Newsletter subscription
- Others?

### Step 5.2: Convert Contact API Route

**Source:** `web/server/routes.ts` (contact handler)
**Target:** `app/app/api/contact/route.ts`

**Conversion Pattern:**
```typescript
// OLD (Express)
app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  // Validation
  // Database insert
  // Email sending

  res.json({ success: true, message: 'Message sent' });
});

// NEW (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, message } = body;

    // Validation (use Zod)
    // Database insert (use Prisma)
    // Email sending (use existing email service)

    return NextResponse.json({
      success: true,
      message: 'Message sent'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}
```

**Important:**
- Use Zod for validation (CLAUDE.md requirement)
- Use Prisma for database (no raw SQL)
- Proper error handling with try/catch
- Return proper HTTP status codes

### Step 5.3: Convert Newsletter API Route

**Source:** `web/server/routes.ts` (newsletter handler)
**Target:** `app/app/api/newsletter/route.ts`

**Follow same pattern as contact route.**

### Step 5.4: Test API Routes

```bash
# Test contact endpoint
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","message":"Test message","privacyConsent":true}'

# Test newsletter endpoint
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Part 6: Component Organization (20 min)

### Step 6.1: Move Web-Specific Components

**Check for additional web components:**
```bash
find web/client/src/components -type f -name "*.tsx" | grep -v "layout/"
```

**Organize into:**
```
app/components/web/
├── navigation.tsx          # Already moved
├── footer.tsx              # Already moved
├── hero-section.tsx        # New
├── solution-card.tsx       # New
├── testimonial-card.tsx    # New
├── cta-banner.tsx          # New
├── pricing-card.tsx        # New
└── ... (other web components)
```

### Step 6.2: Identify Shared Components

**Components used by BOTH web and platform:**
- Buttons, Cards, Inputs (shadcn/ui) → Stay in `components/ui/`
- Custom shared components → Move to `components/shared/`

---

## Part 7: Testing Phase (20-30 min)

### Step 7.1: Manual Testing Checklist

**Test each converted page:**
- [ ] `/solutions` - Solutions listing
- [ ] `/solutions/[slug]` - Individual solutions (if exists)
- [ ] `/resources` - Resources page
- [ ] `/portfolio` - Portfolio page
- [ ] `/case-studies` - Case studies (if exists)
- [ ] `/privacy` - Privacy policy (if exists)
- [ ] `/terms` - Terms of service (if exists)

**For each page, verify:**
- [ ] Page loads without errors
- [ ] Navigation works (header/footer links)
- [ ] Images load correctly
- [ ] Interactive elements work (buttons, forms, accordions)
- [ ] Mobile responsive design works
- [ ] No console errors

### Step 7.2: API Route Testing

**Test contact form submission:**
- [ ] Fill out contact form at `/contact`
- [ ] Submit with valid data
- [ ] Verify success toast appears
- [ ] Check that form resets after submission
- [ ] Test validation (invalid email, missing required fields)

**Test newsletter subscription:**
- [ ] Find newsletter signup (likely in footer)
- [ ] Submit with valid email
- [ ] Verify success message
- [ ] Test validation (invalid email)

### Step 7.3: Platform Regression Test

**Verify platform still works:**
- [ ] `/login` - Login page
- [ ] `/dashboard` - Dashboard
- [ ] `/crm` - CRM (if implemented)
- [ ] Auth flow works correctly

---

## Part 8: Cleanup Old Source Files (10 min)

### Step 8.1: Verify No Active Imports

**Before deleting, check for imports:**
```bash
# Check for solution page imports
grep -r "web/client/src/pages/solutions" app/ --exclude-dir=node_modules --exclude-dir=.next

# Check for resources page imports
grep -r "web/client/src/pages/resources" app/ --exclude-dir=node_modules --exclude-dir=.next

# Check for portfolio page imports
grep -r "web/client/src/pages/portfolio" app/ --exclude-dir=node_modules --exclude-dir=.next
```

### Step 8.2: Delete Old Source Files

**Once verified safe to delete:**
```bash
# Delete converted page files
rm -f web/client/src/pages/solutions.tsx
rm -f web/client/src/pages/resources.tsx
rm -f web/client/src/pages/portfolio.tsx
# ... (other converted pages)

# Delete converted component files
rm -f web/client/src/components/[converted-component].tsx
```

### Step 8.3: Verify Deletion

```bash
# Check what's left
find web/client/src/pages -name "*.tsx" -type f
find web/client/src/components -name "*.tsx" -type f
```

---

## Part 9: Documentation Updates (15 min)

### Step 9.1: Update MIGRATION_SESSIONS.md

**Mark Session 3 as complete:**
```markdown
## Session 3: Convert Remaining Web Pages (60 min) - ✅ COMPLETED

### Phase: 4.3-4.6 - Completed 2025-09-30 (Session 6)

### Goals:
- ✅ Convert solutions pages
- ✅ Convert resources page
- ✅ Convert portfolio page
- ✅ Convert case studies
- ✅ Convert API routes
- ✅ Organize components

### What Was Actually Done:
[List all conversions made]

### Deliverable: ✅ COMPLETE
**All web pages converted:**
[List all pages]

### Time Taken: X hours
### Status: ✅ COMPLETE
```

### Step 9.2: Update SINGLE_APP_MIGRATION_PLAN.md

**Update progress tracking section:**
```markdown
**✅ Completed Session 6 (Phase 4):**
- Converted all web pages to Next.js
- Converted API routes (contact, newsletter)
- Organized web components
- Full documentation at `chat-logs/old-site-updates/session6.md`
```

### Step 9.3: Update session6.md

**Mark status as complete:**
```markdown
**Status:** ✅ COMPLETED (2025-XX-XX)
```

---

## Part 10: Git Commit (5 min)

### Step 10.1: Stage All Changes

```bash
# Stage new files
git add app/app/(web)/solutions/
git add app/app/(web)/resources/
git add app/app/(web)/portfolio/
git add app/app/api/contact/
git add app/app/api/newsletter/

# Stage documentation updates
git add app/MIGRATION_SESSIONS.md
git add app/SINGLE_APP_MIGRATION_PLAN.md
git add chat-logs/old-site-updates/session6.md

# Stage deleted files (if any tracked)
git add -u
```

### Step 10.2: Commit Changes

```bash
git commit -m "$(cat <<'EOF'
Complete Session 3: Remaining web pages & API routes

Pages converted:
✅ Solutions (/solutions)
✅ Resources (/resources)
✅ Portfolio (/portfolio)
✅ Case Studies (if applicable)
✅ Static pages (privacy, terms, etc.)

API routes converted:
✅ POST /api/contact - Contact form submission
✅ POST /api/newsletter - Newsletter subscription

Components organized:
✅ Moved web-specific components to components/web/
✅ Organized shared components

Testing:
✅ All pages load without errors
✅ API routes tested and working
✅ Platform routes still functional (regression test passed)

Old source files deleted after verification.

Session 3 COMPLETE ✅

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## ✅ Success Criteria

Session 6 complete when:
- ✅ All remaining web pages converted to Next.js
- ✅ All API routes converted and tested
- ✅ Components properly organized
- ✅ All pages load without errors
- ✅ API endpoints return correct responses
- ✅ Platform routes still work (no regression)
- ✅ Old source files deleted
- ✅ Documentation updated
- ✅ Changes committed

---

## 📊 Expected Files Structure After Session 6

```
app/app/(web)/
├── layout.tsx                    # Web layout (Session 5 ✅)
├── page.tsx                      # Home (Session 5 ✅)
├── about/
│   └── page.tsx                  # About (Session 5 ✅)
├── contact/
│   └── page.tsx                  # Contact (Session 5 ✅)
├── solutions/
│   ├── page.tsx                  # Solutions listing (Session 6 🆕)
│   └── [slug]/
│       └── page.tsx              # Individual solutions (Session 6 🆕)
├── resources/
│   └── page.tsx                  # Resources (Session 6 🆕)
├── portfolio/
│   └── page.tsx                  # Portfolio (Session 6 🆕)
├── case-studies/
│   ├── page.tsx                  # Case studies listing (Session 6 🆕)
│   └── [slug]/
│       └── page.tsx              # Individual case studies (Session 6 🆕)
├── privacy/
│   └── page.tsx                  # Privacy policy (Session 6 🆕)
└── terms/
    └── page.tsx                  # Terms of service (Session 6 🆕)

app/app/api/
├── contact/
│   └── route.ts                  # Contact form API (Session 6 🆕)
└── newsletter/
    └── route.ts                  # Newsletter API (Session 6 🆕)

app/components/web/
├── navigation.tsx                # Session 5 ✅
├── footer.tsx                    # Session 5 ✅
├── hero-section.tsx              # Session 6 🆕
├── solution-card.tsx             # Session 6 🆕
├── testimonial-card.tsx          # Session 6 🆕
└── ... (other web components)
```

---

## 🔗 Related Files

- **Migration Plan:** `app/SINGLE_APP_MIGRATION_PLAN.md`
- **Session Tracker:** `app/MIGRATION_SESSIONS.md`
- **Previous Session:** `chat-logs/old-site-updates/session5.md`
- **Session 5 Summary:** `chat-logs/old-site-updates/session5_summary.md`

---

## ⚠️ Important Notes

### API Route Considerations

1. **Validation is Mandatory**
   - Use Zod for all input validation (CLAUDE.md requirement)
   - Never trust client input

2. **Database Access**
   - Use Prisma ONLY (no raw SQL)
   - Proper error handling for DB operations

3. **Email Sending**
   - Check if email service is already configured
   - May need to integrate with existing email system
   - Consider rate limiting

4. **Security**
   - Validate all inputs with Zod
   - Sanitize data before DB insert
   - Rate limiting for API routes
   - CSRF protection if needed

### Component Organization

**Shared vs Web-Specific:**
- **Shared:** Used by both marketing and platform
- **Web-Specific:** Only used in marketing pages
- **UI Components:** shadcn/ui stays in `components/ui/`

### Dynamic Routes

If solution pages are dynamic:
- Use `[slug]` directory structure
- Implement `generateStaticParams()` for static generation
- Consider `generateMetadata()` for SEO

---

## 🐛 Potential Issues & Solutions

### Issue 1: API Route Not Found (404)
**Cause:** Incorrect file naming or location
**Solution:** Ensure route.ts is in correct directory: `app/app/api/[route]/route.ts`

### Issue 2: CORS Errors
**Cause:** API routes blocking requests
**Solution:** Add CORS headers if needed:
```typescript
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

### Issue 3: Form Submission Fails
**Cause:** Missing or incorrect API endpoint
**Solution:**
1. Verify route.ts exists at correct path
2. Check dev server output for compilation errors
3. Test endpoint with curl first

### Issue 4: Images Not Loading
**Cause:** Image paths need to be updated for Next.js
**Solution:** Use Next.js Image component with proper paths

---

## 🎯 Time Breakdown

| Task | Estimated Time |
|------|----------------|
| Analyze remaining pages | 10 min |
| Convert solutions pages | 40-50 min |
| Convert resources & portfolio | 30-40 min |
| Convert static pages | 20 min |
| Convert API routes | 30-40 min |
| Component organization | 20 min |
| Testing | 20-30 min |
| Cleanup source files | 10 min |
| Documentation | 15 min |
| Git commit | 5 min |
| **TOTAL** | **2-2.5 hours** |

---

**Ready to begin Session 6!**

**Current Status:** Session 5 complete ✅
**Next Step:** Copy session start prompt and begin Part 1
**Dev Server:** Should be running at http://localhost:3000

---

*Session 6 Plan Created: 2025-09-30*
*Created by: Claude (Sonnet 4.5)*
*Branch: feature/single-app-migration*