# Content Management Strategy for Website Migration

## 🎯 Problem Statement

The website has large pages (1800+ lines) containing blog posts, whitepapers, case studies, and other content.

**Updated File Size Rules (as of implementation):**
- **Hard Limit:** 500 lines per file (enforced by ESLint)
- **Soft Targets:** Components 200 lines, Services 300 lines
- **Exception:** Data/content files (no limit)

How do we handle content-heavy pages in Next.js while following best practices?

---

## ✅ Current Structure (Already Good!)

The website already uses a **data-driven architecture**:

```
app/web/client/src/
├── pages/
│   └── resources.tsx (1804 lines) ← UI + Logic only
└── data/
    └── resources/
        ├── whitepapers/
        │   ├── nlp-mastery.ts
        │   ├── ethical-ai-implementation.ts
        │   ├── computer-vision-intelligence.ts
        │   └── index.ts
        ├── technology/
        │   ├── gpt4-integration.ts
        │   ├── tensorflow-framework.ts
        │   └── index.ts
        ├── case-studies/
        ├── blog-posts/
        └── index.ts
```

**Key Point:** Content is separated from UI/logic! ✅

---

## 🏗️ Next.js Best Practices for Content-Heavy Sites

### Strategy 1: Content as Data (Recommended - Already Implemented!)

**Keep the current structure** but enhance it:

```
app/
├── app/web/
│   └── resources/
│       ├── page.tsx                    ← 150 lines (UI shell)
│       └── [slug]/
│           └── page.tsx                ← 200 lines (detail view)
├── components/web/
│   └── resources/
│       ├── resource-list.tsx           ← 150 lines (client component)
│       ├── resource-card.tsx           ← 80 lines
│       ├── whitepaper-viewer.tsx       ← 200 lines
│       └── resource-filters.tsx        ← 120 lines
└── data/
    └── resources/
        ├── whitepapers/
        ├── case-studies/
        ├── blog-posts/
        └── index.ts
```

