# Session 2: Admin Module Backend & RBAC Implementation

## Session Overview
**Goal:** Build the complete admin module backend with RBAC enforcement, platform metrics calculation, and admin action logging.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 1 (Database schema)

## Objectives

1. ✅ Create admin module structure
2. ✅ Implement platform metrics calculation
3. ✅ Build admin action logging system
4. ✅ Add RBAC helper functions for admin access
5. ✅ Create feature flag management functions
6. ✅ Implement system alert management
7. ✅ Add comprehensive error handling

## Module Structure

```
lib/modules/admin/
├── index.ts              # Public API exports
├── schemas.ts            # Zod validation schemas
├── queries.ts            # Data fetching functions
├── actions.ts            # Server Actions (mutations)
├── metrics.ts            # Platform metrics calculations
├── audit.ts              # Admin action logging
└── rbac.ts               # Admin RBAC helpers

lib/auth/rbac.ts          # Update with admin permissions
```

## Implementation Steps

### Step 1: Create Admin Schemas

**File:** `lib/modules/admin/schemas.ts`

```typescript
import { z } from 'zod';
import {
  AdminAction,
  AlertLevel,
  AlertCategory,
  Environment,
  SubscriptionTier,
  UserRole
} from '@prisma/client';

// Admin Action Log
export const adminActionLogSchema = z.object({
  action: z.nativeEnum(AdminAction),
  description: z.string().min(1).max(500),
  targetType: z.enum(['user', 'organization', 'subscription', 'feature_flag', 'system_alert']),
  targetId: z.string().cuid(),
  metadata: z.record(z.any()).optional(),
});

export type AdminActionLogInput = z.infer<typeof adminActionLogSchema>;

// Feature Flag
export const createFeatureFlagSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/, 'Must be lowercase with hyphens/underscores'),
  description: z.string().max(500).optional(),
  isEnabled: z.boolean().default(false),
  rolloutPercent: z.number().min(0).max(100).default(0),
  targetTiers: z.array(z.nativeEnum(SubscriptionTier)).default([]),
  targetOrgs: z.array(z.string().uuid()).default([]),
  targetUsers: z.array(z.string().uuid()).default([]),
  environment: z.nativeEnum(Environment).default('PRODUCTION'),
  category: z.string().max(50).optional(),
});

export const updateFeatureFlagSchema = createFeatureFlagSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;

// System Alert
export const createSystemAlertSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  level: z.nativeEnum(AlertLevel).default('INFO'),
  category: z.nativeEnum(AlertCategory),
  isGlobal: z.boolean().default(false),
  targetRoles: z.array(z.nativeEnum(UserRole)).default([]),
  targetTiers: z.array(z.nativeEnum(SubscriptionTier)).default([]),
  targetOrgs: z.array(z.string().uuid()).default([]),
  isDismissible: z.boolean().default(true),
  autoHideAfter: z.number().int().positive().optional(),
  startsAt: z.coerce.date().default(() => new Date()),
  endsAt: z.coerce.date().optional(),
});

export const updateSystemAlertSchema = createSystemAlertSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateSystemAlertInput = z.infer<typeof createSystemAlertSchema>;
export type UpdateSystemAlertInput = z.infer<typeof updateSystemAlertSchema>;

// User Management (for admin operations)
export const suspendUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  suspendUntil: z.coerce.date().optional(),
});

export const impersonateUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type ImpersonateUserInput = z.infer<typeof impersonateUserSchema>;
```

### Step 2: Update RBAC with Admin Permissions

**File:** `lib/auth/rbac.ts` (add to existing file)

```typescript
import type { User } from '@prisma/client';

/**
 * Admin Panel Access Control
 */
export function canAccessAdminPanel(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canViewPlatformMetrics(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canManageUsers(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canManageOrganizations(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canManageFeatureFlags(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canManageSystemAlerts(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canImpersonateUsers(user: User): boolean {
  // Only super admins can impersonate
  return user.globalRole === 'ADMIN' && user.isSuperAdmin === true;
}

export function canExportData(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

export function canViewAuditLogs(user: User): boolean {
  return user.globalRole === 'ADMIN';
}

/**
 * Require admin access or throw
 */
export function requireAdmin(user: User): void {
  if (!canAccessAdminPanel(user)) {
    throw new Error('Unauthorized: Admin access required');
  }
}
```

