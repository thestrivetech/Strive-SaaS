# Session 3: SEO Optimization - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** SESSION2 (needs lib/seo/ utilities)
**Parallel Safe:** No (depends on SESSION2)

---

## 🎯 Session Objectives

Implement comprehensive SEO optimization including sitemap generation, robots.txt configuration, enhanced metadata, and JSON-LD structured data across all pages. This session focuses on maximizing search engine visibility and rich results.

**What Exists:**
- ✅ `lib/seo/metadata.ts` - Metadata generator (from SESSION2)
- ✅ `lib/seo/schema.ts` - JSON-LD schemas (from SESSION2)
- ✅ Basic metadata on existing pages
- ✅ Organization schema in root layout

**What's Missing:**
- ❌ `app/sitemap.ts` - Sitemap generation
- ❌ `app/robots.ts` - Robots.txt configuration
- ❌ Enhanced metadata with OpenGraph/Twitter on all pages
- ❌ Blog post and case study JSON-LD
- ❌ Breadcrumb structured data
- ❌ Local business schema (if applicable)

---

## 📋 Task Breakdown

### Phase 1: Sitemap Generation (45 minutes)

#### File 1: `app/sitemap.ts`
- [ ] Create sitemap generation file
- [ ] Import Next.js MetadataRoute.Sitemap type
- [ ] Define static pages
- [ ] Define dynamic solution pages
- [ ] Define dynamic resource pages
- [ ] Set priorities and change frequencies

```typescript
import { MetadataRoute } from 'next';
import { projects } from '@/data/projects';
import { caseStudies } from '@/data/resources/case-studies';
import { blogPosts } from '@/data/resources/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://strivetech.ai';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/assessment`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/request`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic solution pages
  const solutionPages: MetadataRoute.Sitemap = [
    'ai-automation',
    'blockchain',
    'business-intelligence',
    'computer-vision',
    'data-analytics',
    'education',
    'financial',
    'healthcare',
    'manufacturing',
    'retail',
    'security-compliance',
    'smart-business',
    'technology',
  ].map((slug) => ({
    url: `${baseUrl}/solutions/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Dynamic project pages (portfolio)
  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/portfolio/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic case study pages
  const caseStudyPages: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${baseUrl}/solutions/case-studies/${study.slug}`,
    lastModified: study.publishedAt ? new Date(study.publishedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/resources/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...solutionPages,
    ...projectPages,
    ...caseStudyPages,
    ...blogPages,
  ];
}
```

**Success Criteria:**
- All pages included in sitemap
- Correct priorities (homepage = 1.0)
- lastModified dates accurate
- Change frequencies appropriate
- Sitemap accessible at `/sitemap.xml`

---

### Phase 2: Robots.txt Configuration (15 minutes)

