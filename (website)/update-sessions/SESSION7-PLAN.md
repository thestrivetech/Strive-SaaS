# Session 7: Testing & Quality Assurance - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~3-4 hours
**Dependencies:** All sessions 1-6 complete
**Parallel Safe:** No (requires all previous sessions)

---

## 🎯 Session Objectives

Comprehensive testing and quality assurance to ensure the website is production-ready. Includes unit tests, E2E tests, accessibility audits, performance testing, and final QA checks.

**What Exists:**
- ✅ All pages and components (from SESSION1-6)
- ✅ Jest configuration (from platform project)
- ✅ Testing infrastructure

**What's Missing:**
- ❌ Component unit tests (80%+ coverage)
- ❌ E2E tests with Playwright
- ❌ Accessibility audit (WCAG AA)
- ❌ Performance audit (Core Web Vitals)
- ❌ SEO validation
- ❌ Cross-browser testing
- ❌ QA checklist verification

---

## 📋 Task Breakdown

### Phase 1: Unit Testing (1.5 hours)

**Directory:** `__tests__/components/(web)/`

#### Task 1.1: Test Homepage Components
- [ ] Create test for Hero component
- [ ] Create test for Features component
- [ ] Create test for Solutions component
- [ ] Create test for CaseStudies component
- [ ] Create test for Testimonials component
- [ ] Create test for CTA component

```typescript
// __tests__/components/(web)/home/hero.test.tsx
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/(web)/home/hero';

describe('Hero Component', () => {
  it('renders hero heading', () => {
    render(<Hero />);
    expect(screen.getByText(/AI-Powered Business Solutions/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);
    expect(screen.getByText(/Start Free Trial/i)).toBeInTheDocument();
    expect(screen.getByText(/Watch Demo/i)).toBeInTheDocument();
  });

  it('displays social proof stats', () => {
    render(<Hero />);
    expect(screen.getByText(/500\+/)).toBeInTheDocument();
    expect(screen.getByText(/Clients Served/i)).toBeInTheDocument();
  });

  it('links to platform URL', () => {
    render(<Hero />);
    const trialButton = screen.getByText(/Start Free Trial/i).closest('a');
    expect(trialButton).toHaveAttribute('href', expect.stringContaining('app.strivetech.ai'));
  });
});
```

```typescript
// __tests__/components/(web)/home/features.test.tsx
import { render, screen } from '@testing-library/react';
import { Features } from '@/components/(web)/home/features';

describe('Features Component', () => {
  it('renders all 4 features', () => {
    render(<Features />);
    expect(screen.getByText(/AI Automation/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom Software/i)).toBeInTheDocument();
    expect(screen.getByText(/Industry Tools/i)).toBeInTheDocument();
    expect(screen.getByText(/Expert Consultation/i)).toBeInTheDocument();
  });

  it('displays feature descriptions', () => {
    render(<Features />);
    expect(screen.getByText(/Streamline workflows/i)).toBeInTheDocument();
  });
});
```

**Success Criteria:**
- All homepage components tested
- 80%+ code coverage
- Tests pass reliably
- Edge cases covered

---

#### Task 1.2: Test Form Components
- [ ] Test contact form validation
- [ ] Test demo request form
- [ ] Test newsletter signup

```typescript
// __tests__/components/(web)/forms/contact-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/(web)/forms/contact-form';

describe('ContactForm', () => {
  it('validates required fields', async () => {
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;

    render(<ContactForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/message/i), 'Test message here');

    const submitButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('hides honeypot field from view', () => {
    render(<ContactForm />);
    const honeypot = screen.getByRole('textbox', { name: /website/i, hidden: true });
    expect(honeypot).toHaveStyle({ display: 'none' });
  });
});
```

**Success Criteria:**
- Form validation tested
- Submission flow tested
- Error handling tested
- Honeypot field verified

---

#### Task 1.3: Test Utility Functions
- [ ] Test SEO utilities
- [ ] Test form utilities
- [ ] Test analytics functions

```typescript
// __tests__/lib/seo/metadata.test.ts
import { generateMetadata } from '@/lib/seo/metadata';

describe('generateMetadata', () => {
  it('generates complete metadata object', () => {
    const metadata = generateMetadata({
      title: 'Test Page',
      description: 'Test description',
      path: '/test',
      keywords: ['test', 'keywords'],
      type: 'website',
    });

    expect(metadata.title).toBe('Test Page');
    expect(metadata.description).toBe('Test description');
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.twitter).toBeDefined();
    expect(metadata.alternates?.canonical).toContain('/test');
  });

  it('uses default image when not provided', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test',
      path: '/test',
    });

    expect(metadata.openGraph?.images).toContainEqual(
      expect.objectContaining({
        url: expect.stringContaining('og-image.png'),
      })
    );
  });
});
```

