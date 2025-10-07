'use server';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import { getUserOrganizationId } from '@/lib/auth/user-helpers';
import { QuerySignatureRequestsSchema } from './schemas';
import type { QuerySignatureRequestsInput } from './schemas';
import type { SignatureStatus } from '@prisma/client';
import { calculatePagination, createPaginatedResult, type PaginationParams } from '../types/pagination';

/**
 * Get a single signature request by ID
 *
 * Includes:
 * - Request details
 * - All signatures with signer and document info
 * - Loop context
 *
 * @param requestId - Signature request ID
 * @returns Signature request with all signatures
 * @throws Error if not authenticated or request not found
 *
 * @example
 * ```typescript
 * const request = await getSignatureRequest('req-123');
 * console.log(request.signatures.length); // Number of signatures
 * ```
 */
export async function getSignatureRequest(requestId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Fetch request with org isolation
  const request = await prisma.signature_requests.findFirst({
    where: {
      id: requestId,
      loop: {
        organization_id: organizationId,
      },
    },
    include: {
      loop: {
        select: {
          id: true,
          property_address: true,
          transaction_type: true,
          status: true,
        },
      },
      requester: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar_url: true,
        },
      },
      signatures: {
        include: {
          signer: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          document: {
            select: {
              id: true,
              original_name: true,
              filename: true,
              mime_type: true,
              file_size: true,
            },
          },
        },
        orderBy: {
          document: {
            original_name: 'asc',
          },
        },
      },
    },
  });

  if (!request) {
    throw new Error('Signature request not found or access denied');
  }

  return request;
}

/**
 * Get all signature requests for a transaction loop
 *
 * Returns paginated list of signature requests with basic signature counts.
 *
 * @param loopId - Transaction loop ID
 * @param paginationParams - Pagination parameters (page, limit)
 * @param status - Optional status filter
 * @returns Paginated signature requests
 * @throws Error if not authenticated
 *
 * @example
 * ```typescript
 * const result = await getSignatureRequestsByLoop(
 *   'loop-123',
 *   { page: 1, limit: 20 },
 *   'PENDING'
 * );
 * console.log(`Showing ${result.data.length} of ${result.pagination.total} requests`);
 * ```
 */
