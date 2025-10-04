# Session 4: Lead Generation & Forms Enhancement - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~2-3 hours
**Dependencies:** SESSION2 (needs lib/forms/ schemas)
**Parallel Safe:** Yes (can run with SESSION3)

---

## 🎯 Session Objectives

Enhance existing contact forms with comprehensive validation, spam protection, conversion tracking, and A/B testing infrastructure. Focus on maximizing lead generation and conversion optimization.

**What Exists:**
- ✅ `app/contact/page.tsx` - Contact form page
- ✅ `app/request/page.tsx` - Demo request page
- ✅ `app/assessment/page.tsx` - Assessment page
- ✅ `lib/forms/schemas.ts` - Basic schemas (from SESSION2)

**What's Missing:**
- ❌ Enhanced form validation (honeypot, rate limiting)
- ❌ Spam protection implementation
- ❌ Form submission API routes
- ❌ Email delivery integration
- ❌ Conversion tracking implementation
- ❌ A/B testing infrastructure
- ❌ Form success/error handling

---

## 📋 Task Breakdown

### Phase 1: Enhanced Form Schemas (30 minutes)

**Directory:** `lib/forms/`

#### Task 1.1: Update `lib/forms/schemas.ts`
- [ ] Enhance ContactFormSchema with spam protection fields
- [ ] Add DemoRequestSchema
- [ ] Add AssessmentSchema
- [ ] Add NewsletterSchema (if not exists)

```typescript
// lib/forms/schemas.ts (update)
import { z } from 'zod';

// Enhanced contact form with honeypot
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  // Honeypot field (hidden from users, should be empty)
  website: z.string().max(0).optional(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Demo request form
export const DemoRequestSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name is required'),
  role: z.string().min(2, 'Role is required'),
  phone: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '201-500', '501+']).optional(),
  message: z.string().min(10, 'Please describe your needs'),
  preferredDate: z.string().optional(),
  website: z.string().max(0).optional(), // Honeypot
});

export type DemoRequestData = z.infer<typeof DemoRequestSchema>;

// AI Readiness Assessment
export const AssessmentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  industry: z.string().min(2),
  // Assessment responses
  currentAIUsage: z.enum(['none', 'exploring', 'implementing', 'advanced']),
  businessGoals: z.array(z.string()).min(1, 'Select at least one goal'),
  budget: z.enum(['under-50k', '50k-100k', '100k-250k', '250k+']),
  timeline: z.enum(['immediate', '1-3-months', '3-6-months', '6-12-months']),
  website: z.string().max(0).optional(), // Honeypot
});

export type AssessmentData = z.infer<typeof AssessmentSchema>;

// Newsletter subscription
export const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  website: z.string().max(0).optional(), // Honeypot
});

export type NewsletterData = z.infer<typeof NewsletterSchema>;
```

**Success Criteria:**
- All form schemas comprehensive
- Honeypot fields on all forms
- Type inference working
- Validation rules appropriate

---

### Phase 2: Rate Limiting & Spam Protection (30 minutes)

**Directory:** `lib/forms/`

#### File 1: `lib/forms/rate-limit.ts`
- [ ] Create rate limiting utility
- [ ] Use in-memory store or Redis (if available)
- [ ] Configurable limits per form type

```typescript
// lib/forms/rate-limit.ts
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export async function rateLimit(
  identifier: string, // IP address or user ID
  limit: number = 5, // Max requests
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;

  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }

  // Initialize or get current count
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  const current = store[key];
  current.count += 1;

  const success = current.count <= limit;
  const remaining = Math.max(0, limit - current.count);

  return {
    success,
    remaining,
    resetTime: current.resetTime,
  };
}

// Get client IP address
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}
```

**Success Criteria:**
- Rate limiting prevents spam
- IP-based identification
- Configurable limits
- Auto-cleanup of expired entries

---

