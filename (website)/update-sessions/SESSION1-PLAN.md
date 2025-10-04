# Session 1: Homepage Creation & Critical Fixes - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** None
**Parallel Safe:** No (foundation work)

---

## 🎯 Session Objectives

Create the missing homepage (`app/page.tsx`) with all essential sections and fix critical environment variable issues. This session establishes the foundation for the marketing website.

**What Exists:**
- ✅ `app/layout.tsx` - Root layout
- ✅ `data/solutions.tsx` - Solutions data
- ✅ `data/projects/` - Portfolio projects
- ✅ `data/resources/` - Blog posts, case studies
- ✅ Component library in `components/`

**What's Missing:**
- ❌ `app/page.tsx` - Homepage (CRITICAL)
- ❌ `.env.local` - Local environment variables
- ❌ `.env.example` - Example environment template
- ❌ Homepage section components

---

## 📋 Task Breakdown

### Phase 1: Environment Variables Setup (15 minutes)

#### Task 1.1: Fix Environment Configuration
- [ ] Check if `.env` exists in root
- [ ] Rename `.env` to `.env.local` (if exists)
- [ ] Create `.env.example` with template variables
- [ ] Add to `.gitignore` if not already present
- [ ] Verify `.env.local` is in `.gitignore`

**Environment Variables Required:**
```bash
# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Forms (Resend for email)
RESEND_API_KEY="re_..."
CONTACT_EMAIL="contact@strivetech.ai"

# App
NEXT_PUBLIC_SITE_URL="https://strivetech.ai"
NEXT_PUBLIC_PLATFORM_URL="https://app.strivetech.ai"
NODE_ENV="development"
```

**Success Criteria:**
- `.env.local` contains actual values (not committed)
- `.env.example` contains template/dummy values
- `.gitignore` excludes `.env.local`

---

### Phase 2: Homepage Structure Creation (1 hour)

#### Task 2.1: Create `app/page.tsx`
- [ ] Create new file `app/page.tsx`
- [ ] Import required components (to be created)
- [ ] Import existing data from `data/` directory
- [ ] Create homepage layout structure
- [ ] Add metadata for SEO

**Homepage Structure:**
```typescript
// app/page.tsx
import { Hero } from '@/components/(web)/home/hero';
import { Features } from '@/components/(web)/home/features';
import { Solutions } from '@/components/(web)/home/solutions';
import { CaseStudies } from '@/components/(web)/home/case-studies';
import { Testimonials } from '@/components/(web)/home/testimonials';
import { CTA } from '@/components/(web)/home/cta';

export const metadata = {
  title: 'Strive Tech - AI-Powered Business Solutions',
  description: 'Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.',
  // ... OpenGraph, Twitter cards (will add in SESSION3)
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Solutions />
      <CaseStudies />
      <Testimonials />
      <CTA />
    </>
  );
}
```

**Success Criteria:**
- Homepage route (`/`) exists
- Metadata configured (basic)
- Server Component (async, default)
- Imports components (even if placeholder)

---

#### Task 2.2: Create Placeholder Homepage Components
- [ ] Create `components/(web)/home/` directory
- [ ] Create placeholder components (detailed implementation in SESSION6)

**Components to Create:**

1. **`components/(web)/home/hero.tsx`**
   - [ ] Create basic hero section with heading, subheading, CTA buttons
   - [ ] Link "Start Free Trial" → Platform URL
   - [ ] Link "Book Demo" → /request page

2. **`components/(web)/home/features.tsx`**
   - [ ] Create features grid
   - [ ] Show 4 main features (AI Automation, Custom Software, Industry Tools, Consultation)
   - [ ] Use icons from Lucide React

3. **`components/(web)/home/solutions.tsx`**
   - [ ] Import solutions data from `data/solutions.tsx`
   - [ ] Create solutions preview section
   - [ ] Link to individual solution pages

4. **`components/(web)/home/case-studies.tsx`**
   - [ ] Import case studies from `data/resources/case-studies/`
   - [ ] Show 3 featured case studies
   - [ ] Link to full case study pages

5. **`components/(web)/home/testimonials.tsx`**
   - [ ] Create testimonials section (placeholder)
   - [ ] Add 2-3 testimonial cards (can use dummy data)

6. **`components/(web)/home/cta.tsx`**
   - [ ] Final call-to-action section
   - [ ] "Ready to Transform Your Business?"
   - [ ] Multiple conversion paths (Platform signup, Contact, Demo)

7. **`components/(web)/home/index.ts`**
   - [ ] Export all components

**Success Criteria:**
- All 6 components created
- Components use existing data from `data/`
- Basic styling with Tailwind
- Responsive layout (mobile-first)
- All files under 200 lines

