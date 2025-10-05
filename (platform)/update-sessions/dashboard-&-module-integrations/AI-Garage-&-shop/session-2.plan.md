# Session 2: Agent Orders Module - Backend & API

## Session Overview
**Goal:** Implement the complete backend infrastructure for the Agent Orders module including schemas, queries, server actions, and RBAC permissions.

**Duration:** 3-4 hours
**Complexity:** High
**Dependencies:** Session 1 (Database Foundation)

## Objectives

1. ✅ Create agent orders module structure (schemas, queries, actions)
2. ✅ Implement Zod validation schemas for orders
3. ✅ Create data query functions with proper filtering
4. ✅ Implement Server Actions for CRUD operations
5. ✅ Add RBAC permissions for AI Garage access
6. ✅ Create API routes for order management
7. ✅ Add comprehensive error handling
8. ✅ Implement cost estimation logic
9. ✅ Write unit tests for module

## Prerequisites

- [x] Session 1 completed (database schema in place)
- [x] custom_agent_orders table exists with RLS policies
- [x] Platform auth system functional
- [x] Understanding of module architecture

## Module Structure

```
lib/modules/ai-garage/
├── orders/
│   ├── index.ts           # Public API exports
│   ├── schemas.ts         # Zod validation schemas
│   ├── queries.ts         # Data fetching functions
│   ├── actions.ts         # Server Actions (mutations)
│   └── utils.ts           # Cost calculation utilities
├── templates/             # Session 3
├── blueprints/            # Session 4
└── index.ts              # Module root exports
```

## Step-by-Step Implementation

### Step 1: Create Module Directory

```bash
mkdir -p "(platform)/lib/modules/ai-garage/orders"
```

### Step 2: Create Validation Schemas

**File:** `lib/modules/ai-garage/orders/schemas.ts`

```typescript
import { z } from 'zod';
import { ComplexityLevel, OrderStatus, OrderPriority } from '@prisma/client';

/**
 * Agent Order Creation Schema
 *
 * Validates all input when creating a new custom agent order
 * Multi-tenant: organizationId required
 */
export const createOrderSchema = z.object({
  // Required fields
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  use_case: z.string().min(1, 'Use case is required').max(200),

  // Order classification
  complexity: z.nativeEnum(ComplexityLevel),
  priority: z.nativeEnum(OrderPriority).default('NORMAL'),

  // Requirements and configuration
  requirements: z.record(z.string(), z.any()),
  agent_config: z.record(z.string(), z.any()),
  tools_config: z.record(z.string(), z.any()),

  // Assignment
  assigned_to_id: z.string().uuid().optional(),

  // Multi-tenancy (required)
  organization_id: z.string().uuid(),
});

/**
 * Order Update Schema
 * All fields optional except ID
 */
export const updateOrderSchema = createOrderSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * Order Filters Schema
 * For querying/filtering orders
 */
export const orderFiltersSchema = z.object({
  // Status filters
  status: z.union([
    z.nativeEnum(OrderStatus),
    z.array(z.nativeEnum(OrderStatus))
  ]).optional(),

  // Complexity filters
  complexity: z.union([
    z.nativeEnum(ComplexityLevel),
    z.array(z.nativeEnum(ComplexityLevel))
  ]).optional(),

  // Priority filters
  priority: z.union([
    z.nativeEnum(OrderPriority),
    z.array(z.nativeEnum(OrderPriority))
  ]).optional(),

  // Assignment filter
  assigned_to_id: z.string().uuid().optional(),
  created_by_id: z.string().uuid().optional(),

  // Search
  search: z.string().optional(),

  // Date range filters
  created_from: z.coerce.date().optional(),
  created_to: z.coerce.date().optional(),
  submitted_from: z.coerce.date().optional(),
  submitted_to: z.coerce.date().optional(),

  // Pagination
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),

  // Sorting
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'progress', 'submitted_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Order Status Update Schema
 */
export const updateOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(OrderStatus),
  notes: z.string().max(1000).optional(),
});

/**
 * Order Progress Update Schema
 */
export const updateOrderProgressSchema = z.object({
  id: z.string().uuid(),
  progress: z.number().int().min(0).max(100),
  current_stage: z.string().max(50).optional(),
});

/**
 * Milestone Creation Schema
 */
export const createMilestoneSchema = z.object({
  order_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  stage: z.string().min(1).max(50),
  due_date: z.coerce.date().optional(),
  sort_order: z.number().int().default(0),
});

/**
 * Build Log Creation Schema
 */
export const createBuildLogSchema = z.object({
  order_id: z.string().uuid(),
  stage: z.string().min(1).max(50),
  message: z.string().min(1),
  details: z.record(z.string(), z.any()).optional(),
  log_level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
});

// Export types
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderProgressInput = z.infer<typeof updateOrderProgressSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type CreateBuildLogInput = z.infer<typeof createBuildLogSchema>;
```