#### File 2: `lib/forms/spam-protection.ts`
- [ ] Create spam detection utilities
- [ ] Honeypot validation
- [ ] Submission timing check
- [ ] Content analysis (optional)

```typescript
// lib/forms/spam-protection.ts
export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

// Check honeypot field
export function checkHoneypot(honeypotValue?: string): SpamCheckResult {
  if (honeypotValue && honeypotValue.length > 0) {
    return {
      isSpam: true,
      reason: 'Honeypot field filled',
    };
  }
  return { isSpam: false };
}

// Check submission timing (forms filled too quickly are likely bots)
export function checkSubmissionTiming(
  formLoadTime: number,
  minTimeMs: number = 3000 // Minimum 3 seconds
): SpamCheckResult {
  const submitTime = Date.now();
  const elapsed = submitTime - formLoadTime;

  if (elapsed < minTimeMs) {
    return {
      isSpam: true,
      reason: 'Form submitted too quickly',
    };
  }
  return { isSpam: false };
}

// Check for suspicious patterns
export function checkSuspiciousPatterns(data: {
  name?: string;
  email?: string;
  message?: string;
}): SpamCheckResult {
  const suspiciousPatterns = [
    /https?:\/\//gi, // URLs in name
    /viagra|cialis|casino|porn/gi, // Common spam keywords
    /(.)\1{10,}/gi, // Repeated characters
  ];

  const textToCheck = `${data.name || ''} ${data.message || ''}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(textToCheck)) {
      return {
        isSpam: true,
        reason: 'Suspicious content detected',
      };
    }
  }

  return { isSpam: false };
}