---

### Phase 3: Homepage Integration (30 minutes)

#### Task 3.1: Connect Homepage to Data Layer
- [ ] Verify imports from `data/solutions.tsx`
- [ ] Verify imports from `data/projects/`
- [ ] Verify imports from `data/resources/case-studies/`
- [ ] Test all data loads correctly

#### Task 3.2: Create Index Exports
- [ ] Create `components/(web)/home/index.ts`
- [ ] Export all homepage components
- [ ] Ensure clean import paths

#### Task 3.3: Navigation Integration
- [ ] Verify navigation links to homepage
- [ ] Verify logo links to homepage (`/`)
- [ ] Test navigation from all pages

**Success Criteria:**
- Homepage displays with real data
- All links functional
- No broken imports
- No TypeScript errors

---

### Phase 4: Missing Pages Check (15 minutes)

#### Task 4.1: Verify Missing Critical Pages
Check if these pages exist, note for future sessions:
- [ ] Check `app/pricing/page.tsx` - ❌ Missing (create in SESSION6)
- [ ] Check `app/demo/page.tsx` - ❌ Missing (create in SESSION6)
- [ ] Check `app/blog/page.tsx` - ❌ Missing (resources page exists, blog redirect needed)
- [ ] Check `app/industries/page.tsx` - ❌ Missing (create in SESSION6)

**Success Criteria:**
- Documented which pages are missing
- Prioritized for future sessions
- No critical blocking issues

---

### Phase 5: Basic Testing & Verification (30 minutes)

#### Task 5.1: Manual Testing
- [ ] Run development server: `npm run dev`
- [ ] Navigate to `http://localhost:3000`
- [ ] Verify homepage loads
- [ ] Test all internal links
- [ ] Test all section displays
- [ ] Check mobile responsiveness (basic)
- [ ] Check console for errors

#### Task 5.2: TypeScript & Linting
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Fix any type errors
- [ ] Run linter: `npm run lint`
- [ ] Fix any linting issues

**Success Criteria:**
- TypeScript compiles with 0 errors
- Linter passes with 0 warnings
- Homepage loads without errors
- All sections visible

---

## 📊 Files to Create

### Core Files (9 files)
```
(website)/
├── app/
│   └── page.tsx                              # ✅ Create (homepage)
├── components/(web)/home/
│   ├── hero.tsx                              # ✅ Create
│   ├── features.tsx                          # ✅ Create
│   ├── solutions.tsx                         # ✅ Create
│   ├── case-studies.tsx                      # ✅ Create
│   ├── testimonials.tsx                      # ✅ Create
│   ├── cta.tsx                               # ✅ Create
│   └── index.ts                              # ✅ Create
└── .env.example                              # ✅ Create
```

### Configuration Files (1 file)
```
.env.local                                     # ✅ Create/Rename
```

**Total:** 10 files (9 new + 1 rename/create)

---

## 🎯 Success Criteria

- [ ] `app/page.tsx` created and functional
- [ ] All 6 homepage components created
- [ ] `.env.local` and `.env.example` configured
- [ ] Homepage loads at `/` route
- [ ] All data integrations working
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] All files under 200 lines
- [ ] Mobile responsive (basic)
- [ ] No console errors
- [ ] All internal links functional

---

## 🔗 Integration Points

### With Existing Data
```typescript
// Import solutions data
import { solutions } from '@/data/solutions';

// Import case studies
import { caseStudies } from '@/data/resources/case-studies';

// Import projects
import { projects } from '@/data/projects';
```

### With Existing Pages
- Hero CTA → `/request` (demo request page) ✅ exists
- Hero CTA → Platform URL (environment variable)
- Solutions → `/solutions/[slug]` ✅ exists
- Case Studies → `/solutions/case-studies/[slug]` ✅ exists
- Contact → `/contact` ✅ exists

### With Future Sessions
- SESSION2: Will add analytics tracking
- SESSION3: Will enhance metadata with OpenGraph/Twitter
- SESSION4: Will add conversion tracking to CTAs
- SESSION6: Will enhance components with animations, advanced features

---

## 📝 Implementation Notes

### Homepage Metadata Pattern
```typescript
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strive Tech - AI-Powered Business Solutions',
  description: 'Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.',
  // OpenGraph and Twitter cards will be added in SESSION3
};
```

### Component Structure Pattern
```typescript
// components/(web)/home/hero.tsx
import Link from 'next/link';
import { Button } from '@/components/(shared)/ui/button';

export function Hero() {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://app.strivetech.ai';

  return (
    <section className="relative">
      {/* Hero content */}
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href={platformUrl}>Start Free Trial</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/request">Book Demo</Link>
        </Button>
      </div>
    </section>
  );
}
```

