'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { QueryLoopsSchema, type QueryLoopsInput } from './schemas';
import { hasTransactionPermission, TRANSACTION_PERMISSIONS } from './permissions';

/**
 * Get paginated transaction loops for current organization
 *
 * @param input - Query parameters (filters, pagination, sorting)
 * @returns Paginated loops with metadata
 * @throws Error if user not authenticated or lacks permission
 */
export async function getLoops(input: QueryLoopsInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  // Check permission
  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.VIEW_LOOPS)) {
    throw new Error('Unauthorized: No permission to view transaction loops');
  }

  // Validate input
  const validated = QueryLoopsSchema.parse(input);
  const { page, limit, status, transactionType, search, sortBy, sortOrder } = validated;

  const organizationId = getUserOrganizationId(user);

  // Build where clause
  const where = {
    organization_id: organizationId,
    ...(status && { status }),
    ...(transactionType && { transaction_type: transactionType }),
    ...(search && {
      property_address: {
        contains: search,
        mode: 'insensitive' as const,
      },
    }),
  };

  // Execute queries in parallel
  const [loops, total] = await Promise.all([
    prisma.transaction_loops.findMany({
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
            transaction_tasks: true,
            signatures: true,
          },
        },
      },
      orderBy: {
        [sortBy === 'createdAt' ? 'created_at' :
          sortBy === 'expectedClosing' ? 'expected_closing' :
          'progress']: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction_loops.count({ where }),
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
 * Get single transaction loop by ID with full details
 *
 * @param loopId - Loop ID
 * @returns Loop with all related data
 * @throws Error if loop not found or user lacks permission
 */
export async function getLoopById(loopId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.VIEW_LOOPS)) {
    throw new Error('Unauthorized: No permission to view transaction loops');
  }

  const organizationId = getUserOrganizationId(user);

  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
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
        orderBy: { created_at: 'desc' },
      },
      parties: {
        orderBy: { invited_at: 'desc' },
      },
      transaction_tasks: {
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { created_at: 'desc' },
      },
      signatures: {
        include: {
          signatures: {
            include: {
              signer: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      },
      workflows: {
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!loop) {
    throw new Error('Loop not found');
  }

  return loop;
}

/**
 * Get transaction loop statistics for dashboard
 *
 * @returns Dashboard statistics
 * @throws Error if user not authenticated or lacks permission
 */
export async function getLoopStats() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  if (!hasTransactionPermission(user, TRANSACTION_PERMISSIONS.VIEW_LOOPS)) {
    throw new Error('Unauthorized: No permission to view transaction loops');
  }

  const organizationId = getUserOrganizationId(user);

  const [totalLoops, activeLoops, closingThisMonth, totalValue] = await Promise.all([
    prisma.transaction_loops.count({
      where: { organization_id: organizationId },
    }),
    prisma.transaction_loops.count({
      where: {
        organization_id: organizationId,
        status: { in: ['ACTIVE', 'UNDER_CONTRACT', 'CLOSING'] },
      },
    }),
    prisma.transaction_loops.count({
      where: {
        organization_id: organizationId,
        status: 'CLOSING',
        expected_closing: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    }),
    prisma.transaction_loops.aggregate({
      where: {
        organization_id: organizationId,
        status: { notIn: ['CANCELLED', 'ARCHIVED'] },
      },
      _sum: {
        listing_price: true,
      },
    }),
  ]);

  return {
    totalLoops,
    activeLoops,
    closingThisMonth,
    totalValue: Number(totalValue._sum.listing_price) || 0,
  };
}
