# Session 2: lib/ Infrastructure & Analytics - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2 hours
**Dependencies:** None (can run parallel with SESSION1)
**Parallel Safe:** Yes

---

## 🎯 Session Objectives

Create the missing `lib/` directory structure with essential utilities for SEO, analytics, forms, and general helpers. This infrastructure will be used throughout the website project.

**What Exists:**
- ✅ `lib/` directory exists but is empty ⚠️
- ✅ Next.js configuration
- ✅ TypeScript configuration

**What's Missing:**
- ❌ `lib/utils/` - Helper utilities (cn, formatters)
- ❌ `lib/seo/` - SEO utilities and metadata generators
- ❌ `lib/analytics/` - Analytics integration
- ❌ `lib/forms/` - Form utilities and schemas (basic setup)

---

## 📋 Task Breakdown

### Phase 1: Utils Directory (30 minutes)

**Directory:** `lib/utils/`

#### File 1: `lib/utils/cn.ts`
- [ ] Create className utility function
- [ ] Import clsx and tailwind-merge
- [ ] Export cn function for merging Tailwind classes

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Success Criteria:**
- Function properly merges Tailwind classes
- Handles conditional classes
- Removes conflicting classes

---

#### File 2: `lib/utils/formatters.ts`
- [ ] Create date formatting functions
- [ ] Create number formatting functions
- [ ] Create URL slug generator
- [ ] Create text truncation helper

```typescript
// Date formatters
export function formatDate(date: Date | string, format?: string): string;
export function formatRelativeDate(date: Date | string): string;

// Number formatters
export function formatNumber(num: number): string;
export function formatCurrency(amount: number, currency?: string): string;

// Text formatters
export function createSlug(text: string): string;
export function truncate(text: string, length: number): string;
export function pluralize(count: number, singular: string, plural?: string): string;
```

**Success Criteria:**
- All formatters handle edge cases
- Type-safe with TypeScript
- Reusable across components

---

#### File 3: `lib/utils/validation.ts`
- [ ] Create common validation helpers
- [ ] Email validation
- [ ] URL validation
- [ ] Phone number validation

```typescript
export function isValidEmail(email: string): boolean;
export function isValidUrl(url: string): boolean;
export function isValidPhone(phone: string): boolean;
export function sanitizeHtml(html: string): string;
```

**Success Criteria:**
- Regex patterns tested
- XSS protection in sanitizeHtml
- Type-safe validation

---

#### File 4: `lib/utils/index.ts`
- [ ] Export all utilities
- [ ] Create clean public API

---

### Phase 2: SEO Directory (45 minutes)

**Directory:** `lib/seo/`

#### File 1: `lib/seo/metadata.ts`
- [ ] Create generateMetadata helper function
- [ ] Support OpenGraph tags
- [ ] Support Twitter Card tags
- [ ] Support canonical URLs

```typescript
import type { Metadata } from 'next';

interface MetadataParams {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
}

export function generateMetadata(params: MetadataParams): Metadata {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}${params.path}`;
  const ogImage = params.image || `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;

  return {
    title: params.title,
    description: params.description,
    keywords: params.keywords,
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: 'Strive Tech',
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: 'en_US',
      type: params.type || 'website',
      ...(params.publishedTime && { publishedTime: params.publishedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      images: [ogImage],
      ...(params.author && { creator: params.author }),
    },
    alternates: {
      canonical: url,
    },
  };
}
```

**Success Criteria:**
- Generates complete metadata objects
- Handles optional parameters
- Type-safe with Next.js Metadata type
- Defaults to environment variables

---

#### File 2: `lib/seo/schema.ts`
- [ ] Create JSON-LD schema generators
- [ ] Organization schema
- [ ] Blog post schema
- [ ] Case study schema
- [ ] FAQ schema

```typescript
// Organization schema
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Strive Tech',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description: 'AI-Powered Business Solutions & Custom Software Development',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'customer service',
      email: 'contact@strivetech.ai',
      areaServed: 'US',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://linkedin.com/company/strive-tech',
      'https://twitter.com/strive_tech',
    ],
  };
}

// Blog post schema
export function getBlogPostSchema(post: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Strive Tech',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  };
}

// Case study schema (Article type)
export function getCaseStudySchema(caseStudy: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  image: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: caseStudy.title,
    description: caseStudy.description,
    image: caseStudy.image,
    datePublished: caseStudy.datePublished,
    author: {
      '@type': 'Organization',
      name: 'Strive Tech',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Strive Tech',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
  };
}

// FAQ schema
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
```