### Data Integration Pattern
```typescript
// components/(web)/home/solutions.tsx
import { solutions } from '@/data/solutions';
import Link from 'next/link';

export function Solutions() {
  return (
    <section>
      <div className="grid md:grid-cols-3 gap-6">
        {solutions.slice(0, 6).map((solution) => (
          <Link
            key={solution.id}
            href={solution.slug}
            className="card"
          >
            {/* Solution card content */}
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### Environment Variable Access
```typescript
// Only in Server Components or API routes
const gaId = process.env.NEXT_PUBLIC_GA_ID;

// In client components, must be prefixed with NEXT_PUBLIC_
const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL;
```

---

## 🚀 Quick Start Command

```bash
# Verify current state
ls app/page.tsx || echo "Homepage missing - will create"

# Create component directory
mkdir -p components/\(web\)/home

# Run after implementation
npx tsc --noEmit && npm run lint && npm run dev
```

---

## 🔄 Dependencies

**Requires (from current state):**
- ✅ `app/layout.tsx` exists
- ✅ `data/` directory with content
- ✅ `components/(shared)/ui/` components
- ✅ Tailwind CSS configured
- ✅ Next.js 15 installed

**Blocks (must complete before):**
- SESSION2: Needs homepage to exist for analytics
- SESSION3: Needs homepage for SEO metadata
- SESSION6: Will enhance these components

**Enables:**
- Homepage becomes accessible
- Marketing site has entry point
- CTAs can drive conversions
- Foundation for SEO and analytics

---

## 📖 Reference Files

**Read before starting:**
- `(website)/PLAN.md` - Overall website plan
- `(website)/CLAUDE.md` - Website-specific standards
- `app/layout.tsx` - Layout pattern
- `app/about/page.tsx` - Existing page pattern
- `data/solutions.tsx` - Data structure
- `components/(shared)/ui/` - Available UI components

**Similar Patterns:**
- `app/portfolio/page.tsx` - Page with data integration
- `app/solutions/page.tsx` - Solutions listing pattern
- Any existing page for metadata pattern

---

## 🎨 Design Requirements

### Hero Section
- **Heading:** "AI-Powered Business Solutions"
- **Subheading:** Concise value proposition (1-2 sentences)
- **Primary CTA:** "Start Free Trial" (links to Platform)
- **Secondary CTA:** "Book Demo" (links to /request)
- **Background:** Gradient or image (use Next.js Image)

### Features Section
- **Grid:** 4 features in 2x2 grid (mobile: stack)
- **Icons:** Lucide React icons
- **Features:**
  1. AI Automation - Streamline workflows
  2. Custom Software - Tailored solutions
  3. Industry Tools - Specialized platforms
  4. Expert Consultation - Strategic guidance

### Solutions Section
- **Heading:** "Solutions by Industry"
- **Grid:** 6 solutions in 3x2 grid (mobile: stack)
- **Cards:** Icon, title, brief description, "Learn More" link
- **Data Source:** `data/solutions.tsx`

### Case Studies Section
- **Heading:** "Success Stories"
- **Display:** 3 featured case studies
- **Cards:** Image, client name, result metrics, link
- **Data Source:** `data/resources/case-studies/`

### Testimonials Section (Placeholder)
- **Heading:** "What Our Clients Say"
- **Display:** 2-3 testimonial cards
- **Content:** Can use dummy data for now
- **Note:** Real testimonials will be added in SESSION6

### CTA Section
- **Heading:** "Ready to Transform Your Business?"
- **Subheading:** Compelling call-to-action
- **Buttons:** Platform signup, Contact, Demo request
- **Background:** Accent color or gradient

---

## ✅ Pre-Session Checklist

Before starting:
- [ ] Read `(website)/PLAN.md` completely
- [ ] Read `(website)/CLAUDE.md` for standards
- [ ] Verify `data/` directory structure
- [ ] Verify `components/(shared)/ui/` components available
- [ ] Check existing pages for patterns
- [ ] Node.js and dependencies installed
- [ ] Git working directory clean

---

## 📊 Session Completion Checklist

Mark complete when:
- [ ] All files created
- [ ] Homepage loads successfully
- [ ] All components render correctly
- [ ] Data integrations working
- [ ] Environment variables configured
- [ ] TypeScript compiles (0 errors)
- [ ] Linter passes (0 warnings)
- [ ] Basic mobile responsiveness verified
- [ ] All links functional
- [ ] No console errors
- [ ] Ready for SESSION2 (analytics)

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