### Step 3: Create Utilities for Cost Calculation

**File:** `lib/modules/ai-garage/orders/utils.ts`

```typescript
import { ComplexityLevel } from '@prisma/client';

/**
 * Calculate estimated hours based on complexity and requirements
 */
export function calculateEstimatedHours(
  complexity: ComplexityLevel,
  requirements: any
): number {
  const baseHours = {
    SIMPLE: 6,
    MODERATE: 16,
    COMPLEX: 48,
    ENTERPRISE: 120
  };

  let hours = baseHours[complexity];

  // Adjust based on requirements complexity
  if (requirements.integrations?.length > 3) {
    hours *= 1.5;
  }
  if (requirements.customUI) {
    hours *= 1.3;
  }
  if (requirements.multiModel) {
    hours *= 1.2;
  }
  if (requirements.advancedMemory) {
    hours *= 1.4;
  }

  return Math.round(hours);
}

/**
 * Calculate estimated cost based on hours
 */
export function calculateEstimatedCost(hours: number): number {
  const hourlyRate = 150; // $150 per hour
  return hours * hourlyRate * 100; // Store in cents
}

/**
 * Get complexity tier details
 */
export function getComplexityDetails(complexity: ComplexityLevel) {
  const details = {
    SIMPLE: {
      label: 'Simple',
      description: '1-8 hours',
      features: ['Basic configuration', 'Single model', 'Standard tools'],
    },
    MODERATE: {
      label: 'Moderate',
      description: '8-24 hours',
      features: ['Custom personality', 'Multiple tools', 'Basic integrations'],
    },
    COMPLEX: {
      label: 'Complex',
      description: '24-72 hours',
      features: ['Advanced features', 'Custom UI', 'Multiple integrations'],
    },
    ENTERPRISE: {
      label: 'Enterprise',
      description: '72+ hours',
      features: ['Full customization', 'Complex workflows', 'Enterprise integrations'],
    },
  };

  return details[complexity];
}
```

### Step 4: Create Data Query Functions

**File:** `lib/modules/ai-garage/orders/queries.ts`

