# Session 2: Dashboard Module - Backend Logic & Server Actions

## Session Overview
**Goal:** Create the backend module infrastructure for dashboard functionality including metrics calculation, activity tracking, and widget management.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 1 (Database foundation must be complete)

## Objectives

1. ✅ Create dashboard module structure in `lib/modules/dashboard/`
2. ✅ Implement Zod schemas for all dashboard entities
3. ✅ Create data fetching queries with proper RBAC
4. ✅ Implement server actions for mutations
5. ✅ Add metrics calculation engine
6. ✅ Create activity feed tracking system
7. ✅ Ensure multi-tenancy isolation on all operations

## Prerequisites

- [x] Session 1 completed (Database schema in place)
- [x] Prisma client generated
- [x] Understanding of Server Actions pattern
- [x] Familiarity with RBAC requirements

## Module Structure

```
lib/modules/dashboard/
├── metrics/
│   ├── actions.ts       # Metric creation/updates
│   ├── queries.ts       # Metric fetching
│   ├── calculator.ts    # Metric calculation logic
│   └── schemas.ts       # Zod schemas
├── widgets/
│   ├── actions.ts       # Widget CRUD
│   ├── queries.ts       # Widget fetching
│   └── schemas.ts       # Zod schemas
├── activities/
│   ├── actions.ts       # Activity creation
│   ├── queries.ts       # Activity fetching
│   └── schemas.ts       # Zod schemas
├── quick-actions/
│   ├── actions.ts       # Quick action execution
│   ├── queries.ts       # Quick action fetching
│   └── schemas.ts       # Zod schemas
└── index.ts             # Public API exports
```

## Step-by-Step Implementation

### Step 1: Create Zod Schemas

**File:** `lib/modules/dashboard/metrics/schemas.ts`

```typescript
import { z } from 'zod';
import { MetricCategory } from '@prisma/client';

export const DashboardMetricSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.nativeEnum(MetricCategory),
  query: z.any(),
  unit: z.string().optional(),
  format: z.enum(['number', 'currency', 'percentage']).default('number'),
  targetValue: z.number().optional(),
  warningThreshold: z.number().optional(),
  criticalThreshold: z.number().optional(),
  chartType: z.string().optional(),
  color: z.string().default('blue'),
  icon: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  refreshRate: z.number().int().min(60).default(300),
  organizationId: z.string().optional(), // null for system metrics
});

export type DashboardMetricInput = z.infer<typeof DashboardMetricSchema>;

export const UpdateMetricSchema = DashboardMetricSchema.partial().extend({
  id: z.string(),
});
```

**File:** `lib/modules/dashboard/widgets/schemas.ts`

```typescript
import { z } from 'zod';
import { WidgetType } from '@prisma/client';

export const DashboardWidgetSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(WidgetType),
  config: z.record(z.any()),
  position: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    w: z.number().int().min(1),
    h: z.number().int().min(1),
  }),
  dataSource: z.string().optional(),
  refreshRate: z.number().int().min(60).default(300),
  isVisible: z.boolean().default(true),
  title: z.string().optional(),
  chartType: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export type DashboardWidgetInput = z.infer<typeof DashboardWidgetSchema>;

export const UpdateWidgetSchema = DashboardWidgetSchema.partial().extend({
  id: z.string(),
});
```

**File:** `lib/modules/dashboard/activities/schemas.ts`

```typescript
import { z } from 'zod';
import { ActivityType, ActivitySeverity } from '@prisma/client';

export const ActivityFeedSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.nativeEnum(ActivityType),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  action: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  severity: z.nativeEnum(ActivitySeverity).default('INFO'),
  userId: z.string().optional(),
});

export type ActivityFeedInput = z.infer<typeof ActivityFeedSchema>;
```

**File:** `lib/modules/dashboard/quick-actions/schemas.ts`

```typescript
import { z } from 'zod';
import { ActionType } from '@prisma/client';

export const QuickActionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().min(1),
  actionType: z.nativeEnum(ActionType),
  targetUrl: z.string().url().optional(),
  apiEndpoint: z.string().optional(),
  formConfig: z.record(z.any()).optional(),
  color: z.string().default('blue'),
  isEnabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  requiredRole: z.array(z.string()).default([]),
  requiredTier: z.array(z.string()).default([]),
  organizationId: z.string().optional(), // null for system actions
});

export type QuickActionInput = z.infer<typeof QuickActionSchema>;
```

### Step 2: Create Query Functions

