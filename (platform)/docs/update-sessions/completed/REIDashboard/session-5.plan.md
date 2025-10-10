# Session 5: Dark Theme UI Components & Styling

## Session Overview
**Goal:** Implement REID's distinctive dark theme UI components with neon accents, preserving the exact professional design from the integration guide.

**Duration:** 3-4 hours
**Complexity:** Medium
**Dependencies:** Session 4 (Preferences module complete)

## Objectives

1. ✅ Add REID theme CSS variables to globals.css
2. ✅ Create base REID UI components with dark theme
3. ✅ Implement metric display components
4. ✅ Create card components with neon hover effects
5. ✅ Add alert severity styling
6. ✅ Ensure mobile responsiveness
7. ✅ Create loading skeletons for REID components

## Prerequisites

- [x] Session 4 completed
- [x] Understanding of Tailwind CSS dark mode
- [x] shadcn/ui components available
- [x] REID design specifications from integration guide

## Theme Design Specifications

### Color Palette
- **Background:** `#0f172a` (slate-900)
- **Surface:** `#1e293b` (slate-800)
- **Surface Light:** `#334155` (slate-700)
- **Primary Accent:** `#06b6d4` (cyan-500)
- **Secondary Accent:** `#8b5cf6` (violet-500)
- **Success:** `#10b981` (emerald-500)
- **Warning:** `#f59e0b` (amber-500)
- **Error:** `#ef4444` (red-500)
- **Info:** `#3b82f6` (blue-500)

### Typography
- **Primary Font:** Inter (UI elements)
- **Data Font:** Fira Code (metrics and numbers)

## Implementation Steps

### Step 1: Add REID Theme to globals.css

#### File: `app/globals.css`
```css
/* Add after existing styles */

/* ============================================
   REID Dashboard Theme
   ============================================ */

:root {
  /* Dark theme colors */
  --reid-background: #0f172a;
  --reid-surface: #1e293b;
  --reid-surface-light: #334155;

  /* Neon accents */
  --reid-cyan: #06b6d4;
  --reid-purple: #8b5cf6;
  --reid-cyan-glow: rgba(6, 182, 212, 0.4);
  --reid-purple-glow: rgba(139, 92, 246, 0.4);

  /* Data visualization */
  --reid-success: #10b981;
  --reid-warning: #f59e0b;
  --reid-error: #ef4444;
  --reid-info: #3b82f6;

  /* Text colors */
  --reid-text-primary: #e2e8f0;
  --reid-text-secondary: #94a3b8;
  --reid-text-muted: #64748b;
}

/* Dark theme base */
.reid-theme {
  background: var(--reid-background);
  color: var(--reid-text-primary);
  min-height: 100vh;
}

/* Neon accent cards */
.reid-card {
  background: var(--reid-surface);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.reid-card:hover {
  border-color: var(--reid-cyan);
  box-shadow: 0 0 20px var(--reid-cyan-glow);
}

.reid-card-purple:hover {
  border-color: var(--reid-purple);
  box-shadow: 0 0 20px var(--reid-purple-glow);
}

/* Data density layout */
.reid-data-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Chart styling */
.reid-chart {
  background: var(--reid-surface);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* Map styling */
.reid-map {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #334155;
  background: var(--reid-surface);
}

/* Metric card styling */
.reid-metric {
  background: linear-gradient(135deg, var(--reid-surface), var(--reid-surface-light));
  border: 1px solid transparent;
  background-clip: padding-box;
  padding: 1rem;
  border-radius: 0.5rem;
}

.reid-metric-value {
  font-family: 'Fira Code', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: var(--reid-cyan);
  line-height: 1;
}

.reid-metric-label {
  color: var(--reid-text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Alert severity styling */
.reid-alert-critical {
  border-left: 4px solid var(--reid-error);
  background: rgba(239, 68, 68, 0.1);
}

.reid-alert-high {
  border-left: 4px solid var(--reid-warning);
  background: rgba(245, 158, 11, 0.1);
}

.reid-alert-medium {
  border-left: 4px solid var(--reid-info);
  background: rgba(59, 130, 246, 0.1);
}

.reid-alert-low {
  border-left: 4px solid var(--reid-success);
  background: rgba(16, 185, 129, 0.1);
}

/* Status badges */
.reid-badge-success {
  background: rgba(16, 185, 129, 0.2);
  color: var(--reid-success);
  border: 1px solid var(--reid-success);
}

.reid-badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: var(--reid-warning);
  border: 1px solid var(--reid-warning);
}

.reid-badge-error {
  background: rgba(239, 68, 68, 0.2);
  color: var(--reid-error);
  border: 1px solid var(--reid-error);
}

.reid-badge-info {
  background: rgba(59, 130, 246, 0.2);
  color: var(--reid-info);
  border: 1px solid var(--reid-info);
}

/* Interactive elements */
.reid-button-primary {
  background: var(--reid-cyan);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.reid-button-primary:hover {
  background: #0891b2;
  box-shadow: 0 0 15px var(--reid-cyan-glow);
}

.reid-button-secondary {
  background: var(--reid-purple);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.reid-button-secondary:hover {
  background: #7c3aed;
  box-shadow: 0 0 15px var(--reid-purple-glow);
}

/* Loading skeleton */
.reid-skeleton {
  background: linear-gradient(
    90deg,
    var(--reid-surface) 25%,
    var(--reid-surface-light) 50%,
    var(--reid-surface) 75%
  );
  background-size: 200% 100%;
  animation: reid-loading 1.5s ease-in-out infinite;
  border-radius: 0.5rem;
}

@keyframes reid-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .reid-data-grid {
    grid-template-columns: 1fr;
  }

  .reid-metric-value {
    font-size: 1.5rem;
  }
}
```