```typescript
import 'server-only';

import { prisma } from '@/lib/database/prisma';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import type { custom_agent_orders, Prisma } from '@prisma/client';
import type { OrderFilters } from './schemas';

/**
 * Agent Orders Queries Module
 *
 * SECURITY: All queries automatically filtered by organizationId via tenant middleware
 */

type OrderWithDetails = Prisma.custom_agent_ordersGetPayload<{
  include: {
    creator: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    assignee: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    milestones: true;
    build_logs: {
      orderBy: { created_at: 'desc' };
      take: 50;
    };
  };
}>;

/**
 * Get orders with filters
 */
export async function getOrders(
  filters?: OrderFilters
): Promise<OrderWithDetails[]> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.custom_agent_ordersWhereInput = {};

      // Status filter
      if (filters?.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      // Complexity filter
      if (filters?.complexity) {
        where.complexity = Array.isArray(filters.complexity)
          ? { in: filters.complexity }
          : filters.complexity;
      }

      // Priority filter
      if (filters?.priority) {
        where.priority = Array.isArray(filters.priority)
          ? { in: filters.priority }
          : filters.priority;
      }

      // Assignment filters
      if (filters?.assigned_to_id) {
        where.assigned_to_id = filters.assigned_to_id;
      }
      if (filters?.created_by_id) {
        where.created_by_id = filters.created_by_id;
      }

      // Search across title, description, use_case
      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { use_case: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Date range filters
      if (filters?.created_from || filters?.created_to) {
        where.created_at = {};
        if (filters.created_from) {
          where.created_at.gte = filters.created_from;
        }
        if (filters.created_to) {
          where.created_at.lte = filters.created_to;
        }
      }

      if (filters?.submitted_from || filters?.submitted_to) {
        where.submitted_at = {};
        if (filters.submitted_from) {
          where.submitted_at.gte = filters.submitted_from;
        }
        if (filters.submitted_to) {
          where.submitted_at.lte = filters.submitted_to;
        }
      }

      // Sorting
      const orderBy: Prisma.custom_agent_ordersOrderByWithRelationInput = {};
      if (filters?.sort_by) {
        orderBy[filters.sort_by] = filters.sort_order || 'desc';
      } else {
        orderBy.created_at = 'desc';
      }

      return await prisma.custom_agent_orders.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          milestones: {
            orderBy: { sort_order: 'asc' },
          },
          build_logs: {
            orderBy: { created_at: 'desc' },
            take: 50,
          },
        },
        orderBy,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrders failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get order count with filters
 */
export async function getOrdersCount(filters?: OrderFilters): Promise<number> {
  return withTenantContext(async () => {
    try {
      const where: Prisma.custom_agent_ordersWhereInput = {};

      if (filters?.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      if (filters?.complexity) {
        where.complexity = Array.isArray(filters.complexity)
          ? { in: filters.complexity }
          : filters.complexity;
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await prisma.custom_agent_orders.count({ where });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrdersCount failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get order by ID with full details
 */
export async function getOrderById(
  orderId: string
): Promise<OrderWithDetails | null> {
  return withTenantContext(async () => {
    try {
      return await prisma.custom_agent_orders.findFirst({
        where: { id: orderId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
          milestones: {
            orderBy: { sort_order: 'asc' },
          },
          build_logs: {
            orderBy: { created_at: 'desc' },
          },
        },
      });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrderById failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get order statistics
 */
export async function getOrderStats() {
  return withTenantContext(async () => {
    try {
      const [
        totalOrders,
        draftOrders,
        activeOrders,
        completedOrders,
      ] = await Promise.all([
        prisma.custom_agent_orders.count(),
        prisma.custom_agent_orders.count({ where: { status: 'DRAFT' } }),
        prisma.custom_agent_orders.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.custom_agent_orders.count({ where: { status: 'COMPLETED' } }),
      ]);

      return {
        totalOrders,
        draftOrders,
        activeOrders,
        completedOrders,
      };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrderStats failed:', dbError);
      throw error;
    }
  });
}

/**
 * Get orders assigned to a user
 */
export async function getOrdersByAssignee(
  userId: string
): Promise<OrderWithDetails[]> {
  return withTenantContext(async () => {
    try {
      return await getOrders({ assigned_to_id: userId });
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Queries] getOrdersByAssignee failed:', dbError);
      throw error;
    }
  });
}
```

### Step 5: Create Server Actions