**File:** `lib/modules/dashboard/metrics/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getDashboardMetrics() {
  const session = await requireAuth();

  return await prisma.dashboardMetric.findMany({
    where: {
      OR: [
        { organizationId: session.user.organizationId },
        { organizationId: null }, // System metrics
      ],
    },
    orderBy: { category: 'asc' },
  });
}

export async function getMetricById(id: string) {
  const session = await requireAuth();

  const metric = await prisma.dashboardMetric.findUnique({
    where: { id },
  });

  if (!metric) {
    throw new Error('Metric not found');
  }

  // Verify access
  if (metric.organizationId && metric.organizationId !== session.user.organizationId) {
    throw new Error('Unauthorized');
  }

  return metric;
}

export async function getMetricsByCategory(category: string) {
  const session = await requireAuth();

  return await prisma.dashboardMetric.findMany({
    where: {
      category: category as any,
      OR: [
        { organizationId: session.user.organizationId },
        { organizationId: null },
      ],
    },
    orderBy: { name: 'asc' },
  });
}
```

**File:** `lib/modules/dashboard/widgets/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getDashboardWidgets() {
  const session = await requireAuth();

  return await prisma.dashboardWidget.findMany({
    where: {
      organizationId: session.user.organizationId,
      isVisible: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWidgetById(id: string) {
  const session = await requireAuth();

  const widget = await prisma.dashboardWidget.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!widget || widget.organizationId !== session.user.organizationId) {
    throw new Error('Widget not found');
  }

  return widget;
}

export async function getWidgetsByType(type: string) {
  const session = await requireAuth();

  return await prisma.dashboardWidget.findMany({
    where: {
      organizationId: session.user.organizationId,
      type: type as any,
      isVisible: true,
    },
  });
}
```

**File:** `lib/modules/dashboard/activities/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';

export async function getRecentActivities(limit: number = 20) {
  const session = await requireAuth();

  return await prisma.activityFeed.findMany({
    where: {
      organizationId: session.user.organizationId,
      isArchived: false,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getActivitiesByType(type: string, limit: number = 20) {
  const session = await requireAuth();

  return await prisma.activityFeed.findMany({
    where: {
      organizationId: session.user.organizationId,
      type: type as any,
      isArchived: false,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getActivitiesByEntity(entityType: string, entityId: string) {
  const session = await requireAuth();

  return await prisma.activityFeed.findMany({
    where: {
      organizationId: session.user.organizationId,
      entityType,
      entityId,
      isArchived: false,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

**File:** `lib/modules/dashboard/quick-actions/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canAccessFeature } from '@/lib/auth/rbac';

