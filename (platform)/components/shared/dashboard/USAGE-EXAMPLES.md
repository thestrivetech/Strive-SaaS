# Dashboard Components - Usage Examples

## Overview

This directory contains 4 reusable dashboard components designed to modernize module dashboards across the platform. All components use the platform's design system (glass morphism, neon borders, framer-motion animations).

---

## 1. ModuleHeroSection

Generic hero section for module dashboards with customizable KPI cards.

### Props

```typescript
interface ModuleStats {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'count';
  icon: 'revenue' | 'customers' | 'projects' | 'tasks' | 'custom';
  customIcon?: LucideIcon;
}

interface ModuleHeroSectionProps {
  user: UserWithOrganization;
  moduleName: string;
  moduleDescription: string;
  stats: ModuleStats[];
  showWeather?: boolean;
}
```

### Usage Example

```tsx
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { DollarSign, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/user-helpers';

export default async function CRMDashboard() {
  const user = await getCurrentUser();

  const stats = [
    {
      label: 'Total Revenue',
      value: '$125,000',
      change: 12.5,
      changeType: 'percentage' as const,
      icon: 'revenue' as const,
    },
    {
      label: 'Active Contacts',
      value: 248,
      change: 8,
      changeType: 'count' as const,
      icon: 'customers' as const,
    },
    {
      label: 'Deals Closed',
      value: 32,
      change: 5,
      changeType: 'count' as const,
      icon: 'projects' as const,
    },
    {
      label: 'Conversion Rate',
      value: '68%',
      change: 15,
      changeType: 'percentage' as const,
      icon: 'tasks' as const,
    },
  ];

  return (
    <ModuleHeroSection
      user={user}
      moduleName="CRM Dashboard"
      moduleDescription="Manage your contacts, leads, and deals in one place"
      stats={stats}
      showWeather={false}
    />
  );
}
```

### Custom Icons

```tsx
import { Briefcase } from 'lucide-react';

const stats = [
  {
    label: 'Active Projects',
    value: 42,
    icon: 'custom' as const,
    customIcon: Briefcase,
  },
];
```

---

## 2. ModuleStatsCards

Standalone stat card grid with glass effects and trend indicators.

### Props

```typescript
interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  color?: 'cyan' | 'purple' | 'green' | 'orange';
}

interface ModuleStatsCardsProps {
  stats: StatCard[];
  delay?: number;
}
```

### Usage Example

```tsx
import { ModuleStatsCards } from '@/components/shared/dashboard/ModuleStatsCards';
import { DollarSign, Users, TrendingUp, Package } from 'lucide-react';

export function TransactionStats() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$2.5M',
      description: 'This quarter',
      icon: DollarSign,
      trend: {
        value: 12.5,
        direction: 'up' as const,
        label: 'vs last quarter',
      },
      color: 'cyan' as const,
    },
    {
      title: 'Active Clients',
      value: 142,
      description: 'Current month',
      icon: Users,
      trend: {
        value: 8,
        direction: 'up' as const,
      },
      color: 'purple' as const,
    },
    {
      title: 'Closed Deals',
      value: 28,
      description: 'This month',
      icon: TrendingUp,
      trend: {
        value: 3.2,
        direction: 'down' as const,
        label: 'vs last month',
      },
      color: 'green' as const,
    },
    {
      title: 'Pending Tasks',
      value: 156,
      description: 'Requires attention',
      icon: Package,
      color: 'orange' as const,
    },
  ];

  return <ModuleStatsCards stats={stats} delay={0.2} />;
}
```

---

## 3. ModuleQuickActions

Quick action buttons with glass styling and hover effects.

### Props

```typescript
interface QuickAction {
  label: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

interface ModuleQuickActionsProps {
  actions: QuickAction[];
  title?: string;
  description?: string;
}
```

### Usage Example

