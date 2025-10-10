# Module Dashboard Design System Guide

**Version:** 1.0
**Last Updated:** 2025-10-08
**Purpose:** Comprehensive guide for building consistent, production-ready module dashboards

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design System Components](#2-design-system-components)
3. [Shared Components Reference](#3-shared-components-reference)
4. [Module Dashboard Template](#4-module-dashboard-template)
5. [Design Patterns Per Module Type](#5-design-patterns-per-module-type)
6. [Mock Data Patterns](#6-mock-data-patterns)
7. [Responsive Design Guidelines](#7-responsive-design-guidelines)
8. [Testing & Quality Standards](#8-testing--quality-standards)
9. [Common Pitfalls & Solutions](#9-common-pitfalls--solutions)
10. [Future Module Checklist](#10-future-module-checklist)
11. [Reference Dashboards](#11-reference-dashboards)
12. [Additional Resources](#12-additional-resources)
13. [Versioning & Updates](#13-versioning--updates)

---

## 1. Overview

### Purpose
This guide provides patterns, components, and standards for building module dashboards in the Strive Platform. Follow these guidelines to ensure consistency, quality, and maintainability across all modules.

### When to Use Module Dashboards
- **Module Overview:** Entry point for a module showing key metrics and actions
- **Quick Access:** Dashboard for navigating to module features
- **Status Display:** Summary of current state and recent activity

### Design Philosophy
1. **Consistency First** - Users should feel familiarity across all modules
2. **Data-Driven** - Show meaningful metrics, not decoration
3. **Action-Oriented** - Every dashboard should enable user actions
4. **Responsive by Default** - Mobile-first approach
5. **Performance Matters** - Server-side rendering, minimal client JS

### Quick Reference
- **File Size Limit:** 500 lines (hard limit)
- **Component Library:** shadcn/ui + Radix UI
- **Icons:** Lucide React
- **Animations:** Framer Motion (optional)
- **Styling:** Tailwind CSS + Custom glass effects

---

## 2. Design System Components

### 2.1 Glass Morphism Patterns

**Location:** `app/globals.css` (lines 221-561)

#### Available Classes:

```css
/* Subtle transparency with minimal blur */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Strong blur effect for primary content */
.glass-strong {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

/* Minimal effect for subtle depth */
.glass-subtle {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### When to Use:
- **glass-strong:** Hero sections, primary cards, main content areas
- **glass:** Feature cards, navigation cards, secondary content
- **glass-subtle:** Background layers, tertiary content

#### Browser Compatibility:
- Modern browsers: Full support
- Safari: Requires -webkit prefix (included)
- Fallback: Semi-transparent backgrounds

---

### 2.2 Neon Border Effects

**Location:** `app/globals.css` (lines 221-561)

#### Available Colors:

```css
/* Cyan - Primary features, hero sections */
.neon-border-cyan {
  border: 2px solid rgba(0, 210, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 210, 255, 0.3);
}

/* Purple - Stats cards, metrics */
.neon-border-purple {
  border: 2px solid rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

/* Green - Activity, success states */
.neon-border-green {
  border: 2px solid rgba(57, 255, 20, 0.5);
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
}

/* Orange - Actions, CTAs */
.neon-border-orange {
  border: 2px solid rgba(255, 112, 51, 0.5);
  box-shadow: 0 0 10px rgba(255, 112, 51, 0.3);
}
```

#### Color Usage Guidelines:
- **Cyan:** Hero sections, primary features, main navigation
- **Purple:** Stats/KPI cards, metrics displays
- **Green:** Recent activity, success indicators, positive actions
- **Orange:** Quick actions, CTAs, important buttons

#### Hover Behavior:
```tsx
// Add hover:shadow-lg for enhanced glow on interactive cards
<Card className="glass neon-border-cyan hover:shadow-lg transition-all">
```

---

### 2.3 Animation Patterns

**Library:** Framer Motion (optional enhancement)

#### Fade-In Pattern:
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

#### Staggered Grid:
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * index }}
  >
    {/* Card */}
  </motion.div>
))}
```

#### Hover Lift:
```tsx
<motion.div
  whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0, 210, 255, 0.2)' }}
  transition={{ duration: 0.2 }}
>
  {/* Interactive card */}
</motion.div>
```

#### Performance Considerations:
- Use `transform` properties (GPU-accelerated)
- Avoid animating `width`, `height`, `margin`
- Limit simultaneous animations (max 10-15)
- Test on slower devices

---

### 2.4 Color Scheme

**Primary Palette:**
- `primary`: Hsl(var(--primary)) - Main brand color
- `secondary`: Hsl(var(--secondary)) - Secondary actions
- `accent`: Hsl(var(--accent)) - Highlights, hover states

**Chart Colors:**
- `chart-1` through `chart-5`: Data visualization colors

**Text Colors:**
- `foreground`: Primary text
- `muted-foreground`: Secondary text, descriptions

**When to Use:**
- **Gradient Text:** User names in hero sections (`from-primary via-chart-2 to-chart-3`)
- **Chart Colors:** Data visualization, status indicators
- **Muted:** Descriptions, timestamps, metadata

---

### 2.5 Typography

#### Heading Hierarchy:
```tsx
<h1 className="text-3xl sm:text-4xl font-bold">Main Title</h1>
<h2 className="text-xl sm:text-2xl font-semibold text-primary">Subtitle</h2>
<h3 className="text-lg font-medium">Section Title</h3>
```

#### Font Sizes:
- `text-3xl` (1.875rem): Page titles (h1)
- `text-2xl` (1.5rem): Module titles (h2)
- `text-xl` (1.25rem): Section titles (h3)
- `text-lg` (1.125rem): Card titles
- `text-base` (1rem): Body text
- `text-sm` (0.875rem): Metadata, descriptions
- `text-xs` (0.75rem): Labels, badges

#### Responsive Sizing:
```tsx
// Scale up on larger screens
<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
  Title
</h1>
```

---

## 3. Shared Components Reference

### 3.1 ModuleHeroSection

**Location:** `components/shared/dashboard/ModuleHeroSection.tsx`

#### Purpose:
Generic hero section with personalized greeting, module title, and KPI stats.

#### Props:
```typescript
interface ModuleHeroSectionProps {
  user: UserWithOrganization;
  moduleName: string;
  moduleDescription: string;
  stats: ModuleStats[];
  showWeather?: boolean;
}

interface ModuleStats {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'count';
  icon: 'revenue' | 'customers' | 'projects' | 'tasks' | 'custom';
  customIcon?: React.ComponentType<{ className?: string }>;
}
```

#### Example:
```tsx
<ModuleHeroSection
  user={user}
  moduleName="CRM Dashboard"
  moduleDescription="Manage contacts, leads, and pipeline"
  stats={[
    {
      label: 'Total Contacts',
      value: 1247,
      change: 12.5,
      changeType: 'percentage',
      icon: 'customers'
    }
  ]}
/>
```

#### When to Use:
- Most module dashboards
- When you need consistent hero section pattern
- When stats are dynamic and change frequently

---

### 3.2 EnhancedCard

**Location:** `components/shared/dashboard/EnhancedCard.tsx`

#### Purpose:
Wrapper around shadcn Card with glass effects and neon borders.

#### Props:
```typescript
interface EnhancedCardProps extends React.ComponentProps<typeof Card> {
  glassEffect?: 'none' | 'subtle' | 'medium' | 'strong';
  neonBorder?: 'none' | 'cyan' | 'purple' | 'green' | 'orange';
  hoverEffect?: boolean;
}
```

#### Example:
```tsx
<EnhancedCard glassEffect="strong" neonBorder="cyan" hoverEffect={true}>
  <CardHeader>
    <CardTitle>Activity Feed</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</EnhancedCard>
```

#### When to Use:
- Any card that needs glass effects or neon borders
- Prefer this over manual className application
- Maintains consistency across all dashboards

---

### 3.3 Inline Helper Components

For dashboards with 5+ unique component patterns, use inline helpers:

```typescript
// Inside dashboard page.tsx
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
}

function StatCard({ icon: Icon, title, value, description }: StatCardProps) {
  return (
    <Card className="glass-strong neon-border-purple hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
```

**When to Use:**
- Dashboard-specific component patterns
- Components unlikely to be reused elsewhere
- Keeps file size manageable (<500 lines)

**Reference Examples:**
- CMS Marketing Dashboard: StatCard, FeatureCard
- Expense Tax Dashboard: StatCard, FeatureCard, StatusBadge
- Marketplace Dashboard: ToolCard, SubscriptionCard

---

## 4. Module Dashboard Template

### 4.1 Standard Template

```tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import { requireAuth, getCurrentUser } from '@/lib/auth/auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon1, Icon2, Icon3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Module Dashboard | Strive Platform',
  description: 'Module description',
};

// Mock data for demonstration
const MOCK_STATS = {
  stat1: 123,
  stat2: 456,
  stat3: 789,
  stat4: 42,
};

export default async function ModuleDashboardPage() {
  // Auth checks
  await requireAuth();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.organization_members[0]?.organization_id;

  if (!organizationId) {
    redirect('/onboarding/organization');
  }

  // Helper functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user.name?.split(' ')[0] || 'User';

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="glass-strong rounded-2xl p-6 sm:p-8 neon-border-cyan mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="inline-block">{getGreeting()},</span>{' '}
          <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
            {firstName}
          </span>
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-2">
          Module Name
        </h2>
        <p className="text-muted-foreground">
          Module description
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/module/action">
              <Icon1 className="mr-2 h-4 w-4" />
              Primary Action
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Icon1}
          title="Stat 1"
          value={MOCK_STATS.stat1.toString()}
          description="Description"
          borderColor="neon-border-purple"
        />
        {/* More stats... */}
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <FeatureCard
          icon={Icon2}
          title="Feature 1"
          description="Feature description"
          href="/module/feature1"
          borderColor="neon-border-cyan"
        />
        {/* More features... */}
      </div>

      {/* Recent Activity */}
      <Card className="glass-strong neon-border-green">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Activity content */}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass neon-border-orange">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/module/action1">Action 1</Link>
            </Button>
            {/* More actions... */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components (inline)
function StatCard({ icon: Icon, title, value, description, borderColor }: any) {
  return (
    <Card className={`glass-strong ${borderColor} hover:shadow-lg transition-all`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon: Icon, title, description, href, borderColor }: any) {
  return (
    <Card className={`glass ${borderColor} hover:shadow-md transition-all hover:-translate-y-1`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={href}>Go to {title}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 4.2 Data Fetching Patterns

#### Server Components (Default):
```tsx
// Fetch data in server component
export default async function Dashboard() {
  const data = await getData();

  return <DataDisplay data={data} />;
}
```

#### Suspense Boundaries:
```tsx
<Suspense fallback={<Skeleton />}>
  <DataComponent />
</Suspense>
```

#### Parallel Queries:
```tsx
const [customers, projects, tasks] = await Promise.all([
  getCustomers(),
  getProjects(),
  getTasks(),
]);
```

---

## 5. Design Patterns Per Module Type

### 5.1 Analytics Dashboards

**Characteristics:**
- Heavy focus on data visualization
- Charts and graphs
- Time-based filtering
- Trend indicators

**Recommended Layout:**
```
[Hero Section]
[KPI Stats Cards (4)]
[Main Chart Section]
[Secondary Charts Grid]
[Recent Data Table]
[Quick Filters]
```

**Example:** REI Analytics Dashboard (custom dark theme)

---

### 5.2 Management Dashboards

**Characteristics:**
- CRUD operations
- List/grid views
- Search and filtering
- Action buttons

**Recommended Layout:**
```
[Hero Section]
[KPI Stats Cards (4)]
[Feature Navigation Cards]
[Recent Activity List]
[Data Table]
[Quick Actions]
```

**Examples:** CRM, Workspace, Expense & Tax

---

### 5.3 Tool Dashboards

**Characteristics:**
- Feature showcase
- Integration status
- Tool library
- Usage metrics

**Recommended Layout:**
```
[Hero Section]
[Stats Cards (4)]
[Featured Tools Grid (6-8)]
[Active Subscriptions]
[Popular Tools]
[Quick Actions]
```

**Examples:** AI Hub, Marketplace

---

### 5.4 Special Themes

**When to Use Custom Themes:**
- Module has distinct branding requirements
- Industry-specific color schemes
- Premium/specialized features

**REID Theme Case Study:**
- Custom dark cyan/purple theme
- Different from standard design system
- Intentional visual separation
- Preserved in Phase 6 decision

**Guidelines:**
- Document custom theme in globals.css
- Use `.module-theme` class wrapper
- Maintain accessibility standards
- Don't apply standard glass/neon effects

---

## 6. Mock Data Patterns

### 6.1 When to Use Mock Data

- **UI-First Development:** Build interfaces before backend
- **Feature Previews:** Demonstrate upcoming features
- **Placeholder Dashboards:** Skeleton implementations
- **Demo Mode:** Showcase without real data

### 6.2 Mock Data Best Practices

```typescript
// Define at top of file with clear comments
// Mock Data for demonstration
const MOCK_STATS = {
  totalCustomers: 1247,
  activeProjects: 32,
  revenue: 125000,
};

const MOCK_RECENT_ACTIVITY = [
  {
    id: '1',
    type: 'CREATE',
    user: 'John Doe',
    timestamp: '2025-10-08T10:00:00Z',
    description: 'Created new project',
  },
  // More items...
];
```

**Key Principles:**
- Realistic data (names, dates, amounts)
- Consistent with production types
- Comment clearly as mock data
- Plan transition path to real data

### 6.3 Mock Data Providers

**Location:** `lib/data/`

```typescript
import { contactsProvider, leadsProvider } from '@/lib/data';

const contacts = await contactsProvider.findMany(orgId);
```

**Reference:** See `MOCK-DATA-WORKFLOW.md` for complete guide

---

## 7. Responsive Design Guidelines

### 7.1 Breakpoints

```css
sm: 640px   /* Small devices (mobile landscape) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### 7.2 Grid Patterns

```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Stats cards */}
</div>

// Mobile: 1 column, Desktop: 2 columns
<div className="grid gap-4 lg:grid-cols-2">
  {/* Feature cards */}
</div>

// Complex layout: 2/3 + 1/3 split on desktop
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="lg:col-span-1">
    {/* Sidebar */}
  </div>
</div>
```

### 7.3 Spacing

```tsx
// Responsive padding
<div className="p-4 sm:p-6 lg:p-8">

// Responsive gap
<div className="gap-4 md:gap-6 lg:gap-8">

// Responsive text sizing
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
```

---

## 8. Testing & Quality Standards

### 8.1 Pre-Commit Checklist

```bash
cd "(platform)"

# TypeScript validation (0 errors)
npx tsc --noEmit

# ESLint validation (0 warnings in new code)
npm run lint

# Build verification (must succeed)
npm run build

# File size check (must be <500 lines)
wc -l app/real-estate/module/dashboard/page.tsx
```

**Requirements:**
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings in new code
- [ ] File under 500 lines
- [ ] Auth checks present (requireAuth, getCurrentUser)
- [ ] Organization filtering implemented
- [ ] Responsive layout tested (Chrome DevTools)

### 8.2 Accessibility Requirements

```tsx
// Proper heading hierarchy
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// Decorative icons
<Icon className="h-4 w-4" aria-hidden="true" />

// Interactive elements
<Button aria-label="Add new contact">
  <Plus className="h-4 w-4" />
</Button>

// Focus states (automatic with shadcn/ui)
// Focus rings visible on tab navigation
```

**Standards:**
- **Color Contrast:** AA minimum (4.5:1 for normal text)
- **Keyboard Navigation:** All interactive elements reachable
- **Screen Reader:** Meaningful labels on all controls
- **Focus States:** Visible focus indicators

### 8.3 Performance Standards

**Targets:**
- Initial Load: <2s
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

**Optimization:**
- Server Components by default (reduce client JS)
- Suspense boundaries (streaming SSR)
- Parallel data fetching (Promise.all)
- Proper image optimization (next/image)

---

## 9. Common Pitfalls & Solutions

### 9.1 File Size Limits

**Problem:** Dashboard exceeds 500 lines

**Solutions:**
1. Extract inline helper components to separate files
2. Move constants to separate `constants.ts` file
3. Use shared components (EnhancedCard, ModuleHeroSection)
4. Simplify complex logic, move to `lib/modules/`

**Example:**
```bash
# Before: 550 lines in page.tsx
app/module/dashboard/page.tsx

# After: 3 files totaling same functionality
app/module/dashboard/page.tsx          # 320 lines
app/module/dashboard/components.tsx    # 150 lines
app/module/dashboard/constants.ts      # 80 lines
```

### 9.2 Hydration Errors

**Problem:** Server/client mismatch with localStorage or Date

**Solution:**
```tsx
'use client';

import { useEffect, useState } from 'react';

function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or loading skeleton
  }

  // Safe to use localStorage, Date.now(), etc
  return <div>{localStorage.getItem('key')}</div>;
}
```

### 9.3 Server vs Client Components

**Problem:** Overusing "use client"

**Solution:**
```tsx
// ✅ Server Component (default)
async function Dashboard() {
  const data = await getData();
  return <ClientDisplay data={data} />;
}

// ✅ Client Component (only when needed)
'use client';
function ClientDisplay({ data }) {
  const [selected, setSelected] = useState(null);
  return <InteractiveUI data={data} selected={selected} />;
}

// ❌ Don't do this
'use client';
async function Dashboard() { // Can't use async in client components!
  const data = await getData();
  return <div>{data}</div>;
}
```

### 9.4 Mock Data Type Mismatches

**Problem:** TypeScript errors with mock data not matching Prisma types

**Solution:**
```typescript
// Option 1: Use 'as any' with comment
const mockLeads = MOCK_LEADS as any; // Mock data - replace with real Prisma query

// Option 2: Create compatible types
interface MockLead {
  id: string;
  name: string;
  // Only include fields you're actually using
}

const MOCK_LEADS: MockLead[] = [
  // Mock data
];

// Option 3: Use Partial<PrismaType>
const MOCK_LEADS: Partial<Lead>[] = [
  // Mock data
];
```

### 9.5 Animation Performance

**Problem:** Janky animations, layout shift

**Solutions:**
```tsx
// ✅ Use transform (GPU-accelerated)
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  transition={{ duration: 0.2 }}
/>

// ❌ Don't animate these properties
<motion.div
  whileHover={{ marginTop: -4, width: '110%' }} // Causes layout reflow!
/>

// ✅ Use will-change sparingly
<div style={{ willChange: 'transform' }}>
  {/* Only use during animation */}
</div>

// ✅ Limit simultaneous animations
// Max 10-15 elements animating at once
```

---

## 10. Future Module Checklist

### 10.1 Planning Phase

- [ ] Identify module type (analytics/management/tool)
- [ ] Review similar existing dashboards
- [ ] Plan data requirements (models, queries)
- [ ] Sketch layout (mobile + desktop)
- [ ] Identify reusable vs custom components
- [ ] Plan color scheme (use standard or custom?)

### 10.2 Implementation Phase

- [ ] Copy template from Section 4.1
- [ ] Implement hero section with personalized greeting
- [ ] Add 4 stats cards with mock data
- [ ] Build feature navigation cards
- [ ] Add recent activity section
- [ ] Add quick actions section
- [ ] Apply glass effects and neon borders
- [ ] Implement responsive design (test on mobile)
- [ ] Add TypeScript types for all components

### 10.3 Data Integration Phase

- [ ] Start with mock data (define constants)
- [ ] Create data queries in `lib/modules/[module]/queries.ts`
- [ ] Add Suspense boundaries around async data
- [ ] Implement loading skeletons
- [ ] Add error handling (try/catch, error boundaries)
- [ ] Replace mock data with real queries
- [ ] Test with empty states and edge cases

### 10.4 Quality Assurance Phase

- [ ] Run TypeScript check (npx tsc --noEmit)
- [ ] Run ESLint check (npm run lint)
- [ ] Build verification (npm run build)
- [ ] File size check (<500 lines)
- [ ] Accessibility audit (keyboard nav, screen reader)
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Performance testing (Lighthouse score >90)

### 10.5 Documentation Phase

- [ ] Add JSDoc comments to page and components
- [ ] Update module README if exists
- [ ] Document any custom components
- [ ] Note any deviations from standard patterns
- [ ] Update this guide if new patterns discovered

---

## 11. Reference Dashboards

### 11.1 Main Dashboard
**File:** `app/real-estate/dashboard/page.tsx`
**Status:** ⚠️ Needs modernization (Phase 1-4 reference)

**Use As Reference For:**
- HeroSection component (older pattern)
- DashboardGrid widget system
- Overall layout structure

### 11.2 CRM Dashboard ✅
**File:** `app/real-estate/crm/dashboard/page.tsx`
**Line Count:** 288 lines
**Modernization:** Phase 3A

**Use As Reference For:**
- Multiple parallel data queries (6 queries with Promise.all)
- Two-column layout (2/3 main + 1/3 sidebar)
- Complex sections (pipeline, leaderboard, appointments)
- EnhancedCard usage throughout
- Preserving existing functionality while modernizing

**Key Features:**
- Hero section with 4 KPI cards
- Recent leads section (cyan border)
- Pipeline overview (purple border)
- Recent activity (green border)
- Upcoming appointments (orange border)
- Agent leaderboard (purple border)

### 11.3 Workspace Dashboard ✅
**File:** `app/real-estate/workspace/dashboard/page.tsx`
**Line Count:** 220 lines
**Modernization:** Phase 3B

**Use As Reference For:**
- Standard module layout
- Activity feed with icon mapping logic
- Navigation cards pattern
- Integration with custom dialogs (CreateLoopDialog)
- Clean, minimal structure

**Key Features:**
- Hero section with workspace stats
- Stats cards section (cyan border)
- Quick actions with dialog (purple border)
- Recent activity feed (green border)
- Navigation cards (orange, cyan, purple borders)

### 11.4 CMS Marketing Dashboard ✅
**File:** `app/real-estate/cms-marketing/dashboard/page.tsx`
**Line Count:** 450 lines
**Modernization:** Phase 3C

**Use As Reference For:**
- Inline helper components (StatCard, FeatureCard)
- Multiple Suspense boundaries pattern
- Status color mapping function
- Empty states with CTAs
- Feature navigation grid

**Key Features:**
- Custom hero section with time-based greeting
- 4 stats cards (purple borders)
- 4 feature cards (cyan borders, one with "Coming Soon" badge)
- Recent content section (green border)
- Recent campaigns section (green border)
- Quick actions (orange border)

### 11.5 AI Hub Dashboard ✅
**File:** `app/real-estate/ai-hub/dashboard/page.tsx`
**Line Count:** 243 lines
**Modernization:** Phase 4 (built from scratch)

**Use As Reference For:**
- Building complete dashboard from placeholder
- Mock data usage patterns
- Feature showcase grid with beta badges
- Recent activity feed structure
- Tool/feature status indicators

**Key Features:**
- Personalized hero section (cyan border)
- 3 stats cards (purple borders)
- 4 feature cards with icons and badges (cyan, green, orange, purple borders)
- Recent AI activity timeline (green border)
- Quick actions (orange border)

### 11.6 Expense & Tax Dashboard ✅
**File:** `app/real-estate/expense-tax/dashboard/page.tsx`
**Line Count:** 136 lines (refactored with real components)
**Modernization:** Phase 5A

**Use As Reference For:**
- Integration with existing real components
- Two-column layout with sidebar
- Tax calculation widgets
- Category breakdown visualization
- Expense table integration with CRUD operations

**Key Features:**
- Hero section with personalized greeting
- Real-time KPI cards (ExpenseKPIs component)
- Two-column layout: Category breakdown + Expense table / Tax estimate sidebar
- Integration with existing components (ExpenseTable, TaxEstimateCard, CategoryBreakdown)
- Suspense boundaries for all async sections

### 11.7 Marketplace Dashboard ✅
**File:** `app/real-estate/marketplace/dashboard/page.tsx`
**Line Count:** 509 lines
**Modernization:** Phase 5B

**Use As Reference For:**
- E-commerce/marketplace card layouts
- Tool/product showcase patterns
- Pricing badge displays
- Subscription management UI
- Popular items ranking
- Install counts and trending indicators

**Key Features:**
- Hero section (cyan border)
- 4 marketplace stats (purple borders)
- 8 featured tool cards with pricing, icons, descriptions (rotating border colors)
- Active subscriptions with renewal tracking (green border)
- Popular tools ranking with install counts (orange border)
- Quick actions (purple border)

**Inline Components:**
- StatCard: Reusable stat display
- ToolCard: Featured tool showcase
- SubscriptionCard: Subscription display with status

### 11.8 REID Analytics Dashboard ⚠️
**File:** `app/real-estate/rei-analytics/dashboard/page.tsx`
**Line Count:** 47 lines
**Modernization:** Phase 6 (SKIPPED - custom theme preserved)

**Use As Reference For:**
- Custom theme implementation (`.reid-theme` class)
- When to deviate from standard design system
- Dark theme patterns (cyan #06b6d4, purple #8b5cf6)
- Map integration (Leaflet MarketHeatmap component)
- Minimal, focused dashboard structure

**Key Features:**
- Custom dark theme wrapper
- Simple header with white text on dark background
- MarketHeatmap as centerpiece
- Intentionally different from standard design (preserved)

**Custom CSS:** Lines 566-838 in `app/globals.css`

---

## 12. Additional Resources

### 12.1 Platform Documentation

- **Root CLAUDE.md:** `../CLAUDE.md`
  Tri-fold architecture, core development standards, database workflows

- **Platform CLAUDE.md:** `../CLAUDE.md` (platform-specific)
  Multi-industry architecture, RBAC, subscription tiers, security mandates

- **Mock Data Workflow:** `../MOCK-DATA-WORKFLOW.md`
  UI-first development patterns, mock data providers, transition strategies

- **Quick Start Mock Mode:** `../QUICK-START-MOCK-MODE.md`
  Fast setup guide for mock data development

- **Agent Orchestration Guide:** `../.claude/agents/single-agent-guide.md`
  Using strive-agent-universal for dashboard development

### 12.2 Design System Files

- **Global Styles:** `../app/globals.css`
  - Lines 1-220: Base styles, Tailwind config
  - Lines 221-561: Dashboard glass effects and neon borders
  - Lines 566-838: REID custom dark theme

- **Shared Components:** `../components/shared/dashboard/`
  - ModuleHeroSection.tsx (212 lines)
  - ModuleStatsCards.tsx (122 lines)
  - ModuleQuickActions.tsx (109 lines)
  - EnhancedCard.tsx (93 lines)
  - USAGE-EXAMPLES.md (usage patterns)

### 12.3 External Resources

- **Shadcn/ui:** https://ui.shadcn.com/
  Component library documentation, installation, customization

- **Framer Motion:** https://www.framer.com/motion/
  Animation library docs, examples, API reference

- **Tailwind CSS:** https://tailwindcss.com/
  Utility classes, responsive design, customization

- **Lucide Icons:** https://lucide.dev/
  Icon library, search, React implementation

- **Next.js 15:** https://nextjs.org/docs
  App Router, Server Components, data fetching patterns

- **React 19:** https://react.dev/
  Hooks, patterns, best practices

---

## 13. Versioning & Updates

### Current Version
**Version:** 1.0 (Initial Release)
**Date:** 2025-10-08
**Author:** Dashboard Modernization Project (Phases 1-8)

### Changelog

**2025-10-08 - v1.0**
- ✅ Initial guide creation after dashboard modernization
- ✅ 7/8 dashboards modernized and documented
- ✅ Design system patterns established
- ✅ Shared components created and documented
- ✅ Common pitfalls identified and solutions provided
- ✅ Reference dashboards annotated with use cases
- ✅ Quality standards and checklists finalized

### When to Update This Guide

Update this guide when:
- [ ] New shared components are added
- [ ] Design system changes (new colors, effects, patterns)
- [ ] New dashboard patterns discovered
- [ ] Common pitfalls identified through usage
- [ ] Performance improvements found
- [ ] Accessibility standards updated
- [ ] Breaking changes in Next.js, React, or Tailwind
- [ ] New reference dashboards built

### Version History Format

```markdown
**YYYY-MM-DD - vX.Y**
- [ADDED] New feature or component
- [CHANGED] Modified existing pattern
- [FIXED] Corrected documentation error
- [REMOVED] Deprecated pattern removed
```

---

## Quick Reference Card

### Essential Commands
```bash
# Development
cd "(platform)"
npm run dev

# Quality Checks
npx tsc --noEmit                        # TypeScript
npm run lint                            # ESLint
npm run build                           # Build test
wc -l app/real-estate/module/dashboard/page.tsx  # File size

# Database (Mock Mode Active)
cat prisma/SCHEMA-QUICK-REF.md          # Schema reference
cat prisma/SCHEMA-MODELS.md             # Model details
```

### File Size Targets
- **Soft Target:** 350-400 lines (ideal)
- **Target:** <450 lines (good)
- **Hard Limit:** 500 lines (maximum)

### Color Scheme Quick Reference
- **Cyan (#00d2ff):** Hero sections, primary features
- **Purple (rgba(139, 92, 246)):** Stats cards, metrics
- **Green (rgba(57, 255, 20)):** Activity, success states
- **Orange (rgba(255, 112, 51)):** Actions, CTAs

### Glass Effects Quick Reference
- **glass-strong:** Hero sections, primary cards
- **glass:** Feature cards, secondary content
- **glass-subtle:** Background layers

---

**END OF GUIDE**

For questions, improvements, or contributions to this guide:
- Review completed dashboards in `app/real-estate/*/dashboard/`
- Check validation report: `DASHBOARD-VALIDATION-REPORT.md`
- Reference session plans: `update-sessions/dashboard-&-module-integrations/`
