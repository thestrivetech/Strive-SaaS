# Session 4: Landing Page UI Components (Hero, Features, CTA)

## Session Overview
**Goal:** Build the complete landing page UI with hero section, features showcase, and call-to-action components that match the exact design system from the integration guide.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Sessions 1-3 (Backend foundation)

## Objectives

1. ✅ Create landing page route structure
2. ✅ Build hero section component (exact design match)
3. ✅ Implement features section with grid layout
4. ✅ Create CTA section components
5. ✅ Add footer component
6. ✅ Implement responsive design (mobile-first)
7. ✅ Add animations and elevation effects
8. ✅ Ensure accessibility (ARIA, keyboard nav)

## Prerequisites

- [x] Admin/onboarding backend complete (Sessions 1-3)
- [x] shadcn/ui components installed
- [x] Tailwind CSS configured
- [x] Design system CSS variables in globals.css
- [x] Lucide icons available

## Component Structure

```
app/(marketing)/
├── page.tsx                  # Landing page (root)
├── layout.tsx                # Marketing layout

components/features/landing/
├── hero-section.tsx          # Hero with CTA
├── features-section.tsx      # Features grid
├── cta-section.tsx           # Call-to-action
├── trust-indicators.tsx      # Logo section
└── stats-section.tsx         # Platform stats

components/shared/layouts/
├── footer.tsx                # Site footer
└── marketing-nav.tsx         # Public navigation
```

## Design System Requirements

### Color Palette (from integration guide)
```css
/* These should already be in globals.css */
--primary: 240 100% 27%;        /* Blue #3B82F6 */
--primary-foreground: 240 20% 98%;
--secondary: 142 76% 36%;       /* Green #10B981 */
--accent: 38 92% 50%;           /* Orange #F59E0B */

/* Elevation system */
--elevate-1: rgba(0,0,0, .03);
--elevate-2: rgba(0,0,0, .08);

/* Shadows */
--shadow-lg: 0px 10px 20px -4px hsl(240 10% 10% / 0.12);
```

### Typography
- **Headings:** Inter, bold, tracking-tight
- **Body:** Open Sans, regular
- **Code:** JetBrains Mono

## Implementation Steps

### Step 1: Create Marketing Layout

**File:** `app/(marketing)/layout.tsx`