#### File 1: `app/robots.ts`
- [ ] Create robots.txt configuration
- [ ] Allow all crawlers
- [ ] Disallow admin/private routes (if any)
- [ ] Reference sitemap

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://strivetech.ai';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      {
        userAgent: 'GPTBot', // OpenAI crawler
        disallow: '/', // Optionally block AI scrapers
      },
      {
        userAgent: 'CCBot', // Common Crawl bot
        disallow: '/', // Optionally block AI scrapers
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

**Success Criteria:**
- Robots.txt accessible at `/robots.txt`
- Sitemap referenced
- Appropriate disallow rules
- AI crawlers optionally blocked

---

### Phase 3: Enhanced Page Metadata (1 hour)

#### Task 3.1: Update Homepage Metadata (`app/page.tsx`)
- [ ] Use generateMetadata helper
- [ ] Add OpenGraph tags
- [ ] Add Twitter Card tags
- [ ] Add keywords

```typescript
// app/page.tsx (update metadata)
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata = generateMetadata({
  title: 'Strive Tech - AI-Powered Business Solutions',
  description: 'Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.',
  path: '/',
  keywords: [
    'AI automation',
    'custom software development',
    'business intelligence',
    'AI solutions',
    'enterprise software',
    'machine learning',
  ],
  type: 'website',
});
```

---

#### Task 3.2: Update Solution Pages Metadata
- [ ] Update `app/solutions/page.tsx` (solutions listing)
- [ ] Update individual solution pages with specific metadata

Example for `app/solutions/ai-automation/page.tsx`:
```typescript
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata = generateMetadata({
  title: 'AI Automation Solutions | Streamline Your Business | Strive Tech',
  description: 'Automate repetitive tasks and optimize workflows with intelligent AI automation solutions. Increase efficiency and reduce costs.',
  path: '/solutions/ai-automation',
  image: '/assets/solutions/ai-automation-og.jpg',
  keywords: ['AI automation', 'process automation', 'workflow optimization', 'RPA'],
  type: 'website',
});
```

**Pages to Update:**
- [ ] `/solutions/ai-automation`
- [ ] `/solutions/healthcare`
- [ ] `/solutions/financial`
- [ ] `/solutions/real-estate` (if exists)
- [ ] All other solution pages

---

#### Task 3.3: Update Resource Pages Metadata
- [ ] Update `app/resources/page.tsx`
- [ ] Add blog post metadata template

Example for blog posts (create layout):
```typescript
// app/resources/[slug]/layout.tsx (if needed)
import { getBlogPostSchema } from '@/lib/seo/schema';

export default function BlogLayout({ children, params }) {
  // Load blog post data
  const post = getBlogPost(params.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBlogPostSchema({
              title: post.title,
              description: post.description,
              author: post.author,
              datePublished: post.publishedAt,
              image: post.image,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/resources/${post.slug}`,
            })
          ),
        }}
      />
      {children}
    </>
  );
}
```

---

#### Task 3.4: Update About & Contact Pages
- [ ] Update `app/about/page.tsx` with enhanced metadata
- [ ] Update `app/contact/page.tsx` with enhanced metadata

```typescript
// app/about/page.tsx
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata = generateMetadata({
  title: 'About Strive Tech | AI & Software Development Experts',
  description: 'Learn about Strive Tech\'s mission to transform businesses through innovative AI solutions and custom software development.',
  path: '/about',
  type: 'website',
});
```

```typescript
// app/contact/page.tsx
import { generateMetadata } from '@/lib/seo/metadata';

export const metadata = generateMetadata({
  title: 'Contact Strive Tech | Get Your Free Consultation',
  description: 'Get in touch with our AI and software development experts. Schedule a free consultation to discuss your business needs.',
  path: '/contact',
  type: 'website',
});
```

**Success Criteria:**
- All pages have unique, descriptive titles
- All pages have compelling descriptions
- OpenGraph and Twitter tags on all pages
- Proper keywords where applicable

---

### Phase 4: Structured Data Enhancement (45 minutes)

#### Task 4.1: Add Breadcrumb Schema
- [ ] Create breadcrumb schema generator
- [ ] Add to solution pages
- [ ] Add to resource pages

```typescript
// lib/seo/schema.ts (add this function)
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
```

**Add to solution pages:**
```typescript
// app/solutions/ai-automation/page.tsx
import { getBreadcrumbSchema } from '@/lib/seo/schema';