**Success Criteria:**
- Utility functions tested
- Edge cases handled
- Type safety verified

---

### Phase 2: E2E Testing with Playwright (1 hour)

**Directory:** `__tests__/e2e/`

#### Task 2.1: Install Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

#### Task 2.2: Create Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Task 2.3: Create E2E Tests
```typescript
// __tests__/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Strive Tech/);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /AI-Powered Business Solutions/i })).toBeVisible();
  });

  test('should navigate to platform on CTA click', async ({ page }) => {
    await page.goto('/');
    const trialButton = page.getByRole('link', { name: /Start Free Trial/i });
    await expect(trialButton).toHaveAttribute('href', /app\.strivetech\.ai/);
  });

  test('should display all homepage sections', async ({ page }) => {
    await page.goto('/');

    // Check for key sections
    await expect(page.getByText(/What We Offer/i)).toBeVisible();
    await expect(page.getByText(/Solutions by Industry/i)).toBeVisible();
    await expect(page.getByText(/Success Stories/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /AI-Powered/i })).toBeVisible();
  });
});
```

```typescript
// __tests__/e2e/contact-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should submit contact form successfully', async ({ page }) => {
    await page.goto('/contact');

    // Fill form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/contact');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check for error messages
    await expect(page.getByText(/name.*required/i)).toBeVisible();
    await expect(page.getByText(/email.*required/i)).toBeVisible();
  });
});
```

```typescript
// __tests__/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/');

    // Test navigation links
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/about/);

    await page.click('a[href="/solutions"]');
    await expect(page).toHaveURL(/solutions/);

    await page.click('a[href="/resources"]');
    await expect(page).toHaveURL(/resources/);

    await page.click('a[href="/contact"]');
    await expect(page).toHaveURL(/contact/);
  });

  test('should open mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Click hamburger menu
    await page.click('button[aria-label*="menu"]');

    // Verify menu is visible
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
```

**Success Criteria:**
- E2E tests cover critical flows
- Tests pass on Chrome, Firefox, Safari
- Mobile testing included
- Form submission tested

---

### Phase 3: Accessibility Audit (45 minutes)

#### Task 3.1: Run Lighthouse Accessibility Audit
- [ ] Run Lighthouse in DevTools
- [ ] Target score: 95+
- [ ] Fix any issues found

**Common Issues to Check:**
- Missing alt text on images
- Poor color contrast
- Missing ARIA labels
- Missing form labels
- Keyboard navigation issues

#### Task 3.2: Manual Accessibility Testing
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Test with screen reader (NVDA or VoiceOver)
- [ ] Verify skip links work
- [ ] Check focus indicators visible
- [ ] Verify semantic HTML

```typescript
// __tests__/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact form should be accessible', async ({ page }) => {
    await page.goto('/contact');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/');

    // Press Tab to navigate
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});
```

**Success Criteria:**
- Lighthouse accessibility score ≥ 95
- No critical axe violations
- Keyboard navigation works
- Screen reader compatible
- WCAG 2.1 AA compliance

---

### Phase 4: Performance Audit (45 minutes)

#### Task 4.1: Run Lighthouse Performance Audit
- [ ] Test homepage performance
- [ ] Test on throttled 3G
- [ ] Target metrics met

**Target Metrics:**
```
Performance Score: ≥ 90
LCP: < 2.5s
FID: < 100ms
CLS: < 0.1
TTFB: < 600ms
FCP: < 1.8s
```

#### Task 4.2: WebPageTest Audit
- [ ] Run WebPageTest.org test
- [ ] Check waterfall chart
- [ ] Identify bottlenecks
- [ ] Fix performance issues

```typescript
// __tests__/performance/web-vitals.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should meet Core Web Vitals targets', async ({ page }) => {
    await page.goto('/');

    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    expect(lcp).toBeLessThan(2500); // 2.5s target
  });

  test('should load quickly on slow 3G', async ({ page }) => {
    // Emulate slow 3G
    await page.route('**/*', (route) => {
      route.continue({
        // Simulate slow network
      });
    });

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(10000); // 10s on slow network
  });
});
```

**Success Criteria:**
- Lighthouse performance ≥ 90
- Core Web Vitals in "Good" range
- Fast on slow networks
- No render-blocking resources

---

### Phase 5: SEO Validation (30 minutes)

#### Task 5.1: Validate SEO Elements
- [ ] Check sitemap.xml accessible
- [ ] Check robots.txt accessible
- [ ] Verify all pages have metadata
- [ ] Test structured data

```bash
# Manual checks
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt

# Google Rich Results Test
# https://search.google.com/test/rich-results
```

#### Task 5.2: SEO Audit
- [ ] Run Lighthouse SEO audit
- [ ] Target score: 100
- [ ] Fix any issues

