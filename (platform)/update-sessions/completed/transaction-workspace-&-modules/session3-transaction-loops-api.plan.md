# Session 3: Transaction Loops - Core API & Server Actions - PLAN

**Date:** TBD
**Status:** ⏸️ Ready to Execute
**Duration:** ~3-3.5 hours
**Dependencies:** Session 1 (Database), Session 2 (Storage) completed
**Parallel Safe:** No (must complete before Session 4, 6)

---

## 🎯 Session Objectives

Build complete CRUD API for Transaction Loops with Next.js Server Actions, RBAC enforcement, multi-tenancy isolation, and comprehensive testing.

**What We're Building:**
- ✅ Transaction Loop Server Actions (create, read, update, delete)
- ✅ RBAC middleware for permission checking
- ✅ Organization isolation via RLS
- ✅ Input validation with Zod schemas
- ✅ Query optimization and pagination
- ✅ Comprehensive unit tests (80%+ coverage)

---

## 📋 Task Breakdown

### Phase 1: Zod Validation Schemas (30 minutes)

#### Step 1.1: Create Transaction Loop Schemas
- [ ] Create directory: `lib/modules/transactions/`
- [ ] Create file: `schemas.ts`
- [ ] Define input/output schemas

**Create `lib/modules/transactions/schemas.ts`:**
```typescript
import { z } from 'zod';
import {
  TransactionType,
  LoopStatus,
} from '@prisma/client';

// Create Loop Schema
export const CreateLoopSchema = z.object({
  propertyAddress: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address too long'),
  transactionType: z.nativeEnum(TransactionType),
  listingPrice: z
    .number()
    .positive('Price must be positive')
    .max(1000000000, 'Price exceeds maximum'),
  expectedClosing: z.date().optional(),
  notes: z.string().max(5000).optional(),
});

// Update Loop Schema
export const UpdateLoopSchema = z.object({
  propertyAddress: z.string().min(5).max(500).optional(),
  transactionType: z.nativeEnum(TransactionType).optional(),
  listingPrice: z.number().positive().optional(),
  status: z.nativeEnum(LoopStatus).optional(),
  expectedClosing: z.date().optional(),
  actualClosing: z.date().optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional(),
});

// Query Schema (filters)
export const QueryLoopsSchema = z.object({
  status: z.nativeEnum(LoopStatus).optional(),
  transactionType: z.nativeEnum(TransactionType).optional(),
  search: z.string().optional(), // Search in address
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'expectedClosing', 'progress']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateLoopInput = z.infer<typeof CreateLoopSchema>;
export type UpdateLoopInput = z.infer<typeof UpdateLoopSchema>;
export type QueryLoopsInput = z.infer<typeof QueryLoopsSchema>;
```

**Success Criteria:**
- [ ] All schemas created with validation
- [ ] Min/max constraints on strings
- [ ] Positive numbers for prices
- [ ] Date validation
- [ ] Pagination params

---

### Phase 2: RBAC Permission System (25 minutes)

#### Step 2.1: Define Transaction Permissions
- [ ] Create file: `lib/modules/transactions/permissions.ts`
- [ ] Define permission constants
- [ ] Create permission checker functions