export default function AIAutomationPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://strivetech.ai' },
    { name: 'Solutions', url: 'https://strivetech.ai/solutions' },
    { name: 'AI Automation', url: 'https://strivetech.ai/solutions/ai-automation' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Page content */}
    </>
  );
}
```

---

#### Task 4.2: Add Service Schema
- [ ] Create service schema for solutions

```typescript
// lib/seo/schema.ts (add this function)
export function getServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  image?: string;
  provider?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    provider: {
      '@type': 'Organization',
      name: service.provider || 'Strive Tech',
    },
    ...(service.image && { image: service.image }),
  };
}
```

**Success Criteria:**
- Breadcrumb schema on all solution pages
- Service schema on solution pages
- Valid JSON-LD (test with Google's Rich Results Test)

---

#### Task 4.3: Add Local Business Schema (Optional)
- [ ] If Strive Tech has physical location, add local business schema

```typescript
// lib/seo/schema.ts (add if applicable)
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Strive Tech',
    image: 'https://strivetech.ai/logo.png',
    '@id': 'https://strivetech.ai',
    url: 'https://strivetech.ai',
    telephone: '+1-XXX-XXX-XXXX',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Tech Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  };
}
```

---

### Phase 5: Verification & Testing (30 minutes)

#### Task 5.1: Sitemap Validation
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `http://localhost:3000/sitemap.xml`
- [ ] Verify all URLs present
- [ ] Check lastModified dates
- [ ] Verify XML format

#### Task 5.2: Robots.txt Validation
- [ ] Navigate to `http://localhost:3000/robots.txt`
- [ ] Verify sitemap reference
- [ ] Check allow/disallow rules
- [ ] Validate syntax

#### Task 5.3: Metadata Validation
- [ ] Use browser dev tools to inspect `<head>`
- [ ] Verify OpenGraph tags present
- [ ] Verify Twitter Card tags present
- [ ] Check meta description length (< 160 chars)
- [ ] Check title length (< 60 chars)

#### Task 5.4: Structured Data Validation
- [ ] Use Google's Rich Results Test
- [ ] Test organization schema
- [ ] Test blog post schema (if blog exists)
- [ ] Test breadcrumb schema
- [ ] Fix any validation errors

**Tools:**
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

#### Task 5.5: TypeScript & Linting
- [ ] Run `npx tsc --noEmit`
- [ ] Fix any type errors
- [ ] Run `npm run lint`
- [ ] Fix any linting issues

**Success Criteria:**
- Sitemap validates correctly
- Robots.txt formatted properly
- All metadata tags present
- Structured data passes validation
- TypeScript compiles (0 errors)
- Linter passes (0 warnings)

---

## 📊 Files to Create

### SEO Core Files (2 files)
```
app/
├── sitemap.ts                    # ✅ Create (sitemap generator)
└── robots.ts                     # ✅ Create (robots.txt)
```

### Schema Enhancements (1 file update)
```
lib/seo/
└── schema.ts                     # 🔄 Update (add breadcrumb, service schemas)
```

### Page Metadata Updates (15+ files)
```
app/
├── page.tsx                      # 🔄 Update (homepage metadata)
├── about/page.tsx               # 🔄 Update (about metadata)
├── contact/page.tsx             # 🔄 Update (contact metadata)
├── resources/page.tsx           # 🔄 Update (resources metadata)
├── solutions/
│   ├── page.tsx                 # 🔄 Update (solutions listing)
│   ├── ai-automation/page.tsx   # 🔄 Update (with breadcrumb)
│   ├── healthcare/page.tsx      # 🔄 Update (with breadcrumb)
│   ├── financial/page.tsx       # 🔄 Update (with breadcrumb)
│   └── [other solutions]/       # 🔄 Update all solution pages
└── portfolio/page.tsx           # 🔄 Update (portfolio metadata)
```

**Total:** 2 new files + 15+ updates

---

## 🎯 Success Criteria

- [ ] `app/sitemap.ts` created and functional
- [ ] `app/robots.ts` created and functional
- [ ] Sitemap includes all pages (static + dynamic)
- [ ] Robots.txt references sitemap
- [ ] All pages have enhanced metadata (OpenGraph + Twitter)
- [ ] Breadcrumb schema on solution pages
- [ ] Service schema on solution pages
- [ ] Organization schema in root layout
- [ ] Blog post schema on blog posts
- [ ] All structured data validates
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] SEO score 100 (Lighthouse)

---

## 🔗 Integration Points

