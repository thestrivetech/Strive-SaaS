# Strive Tech Marketing Website

**Public Marketing & Lead Generation Site**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-100-success)](https://developers.google.com/web/tools/lighthouse)

> **Quick Reference:** For development rules and SEO best practices, see [`/CLAUDE.md`](./CLAUDE.md). For root project standards, see [`../CLAUDE.md`](../CLAUDE.md).

---

## 🎯 Project Overview

**Strive Tech Marketing Website** is the public-facing site for Strive Tech, focused on:

### Primary Goals

1. **Lead Generation** - Contact forms, demo requests, business assessments
2. **SEO Optimization** - Rank for key industry terms
3. **Brand Presence** - Showcase company values, team, portfolio
4. **Content Marketing** - Blog posts, case studies, whitepapers
5. **Solution Education** - Explain AI/tech solutions to potential clients

### Key Pages

**Public Pages:**
- Homepage - Company overview and value proposition
- About - Company story, team, vision
- Solutions - 7+ solution pages (AI Automation, Healthcare, Real Estate, etc.)
- Resources - Blog, case studies, whitepapers
- Portfolio - Project showcase
- Contact - Contact form

**Lead Generation:**
- Assessment - Business needs assessment
- Request Demo - Demo request form
- Onboarding - Client onboarding flow

### Key Features

- **SEO Optimized** - 100/100 Lighthouse SEO score
- **Static Generation** - Pre-rendered for speed
- **Core Web Vitals** - LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Responsive Design** - Mobile-first approach
- **Lead Capture** - Multiple conversion points
- **Content Rich** - Structured, reusable content

---

## Tech Stack

### Core Framework
```yaml
Framework: Next.js 15 (App Router)
Runtime: React 19.1.0
Language: TypeScript 5.6+
Styling: Tailwind CSS + shadcn/ui
```

### Rendering Strategy
```yaml
Default: Static Site Generation (SSG)
  - All public pages pre-rendered at build time
  - Fast load times, excellent SEO

Dynamic: Server-Side Rendering (SSR)
  - Only for personalized/dynamic content

ISR: Incremental Static Regeneration
  - For content that updates periodically
```

### SEO & Analytics
```yaml
SEO: Next.js Metadata API + JSON-LD
Sitemap: Auto-generated from routes
Robots: Configured for crawling
Analytics: Vercel Analytics + Google Analytics 4
Monitoring: Core Web Vitals tracking
```

### UI & Content
```yaml
UI Components: shadcn/ui + Radix UI
Icons: Lucide React
Fonts: Next.js Font Optimization (Inter)
Images: Next.js Image (WebP/AVIF)
Content: TypeScript data files (data/)
```

### Forms & Lead Generation
```yaml
Forms: React Hook Form + Zod
Email: Nodemailer (SMTP)
Scheduling: Calendly integration
Spam Protection: Honeypot + rate limiting
```

### Testing & Quality
```yaml
Unit/Integration: Jest + React Testing Library
Coverage: 80% minimum
Lighthouse: SEO 100, Performance 90+
```

---

## Getting Started

### 1. Environment Setup

Create `.env.local`:
```bash
# Email (for contact form)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@strivetech.ai"
SMTP_PASS="your-app-password"

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Calendly (Optional)
NEXT_PUBLIC_CALENDLY_URL="https://calendly.com/strive-tech"

# App
NEXT_PUBLIC_SITE_URL="https://strivetech.ai"
NODE_ENV="development"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Build & Preview

```bash
# Production build
npm run build

# Preview production build
npm start
```

---

## Project Structure

```
(website)/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with SEO
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles
│   │
│   ├── about/               # About page
│   ├── solutions/           # Solutions pages
│   │   ├── page.tsx        # Solutions overview
│   │   ├── ai-automation/
│   │   ├── healthcare/
│   │   ├── real-estate/
│   │   ├── financial/
│   │   └── ...
│   │
│   ├── resources/           # Resources hub
│   │   └── page.tsx
│   │
│   ├── portfolio/           # Project showcase
│   ├── contact/             # Contact form
│   ├── assessment/          # Business assessment
│   ├── request/             # Demo request
│   │
│   └── api/                 # API routes (forms only)
│       ├── contact/
│       ├── assessment/
│       └── request/
│
├── components/
│   └── (web)/               # Website components
│       ├── layouts/
│       │   ├── footer.tsx
│       │   └── navigation.tsx
│       ├── seo/
│       │   └── meta-tags.tsx
│       ├── solutions/
│       │   ├── hero-section.tsx
│       │   └── solution-card.tsx
│       ├── resources/
│       │   └── resource-grid.tsx
│       └── contact/
│           └── contact-form.tsx
│
├── data/                    # Content data (TypeScript)
│   ├── index.ts            # Re-exports
│   ├── solutions.tsx       # Solutions content
│   ├── industries.tsx      # Industries data
│   ├── industry-statistics.ts
│   ├── projects/           # Portfolio projects
│   │   ├── index.ts
│   │   ├── computer-vision.ts
│   │   └── rag-knowledge.ts
│   └── resources/
│       ├── blog-posts/
│       ├── case-studies/
│       └── whitepapers/
│
├── lib/
│   └── utils/              # Utilities
│       ├── seo-config.ts  # SEO helpers
│       └── analytics.ts   # Analytics tracking
│
├── public/
│   └── assets/            # Static assets
│       ├── logos/
│       ├── headshots/
│       └── optimized/     # Optimized images
│
└── __tests__/             # Test suites
```

---

## Content Management

### Content Organization

All content is stored in `data/` directory as TypeScript files for type safety:

```typescript
// data/solutions.tsx
export const solutions = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    shortDescription: 'Transform your business processes...',
    fullDescription: 'Detailed description...',
    slug: '/solutions/ai-automation',
    icon: BrainCircuit,
    features: [
      'Intelligent process automation',
      'Machine learning integration',
      'Predictive analytics'
    ],
    benefits: [...],
    cta: {
      text: 'Learn More',
      href: '/solutions/ai-automation'
    }
  },
  // ...
];

