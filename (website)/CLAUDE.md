# CLAUDE-WEBSITE.md

**Claude's Session Memory | v1.0 | Website Project Standards**

> ## 🔴 CRITICAL: READ-BEFORE-EDIT MANDATE
>
> **YOU MUST FOLLOW THESE STEPS BEFORE ANY ACTION:**
>
> 1. **READ FIRST** - Always use Read tool on any file before editing it
> 2. **SEARCH FOR EXISTING** - Use Glob/Grep to check if files, scripts, or tests already exist
> 3. **UPDATE, DON'T CREATE** - Prefer editing existing files over creating new ones (99% of the time)
> 4. **ASK IF UNCERTAIN** - When unsure if something exists, ask the user first
>
> **For root project documentation:**
> - Main standards: [`../CLAUDE.md`](../CLAUDE.md) - Core development rules
> - Project overview: [`../README.md`](../README.md) - Repository structure

---

## 🎯 PROJECT: Strive Tech Marketing Website

**Location:** `(website)/` → strivetech.ai (Next.js project)
**Stack:** Next.js 15 + React 19.1.0 + TypeScript + Static Generation
**Focus:** Public marketing site with SEO optimization and lead generation

> **Purpose:** Marketing and public presence for Strive Tech:
> - Company information and about pages
> - Solutions and services showcase
> - Resources (blog, case studies, whitepapers)
> - Lead generation (contact, assessment, demo requests)
> - Portfolio and project showcase

---

## ⚡ TECH STACK

```yaml
Core: Next.js 15, React 19.1.0, TypeScript 5.6+

# Rendering Strategy
Static: Static Site Generation (SSG) for most pages
Dynamic: Server-side Rendering (SSR) for personalized content
ISR: Incremental Static Regeneration for updated content

# SEO & Analytics
SEO: Next.js Metadata API + JSON-LD structured data
Analytics: Vercel Analytics + Google Analytics 4
Sitemap: Auto-generated from routes
Robots: Configured for search engine crawling

# UI & Styling
UI: shadcn/ui + Radix UI
Styling: Tailwind CSS
Icons: Lucide React
Fonts: Next.js Font Optimization

# Forms & Lead Gen
Forms: React Hook Form + Zod
Email: Nodemailer (contact forms)
Calendly: Embedded scheduling

# Content Management
Content: TypeScript data files in data/
Images: Next.js Image Optimization
PDFs: Dynamic PDF generation (brochures)

Testing: Jest + React Testing Library (80% min)
```

**IMPORTANT:** SEO is critical for this project:
- **LCP < 2.5s** - Largest Contentful Paint (Core Web Vital)
- **Static generation** - Pre-render all public pages
- **Metadata** - Every page has unique title, description, OG tags
- **Structured data** - JSON-LD for rich results

---

## 📁 STRUCTURE

```
(website)/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with SEO
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles
│   ├── about/               # About Strive Tech
│   ├── solutions/           # Solutions pages
│   │   ├── page.tsx
│   │   ├── ai-automation/
│   │   ├── healthcare/
│   │   └── real-estate/
│   ├── resources/           # Blog, case studies
│   ├── portfolio/           # Project showcase
│   ├── contact/             # Contact form
│   ├── assessment/          # Business assessment
│   ├── request/             # Demo request
│   └── api/                 # API routes (form submission only)
│       └── contact/
├── components/
│   └── (web)/               # Website-specific components
│       ├── layouts/
│       ├── seo/             # SEO components
│       │   └── meta-tags.tsx
│       ├── solutions/
│       ├── resources/
│       └── contact/
├── data/                    # Content data
│   ├── solutions.tsx        # Solutions content
│   ├── projects/            # Portfolio projects
│   ├── resources/
│   │   ├── blog-posts/
│   │   ├── case-studies/
│   │   └── whitepapers/
│   └── industries/          # Industry-specific content
├── lib/
│   └── utils/               # SEO, analytics utilities
└── __tests__/               # Test suites
```

---

## 🔴 CRITICAL RULES - WEBSITE SPECIFIC

### SEO Best Practices