### With SESSION2 (lib/seo/)
```typescript
import { generateMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbSchema, getServiceSchema } from '@/lib/seo/schema';
```

### With Data Files
```typescript
import { projects } from '@/data/projects';
import { caseStudies } from '@/data/resources/case-studies';
import { blogPosts } from '@/data/resources/blog-posts';
```

### With All Pages
- Every page gets enhanced metadata
- Solution pages get breadcrumb + service schema
- Blog posts get article schema
- Case studies get article schema

---

## 📝 Implementation Notes

### SEO Best Practices

**Meta Title Guidelines:**
- Length: 50-60 characters
- Include primary keyword
- Include brand name: "| Strive Tech"
- Unique for each page

**Meta Description Guidelines:**
- Length: 150-160 characters
- Include call-to-action
- Include primary keyword
- Compelling and descriptive

**OpenGraph Image Guidelines:**
- Size: 1200x630 pixels
- Format: PNG or JPG
- Unique per page (or default)
- Text overlay readable

**Sitemap Priorities:**
- Homepage: 1.0
- Main sections: 0.9 (contact, solutions, resources)
- Secondary pages: 0.7-0.8
- Legal pages: 0.3 (privacy, terms)

**Change Frequencies:**
- Homepage: daily
- Blog: daily
- Solutions: monthly
- Legal: yearly

### Structured Data Best Practices

**Organization Schema:**
- Required for all businesses
- Include social profiles
- Include contact information
- Place in root layout

**Breadcrumb Schema:**
- Improves navigation in SERPs
- Shows page hierarchy
- Include on all deep pages

**Article/BlogPosting Schema:**
- Required for blog posts
- Improves rich results
- Include author, publish date
- Include featured image

---

## 🚀 Quick Start Command

```bash
# Create sitemap and robots files
touch app/sitemap.ts app/robots.ts

# Validate after implementation
npm run dev
# Visit http://localhost:3000/sitemap.xml
# Visit http://localhost:3000/robots.txt

# Check TypeScript and linting
npx tsc --noEmit && npm run lint

# Test with Google Rich Results
# https://search.google.com/test/rich-results
```

---

## 🔄 Dependencies

**Requires (from previous sessions):**
- ✅ SESSION2: `lib/seo/` utilities created
- ✅ Data files: `data/projects/`, `data/resources/`
- ✅ Existing pages to update

**Blocks (must complete before):**
- SESSION7: SEO testing needs this complete

**Enables:**
- Search engines can discover all pages
- Rich results in Google Search
- Better click-through rates
- Improved search rankings
- Social media sharing optimization

---

## 📖 Reference Files

**Read before starting:**
- `lib/seo/metadata.ts` - Metadata generator (SESSION2)
- `lib/seo/schema.ts` - JSON-LD schemas (SESSION2)
- `app/layout.tsx` - Organization schema placement
- `data/` - Content for dynamic pages

**External Resources:**
- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Schema.org: https://schema.org/
- Google Rich Results: https://developers.google.com/search/docs/appearance/structured-data
- Sitemap Protocol: https://www.sitemaps.org/

---

## ✅ Pre-Session Checklist

Before starting:
- [ ] SESSION2 complete (lib/seo/ exists)
- [ ] All pages identified for metadata update
- [ ] Data files accessible
- [ ] Google Rich Results Test bookmark ready
- [ ] Environment variables configured

---

## 📊 Session Completion Checklist

Mark complete when:
- [ ] Sitemap created and validates
- [ ] Robots.txt created and validates
- [ ] All pages have enhanced metadata
- [ ] Structured data on all relevant pages
- [ ] Rich Results Test passes
- [ ] TypeScript compiles (0 errors)
- [ ] Linter passes (0 warnings)
- [ ] Lighthouse SEO score = 100
- [ ] All URLs in sitemap functional
- [ ] Social sharing works (OpenGraph)
- [ ] Ready for SESSION4

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