**Create `lib/modules/transactions/permissions.ts`:**
```typescript
import { Users, OrganizationMember } from '@prisma/client';

export const TRANSACTION_PERMISSIONS = {
  VIEW_LOOPS: 'transactions:view_loops',
  CREATE_LOOPS: 'transactions:create_loops',
  UPDATE_LOOPS: 'transactions:update_loops',
  DELETE_LOOPS: 'transactions:delete_loops',
  MANAGE_ALL: 'transactions:manage_all', // Admin only
} as const;

export type TransactionPermission = typeof TRANSACTION_PERMISSIONS[keyof typeof TRANSACTION_PERMISSIONS];

interface UserWithRole extends Users {
  organizationMember?: OrganizationMember | null;
}

/**
 * Check if user has permission for transactions module
 */
export function hasTransactionPermission(
  user: UserWithRole,
  permission: TransactionPermission
): boolean {
  // ADMIN role has all permissions
  if (user.role === 'ADMIN') {
    return true;
  }

  // Only EMPLOYEE and ADMIN can access transactions
  if (user.role !== 'EMPLOYEE' && user.role !== 'ADMIN') {
    return false;
  }

  // Organization-level permissions
  const orgRole = user.organizationMember?.role;

  switch (permission) {
    case TRANSACTION_PERMISSIONS.VIEW_LOOPS:
      // All employees can view
      return orgRole !== undefined;

    case TRANSACTION_PERMISSIONS.CREATE_LOOPS:
      // Members and above can create
      return orgRole && ['OWNER', 'ADMIN', 'MEMBER'].includes(orgRole);

    case TRANSACTION_PERMISSIONS.UPDATE_LOOPS:
      // Members and above can update
      return orgRole && ['OWNER', 'ADMIN', 'MEMBER'].includes(orgRole);

    case TRANSACTION_PERMISSIONS.DELETE_LOOPS:
      // Only owners and admins can delete
      return orgRole && ['OWNER', 'ADMIN'].includes(orgRole);

    case TRANSACTION_PERMISSIONS.MANAGE_ALL:
      // Platform admins or org owners
      return user.role === 'ADMIN' || orgRole === 'OWNER';

    default:
      return false;
  }
}

/**
 * Check if user can modify specific loop
 * (Must be creator OR have delete permission)
 */
export function canModifyLoop(
  user: UserWithRole,
  loop: { createdBy: string }
): boolean {
  // Creator can always modify their own loops
  if (loop.createdBy === user.id) {
    return true;
  }

  // Org admins/owners can modify any loop
  return hasTransactionPermission(user, TRANSACTION_PERMISSIONS.DELETE_LOOPS);
}
```

**Success Criteria:**
- [ ] Permission constants defined
- [ ] Role-based checks implemented
- [ ] Org-level permission logic
- [ ] Creator ownership checks

---

### Phase 3: Transaction Loop Queries (40 minutes)

#### Step 3.1: Create Query Functions
- [ ] Create file: `lib/modules/transactions/queries.ts`
- [ ] Implement getLoops with filters
- [ ] Add getLoopById with includes
- [ ] Add getLoopStats

**Create `lib/modules/transactions/queries.ts`:**
```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { QueryLoopsSchema, type QueryLoopsInput } from './schemas';
import { hasTransactionPermission, TRANSACTION_PERMISSIONS } from './permissions';

/**
 * Get paginated loops for current organization
 */
export async function getLoops(input: QueryLoopsInput) {
  const session = await requireAuth();

  // Check permission
  if (!hasTransactionPermission(session.user, TRANSACTION_PERMISSIONS.VIEW_LOOPS)) {
    throw new Error('Unauthorized: No permission to view transaction loops');
  }

  // Validate input
  const validated = QueryLoopsSchema.parse(input);
  const { page, limit, status, transactionType, search, sortBy, sortOrder } = validated;

  // Build where clause
  const where = {
    organizationId: session.user.organizationId!,
    ...(status && { status }),
    ...(transactionType && { transactionType }),
    ...(search && {
      propertyAddress: {
        contains: search,
        mode: 'insensitive' as const,
      },
    }),
  };

  // Execute queries in parallel
  const [loops, total] = await Promise.all([
    prisma.transactionLoop.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            documents: true,
            parties: true,
            tasks: true,
            signatures: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transactionLoop.count({ where }),
  ]);

  return {
    loops,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single loop by ID with full details
 */
export async function getLoopById(loopId: string) {
  const session = await requireAuth();

  if (!hasTransactionPermission(session.user, TRANSACTION_PERMISSIONS.VIEW_LOOPS)) {
    throw new Error('Unauthorized');
  }

  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: loopId,
      organizationId: session.user.organizationId!,
    },
    include: {
      creator: {
        select: { id: true, email: true, name: true },
      },
      documents: {
        include: {
          uploader: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      parties: {
        orderBy: { invitedAt: 'desc' },
      },
      tasks: {
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      signatures: {
        include: {
          signatures: {
            include: {
              signer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      workflows: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!loop) {
    throw new Error('Loop not found');
  }

  return loop;
}

/**
 * Get loop statistics for dashboard
 */
export async function getLoopStats() {
  const session = await requireAuth();

  if (!hasTransactionPermission(session.user, TRANSACTION_PERMISSIONS.VIEW_LOOPS)) {
    throw new Error('Unauthorized');
  }

  const organizationId = session.user.organizationId!;

  const [totalLoops, activeLoops, closingThisMonth, totalValue] = await Promise.all([
    prisma.transactionLoop.count({
      where: { organizationId },
    }),
    prisma.transactionLoop.count({
      where: {
        organizationId,
        status: { in: ['ACTIVE', 'UNDER_CONTRACT', 'CLOSING'] },
      },
    }),
    prisma.transactionLoop.count({
      where: {
        organizationId,
        status: 'CLOSING',
        expectedClosing: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    }),
    prisma.transactionLoop.aggregate({
      where: {
        organizationId,
        status: { notIn: ['CANCELLED', 'ARCHIVED'] },
      },
      _sum: {
        listingPrice: true,
      },
    }),
  ]);

  return {
    totalLoops,
    activeLoops,
    closingThisMonth,
    totalValue: totalValue._sum.listingPrice?.toNumber() || 0,
  };
}
```