**Success Criteria:**
- Valid JSON-LD schemas
- Follows schema.org specifications
- Type-safe interfaces
- Reusable across content types

---

#### File 3: `lib/seo/index.ts`
- [ ] Export all SEO utilities
- [ ] Create public API

---

### Phase 3: Analytics Directory (30 minutes)

**Directory:** `lib/analytics/`

#### File 1: `lib/analytics/google.tsx`
- [ ] Create Google Analytics component
- [ ] Client component with 'use client'
- [ ] Load gtag.js script
- [ ] Initialize GA4

```typescript
'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  gaId: string;
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId || process.env.NODE_ENV !== 'production') {
    return null; // Don't load in development
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
```

**Success Criteria:**
- Only loads in production
- Uses Next.js Script component
- Proper loading strategy (afterInteractive)
- Type-safe props

---

#### File 2: `lib/analytics/events.ts`
- [ ] Create event tracking helpers
- [ ] Type-safe event tracking
- [ ] Common event templates

```typescript
// Event tracking types
export type AnalyticsEvent =
  | { name: 'sign_up_clicked'; platform: string }
  | { name: 'demo_requested'; source: string }
  | { name: 'contact_form_submitted'; page: string }
  | { name: 'resource_downloaded'; resourceType: string; resourceId: string }
  | { name: 'page_view'; page: string };

// Track event
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || !window.gtag) {
    return; // Server-side or gtag not loaded
  }

  window.gtag('event', event.name, {
    ...event,
  });
}

// Convenience functions
export function trackSignUp(platform: string) {
  trackEvent({ name: 'sign_up_clicked', platform });
}

export function trackDemoRequest(source: string) {
  trackEvent({ name: 'demo_requested', source });
}

export function trackContactForm(page: string) {
  trackEvent({ name: 'contact_form_submitted', page });
}

export function trackResourceDownload(resourceType: string, resourceId: string) {
  trackEvent({ name: 'resource_downloaded', resourceType, resourceId });
}
```

**Success Criteria:**
- Type-safe event tracking
- Server-side safe (checks for window)
- Reusable event functions
- Extensible event types

---

#### File 3: `lib/analytics/index.ts`
- [ ] Export GoogleAnalytics component
- [ ] Export tracking functions

---

### Phase 4: Forms Directory (15 minutes)

**Directory:** `lib/forms/`

#### File 1: `lib/forms/schemas.ts` (Basic setup, enhanced in SESSION4)
- [ ] Create basic form schemas
- [ ] Use Zod for validation

```typescript
import { z } from 'zod';

// Basic contact schema (will enhance in SESSION4)
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Newsletter subscription schema
export const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type NewsletterData = z.infer<typeof NewsletterSchema>;
```

**Success Criteria:**
- Zod schemas for validation
- Type inference working
- Reusable across forms

---

#### File 2: `lib/forms/index.ts`
- [ ] Export form schemas
- [ ] Export form types

---

### Phase 5: Layout Integration (15 minutes)

#### Task 5.1: Update `app/layout.tsx`
- [ ] Import GoogleAnalytics component
- [ ] Add GoogleAnalytics to layout
- [ ] Import organization schema
- [ ] Add JSON-LD script tag

```typescript
// app/layout.tsx (update)
import { GoogleAnalytics } from '@/lib/analytics/google';
import { getOrganizationSchema } from '@/lib/seo/schema';

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
      </head>
      <body>
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
```

**Success Criteria:**
- Analytics loads in production
- Organization schema present
- No TypeScript errors
- No hydration errors

---

### Phase 6: Verification & Testing (15 minutes)

#### Task 6.1: TypeScript Compilation
- [ ] Run `npx tsc --noEmit`
- [ ] Fix any type errors
- [ ] Verify all exports

#### Task 6.2: Linting
- [ ] Run `npm run lint`
- [ ] Fix any linting issues
- [ ] Verify file structure

#### Task 6.3: Manual Testing
- [ ] Start dev server: `npm run dev`
- [ ] Check Network tab for analytics script
- [ ] Verify organization schema in page source
- [ ] Test utility functions in console

**Success Criteria:**
- TypeScript compiles (0 errors)
- Linter passes (0 warnings)
- Analytics script present (production only)
- Organization schema in HTML

---

## 📊 Files to Create

### lib/utils/ (4 files)
```
lib/utils/
├── cn.ts                 # ✅ Create (className utility)
├── formatters.ts         # ✅ Create (date, number, text formatters)
├── validation.ts         # ✅ Create (validation helpers)
└── index.ts             # ✅ Create (exports)
```