```tsx
import { MarketingNav } from '@/components/shared/layouts/marketing-nav';
import { Footer } from '@/components/shared/layouts/footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### Step 2: Create Hero Section Component (EXACT MATCH)

**File:** `components/features/landing/hero-section.tsx`

```tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        {/* Main Heading */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            <span>Powered by AI</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Build Better Products,{' '}
            <span className="text-primary">Faster</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl leading-8 text-muted-foreground">
            The enterprise SaaS platform that empowers teams to ship products 10x faster
            with powerful tools and seamless workflows.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto hover-elevate">
            <Link href="/onboarding">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="w-full sm:w-auto hover-elevate"
          >
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16">
          <p className="text-sm font-medium text-muted-foreground">
            Trusted by thousands of teams worldwide
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-60">
            {/* Logo placeholders - replace with actual customer logos */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 rounded bg-muted animate-pulse"
                aria-label={`Partner logo ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
```

### Step 3: Create Features Section

**File:** `components/features/landing/features-section.tsx`

```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  Shield,
  Users,
  BarChart3,
  Clock,
  Sparkles,
  Globe,
  Lock,
  Rocket,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on cutting-edge tech for blazing performance',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance certifications',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with real-time updates',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Powerful insights to drive better decisions',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Expert help whenever you need it',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Smart automation to save time and reduce errors',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Fast access from anywhere in the world',
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description: 'Your data stays yours, always encrypted',
  },
  {
    icon: Rocket,
    title: 'Rapid Deployment',
    description: 'Go live in minutes, not weeks',
  },
];

export function FeaturesSection() {
  return (
    <section className="px-6 py-24 sm:py-32 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to help your team work smarter, not harder.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover-elevate transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

### Step 4: Create CTA Section

**File:** `components/features/landing/cta-section.tsx`

```tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const BENEFITS = [
  'No credit card required',
  '14-day free trial',
  'Cancel anytime',
  'Full feature access',
];

export function CTASection() {
  return (
    <section className="px-6 py-24 sm:py-32 lg:px-8 bg-gradient-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Ready to get started?
        </h2>
        <p className="mt-6 text-xl text-muted-foreground">
          Join thousands of teams already building better products with Strive.
        </p>

        {/* Benefits List */}
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-10">
          <Button asChild size="lg" className="hover-elevate">
            <Link href="/onboarding">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required • Free 14-day trial
        </p>
      </div>
    </section>
  );
}
```

### Step 5: Create Footer Component

**File:** `components/shared/layouts/footer.tsx`

```tsx
import React from 'react';
import Link from 'next/link';

const FOOTER_LINKS = {
  Product: [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Security', href: '/security' },
    { name: 'Roadmap', href: '/roadmap' },
  ],
  Company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  Resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Help Center', href: '/help' },
    { name: 'API Reference', href: '/api-docs' },
    { name: 'Status', href: '/status' },
  ],
  Legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Licenses', href: '/licenses' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">
                {category}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Strive Tech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

### Step 6: Create Marketing Navigation

**File:** `components/shared/layouts/marketing-nav.tsx`

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="text-2xl font-bold text-primary">
            Strive
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/features"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Docs
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/onboarding">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t">
          <div className="space-y-2 px-6 py-4">
            <Link
              href="/features"
              className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
            >
              Docs
            </Link>
            <div className="border-t pt-4 space-y-2">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/onboarding">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
```

### Step 7: Assemble Landing Page

**File:** `app/(marketing)/page.tsx`

```tsx
import { HeroSection } from '@/components/features/landing/hero-section';
import { FeaturesSection } from '@/components/features/landing/features-section';
import { CTASection } from '@/components/features/landing/cta-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strive - Build Better Products, Faster',
  description:
    'The enterprise SaaS platform that empowers teams to ship products 10x faster with powerful tools and seamless workflows.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
```

### Step 8: Add CSS Elevation Utilities

**File:** `app/globals.css` (add to existing file)

```css
/* Hover elevation utilities */
.hover-elevate {
  position: relative;
  transition: transform 0.2s ease;
}

.hover-elevate::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: transparent;
  transition: background-color 0.2s ease;
  pointer-events: none;
}

.hover-elevate:hover {
  transform: translateY(-2px);
}

.hover-elevate:hover::after {
  background-color: var(--elevate-1);
}

.hover-elevate:active {
  transform: translateY(0);
}
```

## Testing & Validation

### Test 1: Visual Regression
```bash
# Run visual tests (if using Playwright)
npm run test:e2e -- landing.spec.ts
```

### Test 2: Accessibility
```typescript
// __tests__/components/landing/hero.test.tsx
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/features/landing/hero-section';

describe('HeroSection', () => {
  it('should have proper heading hierarchy', () => {
    render(<HeroSection />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Build Better Products');
  });

  it('should have accessible CTA buttons', () => {
    render(<HeroSection />);
    const ctaButton = screen.getByRole('link', { name: /get started free/i });
    expect(ctaButton).toBeInTheDocument();
  });
});
```

### Test 3: Responsive Design
```typescript
// Test mobile/desktop breakpoints
describe('Landing Page Responsive', () => {
  it('should render mobile menu on small screens', () => {
    // Mock viewport
    global.innerWidth = 375;
    render(<MarketingNav />);
    // Assertions...
  });
});
```

## Success Criteria

**MANDATORY - All must pass:**
- [ ] Landing page route created (`app/(marketing)/page.tsx`)
- [ ] Hero section matches design (gradient, typography, spacing)
- [ ] Features grid responsive (1 col mobile, 2 tablet, 3 desktop)
- [ ] CTA section with benefits list
- [ ] Footer with 4-column link layout
- [ ] Marketing navigation with mobile menu
- [ ] Hover elevation effects working
- [ ] All links point to correct routes
- [ ] Mobile-first responsive design
- [ ] Accessibility: ARIA labels, keyboard nav
- [ ] No console errors or warnings
- [ ] Lighthouse score >90 (Performance, Accessibility)

**Quality Checks:**
- [ ] Typography matches design system (Inter/Open Sans)
- [ ] Colors use CSS custom properties
- [ ] Animations smooth (60fps)
- [ ] Images lazy-loaded
- [ ] SEO metadata complete
- [ ] Dark mode support (if applicable)

## Files Created/Modified

```
✅ app/(marketing)/layout.tsx
✅ app/(marketing)/page.tsx
✅ components/features/landing/hero-section.tsx
✅ components/features/landing/features-section.tsx
✅ components/features/landing/cta-section.tsx
✅ components/shared/layouts/footer.tsx
✅ components/shared/layouts/marketing-nav.tsx
🔄 app/globals.css (add elevation utilities)
✅ __tests__/components/landing/hero.test.tsx
✅ __tests__/components/landing/features.test.tsx
```

## Performance Targets

```yaml
Lighthouse Scores:
  Performance: >90
  Accessibility: >95
  Best Practices: >95
  SEO: >95

Core Web Vitals:
  LCP: <2.5s    # Largest Contentful Paint
  FID: <100ms   # First Input Delay
  CLS: <0.1     # Cumulative Layout Shift

Bundle Size:
  Initial JS: <100kb (gzipped)
  Total CSS: <50kb (gzipped)
```

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Hydration Mismatch
**Problem:** Server/client rendering differences
**Solution:** Use 'use client' only for interactive components

### ❌ Pitfall 2: Poor Mobile Experience
**Problem:** Desktop-first design breaks on mobile
**Solution:** Start with mobile layout, progressively enhance

### ❌ Pitfall 3: Missing Accessibility
**Problem:** No ARIA labels, poor keyboard nav
**Solution:** Test with screen reader, add semantic HTML

### ❌ Pitfall 4: Slow Load Times
**Problem:** Large images, unoptimized bundles
**Solution:** Use Next.js Image, code splitting, lazy loading

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 5: Pricing Page Implementation**
2. ✅ Landing page UI complete
3. ✅ Ready to build pricing comparison table

---

**Session 4 Complete:** ✅ Landing page UI with hero, features, and CTA sections implemented
