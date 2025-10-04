# Website Production Plan

**Project:** Strive Tech Marketing Website
**Domain:** `strivetech.ai`
**Type:** Marketing & Content Website
**Framework:** Next.js 15.6.0 + React 19.1.0 + TypeScript 5.6+
**Status:** 🚧 Content Population → Production Launch

---

## 🎯 Project Overview

The **Website** is the public-facing marketing site for Strive Tech, showcasing:
- **Services** - AI solutions, custom software, consulting
- **Solutions** - Industry-specific offerings (Healthcare, Real Estate, Finance, etc.)
- **Portfolio** - Case studies and project showcases
- **Resources** - Blog posts, whitepapers, guides
- **Lead Generation** - Contact forms, assessments, demos
- **SEO Optimization** - Organic traffic and rankings

### Goals
1. Drive qualified leads to the Platform (app.strivetech.ai)
2. Establish Strive Tech as industry authority
3. Showcase technical capabilities and past work
4. Educate potential customers about AI/automation
5. Convert visitors to Platform signups

---

## 📁 Current Structure Analysis

### ✅ What's Correct

```
(website)/
├── app/                              # Next.js App Router ✅
│   ├── layout.tsx                   # Root layout ✅
│   ├── about/                       # About page ✅
│   ├── assessment/                  # AI readiness assessment ✅
│   ├── chatbot-sai/                # Chatbot demo ✅
│   ├── contact/                     # Contact form ✅
│   ├── cookies/                     # Cookie policy ✅
│   ├── onboarding/                  # User onboarding ✅
│   ├── portfolio/                   # Project portfolio ✅
│   ├── privacy/                     # Privacy policy ✅
│   ├── request/                     # Demo request ✅
│   ├── resources/                   # Blog & resources ✅
│   ├── solutions/                   # Solutions pages ✅
│   │   ├── ai-automation/
│   │   ├── blockchain/
│   │   ├── business-intelligence/
│   │   ├── case-studies/
│   │   ├── computer-vision/
│   │   ├── data-analytics/
│   │   ├── education/
│   │   ├── financial/
│   │   ├── healthcare/
│   │   ├── manufacturing/
│   │   ├── retail/
│   │   ├── security-compliance/
│   │   ├── smart-business/
│   │   └── technology/
│   └── terms/                       # Terms of service ✅
│
├── components/                       # UI components ✅
│   └── (organized by feature)
│
├── data/                            # Static content ✅
│   ├── projects/                   # Portfolio data
│   └── resources/                  # Content data ✅
│       ├── blog-posts/
│       ├── case-studies/
│       ├── featured/
│       ├── quizzes/
│       ├── technology/
│       └── whitepapers/
│
├── hooks/                          # Custom React hooks ✅
├── lib/                           # Utilities (empty) ⚠️
└── types/                         # TypeScript types ✅
```

### ⚠️ Issues to Address

#### Issue #1: Empty lib/ Directory
```
⚠️ lib/ is empty
Should contain:
- lib/utils/ - Helper functions
- lib/seo/ - SEO utilities
- lib/analytics/ - Google Analytics, tracking
- lib/forms/ - Form handling
- lib/api/ - API clients (if needed)
```

#### Issue #2: Missing Core Pages
```
❌ Missing important pages:
- app/page.tsx (homepage) - CRITICAL
- app/pricing/ - Pricing tiers
- app/demo/ - Product demo/video
- app/blog/ - Blog listing page
- app/industries/ - Industry overview
```

#### Issue #3: No SEO Metadata
```
⚠️ Missing comprehensive SEO:
- Sitemap generation
- robots.txt optimization
- Open Graph tags
- Twitter Card metadata
- JSON-LD structured data
```

#### Issue #4: No Analytics Integration
```
❌ Missing tracking:
- Google Analytics 4
- Conversion tracking
- Heatmaps (Hotjar/Clarity)
- A/B testing setup
```

#### Issue #5: Environment Variables
```
❌ Has .env (should be .env.local)
❌ Missing .env.example
```

---

## 🚀 Phase 1: Critical Fixes & Core Pages

### Step 1.1: Create Homepage (app/page.tsx)

```typescript
// app/page.tsx
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Solutions } from '@/components/Solutions';
import { CaseStudies } from '@/components/CaseStudies';
import { Testimonials } from '@/components/Testimonials';
import { CTA } from '@/components/CTA';

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

export const metadata = {
  title: 'Strive Tech - AI-Powered Business Solutions',
  description: 'Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.',
  openGraph: {
    title: 'Strive Tech - AI-Powered Business Solutions',
    description: 'Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.',
    url: 'https://strivetech.ai',
    siteName: 'Strive Tech',
    images: [
      {
        url: 'https://strivetech.ai/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strive Tech - AI-Powered Business Solutions',
    description: 'Transform your business with custom AI automation, software development, and intelligent tools built by industry experts.',
    images: ['https://strivetech.ai/og-image.png'],
  },
};
```

### Step 1.2: Create lib/ Structure

```bash
# Create lib directories
mkdir -p lib/utils
mkdir -p lib/seo
mkdir -p lib/analytics
mkdir -p lib/forms
```