```tsx
import { ModuleQuickActions } from '@/components/shared/dashboard/ModuleQuickActions';
import { Plus, Upload, FileText, Download } from 'lucide-react';

export function CRMQuickActions() {
  const actions = [
    {
      label: 'Add Contact',
      description: 'Create a new contact',
      icon: Plus,
      href: '/real-estate/crm/contacts/new',
      variant: 'default' as const,
    },
    {
      label: 'Import Contacts',
      description: 'Bulk import from CSV',
      icon: Upload,
      href: '/real-estate/crm/contacts/import',
      variant: 'outline' as const,
    },
    {
      label: 'Generate Report',
      description: 'Export CRM data',
      icon: FileText,
      onClick: () => generateReport(),
      variant: 'secondary' as const,
    },
    {
      label: 'Download Template',
      description: 'Get CSV template',
      icon: Download,
      href: '/templates/contacts.csv',
    },
  ];

  return (
    <ModuleQuickActions
      actions={actions}
      title="Quick Actions"
      description="Common tasks for CRM management"
    />
  );
}
```

---

## 4. EnhancedCard

Card wrapper with glass effects, neon borders, and animations.

### Props

```typescript
interface EnhancedCardProps extends React.ComponentProps<typeof Card> {
  glassEffect?: 'none' | 'subtle' | 'medium' | 'strong';
  neonBorder?: 'none' | 'cyan' | 'purple' | 'green' | 'orange';
  hoverEffect?: boolean;
  children: React.ReactNode;
}
```

### Usage Example

```tsx
import {
  EnhancedCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';

export function ActivityCard() {
  return (
    <EnhancedCard
      glassEffect="strong"
      neonBorder="cyan"
      hoverEffect={true}
    >
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest transactions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>Deal closed: 123 Main St</li>
          <li>New contact added: John Doe</li>
          <li>Document signed: Purchase Agreement</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="ghost">View All</Button>
      </CardFooter>
    </EnhancedCard>
  );
}
```

### All Variants

```tsx
// Glass effects
<EnhancedCard glassEffect="none">...</EnhancedCard>
<EnhancedCard glassEffect="subtle">...</EnhancedCard>
<EnhancedCard glassEffect="medium">...</EnhancedCard>
<EnhancedCard glassEffect="strong">...</EnhancedCard>

// Neon borders
<EnhancedCard neonBorder="none">...</EnhancedCard>
<EnhancedCard neonBorder="cyan">...</EnhancedCard>
<EnhancedCard neonBorder="purple">...</EnhancedCard>
<EnhancedCard neonBorder="green">...</EnhancedCard>
<EnhancedCard neonBorder="orange">...</EnhancedCard>

// Hover effect
<EnhancedCard hoverEffect={true}>...</EnhancedCard>
<EnhancedCard hoverEffect={false}>...</EnhancedCard>
```

---

## Design System Integration

All components use these design system classes from `globals.css`:

### Glass Morphism
- `.glass-subtle` - Light blur
- `.glass` - Medium blur (default)
- `.glass-strong` - Heavy blur

### Neon Borders
- `.neon-border-cyan` - Cyan glow (primary)
- `.neon-border-purple` - Purple glow
- `.neon-border-green` - Green glow
- `.neon-border-orange` - Orange glow

### Colors (from Tailwind config)
- Cyan: `rgba(0, 210, 255, *)`
- Purple: `rgba(139, 92, 246, *)`
- Green: `rgba(57, 255, 20, *)`
- Orange: `rgba(255, 112, 51, *)`

### Animations
All components use framer-motion with these patterns:
- Initial fade-in: `initial={{ opacity: 0, y: 20 }}`
- Animate in: `animate={{ opacity: 1, y: 0 }}`
- Staggered delays: `transition={{ delay: 0.1 * index }}`
- Hover lift: `whileHover={{ y: -4, boxShadow: '...' }}`

---

## Full Dashboard Example

Combining all components:

```tsx
import { ModuleHeroSection } from '@/components/shared/dashboard/ModuleHeroSection';
import { ModuleStatsCards } from '@/components/shared/dashboard/ModuleStatsCards';
import { ModuleQuickActions } from '@/components/shared/dashboard/ModuleQuickActions';
import { EnhancedCard, CardHeader, CardTitle, CardContent } from '@/components/shared/dashboard/EnhancedCard';
import { getCurrentUser } from '@/lib/auth/user-helpers';
import { DollarSign, Users, TrendingUp, Plus, Upload } from 'lucide-react';

export default async function ModuleDashboard() {
  const user = await getCurrentUser();

  const heroStats = [
    { label: 'Revenue', value: '$125K', change: 12.5, changeType: 'percentage' as const, icon: 'revenue' as const },
    { label: 'Contacts', value: 248, change: 8, changeType: 'count' as const, icon: 'customers' as const },
    { label: 'Deals', value: 32, change: 5, changeType: 'count' as const, icon: 'projects' as const },
    { label: 'Conversion', value: '68%', change: 15, changeType: 'percentage' as const, icon: 'tasks' as const },
  ];

  const detailStats = [
    { title: 'Monthly Revenue', value: '$45K', icon: DollarSign, color: 'cyan' as const, trend: { value: 12, direction: 'up' as const } },
    { title: 'New Contacts', value: 42, icon: Users, color: 'purple' as const, trend: { value: 8, direction: 'up' as const } },
    { title: 'Closed Deals', value: 12, icon: TrendingUp, color: 'green' as const },
  ];

  const quickActions = [
    { label: 'Add Contact', icon: Plus, href: '/crm/contacts/new' },
    { label: 'Import Data', icon: Upload, href: '/crm/import' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <ModuleHeroSection
        user={user}
        moduleName="CRM Dashboard"
        moduleDescription="Manage contacts, leads, and deals"
        stats={heroStats}
      />

      {/* Stats Cards */}
      <section className="px-6 mb-6">
        <ModuleStatsCards stats={detailStats} />
      </section>

      {/* Quick Actions */}
      <section className="px-6 mb-6">
        <ModuleQuickActions actions={quickActions} />
      </section>

      {/* Custom Content */}
      <section className="px-6">
        <EnhancedCard glassEffect="strong" neonBorder="cyan">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Your custom content */}
          </CardContent>
        </EnhancedCard>
      </section>
    </div>
  );
}
```

---

## Migration Guide

### Converting Existing Module Dashboards

1. **Replace basic hero sections** with `ModuleHeroSection`
2. **Replace stat grids** with `ModuleStatsCards`
3. **Replace action buttons** with `ModuleQuickActions`
4. **Wrap custom cards** with `EnhancedCard`

### Before (Old Pattern)

```tsx
<div className="p-6">
  <h1>CRM Dashboard</h1>
  <div className="grid grid-cols-4 gap-4">
    <div className="border rounded p-4">
      <p>Revenue</p>
      <p>$125K</p>
    </div>
    {/* More cards... */}
  </div>
</div>
```

### After (New Pattern)

```tsx
<ModuleHeroSection
  user={user}
  moduleName="CRM Dashboard"
  moduleDescription="Manage your business"
  stats={stats}
/>
```

---

## File Sizes

- `ModuleHeroSection.tsx` - 212 lines ✅
- `ModuleStatsCards.tsx` - 122 lines ✅
- `ModuleQuickActions.tsx` - 109 lines ✅
- `EnhancedCard.tsx` - 93 lines ✅

All under 300-line targets.

---

## Dependencies

- `framer-motion` - Animations
- `lucide-react` - Icons
- `@/components/ui/card` - Base Card component (shadcn/ui)
- `@/lib/utils` - cn() utility
- `@/lib/auth/user-helpers` - User types

---

## Testing

All components support:
- Server Component rendering (except client-only parts)
- Responsive design (mobile-first)
- Dark/light mode
- Accessibility (ARIA labels, keyboard navigation)
- Animation preferences (prefers-reduced-motion)

---

**Created:** 2025-10-08
**Version:** 1.0
**Status:** Production-ready