**Success Criteria:**
- [ ] Pagination implemented
- [ ] Filtering by status, type, search
- [ ] Includes related data optimally
- [ ] Stats aggregation works
- [ ] Organization isolation enforced

---

### Phase 4: Transaction Loop Actions (45 minutes)

#### Step 4.1: Create Mutation Functions
- [ ] Create file: `lib/modules/transactions/actions.ts`
- [ ] Implement createLoop
- [ ] Implement updateLoop
- [ ] Implement deleteLoop

**Create `lib/modules/transactions/actions.ts`:**
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { CreateLoopSchema, UpdateLoopSchema } from './schemas';
import { hasTransactionPermission, canModifyLoop, TRANSACTION_PERMISSIONS } from './permissions';
import type { CreateLoopInput, UpdateLoopInput } from './schemas';

/**
 * Create new transaction loop
 */
export async function createLoop(input: CreateLoopInput) {
  const session = await requireAuth();

  // Check permission
  if (!hasTransactionPermission(session.user, TRANSACTION_PERMISSIONS.CREATE_LOOPS)) {
    throw new Error('Unauthorized: No permission to create loops');
  }

  // Validate input
  const validated = CreateLoopSchema.parse(input);

  // Create loop
  const loop = await prisma.transactionLoop.create({
    data: {
      ...validated,
      organizationId: session.user.organizationId!,
      createdBy: session.user.id,
      status: 'DRAFT',
      progress: 0,
    },
    include: {
      creator: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  // Create audit log
  await prisma.transactionAuditLog.create({
    data: {
      action: 'created',
      entityType: 'loop',
      entityId: loop.id,
      newValues: loop,
      userId: session.user.id,
      organizationId: session.user.organizationId!,
    },
  });

  // Revalidate
  revalidatePath('/transactions');

  return { success: true, loop };
}

/**
 * Update existing transaction loop
 */
export async function updateLoop(loopId: string, input: UpdateLoopInput) {
  const session = await requireAuth();

  // Validate input
  const validated = UpdateLoopSchema.parse(input);

  // Fetch existing loop
  const existingLoop = await prisma.transactionLoop.findFirst({
    where: {
      id: loopId,
      organizationId: session.user.organizationId!,
    },
  });

  if (!existingLoop) {
    throw new Error('Loop not found');
  }

  // Check permission
  if (!canModifyLoop(session.user, existingLoop)) {
    throw new Error('Unauthorized: Cannot modify this loop');
  }

  // Update loop
  const updatedLoop = await prisma.transactionLoop.update({
    where: { id: loopId },
    data: validated,
    include: {
      creator: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  // Create audit log
  await prisma.transactionAuditLog.create({
    data: {
      action: 'updated',
      entityType: 'loop',
      entityId: loopId,
      oldValues: existingLoop,
      newValues: updatedLoop,
      userId: session.user.id,
      organizationId: session.user.organizationId!,
    },
  });

  // Revalidate
  revalidatePath('/transactions');
  revalidatePath(`/transactions/${loopId}`);

  return { success: true, loop: updatedLoop };
}

/**
 * Delete transaction loop (and all related data via cascade)
 */
export async function deleteLoop(loopId: string) {
  const session = await requireAuth();

  // Fetch loop
  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: loopId,
      organizationId: session.user.organizationId!,
    },
  });

  if (!loop) {
    throw new Error('Loop not found');
  }

  // Check permission (delete requires higher privilege)
  if (!hasTransactionPermission(session.user, TRANSACTION_PERMISSIONS.DELETE_LOOPS)) {
    throw new Error('Unauthorized: No permission to delete loops');
  }

  // Delete loop (cascade will delete related records)
  await prisma.transactionLoop.delete({
    where: { id: loopId },
  });

  // Create audit log
  await prisma.transactionAuditLog.create({
    data: {
      action: 'deleted',
      entityType: 'loop',
      entityId: loopId,
      oldValues: loop,
      userId: session.user.id,
      organizationId: session.user.organizationId!,
    },
  });

  // Revalidate
  revalidatePath('/transactions');

  return { success: true };
}

/**
 * Update loop progress (0-100)
 */
export async function updateLoopProgress(loopId: string, progress: number) {
  const session = await requireAuth();

  if (progress < 0 || progress > 100) {
    throw new Error('Progress must be between 0 and 100');
  }

  const loop = await prisma.transactionLoop.findFirst({
    where: {
      id: loopId,
      organizationId: session.user.organizationId!,
    },
  });

  if (!loop) {
    throw new Error('Loop not found');
  }

  if (!canModifyLoop(session.user, loop)) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.transactionLoop.update({
    where: { id: loopId },
    data: { progress },
  });

  revalidatePath(`/transactions/${loopId}`);

  return { success: true, progress: updated.progress };
}
```

**Success Criteria:**
- [ ] Create with audit logging
- [ ] Update with permission checks
- [ ] Delete with cascade
- [ ] Progress update
- [ ] Cache revalidation

---

### Phase 5: Module Public API (20 minutes)

#### Step 5.1: Export Module Interface
- [ ] Create file: `lib/modules/transactions/index.ts`
- [ ] Export all public functions
- [ ] Export types

**Create `lib/modules/transactions/index.ts`:**
```typescript
// Queries
export {
  getLoops,
  getLoopById,
  getLoopStats,
} from './queries';

// Actions
export {
  createLoop,
  updateLoop,
  deleteLoop,
  updateLoopProgress,
} from './actions';

// Schemas & Types
export {
  CreateLoopSchema,
  UpdateLoopSchema,
  QueryLoopsSchema,
  type CreateLoopInput,
  type UpdateLoopInput,
  type QueryLoopsInput,
} from './schemas';

// Permissions
export {
  TRANSACTION_PERMISSIONS,
  hasTransactionPermission,
  canModifyLoop,
  type TransactionPermission,
} from './permissions';
```

**Success Criteria:**
- [ ] Clean public API
- [ ] No internal exports
- [ ] Type exports included

---

### Phase 6: Comprehensive Testing (45 minutes)

#### Step 6.1: Create Unit Tests
- [ ] Create directory: `__tests__/modules/transactions/`
- [ ] Test queries
- [ ] Test actions
- [ ] Test permissions

**Create `__tests__/modules/transactions/actions.test.ts`:**
```typescript
import { createLoop, updateLoop, deleteLoop } from '@/lib/modules/transactions';
import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/auth/middleware');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    transactionLoop: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transactionAuditLog: {
      create: jest.fn(),
    },
  },
}));