export type Solution = typeof solutions[number];
```

### Adding New Content

**1. Solutions:**
```typescript
// data/solutions.tsx
export const solutions = [
  // Add new solution object
  {
    id: 'new-solution',
    title: 'New Solution',
    // ...
  }
];
```

**2. Blog Posts:**
```typescript
// data/resources/blog-posts/my-post.ts
export const myPost = {
  id: 'my-post-slug',
  title: 'My Blog Post',
  excerpt: 'Short description...',
  content: `Full markdown content...`,
  author: 'John Doe',
  publishedAt: '2025-01-15',
  tags: ['AI', 'Automation'],
};
```

**3. Projects:**
```typescript
// data/projects/my-project.ts
export const myProject = {
  id: 'my-project',
  title: 'Project Name',
  description: 'Project description...',
  technologies: ['Next.js', 'AI', 'PostgreSQL'],
  link: 'https://project-url.com',
  image: '/assets/projects/my-project.jpg',
};
```

---

## SEO Optimization

### Metadata Configuration

Every page MUST have unique metadata:

```typescript
// app/solutions/ai-automation/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Automation Solutions | Strive Tech',
  description: 'Transform your business with intelligent AI automation. Reduce costs, increase efficiency, and scale operations with our proven AI solutions.',
  keywords: ['AI automation', 'machine learning', 'process automation'],

  openGraph: {
    title: 'AI Automation Solutions | Strive Tech',
    description: 'Transform your business with intelligent AI automation...',
    images: ['/assets/solutions/ai-automation-og.jpg'],
    url: 'https://strivetech.ai/solutions/ai-automation',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'AI Automation Solutions | Strive Tech',
    description: 'Transform your business with intelligent AI automation...',
    images: ['/assets/solutions/ai-automation-twitter.jpg'],
  },
};
```

### Structured Data (JSON-LD)

Add structured data for rich results:

```typescript
// components/seo/organization-schema.tsx
export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Strive Tech',
          url: 'https://strivetech.ai',
          logo: 'https://strivetech.ai/assets/logos/strive_logo.webp',
          description: 'AI-powered solutions for modern businesses',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-XXX-XXX-XXXX',
            contactType: 'Customer Service',
          },
        })
      }}
    />
  );
}
```

### Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { solutions } from '@/data/solutions';
import { projects } from '@/data/projects';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://strivetech.ai';

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/solutions',
    '/resources',
    '/portfolio',
    '/contact',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic solution pages
  const solutionPages = solutions.map(solution => ({
    url: `${baseUrl}${solution.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...solutionPages];
}
```

---

## Performance Optimization

### Image Optimization

**ALWAYS use Next.js Image component:**

```typescript
import Image from 'next/image';

// ✅ Optimized image
<Image
  src="/assets/solutions/ai-hero.jpg"
  alt="AI Automation Solutions"
  width={1200}
  height={600}
  priority  // For above-the-fold images
  sizes="(max-width: 768px) 100vw, 50vw"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ NEVER use <img>
<img src="/assets/image.jpg" alt="..." />
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Heavy components (charts, visualizations)
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// Below-the-fold content
<Suspense fallback={<Skeleton />}>
  <BelowTheFoldContent />