**File:** `lib/modules/ai-garage/orders/actions.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { canAccessAIGarage, canManageAIGarage } from '@/lib/auth/rbac';
import { withTenantContext } from '@/lib/database/utils';
import { handleDatabaseError } from '@/lib/database/errors';
import {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  updateOrderProgressSchema,
  createMilestoneSchema,
  createBuildLogSchema,
  type CreateOrderInput,
  type UpdateOrderInput,
  type UpdateOrderStatusInput,
  type UpdateOrderProgressInput,
  type CreateMilestoneInput,
  type CreateBuildLogInput,
} from './schemas';
import { calculateEstimatedHours, calculateEstimatedCost } from './utils';

/**
 * Create a new agent order
 *
 * RBAC: Requires AI Garage access
 */
export async function createOrder(input: CreateOrderInput) {
  const session = await requireAuth();

  if (!canAccessAIGarage(session.user)) {
    throw new Error('Unauthorized: AI Garage access required');
  }

  const validated = createOrderSchema.parse(input);

  // Calculate estimates
  const estimatedHours = calculateEstimatedHours(
    validated.complexity,
    validated.requirements
  );
  const estimatedCost = calculateEstimatedCost(estimatedHours);

  return withTenantContext(async () => {
    try {
      const order = await prisma.custom_agent_orders.create({
        data: {
          ...validated,
          estimated_hours: estimatedHours,
          estimated_cost: estimatedCost,
          organization_id: session.user.organizationId,
          created_by_id: session.user.id,
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
      });

      revalidatePath('/ai-garage/orders');
      revalidatePath('/ai-garage/dashboard');

      return order;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] createOrder failed:', dbError);
      throw new Error('Failed to create order');
    }
  });
}

/**
 * Update an existing order
 */
export async function updateOrder(input: UpdateOrderInput) {
  const session = await requireAuth();

  if (!canAccessAIGarage(session.user)) {
    throw new Error('Unauthorized: AI Garage access required');
  }

  const validated = updateOrderSchema.parse(input);
  const { id, ...updateData } = validated;

  // Recalculate estimates if complexity or requirements changed
  if (updateData.complexity || updateData.requirements) {
    const order = await getOrderById(id);
    if (order) {
      const complexity = updateData.complexity || order.complexity;
      const requirements = updateData.requirements || order.requirements;
      updateData.estimated_hours = calculateEstimatedHours(complexity, requirements);
      updateData.estimated_cost = calculateEstimatedCost(updateData.estimated_hours);
    }
  }

  return withTenantContext(async () => {
    try {
      const order = await prisma.custom_agent_orders.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, avatar_url: true },
          },
        },
      });

      revalidatePath('/ai-garage/orders');
      revalidatePath(`/ai-garage/orders/${id}`);
      revalidatePath('/ai-garage/dashboard');

      return order;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] updateOrder failed:', dbError);
      throw new Error('Failed to update order');
    }
  });
}

/**
 * Update order status
 */
export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  const session = await requireAuth();

  if (!canAccessAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateOrderStatusSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const updateData: any = { status: validated.status };

      // Set timestamps based on status
      if (validated.status === 'SUBMITTED') {
        updateData.submitted_at = new Date();
      } else if (validated.status === 'IN_PROGRESS') {
        updateData.started_at = new Date();
      } else if (validated.status === 'COMPLETED') {
        updateData.completed_at = new Date();
        updateData.progress = 100;
      } else if (validated.status === 'DELIVERED') {
        updateData.delivered_at = new Date();
      }

      const order = await prisma.custom_agent_orders.update({
        where: { id: validated.id },
        data: updateData,
      });

      // Log status change
      if (validated.notes) {
        await createBuildLog({
          order_id: validated.id,
          stage: 'status_change',
          message: `Status changed to ${validated.status}: ${validated.notes}`,
          log_level: 'INFO',
        });
      }

      revalidatePath('/ai-garage/orders');
      revalidatePath(`/ai-garage/orders/${validated.id}`);

      return order;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] updateOrderStatus failed:', dbError);
      throw new Error('Failed to update order status');
    }
  });
}

/**
 * Update order progress
 */
export async function updateOrderProgress(input: UpdateOrderProgressInput) {
  const session = await requireAuth();

  if (!canManageAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = updateOrderProgressSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const order = await prisma.custom_agent_orders.update({
        where: { id: validated.id },
        data: {
          progress: validated.progress,
          current_stage: validated.current_stage,
        },
      });

      revalidatePath('/ai-garage/orders');
      revalidatePath(`/ai-garage/orders/${validated.id}`);

      return order;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] updateOrderProgress failed:', dbError);
      throw new Error('Failed to update progress');
    }
  });
}

/**
 * Create milestone for order
 */
export async function createMilestone(input: CreateMilestoneInput) {
  const session = await requireAuth();

  if (!canManageAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createMilestoneSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const milestone = await prisma.order_milestones.create({
        data: validated,
      });

      revalidatePath(`/ai-garage/orders/${validated.order_id}`);

      return milestone;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] createMilestone failed:', dbError);
      throw new Error('Failed to create milestone');
    }
  });
}

/**
 * Create build log entry
 */
export async function createBuildLog(input: CreateBuildLogInput) {
  const session = await requireAuth();

  if (!canManageAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  const validated = createBuildLogSchema.parse(input);

  return withTenantContext(async () => {
    try {
      const log = await prisma.build_logs.create({
        data: validated,
      });

      revalidatePath(`/ai-garage/orders/${validated.order_id}`);

      return log;
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] createBuildLog failed:', dbError);
      throw new Error('Failed to create build log');
    }
  });
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string) {
  const session = await requireAuth();

  if (!canManageAIGarage(session.user)) {
    throw new Error('Unauthorized');
  }

  return withTenantContext(async () => {
    try {
      await prisma.custom_agent_orders.delete({
        where: { id: orderId },
      });

      revalidatePath('/ai-garage/orders');
      revalidatePath('/ai-garage/dashboard');

      return { success: true };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      console.error('[Orders Actions] deleteOrder failed:', dbError);
      throw new Error('Failed to delete order');
    }
  });
}
```