### Step 3: Create Platform Metrics Calculation

**File:** `lib/modules/admin/metrics.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canViewPlatformMetrics } from '@/lib/auth/rbac';
import { cache } from 'react';

/**
 * Get latest platform metrics (cached 1 hour)
 */
export const getPlatformMetrics = cache(async function() {
  const session = await requireAuth();

  if (!canViewPlatformMetrics(session.user)) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Get latest metrics
  const latest = await prisma.platformMetrics.findFirst({
    orderBy: { date: 'desc' },
  });

  // If no metrics exist or metrics are older than 1 hour, calculate fresh
  if (!latest || Date.now() - latest.date.getTime() > 3600000) {
    return await calculatePlatformMetrics();
  }

  return latest;
});

/**
 * Calculate fresh platform metrics
 */
export async function calculatePlatformMetrics() {
  const session = await requireAuth();

  if (!canViewPlatformMetrics(session.user)) {
    throw new Error('Unauthorized');
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calculate user metrics
  const [totalUsers, activeUsers, newUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { lastLoginAt: { gte: thirtyDaysAgo } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: today } },
    }),
  ]);

  // Calculate organization metrics
  const [totalOrgs, activeOrgs, newOrgs] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({
      where: {
        members: {
          some: {
            user: { lastLoginAt: { gte: thirtyDaysAgo } },
          },
        },
      },
    }),
    prisma.organization.count({
      where: { createdAt: { gte: today } },
    }),
  ]);

  // Calculate subscription metrics
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    select: {
      tier: true,
      interval: true,
      amount: true,
    },
  });

  const mrrCents = activeSubscriptions
    .filter(s => s.interval === 'MONTHLY')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const yearlyRevenue = activeSubscriptions
    .filter(s => s.interval === 'YEARLY')
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const arrCents = (mrrCents * 12) + yearlyRevenue;

  // Calculate churn rate (simplified - last 30 days)
  const cancelledSubs = await prisma.subscription.count({
    where: {
      status: 'CANCELLED',
      updatedAt: { gte: thirtyDaysAgo },
    },
  });
  const churnRate = totalOrgs > 0 ? (cancelledSubs / totalOrgs) * 100 : 0;

  // Tier distribution
  const tierCounts = activeSubscriptions.reduce((acc, sub) => {
    const tier = sub.tier.toLowerCase() + 'Count';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total storage (placeholder - implement based on storage strategy)
  const totalStorage = BigInt(0); // TODO: Calculate from Supabase storage

  // Calculate API calls today (placeholder - implement with rate limiting tracking)
  const apiCalls = 0; // TODO: Get from rate limiting logs

  // Save metrics
  const metrics = await prisma.platformMetrics.create({
    data: {
      date: now,
      totalUsers,
      activeUsers,
      newUsers,
      totalOrgs,
      activeOrgs,
      newOrgs,
      mrrCents: BigInt(mrrCents),
      arrCents: BigInt(arrCents),
      churnRate,
      freeCount: tierCounts.freeCount || 0,
      starterCount: tierCounts.starterCount || 0,
      growthCount: tierCounts.growthCount || 0,
      eliteCount: tierCounts.eliteCount || 0,
      enterpriseCount: tierCounts.enterpriseCount || 0,
      totalStorage,
      apiCalls,
    },
  });

  return metrics;
}

/**
 * Get metrics history (last N days)
 */
export async function getMetricsHistory(days: number = 30) {
  const session = await requireAuth();

  if (!canViewPlatformMetrics(session.user)) {
    throw new Error('Unauthorized');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.platformMetrics.findMany({
    where: {
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  });
}
```

### Step 4: Create Admin Action Logging