**SEO Checklist:**
- ✅ Unique title on every page
- ✅ Meta description on every page
- ✅ Heading hierarchy (H1 → H2 → H3)
- ✅ Alt text on all images
- ✅ Canonical URLs set
- ✅ OpenGraph tags present
- ✅ Twitter Card tags present
- ✅ Structured data valid

**Success Criteria:**
- Lighthouse SEO score = 100
- Sitemap validates
- Structured data validates
- All metadata complete

---

### Phase 6: Cross-Browser Testing (30 minutes)

#### Task 6.1: Test on Multiple Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Task 6.2: Test on Multiple Devices
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**What to Test:**
- Layout consistency
- Feature functionality
- Form submissions
- Navigation
- Animations

**Success Criteria:**
- Works on all major browsers
- Responsive on all devices
- No browser-specific bugs
- Consistent experience

---

### Phase 7: Final QA Checklist (30 minutes)

#### Task 7.1: Functional Testing
- [ ] All links work (no 404s)
- [ ] All forms submit successfully
- [ ] All images load
- [ ] All CTAs functional
- [ ] Navigation works
- [ ] Search works (if applicable)

#### Task 7.2: Content Verification
- [ ] No Lorem Ipsum text
- [ ] All copy reviewed
- [ ] No typos
- [ ] Consistent branding
- [ ] Legal pages complete

#### Task 7.3: Security Check
- [ ] HTTPS enabled
- [ ] No exposed credentials
- [ ] Forms have CSRF protection
- [ ] Rate limiting works
- [ ] Honeypot fields hidden

**Success Criteria:**
- All functional tests pass
- Content reviewed and approved
- Security measures in place
- Ready for production

---

## 📊 Files to Create

### Test Files (15+ files)
```
__tests__/
├── components/(web)/
│   ├── home/
│   │   ├── hero.test.tsx              # ✅ Create
│   │   ├── features.test.tsx          # ✅ Create
│   │   ├── solutions.test.tsx         # ✅ Create
│   │   ├── case-studies.test.tsx      # ✅ Create
│   │   └── cta.test.tsx               # ✅ Create
│   └── forms/
│       ├── contact-form.test.tsx      # ✅ Create
│       └── demo-request.test.tsx      # ✅ Create
├── lib/
│   ├── seo/
│   │   ├── metadata.test.ts           # ✅ Create
│   │   └── schema.test.ts             # ✅ Create
│   └── forms/
│       └── spam-protection.test.ts    # ✅ Create
├── e2e/
│   ├── homepage.spec.ts               # ✅ Create
│   ├── contact-form.spec.ts           # ✅ Create
│   ├── navigation.spec.ts             # ✅ Create
│   └── solutions.spec.ts              # ✅ Create
├── accessibility/
│   └── a11y.spec.ts                   # ✅ Create
└── performance/
    └── web-vitals.spec.ts             # ✅ Create
```

### Configuration (2 files)
```
playwright.config.ts                    # ✅ Create
jest.config.js                          # 🔄 Update (if needed)
```

**Total:** 17 new test files + 2 config files

---

## 🎯 Success Criteria

- [ ] Unit tests pass (80%+ coverage)
- [ ] E2E tests pass on all browsers
- [ ] Accessibility score ≥ 95
- [ ] Performance score ≥ 90
- [ ] SEO score = 100
- [ ] Core Web Vitals "Good"
- [ ] Cross-browser compatible
- [ ] Mobile responsive verified
- [ ] All forms functional
- [ ] No broken links
- [ ] Security verified
- [ ] Ready for production launch

---

## 🚀 Quick Start Command

```bash
# Install test dependencies
npm install -D @playwright/test @axe-core/playwright @testing-library/react @testing-library/user-event

# Run unit tests
npm test -- --coverage

# Run E2E tests
npx playwright test

# Run Lighthouse
# DevTools > Lighthouse > Analyze

# Check coverage
npm run test:coverage
```

---

## 🔄 Dependencies

**Requires:**
- ✅ All sessions 1-6 complete
- ✅ All pages and components built
- ✅ All functionality implemented

**Blocks:**
- SESSION8: Launch needs tests passing

**Enables:**
- Production deployment
- Confidence in quality
- No critical bugs

---

## ✅ Pre-Session Checklist

- [ ] All previous sessions complete
- [ ] Dev server running
- [ ] Browsers installed
- [ ] Test dependencies installed
- [ ] Lighthouse available

---

## 📊 Session Completion Checklist

- [ ] All unit tests written and passing
- [ ] E2E tests passing
- [ ] Accessibility audit complete (score ≥ 95)
- [ ] Performance audit complete (score ≥ 90)
- [ ] SEO audit complete (score = 100)
- [ ] Cross-browser testing done
- [ ] QA checklist verified
- [ ] No critical issues
- [ ] Documentation updated
- [ ] Ready for SESSION8 (launch)

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