Create `lib/utils/cn.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create `lib/seo/metadata.ts`:
```typescript
import type { Metadata } from 'next';

export function generateMetadata(
  title: string,
  description: string,
  path: string,
  image?: string
): Metadata {
  const url = `https://strivetech.ai${path}`;
  const ogImage = image || 'https://strivetech.ai/og-image.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Strive Tech',
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}
```

### Step 1.3: Setup Analytics

Create `lib/analytics/google.tsx`:
```typescript
'use client';

import Script from 'next/script';

export function GoogleAnalytics({ gaId }: { gaId: string }) {
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
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
```

Update `app/layout.tsx`:
```typescript
import { GoogleAnalytics } from '@/lib/analytics/google';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
```

### Step 1.4: Environment Variables

```bash
# Rename .env to .env.local
mv .env .env.local

# Create .env.example
cat > .env.example << 'EOF'
# Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Forms (Resend for email)
RESEND_API_KEY="re_..."
CONTACT_EMAIL="contact@strivetech.ai"

# App
NEXT_PUBLIC_SITE_URL="https://strivetech.ai"
NEXT_PUBLIC_PLATFORM_URL="https://app.strivetech.ai"
NODE_ENV="development"
EOF
```

---

## 📝 Phase 2: Content Strategy

### 2.1: Homepage Sections

1. **Hero**
   - Value proposition: "AI-Powered Business Solutions"
   - Primary CTA: "Start Free Trial" → Platform signup
   - Secondary CTA: "Book Demo" → Calendar booking

2. **Social Proof**
   - Client logos (if available)
   - Stats: Projects delivered, industries served, years in business

3. **Features**
   - AI Automation
   - Custom Software Development
   - Industry-Specific Tools
   - Expert Consultation

4. **Solutions by Industry**
   - Quick links to Healthcare, Real Estate, Finance, etc.
   - Preview of industry-specific benefits

5. **Case Studies**
   - 3-4 featured success stories
   - Measurable results (X% improvement, $Y saved)

6. **Resources**
   - Latest blog posts
   - Featured whitepapers
   - Educational content

7. **Final CTA**
   - "Ready to Transform Your Business?"
   - Multiple conversion paths

### 2.2: Blog & Resources Strategy

**Content Calendar:**
- 2-4 blog posts per month
- 1 whitepaper per quarter
- Case study after each major project

**Topics:**
- AI implementation guides
- Industry trends and insights
- Technical deep-dives
- Success stories and ROI

**SEO Keywords:**
- "AI automation for [industry]"
- "Custom software development"
- "Business intelligence solutions"
- "[Industry] digital transformation"

### 2.3: Solutions Pages Structure

Each solution page should have:
1. **Problem Statement** - Pain points addressed
2. **Our Solution** - How we solve it
3. **Key Features** - Specific capabilities
4. **Benefits** - Business value
5. **Case Studies** - Proof of success
6. **Technology Stack** - Tools and platforms used
7. **Pricing Preview** - Link to pricing page
8. **CTA** - Book consultation or start trial

---

## 🎨 Phase 3: UI/UX Enhancement

### 3.1: Design System Consistency

```typescript
// Ensure all components use consistent:
- Color palette (from Tailwind config)
- Typography hierarchy (H1, H2, etc.)
- Spacing system (Tailwind spacing scale)
- Component patterns (buttons, cards, forms)
```

### 3.2: Mobile Responsiveness

**Test on:**
- Mobile (375px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)

**Key areas:**
- Navigation menu (hamburger on mobile)
- Hero section (stack on mobile)
- Forms (full-width on mobile)
- Images (responsive, optimized)

### 3.3: Performance Optimization

```typescript
// Image optimization
import Image from 'next/image';
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // For above-fold images
/>

// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Skeleton />,
});

// Font optimization (already using next/font)
import { Inter } from 'next/font/google';
```

---

## 🔍 Phase 4: SEO Optimization

### 4.1: Sitemap Generation

Create `app/sitemap.ts`:
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://strivetech.ai';

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/portfolio',
    '/resources',
    '/solutions',
    '/pricing',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic solution pages
  const solutions = [
    'healthcare',
    'real-estate',
    'financial',
    'manufacturing',
    'retail',
    'education',
  ].map(industry => ({
    url: `${baseUrl}/solutions/${industry}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Blog posts (dynamically load from data/)
  // TODO: Load from data/resources/blog-posts/

  return [...staticPages, ...solutions];
}
```

### 4.2: Robots.txt

Create `app/robots.ts`:
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://strivetech.ai/sitemap.xml',
  };
}
```

### 4.3: Structured Data (JSON-LD)

Create `lib/seo/schema.ts`:
```typescript
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Strive Tech',
    url: 'https://strivetech.ai',
    logo: 'https://strivetech.ai/logo.png',
    description: 'AI-Powered Business Solutions & Custom Software Development',
    sameAs: [
      'https://linkedin.com/company/strive-tech',
      'https://twitter.com/strive_tech',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'customer service',
      email: 'contact@strivetech.ai',
    },
  };
}

export function getBlogPostSchema(post: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  image: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.datePublished,
    image: post.image,
    publisher: {
      '@type': 'Organization',
      name: 'Strive Tech',
      logo: {
        '@type': 'ImageObject',
        url: 'https://strivetech.ai/logo.png',
      },
    },
  };
}
```