### Step 2: Create Base REID Components

#### File: `components/real-estate/reid/shared/MetricCard.tsx`
```tsx
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn('reid-metric', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="reid-metric-value">{value}</div>
          <div className="reid-metric-label">{label}</div>
        </div>
        {Icon && (
          <Icon className="w-8 h-8 text-cyan-400 opacity-50" />
        )}
      </div>

      {trend && (
        <div className={cn(
          'mt-2 text-sm font-medium',
          trend.isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}
```

#### File: `components/real-estate/reid/shared/REIDCard.tsx`
```tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface REIDCardProps {
  children: ReactNode;
  variant?: 'default' | 'purple';
  className?: string;
}

export function REIDCard({ children, variant = 'default', className }: REIDCardProps) {
  return (
    <div className={cn(
      'reid-card',
      variant === 'purple' && 'reid-card-purple',
      className
    )}>
      {children}
    </div>
  );
}

interface REIDCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function REIDCardHeader({ children, className }: REIDCardHeaderProps) {
  return (
    <div className={cn('p-4 border-b border-slate-700', className)}>
      {children}
    </div>
  );
}

interface REIDCardContentProps {
  children: ReactNode;
  className?: string;
}

export function REIDCardContent({ children, className }: REIDCardContentProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}
```

#### File: `components/real-estate/reid/shared/AlertBadge.tsx`
```tsx
import { AlertSeverity } from '@prisma/client';
import { cn } from '@/lib/utils';

interface AlertBadgeProps {
  severity: AlertSeverity;
  children: ReactNode;
  className?: string;
}

export function AlertBadge({ severity, children, className }: AlertBadgeProps) {
  const severityClasses = {
    CRITICAL: 'reid-alert-critical',
    HIGH: 'reid-alert-high',
    MEDIUM: 'reid-alert-medium',
    LOW: 'reid-alert-low',
  };

  return (
    <div className={cn(
      'p-3 rounded-lg',
      severityClasses[severity],
      className
    )}>
      {children}
    </div>
  );
}
```

#### File: `components/real-estate/reid/shared/StatusBadge.tsx`
```tsx
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const variantClasses = {
    success: 'reid-badge-success',
    warning: 'reid-badge-warning',
    error: 'reid-badge-error',
    info: 'reid-badge-info',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
```

#### File: `components/real-estate/reid/shared/REIDSkeleton.tsx`
```tsx
import { cn } from '@/lib/utils';

interface REIDSkeletonProps {
  className?: string;
  count?: number;
}

export function REIDSkeleton({ className, count = 1 }: REIDSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('reid-skeleton h-20', className)}
        />
      ))}
    </>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="reid-metric">
      <div className="reid-skeleton h-12 w-32 mb-2" />
      <div className="reid-skeleton h-4 w-24" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="reid-chart">
      <div className="reid-skeleton h-64 w-full" />
    </div>
  );
}
```

### Step 3: Create Component Index

#### File: `components/real-estate/reid/shared/index.ts`
```typescript
export { MetricCard } from './MetricCard';
export { REIDCard, REIDCardHeader, REIDCardContent } from './REIDCard';
export { AlertBadge } from './AlertBadge';
export { StatusBadge } from './StatusBadge';
export { REIDSkeleton, MetricCardSkeleton, ChartSkeleton } from './REIDSkeleton';
```

## Testing & Validation

### Test 1: Theme Variables
```bash
# Verify CSS variables are accessible
# Check in DevTools that --reid-* variables are defined
```

### Test 2: Component Rendering
```tsx
// __tests__/reid/components.test.tsx
import { render } from '@testing-library/react';
import { MetricCard } from '@/components/real-estate/reid/shared';

describe('REID Components', () => {
  it('renders MetricCard with dark theme', () => {
    const { container } = render(
      <MetricCard label="Median Price" value="$1.2M" />
    );

    expect(container.querySelector('.reid-metric')).toBeInTheDocument();
  });
});
```

### Test 3: Responsive Design
```bash
# Test mobile responsiveness
# Verify reid-data-grid collapses to single column on mobile
```

## Success Criteria

- [x] REID theme CSS variables added
- [x] Dark theme applied globally for REID
- [x] Metric cards with neon accents working
- [x] Alert severity styling implemented
- [x] Status badges functional
- [x] Loading skeletons created
- [x] Mobile responsive design
- [x] All components follow dark theme

## Files Created

- ✅ `components/real-estate/reid/shared/MetricCard.tsx`
- ✅ `components/real-estate/reid/shared/REIDCard.tsx`
- ✅ `components/real-estate/reid/shared/AlertBadge.tsx`
- ✅ `components/real-estate/reid/shared/StatusBadge.tsx`
- ✅ `components/real-estate/reid/shared/REIDSkeleton.tsx`
- ✅ `components/real-estate/reid/shared/index.ts`

## Files Modified

- ✅ `app/globals.css` - Added REID theme

## Next Steps

1. ✅ Proceed to **Session 6: AI Profile Generation**
2. ✅ Dark theme components ready
3. ✅ Can build dashboard UI
4. ✅ AI features can use themed components

---

**Session 5 Complete:** ✅ Dark theme UI components implemented