**File:** `lib/modules/admin/audit.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { canViewAuditLogs } from '@/lib/auth/rbac';
import type { AdminAction } from '@prisma/client';

interface LogAdminActionInput {
  action: AdminAction;
  description: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  success?: boolean;
  error?: string;
}

/**
 * Log an admin action for audit trail
 */
export async function logAdminAction(input: LogAdminActionInput) {
  const session = await requireAuth();

  // Get client info (if available)
  const ipAddress = getClientIP();
  const userAgent = getUserAgent();

  return await prisma.adminActionLog.create({
    data: {
      action: input.action,
      description: input.description,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
      success: input.success ?? true,
      error: input.error,
      ipAddress,
      userAgent,
      adminId: session.user.id,
    },
  });
}

/**
 * Get admin action logs with filtering
 */
export async function getAdminActionLogs(filters?: {
  action?: AdminAction;
  adminId?: string;
  targetType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const session = await requireAuth();

  if (!canViewAuditLogs(session.user)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};

  if (filters?.action) where.action = filters.action;
  if (filters?.adminId) where.adminId = filters.adminId;
  if (filters?.targetType) where.targetType = filters.targetType;
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  return await prisma.adminActionLog.findMany({
    where,
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 100,
  });
}

// Helper functions (implement based on platform)
function getClientIP(): string | null {
  // TODO: Implement IP extraction from request headers
  return null;
}

function getUserAgent(): string | null {
  // TODO: Implement UA extraction from request headers
  return null;
}
```

### Step 5: Create Admin Queries

**File:** `lib/modules/admin/queries.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import {
  canManageUsers,
  canManageOrganizations,
  canManageFeatureFlags,
  canManageSystemAlerts,
} from '@/lib/auth/rbac';
import { cache } from 'react';

/**
 * Get all users (admin only)
 */
export const getAllUsers = cache(async function(filters?: {
  role?: string;
  subscriptionTier?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  const session = await requireAuth();

  if (!canManageUsers(session.user)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};
  if (filters?.role) where.globalRole = filters.role;
  if (filters?.subscriptionTier) where.subscriptionTier = filters.subscriptionTier;
  if (filters?.isActive !== undefined) where.isActive = filters.isActive;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        organization: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
});

/**
 * Get all organizations (admin only)
 */
export const getAllOrganizations = cache(async function(filters?: {
  subscriptionTier?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  const session = await requireAuth();

  if (!canManageOrganizations(session.user)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};
  if (filters?.subscriptionTier) where.subscriptionTier = filters.subscriptionTier;

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: { members: true },
        },
        subscription: {
          select: {
            tier: true,
            status: true,
            interval: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.organization.count({ where }),
  ]);

  return { organizations, total };
});

/**
 * Get all feature flags
 */
export const getAllFeatureFlags = cache(async function(environment?: string) {
  const session = await requireAuth();

  if (!canManageFeatureFlags(session.user)) {
    throw new Error('Unauthorized');
  }

  const where: any = {};
  if (environment) where.environment = environment;

  return await prisma.featureFlag.findMany({
    where,
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});

/**
 * Get active system alerts
 */
export const getActiveSystemAlerts = cache(async function() {
  const session = await requireAuth();

  if (!canManageSystemAlerts(session.user)) {
    throw new Error('Unauthorized');
  }

  const now = new Date();

  return await prisma.systemAlert.findMany({
    where: {
      isActive: true,
      startsAt: { lte: now },
      OR: [
        { endsAt: null },
        { endsAt: { gte: now } },
      ],
    },
    include: {
      creator: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});
```

### Step 6: Create Admin Actions (Server Actions)

**File:** `lib/modules/admin/actions.ts`