**Benefits:**
- ✅ Content files can be any size (they're just data - no ESLint limit)
- ✅ UI components stay under 500 line hard limit (aim for 200-250)
- ✅ Separation of concerns
- ✅ Easy to update content without touching code
- ✅ Can generate static pages at build time

---

### Strategy 2: Dynamic Routes with Static Generation

**File Structure:**
```typescript
// app/app/web/resources/page.tsx (List View)
import { resources } from '@/data/resources';

export default function ResourcesPage() {
  // Filter, search, display logic here
  // Keep under 500 line hard limit (aim for 200-250)
  return <ResourceList resources={resources} />;
}

// app/app/web/resources/[slug]/page.tsx (Detail View)
import { resources } from '@/data/resources';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

export default function ResourcePage({ params }: { params: { slug: string } }) {
  const resource = resources.find(r => r.slug === params.slug);
  if (!resource) notFound();

  return <ResourceDetail resource={resource} />;
}
```

**Benefits:**
- ✅ Each page pre-rendered at build time (ISR)
- ✅ SEO-friendly individual URLs
- ✅ Fast page loads
- ✅ Better analytics tracking

---

### Strategy 3: Component Breakdown Pattern

**Break large pages into smaller components:**

```typescript
// ❌ BAD: 1800 line resources.tsx

// ✅ GOOD: Multiple focused components

// app/app/web/resources/page.tsx (150 lines)
export default function ResourcesPage() {
  return (
    <>
      <ResourcesHero />
      <FeaturedResource />
      <ResourceFilters />
      <ResourceGrid />
      <NewsletterSignup />
    </>
  );
}

// components/web/resources/resource-filters.tsx (120 lines)
'use client';
export function ResourceFilters() {
  // Filter logic
}

// components/web/resources/resource-grid.tsx (180 lines)
'use client';
export function ResourceGrid({ resources }: Props) {
  // Display logic
}

// components/web/resources/whitepaper-viewer.tsx (200 lines)
'use client';
export function WhitepaperViewer({ content }: Props) {
  // Viewer logic
}
```

---

## 📊 Recommended Approach for Migration

### Phase 1: Move Data Layer
```bash
# Move data folder to shared location
app/web/client/src/data/ → app/data/web/
```

### Phase 2: Create Dynamic Routes
```typescript
// app/app/web/resources/page.tsx
import { resources } from '@/data/web/resources';

export const metadata = {
  title: 'Resources | Strive Tech',
  description: '...',
};

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-12">
      <ResourcesHero />
      <ResourceFilters />
      <ResourceGrid resources={resources} />
    </div>
  );
}
```

### Phase 3: Break Down UI Components
```
components/web/resources/
├── resources-hero.tsx           (60 lines) ✅ Under limit
├── featured-resource.tsx        (80 lines) ✅ Under limit
├── resource-filters.tsx         (120 lines) 'use client' ✅ Under soft target
├── resource-grid.tsx            (150 lines) 'use client' ✅ Under soft target
├── resource-card.tsx            (80 lines) ✅ Under limit
├── whitepaper-viewer.tsx        (200 lines) 'use client' ✅ Meets soft target
├── quiz-modal.tsx               (180 lines) 'use client' ✅ Under soft target
└── newsletter-signup.tsx        (100 lines) 'use client' ✅ Under limit
```

**All components are well under the 500-line hard limit!**

### Phase 4: Individual Resource Pages (Optional but Recommended)
```typescript
// app/app/web/resources/[slug]/page.tsx
import { getResourceBySlug } from '@/data/web/resources';
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const resource = getResourceBySlug(params.slug);
  return {
    title: `${resource.title} | Strive Tech`,
    description: resource.description,
  };
}

export default function ResourceDetailPage({ params }) {
  const resource = getResourceBySlug(params.slug);
  return <ResourceDetailView resource={resource} />;
}
```

---

## 🎯 File Size Guidelines

### Content/Data Files (No Limit)
✅ `/data/resources/whitepapers/ai-ml-guide.ts` - **Can be 5000+ lines**
- These are just data/content
- Not counted toward component limits
- Can be as long as needed

### UI Components (200 line limit)
```typescript
// ❌ BAD (300 lines)
function ResourcesPage() {
  // All logic + UI in one component
}

// ✅ GOOD (150 lines)
function ResourcesPage() {
  return (
    <>
      <ResourcesHero />      // 60 lines
      <ResourceFilters />    // 120 lines
      <ResourceGrid />       // 150 lines
    </>
  );
}
```

### Service/Logic Files (300 line limit)
```typescript
// data/resources/index.ts (250 lines)
export { resources } from './all-resources';
export { getResourceBySlug, filterResources } from './utils';
export type { Resource, ResourceType } from './types';
```

---

## 🚀 Migration Steps for Resources Page

**Step 1: Create Base Route**
```bash
mkdir -p app/app/web/resources
touch app/app/web/resources/page.tsx
```

**Step 2: Move Data**
```bash
cp -r app/web/client/src/data app/data/web
```

**Step 3: Create Components Structure**
```bash
mkdir -p components/web/resources
```

**Step 4: Extract Components from resources.tsx**
- Start with server components (Hero, static sections)
- Add `'use client'` to interactive parts (filters, modals)
- Each component should be focused and < 200 lines

**Step 5: Wire Up Dynamic Routes (Optional)**
```bash
mkdir -p app/app/web/resources/[slug]
touch app/app/web/resources/[slug]/page.tsx
```

---

## 📝 Example: Breaking Down Resources Page

### Original (1804 lines)
```typescript
// app/web/client/src/pages/resources.tsx
const Resources = () => {
  // 200 lines of state
  // 300 lines of filter logic
  // 400 lines of quiz logic
  // 500 lines of modal logic
  // 400 lines of JSX
}
```

### Migrated Structure
```typescript
// app/app/web/resources/page.tsx (120 lines)
export default function ResourcesPage() {
  return (
    <>
      <ResourcesHero />
      <FeaturedResourceSection />
      <ResourcesContent />
    </>
  );
}

// components/web/resources/resources-content.tsx (180 lines)
'use client';
export function ResourcesContent() {
  const [filters, setFilters] = useState({});
  return (
    <>
      <ResourceFilters onFilterChange={setFilters} />
      <ResourceGrid filters={filters} />
    </>
  );
}

// components/web/resources/resource-filters.tsx (120 lines)
// components/web/resources/resource-grid.tsx (150 lines)
// components/web/resources/resource-card.tsx (80 lines)
// components/web/resources/quiz-modal.tsx (200 lines)
// components/web/resources/whitepaper-viewer.tsx (200 lines)
```

---

## 🎨 Solutions Page Approach

Similar structure for solutions:

```
app/app/web/solutions/
├── page.tsx                      (150 lines - overview)
└── [solution]/
    └── page.tsx                  (180 lines - detail view)

components/web/solutions/
├── solution-hero.tsx             (80 lines)
├── solution-card.tsx             (100 lines)
├── solution-features.tsx         (120 lines)
└── solution-comparison.tsx       (150 lines)

data/web/solutions/
├── ai-development.ts             (No limit - content)
├── automation.ts                 (No limit - content)
└── index.ts                      (300 lines - exports)
```

---

## ✅ Final Recommendations

### 1. Keep Data Separation ✅
- Content files: No size limit
- Located in `/data/web/`
- TypeScript files for type safety

### 2. Component Composition ✅
- Each component: < 200 lines
- Use composition pattern
- Extract reusable pieces

### 3. Dynamic Routes ✅
- Use `[slug]` for individual pages
- Better SEO and performance
- Easier to maintain

### 4. Server/Client Split ✅
- Server Components by default
- `'use client'` only for interactivity
- Maximize static generation

### 5. Progressive Enhancement ✅
- Start with main pages working
- Add individual resource pages later
- Enhance with search/filters incrementally

---

## 📋 Migration Checklist

**Resources Page:**
- [ ] Move data to `/data/web/resources/`
- [ ] Create `/app/web/resources/page.tsx` (list view)
- [ ] Extract `<ResourceFilters>` component (120 lines)
- [ ] Extract `<ResourceGrid>` component (150 lines)
- [ ] Extract `<WhitepaperViewer>` component (200 lines)
- [ ] Extract `<QuizModal>` component (200 lines)
- [ ] Extract smaller utility components
- [ ] Create `/app/web/resources/[slug]/page.tsx` (optional)
- [ ] Test all filters and interactions

**Solutions Page:**
- [ ] Move data to `/data/web/solutions/`
- [ ] Create `/app/web/solutions/page.tsx` (overview)
- [ ] Create `/app/web/solutions/[solution]/page.tsx` (details)
- [ ] Extract solution components
- [ ] Test navigation and deep links

---

## 🎯 Key Takeaway

**The 200-line limit applies to UI components, not data/content files.**

Your current architecture is already correct! Just need to:
1. Keep content in `/data/` (no size limit)
2. Break UI into focused components (< 200 lines each)
3. Use composition to build complex pages
4. Leverage Next.js dynamic routes for individual content pages

This approach is **industry standard** for content-heavy Next.js sites. ✅