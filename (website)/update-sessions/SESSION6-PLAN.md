# Session 6: Content Population & Homepage Components - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~3-4 hours
**Dependencies:** SESSION1, SESSION2 (homepage + utilities exist)
**Parallel Safe:** No (depends on SESSION1, SESSION2)

---

## 🎯 Session Objectives

Enhance homepage components with rich content, animations, and polish. Create missing pages (pricing, demo, blog, industries) and populate with real content from data files. This session transforms basic placeholders into production-ready pages.

**What Exists:**
- ✅ `app/page.tsx` - Homepage structure (from SESSION1)
- ✅ `components/(web)/home/` - Basic components (from SESSION1)
- ✅ `data/` - Content files (solutions, projects, resources)
- ✅ `lib/utils/` - Utilities (from SESSION2)

**What's Missing:**
- ❌ Enhanced homepage components (animations, rich content)
- ❌ `app/pricing/page.tsx` - Pricing page
- ❌ `app/demo/page.tsx` - Demo/video page
- ❌ `app/blog/page.tsx` - Blog listing (redirect to /resources)
- ❌ `app/industries/page.tsx` - Industries overview
- ❌ Missing pages noted in SESSION1

---

## 📋 Task Breakdown

### Phase 1: Enhanced Homepage Components (2 hours)

**Directory:** `components/(web)/home/`

#### Task 1.1: Enhanced Hero Component
- [ ] Add gradient background
- [ ] Add animated CTA buttons
- [ ] Add stats/social proof
- [ ] Add scroll indicator
- [ ] Optimize for mobile