</Suspense>
```

### Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
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

---

## Forms & Lead Generation

### Contact Form

```typescript
// components/contact/contact-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message too short'),
});

type ContactInput = z.infer<typeof ContactSchema>;

export function ContactForm() {
  const form = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
  });

  async function onSubmit(data: ContactInput) {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Message sent successfully!');
      form.reset();
    } else {
      toast.error('Failed to send message');
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### API Route Handler

```typescript
// app/api/contact/route.ts
import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { ContactSchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.ip ?? 'unknown';
  const { success } = await rateLimit(ip);
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // Parse and validate
  const body = await req.json();
  const data = ContactSchema.parse(body);

  // Check honeypot
  if (body.website) {
    return new Response('Bad Request', { status: 400 });
  }

  // Send email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: 'contact@strivetech.ai',
    subject: `Contact Form: ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `,
  });

  return new Response('OK', { status: 200 });
}
```

---

## Development Commands

```bash
# Setup
npm install                 # Install dependencies

# Development
npm run dev                 # Start dev server
npm run lint:fix           # Fix linting issues

# Building
npm run build              # Production build
npm start                  # Preview production build
npm run analyze            # Bundle size analysis

# Testing
npm test                   # Run all tests
npm test -- --coverage     # With coverage report
npm test -- --watch        # Watch mode

# SEO & Performance
npm run lighthouse         # Run Lighthouse audit (if configured)

# Pre-commit (ALWAYS RUN)
npm run lint               # ESLint - Zero warnings
npm run type-check         # TypeScript - Zero errors
npm test                   # Tests - 80% coverage minimum
```

---

## Testing Strategy

### Coverage Requirements

- **Components:** 70% (UI focus)
- **Forms:** 90% (critical for leads)
- **API Routes:** 100% (lead capture)
- **SEO Utilities:** 80%
- **Overall:** 80% minimum

### Test Examples

**Form Validation:**
```typescript
// __tests__/components/contact-form.test.tsx
describe('ContactForm', () => {
  it('should validate email format', async () => {
    const { getByLabelText, getByText } = render(<ContactForm />);

    const emailInput = getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(getByText('Valid email required')).toBeInTheDocument();
    });
  });

  it('should submit form successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true })
    );

    const { getByLabelText, getByText } = render(<ContactForm />);

    // Fill form
    fireEvent.change(getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(getByLabelText('Message'), { target: { value: 'Test message here' } });

    // Submit
    fireEvent.click(getByText('Send Message'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', expect.any(Object));
    });
  });
});
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] All pages have unique metadata
- [ ] Lighthouse SEO score: 100
- [ ] Lighthouse Performance: 90+
- [ ] Core Web Vitals passing
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Forms tested (spam protection enabled)
- [ ] Images optimized (WebP/AVIF)
- [ ] 80%+ test coverage
- [ ] Build succeeds
- [ ] Analytics configured

### Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Verify deployment
# - https://strivetech.ai
```

### Environment Variables (Vercel)

Set in Vercel dashboard:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS` (encrypted)
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_CALENDLY_URL`
- `NEXT_PUBLIC_SITE_URL`

---

## Analytics & Monitoring

### Google Analytics 4

```typescript
// lib/analytics.ts
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Usage
trackEvent('form_submission', {
  form_type: 'contact',
  form_location: 'homepage',
});
```

### Core Web Vitals

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Troubleshooting

### SEO Issues

**Problem:** Low Lighthouse SEO score
```bash
# Check metadata on all pages
npm run build
# Manually verify each page has unique meta tags
```

**Problem:** Missing structured data
```typescript
// Add JSON-LD schema to layout.tsx or specific pages
<OrganizationSchema />
<BreadcrumbSchema />
```

### Performance Issues

**Problem:** Large bundle size
```bash
# Analyze bundle
npm run analyze

# Solutions:
# 1. Dynamic import heavy components
# 2. Use tree-shakeable imports
# 3. Remove unused dependencies
```

**Problem:** Slow image loading
```typescript
// Use Next.js Image with priority
<Image priority src="..." alt="..." />

// Use modern formats
// WebP/AVIF instead of PNG/JPG
```

---

## Related Documentation

- [Development Rules](./CLAUDE.md) - Website-specific standards
- [Root Project Standards](../CLAUDE.md) - Shared development rules
- [Root README](../README.md) - Repository overview
- [Chatbot Project](../(chatbot)/README.md) - AI chatbot (Sai)
- [Platform Project](../(platform)/README.md) - SaaS platform

---

**Built with ❤️ by Strive Tech**