### lib/seo/ (3 files)
```
lib/seo/
├── metadata.ts          # ✅ Create (metadata generator)
├── schema.ts            # ✅ Create (JSON-LD schemas)
└── index.ts            # ✅ Create (exports)
```

### lib/analytics/ (3 files)
```
lib/analytics/
├── google.tsx          # ✅ Create (GA component)
├── events.ts           # ✅ Create (event tracking)
└── index.ts           # ✅ Create (exports)
```

### lib/forms/ (2 files)
```
lib/forms/
├── schemas.ts          # ✅ Create (form validation schemas)
└── index.ts           # ✅ Create (exports)
```

### Updates (1 file)
```
app/
└── layout.tsx          # 🔄 Update (add analytics & schema)
```

**Total:** 12 new files + 1 update

---

## 🎯 Success Criteria

- [ ] All 12 files created
- [ ] `app/layout.tsx` updated
- [ ] TypeScript compiles with 0 errors
- [ ] Linter passes with 0 warnings
- [ ] All files under 200 lines
- [ ] Analytics integration working
- [ ] Organization schema present
- [ ] All utilities properly exported
- [ ] Type-safe across all functions
- [ ] Server-only code protected

---

## 🔗 Integration Points

### With SESSION1 (Homepage)
```typescript
// Can use utilities in homepage components
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatters';
import { trackSignUp } from '@/lib/analytics/events';
```

### With SESSION3 (SEO)
```typescript
// Will use metadata generator
import { generateMetadata } from '@/lib/seo/metadata';
import { getBlogPostSchema } from '@/lib/seo/schema';
```

### With SESSION4 (Forms)
```typescript
// Will use form schemas
import { ContactFormSchema } from '@/lib/forms/schemas';
```

### With All Sessions
- Utilities used throughout components
- Analytics tracking on conversions
- SEO helpers for all pages

---

## 📝 Implementation Notes

### Google Analytics Setup
- Only loads in production (`NODE_ENV === 'production'`)
- Uses `afterInteractive` strategy (loads after page interactive)
- Placed at end of `<body>` for performance
- Environment variable: `NEXT_PUBLIC_GA_ID`

### JSON-LD Placement
- Organization schema in root layout (all pages)
- Blog post schema in blog layout (SESSION3)
- Case study schema in case study pages (SESSION3)
- FAQ schema where applicable

### Type Safety
- All utilities have TypeScript types
- Zod schemas provide type inference
- Next.js Metadata type for SEO

### Performance Considerations
- Analytics script loads after page interactive
- JSON-LD is static (no runtime cost)
- Utilities are tree-shakeable

---

## 🚀 Quick Start Command

```bash
# Create directory structure
mkdir -p lib/utils lib/seo lib/analytics lib/forms

# After implementation
npx tsc --noEmit && npm run lint && npm run dev
```

---

## 🔄 Dependencies

**Requires:**
- ✅ Next.js 15 installed
- ✅ TypeScript configured
- ✅ Zod installed (`npm install zod`)
- ✅ clsx and tailwind-merge (`npm install clsx tailwind-merge`)

**Optional (install if missing):**
```bash
npm install zod clsx tailwind-merge @hookform/resolvers
```

**Blocks:**
- SESSION3: Needs SEO utilities
- SESSION4: Needs form schemas
- SESSION6: Needs analytics tracking

**Enables:**
- All sessions can use utilities
- SEO optimization possible
- Analytics tracking ready
- Form validation infrastructure

---

## 📖 Reference Files

**Read before starting:**
- `(website)/CLAUDE.md` - Website standards
- `(website)/PLAN.md` - Overall plan
- Next.js Metadata API docs
- Google Analytics 4 documentation
- Zod documentation

**Similar Patterns:**
- Look for any existing utility files in main project
- Check platform `lib/` for patterns (if accessible)

---

## ✅ Pre-Session Checklist

Before starting:
- [ ] SESSION1 started or completed (can run parallel)
- [ ] Dependencies installed (zod, clsx, tailwind-merge)
- [ ] Environment variables defined
- [ ] TypeScript and Next.js working
- [ ] Git working directory clean

---

## 📊 Session Completion Checklist

Mark complete when:
- [ ] All 12 files created
- [ ] Layout updated with analytics
- [ ] TypeScript compiles (0 errors)
- [ ] Linter passes (0 warnings)
- [ ] Analytics script loads in production
- [ ] Organization schema in page source
- [ ] All utilities tested
- [ ] All exports working
- [ ] Documentation comments added
- [ ] Ready for SESSION3 (SEO)

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