```typescript
// components/(web)/home/hero.tsx (enhance)
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/(shared)/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://app.strivetech.ai';

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-10" />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Trusted by 500+ businesses</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Business Solutions
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your business with custom AI automation, software development,
            and intelligent tools built by industry experts.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="group">
              <Link href={platformUrl}>
                Start Free Trial
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/request">
                <Play className="mr-2" size={20} />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Clients Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">98%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600">50+</div>
              <div className="text-sm text-gray-600">Industries</div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Success Criteria:**
- Visually compelling hero
- Clear value proposition
- Strong CTAs
- Social proof visible
- Mobile responsive

---

#### Task 1.2: Enhanced Features Section
- [ ] Import features from data (or define inline)
- [ ] Add icons from Lucide
- [ ] Add hover effects
- [ ] Grid layout responsive

```typescript
// components/(web)/home/features.tsx (enhance)
import { Brain, Code, Zap, Users } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Automation',
    description: 'Streamline workflows and automate repetitive tasks with intelligent AI solutions.',
  },
  {
    icon: Code,
    title: 'Custom Software',
    description: 'Tailored software development built for your specific business needs.',
  },
  {
    icon: Zap,
    title: 'Industry Tools',
    description: 'Specialized platforms and tools designed for your industry.',
  },
  {
    icon: Users,
    title: 'Expert Consultation',
    description: 'Strategic guidance from AI and software development experts.',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What We Offer</h2>
          <p className="text-xl text-gray-600">
            Comprehensive solutions to transform your business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

**Success Criteria:**
- 4 key features displayed
- Icons clear and appropriate
- Hover effects smooth
- Grid responsive

---

#### Task 1.3: Enhanced Solutions Section
- [ ] Import from `data/solutions.tsx`
- [ ] Show 6 featured solutions
- [ ] Add hover effects
- [ ] Link to solution pages

```typescript
// components/(web)/home/solutions.tsx (enhance)
import Link from 'next/link';
import { solutions } from '@/data/solutions';
import { ArrowRight } from 'lucide-react';

export function Solutions() {
  const featuredSolutions = solutions.slice(0, 6);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Solutions by Industry</h2>
          <p className="text-xl text-gray-600">
            Specialized solutions tailored to your industry
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSolutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <Link
                key={solution.id}
                href={solution.slug}
                className="group p-6 border rounded-lg hover:border-blue-500 hover:shadow-lg transition"
              >
                <Icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition">
                  {solution.title}
                </h3>
                <p className="text-gray-600 mb-4">{solution.description}</p>
                <div className="flex items-center text-blue-600 font-medium">
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/solutions"
            className="inline-flex items-center text-blue-600 font-medium hover:underline"
          >
            View All Solutions
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Success Criteria:**
- 6 solutions displayed
- Icons from data
- Hover animations
- Links functional

---

#### Task 1.4: Enhanced Case Studies Section
- [ ] Import from `data/resources/case-studies/`
- [ ] Show 3 featured case studies
- [ ] Display metrics/results
- [ ] Add images

```typescript
// components/(web)/home/case-studies.tsx (enhance)
import Link from 'next/link';
import Image from 'next/image';
import { caseStudies } from '@/data/resources/case-studies';

export function CaseStudies() {
  const featuredStudies = caseStudies.slice(0, 3);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600">
            See how we've helped businesses transform with AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredStudies.map((study) => (
            <Link
              key={study.slug}
              href={`/solutions/case-studies/${study.slug}`}
              className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition"
            >
              {study.image && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={study.image}
                    alt={study.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="text-sm text-blue-600 mb-2">{study.industry}</div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition">
                  {study.title}
                </h3>

                {study.results && (
                  <div className="space-y-2">
                    {study.results.slice(0, 2).map((result, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-semibold text-green-600">{result.metric}</span>
                        <span className="text-gray-600"> {result.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Success Criteria:**
- 3 case studies shown
- Images optimized
- Results displayed
- Links working

---

#### Task 1.5: Testimonials Section
- [ ] Add 3-4 testimonials (can use dummy or real data)
- [ ] Add avatars
- [ ] Add carousel/slider (optional)

```typescript
// components/(web)/home/testimonials.tsx (enhance)
const testimonials = [
  {
    quote: "Strive Tech transformed our business with their AI automation. We've seen a 40% increase in productivity.",
    author: "John Smith",
    role: "CEO",
    company: "Tech Corp",
    avatar: "/avatars/john.jpg",
  },
  {
    quote: "The custom software they built has streamlined our entire workflow. Highly recommend!",
    author: "Jane Doe",
    role: "CTO",
    company: "Innovation Inc",
    avatar: "/avatars/jane.jpg",
  },
  // Add more...
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-xl text-gray-600">
            Trusted by leading businesses worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-sm">
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  {testimonial.avatar && (
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      width={48}
                      height={48}
                    />
                  )}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Success Criteria:**
- Testimonials displayed
- Avatars shown
- Professional presentation
- Mobile responsive

---

#### Task 1.6: Enhanced CTA Section
- [ ] Final conversion section
- [ ] Multiple CTAs
- [ ] Background design

```typescript
// components/(web)/home/cta.tsx (enhance)
import Link from 'next/link';
import { Button } from '@/components/(shared)/ui/button';
import { ArrowRight, Phone, Mail } from 'lucide-react';

export function CTA() {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://app.strivetech.ai';

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
          Join hundreds of businesses using AI to streamline operations and drive growth.
          Start your free trial today!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg" variant="secondary" className="group">
            <Link href={platformUrl}>
              Start Free Trial
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            <Link href="/contact">
              Contact Sales
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm opacity-80">
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>contact@strivetech.ai</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Success Criteria:**
- Compelling headline
- Clear CTAs
- Contact info visible
- Gradient background

---

### Phase 2: Missing Pages Creation (1 hour)

#### File 1: `app/pricing/page.tsx`
- [ ] Create pricing page
- [ ] 3 pricing tiers (Starter, Growth, Enterprise)
- [ ] Feature comparison table
- [ ] CTA buttons

```typescript
// app/pricing/page.tsx
import { generateMetadata } from '@/lib/seo/metadata';
import { Button } from '@/components/(shared)/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

export const metadata = generateMetadata({
  title: 'Pricing Plans | Affordable AI Solutions | Strive Tech',
  description: 'Choose the perfect plan for your business. Transparent pricing with no hidden fees. Start with a free trial today.',
  path: '/pricing',
  type: 'website',
});

const plans = [
  {
    name: 'Starter',
    price: '$99',
    period: 'per month',
    description: 'Perfect for small businesses getting started with AI',
    features: [
      'Up to 5 users',
      'Basic AI automation',
      '10 GB storage',
      'Email support',
      'Mobile app access',
    ],
    cta: 'Start Free Trial',
    href: process.env.NEXT_PUBLIC_PLATFORM_URL,
  },
  {
    name: 'Growth',
    price: '$299',
    period: 'per month',
    description: 'Ideal for growing businesses scaling operations',
    features: [
      'Up to 20 users',
      'Advanced AI automation',
      '100 GB storage',
      'Priority support',
      'API access',
      'Custom integrations',
    ],
    cta: 'Start Free Trial',
    href: process.env.NEXT_PUBLIC_PLATFORM_URL,
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'For large organizations with complex needs',
    features: [
      'Unlimited users',
      'Full AI suite',
      'Unlimited storage',
      'Dedicated support',
      'Custom development',
      'On-premise deployment',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
];

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-lg ${
                plan.featured
                  ? 'bg-blue-600 text-white shadow-2xl scale-105'
                  : 'bg-white border'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={plan.featured ? 'text-blue-100' : 'text-gray-600'}>
                  {' '}
                  / {plan.period}
                </span>
              </div>
              <p className={`mb-6 ${plan.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full"
                variant={plan.featured ? 'secondary' : 'default'}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

#### File 2: `app/demo/page.tsx`
- [ ] Create demo/video page
- [ ] Embed video or interactive demo
- [ ] CTA to request personal demo

```typescript
// app/demo/page.tsx
import { generateMetadata } from '@/lib/seo/metadata';
import { Button } from '@/components/(shared)/ui/button';
import Link from 'next/link';

export const metadata = generateMetadata({
  title: 'Product Demo | See Strive Tech in Action',
  description: 'Watch how Strive Tech transforms businesses with AI automation. See our platform in action.',
  path: '/demo',
  type: 'website',
});

export default function DemoPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6">See Strive Tech in Action</h1>
          <p className="text-xl text-gray-600">
            Watch how our AI-powered platform transforms businesses
          </p>
        </div>

        {/* Video Embed */}
        <div className="aspect-video bg-gray-900 rounded-lg mb-12">
          {/* Replace with actual video embed */}
          <iframe
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for a Personalized Demo?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Schedule a one-on-one demo with our experts to see how Strive Tech can work for your business
          </p>
          <Button asChild size="lg">
            <Link href="/request">Request Personal Demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

#### File 3: `app/blog/page.tsx` (redirect)
- [ ] Redirect to /resources or create blog listing

```typescript
// app/blog/page.tsx
import { redirect } from 'next/navigation';

export default function BlogPage() {
  redirect('/resources'); // Redirect to resources page
}
```

---

#### File 4: `app/industries/page.tsx`
- [ ] Industries overview page
- [ ] List all industries
- [ ] Link to solution pages

```typescript
// app/industries/page.tsx
import { generateMetadata } from '@/lib/seo/metadata';
import { industries } from '@/data/industries'; // Assuming this exists
import Link from 'next/link';

export const metadata = generateMetadata({
  title: 'Industries We Serve | AI Solutions for Every Sector',
  description: 'Strive Tech provides AI automation and custom software for healthcare, finance, real estate, and more.',
  path: '/industries',
  type: 'website',
});

export default function IndustriesPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Industries We Serve</h1>
          <p className="text-xl text-gray-600">
            Specialized AI solutions tailored to your industry
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <Link
                key={industry.id}
                href={industry.solutionUrl}
                className="group p-6 border rounded-lg hover:border-blue-500 hover:shadow-lg transition"
              >
                <Icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition">
                  {industry.name}
                </h3>
                <p className="text-gray-600">{industry.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Success Criteria:**
- All pages created
- Content populated
- SEO metadata added
- Links functional
- Mobile responsive

---

## 📊 Files to Create/Update

### Homepage Components (6 updates)
```
components/(web)/home/
├── hero.tsx                  # 🔄 Update (enhanced)
├── features.tsx              # 🔄 Update (enhanced)
├── solutions.tsx             # 🔄 Update (enhanced)
├── case-studies.tsx          # 🔄 Update (enhanced)
├── testimonials.tsx          # 🔄 Update (enhanced)
└── cta.tsx                   # 🔄 Update (enhanced)
```

### New Pages (4 files)
```
app/
├── pricing/page.tsx          # ✅ Create
├── demo/page.tsx             # ✅ Create
├── blog/page.tsx             # ✅ Create (redirect)
└── industries/page.tsx       # ✅ Create
```

**Total:** 6 updates + 4 new files

---

## 🎯 Success Criteria

- [ ] Homepage components enhanced
- [ ] Animations smooth
- [ ] Content rich and engaging
- [ ] Pricing page complete
- [ ] Demo page with video
- [ ] Industries page created
- [ ] Blog redirect working
- [ ] All metadata optimized
- [ ] Mobile responsive
- [ ] TypeScript compiles (0 errors)
- [ ] Linter passes (0 warnings)

---

## 🔗 Integration Points

### With Data Files
```typescript
import { solutions } from '@/data/solutions';
import { caseStudies } from '@/data/resources/case-studies';
import { industries } from '@/data/industries';
```

### With SEO
```typescript
import { generateMetadata } from '@/lib/seo/metadata';
```

---

## 🚀 Quick Start Command

```bash
# Create new pages
mkdir -p app/pricing app/demo app/blog app/industries

# Run after implementation
npx tsc --noEmit && npm run lint && npm run dev
```

---

## 🔄 Dependencies

**Requires:**
- ✅ SESSION1: Homepage components
- ✅ SESSION2: Utilities and SEO
- ✅ Data files: `data/`

**Blocks:**
- SESSION7: Testing needs pages complete

**Enables:**
- Complete website navigation
- All pages populated
- Ready for testing

---

## ✅ Pre-Session Checklist

- [ ] SESSION1, SESSION2 complete
- [ ] Data files reviewed
- [ ] Design decisions made (colors, fonts)
- [ ] Testimonials gathered (or dummy data ready)

---

## 📊 Session Completion Checklist

- [ ] All homepage components enhanced
- [ ] Pricing page created
- [ ] Demo page created
- [ ] Industries page created
- [ ] Blog redirect working
- [ ] Content rich and polished
- [ ] TypeScript compiles (0 errors)
- [ ] Linter passes (0 warnings)
- [ ] Visual review complete
- [ ] Ready for SESSION7

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