```typescript
'use server';

import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';
import {
  canManageUsers,
  canManageFeatureFlags,
  canManageSystemAlerts,
  requireAdmin,
} from '@/lib/auth/rbac';
import { logAdminAction } from './audit';
import {
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
  createSystemAlertSchema,
  updateSystemAlertSchema,
  suspendUserSchema,
  type CreateFeatureFlagInput,
  type UpdateFeatureFlagInput,
  type CreateSystemAlertInput,
  type UpdateSystemAlertInput,
  type SuspendUserInput,
} from './schemas';

/**
 * Create feature flag
 */
export async function createFeatureFlag(input: CreateFeatureFlagInput) {
  const session = await requireAuth();

  if (!canManageFeatureFlags(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createFeatureFlagSchema.parse(input);

  try {
    const flag = await prisma.featureFlag.create({
      data: {
        ...validated,
        createdBy: session.user.id,
      },
    });

    await logAdminAction({
      action: 'FEATURE_FLAG_UPDATE',
      description: `Created feature flag: ${flag.name}`,
      targetType: 'feature_flag',
      targetId: flag.id,
      metadata: { flagName: flag.name, isEnabled: flag.isEnabled },
    });

    revalidatePath('/admin/feature-flags');
    return flag;
  } catch (error: any) {
    await logAdminAction({
      action: 'FEATURE_FLAG_UPDATE',
      description: `Failed to create feature flag: ${validated.name}`,
      targetType: 'feature_flag',
      targetId: 'new',
      success: false,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(input: UpdateFeatureFlagInput) {
  const session = await requireAuth();

  if (!canManageFeatureFlags(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateFeatureFlagSchema.parse(input);
  const { id, ...data } = validated;

  try {
    const flag = await prisma.featureFlag.update({
      where: { id },
      data,
    });

    await logAdminAction({
      action: 'FEATURE_FLAG_UPDATE',
      description: `Updated feature flag: ${flag.name}`,
      targetType: 'feature_flag',
      targetId: flag.id,
      metadata: { changes: data },
    });

    revalidatePath('/admin/feature-flags');
    return flag;
  } catch (error: any) {
    await logAdminAction({
      action: 'FEATURE_FLAG_UPDATE',
      description: `Failed to update feature flag: ${id}`,
      targetType: 'feature_flag',
      targetId: id,
      success: false,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Create system alert
 */
export async function createSystemAlert(input: CreateSystemAlertInput) {
  const session = await requireAuth();

  if (!canManageSystemAlerts(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createSystemAlertSchema.parse(input);

  const alert = await prisma.systemAlert.create({
    data: {
      ...validated,
      createdBy: session.user.id,
    },
  });

  await logAdminAction({
    action: 'SYSTEM_CONFIG_UPDATE',
    description: `Created system alert: ${alert.title}`,
    targetType: 'system_alert',
    targetId: alert.id,
  });

  revalidatePath('/admin/alerts');
  return alert;
}

/**
 * Update system alert
 */
export async function updateSystemAlert(input: UpdateSystemAlertInput) {
  const session = await requireAuth();

  if (!canManageSystemAlerts(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateSystemAlertSchema.parse(input);
  const { id, ...data } = validated;

  const alert = await prisma.systemAlert.update({
    where: { id },
    data,
  });

  await logAdminAction({
    action: 'SYSTEM_CONFIG_UPDATE',
    description: `Updated system alert: ${alert.title}`,
    targetType: 'system_alert',
    targetId: alert.id,
  });

  revalidatePath('/admin/alerts');
  return alert;
}

/**
 * Suspend user
 */
export async function suspendUser(input: SuspendUserInput) {
  const session = await requireAuth();

  if (!canManageUsers(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = suspendUserSchema.parse(input);

  const user = await prisma.user.update({
    where: { id: validated.userId },
    data: {
      isSuspended: true,
      suspendedUntil: validated.suspendUntil,
      suspendedReason: validated.reason,
    },
  });

  await logAdminAction({
    action: 'USER_SUSPEND',
    description: `Suspended user: ${user.email}`,
    targetType: 'user',
    targetId: user.id,
    metadata: {
      reason: validated.reason,
      suspendedUntil: validated.suspendUntil,
    },
  });

  revalidatePath('/admin/users');
  return user;
}

/**
 * Reactivate suspended user
 */
export async function reactivateUser(userId: string) {
  const session = await requireAuth();

  if (!canManageUsers(session.user)) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isSuspended: false,
      suspendedUntil: null,
      suspendedReason: null,
    },
  });

  await logAdminAction({
    action: 'USER_UPDATE',
    description: `Reactivated user: ${user.email}`,
    targetType: 'user',
    targetId: user.id,
  });

  revalidatePath('/admin/users');
  return user;
}
```

