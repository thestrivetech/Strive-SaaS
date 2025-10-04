# Website Project - Session Start Prompt

**Session:** session[n].md
**Project:** Strive Tech Marketing Website (strivetech.ai)
**Working Directory:** `C:\Users\zochr\Desktop\GitHub\Strive-SaaS\(website)`

---

## =Ë Session Initialization

Before starting work, Claude should read the following files IN ORDER:

### 1. Project Standards & Architecture (REQUIRED)
```
Read these files to understand development rules and architecture:

1. ../CLAUDE.md - Root repository standards (shared across all projects)
2. ./CLAUDE.md - Website-specific development rules (if exists)
3. ./PLAN.md - Website completion plan (SEO, content, conversion)
4. ./README.md - Project overview and setup instructions
5. ../README.md - Repository overview (tri-fold structure)
```

### 2. Current Project State (ASSESS)
```
Assess the current state by checking:

- ./app/ structure - Verify Next.js App Router conventions
- ./app/layout.tsx - Ensure root layout exists with metadata
- ./app/page.tsx - Check homepage exists and is complete
- ./app/globals.css - Ensure global styles exist
- ./lib/ - Check for utils, seo, analytics, forms modules
- ./data/resources/ - Assess content library (blog posts, case studies)
- ./components/ - Review UI component organization
```

### 3. Key Architectural Principles
```
This website follows:

 Next.js 15 App Router - Server Components for static content
 SEO-first approach - Comprehensive metadata, sitemap, structured data
 Content-driven - Blog posts, case studies, whitepapers
 Conversion-focused - Lead generation, contact forms, CTAs
 Performance optimized - next/image, code splitting, CDN
 Analytics integrated - Google Analytics, conversion tracking
 Accessibility compliant - WCAG 2.1 AA standard
 Mobile-first responsive design
 Files under 500 lines (hard limit)
```

---

## <¯ Session Workflow

### At Session Start:
1. **Read context files** (listed above)
2. **Understand current task** from user
3. **Create todo list** using TodoWrite tool for multi-step tasks
4. **Search for existing content** before creating new pages (use Glob/Grep)

### During Session:
1. **Read before editing** - Always use Read tool before Edit/Write
2. **SEO first** - Add comprehensive metadata to every page
3. **Content quality** - Write for humans first, search engines second
4. **Server Components** - Static generation for all marketing content
5. **Image optimization** - Use next/image for all images
6. **Update todos** - Mark tasks as in_progress/completed in real-time
7. **Reference line numbers** - Use `file:line` format when mentioning code

### Critical Reminders:
- L NEVER skip SEO metadata (title, description, Open Graph, Twitter Card)
- L NEVER use <img> tags (use next/image with width/height)
- L NEVER create pages without updating app/sitemap.ts
- L NEVER skip accessibility attributes (alt text, ARIA labels, semantic HTML)
- L NEVER hardcode analytics IDs (use env vars)
-  ALWAYS run: `npm run lint && npx tsc --noEmit && npm test`
-  ALWAYS test mobile responsiveness (375px, 768px, 1024px+)
-  ALWAYS verify Lighthouse score >90

---

## =Ý Session End Requirements

At the end of this session, create:

**File:** `./update-sessions/session[n]_summary.md` (under 1000 lines)

**Required sections:**
```markdown
# Website Session [n] Summary

**Date:** [auto-fill]
**Duration:** [estimate]
**Status:**  Complete /   Partial / L Blocked

## Session Goal
[What we planned to accomplish]

## Content Created
- **Pages:** [list new pages created]
- **Blog Posts:** [count] new posts
- **Resources:** [whitepapers, case studies added]

## Changes Made
- `app/page.tsx:15-89` - Rebuilt homepage with new sections
- `app/solutions/healthcare/page.tsx:new` - Created healthcare solution page
- `app/sitemap.ts:34-38` - Added new pages to sitemap
- `lib/seo/metadata.ts:12-45` - Added reusable metadata generator

## SEO Updates
- **Metadata:** Added to [count] pages
- **Sitemap:** Updated with [count] new URLs
- **Structured Data:** [Organization/Article/Product schema added]
- **Keywords Targeted:** [list primary keywords]

## Performance
- **Lighthouse Scores:**
  - Performance: [score]/100 (target: >90)
  - Accessibility: [score]/100 (target: >95)
  - Best Practices: [score]/100 (target: >90)
  - SEO: [score]/100 (target: >95)
- **Bundle Size:** [size]kb (target: <500kb)
- **Images Optimized:** [count] images converted to next/image
- **LCP:** [time]s (target: <2.5s)

## Accessibility
- /L All images have alt text
- /L Form labels properly associated
- /L Keyboard navigation tested
- /L Color contrast ratios meet WCAG AA
- /L Heading hierarchy correct (H1 ’ H2 ’ H3)

## Tests Written
- E2E tests: [count] new tests
- Unit tests: [count] new tests
- Coverage: [%] (target: 80%+)

## Issues Encountered
1. **Issue:** [Description]
   **Resolution:** [How it was fixed]

## Next Steps
[Recommended actions for next session]

## Commands Run
```bash
npm run lint
npm run type-check
npm test
npm run build
# Lighthouse audit via Chrome DevTools
```

## Verification
- /L Build successful
- /L All tests passing ([%] coverage)
- /L Zero TypeScript errors
- /L Zero ESLint warnings
- /L Lighthouse score >90 on all metrics
- /L Mobile responsive (tested 375px, 768px, 1024px+)

## Architecture Notes
[Any architectural decisions or patterns used]
```

---

## =€ Ready to Start

Now that context is loaded, ask the user:
**"What would you like to work on in this session? (Content creation, SEO optimization, performance, or new pages)"**

Then create a todo list and begin work following Next.js best practices and SEO guidelines.