Add to layouts:
```typescript
// app/layout.tsx
import { getOrganizationSchema } from '@/lib/seo/schema';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 📊 Phase 5: Lead Generation & Conversion

### 5.1: Contact Forms

Implement with React Hook Form + Zod:
```typescript
// components/ContactForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    // Submit to API route
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Show success message
      // Redirect to thank you page
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

### 5.2: Conversion Tracking

```typescript
// lib/analytics/tracking.ts
export function trackConversion(eventName: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      value,
      currency: 'USD',
    });
  }
}

// Usage:
trackConversion('sign_up_clicked');
trackConversion('demo_requested', 500);
```

### 5.3: A/B Testing Setup

Use Vercel Edge Config or similar:
```typescript
// lib/ab-testing/experiments.ts
export async function getVariant(experimentId: string): Promise<'control' | 'variant'> {
  // Use cookie to maintain consistent experience
  const cookie = getCookie(`experiment_${experimentId}`);
  if (cookie) return cookie as 'control' | 'variant';

  // Randomly assign
  const variant = Math.random() < 0.5 ? 'control' : 'variant';
  setCookie(`experiment_${experimentId}`, variant, 30); // 30 days
  return variant;
}
```

---

## ✅ Phase 6: Testing & Quality

### 6.1: Testing Requirements

- **Unit Tests:** 80% coverage
- **E2E Tests:** Critical user flows (Playwright)
  - Homepage load
  - Contact form submission
  - Navigation to all main pages
  - Resource browsing

### 6.2: Accessibility Audit

- [ ] Semantic HTML (proper heading hierarchy)
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Color contrast ratios (WCAG AA)
- [ ] Alt text for all images
- [ ] Form labels and error messages

Run Lighthouse accessibility audit:
```bash
# Target score: 100/100
```

### 6.3: Performance Audit

**Target Metrics:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Speed Index: < 3s

**Optimizations:**
- Image optimization (next/image)
- Code splitting (dynamic imports)
- Font optimization (next/font)
- Minification (Next.js automatic)
- CDN (Vercel Edge Network)

---

## 🚀 Phase 7: Launch & Deployment

### 7.1: Pre-Launch Checklist

**Content:**
- [ ] Homepage complete with all sections
- [ ] All solution pages written
- [ ] At least 5 blog posts published
- [ ] Portfolio/case studies added
- [ ] Privacy policy, terms, cookies updated

**Technical:**
- [ ] SEO metadata on all pages
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Analytics installed and tested
- [ ] Forms working (test submissions)
- [ ] All links functional (no 404s)
- [ ] Mobile responsive (tested on devices)
- [ ] Performance score > 90
- [ ] Accessibility score > 95

**Integrations:**
- [ ] Chatbot widget embedded
- [ ] Google Analytics tracking
- [ ] Email delivery (contact forms)
- [ ] Link to Platform (app.strivetech.ai)

### 7.2: Deployment

```bash
# Deploy to Vercel
cd (website)
vercel --prod

# Configure domain
# Point strivetech.ai to Vercel
# SSL automatically configured
```

### 7.3: Post-Launch Monitoring

**Week 1:**
- Monitor analytics daily
- Check for 404 errors
- Review form submissions
- Fix any reported bugs

**Month 1:**
- Analyze traffic sources
- Identify high-performing content
- A/B test CTAs
- Optimize conversion funnels

---

## 📊 Success Metrics

### Traffic Metrics
- **Organic traffic:** Growing month-over-month
- **Bounce rate:** < 60%
- **Average session duration:** > 2 minutes
- **Pages per session:** > 2

### Conversion Metrics
- **Contact form submissions:** Track weekly
- **Demo requests:** Track and follow up
- **Platform signups:** From website referrals
- **Resource downloads:** Whitepaper engagement

### SEO Metrics
- **Domain Authority:** Track monthly
- **Ranking keywords:** Target top 10 for key terms
- **Backlinks:** Quality over quantity
- **SERP visibility:** Monitor search presence

---

## 🔗 Related Documentation

- [Project Root](../README.md)
- [Platform Plan](../(platform)/PLAN.md)
- [Chatbot Plan](../(chatbot)/PLAN.md)

---

## 🎯 Immediate Next Steps

1. **TODAY:** Create homepage (app/page.tsx)
2. **THIS WEEK:** Complete lib/ structure, analytics setup
3. **NEXT WEEK:** SEO optimization (sitemap, structured data)
4. **WEEK 3:** Content creation (blog posts, case studies)
5. **WEEK 4:** Testing, optimization, launch prep
6. **LAUNCH:** Deploy to production (strivetech.ai)

**Focus:** Content is king. Prioritize high-quality, SEO-optimized content that drives conversions!