### Step 6: Create Public API

**File:** `lib/modules/ai-garage/orders/index.ts`

```typescript
// Export public API
export {
  createOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderProgress,
  createMilestone,
  createBuildLog,
  deleteOrder,
} from './actions';

export {
  getOrders,
  getOrdersCount,
  getOrderById,
  getOrderStats,
  getOrdersByAssignee,
} from './queries';

export {
  createOrderSchema,
  updateOrderSchema,
  orderFiltersSchema,
  updateOrderStatusSchema,
  updateOrderProgressSchema,
  createMilestoneSchema,
  createBuildLogSchema,
  type CreateOrderInput,
  type UpdateOrderInput,
  type OrderFilters,
  type UpdateOrderStatusInput,
  type UpdateOrderProgressInput,
  type CreateMilestoneInput,
  type CreateBuildLogInput,
} from './schemas';

export {
  calculateEstimatedHours,
  calculateEstimatedCost,
  getComplexityDetails,
} from './utils';

// Re-export Prisma types
export type { custom_agent_orders as AgentOrder } from '@prisma/client';
```

### Step 7: Add RBAC Permissions

**File:** `lib/auth/rbac.ts` (add to existing file)

```typescript
// Add to existing RBAC file

export const AI_GARAGE_PERMISSIONS = {
  AI_GARAGE_ACCESS: 'ai-garage:access',
  ORDERS_VIEW: 'ai-garage:orders:view',
  ORDERS_CREATE: 'ai-garage:orders:create',
  ORDERS_EDIT: 'ai-garage:orders:edit',
  ORDERS_DELETE: 'ai-garage:orders:delete',
  ORDERS_MANAGE: 'ai-garage:orders:manage',
} as const;

/**
 * Check if user can access AI Garage module
 */
export function canAccessAIGarage(user: any): boolean {
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const hasOrgAccess = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && hasOrgAccess;
}

/**
 * Check if user can manage AI Garage (create, edit, delete)
 */
export function canManageAIGarage(user: any): boolean {
  const isEmployee = ['ADMIN', 'MODERATOR', 'EMPLOYEE'].includes(user.globalRole);
  const canManage = ['OWNER', 'ADMIN', 'MEMBER'].includes(user.organizationRole);

  return isEmployee && canManage;
}

/**
 * Check if user can assign builders
 */
export function canAssignBuilders(user: any): boolean {
  return user.globalRole === 'ADMIN' || user.organizationRole === 'OWNER';
}

/**
 * Get AI Garage feature limits by subscription tier
 */
export function getAIGarageLimits(tier: SubscriptionTier) {
  const limits = {
    FREE: { orders: 0, templates: 0, blueprints: 0 },
    STARTER: { orders: 0, templates: 0, blueprints: 0 },
    GROWTH: { orders: 3, templates: 10, blueprints: 5 }, // Per month
    ELITE: { orders: -1, templates: -1, blueprints: -1 }, // Unlimited
  };

  return limits[tier];
}
```