**1. Metadata on Every Page**
```typescript
// app/solutions/ai-automation/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Automation Solutions | Strive Tech',
  description: 'Transform your business with intelligent AI automation...',
  keywords: ['AI automation', 'machine learning', 'process automation'],
  openGraph: {
    title: 'AI Automation Solutions | Strive Tech',
    description: 'Transform your business with intelligent AI automation...',
    images: ['/assets/solutions/ai-automation-og.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Automation Solutions | Strive Tech',
    description: 'Transform your business...',
    images: ['/assets/solutions/ai-automation-twitter.jpg'],
  },
};

export default function AIAutomationPage() {
  return (/* ... */);
}

// ❌ WRONG - Missing metadata
export default function Page() {
  return <div>Content</div>;
}
```

**2. Structured Data (JSON-LD)**
```typescript
// components/seo/organization-schema.tsx
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Strive Tech',
    url: 'https://strivetech.ai',
    logo: 'https://strivetech.ai/assets/logos/strive_logo.webp',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      areaServed: 'US',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://linkedin.com/company/strive-tech',
      'https://twitter.com/strive_tech',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ✅ Include in layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <OrganizationSchema />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**3. Static Generation (Default)**
```typescript
// ✅ Static generation for public pages
export default async function SolutionsPage() {
  // Data can be fetched at build time
  const solutions = await getSolutions();
  return <SolutionsList data={solutions} />;
}

// Generate static params for dynamic routes
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map(p => ({ projectId: p.id }));
}

// ❌ WRONG - Using dynamic rendering unnecessarily
export const dynamic = 'force-dynamic'; // Avoid unless needed
```

### Performance Optimization

**1. Image Optimization (CRITICAL)**
```typescript
// ✅ ALWAYS use Next.js Image
import Image from 'next/image';

<Image
  src="/assets/solutions/ai-hero.jpg"
  alt="AI Automation Solutions"
  width={1200}
  height={600}
  priority  // For above-the-fold images
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// ❌ NEVER use <img> tag
<img src="/assets/image.jpg" alt="..." /> // Slow, no optimization
```

**2. Font Optimization**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
  variable: '--font-sans',
});

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

**3. Code Splitting**
```typescript
// ✅ Dynamic import for heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Don't render on server
});

// ✅ Lazy load below-the-fold content
<Suspense fallback={<Skeleton />}>
  <BelowTheFoldContent />
</Suspense>
```

### Content Management

**1. Structured Content Data**
```typescript
// data/solutions.tsx
export const solutions = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Transform your business...',
    slug: '/solutions/ai-automation',
    icon: BrainCircuit,
    features: ['Feature 1', 'Feature 2'],
    cta: { text: 'Learn More', href: '/solutions/ai-automation' },
  },
  // ...
];

// ✅ Type-safe content
export type Solution = typeof solutions[number];

// ❌ WRONG - Hardcoded content in components
function Component() {
  return <div>Transform your business...</div>; // No reusability
}
```

**2. Content File Organization**
```
data/
├── index.ts                  # Re-export all data
├── solutions.tsx             # Solutions data
├── industries.tsx            # Industries data
├── projects/
│   ├── index.ts             # All projects
│   ├── computer-vision.ts
│   └── rag-knowledge.ts
└── resources/
    ├── blog-posts/
    ├── case-studies/
    └── whitepapers/
```

### Lead Generation Forms

**1. Form Validation & Submission**
```typescript
// components/contact/contact-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactSchema } from '@/lib/schemas';

export function ContactForm() {
  const form = useForm({
    resolver: zodResolver(ContactSchema),
  });

  async function onSubmit(data: ContactInput) {
    // Client-side submission to API route
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Message sent!');
    }
  }

  return (/* form JSX */);
}

// ✅ Server-side handling
// app/api/contact/route.ts
export async function POST(req: Request) {
  const data = await req.json();
  const validated = ContactSchema.parse(data);

  // Send email via Nodemailer
  await sendContactEmail(validated);

  return new Response('OK', { status: 200 });
}
```

**2. Spam Protection**
```typescript
// Add honeypot field (hidden from users)
<input
  type="text"
  name="website"
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
/>

// Server-side check
if (data.website) {
  return new Response('Bad Request', { status: 400 }); // Bot detected
}

// Rate limiting
const { success } = await rateLimit(ip);
if (!success) {
  return new Response('Too Many Requests', { status: 429 });
}
```

---

## 🔒 SECURITY MANDATES - WEBSITE SPECIFIC

```typescript
// 1. Input Validation (forms)
const validated = ContactSchema.parse(formData);