describe('Transaction Loop Actions', () => {
  const mockUser = {
    id: 'user-1',
    organizationId: 'org-1',
    role: 'EMPLOYEE' as const,
    organizationMember: {
      role: 'ADMIN' as const,
    },
  };

  beforeEach(() => {
    (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });
    jest.clearAllMocks();
  });

  describe('createLoop', () => {
    it('should create loop with valid input', async () => {
      const input = {
        propertyAddress: '123 Test St, City, ST 12345',
        transactionType: 'PURCHASE_AGREEMENT' as const,
        listingPrice: 450000,
      };

      const createdLoop = {
        id: 'loop-1',
        ...input,
        organizationId: 'org-1',
        createdBy: 'user-1',
        status: 'DRAFT',
        progress: 0,
      };

      (prisma.transactionLoop.create as jest.Mock).mockResolvedValue(createdLoop);

      const result = await createLoop(input);

      expect(result.success).toBe(true);
      expect(result.loop).toMatchObject(createdLoop);
      expect(prisma.transactionAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'created',
            entityType: 'loop',
          }),
        })
      );
    });

    it('should reject invalid input', async () => {
      const invalidInput = {
        propertyAddress: 'Too short',
        transactionType: 'INVALID_TYPE' as any,
        listingPrice: -100,
      };

      await expect(createLoop(invalidInput)).rejects.toThrow();
    });

    it('should enforce permission', async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, organizationMember: { role: 'VIEWER' } },
      });

      await expect(
        createLoop({
          propertyAddress: '123 Test St',
          transactionType: 'PURCHASE_AGREEMENT' as const,
          listingPrice: 450000,
        })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateLoop', () => {
    it('should update loop when user is creator', async () => {
      const existingLoop = {
        id: 'loop-1',
        createdBy: 'user-1',
        organizationId: 'org-1',
      };

      (prisma.transactionLoop.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (prisma.transactionLoop.update as jest.Mock).mockResolvedValue({
        ...existingLoop,
        progress: 50,
      });

      const result = await updateLoop('loop-1', { progress: 50 });

      expect(result.success).toBe(true);
      expect(result.loop.progress).toBe(50);
    });

    it('should reject update from non-creator without admin role', async () => {
      const existingLoop = {
        id: 'loop-1',
        createdBy: 'user-2',
        organizationId: 'org-1',
      };

      (prisma.transactionLoop.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, organizationMember: { role: 'MEMBER' } },
      });

      await expect(updateLoop('loop-1', { progress: 50 })).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteLoop', () => {
    it('should delete loop with admin permission', async () => {
      const existingLoop = {
        id: 'loop-1',
        organizationId: 'org-1',
      };

      (prisma.transactionLoop.findFirst as jest.Mock).mockResolvedValue(existingLoop);
      (prisma.transactionLoop.delete as jest.Mock).mockResolvedValue(existingLoop);

      const result = await deleteLoop('loop-1');

      expect(result.success).toBe(true);
      expect(prisma.transactionLoop.delete).toHaveBeenCalledWith({
        where: { id: 'loop-1' },
      });
    });

    it('should reject delete without permission', async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, organizationMember: { role: 'MEMBER' } },
      });

      await expect(deleteLoop('loop-1')).rejects.toThrow('Unauthorized');
    });
  });
});
```

**Run Tests:**
```bash
npm test modules/transactions
npm test -- --coverage
```

**Success Criteria:**
- [ ] All tests pass
- [ ] Coverage > 80%
- [ ] Permission checks tested
- [ ] Error cases covered

---

## 📊 Files to Create

### Module Structure
```
lib/modules/transactions/
├── schemas.ts           # ✅ Zod validation schemas
├── permissions.ts       # ✅ RBAC permission logic
├── queries.ts          # ✅ Data fetching (Server Actions)
├── actions.ts          # ✅ Mutations (Server Actions)
└── index.ts            # ✅ Public API exports