### Step 7: Create Module Index

**File:** `lib/modules/admin/index.ts`

```typescript
// Schemas
export * from './schemas';

// Queries
export {
  getPlatformMetrics,
  calculatePlatformMetrics,
  getMetricsHistory,
} from './metrics';

export {
  getAllUsers,
  getAllOrganizations,
  getAllFeatureFlags,
  getActiveSystemAlerts,
} from './queries';

// Actions
export {
  createFeatureFlag,
  updateFeatureFlag,
  createSystemAlert,
  updateSystemAlert,
  suspendUser,
  reactivateUser,
} from './actions';

// Audit
export {
  logAdminAction,
  getAdminActionLogs,
} from './audit';

// Types
export type { AdminActionLogInput } from './schemas';
```

## Testing Requirements

### Test 1: Platform Metrics Calculation
```typescript
// Test file: __tests__/modules/admin/metrics.test.ts
import { calculatePlatformMetrics } from '@/lib/modules/admin/metrics';

describe('Platform Metrics', () => {
  it('should calculate metrics correctly', async () => {
    const metrics = await calculatePlatformMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.totalUsers).toBeGreaterThanOrEqual(0);
    expect(metrics.totalOrgs).toBeGreaterThanOrEqual(0);
  });
});
```

### Test 2: Admin Action Logging
```typescript
// Test audit trail creation
import { logAdminAction } from '@/lib/modules/admin/audit';

describe('Admin Audit Log', () => {
  it('should log admin actions', async () => {
    const log = await logAdminAction({
      action: 'USER_UPDATE',
      description: 'Test action',
      targetType: 'user',
      targetId: 'test-id',
    });
    expect(log).toBeDefined();
    expect(log.action).toBe('USER_UPDATE');
  });
});
```

### Test 3: RBAC Enforcement
```typescript
// Test admin access control
import { canAccessAdminPanel } from '@/lib/auth/rbac';

describe('Admin RBAC', () => {
  it('should allow admin access', () => {
    const adminUser = { globalRole: 'ADMIN' } as any;
    expect(canAccessAdminPanel(adminUser)).toBe(true);
  });

  it('should deny non-admin access', () => {
    const regularUser = { globalRole: 'EMPLOYEE' } as any;
    expect(canAccessAdminPanel(regularUser)).toBe(false);
  });
});
```

## Success Criteria

**MANDATORY - All must pass:**
- [ ] Admin module structure created
- [ ] Platform metrics calculation working
- [ ] Admin action logging functional
- [ ] RBAC helpers implemented and tested
- [ ] Feature flag management complete
- [ ] System alert management complete
- [ ] All Server Actions have RBAC checks
- [ ] Error handling comprehensive
- [ ] Audit trail captures all admin actions
- [ ] Tests passing with 80%+ coverage
- [ ] No TypeScript errors

**Quality Checks:**
- [ ] All mutations logged to audit trail
- [ ] IP and User Agent captured when possible
- [ ] Metrics cached appropriately (1 hour)
- [ ] Error states handled gracefully
- [ ] Validation with Zod on all inputs
- [ ] revalidatePath called after mutations

## Files Created

```
✅ lib/modules/admin/schemas.ts
✅ lib/modules/admin/metrics.ts
✅ lib/modules/admin/audit.ts
✅ lib/modules/admin/queries.ts
✅ lib/modules/admin/actions.ts
✅ lib/modules/admin/index.ts
🔄 lib/auth/rbac.ts (updated)
✅ __tests__/modules/admin/metrics.test.ts
✅ __tests__/modules/admin/audit.test.ts
✅ __tests__/modules/admin/actions.test.ts
```

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 3: Onboarding Module Backend**
2. ✅ Admin module backend complete
3. ✅ Ready to implement onboarding flow logic

---

**Session 2 Complete:** ✅ Admin module backend with RBAC, metrics, and audit logging implemented