export async function getSignatureRequestsByLoop(
  loopId: string,
  paginationParams: PaginationParams = {},
  status?: SignatureStatus
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const { page, limit, skip } = calculatePagination(paginationParams);
  const organizationId = getUserOrganizationId(user);

  // Build where clause
  const where: {
    loop: { organization_id: string };
    loop_id: string;
    status?: SignatureStatus;
  } = {
    loop: {
      organization_id: organizationId,
    },
    loop_id: loopId,
  };

  if (status) {
    where.status = status;
  }

  // Execute query
  const [requests, total] = await Promise.all([
    prisma.signature_requests.findMany({
      where,
      include: {
        loop: {
          select: {
            id: true,
            property_address: true,
            transaction_type: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            signatures: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.signature_requests.count({ where }),
  ]);

  // Calculate signature stats for each request
  const requestsWithStats = await Promise.all(
    requests.map(async (request) => {
      const signatureStats = await prisma.document_signatures.groupBy({
        by: ['status'],
        where: {
          request_id: request.id,
        },
        _count: true,
      });

      const stats: Record<string, number> = {};
      signatureStats.forEach((stat) => {
        stats[stat.status] = stat._count;
      });

      return {
        ...request,
        signatureStats: stats,
      };
    })
  );

  return createPaginatedResult(requestsWithStats, total, page, limit);
}

/**
 * Get pending signatures for the current user
 *
 * Returns signatures that are awaiting action from parties where
 * the user has access (via organization).
 *
 * Useful for showing "signatures awaiting your action" dashboard widgets.
 *
 * @returns List of pending signatures
 * @throws Error if not authenticated
 *
 * @example
 * ```typescript
 * const pending = await getPendingSignatures();
 * console.log(`${pending.length} signatures awaiting action`);
 * ```
 */
export async function getPendingSignatures() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Get all pending/sent signatures for loops in user's organization
  const signatures = await prisma.document_signatures.findMany({
    where: {
      status: {
        in: ['PENDING', 'SENT', 'VIEWED'],
      },
      request: {
        loop: {
          organization_id: organizationId,
        },
        status: {
          in: ['PENDING', 'SENT'],
        },
      },
    },
    include: {
      signer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      document: {
        select: {
          id: true,
          original_name: true,
          filename: true,
        },
      },
      request: {
        select: {
          id: true,
          title: true,
          message: true,
          expires_at: true,
          loop_id: true,
        },
      },
    },
    orderBy: {
      request: {
        created_at: 'desc',
      },
    },
    take: 50, // Limit to most recent 50
  });

  return signatures;
}

/**
 * Get signature by ID (for signing page)
 *
 * Public query - doesn't require authentication (relies on signature ID being secret/unguessable).
 * Used on public signing page where external parties sign documents.
 *
 * @param signatureId - Signature ID
 * @returns Signature details for signing
 * @throws Error if not found
 *
 * @example
 * ```typescript
 * const signature = await getSignatureById('sig-123');
 * // Display on signing page
 * ```
 */
export async function getSignatureById(signatureId: string) {
  const signature = await prisma.document_signatures.findUnique({
    where: {
      id: signatureId,
    },
    include: {
      signer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      document: {
        select: {
          id: true,
          original_name: true,
          filename: true,
          mime_type: true,
          file_size: true,
          storage_key: true,
        },
      },
      request: {
        select: {
          id: true,
          title: true,
          message: true,
          status: true,
          expires_at: true,
          signing_order: true,
          loop: {
            select: {
              id: true,
              property_address: true,
              transaction_type: true,
            },
          },
        },
      },
    },
  });

  if (!signature) {
    throw new Error('Signature not found');
  }

  return signature;
}

/**
 * Get signature statistics for a loop
 *
 * Returns aggregated stats about signatures for a transaction loop.
 *
 * @param loopId - Transaction loop ID
 * @returns Signature statistics
 * @throws Error if not authenticated or loop not found
 *
 * @example
 * ```typescript
 * const stats = await getSignatureStats('loop-123');
 * console.log(`${stats.completed}/${stats.total} requests completed`);
 * ```
 */
export async function getSignatureStats(loopId: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const organizationId = getUserOrganizationId(user);

  // Verify loop ownership
  const loop = await prisma.transaction_loops.findFirst({
    where: {
      id: loopId,
      organization_id: organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!loop) {
    throw new Error('Loop not found or access denied');
  }

  // Get request stats
  const requestStats = await prisma.signature_requests.groupBy({
    by: ['status'],
    where: {
      loop_id: loopId,
    },
    _count: true,
  });

  const stats: Record<SignatureStatus, number> = {
    PENDING: 0,
    SENT: 0,
    VIEWED: 0,
    SIGNED: 0,
    DECLINED: 0,
    EXPIRED: 0,
  };

  requestStats.forEach((stat) => {
    stats[stat.status as SignatureStatus] = stat._count;
  });

  // Total requests
  const totalRequests = requestStats.reduce((sum, stat) => sum + stat._count, 0);

  // Total individual signatures
  const totalSignatures = await prisma.document_signatures.count({
    where: {
      request: {
        loop_id: loopId,
      },
    },
  });

  const signedSignatures = await prisma.document_signatures.count({
    where: {
      request: {
        loop_id: loopId,
      },
      status: 'SIGNED',
    },
  });

  return {
    requests: {
      total: totalRequests,
      ...stats,
    },
    signatures: {
      total: totalSignatures,
      signed: signedSignatures,
      pending: totalSignatures - signedSignatures,
    },
  };
}