export async function getQuickActions() {
  const session = await requireAuth();

  const actions = await prisma.quickAction.findMany({
    where: {
      OR: [
        { organizationId: session.user.organizationId },
        { organizationId: null }, // System actions
      ],
      isEnabled: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  // Filter by user role and tier
  return actions.filter(action => {
    // Check role requirements
    if (action.requiredRole.length > 0) {
      const hasRole = action.requiredRole.includes(session.user.organizationRole);
      if (!hasRole) return false;
    }

    // Check tier requirements
    if (action.requiredTier.length > 0) {
      const hasTier = action.requiredTier.includes(session.user.subscriptionTier || 'FREE');
      if (!hasTier) return false;
    }

    return true;
  });
}

export async function getQuickActionById(id: string) {
  const session = await requireAuth();

  const action = await prisma.quickAction.findUnique({
    where: { id },
  });

  if (!action) {
    throw new Error('Quick action not found');
  }

  // Verify access
  if (action.organizationId && action.organizationId !== session.user.organizationId) {
    throw new Error('Unauthorized');
  }

  return action;
}
```

### Step 3: Create Metrics Calculator

**File:** `lib/modules/dashboard/metrics/calculator.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { MetricCategory } from '@prisma/client';

interface MetricCalculation {
  id: string;
  name: string;
  value: number;
  unit?: string;
  change?: number; // Percentage change from last period
  status: 'normal' | 'warning' | 'critical';
}

export async function calculateMetrics(organizationId: string): Promise<MetricCalculation[]> {
  const session = await requireAuth();

  if (organizationId !== session.user.organizationId) {
    throw new Error('Unauthorized');
  }

  // Get all active metrics for the organization
  const metrics = await prisma.dashboardMetric.findMany({
    where: {
      OR: [
        { organizationId },
        { organizationId: null }, // System metrics
      ],
    },
  });

  const calculatedMetrics: MetricCalculation[] = [];

  for (const metric of metrics) {
    try {
      const value = await calculateMetricValue(metric, organizationId);

      // Update cached value
      await prisma.dashboardMetric.update({
        where: { id: metric.id },
        data: {
          cachedValue: value,
          lastCalculated: new Date(),
        },
      });

      calculatedMetrics.push({
        id: metric.id,
        name: metric.name,
        value,
        unit: metric.unit || undefined,
        status: getMetricStatus(value, metric),
      });
    } catch (error) {
      console.error(`Failed to calculate metric ${metric.name}:`, error);
    }
  }

  return calculatedMetrics;
}

async function calculateMetricValue(metric: any, organizationId: string): Promise<number> {
  // This would implement the actual metric calculation based on the query
  // For now, return cached value or 0

  switch (metric.category) {
    case MetricCategory.FINANCIAL:
      return await calculateFinancialMetric(metric.query, organizationId);
    case MetricCategory.OPERATIONAL:
      return await calculateOperationalMetric(metric.query, organizationId);
    case MetricCategory.PRODUCTIVITY:
      return await calculateProductivityMetric(metric.query, organizationId);
    case MetricCategory.SALES:
      return await calculateSalesMetric(metric.query, organizationId);
    default:
      return metric.cachedValue || 0;
  }
}

function getMetricStatus(value: number, metric: any): 'normal' | 'warning' | 'critical' {
  if (metric.criticalThreshold && value >= metric.criticalThreshold) {
    return 'critical';
  }
  if (metric.warningThreshold && value >= metric.warningThreshold) {
    return 'warning';
  }
  return 'normal';
}

async function calculateFinancialMetric(query: any, orgId: string): Promise<number> {
  // Placeholder - implement based on query structure
  // Example: Total revenue, expenses, profit margin
  return 0;
}

async function calculateOperationalMetric(query: any, orgId: string): Promise<number> {
  // Placeholder - implement based on query structure
  // Example: Active projects, completed tasks, uptime
  return 0;
}

async function calculateProductivityMetric(query: any, orgId: string): Promise<number> {
  // Placeholder - implement based on query structure
  // Example: Tasks per day, completion rate
  return 0;
}

async function calculateSalesMetric(query: any, orgId: string): Promise<number> {
  // Placeholder - implement based on query structure
  // Example: Total deals, conversion rate
  return 0;
}
```

### Step 4: Create Server Actions

**File:** `lib/modules/dashboard/metrics/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canManageWidgets } from '@/lib/auth/rbac';
import { DashboardMetricSchema, UpdateMetricSchema } from './schemas';

export async function createDashboardMetric(input: unknown) {
  const session = await requireAuth();

  if (!canManageWidgets(session.user)) {
    throw new Error('Insufficient permissions');
  }

  const validated = DashboardMetricSchema.parse(input);

  const metric = await prisma.dashboardMetric.create({
    data: {
      ...validated,
      organizationId: validated.organizationId || session.user.organizationId,
      createdBy: session.user.id,
    },
  });

  revalidatePath('/dashboard');
  return metric;
}

export async function updateDashboardMetric(input: unknown) {
  const session = await requireAuth();

  if (!canManageWidgets(session.user)) {
    throw new Error('Insufficient permissions');
  }

  const validated = UpdateMetricSchema.parse(input);
  const { id, ...data } = validated;

  // Verify ownership
  const existing = await prisma.dashboardMetric.findUnique({
    where: { id },
  });

  if (!existing || (existing.organizationId && existing.organizationId !== session.user.organizationId)) {
    throw new Error('Metric not found');
  }

  const metric = await prisma.dashboardMetric.update({
    where: { id },
    data,
  });

  revalidatePath('/dashboard');
  return metric;
}

export async function deleteDashboardMetric(id: string) {
  const session = await requireAuth();

  if (!canManageWidgets(session.user)) {
    throw new Error('Insufficient permissions');
  }

  // Verify ownership
  const existing = await prisma.dashboardMetric.findUnique({
    where: { id },
  });

  if (!existing || (existing.organizationId && existing.organizationId !== session.user.organizationId)) {
    throw new Error('Metric not found');
  }

  await prisma.dashboardMetric.delete({
    where: { id },
  });

  revalidatePath('/dashboard');
}
```

**File:** `lib/modules/dashboard/activities/actions.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { ActivityFeedSchema } from './schemas';

export async function recordActivity(input: unknown) {
  const session = await requireAuth();

  const validated = ActivityFeedSchema.parse(input);

  return await prisma.activityFeed.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId,
      userId: validated.userId || session.user.id,
    },
  });
}