// Combined spam check
export function isSpam(
  formData: any,
  honeypotValue?: string,
  formLoadTime?: number
): SpamCheckResult {
  // Check honeypot
  const honeypotCheck = checkHoneypot(honeypotValue);
  if (honeypotCheck.isSpam) return honeypotCheck;

  // Check timing (if provided)
  if (formLoadTime) {
    const timingCheck = checkSubmissionTiming(formLoadTime);
    if (timingCheck.isSpam) return timingCheck;
  }

  // Check patterns
  const patternCheck = checkSuspiciousPatterns(formData);
  if (patternCheck.isSpam) return patternCheck;

  return { isSpam: false };
}
```

**Success Criteria:**
- Honeypot validation working
- Timing check prevents bot submissions
- Pattern matching catches spam
- Combined check function

---

### Phase 3: Form API Routes (45 minutes)

**Directory:** `app/api/`

#### File 1: `app/api/contact/route.ts`
- [ ] Create contact form submission endpoint
- [ ] Validate with Zod schema
- [ ] Apply rate limiting
- [ ] Check spam protection
- [ ] Send email via Resend
- [ ] Return success/error response

```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ContactFormSchema } from '@/lib/forms/schemas';
import { rateLimit, getClientIp } from '@/lib/forms/rate-limit';
import { isSpam } from '@/lib/forms/spam-protection';
import { trackContactForm } from '@/lib/analytics/events';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIp(request);

    // Rate limiting check
    const rateLimitResult = await rateLimit(ip, 5, 15 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate with Zod
    const validated = ContactFormSchema.parse(body);

    // Spam protection
    const spamCheck = isSpam(validated, validated.website);
    if (spamCheck.isSpam) {
      console.warn(`Spam detected: ${spamCheck.reason}`);
      // Return success to avoid revealing spam detection
      return NextResponse.json({ success: true });
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <noreply@strivetech.ai>',
      to: [process.env.CONTACT_EMAIL || 'contact@strivetech.ai'],
      replyTo: validated.email,
      subject: `New Contact Form Submission from ${validated.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${validated.name}</p>
        <p><strong>Email:</strong> ${validated.email}</p>
        ${validated.company ? `<p><strong>Company:</strong> ${validated.company}</p>` : ''}
        ${validated.phone ? `<p><strong>Phone:</strong> ${validated.phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${validated.message}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    // Track conversion
    trackContactForm('/contact');

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Success Criteria:**
- Validation with Zod
- Rate limiting applied
- Spam protection working
- Email sent successfully
- Proper error handling

---

#### File 2: `app/api/demo-request/route.ts`
- [ ] Similar to contact route
- [ ] Use DemoRequestSchema
- [ ] Send demo request email
- [ ] Track conversion

```typescript
// app/api/demo-request/route.ts
// Similar structure to contact route
// Use DemoRequestSchema for validation
// Send to sales team
```

---

#### File 3: `app/api/newsletter/route.ts`
- [ ] Newsletter subscription endpoint
- [ ] Use NewsletterSchema
- [ ] Integrate with email provider (Resend or Mailchimp)

```typescript
// app/api/newsletter/route.ts
// Validate with NewsletterSchema
// Add to email list
// Return success
```

---

### Phase 4: Conversion Tracking (30 minutes)

**Directory:** `lib/analytics/`

#### Task 4.1: Update `lib/analytics/events.ts`
- [ ] Add conversion tracking events
- [ ] Add revenue tracking (optional)

```typescript
// lib/analytics/events.ts (update)
export function trackFormSubmission(formType: string, page: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'form_submission', {
    form_type: formType,
    page_location: page,
  });
}

export function trackConversion(conversionType: string, value?: number) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'conversion', {
    conversion_type: conversionType,
    value,
    currency: 'USD',
  });
}
```

---

### Phase 5: A/B Testing Infrastructure (30 minutes)

**Directory:** `lib/ab-testing/`

#### File 1: `lib/ab-testing/experiments.ts`
- [ ] Create A/B testing utilities
- [ ] Cookie-based variant assignment
- [ ] Track variant performance

```typescript
// lib/ab-testing/experiments.ts
'use client';

export type Variant = 'control' | 'variant_a' | 'variant_b';

export interface Experiment {
  id: string;
  name: string;
  variants: Variant[];
}

// Get or assign variant
export function getVariant(experimentId: string): Variant {
  if (typeof window === 'undefined') return 'control';

  const cookieName = `experiment_${experimentId}`;
  const existingVariant = getCookie(cookieName);

  if (existingVariant) {
    return existingVariant as Variant;
  }

  // Randomly assign variant
  const variants: Variant[] = ['control', 'variant_a'];
  const randomIndex = Math.floor(Math.random() * variants.length);
  const variant = variants[randomIndex];

  // Store in cookie (30 days)
  setCookie(cookieName, variant, 30);

  return variant;
}

// Track variant view
export function trackVariantView(experimentId: string, variant: Variant) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'experiment_impression', {
    experiment_id: experimentId,
    variant,
  });
}

// Track variant conversion
export function trackVariantConversion(experimentId: string, variant: Variant) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'experiment_conversion', {
    experiment_id: experimentId,
    variant,
  });
}

// Cookie helpers
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}
```

**Success Criteria:**
- Variant assignment working
- Cookies persist variant
- Tracking events sent
- Client-side safe

---

### Phase 6: Form Component Enhancement (30 minutes)

#### Task 6.1: Update Contact Form
- [ ] Add honeypot field (hidden)
- [ ] Add form load timestamp
- [ ] Integrate with API route
- [ ] Add loading states
- [ ] Add success/error messages

```typescript
// app/contact/page.tsx (enhance form)
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactFormSchema, ContactFormData } from '@/lib/forms/schemas';
import { trackFormSubmission } from '@/lib/analytics/events';

export default function ContactPage() {
  const [formLoadTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          formLoadTime,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        trackFormSubmission('contact', window.location.pathname);
        form.reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Honeypot field (hidden) */}
      <input
        type="text"
        {...form.register('website')}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Regular fields */}
      {/* ... */}

      {submitStatus === 'success' && (
        <div className="success-message">
          Thank you! We'll get back to you soon.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="error-message">
          Something went wrong. Please try again.
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

**Success Criteria:**
- Honeypot field hidden
- Form load time tracked
- API integration working
- Loading states shown
- Success/error handling

---

## 📊 Files to Create

### Form Infrastructure (4 files)
```
lib/forms/
├── schemas.ts              # 🔄 Update (enhanced schemas)
├── rate-limit.ts           # ✅ Create (rate limiting)
├── spam-protection.ts      # ✅ Create (spam checks)
└── index.ts               # 🔄 Update (exports)
```

### API Routes (3 files)
```
app/api/
├── contact/route.ts        # ✅ Create (contact form API)
├── demo-request/route.ts   # ✅ Create (demo request API)
└── newsletter/route.ts     # ✅ Create (newsletter API)
```

### A/B Testing (2 files)
```
lib/ab-testing/
├── experiments.ts          # ✅ Create (A/B testing)
└── index.ts               # ✅ Create (exports)
```

### Analytics Updates (1 file)
```
lib/analytics/
└── events.ts              # 🔄 Update (add conversion tracking)
```

### Form Pages (3 files)
```
app/
├── contact/page.tsx        # 🔄 Update (enhance form)
├── request/page.tsx        # 🔄 Update (enhance form)
└── assessment/page.tsx     # 🔄 Update (enhance form)
```

**Total:** 7 new files + 7 updates

---

## 🎯 Success Criteria

- [ ] All form schemas comprehensive
- [ ] Rate limiting prevents spam
- [ ] Honeypot fields on all forms
- [ ] API routes handle submissions
- [ ] Email delivery working (Resend)
- [ ] Spam protection effective
- [ ] Conversion tracking implemented
- [ ] A/B testing infrastructure ready
- [ ] Forms have loading states
- [ ] Success/error messages shown
- [ ] TypeScript compiles (0 errors)
- [ ] Linter passes (0 warnings)

---

## 🔗 Integration Points

### With SESSION2 (Analytics)
```typescript
import { trackFormSubmission, trackConversion } from '@/lib/analytics/events';
```

### With Email Provider (Resend)
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
```

### With Forms
- Contact form → `/api/contact`
- Demo request → `/api/demo-request`
- Newsletter → `/api/newsletter`

---

## 📝 Implementation Notes

### Environment Variables
Add to `.env.local`:
```bash
RESEND_API_KEY="re_..."
CONTACT_EMAIL="contact@strivetech.ai"
```

### Rate Limiting Strategy
- 5 submissions per 15 minutes per IP
- Configurable per form type
- In-memory store (upgrade to Redis for production)

### Spam Protection Layers
1. Honeypot field (catches bots)
2. Timing check (min 3 seconds)
3. Pattern matching (suspicious content)
4. Rate limiting (prevents flooding)

---

## 🚀 Quick Start Command

```bash
# Install Resend
npm install resend

# Create API routes
mkdir -p app/api/contact app/api/demo-request app/api/newsletter

# After implementation
npx tsc --noEmit && npm run lint && npm run dev
```

---

## 🔄 Dependencies

**Requires:**
- ✅ SESSION2: `lib/forms/schemas.ts` exists
- ✅ Resend account and API key
- ✅ Environment variables configured

**Blocks:**
- SESSION7: Testing needs forms working

**Enables:**
- Lead generation operational
- Conversion tracking active
- A/B testing ready
- Spam protection active

---

## ✅ Pre-Session Checklist

- [ ] SESSION2 complete
- [ ] Resend account created
- [ ] API key obtained
- [ ] Environment variables set
- [ ] Existing forms reviewed

---

## 📊 Session Completion Checklist

- [ ] All schemas comprehensive
- [ ] Rate limiting working
- [ ] Spam protection active
- [ ] API routes functional
- [ ] Email delivery tested
- [ ] Conversion tracking verified
- [ ] TypeScript compiles (0 errors)
- [ ] Linter passes (0 warnings)
- [ ] Forms submit successfully
- [ ] Ready for SESSION5

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