__tests__/modules/transactions/
├── actions.test.ts     # ✅ Action unit tests
├── queries.test.ts     # ✅ Query unit tests
└── permissions.test.ts # ✅ Permission logic tests
```

**Total:** 8 files

---

## 🎯 Success Criteria

**MANDATORY:**
- [ ] All Server Actions created
- [ ] Zod validation on all inputs
- [ ] RBAC permission checks enforced
- [ ] Organization isolation via RLS
- [ ] Audit logging on all mutations
- [ ] Cache revalidation with revalidatePath
- [ ] Tests pass with 80%+ coverage
- [ ] No cross-module imports
- [ ] TypeScript strict mode passes

---

## 🚀 Quick Start Commands

```bash
# Create module
mkdir -p lib/modules/transactions
mkdir -p __tests__/modules/transactions

# (Create all files from templates above)

# Run tests
npm test modules/transactions

# Type check
npx tsc --noEmit

# Coverage
npm test -- --coverage --testPathPattern=transactions
```

---

## ⚠️ Critical Warnings

**DO NOT:**
- ❌ Skip permission checks - security vulnerability
- ❌ Skip organizationId filter - data leak
- ❌ Expose internal functions in index.ts
- ❌ Skip audit logging - compliance issue

**MUST:**
- ✅ Validate all inputs with Zod
- ✅ Check permissions before mutations
- ✅ Filter by organizationId on ALL queries
- ✅ Revalidate cache after mutations
- ✅ Log all changes to audit table

---

**Last Updated:** 2025-10-04
**Status:** ⏸️ Ready to Execute
**Priority:** 🔴 CRITICAL - Core business logic!