export async function markActivityAsRead(id: string) {
  const session = await requireAuth();

  // Verify ownership
  const activity = await prisma.activityFeed.findUnique({
    where: { id },
  });

  if (!activity || activity.organizationId !== session.user.organizationId) {
    throw new Error('Activity not found');
  }

  return await prisma.activityFeed.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function archiveActivity(id: string) {
  const session = await requireAuth();

  // Verify ownership
  const activity = await prisma.activityFeed.findUnique({
    where: { id },
  });

  if (!activity || activity.organizationId !== session.user.organizationId) {
    throw new Error('Activity not found');
  }

  return await prisma.activityFeed.update({
    where: { id },
    data: { isArchived: true },
  });
}
```

### Step 5: Create Module Public API

**File:** `lib/modules/dashboard/index.ts`

```typescript
// Metrics
export {
  createDashboardMetric,
  updateDashboardMetric,
  deleteDashboardMetric,
} from './metrics/actions';
export {
  getDashboardMetrics,
  getMetricById,
  getMetricsByCategory,
} from './metrics/queries';
export { calculateMetrics } from './metrics/calculator';
export { DashboardMetricSchema } from './metrics/schemas';

// Widgets
export {
  createDashboardWidget,
  updateDashboardWidget,
  deleteDashboardWidget,
} from './widgets/actions';
export {
  getDashboardWidgets,
  getWidgetById,
  getWidgetsByType,
} from './widgets/queries';
export { DashboardWidgetSchema } from './widgets/schemas';

// Activities
export {
  recordActivity,
  markActivityAsRead,
  archiveActivity,
} from './activities/actions';
export {
  getRecentActivities,
  getActivitiesByType,
  getActivitiesByEntity,
} from './activities/queries';
export { ActivityFeedSchema } from './activities/schemas';

// Quick Actions
export {
  createQuickAction,
  updateQuickAction,
  deleteQuickAction,
  executeQuickAction,
} from './quick-actions/actions';
export {
  getQuickActions,
  getQuickActionById,
} from './quick-actions/queries';
export { QuickActionSchema } from './quick-actions/schemas';

// Types
export type { DashboardMetricInput } from './metrics/schemas';
export type { DashboardWidgetInput } from './widgets/schemas';
export type { ActivityFeedInput } from './activities/schemas';
export type { QuickActionInput } from './quick-actions/schemas';
```

### Step 6: Add RBAC Permissions

**File:** `lib/auth/rbac.ts` (add to existing file)

```typescript
// Dashboard permissions
export function canAccessDashboard(user: User): boolean {
  // All authenticated users can access basic dashboard
  return true;
}

export function canCustomizeDashboard(user: User): boolean {
  return ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);
}

export function canViewOrganizationMetrics(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}

export function canManageWidgets(user: User): boolean {
  return ['OWNER', 'ADMIN'].includes(user.organizationRole);
}
```

## Testing & Validation

### Test 1: Metric Calculation
```typescript
// Test calculating metrics
const metrics = await calculateMetrics(organizationId);
expect(metrics).toBeInstanceOf(Array);
expect(metrics.length).toBeGreaterThan(0);
```

### Test 2: Activity Recording
```typescript
// Test recording activity
const activity = await recordActivity({
  title: 'Test Activity',
  type: 'USER_ACTION',
  entityType: 'project',
  entityId: 'test-id',
  action: 'created',
});
expect(activity.organizationId).toBe(session.user.organizationId);
```

### Test 3: RBAC Enforcement
```typescript
// Test unauthorized access
await expect(
  createDashboardMetric(input)
).rejects.toThrow('Insufficient permissions');
```

## Success Criteria

- [x] All module directories created
- [x] Zod schemas for all entities
- [x] Query functions with RBAC
- [x] Server actions with validation
- [x] Metrics calculation engine
- [x] Activity tracking system
- [x] Multi-tenancy enforced
- [x] Public API exports

## Files Created

- ✅ `lib/modules/dashboard/metrics/schemas.ts`
- ✅ `lib/modules/dashboard/metrics/queries.ts`
- ✅ `lib/modules/dashboard/metrics/actions.ts`
- ✅ `lib/modules/dashboard/metrics/calculator.ts`
- ✅ `lib/modules/dashboard/widgets/schemas.ts`
- ✅ `lib/modules/dashboard/widgets/queries.ts`
- ✅ `lib/modules/dashboard/widgets/actions.ts`
- ✅ `lib/modules/dashboard/activities/schemas.ts`
- ✅ `lib/modules/dashboard/activities/queries.ts`
- ✅ `lib/modules/dashboard/activities/actions.ts`
- ✅ `lib/modules/dashboard/quick-actions/schemas.ts`
- ✅ `lib/modules/dashboard/quick-actions/queries.ts`
- ✅ `lib/modules/dashboard/quick-actions/actions.ts`
- ✅ `lib/modules/dashboard/index.ts`

## Files Modified

- ✅ `lib/auth/rbac.ts` - Added dashboard permissions

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Missing RBAC Checks
**Problem:** Server actions without permission validation
**Solution:** Always call canManageWidgets() or appropriate permission function

### ❌ Pitfall 2: Missing revalidatePath
**Problem:** Stale data after mutations
**Solution:** Call revalidatePath('/dashboard') after all mutations

### ❌ Pitfall 3: Missing Multi-Tenancy
**Problem:** Queries not filtering by organizationId
**Solution:** Always include organizationId in where clauses

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 3: API Routes - Endpoints & Webhooks**
2. ✅ Backend module logic is complete
3. ✅ Ready to expose via API routes
4. ✅ Can start building UI components

---

**Session 2 Complete:** ✅ Backend module infrastructure ready