// 2. XSS Prevention
✅ <div>{userContent}</div>
❌ dangerouslySetInnerHTML={{ __html: userContent }}

// 3. Rate Limiting (form submissions)
const { success } = await rateLimit(ip);

// 4. CORS (if needed for API routes)
return new Response(data, {
  headers: {
    'Access-Control-Allow-Origin': 'https://strivetech.ai',
  }
});

// 5. Email Security (prevent injection)
const sanitized = validator.escape(email);

// 6. CSP Headers
// next.config.mjs
headers: [{
  source: '/:path*',
  headers: [
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline';"
    }
  ]
}]
```

---

## 🚀 PERFORMANCE TARGETS - WEBSITE

```yaml
# Core Web Vitals (CRITICAL)
LCP: < 2.5s              # Largest Contentful Paint
FID: < 100ms             # First Input Delay
CLS: < 0.1               # Cumulative Layout Shift

# Additional Metrics
TTFB: < 600ms            # Time to First Byte
FCP: < 1.8s              # First Contentful Paint

# SEO Scores
Lighthouse SEO: 100      # Perfect SEO score
Lighthouse Performance: 90+
Lighthouse Accessibility: 100

# Bundle Size
Initial JS: < 300kb      # First load
Route JS: < 100kb        # Per route
Images: WebP/AVIF        # Modern formats
```

---

## ✅ PRE-COMMIT CHECKLIST - WEBSITE

**MANDATORY before ANY commit:**
```bash
npm run lint        # Zero warnings
npm run type-check  # Zero errors
npm test            # 80% coverage
```

**Website-Specific Checks:**
- [ ] All pages have unique metadata
- [ ] Images use Next.js Image component
- [ ] SEO score 100 (Lighthouse)
- [ ] Performance score 90+ (Lighthouse)
- [ ] JSON-LD structured data present
- [ ] Forms have validation
- [ ] Contact forms have spam protection
- [ ] No hardcoded content (use data/ files)

---

## 🛠 COMMANDS - WEBSITE

```bash
# Setup
npm install
npm run dev

# Development
npm run dev              # Start dev server
npm run lint:fix         # Fix linting issues

# SEO & Performance
npm run build            # Production build
npm run analyze          # Bundle analysis

# Testing
npm test                 # Run all tests
npm test -- --coverage   # With coverage

# Pre-commit (ALWAYS)
npm run lint && npm run type-check && npm test
```

---

## 🎯 CORE PRINCIPLES - WEBSITE

1. **SEO-first** - Every page optimized for search
2. **Performance-first** - Core Web Vitals must pass
3. **Static generation** - Pre-render everything possible
4. **Content in data/** - No hardcoded content
5. **Image optimization** - Always use Next.js Image
6. **Lead generation** - Forms must be validated
7. **Accessibility** - WCAG 2.1 AA compliance
8. **Mobile-first** - Responsive on all devices

---

## ❌ NEVER DO THIS - WEBSITE

```typescript
// SEO Anti-patterns
❌ // Missing metadata
❌ <img src="..." /> // Use Next.js Image
❌ export const dynamic = 'force-dynamic'; // Avoid for public pages

// Performance Anti-patterns
❌ import _ from 'lodash'; // Import entire library
❌ <div style={{ backgroundImage: `url(${largeImage})` }}> // Unoptimized
❌ // Inline large CSS (use CSS modules)

// Content Anti-patterns
❌ return <div>Hardcoded content...</div>; // Use data/ files
❌ const content = 'Lorem ipsum...'; // Externalize content

// Form Anti-patterns
❌ // No validation on form
❌ // No spam protection
❌ await fetch('/api/contact', { body: unvalidatedData }); // Validate first
```

---

## 🔗 QUICK REFS - WEBSITE

- **Pages:**
  - Homepage, About, Solutions (7+), Resources, Portfolio, Contact
  - Assessment, Demo Request, Onboarding

- **Content Types:**
  - Solutions, Industries, Projects, Blog Posts, Case Studies, Whitepapers

- **Forms:**
  - Contact, Assessment, Demo Request
  - All use React Hook Form + Zod

- **SEO Tools:**
  - Metadata API, JSON-LD, Sitemap, Robots.txt

---

**Remember:** This is public marketing. SEO > Speed > Features. Every point of Lighthouse matters.