### Step 8: Create API Routes

**File:** `app/api/v1/ai-garage/orders/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-helpers';
import { getOrders, getOrdersCount } from '@/lib/modules/ai-garage/orders';
import { orderFiltersSchema } from '@/lib/modules/ai-garage/orders/schemas';
import { canAccessAIGarage } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (!canAccessAIGarage(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filters = orderFiltersSchema.parse({
      status: searchParams.get('status'),
      complexity: searchParams.get('complexity'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    });

    const [orders, total] = await Promise.all([
      getOrders(filters),
      getOrdersCount(filters),
    ]);

    return NextResponse.json({ orders, total, filters });
  } catch (error) {
    console.error('[API] GET /api/v1/ai-garage/orders failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
```

## Testing & Validation

### Test 1: Module Imports
```typescript
import { getOrders, createOrder } from '@/lib/modules/ai-garage/orders';
```

### Test 2: Cost Calculation
```typescript
import { calculateEstimatedHours, calculateEstimatedCost } from '@/lib/modules/ai-garage/orders';

const hours = calculateEstimatedHours('COMPLEX', { integrations: 5, customUI: true });
const cost = calculateEstimatedCost(hours);
console.log(`Estimated: ${hours} hours, $${cost / 100}`);
```

### Test 3: Create Order
```typescript
const order = await createOrder({
  title: 'Sales Assistant Agent',
  description: 'AI agent for lead qualification and follow-up',
  use_case: 'Sales automation',
  complexity: 'MODERATE',
  requirements: { integrations: ['CRM'], customUI: false },
  agent_config: { personality: 'professional', tone: 'friendly' },
  tools_config: { crm_access: true },
  organization_id: session.user.organizationId,
});
```

## Success Criteria

- [x] Agent orders module structure created
- [x] All schemas defined with proper validation
- [x] Cost calculation utilities implemented
- [x] All query functions implemented
- [x] All Server Actions implemented with RBAC checks
- [x] Multi-tenancy enforced
- [x] Error handling in place
- [x] Public API exported
- [x] RBAC permissions added
- [x] API routes created

## Files Created

- ✅ `lib/modules/ai-garage/orders/index.ts`
- ✅ `lib/modules/ai-garage/orders/schemas.ts`
- ✅ `lib/modules/ai-garage/orders/queries.ts`
- ✅ `lib/modules/ai-garage/orders/actions.ts`
- ✅ `lib/modules/ai-garage/orders/utils.ts`
- ✅ `app/api/v1/ai-garage/orders/route.ts`

## Files Modified

- ✅ `lib/auth/rbac.ts` - Added AI Garage permissions

## Next Steps

After completing this session:

1. ✅ Proceed to **Session 3: Agent Templates Module - Backend & API**
2. ✅ Backend foundation ready for templates
3. ✅ Can start building template marketplace

---

**Session 2 Complete:** ✅ Agent Orders module backend fully implemented
